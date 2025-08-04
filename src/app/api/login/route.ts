// app/api/login/route.ts
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

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json(
            { message: "Usuario no encontrado" },
            { status: 404 }
        );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return NextResponse.json(
            { message: "Contraseña incorrecta" },
            { status: 401 }
        );
    }

    // Generar token JWT
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return NextResponse.json({ message: "Login exitoso", token });
}
