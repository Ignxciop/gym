import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  // Devuelve todos los tipos de máquina
  const types = await prisma.machineType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
  if (!decoded.isAdmin) {
    return NextResponse.json({ error: "Solo administradores pueden crear tipos" }, { status: 403 });
  }
  const body = await request.json();
  const { name } = body;
  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Nombre de tipo requerido y mínimo 2 caracteres" }, { status: 400 });
  }
  // Validar duplicados
  const exists = await prisma.machineType.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "Ya existe un tipo con ese nombre" }, { status: 409 });
  }
  const type = await prisma.machineType.create({ data: { name } });
  return NextResponse.json(type);
}
