/*
  Warnings:

  - Added the required column `size` to the `course_file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course_file" ADD "size" INTEGER NOT NULL DEFAULT 0;
