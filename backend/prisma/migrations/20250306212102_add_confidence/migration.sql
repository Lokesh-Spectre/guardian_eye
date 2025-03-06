/*
  Warnings:

  - Added the required column `confidence` to the `TrackRecord` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrackRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cctvId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "trackedObjectId" TEXT NOT NULL,
    "referenceImageId" TEXT,
    "type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "confidence" REAL NOT NULL,
    CONSTRAINT "TrackRecord_cctvId_fkey" FOREIGN KEY ("cctvId") REFERENCES "CCTV" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackRecord_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackRecord_trackedObjectId_fkey" FOREIGN KEY ("trackedObjectId") REFERENCES "TrackedObject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackRecord_referenceImageId_fkey" FOREIGN KEY ("referenceImageId") REFERENCES "ReferenceImage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TrackRecord" ("cctvId", "id", "referenceImageId", "timestamp", "trackedObjectId", "type", "videoId") SELECT "cctvId", "id", "referenceImageId", "timestamp", "trackedObjectId", "type", "videoId" FROM "TrackRecord";
DROP TABLE "TrackRecord";
ALTER TABLE "new_TrackRecord" RENAME TO "TrackRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
