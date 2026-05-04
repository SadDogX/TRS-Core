/*
  Warnings:

  - You are about to drop the `Permit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `permissions` on the `WorkAssignment` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permit_type_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Permit";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'forming',
    "createdById" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("createdAt", "id", "isDeleted", "leaderId", "status", "updatedAt") SELECT "createdAt", "id", "isDeleted", "leaderId", "status", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE TABLE "new_WorkAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'worker',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkAssignment_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkAssignment" ("createdAt", "employeeId", "endDate", "id", "isDeleted", "role", "startDate", "updatedAt", "workId") SELECT "createdAt", "employeeId", "endDate", "id", "isDeleted", "role", "startDate", "updatedAt", "workId" FROM "WorkAssignment";
DROP TABLE "WorkAssignment";
ALTER TABLE "new_WorkAssignment" RENAME TO "WorkAssignment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
