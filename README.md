# n8n-nodes-tableau-rest-api

This is an n8n community node. It lets you use the [Tableau Server/Cloud REST API](https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm) directly in n8n.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)



## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The **Tableau** node supports the following resources and operations:

### Authentication
| Operation | Description |
|-----------|-------------|
| Get Token | Sign in and return the authentication token, site ID, and base URL. Use the output to build custom HTTP Request nodes for Tableau REST API endpoints not yet covered by this node. |
| Sign Out | Invalidate the current token on Tableau and clear the cached token so the next Tableau node re-authenticates. |

### Workbook
| Operation | Description |
|-----------|-------------|
| Delete | Delete a workbook from the site |
| Download | Download a workbook file (`.twb` or `.twbx`) |
| Get | Get a single workbook by ID |
| Get Many | Get many workbooks for the site, with optional filtering and sorting |
| Get Views | Get all views belonging to a workbook |
| Publish | Publish a workbook file to the site |
| Refresh | Trigger an extract refresh for a workbook |
| Update | Update the properties of a workbook (name, description, project, owner, etc.) |

### View
| Operation | Description |
|-----------|-------------|
| Get | Get a single view by ID |
| Get Data | Download the underlying data of a view as CSV or parsed JSON |
| Get Image | Download a rendered PNG image of a view |
| Get Many | Get many views for the site, with optional filtering and sorting |
| Get PDF | Download a PDF export of a view |
| Get Preview Image | Download a small PNG thumbnail of a view |

### Data Source
| Operation | Description |
|-----------|-------------|
| Delete | Delete a data source from the site |
| Download | Download a data source file (`.tds` or `.tdsx`) |
| Get | Get a single data source by ID |
| Get Connections | Get all connections belonging to a data source |
| Get Many | Get many data sources for the site, with optional filtering and sorting |
| Publish | Publish a data source file to the site |
| Refresh | Trigger an extract refresh for a data source |
| Update | Update the properties of a data source (name, certification, project, owner, etc.) |

### Project
| Operation | Description |
|-----------|-------------|
| Create | Create a new project on the site |
| Delete | Delete a project from the site |
| Get Many | Get many projects for the site, with optional filtering and sorting |
| Update | Update the properties of a project (name, description, parent project, permissions, etc.) |

### Group
| Operation | Description |
|-----------|-------------|
| Add User | Add a user to a group |
| Create | Create a new local group on the site |
| Get Many | Get many groups on the site |
| Get Users in Group | Get all users belonging to a group |
| Remove User | Remove a user from a group |
| Update | Update the properties of a group |

### User
| Operation | Description |
|-----------|-------------|
| Add to Site | Add a user to the site with a specified site role |
| Get | Get a single user by ID |
| Get Many | Get many users on the site, with optional filtering and sorting |
| Remove From Site | Remove a user from the site |
| Update | Update the properties of a user (role, name, email, password, auth setting, etc.). Password update is only supported on Tableau Server with local authentication. Warning: This operation is supported in API versions `3.27` and later, only. |

### VizQL Data Service
| Operation | Description |
|-----------|-------------|
| Build Query | Build a structured query JSON using a form UI, with fields loaded dynamically from datasource metadata. Outputs the query to pass to Query Datasource. |
| Get Datasource Model | Return the logical table structure and relationships for a datasource |
| Query Datasource | Execute a query against a Tableau datasource and return the resulting rows |
| Read Metadata | Return all fields in a datasource with their captions, data types, roles, and aggregation defaults |

## Compatibility

Tested and supported starting with n8n version **2.13.3**.

The node uses Tableau REST API version **3.24** by default, which is compatible with Tableau Cloud and Tableau Server 2024.2+. The API version is configurable in the credentials. Refer to the Tableau REST API documentation to identify the correct versions and scope(s) to use for your usage.

## Usage

### Setting up credentials

The node supports two authentication methods. Select the one that fits your use case on the **Authentication** dropdown of the Tableau node, then create the matching credential type.

#### Connected App (JWT)

Connected Apps authenticate by signing a short-lived JWT with a secret you generate in Tableau. This is the recommended method when you need concurrent workflow executions or fine-grained scope control.

To set up:

1. In Tableau, go to **Settings > Connected Apps** and create a new Connected App with **Direct Trust** enabled.
2. Generate a secret and copy the **Client ID**, **Secret ID**, and **Secret Value**.
3. In n8n, create a new **Tableau Connected App API** credential and fill in:
   - **Server URL** — the base URL of your Tableau Server or Tableau Cloud instance (e.g. `https://10ax.online.tableau.com`)
   - **Site Content URL** — the part after `/site/` in your site's browser URL. Leave empty for the default site.
   - **Connected App Client ID**, **Secret ID**, and **Secret Value** — from the Connected App you created.
   - **Username** — the default Tableau username (email address) the node will act as. Individual nodes can override this to impersonate a different user — see [Impersonating users](#impersonating-users).
   - **API Version** — defaults to `3.24`. Change only if you need a specific version.
   - **Scopes** — comma-separated JWT scopes (e.g. `tableau:content:read,tableau:content:write`). Defaults to `tableau:content:read`.

Considerations:
- Connected Apps require Tableau Server 2022.1+ or Tableau Cloud. Some administrative operations on Tableau Server may require a non-scoped session and will not work with a Connected App token; use a Personal Access Token in those cases.
- Supports concurrent workflow executions without interference.
- Supports impersonation.

For more details see the [Tableau Connected Apps documentation](https://help.tableau.com/current/online/en-us/connected_apps_direct.htm).

#### Personal Access Token (PAT)

Personal Access Tokens are long-lived tokens you create directly in your Tableau account settings. They are compatible with all Tableau REST API endpoints on both Tableau Server and Tableau Cloud.

To set up:

1. In Tableau, go to your account settings and create a new Personal Access Token. Copy the **Token Name** and **Token Secret** shown at creation time — the secret is not shown again.
2. In n8n, create a new **Tableau Personal Access Token API** credential and fill in:
   - **Server URL** — the base URL of your Tableau Server or Tableau Cloud instance.
   - **Site Content URL** — the part after `/site/` in your site's browser URL. Leave empty for the default site.
   - **Personal Access Token Name** and **Personal Access Token Secret** — from the token you created.
   - **API Version** — defaults to `3.24`.

Considerations:
- **PATs do not support concurrent use.** Signing in with a PAT invalidates any existing session for that token. If multiple workflow executions run simultaneously using the same PAT, they will interfere with each other — each new sign-in will invalidate the previous one, causing the earlier execution to fail mid-run. Use a Connected App if your workflows run concurrently.
- PATs have a configurable maximum age and expire automatically. Rotate them as needed in your Tableau account settings.
- Does not support impersonation.

For more details see the [Tableau Personal Access Tokens documentation](https://help.tableau.com/current/online/en-us/security_personal_access_tokens.htm).

#### Choosing between the two

| | Connected App | Personal Access Token |
|---|---|---|
| Setup complexity | Requires a Connected App configured by an admin | Self-service in account settings |
| Concurrent workflow executions | Yes | No — concurrent sign-ins invalidate each other |
| Compatible with all REST API endpoints | Most (some admin operations on Tableau Server may require a non-scoped session) | Yes |
| Fine-grained scope control | Yes | No |
| Impersonation | Yes | No |
| Tableau Cloud | Yes | Yes |
| Tableau Server | 2022.1+ | All supported versions |

### Impersonating users

When using **Connected App (JWT)** authentication, Connected Apps are designed to let a site administrator act on behalf of any user on the site. The credential's **Username** field sets the default user, but you can override it per node using the **Impersonate User** field that appears directly below the **Authentication** dropdown.

This lets a single credential power workflows that touch content as multiple users — for example, downloading views as each member of a team, or performing actions on behalf of a specific content owner.

The **Impersonate User** field supports [n8n expressions](https://docs.n8n.io/code/expressions/), so you can set it dynamically from upstream data (e.g. loop over a list of usernames and impersonate each one in turn).

A few things to be aware of:

- **Requires site admin privileges.** The Connected App must be created by a Tableau Server administrator or Tableau Cloud site administrator. Only a site admin can issue tokens on behalf of other users.
- **Scopes still apply.** The impersonated session is limited by the scopes configured on the credential. Expand the scopes (e.g. add `tableau:content:write`) if the impersonated user needs to perform write operations.
- **Separate token per user.** Each distinct impersonated username gets its own cached token within a workflow run, so switching between users in a single execution is safe.
- **Security.** Whoever has access to the Connected App credential in n8n can impersonate any Tableau user. Share the credential only with users who should have that level of access. Use n8n's project-based access control to scope credential visibility appropriately.

This field is not available when using **Personal Access Token** authentication, as PATs always authenticate as the token owner.

### Authentication token caching

The node automatically caches the authentication token for the duration of its validity and reuses it across multiple operations in the same workflow run. You do not need to manage tokens manually for most use cases.

Use the **Authentication > Get Token** operation if you need to pass a token to a downstream **HTTP Request** node to call Tableau REST API endpoints not yet supported by this node.

### Working with binary data

The **Download** operations (Workbook, Data Source, View image/PDF) and the **Publish** operations return or consume binary data. Make sure to use an **n8n binary-aware node** (such as Read/Write Binary File) in conjunction with these operations.

### Filtering and pagination

**Get Many** operations support:
- **Filters** — narrow results by name, owner, project, tags, or date fields.
- **Sort** — order results by a field in ascending or descending order.
- **Return All** — toggle to automatically paginate through all results, or set a fixed **Limit**.

### VizQL Data Service

The VizQL Data Service resource provides programmatic access to query Tableau datasources directly, bypassing the need for a published view. A typical workflow looks like:

1. Use **Read Metadata** to discover the available fields in a datasource.
2. Use **Build Query** to construct the query JSON interactively (fields are loaded dynamically from the datasource).
3. Pass the query JSON output to **Query Datasource** to retrieve the data rows.

_New to n8n? [Try it out](https://docs.n8n.io/try-it-out/) to get started and learn the basics._

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Tableau REST API reference](https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm)
* [Tableau Connected Apps (JWT auth) documentation](https://help.tableau.com/current/online/en-us/connected_apps_direct.htm)
* [Tableau Personal Access Tokens documentation](https://help.tableau.com/current/online/en-us/security_personal_access_tokens.htm)
* [Tableau VizQL Data Service documentation](https://help.tableau.com/current/api/vizql-data-service/en-us/index.html)
