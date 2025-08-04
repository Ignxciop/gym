
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // No se usa useAuthRedirect aquí para evitar redirección automática en login
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

    const json = await res.json();
    if (res.ok && json.token) {
      localStorage.setItem("token", json.token);
      // Espera a que el token se guarde antes de redirigir
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } else {
      setError(json.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-900 shadow-2xl rounded-3xl p-10 w-full max-w-md space-y-8 border-2 border-green-600 animate-fade-in"
      >
        <div className="flex flex-col items-center gap-2">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-2 text-green-600 animate-bounce-slow">
            <rect x="4" y="10" width="16" height="8" rx="4" fill="#16a34a" />
            <rect x="8" y="6" width="8" height="8" rx="4" fill="#222" />
            <rect x="10" y="2" width="4" height="8" rx="2" fill="#fff" />
          </svg>
          <h2 className="text-3xl font-extrabold text-green-600 tracking-tight">¡Energía Fitness!</h2>
          <p className="text-gray-300 text-sm">Accede a tu cuenta para entrenar</p>
        </div>

        {error && <p className="text-green-600 text-sm text-center animate-shake">{error}</p>}

        <div>
          <label className="block mb-2 text-sm font-semibold text-green-600">Correo electrónico</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-base bg-black text-white placeholder:text-green-800"
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-green-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-green-600">Contraseña</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-4 py-3 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-base bg-black text-white placeholder:text-green-800"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-green-600 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-extrabold text-lg shadow-lg hover:bg-green-800 transition-transform duration-200 tracking-wide"
        >
          Iniciar sesión
        </button>
        <div className="text-center pt-2">
          <span className="text-sm text-gray-300">¿No tienes cuenta? <a href="/register" className="text-green-600 font-semibold hover:underline">Regístrate</a></span>
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
