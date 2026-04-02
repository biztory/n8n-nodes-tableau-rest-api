import type { INodeProperties } from 'n8n-workflow';

export const workbookUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Workbook ID',
		name: 'workbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['workbook'],
			},
		},
		description: 'The ID of the workbook to update',
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
				resource: ['workbook'],
			},
		},
		description: 'Fields to update on the workbook',
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A description for the workbook',
			},
			{
				displayName: 'Encrypt Extracts',
				name: 'encryptExtracts',
				type: 'boolean',
				default: false,
				description: 'Whether to encrypt the extracts for the workbook',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The new name for the workbook',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'string',
				default: '',
				description: 'The ID of the user to set as the new owner of the workbook',
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				description: 'The ID of the project to move the workbook to',
			},
			{
				displayName: 'Show Tabs',
				name: 'showTabs',
				type: 'boolean',
				default: true,
				description: 'Whether tabs are shown in the workbook',
			},
		],
	},
];
