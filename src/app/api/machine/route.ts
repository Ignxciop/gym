// src/app/api/machine/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const GET = async (request: Request) => {
  // Si se pasa ?all=1, devuelve todas las máquinas
  const { searchParams } = new URL(request.url);
  if (searchParams.get("all") === "1") {
    const machines = await prisma.machine.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });
    return NextResponse.json(machines);
  }
  // Si no, puedes devolver un error o una respuesta vacía
  return NextResponse.json([], { status: 200 });
};

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
  // Solo admin puede crear
  if (!decoded.isAdmin) {
    return NextResponse.json({ error: "Solo administradores pueden crear ejercicios" }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const typeId = Number(formData.get("typeId"));
    const description = formData.get("description") as string;
    const image = formData.get("image");
    // Los músculos llegan como array de IDs (string)
    let muscleIds: number[] = [];
    const musclesRaw = formData.getAll("muscles");
    if (musclesRaw && musclesRaw.length > 0) {
      muscleIds = musclesRaw.map((id) => Number(id)).filter((id) => !isNaN(id));
    }
    if (!name || !typeId || muscleIds.length === 0) {
      return NextResponse.json({ error: "Faltan campos obligatorios, tipo o músculos" }, { status: 400 });
    }
    let imageUrl = null;
    if (image && typeof image !== "string") {
      const buffer = Buffer.from(await image.arrayBuffer());
      const ext = image.name.split('.').pop();
      const fileName = `machine_${Date.now()}.${ext}`;
      const filePath = `${process.cwd()}/public/images/machine/${fileName}`;
      const fs = await import("fs/promises");
      await fs.writeFile(filePath, buffer);
      imageUrl = `/images/machine/${fileName}`;
    }
    // Validar duplicados por nombre (case-insensitive)
    const existing = await prisma.machine.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un ejercicio/máquina con ese nombre." }, { status: 409 });
    }
    try {
      const machine = await prisma.machine.create({
        data: {
          name,
          typeId,
          imageUrl,
          description: description || null,
          muscles: {
            connect: muscleIds.map((id) => ({ id }))
          }
        }
      });
      return NextResponse.json({ message: "Ejercicio creado", machine });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Error al crear ejercicio" }, { status: 500 });
    }
  } else {
    // Fallback para JSON (no recomendado)
    const body = await request.json();
    const { name, typeId, muscles, imageUrl, description } = body;
    let muscleIds: number[] = Array.isArray(muscles) ? muscles.map((id: any) => Number(id)).filter((id: number) => !isNaN(id)) : [];
    if (!name || !typeId || muscleIds.length === 0) {
      return NextResponse.json({ error: "Faltan campos obligatorios, tipo o músculos" }, { status: 400 });
    }
    // Validar duplicados por nombre (case-insensitive)
    const existing = await prisma.machine.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un ejercicio/máquina con ese nombre." }, { status: 409 });
    }
    try {
      const machine = await prisma.machine.create({
        data: {
          name,
          typeId,
          imageUrl: imageUrl || null,
          description: description || null,
          muscles: {
            connect: muscleIds.map((id: number) => ({ id }))
          }
        }
      });
      return NextResponse.json({ message: "Ejercicio creado", machine });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Error al crear ejercicio" }, { status: 500 });
    }
  }
}