import type { INodeProperties } from 'n8n-workflow';

const SITE_ROLE_OPTIONS = [
	{ name: 'Creator', value: 'Creator' },
	{ name: 'Explorer', value: 'Explorer' },
	{ name: 'Explorer (Can Publish)', value: 'ExplorerCanPublish' },
	{ name: 'Site Administrator Creator', value: 'SiteAdministratorCreator' },
	{ name: 'Site Administrator Explorer', value: 'SiteAdministratorExplorer' },
	{ name: 'Unlicensed', value: 'Unlicensed' },
	{ name: 'Viewer', value: 'Viewer' },
];

export const userAddDescription: INodeProperties[] = [
	{
		displayName: 'Username',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['add'],
				resource: ['user'],
			},
		},
		description: "The user's sign-in name",
	},
	{
		displayName: 'Site Role',
		name: 'siteRole',
		type: 'options',
		required: true,
		default: 'Viewer',
		displayOptions: {
			show: {
				operation: ['add'],
				resource: ['user'],
			},
		},
		options: SITE_ROLE_OPTIONS,
		description: "The role to assign to the user on the site",
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['add'],
				resource: ['user'],
			},
		},
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
		],
	},
];
