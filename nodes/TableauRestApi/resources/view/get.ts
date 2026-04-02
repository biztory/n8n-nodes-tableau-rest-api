import type { INodeProperties } from 'n8n-workflow';

export const viewGetDescription: INodeProperties[] = [
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['view'],
			},
		},
		description: 'The ID of the view to retrieve',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['view'],
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
		],
	},
];
