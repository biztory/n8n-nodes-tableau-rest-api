import type { INodeProperties } from 'n8n-workflow';
import { groupAddUserDescription } from './addUser';
import { groupCreateDescription } from './create';
import { groupGetUsersInGroupDescription } from './getUsersInGroup';
import { groupRemoveUserDescription } from './removeUser';
import { groupUpdateDescription } from './update';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'Add User',
				value: 'addUser',
				action: 'Add a user to a group',
				description: 'Add a user to a group',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a group',
				description: 'Create a new local group on the site',
			},
			{
				name: 'Get Users in Group',
				value: 'getUsersInGroup',
				action: 'Get users in a group',
				description: 'Get all users in a group',
			},
			{
				name: 'Remove User',
				value: 'removeUser',
				action: 'Remove a user from a group',
				description: 'Remove a user from a group',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a group',
				description: 'Update the properties of a group',
			},
		],
		default: 'getUsersInGroup',
	},
];

export const groupFields: INodeProperties[] = [
	...groupAddUserDescription,
	...groupCreateDescription,
	...groupGetUsersInGroupDescription,
	...groupRemoveUserDescription,
	...groupUpdateDescription,
];
