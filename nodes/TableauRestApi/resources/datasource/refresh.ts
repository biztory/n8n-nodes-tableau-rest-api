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
];
