export interface TableauCredentials {
	serverUrl: string;
	siteContentUrl: string;
	clientId: string;
	secretId: string;
	secretValue: string;
	username: string;
	apiVersion: string;
	scopes: string;
}

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
