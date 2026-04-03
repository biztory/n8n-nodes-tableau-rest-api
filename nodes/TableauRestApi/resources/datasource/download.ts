import type { INodeProperties } from 'n8n-workflow';

export const datasourceDownloadDescription: INodeProperties[] = [
	{
		displayName: 'Data Source ID',
		name: 'datasourceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['download'],
				resource: ['datasource'],
			},
		},
		description: 'The ID of the data source to download',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['download'],
				resource: ['datasource'],
			},
		},
		options: [
			{
				displayName: 'Include Extract',
				name: 'includeExtract',
				type: 'boolean',
				default: true,
				description:
					'Whether to include the data extract in the downloaded file. Set to false to reduce download size when the extract is not needed.',
			},
		],
	},
];
