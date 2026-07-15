/*
  Warnings:

  - A unique constraint covering the columns `[paymobOrderId]` on the table `enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "enrollment" ADD COLUMN     "paymobOrderId" TEXT;

-- CreateTable
CREATE TABLE "saved_course" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_course_userId_courseId_key" ON "saved_course"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_paymobOrderId_key" ON "enrollment"("paymobOrderId");

-- AddForeignKey
ALTER TABLE "saved_course" ADD CONSTRAINT "saved_course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_course" ADD CONSTRAINT "saved_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
