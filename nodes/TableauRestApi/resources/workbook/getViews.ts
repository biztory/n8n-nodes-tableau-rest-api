import type { INodeProperties } from 'n8n-workflow';

export const workbookGetViewsDescription: INodeProperties[] = [
	{
		displayName: 'Workbook ID',
		name: 'workbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['getViews'],
				resource: ['workbook'],
			},
		},
		description: 'The ID of the workbook whose views to retrieve',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['getViews'],
				resource: ['workbook'],
			},
		},
		options: [
			{
				displayName: 'Include Usage Statistics',
				name: 'includeUsageStatistics',
				type: 'boolean',
				default: false,
				description:
					'Whether to include view usage statistics (total view count, last accessed) in the response',
			},
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: false,
				description: 'Whether to return a simplified version of the response instead of the full data',
			},
		],
	},
];
