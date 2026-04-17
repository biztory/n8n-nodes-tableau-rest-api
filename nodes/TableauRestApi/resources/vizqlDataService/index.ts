import type { INodeProperties } from 'n8n-workflow';
import { vizqlReadMetadataDescription } from './readMetadata';
import { vizqlQueryDatasourceDescription } from './queryDatasource';
import { vizqlGetDatasourceModelDescription } from './getDatasourceModel';
import { vizqlBuildQueryDescription } from './buildQuery';

export const vizqlDataServiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['vizqlDataService'] } },
		options: [
			{
				name: 'Build Query',
				value: 'buildQuery',
				action: 'Build a query JSON for use with query datasource',
				description:
					'Build a structured query JSON using a form UI. Fields are loaded dynamically from the datasource metadata. Output the query JSON to pass to the "Query Datasource" operation',
			},
			{
				name: 'Get Datasource Model',
				value: 'getDatasourceModel',
				action: 'Get the logical table model for a datasource',
				description:
					'Returns the logical table structure and relationships for a datasource — useful for understanding multi-table data models',
			},
			{
				name: 'Query Datasource',
				value: 'queryDatasource',
				action: 'Execute a query against a datasource',
				description:
					'Query a Tableau datasource and return the resulting rows. Provide the query JSON directly or pipe it from the "Build Query" operation.',
			},
			{
				name: 'Read Metadata',
				value: 'readMetadata',
				action: 'Read field metadata from a datasource',
				description:
					'Returns all fields in a datasource with their captions, data types, roles, and aggregation defaults. Use this before querying to discover available field names.',
			},
		],
		default: 'readMetadata',
	},
];

export const vizqlDataServiceFields: INodeProperties[] = [
	...vizqlReadMetadataDescription,
	...vizqlQueryDatasourceDescription,
	...vizqlGetDatasourceModelDescription,
	...vizqlBuildQueryDescription,
];
