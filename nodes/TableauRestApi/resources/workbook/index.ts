import type { INodeProperties } from 'n8n-workflow';
import { workbookGetManyDescription } from './getAll';
import { workbookGetDescription } from './get';
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
	...workbookGetDescription,
	...workbookGetManyDescription,
	...workbookUpdateDescription,
];
