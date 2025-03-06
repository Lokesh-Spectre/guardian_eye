/*
  Warnings:

  - Added the required column `path` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cctvId" TEXT NOT NULL,
    "videoStartTime" DATETIME NOT NULL,
    "description" TEXT,
    "path" TEXT NOT NULL,
    CONSTRAINT "Video_cctvId_fkey" FOREIGN KEY ("cctvId") REFERENCES "CCTV" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("cctvId", "description", "id", "videoStartTime") SELECT "cctvId", "description", "id", "videoStartTime" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
