import { createHmac, randomUUID } from 'crypto';
import type {
	IAuthenticate,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

function base64url(data: string): string {
	return Buffer.from(data).toString('base64url');
}

function signJwt(credentials: {
	clientId: string;
	secretId: string;
	secretValue: string;
	username: string;
	scopes: string;
}): string {
	const scopeList = credentials.scopes
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	const header = base64url(
		JSON.stringify({ alg: 'HS256', kid: credentials.secretId, iss: credentials.clientId }),
	);
	const now = Math.floor(Date.now() / 1000);
	const payload = base64url(
		JSON.stringify({
			iss: credentials.clientId,
			sub: credentials.username,
			aud: 'tableau',
			iat: now,
			exp: now + 300,
			jti: randomUUID(),
			scp: scopeList,
		}),
	);
	const signature = createHmac('sha256', credentials.secretValue)
		.update(`${header}.${payload}`)
		.digest('base64url');

	return `${header}.${payload}.${signature}`;
}

function parseTableauSignInError(status: number, body: string): string {
	try {
		const data = JSON.parse(body) as { error?: { code?: string; summary?: string; detail?: string } };
		const err = data.error;
		if (!err) return `HTTP ${status}`;
		const code = err.code ?? '';
		const summary = err.summary ?? 'Unknown error';
		const detail = err.detail ? ` — ${err.detail}` : '';
		if (code === '401002') {
			return (
				`Tableau error ${code}: Credentials were rejected. Verify that your Connected App ` +
				`Client ID, Secret ID, and Secret Value are correct, and that the Connected App is ` +
				`enabled on the site. If running inside Docker, also check that the container clock ` +
				`is synchronised — clock drift causes JWT validation to fail against Tableau Cloud.`
			);
		}
		return `Tableau error ${code}: ${summary}${detail}`;
	} catch {
		return `HTTP ${status}`;
	}
}

export class TableauRestApiApi implements ICredentialType {
	name = 'tableauRestApiApi';

	displayName = 'Tableau Connected App API';

	icon: Icon = 'file:../icons/tableau.svg';

	documentationUrl =
		'https://help.tableau.com/current/online/en-us/connected_apps_direct.htm';

	authenticate: IAuthenticate = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> => {
		const baseUrl = (credentials.serverUrl as string).replace(/\/+$/, '');
		const signinPath = `/api/${credentials.apiVersion as string}/auth/signin`;
		const jwt = signJwt(credentials as {
			clientId: string;
			secretId: string;
			secretValue: string;
			username: string;
			scopes: string;
		});
		const signinBody = {
			credentials: { jwt, site: { contentUrl: credentials.siteContentUrl } },
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
			throw new Error(`Tableau Connected App authentication failed: ${parseTableauSignInError(signInResponse.status, text)}`);
		}

		const data = (await signInResponse.json()) as { credentials?: { token?: string } };
		const token = data.credentials?.token;
		if (!token) {
			throw new Error('Tableau authentication: no token returned from sign-in endpoint');
		}

		return {
			...requestOptions,
			headers: {
				...requestOptions.headers,
				'X-Tableau-Auth': token,
			},
		};
	};

	// The test POSTs directly to /auth/signin with the JWT body (populated by
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
			displayName: 'Connected App Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Client ID of the Tableau Connected App',
		},
		{
			displayName: 'Connected App Secret ID',
			name: 'secretId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Secret ID (key identifier) generated for the Connected App',
		},
		{
			displayName: 'Connected App Secret Value',
			name: 'secretValue',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The Secret Value used to sign the JWT',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'user@example.com',
			description:
				'Default Tableau username (email) to authenticate as. Can be overridden per node ' +
				'using the <strong>Impersonate User</strong> field to act as a different user.',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: '3.24',
			description: 'The Tableau REST API version to use',
		},
		{
			displayName: 'Scopes',
			name: 'scopes',
			type: 'string',
			default: 'tableau:content:read',
			description:
				'Comma-separated list of scopes for the JWT (e.g. tableau:content:read)',
		},
	];
}
