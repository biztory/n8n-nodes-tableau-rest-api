import type { INodeProperties } from 'n8n-workflow';
import { vizqlConnectionsProperty } from './shared';

export const vizqlGetDatasourceModelDescription: INodeProperties[] = [
	{
		displayName: 'Datasource ID',
		name: 'datasourceLuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['vizqlDataService'], operation: ['getDatasourceModel'] },
		},
		description: 'The LUID of the datasource to retrieve the model for',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['vizqlDataService'], operation: ['getDatasourceModel'] },
		},
		options: [
			{
				displayName: 'Bypass Metadata Cache',
				name: 'bypassMetadataCache',
				type: 'boolean',
				default: false,
				description: 'Whether to bypass the metadata cache and fetch fresh model data',
			},
		],
	},
	vizqlConnectionsProperty(['getDatasourceModel']),
];
