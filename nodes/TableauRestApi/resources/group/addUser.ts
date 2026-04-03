import type { INodeProperties } from 'n8n-workflow';

export const groupAddUserDescription: INodeProperties[] = [
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['addUser'],
				resource: ['group'],
			},
		},
		description: 'The ID of the group to add the user to',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['addUser'],
				resource: ['group'],
			},
		},
		description: 'The ID of the user to add to the group',
	},
];
