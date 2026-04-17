import type { IDataObject, INodeProperties } from 'n8n-workflow';

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function parseCsvLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
			else { inQuotes = !inQuotes; }
		} else if (ch === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += ch;
		}
	}
	result.push(current);
	return result;
}

export function parseCsvToJson(buffer: Buffer): IDataObject[] {
	const lines = buffer.toString('utf-8').split(/\r?\n/);
	if (lines.length < 2) return [];
	const headers = parseCsvLine(lines[0]);
	const rows: IDataObject[] = [];
	for (let i = 1; i < lines.length; i++) {
		if (!lines[i].trim()) continue;
		const values = parseCsvLine(lines[i]);
		const obj: IDataObject = {};
		headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
		rows.push(obj);
	}
	return rows;
}

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** Builds the vf_<fieldname>=value query parameters from the filters collection. */
export function buildVfFilters(
	filters: IDataObject,
): IDataObject {
	const qs: IDataObject = {};
	const entries = (filters.filter as Array<{ fieldName: string; value: string }>) ?? [];
	for (const { fieldName, value } of entries) {
		if (fieldName) {
			qs[`vf_${fieldName}`] = value;
		}
	}
	return qs;
}

const vfFiltersProperty = (operations: string[]): INodeProperties => ({
	displayName: 'Variable Filters',
	name: 'vfFilters',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	placeholder: 'Add Filter',
	default: {},
	displayOptions: { show: { resource: ['view'], operation: operations } },
	description:
		'Filter view data using vf_<fieldname>=value query parameters. ' +
		'Field names must match columns in the underlying data source.',
	options: [
		{
			displayName: 'Filter',
			name: 'filter',
			values: [
				{
					displayName: 'Field Name',
					name: 'fieldName',
					type: 'string',
					default: '',
					placeholder: 'e.g. Region',
					description: 'The name of the field to filter on',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					placeholder: 'e.g. West',
					description: 'The filter value',
				},
			],
		},
	],
});

// ---------------------------------------------------------------------------
// Query View Data  (CSV)
// ---------------------------------------------------------------------------

export const viewGetDataDescription: INodeProperties[] = [
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['view'], operation: ['getData'] } },
		description: 'The ID of the view to export data from',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['view'], operation: ['getData'] } },
		options: [
			{
				displayName: 'Max Age (Minutes)',
				name: 'maxAge',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 1 },
				description:
					'Maximum age of the cached result in minutes. Omit to always use the latest data.',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'binary',
				options: [
					{ name: 'Binary File (CSV)', value: 'binary' },
					{ name: 'JSON (Parsed Rows)', value: 'json' },
				],
				description:
					'How to return the data. Choose "JSON" when this node is used as a tool by an AI agent.',
			},
		],
	},
	vfFiltersProperty(['getData']),
];

// ---------------------------------------------------------------------------
// Query View Image  (PNG)
// ---------------------------------------------------------------------------

export const viewGetImageDescription: INodeProperties[] = [
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['view'], operation: ['getImage'] } },
		description: 'The ID of the view to render as an image',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['view'], operation: ['getImage'] } },
		options: [
			{
				displayName: 'Max Age (Minutes)',
				name: 'maxAge',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 1 },
				description: 'Maximum age of the cached image in minutes',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'binary',
				options: [
					{ name: 'Binary File (PNG)', value: 'binary' },
					{ name: 'Base64 String', value: 'base64' },
				],
				description:
					'How to return the image. Choose "Base64" when this node is used as a tool by an AI agent.',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				default: 'standard',
				options: [
					{ name: 'Standard', value: 'standard' },
					{ name: 'High', value: 'high' },
				],
				description: 'Image resolution — High doubles the pixel density',
			},
		],
	},
	vfFiltersProperty(['getImage']),
];

// ---------------------------------------------------------------------------
// Query View PDF  (PDF)
// ---------------------------------------------------------------------------

export const viewGetPdfDescription: INodeProperties[] = [
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['view'], operation: ['getPdf'] } },
		description: 'The ID of the view to export as a PDF',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['view'], operation: ['getPdf'] } },
		options: [
			{
				displayName: 'Max Age (Minutes)',
				name: 'maxAge',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 1 },
				description: 'Maximum age of the cached PDF in minutes',
			},
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				default: 'Portrait',
				options: [
					{ name: 'Landscape', value: 'Landscape' },
					{ name: 'Portrait', value: 'Portrait' },
				],
				description: 'Page orientation of the exported PDF',
			},
			{
				displayName: 'Paper Size',
				name: 'type',
				type: 'options',
				default: 'Letter',
				options: [
					{ name: 'A3', value: 'A3' },
					{ name: 'A4', value: 'A4' },
					{ name: 'A5', value: 'A5' },
					{ name: 'B5', value: 'B5' },
					{ name: 'Executive', value: 'Executive' },
					{ name: 'Folio', value: 'Folio' },
					{ name: 'Ledger', value: 'Ledger' },
					{ name: 'Legal', value: 'Legal' },
					{ name: 'Letter', value: 'Letter' },
					{ name: 'Note', value: 'Note' },
					{ name: 'Quarto', value: 'Quarto' },
					{ name: 'Tabloid', value: 'Tabloid' },
				],
				description: 'Paper size of the exported PDF',
			},
		],
	},
	vfFiltersProperty(['getPdf']),
];

// ---------------------------------------------------------------------------
// Query View Preview Image  (PNG thumbnail)
// ---------------------------------------------------------------------------

export const viewGetPreviewImageDescription: INodeProperties[] = [
	{
		displayName: 'View ID',
		name: 'viewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['view'], operation: ['getPreviewImage'] },
		},
		description: 'The ID of the view to retrieve a preview thumbnail for',
	},
];
