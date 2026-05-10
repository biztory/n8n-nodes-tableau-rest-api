import type {
	IAuthenticate,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

function parseTableauSignInError(status: number, body: string): string {
	try {
		const data = JSON.parse(body) as { error?: { code?: string; summary?: string; detail?: string } };
		const err = data.error;
		if (!err) return `HTTP ${status}`;
		const code = err.code ?? '';
		const summary = err.summary ?? 'Unknown error';
		const detail = err.detail ? ` — ${err.detail}` : '';
		if (code === '401001' || code === '401002') {
			return (
				`Tableau error ${code}: PAT sign-in was rejected. Verify that the Personal Access ` +
				`Token Name and Secret are correct, that the token has not expired or been revoked, ` +
				`and that the Site Content URL matches the site where the token was created.`
			);
		}
		return `Tableau error ${code}: ${summary}${detail}`;
	} catch {
		return `HTTP ${status}`;
	}
}

export class TableauRestApiPatApi implements ICredentialType {
	name = 'tableauRestApiPatApi';

	displayName = 'Tableau Personal Access Token API';

	icon: Icon = 'file:../icons/tableau.svg';

	documentationUrl =
		'https://help.tableau.com/current/online/en-us/security_personal_access_tokens.htm';

	authenticate: IAuthenticate = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> => {
		const baseUrl = (credentials.serverUrl as string).replace(/\/+$/, '');
		const signinPath = `/api/${credentials.apiVersion as string}/auth/signin`;
		const signinBody = {
			credentials: {
				personalAccessTokenName: credentials.patName,
				personalAccessTokenSecret: credentials.patSecret,
				site: { contentUrl: credentials.siteContentUrl },
			},
		};

		// Credential test: the test request IS the sign-in call. We populate the
		// body here so n8n sends it directly to Tableau. Tableau's response — success
		// (200) or a structured error (401 with code/summary/detail) — is shown as-is
		// in the credential test UI, giving users actionable feedback.
		if (typeof requestOptions.url === 'string' && requestOptions.url.includes('/auth/signin')) {
			return {
				...requestOptions,
				method: 'POST',
				headers: {
					...(requestOptions.headers as Record<string, string>),
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(signinBody),
			};
		}

		// Normal request: sign in via fetch to get a session token, then inject it.
		const signInResponse = await fetch(`${baseUrl}${signinPath}`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(signinBody),
		});

		if (!signInResponse.ok) {
			const text = await signInResponse.text();
			throw new Error(`Tableau PAT authentication failed: ${parseTableauSignInError(signInResponse.status, text)}`);
		}

		const data = (await signInResponse.json()) as { credentials?: { token?: string } };
		const token = data.credentials?.token;
		if (!token) {
			throw new Error('Tableau PAT authentication: no token returned from sign-in endpoint');
		}

		return {
			...requestOptions,
			headers: {
				...requestOptions.headers,
				'X-Tableau-Auth': token,
			},
		};
	};

	// The test POSTs directly to /auth/signin with the PAT body (populated by
	// authenticate above). Tableau's structured error response is surfaced to the
	// user when credentials are wrong, giving specific error codes and detail.
	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{$credentials.serverUrl.replace(/\\/+$/, "") + "/api/" + $credentials.apiVersion + "/auth/signin"}}',
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://10ax.online.tableau.com',
			description:
				'The URL of your Tableau Server or Tableau Cloud site (e.g. https://10ax.online.tableau.com)',
		},
		{
			displayName: 'Site Content URL',
			name: 'siteContentUrl',
			type: 'string',
			default: '',
			placeholder: 'my-site',
			description:
				'The content URL of the site (the value after /site/ in the URL). Leave empty for the default site.',
		},
		{
			displayName: 'Personal Access Token Name',
			name: 'patName',
			type: 'string',
			default: '',
			required: true,
			description: 'The name of the Personal Access Token as it appears in your Tableau account settings',
		},
		{
			displayName: 'Personal Access Token Secret',
			name: 'patSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The secret value shown once when the Personal Access Token was created',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: '3.24',
			description: 'The Tableau REST API version to use',
		},
	];
}
