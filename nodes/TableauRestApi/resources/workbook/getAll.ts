import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWorkbookGetMany = {
	operation: ['getAll'],
	resource: ['workbook'],
};

export const workbookGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForWorkbookGetMany,
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
				...showOnlyForWorkbookGetMany,
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
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: showOnlyForWorkbookGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Created After',
				name: 'createdAfter',
				type: 'dateTime',
				default: '',
				description: 'Return only workbooks created at or after this time',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by workbook name (exact match)',
			},
			{
				displayName: 'Owner Name',
				name: 'ownerName',
				type: 'string',
				default: '',
				description: 'Filter by the name of the workbook owner',
			},
			{
				displayName: 'Project Name',
				name: 'projectName',
				type: 'string',
				default: '',
				description: 'Filter by the project name the workbook belongs to',
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
				description: 'Return only workbooks updated at or after this time',
			},
		],
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		placeholder: 'Add Sort',
		displayOptions: {
			show: showOnlyForWorkbookGetMany,
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
							{ name: 'Created At', value: 'createdAt' },
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
