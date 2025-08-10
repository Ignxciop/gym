// src/app/api/userdata/route.ts
// Endpoint API para obtener los datos físicos/históricos (UserData) de un usuario por email.
// Devuelve un array de registros UserData ordenados por fecha descendente.

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { writeFile } from "fs/promises";
import path from "path";
const prisma = new PrismaClient();

// Helper para calcular edad desde fecha de nacimiento
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


// GET: Obtener datos físicos
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userData: { orderBy: { date: "desc" } } },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    // Calcular edad solo si birthDate es válida
    let age = null;
    if (user.birthDate) {
      const birth = new Date(user.birthDate);
      if (!isNaN(birth.getTime())) {
        age = calculateAge(birth);
      }
    }
    // Adjuntar edad calculada a cada registro de userData
    const userDataWithAge = user.userData.map((ud: any) => ({ ...ud, age }));
    return NextResponse.json(userDataWithAge);
  } catch (e) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

// POST: Agregar nuevo registro de datos físicos o actualizar fecha de nacimiento
export async function POST(request: Request) {
  // Soportar multipart/form-data para imagen
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const file = formData.get("avatar");
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Archivo de imagen requerido" }, { status: 400 });
    }
    // Guardar archivo en public/images/user
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop();
    const fileName = `user_${user.id}_${Date.now()}.${ext}`;
    const filePath = path.join(process.cwd(), "public", "images", "user", fileName);
    await writeFile(filePath, buffer);
    const avatarUrl = `/images/user/${fileName}`;
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    return NextResponse.json({ avatarUrl });
  }

  // JSON body para otros updates
  const { email, weight, notes, height, birthDate, updateBirthDate, gender } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    // Actualizar género
    if (gender) {
      if (gender !== "M" && gender !== "F") {
        return NextResponse.json({ error: "Género inválido" }, { status: 400 });
      }
      await prisma.user.update({ where: { id: user.id }, data: { gender } });
      return NextResponse.json({ gender });
    }
    // Si updateBirthDate está activo, actualiza la fecha de nacimiento del usuario
    if (updateBirthDate) {
      if (!birthDate || typeof birthDate !== "string") {
        return NextResponse.json({ error: "Fecha de nacimiento requerida" }, { status: 400 });
      }
      // Validar formato yyyy-mm-dd y que sea una fecha real
      const [year, month, day] = birthDate.split("-").map(Number);
      if (!year || !month || !day) {
        return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 });
      }
      const testDate = new Date(year, month - 1, day);
      if (
        isNaN(testDate.getTime()) ||
        testDate.getDate() !== day ||
        (testDate.getMonth() + 1) !== month ||
        testDate.getFullYear() !== year
      ) {
        return NextResponse.json({ error: "Fecha de nacimiento inválida" }, { status: 400 });
      }
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { birthDate: testDate },
      });
      // Calcular edad y devolver el userData actualizado
      let age = null;
      if (updatedUser.birthDate) {
        age = calculateAge(new Date(updatedUser.birthDate));
      }
      const lastUserData = await prisma.userData.findFirst({
        where: { userId: user.id },
        orderBy: { date: "desc" },
      });
      if (lastUserData) {
        return NextResponse.json({ ...lastUserData, age });
      } else {
        return NextResponse.json({ age });
      }
    }
    // Si no, crea un nuevo registro de datos físicos
    if (!weight) {
      return NextResponse.json({ error: "Peso requerido" }, { status: 400 });
    }
    const lastUserData = await prisma.userData.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });
    const newData = await prisma.userData.create({
      data: {
        userId: user.id,
        weight,
        height: typeof height === "number" && !isNaN(height) ? height : (lastUserData?.height || 0),
        // La edad ya no se guarda aquí, se calcula desde birthDate
        notes,
      },
    });
    // Calcular edad para devolverla junto con el nuevo registro
    let age = null;
    if (user.birthDate) {
      age = calculateAge(new Date(user.birthDate));
    }
    return NextResponse.json({ ...newData, age });
  } catch (e) {
    console.error("[POST /api/userdata] Error:", e);
    return NextResponse.json({ error: "Error interno: " + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
}
