import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGroupGetUsers = {
	operation: ['getUsersInGroup'],
	resource: ['group'],
};

export const groupGetUsersInGroupDescription: INodeProperties[] = [
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForGroupGetUsers,
		},
		description: 'The ID of the group whose users to retrieve',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForGroupGetUsers,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForGroupGetUsers,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];
