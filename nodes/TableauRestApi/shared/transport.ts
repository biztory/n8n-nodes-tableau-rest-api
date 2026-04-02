import { createHmac, randomUUID } from 'crypto';
import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import type { TableauAuthToken, TableauCredentials } from './types';

const TABLEAU_AUTH_CACHE_KEY = 'tableauRestApiAuth';

/** How many minutes before actual expiry we consider the token stale */
const TOKEN_EXPIRY_BUFFER_MINUTES = 10;

/** Tableau default token lifetime in minutes */
const TOKEN_LIFETIME_MINUTES = 240;

function base64url(data: string): string {
	return Buffer.from(data).toString('base64url');
}

export function signJwt(credentials: TableauCredentials): string {
	const { clientId, secretId, secretValue, username, scopes } = credentials;

	const scopeList = scopes
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	const header = base64url(
		JSON.stringify({ alg: 'HS256', kid: secretId, iss: clientId }),
	);

	const payload = base64url(
		JSON.stringify({
			iss: clientId,
			sub: username,
			aud: 'tableau',
			exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes max
			jti: randomUUID(),
			scp: scopeList,
		}),
	);

	const signature = createHmac('sha256', secretValue)
		.update(`${header}.${payload}`)
		.digest('base64url');

	return `${header}.${payload}.${signature}`;
}

async function authenticate(
	context: IExecuteFunctions,
	credentials: TableauCredentials,
): Promise<TableauAuthToken> {
	const { serverUrl, siteContentUrl, apiVersion } = credentials;
	const jwt = signJwt(credentials);

	const baseUrl = serverUrl.replace(/\/+$/, '');
	const signInUrl = `${baseUrl}/api/${apiVersion}/auth/signin`;

	const response = (await context.helpers.httpRequest({
		method: 'POST',
		url: signInUrl,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: {
			credentials: {
				jwt: jwt,
				site: {
					contentUrl: siteContentUrl,
				},
			},
		},
		json: true,
	})) as {
		credentials: {
			token: string;
			site: { id: string; contentUrl: string };
			user: { id: string };
		};
	};

	return {
		token: response.credentials.token,
		siteId: response.credentials.site.id,
		expiresAt:
			Date.now() +
			(TOKEN_LIFETIME_MINUTES - TOKEN_EXPIRY_BUFFER_MINUTES) * 60 * 1000,
	};
}

/**
 * Get a cached auth token or sign in to obtain a new one.
 * The token is shared across all Tableau REST API nodes in the same workflow
 * execution via workflow static data.
 */
export async function getAuthToken(
	context: IExecuteFunctions,
	credentials: TableauCredentials,
): Promise<TableauAuthToken> {
	const staticData = context.getWorkflowStaticData('global');

	const cached = staticData[TABLEAU_AUTH_CACHE_KEY] as
		| TableauAuthToken
		| undefined;
	if (cached && cached.expiresAt > Date.now()) {
		return cached;
	}

	const authToken = await authenticate(context, credentials);
	staticData[TABLEAU_AUTH_CACHE_KEY] = authToken;
	return authToken;
}

/**
 * Invalidate the cached auth token so the next call will re-authenticate.
 */
function invalidateAuthToken(context: IExecuteFunctions): void {
	const staticData = context.getWorkflowStaticData('global');
	delete staticData[TABLEAU_AUTH_CACHE_KEY];
}

interface TableauErrorBody {
	code: string;
	summary: string;
	detail: string;
}

/**
 * User-facing guidance for known Tableau API error codes.
 * Add entries here whenever a recurring error warrants a specific explanation
 * beyond what the API's generic summary/detail already provides.
 */
const TABLEAU_ERROR_GUIDANCE: Record<string, string> = {
	'401002':
		'Credentials were rejected by Tableau. Verify that your Connected App ' +
		'Client ID, Secret ID, and Secret Value are correct, and that the ' +
		'Connected App is enabled on the site.',
};

/**
 * Try to extract a structured Tableau error body from an HTTP error.
 * Tableau error responses look like: { "error": { "code": "...", "summary": "...", "detail": "..." } }
 * Returns undefined if the error is not a recognisable Tableau API error.
 */
function parseTableauError(error: unknown): TableauErrorBody | undefined {
	try {
		// n8n's httpRequest surfaces the response body at error.response.data
		const data = (error as Record<string, Record<string, unknown>>).response?.data;
		const body = (data as Record<string, unknown> | undefined)?.error;
		if (!body || typeof body !== 'object') return undefined;

		const { code, summary, detail } = body as Record<string, unknown>;
		if (typeof code !== 'string') return undefined;

		return {
			code,
			summary: typeof summary === 'string' ? summary : 'Unknown error',
			detail: typeof detail === 'string' ? detail : '',
		};
	} catch {
		return undefined;
	}
}

/**
 * Build an error message for a parsed Tableau error.
 * Uses specific guidance from TABLEAU_ERROR_GUIDANCE when available,
 * otherwise falls back to the API's own summary and detail.
 */
function buildTableauErrorMessage(error: TableauErrorBody): string {
	const guidance = TABLEAU_ERROR_GUIDANCE[error.code];
	if (guidance) {
		return `Tableau error ${error.code}: ${guidance}`;
	}
	const detail = error.detail ? ` — ${error.detail}` : '';
	return `Tableau error ${error.code}: ${error.summary}${detail}`;
}

/**
 * Wraps a request factory with auth-token acquisition, Tableau error parsing,
 * and a single retry when a stale-token error (401000) is detected.
 */
async function withAuthRetry<T>(
	context: IExecuteFunctions,
	credentials: TableauCredentials,
	makeRequest: (authToken: TableauAuthToken) => Promise<T>,
): Promise<T> {
	let authToken = await getAuthToken(context, credentials);

	try {
		return await makeRequest(authToken);
	} catch (error) {
		const tableau = parseTableauError(error);

		if (tableau) {
			if (tableau.code === '401000') {
				invalidateAuthToken(context);
				authToken = await getAuthToken(context, credentials);
				return await makeRequest(authToken);
			}
			throw new Error(buildTableauErrorMessage(tableau));
		}

		throw error;
	}
}

function siteUrl(credentials: TableauCredentials, authToken: TableauAuthToken, endpoint: string): string {
	return `${credentials.serverUrl.replace(/\/+$/, '')}/api/${credentials.apiVersion}/sites/${authToken.siteId}${endpoint}`;
}

/**
 * Make an authenticated JSON request to the Tableau REST API.
 */
export async function tableauApiRequest(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	credentials: TableauCredentials,
	qs: IDataObject = {},
	body?: IDataObject,
): Promise<IDataObject> {
	return withAuthRetry(context, credentials, async (authToken) => {
		const options: IHttpRequestOptions = {
			method,
			url: siteUrl(credentials, authToken, endpoint),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Tableau-Auth': authToken.token,
			},
			qs,
			json: true,
		};
		if (body) options.body = body;
		return (await context.helpers.httpRequest(options)) as IDataObject;
	});
}

/**
 * Make an authenticated request that returns raw binary data (image, PDF, CSV, etc.).
 */
export async function tableauApiBinaryRequest(
	context: IExecuteFunctions,
	endpoint: string,
	credentials: TableauCredentials,
	qs: IDataObject = {},
): Promise<Buffer> {
	return withAuthRetry(context, credentials, async (authToken) => {
		const response = await context.helpers.httpRequest({
			method: 'GET',
			url: siteUrl(credentials, authToken, endpoint),
			headers: {
				// No Accept header: Tableau's binary endpoints always return a fixed
				// format regardless of content negotiation. Sending a specific MIME type
				// (e.g. image/png) triggers a 406 UNACCEPTABLE_MEDIA_TYPE response.
				'X-Tableau-Auth': authToken.token,
			},
			qs,
			returnFullResponse: true,
			encoding: 'arraybuffer',
		} as IHttpRequestOptions);
		return Buffer.from((response as { body: ArrayBuffer }).body);
	});
}

/**
 * Sign out from the Tableau REST API and invalidate the local token cache.
 *
 * The sign-out call is best-effort: if the token has already expired or the
 * request fails for any reason, the local cache is still cleared so that the
 * next Tableau node in the workflow will re-authenticate.
 *
 * Returns whether a sign-out call was actually sent to Tableau.
 */
export async function tableauSignOut(
	context: IExecuteFunctions,
	credentials: TableauCredentials,
): Promise<{ signedOut: boolean }> {
	const staticData = context.getWorkflowStaticData('global');
	const cached = staticData[TABLEAU_AUTH_CACHE_KEY] as TableauAuthToken | undefined;

	let signedOut = false;

	if (cached) {
		const baseUrl = credentials.serverUrl.replace(/\/+$/, '');
		try {
			await context.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}/api/${credentials.apiVersion}/auth/signout`,
				headers: {
					'X-Tableau-Auth': cached.token,
				},
				json: true,
			});
			signedOut = true;
		} catch {
			// Token may already be expired on Tableau's side — that's fine.
		}
	}

	// Always clear the cache so the next node re-authenticates.
	delete staticData[TABLEAU_AUTH_CACHE_KEY];

	return { signedOut };
}

/**
 * Extract an array of items from a Tableau REST API response.
 *
 * Tableau's JSON responses come in two shapes depending on the endpoint:
 * - Doubly-nested: { containerKey: { singularKey: [...] } }  (e.g. workbooks)
 * - Direct array:  { containerKey: [...] }                   (e.g. users)
 *
 * Both shapes are handled transparently.
 */
export function extractItems(
	response: IDataObject,
	containerKey: string,
): IDataObject[] {
	const container = response[containerKey];

	if (!container) {
		return [];
	}

	if (Array.isArray(container)) {
		return container as IDataObject[];
	}

	if (typeof container === 'object') {
		// Find the first key whose value is an array or object (skip pagination)
		const innerKey = Object.keys(container as IDataObject).find(
			(k) => k !== 'pagination',
		);
		if (!innerKey) return [];

		const inner = (container as IDataObject)[innerKey];
		if (Array.isArray(inner)) return inner as IDataObject[];
		if (inner && typeof inner === 'object') return [inner as IDataObject];
	}

	return [];
}

/**
 * Fetch all pages of a paginated Tableau REST API endpoint.
 */
export async function tableauApiRequestAllItems(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	credentials: TableauCredentials,
	containerKey: string,
	qs: IDataObject = {},
	body?: IDataObject,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let pageNumber = 1;
	const pageSize = 100;
	let totalAvailable = Infinity;

	while (allItems.length < totalAvailable) {
		const response = await tableauApiRequest(
			context,
			method,
			endpoint,
			credentials,
			{ ...qs, pageSize, pageNumber },
			body,
		);

		const pagination = response.pagination as
			| { totalAvailable: string }
			| undefined;
		if (pagination) {
			totalAvailable = parseInt(pagination.totalAvailable, 10);
		}

		const pageItems = extractItems(response, containerKey);
		if (pageItems.length === 0) break;

		allItems.push(...pageItems);
		pageNumber++;
	}

	return allItems;
}

/**
 * Fetch up to `limit` items from a paginated Tableau REST API endpoint,
 * requesting only as many pages as necessary.
 */
export async function tableauApiRequestWithLimit(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	credentials: TableauCredentials,
	containerKey: string,
	limit: number,
	qs: IDataObject = {},
	body?: IDataObject,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	const pageSize = Math.min(limit, 100);
	let pageNumber = 1;
	let totalAvailable = Infinity;

	while (allItems.length < limit && allItems.length < totalAvailable) {
		const response = await tableauApiRequest(
			context,
			method,
			endpoint,
			credentials,
			{ ...qs, pageSize, pageNumber },
			body,
		);

		const pagination = response.pagination as
			| { totalAvailable: string }
			| undefined;
		if (pagination) {
			totalAvailable = parseInt(pagination.totalAvailable, 10);
		}

		const pageItems = extractItems(response, containerKey);
		if (pageItems.length === 0) break;

		allItems.push(...pageItems);
		pageNumber++;
	}

	return allItems.slice(0, limit);
}
