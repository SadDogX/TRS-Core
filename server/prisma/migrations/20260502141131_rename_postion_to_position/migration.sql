/*
  Warnings:

  - You are about to drop the column `postionId` on the `Employee` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'empty',
    "phone" TEXT NOT NULL DEFAULT 'empty',
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'worker',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "baseId" TEXT,
    "positionId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Employee_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("baseId", "email", "employeeId", "fullName", "id", "isBlocked", "passwordHash", "phone", "role") SELECT "baseId", "email", "employeeId", "fullName", "id", "isBlocked", "passwordHash", "phone", "role" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
