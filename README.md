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

The node uses Tableau REST API version **3.24** by default, which is compatible with Tableau Cloud and Tableau Server 2024.2+. The API version is configurable in the credentials.

## Usage

### Setting up credentials

This node authenticates using a **Tableau Connected App** with JWT (JSON Web Token) authentication. To set this up:

1. In Tableau, go to **Settings > Connected Apps** and create a new Connected App with direct trust enabled.
2. Generate a secret for the Connected App and copy the **Client ID**, **Secret ID**, and **Secret Value**.
3. In n8n, create a new **Tableau REST API** credential and fill in:
   - **Server URL** — the base URL of your Tableau Server or Tableau Cloud instance (e.g. `https://10ax.online.tableau.com`)
   - **Site Content URL** — the content URL of your site (the part after `/site/` in the browser URL). Leave empty for the default site.
   - **Connected App Client ID**, **Secret ID**, and **Secret Value** — from the Connected App you created.
   - **Username** — the Tableau username (email address) the node will act as.
   - **API Version** — defaults to `3.24`. Change this only if you need to target a specific Tableau REST API version.
   - **Scopes** — the JWT scopes to request, as a comma-separated list (e.g. `tableau:content:read,tableau:content:write`). Defaults to `tableau:content:read`.

For more information on setting up Connected Apps, see the [Tableau Connected Apps documentation](https://help.tableau.com/current/online/en-us/connected_apps_direct.htm).

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
* [Tableau VizQL Data Service documentation](https://help.tableau.com/current/api/vizql-data-service/en-us/index.html)
