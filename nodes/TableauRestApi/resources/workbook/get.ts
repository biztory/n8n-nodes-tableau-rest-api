import type { INodeProperties } from 'n8n-workflow';

export const workbookGetDescription: INodeProperties[] = [
	{
		displayName: 'Workbook ID',
		name: 'workbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['workbook'],
			},
		},
		description: 'The ID of the workbook to retrieve',
	},
];
