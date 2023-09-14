# Prerequisite

## Possible fields
- `parent_id`
- `name`
- `opening_status`
- `org_unit_type_id`
- `groups`
- `geo_point`
- `shape`
- `instances`

# POST /api/orgunits/changes/?app_id=..

API used to create or modify an OrgUnit with validation (see feature flags)
When creating an OrgUnit, the client doesn't know the ID or the OrgUnit was not created yet and we might want to apply 
some changes still. Therefore, the IDs can be either the DB id or the UUID generated by the client.
Changes that are not provided are considered not being part of the change request.

## Permissions

User must be authenticated.

## Query parameters

- app_id: String - Must be provided, project for which this is created.

## Body

```json
{
  "uuid": "UUID - Client generated UUID",
  "org_unit_id": "String - id or UUID of the OrgUnit to change, if UUID doesn't exist in DB, it's a new OrgUnit.",
  "created_at": "Timestamp - format same as /api/instances",
  "updated_at": "Timestamp - format same as /api/instances",
  "changes": { "": "Changes is not null and must contain at least one field",
    "parent_id": "String? - id or UUID of the parent OrgUnit, may be null or omitted.",
    "name": "String? - Name of the OrgUnit, may be null or omitted.",
    "opening_status": "Enum<Status>? - One of `open` or `close`",
    "org_unit_type_id": "Int? - id of the OrgUnitType, may be null or omitted",
    "groups": "Array of Group ids? - can be empty, null or omitted. Empty means we want to remove all values",
    "geo_point": { "": "New geopoint for the OrgUnit, may be null or omitted",
      "latitude": "Double - New latitude of the OrgUnit",
      "longitude": "Double - New longitude of the OrgUnit",
      "altitude": "Double - New altitude of the OrgUnit",
      "accuracy": "Double - New accuracy of the OrgUnit"
    },
    "geo-shape": "String? - GeoJSON representation, may be null or omitted",
    "instances":  "Array of instance ids? - may be null or omitted, cannot be empty"
  }
}
```

## Possible responses

### 201 - Created

### 400 - Bad request

- `app_id` was not provided
- A not nullable field was null or omitted
- `org_unit_id` is a new OrgUnit and the following fields were null or omitted: `parent_id`, `name`, `geo_point` and `org_unit_type_id`
- A `String` field has an empty value
- `parent_id` is not a valid OrgUnit
- `opening_status` was not one of the enum values.
- `org_unit_type_id` is not a valid OrgUnitType
- One of the `groups` id is not a valid Group
- `instances` is empty
- `org_unit_type_id` is not a valid sub OrgUnitType for the given `parent_id` --> TO BE CONFIRMED
- `org_unit_type_id` is not a valid sub OrgUnitType to be moved to the given `parent_id` --> TO BE CONFIRMED

### 401 - Unauthorized

- No authentication token or an invalid one was provided

### 404 - Not found

- one or more of `instances` ids is not found
- `parent_id` is not found
- `org_unit_type_id` is not found




# GET /api/orgunits/changes/

## Permissions

Org Unit admin?

## Query parameters
- page: Int (optional) - Current page (default: 1)
- limit: Int (optional) - Number of entities returned by page (default: 20)
- org_unit_id: Int (optional) - Id of the OrgUnit to which the changes apply (default: null)
- org_unit_type_id: Int (optional) - Id of the OrgUnitType to filter on, either the current OrgUnitType or in the change (default: null)
- status: Array<Enum<Status>> (optional) - One of `new`, `validated`, `rejected` to filter the requests (default: null)
- parent_id: Int (optional) - Id of the parent OrgUnit to filter on, either the current parent or in the change (default: null)
- groups: List of int, comma separated (optional) - Ids of the group to filter on, either the currents groups or in the change (default: null)
- project: Int (optional) - Id of the project to filter on.

## Possible responses

### 200 - OK

```json
{
  "count": "Long",
  "has_next": "Boolean",
  "has_previous": "Boolean",
  "page": "Long",
  "pages": "Long",
  "limit": "Long",
  "results": [
    {
      "id": "Int - id in the database, I know Martin wants it",
      "uuid": "UUID - provided by the client when request was created",
      "status": "Enum<Status> - one of `new`, `validated`, `rejected`",
      "org_unit_name": "String - name of the OrgUnit",
      "org_unit_type_id": "Int - id of the current OrgUnitType",
      "org_unit_type_name": "String - name of the current OrgUnitType",
      "groups": "Array<String> - names of the current Groups",
      "created_by": "String - username of the user who created that request",
      "created_at": "Timestamp",
      "update_by": "String? - username of the user who accepted/rejected that request",
      "updated_at": "Timestamp?",
      "requested_fields": "Array<String> - name of the properties that were requested to change",
      "approved_fields": "Array<String>? - name of the properties that were approved to change",
      "rejection_comment": "String? - Comment about why the changes were rejected",
      "instances": "Array of instance ids? - may be null or omitted, cannot be empty"
    }
  ]
}
```

### 400 - Bad request

- `page` or `limit` cannot be parsed to a correct integer value
- One or more of the parameters provided couldn't be parsed
- One or more of the parameters provided couldn't matched to the related resource (E.g.: unknown parent_id)
- A parameter was given that is not recognized

### 401 - Unauthorized

- No authentication token or an invalid one was provided

### 403 - Forbidden

- User doesn't have the proper permission to access this resource.


# GET /api/orgunits/changes/{change_id}/

API to list all the change requests. Used by admin in the web UI.

## Permissions

Same as `GET /api/orgunits/changes/`

## Possible responses

### 200 - OK

```json
{
  "id": "Int - id in the database, I know Martin wants it",
  "uuid": "UUID - provided by the client when request was created",
  "status": "Enum<Status> - one of `new`, `validated`, `rejected`",
  "created_by": "String - username of the user who created that request",
  "created_at": "Timestamp",
  "update_by": "String? - username of the user who accepted/rejected that request",
  "updated_at": "Timestamp?",
  "requested_fields": "Array<String> - name of the properties that were requested to change", 
  "approved_fields": "Array<String>? - name of the properties that were approved to change",
  "rejection_comment": "String? - Comment about why the changes were rejected",
  "org_unit": {
    "parent": "String - Name of the parent OrgUnit.",
    "name": "String - Name of the OrgUnit.",
    "opening_status": "Enum<Status>? - Status of the OrgUnit, One of `open` or `close`, may be null or omitted.",
    "org_unit_type_id": "Int - id of the OrgUnitType",
    "org_unit_type_name": "String - Name of the OrgUnitType",
    "groups": "Array of String - can be empty. Names of the new groups",
    "geo_point": { "": "Geopoint for the OrgUnit",
      "latitude": "Double - New latitude of the OrgUnit",
      "longitude": "Double - New longitude of the OrgUnit",
      "altitude": "Double - New altitude of the OrgUnit",
      "accuracy": "Double - New accuracy of the OrgUnit"
    },
    "geo-shape": "String? - GeoJSON representation, may be null or omitted",
    "instances": [ "Array of form objects - can be empty",
      {
        "form_id": "id of the form",
        "form_name": "Name of the form",
        "instance_id": "id of the instance",
        "values": [
          {
            "key": "String",
            "label": "String or translated object",
            "value": "String"
          }
        ]
      }
    ]
  },
  "changes": {
    "parent": "String? - Name of the new parent OrgUnit, may be null or omitted.",
    "name": "String? - New name of the OrgUnit, may be null or omitted.",
    "opening_status": "Enum<Status>? - New status of the OrgUnit, One of `open` or `close`, may be null or omitted.",
    "org_unit_type_id": "Int? - id of the new OrgUnitType, may be null or omitted",
    "org_unit_type_name": "String? - Name of the new OrgUnitType, may be null or omitted",
    "groups": "Array of String? - can be empty, null or omitted. Names of the new groups",
    "geo_point": { "": "New GeoPoint? for the OrgUnit, may be null or omitted",
      "latitude": "Double - New latitude of the OrgUnit",
      "longitude": "Double - New longitude of the OrgUnit",
      "altitude": "Double - New altitude of the OrgUnit",
      "accuracy": "Double - New accuracy of the OrgUnit"
    },
    "geo-shape": "String? - New GeoJSON representation, may be null or omitted",
    "instances": [ "Array of form objects? - may be null or omitted, cannot be empty",
      {
        "form_id": "id of the form",
        "form_name": "Name of the form",
        "instance_id": "id of the instance",
        "values": [
          {
            "key": "String",
            "label": "String",
            "value": "String"
          }
        ]
      }
    ]
  }
}
```

### 400 - Bad request

- One or more of the parameters provided couldn't be parsed
- One or more of the parameters provided couldn't matched to the related resource (E.g.: unknown parent_id)
- A parameter was given that is not recognized

### 401 - Unauthorized

- No authentication token or an invalid one was provided

### 403 - Forbidden

- User doesn't have the proper permission to access this resource.




# PATCH /api/orgunits/changes/{change_id}/

API to change the status of on change request.

## Permissions

Same as `GET /api/orgunits/changes/`

## Body

```json
{
  "status": "Enum<Status> - One of `validated` or `rejected`",
  "approved_fields": "Array<Enum<Field>>? - name of the properties that were approved to change",
  "rejection_comment": "String? - Comment about why the changes were rejected"
}
```

## Possible responses

### 204 - No content

Change were applied successfully

### 400 - Bad request

- `status` was not one of `validated` or `rejected`
- `status` was `validated` but `approved_fields` was null, omitted or empty
- `approved_fields` contains one or more unknown fields.
- `status` was `rejected` but `rejection_comment` was null, omitted or empty
- `status` of the change to be patched is not `new`





# GET /api/mobile/orgunits/changes/?app_id=..

API to list all the change requests for the authorized user. 
Used the mobile application users to keep track of the changes made to their change requests.

## Permissions

User has to be authenticated

## Query parameter

- app_id: String - Must be provided, project for which this is queried.
- last_sync: Timestamp in double? - May be null or omitted. Limits the results to everything that was modified after this Timestamp
- page: Int (optional) - Current page (default: 1)
- limit: Int (optional) - Number of entities returned by page (default: 20)

## Possible responses

### 200 - OK

```json
{
  "count": "Long",
  "has_next": "Boolean",
  "has_previous": "Boolean",
  "page": "Long",
  "pages": "Long",
  "limit": "Long",
  "results": [
    {
      "id": "Int - id in the database, I know Martin wants it",
      "uuid": "UUID - provided by the client when request was created",
      "status": "Enum<Status> - one of `new`, `validated`, `rejected`",
      "approved_fields": "Array<String>? - name of the properties that were approved to change",
      "rejection_comment": "String? - Comment about why the changes were rejected",
      "org_unit_id": "String - id or UUID of the OrgUnit to change",
      "created_at": "Timestamp in double",
      "updated_at": "Timestamp in double",
      "changes": {
        "parent_id": "String? - id or UUID of the parent OrgUnit, may be null or omitted.",
        "name": "String? - Name of the OrgUnit, may be null or omitted.",
        "status": "Enum<Status>? - One of `open` or `close`",
        "org_unit_type_id": "Int? - id of the OrgUnitType, may be null or omitted",
        "groups": "Array of Group ids? - can be empty, null or omitted. Empty means we want to remove all values",
        "geo_point": { "": "New geopoint for the OrgUnit, may be null or omitted",
          "latitude": "Double - New latitude of the OrgUnit",
          "longitude": "Double - New longitude of the OrgUnit",
          "altitude": "Double - New altitude of the OrgUnit",
          "accuracy": "Double - New accuracy of the OrgUnit"
        },
        "geo-shape": "String? - GeoJSON representation, may be null or omitted",
        "instances": "Array of instance ids? - may be null or omitted, cannot be empty"
      }
    }
  ]
}
```

### 400 - Bad request

- `app_id` was not provided
- `page` or `limit` cannot be parsed to a correct integer value
- `last_sync` cannot be parsed to a correct date time.

### 401 - Unauthorized

- No authentication token or an invalid one was provided





# GET /api/mobile/orgunits/{id or UUID}/reference_instances?app_id=...

Returns the reference instances for an OrgUnit from newest to oldest.

## Permission

Same as downloading instances

## Query parameters

- page: Int (optional) - Current page (default: 1)
- limit: Int (optional) - Number of entities returned by page (default: 20)
- app_id: String - project for which this is queried.
- last_sync: Timestamp in double? - May be null or omitted. Limits the results to everything that was modified after this Timestamp (default: null)
- version_count: Int? - Number of versions of each forms to return (default: 1)

## Possible response

### 200 - OK

```json
{
  "count": "Long",
  "has_next": "Boolean",
  "has_previous": "Boolean",
  "page": "Long",
  "pages": "Long",
  "limit": "Long",
  "results": [
    {
        "org_unit_id": "Int",
        "org_unit_uuid": "UUID - provided by the client",
        "instances": [
            {
                "id": "Int",
                "uuid": "UUID - provided by the client",
                "form_id": "Int",
                "form_version_id": "Int",
                "created_at": "Timestamp in double",
                "updated_at": "Timestamp in double",
                "json":  "JSONObject - contains the key/value of the instance"
            }
        ]
    }
  ]
}
```

### 400 - Bad request

- `app_id` was not provided
- `page`, `limit` or `version_count` cannot be parsed to a correct integer value
- `last_sync` cannot be parsed to a correct date time.


### 401 - Unauthorized

- No authentication token or an invalid one was provided (if needed)

### 403 - Forbidden

- User doesn't have the proper permission to access this resource (if needed)
