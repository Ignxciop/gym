
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          router.replace("/dashboard");
        }
      } catch {}
    }
    checkAuth();
  }, [router]);

  // Landing page para nuevos usuarios
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
      <div className="bg-gray-900 border-2 border-green-600 rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold text-green-600 mb-4">¡Bienvenido a Gymrats App!</h1>
        <p className="text-lg text-gray-300 mb-6">
          Únete a la comunidad que transforma su progreso en el gimnasio.<br />
          Registra tus entrenamientos, sigue tu evolución y alcanza tus metas.
        </p>
        <div className="mb-6">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2 text-green-600 animate-bounce-slow">
            <rect x="4" y="10" width="16" height="8" rx="4" fill="#16a34a" />
            <rect x="8" y="6" width="8" height="8" rx="4" fill="#222" />
            <rect x="10" y="2" width="4" height="8" rx="2" fill="#fff" />
          </svg>
        </div>
        <a href="/register" className="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-transform duration-200 tracking-wide">
          ¡Regístrate gratis!
        </a>
        <div className="mt-6 text-gray-400 text-sm">
          ¿Ya tienes cuenta? <a href="/login" className="text-green-400 underline">Inicia sesión</a>
        </div>
      </div>
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
      `}</style>
    </main>
  );
}
