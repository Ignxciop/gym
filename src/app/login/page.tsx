// app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const [error, setError] = useState("");
    const router = useRouter();

    const onSubmit = async (data: LoginForm) => {
        setError("");

        const res = await fetch("/api/login", {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (res.ok) {
            router.push("/dashboard"); // Redireccionar si el login es exitoso
        } else {
            const json = await res.json();
            setError(json.message || "Error al iniciar sesión");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white shadow-md rounded-xl p-8 w-full max-w-md space-y-6"
            >
                <h2 className="text-2xl font-semibold text-center">Iniciar sesión</h2>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                    <label className="block mb-1 text-sm font-medium">Correo</label>
                    <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">Contraseña</label>
                    <input
                        type="password"
                        {...register("password")}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Iniciar sesión
                </button>
            </form>
        </div>
    );
}
