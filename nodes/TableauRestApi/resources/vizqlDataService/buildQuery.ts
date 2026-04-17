import type { INodeProperties } from 'n8n-workflow';

export const vizqlBuildQueryDescription: INodeProperties[] = [
	{
		displayName: 'Datasource ID',
		name: 'datasourceLuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['buildQuery'] } },
		description:
			'The LUID of the datasource — used to load available fields in the dropdowns below',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['buildQuery'] } },
		description: 'Fields to include in the query result',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Aggregation Function',
						name: 'function',
						type: 'options',
						default: '',
						options: [
							{ name: '(None / Use Default)', value: '' },
							{ name: 'AVG', value: 'AVG' },
							{ name: 'COUNT', value: 'COUNT' },
							{ name: 'COUNTD', value: 'COUNTD' },
							{ name: 'MAX', value: 'MAX' },
							{ name: 'MEDIAN', value: 'MEDIAN' },
							{ name: 'MIN', value: 'MIN' },
							{ name: 'SUM', value: 'SUM' },
						],
						description: 'Aggregation to apply to a measure field. Leave empty to use the field\'s default aggregation.',
					},
					{
						displayName: 'Field Alias',
						name: 'fieldAlias',
						type: 'string',
						default: '',
						description: 'Optional alias name for this field in the output',
					},
					{
						displayName: 'Field Name or ID',
						name: 'fieldCaption',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getVizqlFields' },
						default: '',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Sort Direction',
						name: 'sortDirection',
						type: 'options',
						default: '',
						options: [
							{ name: '(None)', value: '' },
							{ name: 'Ascending', value: 'ASC' },
							{ name: 'Descending', value: 'DESC' },
						],
						description: 'Sort direction for this field',
					},
					{
						displayName: 'Sort Priority',
						name: 'sortPriority',
						type: 'number',
						default: 0,
						description:
							'Sort priority when sorting by multiple fields. Lower numbers sort first. Use 0 to omit.',
					},
				],
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['buildQuery'] } },
		description: 'Filters to apply to the query. Only one filter per field is allowed.',
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldCaption',
						type: 'options',
						typeOptions: { loadOptionsMethod: 'getVizqlFields' },
						default: '',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Filter Type',
						name: 'filterType',
						type: 'options',
						default: 'SET',
						options: [
							{
								name: 'Match (String)',
								value: 'MATCH',
								description: 'Filter by string prefix, suffix, or substring',
							},
							{
								name: 'Quantitative — Date Range',
								value: 'QUANTITATIVE_DATE',
								description: 'Filter a date dimension by min/max range (RFC 3339 dates)',
							},
							{
								name: 'Quantitative — Numerical Range',
								value: 'QUANTITATIVE_NUMERICAL',
								description: 'Filter a numeric measure by min/max range',
							},
							{
								name: 'Set (Include/Exclude Values)',
								value: 'SET',
								description: 'Filter to a specific set of values',
							},
							{
								name: 'Top / Bottom N',
								value: 'TOP',
								description: 'Keep the top or bottom N values by a measure',
							},
						],
						description: 'Type of filter to apply',
					},
					{
						displayName: 'Match Type',
						name: 'matchType',
						type: 'options',
						default: 'contains',
						options: [
							{ name: 'Contains', value: 'contains' },
							{ name: 'Ends With', value: 'endsWith' },
							{ name: 'Starts With', value: 'startsWith' },
						],
						description: '<b>MATCH filters</b>: type of string match',
					},
					{
						displayName: 'Match Value',
						name: 'matchValue',
						type: 'string',
						default: '',
						description: '<b>MATCH filters</b>: the string to match against',
					},
					{
						displayName: 'Max',
						name: 'max',
						type: 'string',
						default: '',
						description:
							'<b>QUANTITATIVE_NUMERICAL</b>: maximum numeric value. <b>QUANTITATIVE_DATE</b>: end date in RFC 3339 format. Leave blank for no upper bound.',
					},
					{
						displayName: 'Min',
						name: 'min',
						type: 'string',
						default: '',
						description:
							'<b>QUANTITATIVE_NUMERICAL</b>: minimum numeric value. <b>QUANTITATIVE_DATE</b>: start date in RFC 3339 format (e.g. 2023-01-01). Leave blank for no lower bound.',
					},
					{
						displayName: 'N',
						name: 'n',
						type: 'number',
						default: 10,
						description: '<b>TOP filters</b>: number of top or bottom records to return',
					},
					{
						displayName: 'Top/Bottom',
						name: 'filterOperation',
						type: 'options',
						default: 'topn',
						options: [
							{ name: 'Top N', value: 'topn' },
							{ name: 'Bottom N', value: 'bottomn' },
						],
						description: '<b>TOP filters</b>: keep the top or bottom N records',
					},
					{
						displayName: 'Values',
						name: 'values',
						type: 'string',
						default: '[]',
						description:
							'<b>SET filters</b>: JSON array of values to include, e.g. ["West", "East"]. Use an empty array [] to exclude all values.',
					},
				],
			},
		],
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Parameter',
		default: {},
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['buildQuery'] } },
		description: 'Override datasource parameter values to pass to the query',
		options: [
			{
				displayName: 'Parameter',
				name: 'parameter',
				values: [
					{
						displayName: 'Parameter Name',
						name: 'parameterName',
						type: 'string',
						default: '',
						description: 'Name of the datasource parameter to override',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to set for this parameter',
					},
				],
			},
		],
	},
];
