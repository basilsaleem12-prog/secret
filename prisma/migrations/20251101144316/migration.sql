/*
  Warnings:

  - The values [STARTUP,PART_TIME,COMPETITION,OTHER] on the enum `JobType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `JobMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `folders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_read_receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'POSTED');

-- AlterEnum
BEGIN;
CREATE TYPE "JobType_new" AS ENUM ('ACADEMIC_PROJECT', 'STARTUP_COLLABORATION', 'PART_TIME_JOB', 'COMPETITION_HACKATHON');
ALTER TABLE "Job" ALTER COLUMN "type" TYPE "JobType_new" USING ("type"::text::"JobType_new");
ALTER TYPE "JobType" RENAME TO "JobType_old";
ALTER TYPE "JobType_new" RENAME TO "JobType";
DROP TYPE "public"."JobType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."JobMessage" DROP CONSTRAINT "JobMessage_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobMessage" DROP CONSTRAINT "JobMessage_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobMessage" DROP CONSTRAINT "JobMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProfileNotification" DROP CONSTRAINT "ProfileNotification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."activity_logs" DROP CONSTRAINT "activity_logs_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."activity_logs" DROP CONSTRAINT "activity_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_users" DROP CONSTRAINT "conversation_users_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_users" DROP CONSTRAINT "conversation_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."files" DROP CONSTRAINT "files_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."files" DROP CONSTRAINT "files_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."folders" DROP CONSTRAINT "folders_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."folders" DROP CONSTRAINT "folders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_read_receipts" DROP CONSTRAINT "message_read_receipts_message_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_read_receipts" DROP CONSTRAINT "message_read_receipts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_reply_to_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."shared_files" DROP CONSTRAINT "shared_files_file_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."shared_files" DROP CONSTRAINT "shared_files_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_permissions" DROP CONSTRAINT "user_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_permissions" DROP CONSTRAINT "user_permissions_user_id_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "compensation" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "teamSize" TEXT,
ALTER COLUMN "isDraft" SET DEFAULT true;

-- DropTable
DROP TABLE "public"."JobMessage";

-- DropTable
DROP TABLE "public"."ProfileNotification";

-- DropTable
DROP TABLE "public"."activity_logs";

-- DropTable
DROP TABLE "public"."conversation_users";

-- DropTable
DROP TABLE "public"."conversations";

-- DropTable
DROP TABLE "public"."files";

-- DropTable
DROP TABLE "public"."folders";

-- DropTable
DROP TABLE "public"."invoices";

-- DropTable
DROP TABLE "public"."message_read_receipts";

-- DropTable
DROP TABLE "public"."messages";

-- DropTable
DROP TABLE "public"."notifications";

-- DropTable
DROP TABLE "public"."payments";

-- DropTable
DROP TABLE "public"."permissions";

-- DropTable
DROP TABLE "public"."plans";

-- DropTable
DROP TABLE "public"."shared_files";

-- DropTable
DROP TABLE "public"."subscriptions";

-- DropTable
DROP TABLE "public"."user_permissions";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."FileStatus";

-- DropEnum
DROP TYPE "public"."FileType";

-- DropEnum
DROP TYPE "public"."MessageStatus";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."SubscriptionStatus";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "jobId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_createdById_idx" ON "Job"("createdById");

-- CreateIndex
CREATE INDEX "Job_type_idx" ON "Job"("type");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_isPublished_isFilled_idx" ON "Job"("isPublished", "isFilled");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
