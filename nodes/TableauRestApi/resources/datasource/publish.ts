import type { INodeProperties } from 'n8n-workflow';

export const datasourcePublishDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				operation: ['publish'],
				resource: ['datasource'],
			},
		},
		hint: 'Name of the binary input field that contains the data source file (.tds or .tdsx)',
		description:
			'The name of the binary property in the input item that holds the data source file to upload',
	},
	{
		displayName: 'Data Source Name',
		name: 'datasourceName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['publish'],
				resource: ['datasource'],
			},
		},
		description: 'The name to give the data source on the Tableau site',
	},
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['publish'],
				resource: ['datasource'],
			},
		},
		description: 'The LUID of the project to publish the data source into',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['publish'],
				resource: ['datasource'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A description for the data source',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description:
					"Override the file name sent to Tableau (must include .tds or .tdsx extension). Defaults to the binary field's file name.",
			},
			{
				displayName: 'Overwrite',
				name: 'overwrite',
				type: 'boolean',
				default: false,
				description:
					'Whether to replace an existing published data source that has the same name in the same project',
			},
		],
	},
];
