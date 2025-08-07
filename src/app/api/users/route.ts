// src/app/api/users/route.ts
// Endpoint API para obtener todos los usuarios registrados en la base de datos.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}
