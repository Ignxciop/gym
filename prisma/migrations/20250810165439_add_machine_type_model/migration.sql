/*
  Warnings:

  - You are about to drop the column `type` on the `Machine` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `Machine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Machine" DROP COLUMN "type",
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."MachineType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MachineType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MachineType_name_key" ON "public"."MachineType"("name");

-- AddForeignKey
ALTER TABLE "public"."Machine" ADD CONSTRAINT "Machine_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."MachineType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
