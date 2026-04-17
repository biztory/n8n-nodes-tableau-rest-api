import type { INodeProperties } from 'n8n-workflow';
import { vizqlConnectionsProperty } from './shared';

export const vizqlReadMetadataDescription: INodeProperties[] = [
	{
		displayName: 'Datasource ID',
		name: 'datasourceLuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['readMetadata'] } },
		description: 'The LUID of the datasource to read field metadata from',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['vizqlDataService'], operation: ['readMetadata'] } },
		options: [
			{
				displayName: 'Bypass Metadata Cache',
				name: 'bypassMetadataCache',
				type: 'boolean',
				default: false,
				description: 'Whether to bypass the metadata cache and fetch fresh metadata from the datasource',
			},
			{
				displayName: 'Include Group Formulas',
				name: 'includeGroupFormulas',
				type: 'boolean',
				default: false,
				description: 'Whether to include group formula fields in the metadata response',
			},
			{
				displayName: 'Include Hidden Fields',
				name: 'includeHiddenFields',
				type: 'boolean',
				default: false,
				description: 'Whether to include fields that are hidden in the datasource',
			},
			{
				displayName: 'Interpret Field Captions As Field Names',
				name: 'interpretFieldCaptionsAsFieldNames',
				type: 'boolean',
				default: false,
				description: 'Whether field captions are treated as field names in query operations',
			},
		],
	},
	vizqlConnectionsProperty(['readMetadata']),
];
