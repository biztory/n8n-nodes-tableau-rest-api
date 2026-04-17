import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUserGetMany = {
	operation: ['getAll'],
	resource: ['user'],
};

export const userGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForUserGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForUserGetMany,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: showOnlyForUserGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: false,
				description: 'Whether to return a simplified version of the response instead of the full data',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: showOnlyForUserGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Last Login After',
				name: 'lastLoginAfter',
				type: 'dateTime',
				default: '',
				description: 'Return only users who last logged in at or after this time',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by username (exact match)',
			},
			{
				displayName: 'Site Role',
				name: 'siteRole',
				type: 'options',
				default: '',
				options: [
					{ name: 'Any', value: '' },
					{ name: 'Creator', value: 'Creator' },
					{ name: 'Explorer', value: 'Explorer' },
					{ name: 'Explorer (Can Publish)', value: 'ExplorerCanPublish' },
					{ name: 'Read Only', value: 'ReadOnly' },
					{ name: 'Server Administrator', value: 'ServerAdministrator' },
					{ name: 'Site Administrator Creator', value: 'SiteAdministratorCreator' },
					{ name: 'Site Administrator Explorer', value: 'SiteAdministratorExplorer' },
					{ name: 'Unlicensed', value: 'Unlicensed' },
					{ name: 'Viewer', value: 'Viewer' },
				],
				description: 'Filter by site role',
			},
		],
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		placeholder: 'Add Sort',
		displayOptions: {
			show: showOnlyForUserGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Sort Rule',
				name: 'sortRule',
				values: [
					{
						displayName: 'Field',
						name: 'field',
						type: 'options',
						options: [
							{ name: 'Last Login', value: 'lastLogin' },
							{ name: 'Name', value: 'name' },
							{ name: 'Site Role', value: 'siteRole' },
						],
						default: 'name',
						description: 'The field to sort by',
					},
					{
						displayName: 'Direction',
						name: 'direction',
						type: 'options',
						options: [
							{ name: 'Ascending', value: 'asc' },
							{ name: 'Descending', value: 'desc' },
						],
						default: 'asc',
						description: 'The sort direction',
					},
				],
			},
		],
	},
];
