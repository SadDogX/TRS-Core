/*
  Warnings:

  - You are about to drop the column `Eid` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `id` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
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
INSERT INTO "new_Employee" ("baseId", "createdAt", "email", "fullName", "isBlocked", "isDeleted", "passwordHash", "phone", "positionId", "role", "updatedAt") SELECT "baseId", "createdAt", "email", "fullName", "isBlocked", "isDeleted", "passwordHash", "phone", "positionId", "role", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_id_key" ON "Employee"("id");
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'forming',
    "name" TEXT,
    "createdById" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "workId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("createdAt", "createdById", "id", "isDeleted", "leaderId", "name", "status", "updatedAt", "workId") SELECT "createdAt", "createdById", "id", "isDeleted", "leaderId", "name", "status", "updatedAt", "workId" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "Team_workId_key" ON "Team"("workId");
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
INSERT INTO "new_TeamMember" ("createdAt", "employeeId", "id", "isDeleted", "joinedAt", "removedAt", "teamId", "updatedAt") SELECT "createdAt", "employeeId", "id", "isDeleted", "joinedAt", "removedAt", "teamId", "updatedAt" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_teamId_employeeId_key" ON "TeamMember"("teamId", "employeeId");
CREATE TABLE "new_WorkAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workRole" TEXT NOT NULL DEFAULT 'worker',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkAssignment_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkAssignment" ("createdAt", "employeeId", "endDate", "id", "isDeleted", "startDate", "updatedAt", "workId", "workRole") SELECT "createdAt", "employeeId", "endDate", "id", "isDeleted", "startDate", "updatedAt", "workId", "workRole" FROM "WorkAssignment";
DROP TABLE "WorkAssignment";
ALTER TABLE "new_WorkAssignment" RENAME TO "WorkAssignment";
CREATE UNIQUE INDEX "WorkAssignment_workId_employeeId_key" ON "WorkAssignment"("workId", "employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
