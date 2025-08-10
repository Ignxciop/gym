"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserInfo, fetchUserData } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
const PerfilPage = dynamic(() => import("@/app/dashboard/perfil/page"), { ssr: false }) as React.ComponentType<{ email: string }>;


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
    const [active, setActive] = useState("inicio");

    // Sincroniza el estado 'active' con la URL
    useEffect(() => {
        if (typeof window !== "undefined") {
            const path = window.location.pathname.split("/")[2] || "inicio";
            setActive(path);
        }
    }, []);

    // Actualiza la URL cuando cambia el estado 'active'
    const handleSectionChange = (key: string) => {
        setActive(key);
        // Cambia la URL sin recargar ni navegar fuera de la página
        const newPath = `/dashboard/${key === "inicio" ? "" : key}`;
        if (typeof window !== "undefined" && window.location.pathname !== newPath) {
            window.history.pushState({}, '', newPath);
        }
        setSidebarOpen(false);
    };

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

    // Renderizar contenido dinámico según el estado 'active'
    let content = null;
    if (active === "inicio") {
        content = children;
    } else if (active === "perfil") {
        content = <PerfilPage email={user.email || ''} />;
    } else if (active === "rutinas") {
        content = <div className="text-lg md:text-xl text-green-600">Aquí irán las rutinas de entrenamiento.</div>;
    } else if (active === "progreso") {
        content = <div className="text-lg md:text-xl text-gray-300">Aquí verás tu progreso.</div>;
    } else if (active === "ajustes") {
        content = <div className="text-lg md:text-xl text-green-600">Configuración y ajustes.</div>;
    } else if (active === "agregar-ejercicio" && user?.isAdmin) {
        content = <div className="text-lg md:text-xl text-green-600">Aquí podrás agregar un nuevo ejercicio (solo admin).</div>;
    } else {
        content = <div className="text-center text-green-400 text-xl font-bold mt-20">Selecciona una sección del menú</div>;
    }

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
                        <button
                            key={item.key}
                            onClick={() => handleSectionChange(item.key)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150
                ${active === item.key ? "bg-green-600 text-white" : "text-gray-300 hover:bg-green-900 hover:text-green-400"}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                    {user?.isAdmin && (
                        <>
                            <div className="my-4 border-t border-green-700" />
                            <div className="px-4 py-1 text-green-500 font-bold uppercase text-xs tracking-widest mb-1">Admin</div>
                            <button
                                onClick={() => handleSectionChange("agregar-ejercicio")}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150
                    ${active === "agregar-ejercicio" ? "bg-green-600 text-white" : "text-gray-300 hover:bg-green-900 hover:text-green-400"}`}
                            >
                                <span>➕</span>
                                Agregar ejercicio
                            </button>
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
                            {menuItems.find(item => item.key === active)?.label}
                            {active === "agregar-ejercicio" && "Agregar ejercicio"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-green-600 font-semibold flex items-center gap-2">
                            {/* Avatar inline, clickable to go to perfil */}
                            <span
                                className="inline-block cursor-pointer"
                                title="Ir a perfil"
                                onClick={() => handleSectionChange("perfil")}
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
                    {content}
                </main>
            </div>
        </div>
    );
}
