erDiagram

USER {
  string id PK
  string email
  string name
  string image
  datetime createdAt
}

AUTH_CREDENTIAL {
  string id PK
  string userId FK
  string password
}

ORGANIZATION {
  string id PK
  string name
  string slug
  datetime createdAt
  datetime deletedAt
}

ORGANIZATION_MEMBER {
  string id PK
  string userId FK
  string orgId FK
  string roleId FK
  datetime joinedAt
}

TEAM {
  string id PK
  string name
  string orgId FK
  datetime createdAt
}

TEAM_MEMBER {
  string id PK
  string userId FK
  string teamId FK
  string roleId FK
}

ROLE {
  string id PK
  string name
  int level
  datetime createdAt
}

PERMISSION {
  string id PK
  string key
  string description
  string resourceId FK
  datetime createdAt
}

ROLE_PERMISSION {
  string id PK
  string roleId FK
  string permissionId FK
}

RESOURCE {
  string id PK
  string type
}

AUDIT_LOG {
  string id PK
  string action
  string entity
  string entityId
  json metadata
  datetime createdAt
  string userId FK
  string orgId FK
  string roleId FK
}

SUBSCRIPTION {
  string id PK
  string orgId FK
  string plan
  string status
  datetime startedAt
  datetime endsAt
  datetime updatedAt
}

%% ---- ความสัมพันธ์หลัก ----

USER ||--o| AUTH_CREDENTIAL : "has"
USER ||--o{ ORGANIZATION_MEMBER : "is member of"
USER ||--o{ TEAM_MEMBER : "belongs to"
USER ||--o{ AUDIT_LOG : "creates"

ORGANIZATION ||--o{ ORGANIZATION_MEMBER : "has"
ORGANIZATION ||--o{ TEAM : "owns"
ORGANIZATION ||--o{ AUDIT_LOG : "has"
ORGANIZATION ||--o| SUBSCRIPTION : "has"

ORGANIZATION_MEMBER }o--|| ROLE : "has role"
TEAM_MEMBER }o--|| ROLE : "has role"

TEAM ||--o{ TEAM_MEMBER : "has"

ROLE ||--o{ ROLE_PERMISSION : "grants"
PERMISSION ||--o{ ROLE_PERMISSION : "is used in"
PERMISSION }o--|| RESOURCE : "applies to"

AUDIT_LOG }o--|| ROLE : "records role"
