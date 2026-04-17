import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGroupGetMany = {
	operation: ['getAll'],
	resource: ['group'],
};

export const groupGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForGroupGetMany,
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
				...showOnlyForGroupGetMany,
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
			show: showOnlyForGroupGetMany,
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
			show: showOnlyForGroupGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by group name (exact match)',
			},
		],
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		placeholder: 'Add Sort',
		displayOptions: {
			show: showOnlyForGroupGetMany,
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
