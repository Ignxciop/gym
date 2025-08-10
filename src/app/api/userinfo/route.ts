// src/app/api/userinfo/route.ts
// Endpoint API para obtener los datos de un usuario por email (incluyendo birthDate actualizado)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
