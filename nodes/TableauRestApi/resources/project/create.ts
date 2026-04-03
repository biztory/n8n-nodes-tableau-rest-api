import type { INodeProperties } from 'n8n-workflow';

export const CONTENT_PERMISSIONS_OPTIONS = [
	{
		name: 'Locked to Project',
		value: 'LockedToProject',
		description: 'All content in the project inherits the project permissions; owners cannot change them',
	},
	{
		name: 'Locked to Project Without Nested',
		value: 'LockedToProjectWithoutNested',
		description: 'Like Locked to Project, but nested projects are excluded',
	},
	{
		name: 'Managed by Owner',
		value: 'ManagedByOwner',
		description: 'Content owners can manage permissions on their own content',
	},
];

export const projectCreateDescription: INodeProperties[] = [
	{
		displayName: 'Project Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['project'],
			},
		},
		description: 'The name of the new project',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['project'],
			},
		},
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
				description: 'A description for the project',
			},
			{
				displayName: 'Parent Project ID',
				name: 'parentProjectId',
				type: 'string',
				default: '',
				description: 'The ID of the parent project. Leave empty to create a top-level project.',
			},
		],
	},
];
