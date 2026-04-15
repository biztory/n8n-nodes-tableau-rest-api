import type { INodeProperties } from 'n8n-workflow';

export const datasourceRefreshDescription: INodeProperties[] = [
	{
		displayName: 'Data Source ID',
		name: 'datasourceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['refresh'],
				resource: ['datasource'],
			},
		},
		description: 'The ID of the data source whose extract to refresh',
	},
	{
		displayName: 'Incremental Refresh',
		name: 'incremental',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['refresh'],
				resource: ['datasource'],
			},
		},
		description: 'Whether to run an incremental refresh instead of a full refresh. Only supported on data sources with an extract configured for incremental refresh.',
	},
];
