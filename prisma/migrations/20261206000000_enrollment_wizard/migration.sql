-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('NOT_RUN', 'RUNNING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('BI_FRONT', 'BI_BACK', 'PHOTO', 'PROOF');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'MATCHED', 'DIVERGENT', 'NOT_READABLE', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EXPRESS', 'BANK_TRANSFER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EnrollmentStatus" ADD VALUE 'DRAFT';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'PENDING_DOCUMENTS';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'CORRECTION_REQUIRED';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'PAYMENT_PENDING_VERIFICATION';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'APPROVED';
ALTER TYPE "EnrollmentStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nif" TEXT,
    "biNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "municipality" TEXT,
    "province" TEXT,
    "phone" TEXT,
    "primaryDocumentType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentDocument" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "ocrStatus" "OcrStatus" NOT NULL DEFAULT 'NOT_RUN',
    "ocrRaw" JSONB,
    "ocrConfidence" DOUBLE PRECISION,
    "ocrSource" TEXT,
    "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSubmission" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "reference" TEXT,
    "ocrExtract" JSONB,
    "ocrStatus" "OcrStatus" NOT NULL DEFAULT 'NOT_RUN',
    "duplicateCheckHash" TEXT,
    "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentStatusHistory" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "fromStatus" "EnrollmentStatus",
    "toStatus" "EnrollmentStatus" NOT NULL,
    "actorUserId" TEXT,
    "actorRole" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentDocument_storageKey_key" ON "EnrollmentDocument"("storageKey");

-- CreateIndex
CREATE INDEX "EnrollmentDocument_enrollmentId_idx" ON "EnrollmentDocument"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentDocument_enrollmentId_kind_key" ON "EnrollmentDocument"("enrollmentId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSubmission_enrollmentId_key" ON "PaymentSubmission"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSubmission_duplicateCheckHash_key" ON "PaymentSubmission"("duplicateCheckHash");

-- CreateIndex
CREATE INDEX "EnrollmentStatusHistory_enrollmentId_createdAt_idx" ON "EnrollmentStatusHistory"("enrollmentId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Enrollment_submittedAt_idx" ON "Enrollment"("submittedAt");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentDocument" ADD CONSTRAINT "EnrollmentDocument_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentDocument" ADD CONSTRAINT "EnrollmentDocument_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentStatusHistory" ADD CONSTRAINT "EnrollmentStatusHistory_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentStatusHistory" ADD CONSTRAINT "EnrollmentStatusHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

