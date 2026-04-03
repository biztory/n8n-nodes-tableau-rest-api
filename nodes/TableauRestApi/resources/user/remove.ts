import type { INodeProperties } from 'n8n-workflow';

export const userRemoveDescription: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['remove'],
				resource: ['user'],
			},
		},
		description: 'The ID of the user to remove from the site',
	},
];
