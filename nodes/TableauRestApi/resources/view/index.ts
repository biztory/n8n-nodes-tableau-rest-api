import type { INodeProperties } from 'n8n-workflow';
import { viewGetDescription } from './get';
import { viewGetManyDescription } from './getAll';
import {
	viewGetDataDescription,
	viewGetImageDescription,
	viewGetPdfDescription,
	viewGetPreviewImageDescription,
} from './download';

export const viewOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['view'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a view',
				description: 'Get a single view by ID',
			},
			{
				name: 'Get Data',
				value: 'getData',
				action: 'Get view data',
				description: 'Download the underlying data of a view as CSV',
			},
			{
				name: 'Get Image',
				value: 'getImage',
				action: 'Get view image',
				description: 'Download a rendered PNG image of a view',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many views',
				description: 'Get many views for the site',
			},
			{
				name: 'Get PDF',
				value: 'getPdf',
				action: 'Get view PDF',
				description: 'Download a PDF export of a view',
			},
			{
				name: 'Get Preview Image',
				value: 'getPreviewImage',
				action: 'Get view preview image',
				description: 'Download a small PNG thumbnail of a view',
			},
		],
		default: 'getAll',
	},
];

export const viewFields: INodeProperties[] = [
	...viewGetDescription,
	...viewGetDataDescription,
	...viewGetImageDescription,
	...viewGetManyDescription,
	...viewGetPdfDescription,
	...viewGetPreviewImageDescription,
];
