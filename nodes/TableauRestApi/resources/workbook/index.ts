import type { INodeProperties } from 'n8n-workflow';
import { workbookDownloadDescription } from './download';
import { workbookGetDescription } from './get';
import { workbookGetManyDescription } from './getAll';
import { workbookGetViewsDescription } from './getViews';
import { workbookPublishDescription } from './publish';
import { workbookUpdateDescription } from './update';

export const workbookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['workbook'],
			},
		},
		options: [
			{
				name: 'Download',
				value: 'download',
				action: 'Download a workbook',
				description: 'Download a workbook file (.twb or .twbx)',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a workbook',
				description: 'Get a single workbook by ID',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many workbooks',
				description: 'Get many workbooks for the site',
			},
			{
				name: 'Get Views',
				value: 'getViews',
				action: 'Get views for a workbook',
				description: 'Get all views belonging to a workbook',
			},
			{
				name: 'Publish',
				value: 'publish',
				action: 'Publish a workbook',
				description: 'Publish a workbook file (.twb or .twbx) to the site',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a workbook',
				description: 'Update the properties of a workbook',
			},
		],
		default: 'getAll',
	},
];

export const workbookFields: INodeProperties[] = [
	...workbookDownloadDescription,
	...workbookGetDescription,
	...workbookGetManyDescription,
	...workbookGetViewsDescription,
	...workbookPublishDescription,
	...workbookUpdateDescription,
];
