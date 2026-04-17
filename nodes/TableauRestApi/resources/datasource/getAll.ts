import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDatasourceGetMany = {
	operation: ['getAll'],
	resource: ['datasource'],
};

export const datasourceGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForDatasourceGetMany,
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
				...showOnlyForDatasourceGetMany,
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
			show: showOnlyForDatasourceGetMany,
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
			show: showOnlyForDatasourceGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by data source name (exact match)',
			},
			{
				displayName: 'Owner Name',
				name: 'ownerName',
				type: 'string',
				default: '',
				description: 'Filter by the name of the data source owner',
			},
			{
				displayName: 'Project Name',
				name: 'projectName',
				type: 'string',
				default: '',
				description: 'Filter by the project name the data source belongs to',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Filter by tag (exact match on a single tag)',
			},
			{
				displayName: 'Updated After',
				name: 'updatedAfter',
				type: 'dateTime',
				default: '',
				description: 'Return only data sources updated at or after this time',
			},
		],
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		placeholder: 'Add Sort',
		displayOptions: {
			show: showOnlyForDatasourceGetMany,
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
							{ name: 'Name', value: 'name' },
							{ name: 'Owner Name', value: 'ownerName' },
							{ name: 'Project Name', value: 'projectName' },
							{ name: 'Updated At', value: 'updatedAt' },
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
