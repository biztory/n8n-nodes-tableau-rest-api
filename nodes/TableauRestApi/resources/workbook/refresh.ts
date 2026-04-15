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
	{
		displayName: 'Incremental Refresh',
		name: 'incremental',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['refresh'],
				resource: ['workbook'],
			},
		},
		description: 'Whether to run an incremental refresh instead of a full refresh. Only supported on workbooks with an extract configured for incremental refresh.',
	},
];
