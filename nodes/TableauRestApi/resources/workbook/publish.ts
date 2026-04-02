import type { INodeProperties } from 'n8n-workflow';

export const workbookPublishDescription: INodeProperties[] = [
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				operation: ['publish'],
				resource: ['workbook'],
			},
		},
		hint: 'Name of the binary input field that contains the workbook file (.twb or .twbx)',
		description:
			'The name of the binary property in the input item that holds the workbook file to upload',
	},
	{
		displayName: 'Workbook Name',
		name: 'workbookName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['publish'],
				resource: ['workbook'],
			},
		},
		description: 'The name to give the workbook on the Tableau site',
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
				resource: ['workbook'],
			},
		},
		description: 'The LUID of the project to publish the workbook into',
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
				resource: ['workbook'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A description for the workbook',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description:
					'Override the file name sent to Tableau (must include .twb or .twbx extension). Defaults to the binary field\'s file name.',
			},
			{
				displayName: 'Overwrite',
				name: 'overwrite',
				type: 'boolean',
				default: false,
				description:
					'Whether to replace an existing published workbook that has the same name in the same project',
			},
			{
				displayName: 'Show Tabs',
				name: 'showTabs',
				type: 'boolean',
				default: false,
				description:
					'Whether to show sheet tabs on the published workbook. When false, the workbook is presented as a single view.',
			},
		],
	},
];
