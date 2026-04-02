import type { INodeProperties } from 'n8n-workflow';

export const userGetDescription: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['user'],
			},
		},
		description: 'The ID of the user to retrieve',
	},
];
