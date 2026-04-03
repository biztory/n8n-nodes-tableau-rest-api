import type { INodeProperties } from 'n8n-workflow';

export const groupUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['group'],
			},
		},
		description: 'The ID of the group to update',
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
				resource: ['group'],
			},
		},
		description: 'Fields to update on the group',
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
				description: 'The minimum site role granted to users in this group',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The new name for the group',
			},
		],
	},
];
