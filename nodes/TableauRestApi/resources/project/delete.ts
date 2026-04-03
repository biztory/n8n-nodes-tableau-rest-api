import type { INodeProperties } from 'n8n-workflow';

export const projectDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['project'],
			},
		},
		description:
			'The ID of the project to delete. All workbooks, data sources, and other content inside the project will also be deleted.',
	},
];
