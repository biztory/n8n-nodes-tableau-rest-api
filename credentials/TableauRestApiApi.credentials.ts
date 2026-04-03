import type { ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class TableauRestApiApi implements ICredentialType {
	name = 'tableauRestApiApi';

	displayName = 'Tableau REST API';

	icon: Icon = 'file:../icons/tableau.svg';

	documentationUrl =
		'https://help.tableau.com/current/online/en-us/connected_apps_direct.htm';

	// Tests server connectivity and that the API version is valid.
	// Full JWT auth is verified on first use — JWT errors surface with
	// descriptive messages via the TABLEAU_ERROR_GUIDANCE map in transport.ts.
	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.serverUrl.replace(/\\/+$/, "") + "/api/" + $credentials.apiVersion + "/serverinfo"}}',
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://10ax.online.tableau.com',
			description:
				'The URL of your Tableau Server or Tableau Cloud site (e.g. https://10ax.online.tableau.com)',
		},
		{
			displayName: 'Site Content URL',
			name: 'siteContentUrl',
			type: 'string',
			default: '',
			placeholder: 'my-site',
			description:
				'The content URL of the site (the value after /site/ in the URL). Leave empty for the default site.',
		},
		{
			displayName: 'Connected App Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Client ID of the Tableau Connected App',
		},
		{
			displayName: 'Connected App Secret ID',
			name: 'secretId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Secret ID (key identifier) generated for the Connected App',
		},
		{
			displayName: 'Connected App Secret Value',
			name: 'secretValue',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The Secret Value used to sign the JWT',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'user@example.com',
			description: 'The Tableau username (email) to authenticate as',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: '3.24',
			description: 'The Tableau REST API version to use',
		},
		{
			displayName: 'Scopes',
			name: 'scopes',
			type: 'string',
			default: 'tableau:content:read',
			description:
				'Comma-separated list of scopes for the JWT (e.g. tableau:content:read)',
		},
	];
}
