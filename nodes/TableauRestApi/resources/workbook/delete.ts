import type { INodeProperties } from 'n8n-workflow';

export const workbookDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Workbook ID',
		name: 'workbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['workbook'],
			},
		},
		description: 'The ID of the workbook to delete',
	},
];
