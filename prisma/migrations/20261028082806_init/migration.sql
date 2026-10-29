-- PostGIS is needed for Place.location. It is already enabled in Supabase,
-- and this line makes sure the temporary shadow database has it too.
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BCID', 'PASSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT');

-- CreateEnum
CREATE TYPE "ToiletType" AS ENUM ('POOP', 'PEE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'MATCHED', 'DONE', 'CANCELLED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ApplyStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('GENERAL', 'LOST_PET');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('ACTIVE', 'FOUND', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('ACTIVE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('ACTIVE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'REQUEST_COMPLETED', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'NEW_MESSAGE');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('SITTING', 'LOST_FOUND');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdVerification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentPath" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMPTZ,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "adminId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "breed" TEXT NOT NULL,
    "birthDate" DATE,
    "weight" DECIMAL(5,2),
    "gender" "Gender" NOT NULL,
    "isNeutered" BOOLEAN NOT NULL,
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetVaccine" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "administeredOn" DATE NOT NULL,
    "nextDueOn" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetVaccine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetVetVisit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "visitedOn" DATE NOT NULL,
    "clinicName" TEXT,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetVetVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetWeightLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "measuredOn" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetWeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetFoodLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "foodName" TEXT NOT NULL,
    "amount" DECIMAL(8,2),
    "unit" TEXT,
    "eatenAt" TIMESTAMPTZ NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PetFoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetWalkLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "distanceKm" DECIMAL(6,2),
    "notes" TEXT,

    CONSTRAINT "PetWalkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetToiletLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "type" "ToiletType" NOT NULL,
    "loggedAt" TIMESTAMPTZ NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PetToiletLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "petId" UUID NOT NULL,
    "clinicName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitterRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ NOT NULL,
    "endAt" TIMESTAMPTZ NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "SitterRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitterApply" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ApplyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SitterApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SittingReport" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "notes" TEXT NOT NULL,
    "summary" TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SittingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "revieweeId" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'GENERAL',
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "status" "PostStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "PlaceCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "PlaceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "location" geography(Point,4326) NOT NULL,
    "openingHours" TEXT,
    "phone" TEXT,
    "imageUrl" TEXT,
    "status" "PlaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "ConversationType" NOT NULL,
    "initiatorId" UUID NOT NULL,
    "sitterRequestId" UUID,
    "postId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "conversationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "archivedAt" TIMESTAMPTZ,
    "lastReadAt" TIMESTAMPTZ,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporterId" UUID NOT NULL,
    "postId" UUID,
    "requestId" UUID,
    "reviewId" UUID,
    "placeId" UUID,
    "reportedUserId" UUID,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "handledById" UUID,
    "handledAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "linkPath" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SitterApply_requestId_applicantId_key" ON "SitterApply"("requestId", "applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_requestId_reviewerId_key" ON "Review"("requestId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceCategory_slug_key" ON "PlaceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sitterRequestId_initiatorId_key" ON "Conversation"("sitterRequestId", "initiatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_postId_initiatorId_key" ON "Conversation"("postId", "initiatorId");

-- AddForeignKey
ALTER TABLE "IdVerification" ADD CONSTRAINT "IdVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdVerification" ADD CONSTRAINT "IdVerification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetVaccine" ADD CONSTRAINT "PetVaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetVetVisit" ADD CONSTRAINT "PetVetVisit_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetWeightLog" ADD CONSTRAINT "PetWeightLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetFoodLog" ADD CONSTRAINT "PetFoodLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetWalkLog" ADD CONSTRAINT "PetWalkLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetToiletLog" ADD CONSTRAINT "PetToiletLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitterRequest" ADD CONSTRAINT "SitterRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitterRequest" ADD CONSTRAINT "SitterRequest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitterApply" ADD CONSTRAINT "SitterApply_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SitterRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitterApply" ADD CONSTRAINT "SitterApply_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SittingReport" ADD CONSTRAINT "SittingReport_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SitterRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SittingReport" ADD CONSTRAINT "SittingReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SitterRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PlaceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sitterRequestId_fkey" FOREIGN KEY ("sitterRequestId") REFERENCES "SitterRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SitterRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SitterApply: only one ACCEPTED application per request.
CREATE UNIQUE INDEX "SitterApply_one_accepted_per_request"
  ON "SitterApply"("requestId")
  WHERE "status" = 'ACCEPTED';

-- Review: rating must be between 1 and 5.
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5);

-- Report: exactly one target column must be filled.
ALTER TABLE "Report"
  ADD CONSTRAINT "Report_exactly_one_target_check"
  CHECK (num_nonnulls("postId", "requestId", "reviewId", "placeId", "reportedUserId") = 1);

-- Conversation: exactly one of sitterRequestId / postId must be filled.
ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_exactly_one_context_check"
  CHECK (num_nonnulls("sitterRequestId", "postId") = 1);

-- Place: spatial index for "nearby" searches.
CREATE INDEX "Place_location_idx" ON "Place" USING GIST ("location");