/*
  Warnings:

  - You are about to drop the column `role` on the `WorkAssignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamId,employeeId]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "wellId" TEXT NOT NULL,
    "workTypeId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Work_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "WorkType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Work" ("createdAt", "id", "isDeleted", "name", "status", "updatedAt", "wellId", "workTypeId") SELECT "createdAt", "id", "isDeleted", "name", "status", "updatedAt", "wellId", "workTypeId" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE UNIQUE INDEX "Work_name_key" ON "Work"("name");
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
INSERT INTO "new_WorkAssignment" ("createdAt", "employeeId", "endDate", "id", "isDeleted", "startDate", "updatedAt", "workId") SELECT "createdAt", "employeeId", "endDate", "id", "isDeleted", "startDate", "updatedAt", "workId" FROM "WorkAssignment";
DROP TABLE "WorkAssignment";
ALTER TABLE "new_WorkAssignment" RENAME TO "WorkAssignment";
CREATE UNIQUE INDEX "WorkAssignment_workId_employeeId_key" ON "WorkAssignment"("workId", "employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_employeeId_key" ON "TeamMember"("teamId", "employeeId");
