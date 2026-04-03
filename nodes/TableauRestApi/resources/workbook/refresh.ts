import type { INodeProperties } from 'n8n-workflow';

export const workbookRefreshDescription: INodeProperties[] = [
	{
		displayName: 'Workbook ID',
		name: 'workbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['refresh'],
				resource: ['workbook'],
			},
		},
		description: 'The ID of the workbook whose extract to refresh',
	},
];
