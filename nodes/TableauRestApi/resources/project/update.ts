import type { INodeProperties } from 'n8n-workflow';
import { CONTENT_PERMISSIONS_OPTIONS } from './create';

export const projectUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['project'],
			},
		},
		description: 'The ID of the project to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['project'],
			},
		},
		description: 'Fields to update on the project',
		options: [
			{
				displayName: 'Content Permissions',
				name: 'contentPermissions',
				type: 'options',
				default: 'ManagedByOwner',
				options: CONTENT_PERMISSIONS_OPTIONS,
				description: 'How permissions are managed for content in this project',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A new description for the project',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'A new name for the project',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'string',
				default: '',
				description: 'The ID of the user to set as the new owner of the project',
			},
			{
				displayName: 'Parent Project ID',
				name: 'parentProjectId',
				type: 'string',
				default: '',
				description:
					'The ID of the new parent project. Set to an empty string to move the project to the top level.',
			},
		],
	},
];
