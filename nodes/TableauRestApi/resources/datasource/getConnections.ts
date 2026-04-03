import type { INodeProperties } from 'n8n-workflow';

export const datasourceGetConnectionsDescription: INodeProperties[] = [
	{
		displayName: 'Data Source ID',
		name: 'datasourceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['getConnections'],
				resource: ['datasource'],
			},
		},
		description: 'The ID of the data source whose connections to retrieve',
	},
];
