"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/"), 1500);
    } else {
      setError(json.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-green-700 to-orange-600 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-950/90 shadow-2xl rounded-3xl p-10 w-full max-w-md space-y-8 backdrop-blur-md animate-fade-in border border-green-700"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
      >
        <div className="flex flex-col items-center gap-2">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-2 text-orange-400 animate-bounce-slow">
            <rect x="4" y="10" width="16" height="8" rx="4" fill="#f97316" />
            <rect x="8" y="6" width="8" height="8" rx="4" fill="#22c55e" />
            <rect x="10" y="2" width="4" height="8" rx="2" fill="#fff" />
          </svg>
          <h2 className="text-3xl font-extrabold text-orange-400 tracking-tight">¡Regístrate!</h2>
          <p className="text-green-400 text-sm">Crea tu cuenta para comenzar</p>
        </div>

        {error && <p className="text-orange-500 text-sm text-center animate-shake">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center animate-fade-in">{success}</p>}

        <div>
          <label className="block mb-2 text-sm font-semibold text-orange-400">Nombre</label>
          <input
            type="text"
            {...register("name")}
            className="w-full px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-base bg-gray-900 text-orange-200 placeholder:text-orange-400"
            placeholder="Tu nombre"
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-orange-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-orange-400">Correo electrónico</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-base bg-gray-900 text-orange-200 placeholder:text-orange-400"
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-orange-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-orange-400">Contraseña</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-4 py-3 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-base bg-gray-900 text-orange-200 placeholder:text-orange-400"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-orange-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 via-green-600 to-orange-400 text-white py-3 rounded-lg font-extrabold text-lg shadow-lg hover:scale-[1.04] transition-transform duration-200 tracking-wide"
        >
          Registrarme
        </button>
        <div className="text-center pt-2">
          <span className="text-sm text-orange-200">¿Ya tienes cuenta? <a href="/" className="text-green-400 font-semibold hover:underline">Inicia sesión</a></span>
        </div>
      </form>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </div>
  );
}
