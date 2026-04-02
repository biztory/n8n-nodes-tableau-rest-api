import type { INodeProperties } from 'n8n-workflow';
import { userGetDescription } from './get';
import { userGetManyDescription } from './getAll';

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
		],
		default: 'getAll',
	},
];

export const userFields: INodeProperties[] = [
	...userGetDescription,
	...userGetManyDescription,
];
