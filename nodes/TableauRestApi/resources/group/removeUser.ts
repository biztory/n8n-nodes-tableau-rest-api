import type { INodeProperties } from 'n8n-workflow';

export const groupRemoveUserDescription: INodeProperties[] = [
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['removeUser'],
				resource: ['group'],
			},
		},
		description: 'The ID of the group to remove the user from',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['removeUser'],
				resource: ['group'],
			},
		},
		description: 'The ID of the user to remove from the group',
	},
];
