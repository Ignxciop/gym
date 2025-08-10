import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const muscles = await prisma.muscle.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(muscles);
  } catch (err) {
    return NextResponse.json({ error: "Error al obtener músculos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    const exists = await prisma.muscle.findFirst({ where: { name: { equals: name.trim(), mode: "insensitive" } } });
    if (exists) {
      return NextResponse.json({ error: "Ya existe un músculo con ese nombre." }, { status: 409 });
    }
    const muscle = await prisma.muscle.create({ data: { name: name.trim() } });
    return NextResponse.json(muscle);
  } catch (err) {
    return NextResponse.json({ error: "Error al crear músculo" }, { status: 500 });
  }
}
