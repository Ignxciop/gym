/*
  Warnings:

  - You are about to drop the column `mainMuscle` on the `Machine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Machine" DROP COLUMN "mainMuscle";

-- CreateTable
CREATE TABLE "public"."Muscle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Muscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MachineMuscles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MachineMuscles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Muscle_name_key" ON "public"."Muscle"("name");

-- CreateIndex
CREATE INDEX "_MachineMuscles_B_index" ON "public"."_MachineMuscles"("B");

-- AddForeignKey
ALTER TABLE "public"."_MachineMuscles" ADD CONSTRAINT "_MachineMuscles_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MachineMuscles" ADD CONSTRAINT "_MachineMuscles_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Muscle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
