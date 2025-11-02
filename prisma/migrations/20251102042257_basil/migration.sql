/*
  Warnings:

  - You are about to drop the column `message` on the `Application` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CallRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOB_POSTED', 'JOB_APPROVED', 'JOB_REJECTED', 'APPLICATION_RECEIVED', 'APPLICATION_SHORTLISTED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'JOB_FILLED', 'CALL_REQUEST_RECEIVED', 'CALL_REQUEST_ACCEPTED', 'CALL_REQUEST_REJECTED', 'MESSAGE_RECEIVED', 'PROFILE_VIEW', 'BOOKMARK_ADDED');

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "message",
ADD COLUMN     "proposal" TEXT,
ADD COLUMN     "resumeName" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "stripePaymentId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT,
ADD COLUMN     "metadata" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Notification';

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallRequest" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "applicationId" TEXT,
    "status" "CallRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedTime" TIMESTAMP(3),
    "scheduledTime" TIMESTAMP(3),
    "roomId" TEXT,
    "roomName" TEXT,
    "message" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CallRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "CallRequest_jobId_idx" ON "CallRequest"("jobId");

-- CreateIndex
CREATE INDEX "CallRequest_requesterId_idx" ON "CallRequest"("requesterId");

-- CreateIndex
CREATE INDEX "CallRequest_receiverId_idx" ON "CallRequest"("receiverId");

-- CreateIndex
CREATE INDEX "CallRequest_status_idx" ON "CallRequest"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallRequest" ADD CONSTRAINT "CallRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
