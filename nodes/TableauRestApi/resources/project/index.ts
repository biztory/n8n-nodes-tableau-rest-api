import type { INodeProperties } from 'n8n-workflow';
import { projectCreateDescription } from './create';
import { projectDeleteDescription } from './delete';
import { projectGetManyDescription } from './getAll';
import { projectUpdateDescription } from './update';

export const projectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a project',
				description: 'Create a new project on the site',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a project',
				description: 'Delete a project and all its contents',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'Get many projects on the site',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a project',
				description: 'Update the properties of a project',
			},
		],
		default: 'getAll',
	},
];

export const projectFields: INodeProperties[] = [
	...projectCreateDescription,
	...projectDeleteDescription,
	...projectGetManyDescription,
	...projectUpdateDescription,
];
