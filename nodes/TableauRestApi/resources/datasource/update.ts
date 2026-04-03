import type { INodeProperties } from 'n8n-workflow';

export const datasourceUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Data Source ID',
		name: 'datasourceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['datasource'],
			},
		},
		description: 'The ID of the data source to update',
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
				resource: ['datasource'],
			},
		},
		description: 'Fields to update on the data source',
		options: [
			{
				displayName: 'Certification Note',
				name: 'certificationNote',
				type: 'string',
				default: '',
				description: 'A note that explains the certification status of the data source',
			},
			{
				displayName: 'Encrypt Extracts',
				name: 'encryptExtracts',
				type: 'boolean',
				default: false,
				description: 'Whether to encrypt the extracts for the data source',
			},
			{
				displayName: 'Is Certified',
				name: 'isCertified',
				type: 'boolean',
				default: false,
				description: 'Whether the data source is certified',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The new name for the data source',
			},
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'string',
				default: '',
				description: 'The ID of the user to set as the new owner of the data source',
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				description: 'The ID of the project to move the data source to',
			},
		],
	},
];
