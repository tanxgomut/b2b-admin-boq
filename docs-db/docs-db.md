model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())

  credentials AuthCredential?
  orgs      OrganizationMember[]
  teams     TeamMember[]
  auditLogs AuditLog[]
}

model AuthCredential {
  id        String @id @default(uuid())
  userId    String @unique
  password  String

  user      User @relation(fields: [userId], references: [id])
}

model Organization {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  deletedAt DateTime?

  members   OrganizationMember[]
  teams     Team[]
  auditLogs AuditLog[]
  plan      Subscription?
}

model OrganizationMember {
  id        String   @id @default(uuid())
  userId   String
  orgId    String
  roleId   String
  joinedAt DateTime @default(now())

  user     User         @relation(fields: [userId], references: [id])
  org      Organization @relation(fields: [orgId], references: [id])
  role     Role         @relation(fields: [roleId], references: [id])

  @@unique([userId, orgId])
}

model Team {
  id        String   @id @default(uuid())
  name      String   
  orgId    String
  createdAt DateTime @default(now())

  org       Organization @relation(fields: [orgId], references: [id])
  members   TeamMember[]

  @@unique([orgId, name])
}

model TeamMember {
  id        String   @id @default(uuid())
  userId   String
  teamId   String
  roleId   String

  user     User @relation(fields: [userId], references: [id])
  team     Team @relation(fields: [teamId], references: [id])
  role     Role @relation(fields: [roleId], references: [id])

  @@unique([userId, teamId])
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  entity    String
  entityId  String
  metadata  Json?
  createdAt DateTime @default(now())

  userId   String
  orgId    String
  roleId   String

  user     User         @relation(fields: [userId], references: [id])
  org      Organization @relation(fields: [orgId], references: [id])
  role     Role         @relation(fields: [roleId], references: [id])
}

model Subscription {
  id          String   @id @default(uuid())
  orgId      String   @unique
  plan       PlanType
  status     SubStatus
  startedAt  DateTime
  endsAt     DateTime?
  updatedAt  DateTime @updatedAt

  org         Organization @relation(fields: [orgId], references: [id])
}

enum PlanType {
  FREE
  PRO
  ENTERPRISE
}

enum SubStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

model Permission {
  id          String   @id @default(uuid())
  key         String   @unique   // users:read
  description String?
  resourceId  String

  resource    Resource @relation(fields: [resourceId], references: [id])
  createdAt   DateTime @default(now())

  roles       RolePermission[]
}

model Role {
  id        String   @id @default(uuid())
  name      String   @unique   // OWNER, ADMIN, MEMBER
  level     Int

  createdAt DateTime @default(now())

  permissions RolePermission[]
}

model RolePermission {
  id            String @id @default(uuid())
  roleId       String
  permissionId String

  role       Role       @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])
}

model Resource {
  id   String @id @default(uuid())
  type String   // "user", "invoice", "team"
}