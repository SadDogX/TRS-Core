-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Base" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Base" ("address", "city", "id", "name") SELECT "address", "city", "id", "name" FROM "Base";
DROP TABLE "Base";
ALTER TABLE "new_Base" RENAME TO "Base";
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'empty',
    "phone" TEXT NOT NULL DEFAULT 'empty',
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'worker',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baseId" TEXT,
    "positionId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Employee_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("baseId", "email", "employeeId", "fullName", "id", "isBlocked", "passwordHash", "phone", "positionId", "role") SELECT "baseId", "email", "employeeId", "fullName", "id", "isBlocked", "passwordHash", "phone", "positionId", "role" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");
CREATE TABLE "new_Permit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'r',
    "description" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Permit" ("description", "expiresAt", "id", "type") SELECT "description", "expiresAt", "id", "type" FROM "Permit";
DROP TABLE "Permit";
ALTER TABLE "new_Permit" RENAME TO "Permit";
CREATE UNIQUE INDEX "Permit_type_key" ON "Permit"("type");
CREATE TABLE "new_Position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Position" ("id", "name") SELECT "id", "name" FROM "Position";
DROP TABLE "Position";
ALTER TABLE "new_Position" RENAME TO "Position";
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");
CREATE TABLE "new_Roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Roles" ("id", "name") SELECT "id", "name" FROM "Roles";
DROP TABLE "Roles";
ALTER TABLE "new_Roles" RENAME TO "Roles";
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'forming',
    "leaderId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Team" ("id", "leaderId", "status") SELECT "id", "leaderId", "status" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TeamMember" ("employeeId", "id", "joinedAt", "removedAt", "teamId") SELECT "employeeId", "id", "joinedAt", "removedAt", "teamId" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'forming',
    "wellId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rolesId" INTEGER NOT NULL,
    "workTypeId" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    CONSTRAINT "Work_rolesId_fkey" FOREIGN KEY ("rolesId") REFERENCES "Roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Work_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "WorkType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Work_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Work_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Work" ("id", "name", "rolesId", "status", "supervisorId", "teamId", "wellId", "workTypeId") SELECT "id", "name", "rolesId", "status", "supervisorId", "teamId", "wellId", "workTypeId" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE UNIQUE INDEX "Work_name_key" ON "Work"("name");
CREATE TABLE "new_WorkAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkAssignment_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkAssignment" ("employeeId", "endDate", "id", "permissions", "role", "startDate", "workId") SELECT "employeeId", "endDate", "id", "permissions", "role", "startDate", "workId" FROM "WorkAssignment";
DROP TABLE "WorkAssignment";
ALTER TABLE "new_WorkAssignment" RENAME TO "WorkAssignment";
CREATE TABLE "new_WorkType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_WorkType" ("id", "name") SELECT "id", "name" FROM "WorkType";
DROP TABLE "WorkType";
ALTER TABLE "new_WorkType" RENAME TO "WorkType";
CREATE UNIQUE INDEX "WorkType_name_key" ON "WorkType"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
