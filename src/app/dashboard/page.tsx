"use client";

import { useState } from "react";

const menuItems = [
  { key: "inicio", label: "Inicio", icon: "🏠" },
  { key: "perfil", label: "Perfil", icon: "👤" },
  { key: "rutinas", label: "Rutinas", icon: "💪" },
  { key: "progreso", label: "Progreso", icon: "📈" },
  { key: "ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function Dashboard() {
  const [active, setActive] = useState("inicio");
  const user = { name: "Ignacio" };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Barra lateral */}
      <aside className="w-64 bg-gray-950 border-r border-green-700 flex flex-col py-8 px-4 space-y-4">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-extrabold text-green-500">🏋️‍♂️ GymApp</span>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150
                ${active === item.key ? "bg-green-700 text-white" : "text-green-300 hover:bg-green-800 hover:text-white"}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Barra superior */}
        <header className="h-20 bg-gray-950 border-b border-green-700 flex items-center justify-between px-8">
          <div className="text-xl font-bold text-orange-400">
            {menuItems.find(item => item.key === active)?.label}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-300 font-semibold">Gymrat: {user.name}</span>
          </div>
        </header>
        {/* Contenido dinámico */}
        <main className="flex-1 p-8 bg-gradient-to-br from-gray-900 via-green-900 to-orange-900">
          {active === "inicio" && (
            <div className="text-3xl font-extrabold text-green-400">¡Bienvenido al Dashboard!</div>
          )}
          {active === "perfil" && (
            <div className="text-xl text-orange-400">Aquí irá el perfil del usuario.</div>
          )}
          {active === "rutinas" && (
            <div className="text-xl text-green-400">Aquí irán las rutinas de entrenamiento.</div>
          )}
          {active === "progreso" && (
            <div className="text-xl text-orange-400">Aquí verás tu progreso.</div>
          )}
          {active === "ajustes" && (
            <div className="text-xl text-green-400">Configuración y ajustes.</div>
          )}
        </main>
      </div>
    </div>
  );
}
