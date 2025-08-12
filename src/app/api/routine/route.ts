import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Crear rutina
export const POST = async (request: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: "Token inválido" }, { status: 401 }); }
  const body = await request.json();
  const { name, description, exercises } = body;
  if (!name || !Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  try {
    const routine = await prisma.routine.create({
      data: {
        name,
        description,
        userId: decoded.id,
        exercises: {
          create: exercises.map((ex: any, idx: number) => ({
            machineId: ex.machineId,
            sets: ex.sets,
            restTime: ex.restTime,
            order: idx + 1,
            notes: ex.notes || null,
            routineSets: {
              create: ex.routineSets.map((set: any, sidx: number) => ({
                setNumber: sidx + 1,
                repetitions: set.repetitions,
                weight: set.weight
              }))
            }
          }))
        }
      },
      include: { exercises: { include: { routineSets: true, machine: true } } }
    });
    return NextResponse.json(routine);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};

// Obtener rutinas del usuario
export const GET = async (request: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: "Token inválido" }, { status: 401 }); }
  try {
    const routines = await prisma.routine.findMany({
      where: { userId: decoded.id },
      include: {
        exercises: { include: { routineSets: true, machine: true } }
      }
    });
    return NextResponse.json(routines);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};

// Renombrar rutina
export const PUT = async (request: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: "Token inválido" }, { status: 401 }); }
  const body = await request.json();
  const { id, name, description } = body;
  if (!id || !name) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  try {
    const routine = await prisma.routine.update({
      where: { id, userId: decoded.id },
      data: { name, description },
    });
    return NextResponse.json(routine);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};

// Eliminar rutina
export const DELETE = async (request: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: "Token inválido" }, { status: 401 }); }
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  try {
    await prisma.routine.delete({ where: { id, userId: decoded.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};
