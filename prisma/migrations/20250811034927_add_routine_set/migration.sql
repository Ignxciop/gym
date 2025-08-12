-- CreateTable
CREATE TABLE "public"."RoutineSet" (
    "id" SERIAL NOT NULL,
    "routineExerciseId" INTEGER NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RoutineSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RoutineSet" ADD CONSTRAINT "RoutineSet_routineExerciseId_fkey" FOREIGN KEY ("routineExerciseId") REFERENCES "public"."RoutineExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
