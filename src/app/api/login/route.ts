// src/app/api/login/route.ts
// Endpoint API para login de usuario.
// Valida credenciales, compara contraseña, y genera un token JWT si es correcto.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json(
            { message: "Email y contraseña requeridos" },
            { status: 400 }
        );
    }

    // Busca el usuario por email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json(
            { message: "Usuario no encontrado" },
            { status: 404 }
        );
    }

    // Validar que el usuario esté activo
    if (!user.status) {
        return NextResponse.json(
            { message: "Usuario inhabilitado. Contacta al administrador." },
            { status: 403 }
        );
    }

    // Compara la contraseña hasheada
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return NextResponse.json(
            { message: "Contraseña incorrecta" },
            { status: 401 }
        );
    }

    // Genera el token JWT con los datos principales del usuario
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    // Set cookie httpOnly
    const response = NextResponse.json({ message: "Login exitoso" });
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 días
    });
    return response;
}
