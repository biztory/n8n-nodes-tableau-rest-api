import type { INodeProperties } from 'n8n-workflow';
import { userAddDescription } from './add';
import { userGetDescription } from './get';
import { userGetManyDescription } from './getAll';
import { userRemoveDescription } from './remove';
import { userUpdateDescription } from './update';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Add to Site',
				value: 'add',
				action: 'Add a user to the site',
				description: 'Add a user to the site',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a user',
				description: 'Get a single user by ID',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many users',
				description: 'Get many users on the site',
			},
			{
				name: 'Remove From Site',
				value: 'remove',
				action: 'Remove a user from the site',
				description: 'Remove a user from the site',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a user',
				description: 'Update the properties of a user',
			},
		],
		default: 'getAll',
	},
];

export const userFields: INodeProperties[] = [
	...userAddDescription,
	...userGetDescription,
	...userGetManyDescription,
	...userRemoveDescription,
	...userUpdateDescription,
];
