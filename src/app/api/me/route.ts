// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    // Busca el usuario en la base de datos
    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }
    // Devuelve solo datos públicos
    return NextResponse.json({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || "",
      birthDate: user.birthDate || null,
      gender: user.gender || "",
      isAdmin: user.isAdmin || false,
    });
  } catch {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}
