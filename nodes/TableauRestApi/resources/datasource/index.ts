import type { INodeProperties } from 'n8n-workflow';
import { datasourceDeleteDescription } from './delete';
import { datasourceDownloadDescription } from './download';
import { datasourceGetDescription } from './get';
import { datasourceGetManyDescription } from './getAll';
import { datasourceGetConnectionsDescription } from './getConnections';
import { datasourcePublishDescription } from './publish';
import { datasourceRefreshDescription } from './refresh';
import { datasourceUpdateDescription } from './update';

export const datasourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['datasource'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a data source',
				description: 'Delete a data source from the site',
			},
			{
				name: 'Download',
				value: 'download',
				action: 'Download a data source',
				description: 'Download a data source file (.tds or .tdsx)',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a data source',
				description: 'Get a single data source by ID',
			},
			{
				name: 'Get Connections',
				value: 'getConnections',
				action: 'Get connections for a data source',
				description: 'Get all connections belonging to a data source',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many data sources',
				description: 'Get many data sources for the site',
			},
			{
				name: 'Publish',
				value: 'publish',
				action: 'Publish a data source',
				description: 'Publish a data source file (.tds or .tdsx) to the site',
			},
			{
				name: 'Refresh',
				value: 'refresh',
				action: 'Refresh a data source',
				description: 'Trigger an extract refresh for a data source',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a data source',
				description: 'Update the properties of a data source',
			},
		],
		default: 'getAll',
	},
];

export const datasourceFields: INodeProperties[] = [
	...datasourceDeleteDescription,
	...datasourceDownloadDescription,
	...datasourceGetDescription,
	...datasourceGetConnectionsDescription,
	...datasourceGetManyDescription,
	...datasourcePublishDescription,
	...datasourceRefreshDescription,
	...datasourceUpdateDescription,
];
