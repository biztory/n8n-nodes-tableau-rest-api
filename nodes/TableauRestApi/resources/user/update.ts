import type { INodeProperties } from 'n8n-workflow';

export const userUpdateDescription: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['user'],
			},
		},
		description: 'The ID of the user to update',
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
				resource: ['user'],
			},
		},
		description: 'Fields to update on the user',
		options: [
			{
				displayName: 'Auth Setting',
				name: 'authSetting',
				type: 'options',
				default: 'ServerDefault',
				options: [
					{ name: 'OpenID', value: 'OpenID' },
					{ name: 'SAML', value: 'SAML' },
					{ name: 'Server Default', value: 'ServerDefault' },
					{ name: 'Tableau ID with MFA', value: 'TableauIDWithMFA' },
				],
				description: 'The authentication setting to use for the user',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: "The user's email address",
			},
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				default: '',
				description: "The user's display name",
			},
			{
				displayName: 'Site Role',
				name: 'siteRole',
				type: 'options',
				default: 'Viewer',
				options: [
					{ name: 'Creator', value: 'Creator' },
					{ name: 'Explorer', value: 'Explorer' },
					{ name: 'Explorer (Can Publish)', value: 'ExplorerCanPublish' },
					{ name: 'Site Administrator Creator', value: 'SiteAdministratorCreator' },
					{ name: 'Site Administrator Explorer', value: 'SiteAdministratorExplorer' },
					{ name: 'Unlicensed', value: 'Unlicensed' },
					{ name: 'Viewer', value: 'Viewer' },
				],
				description: "The user's role on the site",
			},
		],
	},
];
