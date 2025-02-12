-- CreateTable
CREATE TABLE "Resume" (
    "resumeId" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "jobList" TEXT[],
    "location" TEXT NOT NULL,
    "skills" TEXT[],
    "education" TEXT[],

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("resumeId")
);
