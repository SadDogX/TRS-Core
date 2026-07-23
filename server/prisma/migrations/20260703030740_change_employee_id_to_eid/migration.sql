/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `TeamMember` table. All the data in the column will be lost.
  - Added the required column `Eid` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "Eid" TEXT,
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
INSERT INTO "new_Employee" ("baseId", "createdAt", "email", "fullName", "id", "isBlocked", "isDeleted", "passwordHash", "phone", "positionId", "role", "updatedAt") SELECT "baseId", "createdAt", "email", "fullName", "id", "isBlocked", "isDeleted", "passwordHash", "phone", "positionId", "role", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_Eid_key" ON "Employee"("Eid");
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "Eid" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_Eid_fkey" FOREIGN KEY ("Eid") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TeamMember" ("createdAt", "id", "isDeleted", "joinedAt", "removedAt", "teamId", "updatedAt") SELECT "createdAt", "id", "isDeleted", "joinedAt", "removedAt", "teamId", "updatedAt" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_teamId_Eid_key" ON "TeamMember"("teamId", "Eid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
