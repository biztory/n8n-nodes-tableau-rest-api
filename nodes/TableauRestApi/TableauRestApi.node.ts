import {
	NodeConnectionTypes,
	NodeApiError,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';
import { authOperations } from './resources/auth';
import { datasourceOperations, datasourceFields } from './resources/datasource';
import { groupOperations, groupFields } from './resources/group';
import { projectOperations, projectFields } from './resources/project';
import { workbookOperations, workbookFields } from './resources/workbook';
import { viewOperations, viewFields } from './resources/view';
import { userOperations, userFields } from './resources/user';
import {
	getAuthToken,
	tableauSignOut,
	tableauApiRequest,
	tableauApiBinaryRequest,
	tableauApiFileDownloadRequest,
	tableauApiMultipartRequest,
	tableauApiRequestAllItems,
	tableauApiRequestWithLimit,
	extractItems,
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
					{ name: 'Data Source', value: 'datasource' },
					{ name: 'Group', value: 'group' },
					{ name: 'Project', value: 'project' },
					{ name: 'User', value: 'user' },
					{ name: 'View', value: 'view' },
					{ name: 'Workbook', value: 'workbook' },
				],
				default: 'workbook',
			},
			...authOperations,
			...datasourceOperations,
			...datasourceFields,
			...groupOperations,
			...groupFields,
			...projectOperations,
			...projectFields,
			...userOperations,
			...userFields,
			...viewOperations,
			...viewFields,
			...workbookOperations,
			...workbookFields,
		],
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
					if (operation === 'delete') {
						const workbookId = this.getNodeParameter('workbookId', i) as string;
						await tableauApiRequest(this, 'DELETE', `/workbooks/${workbookId}`, credentials);
						returnData.push({ json: { success: true, workbookId }, pairedItem: { item: i } });

					} else if (operation === 'download') {
						const workbookId = this.getNodeParameter('workbookId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const qs: IDataObject = {};
						if (options.includeExtract === false) {
							qs.includeExtract = 'false';
						}

						const { buffer, filename } = await tableauApiFileDownloadRequest(
							this, `/workbooks/${workbookId}/content`, credentials, qs,
						);

						const resolvedFilename = filename ?? `workbook-${workbookId}.twbx`;
						const mimeType = resolvedFilename.endsWith('.twb')
							? 'application/xml'
							: 'application/octet-stream';

						const binaryData = await this.helpers.prepareBinaryData(buffer, resolvedFilename, mimeType);
						returnData.push({
							json: { workbookId, fileName: resolvedFilename, mimeType },
							binary: { data: binaryData },
							pairedItem: { item: i },
						});

					} else if (operation === 'get') {
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

					} else if (operation === 'getViews') {
						const workbookId = this.getNodeParameter('workbookId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const qs: IDataObject = {};
						if (options.includeUsageStatistics) {
							qs.includeUsageStatistics = 'true';
						}

						const response = await tableauApiRequest(
							this, 'GET', `/workbooks/${workbookId}/views`, credentials, qs,
						);
						const views = extractItems(response, 'views');
						for (const view of views) {
							returnData.push({ json: view, pairedItem: { item: i } });
						}

					} else if (operation === 'publish') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const workbookName = this.getNodeParameter('workbookName', i) as string;
						const projectId = this.getNodeParameter('projectId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;

						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

						const workbookAttrs: string[] = [`name="${xmlAttr(workbookName)}"`];
						if (options.description) {
							workbookAttrs.push(`description="${xmlAttr(options.description as string)}"`);
						}
						if (options.showTabs !== undefined) {
							workbookAttrs.push(`showTabs="${options.showTabs as boolean}"`);
						}

						const xmlPayload = `<?xml version='1.0' encoding='UTF-8' ?>
<tsRequest>
  <workbook ${workbookAttrs.join(' ')}>
    <project id="${xmlAttr(projectId)}" />
  </workbook>
</tsRequest>`;

						const qs: IDataObject = {};
						if (options.overwrite) {
							qs.overwrite = 'true';
						}

						const resolvedFileName = (options.fileName as string | undefined)
							|| binaryData.fileName
							|| 'workbook.twbx';

						const response = await tableauApiMultipartRequest(
							this,
							'/workbooks',
							credentials,
							xmlPayload,
							fileBuffer,
							resolvedFileName,
							'tableau_workbook',
							qs,
						);
						const workbook = (response.workbook ?? response) as IDataObject;
						returnData.push({ json: workbook, pairedItem: { item: i } });

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

					} else if (operation === 'refresh') {
						const workbookId = this.getNodeParameter('workbookId', i) as string;
						const response = await tableauApiRequest(
							this, 'POST', `/workbooks/${workbookId}/refresh`, credentials,
						);
						const job = (response.job ?? response) as IDataObject;
						returnData.push({ json: job, pairedItem: { item: i } });
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

				} else if (resource === 'datasource') {
					if (operation === 'delete') {
						const datasourceId = this.getNodeParameter('datasourceId', i) as string;
						await tableauApiRequest(this, 'DELETE', `/datasources/${datasourceId}`, credentials);
						returnData.push({ json: { success: true, datasourceId }, pairedItem: { item: i } });

					} else if (operation === 'download') {
						const datasourceId = this.getNodeParameter('datasourceId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const qs: IDataObject = {};
						if (options.includeExtract === false) {
							qs.includeExtract = 'false';
						}

						const { buffer, filename } = await tableauApiFileDownloadRequest(
							this, `/datasources/${datasourceId}/content`, credentials, qs,
						);

						const resolvedFilename = filename ?? `datasource-${datasourceId}.tdsx`;
						const mimeType = resolvedFilename.endsWith('.tds')
							? 'application/xml'
							: 'application/octet-stream';

						const binaryData = await this.helpers.prepareBinaryData(buffer, resolvedFilename, mimeType);
						returnData.push({
							json: { datasourceId, fileName: resolvedFilename, mimeType },
							binary: { data: binaryData },
							pairedItem: { item: i },
						});

					} else if (operation === 'get') {
						const datasourceId = this.getNodeParameter('datasourceId', i) as string;
						const response = await tableauApiRequest(
							this, 'GET', `/datasources/${datasourceId}`, credentials,
						);
						const datasource = (response.datasource ?? response) as IDataObject;
						returnData.push({ json: datasource, pairedItem: { item: i } });

					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;
						const qs = buildDatasourceFilterQs(filters, sort);

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', '/datasources', credentials, 'datasources', qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', '/datasources', credentials, 'datasources', limit, qs,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}

					} else if (operation === 'getConnections') {
						const datasourceId = this.getNodeParameter('datasourceId', i) as string;
						const response = await tableauApiRequest(
							this, 'GET', `/datasources/${datasourceId}/connections`, credentials,
						);
						const connections = extractItems(response, 'connections');
						for (const connection of connections) {
							returnData.push({ json: connection, pairedItem: { item: i } });
						}

					} else if (operation === 'publish') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const datasourceName = this.getNodeParameter('datasourceName', i) as string;
						const projectId = this.getNodeParameter('projectId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;

						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

						const datasourceAttrs: string[] = [`name="${xmlAttr(datasourceName)}"`];
						if (options.description) {
							datasourceAttrs.push(`description="${xmlAttr(options.description as string)}"`);
						}

						const xmlPayload = `<?xml version='1.0' encoding='UTF-8' ?>
<tsRequest>
  <datasource ${datasourceAttrs.join(' ')}>
    <project id="${xmlAttr(projectId)}" />
  </datasource>
</tsRequest>`;

						const qs: IDataObject = {};
						if (options.overwrite) {
							qs.overwrite = 'true';
						}

						const resolvedFileName = (options.fileName as string | undefined)
							|| binaryData.fileName
							|| 'datasource.tdsx';

						const response = await tableauApiMultipartRequest(
							this,
							'/datasources',
							credentials,
							xmlPayload,
							fileBuffer,
							resolvedFileName,
							'tableau_datasource',
							qs,
						);
						const datasource = (response.datasource ?? response) as IDataObject;
						returnData.push({ json: datasource, pairedItem: { item: i } });

					} else if (operation === 'update') {
						const datasourceId = this.getNodeParameter('datasourceId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						const datasourceBody: IDataObject = {};
						if (updateFields.name !== undefined && updateFields.name !== '') {
							datasourceBody.name = updateFields.name;
						}
						if (updateFields.isCertified !== undefined) {
							datasourceBody.isCertified = updateFields.isCertified;
						}
						if (updateFields.certificationNote !== undefined && updateFields.certificationNote !== '') {
							datasourceBody.certificationNote = updateFields.certificationNote;
						}
						if (updateFields.encryptExtracts !== undefined) {
							datasourceBody.encryptExtracts = updateFields.encryptExtracts;
						}
						if (updateFields.projectId) {
							datasourceBody.project = { id: updateFields.projectId };
						}
						if (updateFields.ownerId) {
							datasourceBody.owner = { id: updateFields.ownerId };
						}

						const response = await tableauApiRequest(
							this,
							'PUT',
							`/datasources/${datasourceId}`,
							credentials,
							{},
							{ datasource: datasourceBody },
						);
						const datasource = (response.datasource ?? response) as IDataObject;
						returnData.push({ json: datasource, pairedItem: { item: i } });

					} else if (operation === 'refresh') {
						const datasourceId = this.getNodeParameter('datasourceId', i) as string;
						const response = await tableauApiRequest(
							this, 'POST', `/datasources/${datasourceId}/refresh`, credentials,
						);
						const job = (response.job ?? response) as IDataObject;
						returnData.push({ json: job, pairedItem: { item: i } });
					}

				} else if (resource === 'group') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;
						const qs = buildGroupFilterQs(filters, sort);

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', '/groups', credentials, 'groups', qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', '/groups', credentials, 'groups', limit, qs,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}

					} else if (operation === 'addUser') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const response = await tableauApiRequest(
							this, 'POST', `/groups/${groupId}/users`, credentials, {}, { user: { id: userId } },
						);
						const user = (response.user ?? response) as IDataObject;
						returnData.push({ json: user, pairedItem: { item: i } });

					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const groupBody: IDataObject = { name };
						if (options.minimumSiteRole) {
							groupBody.minimumSiteRole = options.minimumSiteRole;
						}
						const response = await tableauApiRequest(
							this, 'POST', '/groups', credentials, {}, { group: groupBody },
						);
						const group = (response.group ?? response) as IDataObject;
						returnData.push({ json: group, pairedItem: { item: i } });

					} else if (operation === 'getUsersInGroup') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', `/groups/${groupId}/users`, credentials, 'users',
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', `/groups/${groupId}/users`, credentials, 'users', limit,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}

					} else if (operation === 'removeUser') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						await tableauApiRequest(
							this, 'DELETE', `/groups/${groupId}/users/${userId}`, credentials,
						);
						returnData.push({ json: { success: true, groupId, userId }, pairedItem: { item: i } });

					} else if (operation === 'update') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const groupBody: IDataObject = {};
						if (updateFields.name !== undefined && updateFields.name !== '') {
							groupBody.name = updateFields.name;
						}
						if (updateFields.minimumSiteRole) {
							groupBody.minimumSiteRole = updateFields.minimumSiteRole;
						}
						const response = await tableauApiRequest(
							this, 'PUT', `/groups/${groupId}`, credentials, {}, { group: groupBody },
						);
						const group = (response.group ?? response) as IDataObject;
						returnData.push({ json: group, pairedItem: { item: i } });
					}

				} else if (resource === 'project') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const projectBody: IDataObject = { name };
						if (options.description !== undefined && options.description !== '') {
							projectBody.description = options.description;
						}
						if (options.parentProjectId) {
							projectBody.parentProjectId = options.parentProjectId;
						}
						if (options.contentPermissions) {
							projectBody.contentPermissions = options.contentPermissions;
						}
						const response = await tableauApiRequest(
							this, 'POST', '/projects', credentials, {}, { project: projectBody },
						);
						const project = (response.project ?? response) as IDataObject;
						returnData.push({ json: project, pairedItem: { item: i } });

					} else if (operation === 'delete') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						await tableauApiRequest(this, 'DELETE', `/projects/${projectId}`, credentials);
						returnData.push({ json: { success: true, projectId }, pairedItem: { item: i } });

					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const sort = this.getNodeParameter('sort', i) as IDataObject;
						const qs = buildProjectFilterQs(filters, sort);

						let results: IDataObject[];
						if (returnAll) {
							results = await tableauApiRequestAllItems(
								this, 'GET', '/projects', credentials, 'projects', qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							results = await tableauApiRequestWithLimit(
								this, 'GET', '/projects', credentials, 'projects', limit, qs,
							);
						}

						for (const item of results) {
							returnData.push({ json: item, pairedItem: { item: i } });
						}

					} else if (operation === 'update') {
						const projectId = this.getNodeParameter('projectId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const projectBody: IDataObject = {};
						if (updateFields.name !== undefined && updateFields.name !== '') {
							projectBody.name = updateFields.name;
						}
						if (updateFields.description !== undefined && updateFields.description !== '') {
							projectBody.description = updateFields.description;
						}
						// parentProjectId can be empty string (moves project to top level)
						if (updateFields.parentProjectId !== undefined) {
							projectBody.parentProjectId = updateFields.parentProjectId;
						}
						if (updateFields.contentPermissions) {
							projectBody.contentPermissions = updateFields.contentPermissions;
						}
						if (updateFields.ownerId) {
							projectBody.owner = { id: updateFields.ownerId };
						}
						const response = await tableauApiRequest(
							this, 'PUT', `/projects/${projectId}`, credentials, {}, { project: projectBody },
						);
						const project = (response.project ?? response) as IDataObject;
						returnData.push({ json: project, pairedItem: { item: i } });
					}

				} else if (resource === 'user') {
					if (operation === 'add') {
						const name = this.getNodeParameter('name', i) as string;
						const siteRole = this.getNodeParameter('siteRole', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						const userBody: IDataObject = { name, siteRole };
						if (options.authSetting) {
							userBody.authSetting = options.authSetting;
						}
						const response = await tableauApiRequest(
							this, 'POST', '/users', credentials, {}, { user: userBody },
						);
						const user = (response.user ?? response) as IDataObject;
						returnData.push({ json: user, pairedItem: { item: i } });

					} else if (operation === 'get') {
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

					} else if (operation === 'remove') {
						const userId = this.getNodeParameter('userId', i) as string;
						await tableauApiRequest(this, 'DELETE', `/users/${userId}`, credentials);
						returnData.push({ json: { success: true, userId }, pairedItem: { item: i } });

					} else if (operation === 'update') {
						const userId = this.getNodeParameter('userId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const userBody: IDataObject = {};
						if (updateFields.siteRole) userBody.siteRole = updateFields.siteRole;
						if (updateFields.fullName !== undefined && updateFields.fullName !== '') {
							userBody.fullName = updateFields.fullName;
						}
						if (updateFields.email !== undefined && updateFields.email !== '') {
							userBody.email = updateFields.email;
						}
						if (updateFields.authSetting) userBody.authSetting = updateFields.authSetting;
						const response = await tableauApiRequest(
							this, 'PUT', `/users/${userId}`, credentials, {}, { user: userBody },
						);
						const user = (response.user ?? response) as IDataObject;
						returnData.push({ json: user, pairedItem: { item: i } });
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

function buildProjectFilterQs(
	filters: IDataObject,
	sort: IDataObject,
): IDataObject {
	const filterParts: string[] = [];
	if (filters.name) filterParts.push(`name:eq:${filters.name as string}`);
	if (filters.ownerName) filterParts.push(`ownerName:eq:${filters.ownerName as string}`);
	if (filters.parentProjectId) filterParts.push(`parentProjectId:eq:${filters.parentProjectId as string}`);
	return buildFilterAndSort(filterParts, sort);
}

function buildGroupFilterQs(
	filters: IDataObject,
	sort: IDataObject,
): IDataObject {
	const filterParts: string[] = [];
	if (filters.name) filterParts.push(`name:eq:${filters.name as string}`);
	return buildFilterAndSort(filterParts, sort);
}

function buildDatasourceFilterQs(
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

/** Escape a string for use in an XML attribute value (double-quoted). */
function xmlAttr(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
