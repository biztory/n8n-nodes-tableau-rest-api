import type { INodeProperties } from 'n8n-workflow';

export const vizqlConnectionsProperty = (operations: string[]): INodeProperties => ({
	displayName: 'Connections',
	name: 'connections',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	placeholder: 'Add Connection',
	default: {},
	displayOptions: { show: { resource: ['vizqlDataService'], operation: operations } },
	description:
		'Optional connection credentials for live datasources with multiple connections. Omit for most extract-based datasources.',
	options: [
		{
			displayName: 'Connection',
			name: 'connection',
			values: [
				{
					displayName: 'Connection ID',
					name: 'connectionLuid',
					type: 'string',
					default: '',
					description:
						'LUID of the connection. Required when the datasource has multiple connections.',
				},
				{
					displayName: 'Username',
					name: 'connectionUsername',
					type: 'string',
					default: '',
					description: 'Username for the database connection',
				},
				{
					displayName: 'Password',
					name: 'connectionPassword',
					type: 'string',
					typeOptions: { password: true },
					default: '',
					description: 'Password for the database connection',
				},
			],
		},
	],
});
