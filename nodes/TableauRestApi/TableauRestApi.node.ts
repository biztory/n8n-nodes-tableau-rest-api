import {
	NodeConnectionTypes,
	NodeApiError,
	NodeOperationError,
	type ICredentialDataDecryptedObject,
	type ICredentialTestFunctions,
	type ICredentialsDecrypted,
	type IDataObject,
	type IExecuteFunctions,
	type INodeCredentialTestResult,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';
import { authOperations } from './resources/auth';
import { workbookOperations, workbookFields } from './resources/workbook';
import { viewOperations, viewFields } from './resources/view';
import { userOperations, userFields } from './resources/user';
import {
	signJwt,
	getAuthToken,
	tableauSignOut,
	tableauApiRequest,
	tableauApiBinaryRequest,
	tableauApiRequestAllItems,
	tableauApiRequestWithLimit,
} from './shared/transport';
import { buildVfFilters } from './resources/view/download';
import type { TableauCredentials } from './shared/types';

export class TableauRestApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tableau',
		name: 'tableauRestApi',
		icon: 'file:../../icons/tableau.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Tableau REST API',
		defaults: {
			name: 'Tableau',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'tableauRestApiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Authentication', value: 'auth' },
					{ name: 'User', value: 'user' },
					{ name: 'View', value: 'view' },
					{ name: 'Workbook', value: 'workbook' },
				],
				default: 'workbook',
			},
			...authOperations,
			...userOperations,
			...userFields,
			...viewOperations,
			...viewFields,
			...workbookOperations,
			...workbookFields,
		],
	};

	methods = {
		credentialTest: {
			async tableauRestApiCredentialTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted<ICredentialDataDecryptedObject>,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as unknown as TableauCredentials;
				const jwt = signJwt(credentials);
				const baseUrl = credentials.serverUrl.replace(/\/+$/, '');
				const signInUrl = `${baseUrl}/api/${credentials.apiVersion}/auth/signin`;

				try {
					// ICredentialTestFunctions only exposes `request`, not `httpRequest`
					// eslint-disable-next-line @n8n/community-nodes/no-deprecated-workflow-functions
					await this.helpers.request({
						method: 'POST',
						uri: signInUrl,
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
						},
						body: {
							credentials: {
								jwt,
								site: {
									contentUrl: credentials.siteContentUrl,
								},
							},
						},
						json: true,
					});

					return {
						status: 'OK',
						message: 'Authentication successful',
					};
				} catch (error) {
					return {
						status: 'Error',
						message: `Authentication failed: ${(error as Error).message}`,
					};
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const inputItems = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = (await this.getCredentials(
			'tableauRestApiApi',
		)) as unknown as TableauCredentials;

		for (let i = 0; i < inputItems.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'auth') {
					if (operation === 'getToken') {
						const authToken = await getAuthToken(this, credentials);
						returnData.push({
							json: {
								token: authToken.token,
								siteId: authToken.siteId,
								serverUrl: credentials.serverUrl.replace(/\/+$/, ''),
								apiVersion: credentials.apiVersion,
								expiresAt: new Date(authToken.expiresAt).toISOString(),
							},
							pairedItem: { item: i },
						});

					} else if (operation === 'signOut') {
						const result = await tableauSignOut(this, credentials);
						returnData.push({
							json: {
								success: true,
								// signedOut=true: an active token was sent to Tableau's signout endpoint.
								// signedOut=false: no cached token existed; the cache was cleared anyway.
								signedOut: result.signedOut,
							},
							pairedItem: { item: i },
						});
					}

				} else if (resource === 'workbook') {
					if (operation === 'get') {
						const workbookId = this.getNodeParameter('workbookId', i) as string;
						const response = await tableauApiRequest(
							this,
							'GET',
							`/workbooks/${workbookId}`,
							credentials,
						);
						const workbook = (response.workbook ?? response) as IDataObject;
						returnData.push({ json: workbook, pairedItem: { item: i } });

					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;
						const qs = buildWorkbookFilterQs(filters, sort);

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', '/workbooks', credentials, 'workbooks', qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', '/workbooks', credentials, 'workbooks', limit, qs,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}

					} else if (operation === 'update') {
						const workbookId = this.getNodeParameter('workbookId', i) as string;
						const updateFields = this.getNodeParameter(
							'updateFields', i,
						) as IDataObject;

						const workbookBody: IDataObject = {};
						if (updateFields.name !== undefined && updateFields.name !== '') {
							workbookBody.name = updateFields.name;
						}
						if (updateFields.description !== undefined && updateFields.description !== '') {
							workbookBody.description = updateFields.description;
						}
						if (updateFields.showTabs !== undefined) {
							workbookBody.showTabs = updateFields.showTabs;
						}
						if (updateFields.encryptExtracts !== undefined) {
							workbookBody.encryptExtracts = updateFields.encryptExtracts;
						}
						if (updateFields.projectId) {
							workbookBody.project = { id: updateFields.projectId };
						}
						if (updateFields.ownerId) {
							workbookBody.owner = { id: updateFields.ownerId };
						}

						const response = await tableauApiRequest(
							this,
							'PUT',
							`/workbooks/${workbookId}`,
							credentials,
							{},
							{ workbook: workbookBody },
						);
						const workbook = (response.workbook ?? response) as IDataObject;
						returnData.push({ json: workbook, pairedItem: { item: i } });
					}

				} else if (resource === 'view') {
					if (operation === 'get') {
						const viewId = this.getNodeParameter('viewId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const qs: IDataObject = {};
						if (options.includeUsageStatistics) {
							qs.includeUsageStatistics = 'true';
						}
						const response = await tableauApiRequest(
							this, 'GET', `/views/${viewId}`, credentials, qs,
						);
						const view = (response.view ?? response) as IDataObject;
						returnData.push({ json: view, pairedItem: { item: i } });

					} else if (operation === 'getData') {
						const viewId = this.getNodeParameter('viewId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const vfFilters = this.getNodeParameter('vfFilters', i) as IDataObject;
						const qs: IDataObject = { ...buildVfFilters(vfFilters) };
						if (options.maxAge) qs.maxAge = options.maxAge;

						const csvBuffer = await tableauApiBinaryRequest(
							this, `/views/${viewId}/data`, credentials, qs,
						);
						const csvBinary = await this.helpers.prepareBinaryData(
							csvBuffer, `view-${viewId}.csv`, 'text/csv',
						);
						returnData.push({
							json: { viewId, mimeType: 'text/csv', fileName: `view-${viewId}.csv` },
							binary: { data: csvBinary },
							pairedItem: { item: i },
						});

					} else if (operation === 'getImage') {
						const viewId = this.getNodeParameter('viewId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const vfFilters = this.getNodeParameter('vfFilters', i) as IDataObject;
						const qs: IDataObject = { ...buildVfFilters(vfFilters) };
						if (options.maxAge) qs.maxAge = options.maxAge;
						if (options.resolution === 'high') qs.resolution = 'high';

						const imageBuffer = await tableauApiBinaryRequest(
							this, `/views/${viewId}/image`, credentials, qs,
						);
						const imageBinary = await this.helpers.prepareBinaryData(
							imageBuffer, `view-${viewId}.png`, 'image/png',
						);
						returnData.push({
							json: { viewId, mimeType: 'image/png', fileName: `view-${viewId}.png` },
							binary: { data: imageBinary },
							pairedItem: { item: i },
						});

					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const qs = buildViewFilterQs(filters, sort);
						if (options.includeUsageStatistics) {
							qs.includeUsageStatistics = 'true';
						}

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', '/views', credentials, 'views', qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', '/views', credentials, 'views', limit, qs,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}

					} else if (operation === 'getPdf') {
						const viewId = this.getNodeParameter('viewId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const vfFilters = this.getNodeParameter('vfFilters', i) as IDataObject;
						const qs: IDataObject = { ...buildVfFilters(vfFilters) };
						if (options.maxAge) qs.maxAge = options.maxAge;
						if (options.type) qs.type = options.type;
						if (options.orientation) qs.orientation = options.orientation;

						const pdfBuffer = await tableauApiBinaryRequest(
							this, `/views/${viewId}/pdf`, credentials, qs,
						);
						const pdfBinary = await this.helpers.prepareBinaryData(
							pdfBuffer, `view-${viewId}.pdf`, 'application/pdf',
						);
						returnData.push({
							json: { viewId, mimeType: 'application/pdf', fileName: `view-${viewId}.pdf` },
							binary: { data: pdfBinary },
							pairedItem: { item: i },
						});

					} else if (operation === 'getPreviewImage') {
						const viewId = this.getNodeParameter('viewId', i) as string;

						const previewBuffer = await tableauApiBinaryRequest(
							this, `/views/${viewId}/previewImage`, credentials,
						);
						const previewBinary = await this.helpers.prepareBinaryData(
							previewBuffer, `view-${viewId}-preview.png`, 'image/png',
						);
						returnData.push({
							json: { viewId, mimeType: 'image/png', fileName: `view-${viewId}-preview.png` },
							binary: { data: previewBinary },
							pairedItem: { item: i },
						});
					}

				} else if (resource === 'user') {
					if (operation === 'get') {
						const userId = this.getNodeParameter('userId', i) as string;
						const response = await tableauApiRequest(
							this, 'GET', `/users/${userId}`, credentials,
						);
						const user = (response.user ?? response) as IDataObject;
						returnData.push({ json: user, pairedItem: { item: i } });

					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;
						const qs = buildUserFilterQs(filters, sort);

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', '/users', credentials, 'users', qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', '/users', credentials, 'users', limit, qs,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}
					}
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}

				if (
					(error as { httpCode?: number }).httpCode ||
					(error as { statusCode?: number }).statusCode
				) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						itemIndex: i,
					});
				}

				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}

function buildFilterAndSort(
	filterParts: string[],
	sort: IDataObject,
): IDataObject {
	const qs: IDataObject = {};
	if (filterParts.length > 0) {
		qs.filter = filterParts.join(',');
	}
	const sortRule = (sort.sortRule as IDataObject) ?? {};
	if (sortRule.field) {
		qs.sort = `${sortRule.field as string}:${(sortRule.direction as string) || 'asc'}`;
	}
	return qs;
}

function buildWorkbookFilterQs(
	filters: IDataObject,
	sort: IDataObject,
): IDataObject {
	const filterParts: string[] = [];
	if (filters.name) filterParts.push(`name:eq:${filters.name as string}`);
	if (filters.ownerName) filterParts.push(`ownerName:eq:${filters.ownerName as string}`);
	if (filters.projectName) filterParts.push(`projectName:eq:${filters.projectName as string}`);
	if (filters.tags) filterParts.push(`tags:has:${filters.tags as string}`);
	if (filters.createdAfter) filterParts.push(`createdAt:gte:${filters.createdAfter as string}`);
	if (filters.updatedAfter) filterParts.push(`updatedAt:gte:${filters.updatedAfter as string}`);
	return buildFilterAndSort(filterParts, sort);
}

function buildViewFilterQs(
	filters: IDataObject,
	sort: IDataObject,
): IDataObject {
	const filterParts: string[] = [];
	if (filters.name) filterParts.push(`name:eq:${filters.name as string}`);
	if (filters.ownerName) filterParts.push(`ownerName:eq:${filters.ownerName as string}`);
	if (filters.projectName) filterParts.push(`projectName:eq:${filters.projectName as string}`);
	if (filters.tags) filterParts.push(`tags:has:${filters.tags as string}`);
	if (filters.updatedAfter) filterParts.push(`updatedAt:gte:${filters.updatedAfter as string}`);
	return buildFilterAndSort(filterParts, sort);
}

function buildUserFilterQs(
	filters: IDataObject,
	sort: IDataObject,
): IDataObject {
	const filterParts: string[] = [];
	if (filters.name) filterParts.push(`name:eq:${filters.name as string}`);
	if (filters.siteRole) filterParts.push(`siteRole:eq:${filters.siteRole as string}`);
	if (filters.lastLoginAfter) filterParts.push(`lastLogin:gte:${filters.lastLoginAfter as string}`);
	return buildFilterAndSort(filterParts, sort);
}
