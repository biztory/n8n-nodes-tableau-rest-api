import type { INodeProperties } from 'n8n-workflow';

export const datasourceGetDescription: INodeProperties[] = [
	{
		displayName: 'Data Source ID',
		name: 'datasourceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['datasource'],
			},
		},
		description: 'The ID of the data source to retrieve',
	},
];
