import type { INodeProperties } from 'n8n-workflow';

export const groupCreateDescription: INodeProperties[] = [
	{
		displayName: 'Group Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['group'],
			},
		},
		description: 'The name for the new group',
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
				resource: ['group'],
			},
		},
		options: [
			{
				displayName: 'Minimum Site Role',
				name: 'minimumSiteRole',
				type: 'options',
				default: 'Unlicensed',
				options: [
					{ name: 'Creator', value: 'Creator' },
					{ name: 'Explorer', value: 'Explorer' },
					{ name: 'Explorer (Can Publish)', value: 'ExplorerCanPublish' },
					{ name: 'Site Administrator Creator', value: 'SiteAdministratorCreator' },
					{ name: 'Site Administrator Explorer', value: 'SiteAdministratorExplorer' },
					{ name: 'Unlicensed', value: 'Unlicensed' },
					{ name: 'Viewer', value: 'Viewer' },
				],
				description:
					'The minimum site role to grant users who are part of this group. Users with a lower role will be upgraded to this role when added.',
			},
		],
	},
];
