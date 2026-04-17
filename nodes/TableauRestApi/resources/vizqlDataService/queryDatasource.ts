import type { INodeProperties } from 'n8n-workflow';
import { vizqlConnectionsProperty } from './shared';

export const vizqlQueryDatasourceDescription: INodeProperties[] = [
	{
		displayName: 'Datasource ID',
		name: 'datasourceLuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['queryDatasource'] } },
		description: 'The LUID of the datasource to query',
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'json',
		required: true,
		default: '{\n  "fields": [\n    { "fieldCaption": "Category" }\n  ]\n}',
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['queryDatasource'] } },
		description:
			'The query object specifying fields, filters, and parameters. Use the "Build Query" operation to generate this, or pass the output of a previous Build Query step directly.',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['queryDatasource'] } },
		options: [
			{
				displayName: 'Bypass Metadata Cache',
				name: 'bypassMetadataCache',
				type: 'boolean',
				default: false,
				description: 'Whether to bypass the metadata cache and fetch fresh metadata',
			},
			{
				displayName: 'Disaggregate',
				name: 'disaggregate',
				type: 'boolean',
				default: false,
				description:
					'Whether to disaggregate measures (return unaggregated row-level data instead of grouped aggregates)',
			},
			{
				displayName: 'Return Format',
				name: 'returnFormat',
				type: 'options',
				default: 'OBJECTS',
				options: [
					{
						name: 'Objects (Default)',
						value: 'OBJECTS',
						description: 'Return each row as a key/value object',
					},
					{
						name: 'Arrays',
						value: 'ARRAYS',
						description: 'Return rows as arrays of values (more compact)',
					},
				],
				description: 'Format of the rows in the response',
			},
			{
				displayName: 'Row Limit',
				name: 'rowLimit',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 1 },
				description:
					'Maximum number of rows to return. Does not improve query performance — use to limit output size. Leave at 0 for no limit.',
			},
		],
	},
	vizqlConnectionsProperty(['queryDatasource']),
];
