import type { INodeProperties } from 'n8n-workflow';

export const workbookDownloadDescription: INodeProperties[] = [
	{
		displayName: 'Workbook ID',
		name: 'workbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['download'],
				resource: ['workbook'],
			},
		},
		description: 'The ID of the workbook to download',
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
				resource: ['workbook'],
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
