// src/app/api/userinfo/route.ts
// Endpoint API para obtener los datos de un usuario por email (incluyendo birthDate actualizado)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        email: true,
        isAdmin: true,
        birthDate: true,
        avatarUrl: true,
        gender: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
