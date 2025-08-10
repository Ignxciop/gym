// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Elimina la cookie del token
  const response = NextResponse.json({ message: "Logout exitoso" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0 // Expira inmediatamente
  });
  return response;
}
