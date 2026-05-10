export interface TableauConnectedAppCredentials {
	authMethod: 'connectedApp';
	serverUrl: string;
	siteContentUrl: string;
	clientId: string;
	secretId: string;
	secretValue: string;
	username: string;
	apiVersion: string;
	scopes: string;
}

export interface TableauPatCredentials {
	authMethod: 'pat';
	serverUrl: string;
	siteContentUrl: string;
	patName: string;
	patSecret: string;
	apiVersion: string;
}

export type TableauCredentials = TableauConnectedAppCredentials | TableauPatCredentials;

export interface TableauAuthToken {
	token: string;
	siteId: string;
	expiresAt: number;
}

export interface TableauPagination {
	pageNumber: string;
	pageSize: string;
	totalAvailable: string;
}
