import type { INodeProperties } from 'n8n-workflow';

export const authOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['auth'],
			},
		},
		options: [
			{
				name: 'Get Token',
				value: 'getToken',
				action: 'Get an authentication token',
				description:
					'Sign in and return the authentication token, site ID, and base URL. ' +
					'Use the output fields to build custom HTTP Request nodes that call ' +
					'Tableau REST API endpoints not yet supported by this node.',
			},
			{
				name: 'Sign Out',
				value: 'signOut',
				action: 'Sign out',
				description:
					'Invalidate the current authentication token on Tableau and clear the ' +
					'cached token so that the next Tableau node in this workflow re-authenticates.',
			},
		],
		default: 'getToken',
	},
];
