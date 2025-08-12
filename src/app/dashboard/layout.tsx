"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserInfo, fetchUserData } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
const PerfilPage = dynamic(() => import("@/app/dashboard/perfil/page"), { ssr: false }) as React.ComponentType<{ email: string }>;
import AddMachineForm from "@/app/dashboard/components/AddMachineForm";


const menuItems = [
    { key: "inicio", label: "Inicio", icon: "🏠" },
    { key: "perfil", label: "Perfil", icon: "👤" },
    { key: "rutinas", label: "Rutinas", icon: "💪" },
    { key: "progreso", label: "Progreso", icon: "📈" },
    { key: "ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, setUser, logout } = useAuth();
    // Redirigir a /dashboard si hay sesión y está en /
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token && pathname === "/") {
            router.replace("/dashboard");
        }
    }, [pathname, router]);
    // user and setUser now come from context
    const [userData, setUserData] = useState<any[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Elimina navegación por estado local, usa rutas

    useEffect(() => {
        fetchUserInfo()
            .then(setUser)
            .catch(() => {
                setUser(null);
                logout();
                router.replace("/");
            });
        fetchUserData()
            .then(data => setUserData(Array.isArray(data) ? data : []));
    }, [router]);

    if (!user) return null;

    // Elimina renderizado condicional, usa children

    return (
        <div className="flex min-h-screen bg-black relative">
            {/* Botón hamburguesa solo en móviles, ahora dentro de la barra superior */}
            {/* Barra lateral */}
            <aside
                className={`fixed md:static top-0 left-0 z-20 h-full w-64 bg-gray-900 border-r-2 border-green-600 flex flex-col py-8 px-4 space-y-4 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                style={{ minHeight: '100vh' }}
            >
                <div className="flex items-center gap-2 mb-8">
                    <span className="text-2xl font-extrabold text-green-600">🏋️‍♂️ GymApp</span>
                </div>
                <nav className="flex flex-col gap-2">
                    {menuItems.map(item => (
                        <Link
                            key={item.key}
                            href={`/dashboard/${item.key === "inicio" ? "" : item.key}`}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150
                ${pathname === `/dashboard/${item.key === "inicio" ? "" : item.key}` ? "bg-green-600 text-white" : "text-gray-300 hover:bg-green-900 hover:text-green-400"}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    {user?.isAdmin && (
                        <>
                            <div className="my-4 border-t border-green-700" />
                            <div className="px-4 py-1 text-green-500 font-bold uppercase text-xs tracking-widest mb-1">Admin</div>
                            <Link
                                href="/dashboard/agregar-ejercicio"
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150
                    ${pathname === "/dashboard/agregar-ejercicio" ? "bg-green-600 text-white" : "text-gray-300 hover:bg-green-900 hover:text-green-400"}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span>➕</span>
                                Agregar ejercicio
                            </Link>
                        </>
                    )}
                </nav>
            </aside>

            {/* Overlay para cerrar menú en móviles */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Barra superior */}
                <header className="h-20 bg-gray-900 border-b-2 border-green-600 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        {/* Botón hamburguesa solo en móviles */}
                        <button
                            className="md:hidden bg-green-600 hover:bg-green-800 text-white p-3 rounded-lg shadow-lg focus:outline-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Abrir menú"
                        >
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                                <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
                                <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                                <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
                            </svg>
                        </button>
                        <span className="text-lg md:text-xl font-bold text-white truncate">
                            {(() => {
                              const current = menuItems.find(item => pathname === `/dashboard/${item.key === "inicio" ? "" : item.key}`);
                              return current ? current.label : "";
                            })()}
                            {pathname === "/dashboard/agregar-ejercicio" && "Agregar ejercicio"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-green-600 font-semibold flex items-center gap-2">
                            {/* Avatar inline, clickable to go to perfil */}
                            <span
                                className="inline-block cursor-pointer"
                                title="Ir a perfil"
                                onClick={() => router.push("/dashboard/perfil")}
                            >
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl.startsWith('http') ? user.avatarUrl : (typeof window !== 'undefined' ? window.location.origin + user.avatarUrl : user.avatarUrl)}
                                        alt="Avatar"
                                        className="inline-block w-8 h-8 rounded-full object-cover border-2 border-green-500 ml-2 mr-1 align-middle bg-gray-800 transition-transform hover:scale-105"
                                        style={{ verticalAlign: 'middle' }}
                                    />
                                ) : (
                                    <span className="inline-block w-8 h-8 rounded-full bg-gray-800 border-2 border-green-500 ml-2 mr-1 align-middle transition-transform hover:scale-105"></span>
                                )}
                            </span>
                            {user.isAdmin ? (
                                <span className="underline decoration-yellow-400 decoration-2 underline-offset-4 text-yellow-300">{user.name}</span>
                            ) : (
                                user.name
                            )}
                        </span>
                        <button
                            onClick={() => {
                                logout();
                                router.replace("/login");
                            }}
                            className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-3 md:px-4 text-sm md:text-base rounded transition-colors duration-150"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </header>
                {/* Contenido dinámico */}
                <main className="flex-1 p-2 md:p-8 bg-black min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
