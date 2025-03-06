-- CreateTable
CREATE TABLE "CCTV" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "direction" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastMaintenanceDate" DATETIME
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isClose" BOOLEAN NOT NULL,
    "caseStatus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TrackedObject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "lastSeenTimestamp" DATETIME NOT NULL,
    "currentLocation" TEXT
);

-- CreateTable
CREATE TABLE "ReferenceImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trackedObjectId" TEXT NOT NULL,
    CONSTRAINT "ReferenceImage_trackedObjectId_fkey" FOREIGN KEY ("trackedObjectId") REFERENCES "TrackedObject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cctvId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "trackedObjectId" TEXT NOT NULL,
    "referenceImageId" TEXT,
    "type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "TrackRecord_cctvId_fkey" FOREIGN KEY ("cctvId") REFERENCES "CCTV" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackRecord_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackRecord_trackedObjectId_fkey" FOREIGN KEY ("trackedObjectId") REFERENCES "TrackedObject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackRecord_referenceImageId_fkey" FOREIGN KEY ("referenceImageId") REFERENCES "ReferenceImage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cctvId" TEXT NOT NULL,
    "videoStartTime" DATETIME NOT NULL,
    "description" TEXT,
    CONSTRAINT "Video_cctvId_fkey" FOREIGN KEY ("cctvId") REFERENCES "CCTV" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CaseTrackedObjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CaseTrackedObjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CaseTrackedObjects_B_fkey" FOREIGN KEY ("B") REFERENCES "TrackedObject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CaseTrackedObjects_AB_unique" ON "_CaseTrackedObjects"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseTrackedObjects_B_index" ON "_CaseTrackedObjects"("B");
