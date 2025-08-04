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
    <div className="flex min-h-screen bg-black">
      {/* Barra lateral */}
      <aside className="w-64 bg-gray-900 border-r-2 border-green-600 flex flex-col py-8 px-4 space-y-4">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-extrabold text-green-600">🏋️‍♂️ GymApp</span>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-150
                ${active === item.key ? "bg-green-600 text-white" : "text-gray-300 hover:bg-green-900 hover:text-green-400"}`}
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
        <header className="h-20 bg-gray-900 border-b-2 border-green-600 flex items-center justify-between px-8">
          <div className="text-xl font-bold text-white">
            {menuItems.find(item => item.key === active)?.label}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-600 font-semibold">Gymrat: {user.name}</span>
            <button
              onClick={() => {
                // Aquí puedes agregar la lógica real de logout
                window.location.href = "/";
              }}
              className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        {/* Contenido dinámico */}
        <main className="flex-1 p-8 bg-black">
          {active === "inicio" && (
            <div className="text-3xl font-extrabold text-green-600">¡Bienvenido al Dashboard!</div>
          )}
          {active === "perfil" && (
            <div className="text-xl text-gray-300">Aquí irá el perfil del usuario.</div>
          )}
          {active === "rutinas" && (
            <div className="text-xl text-green-600">Aquí irán las rutinas de entrenamiento.</div>
          )}
          {active === "progreso" && (
            <div className="text-xl text-gray-300">Aquí verás tu progreso.</div>
          )}
          {active === "ajustes" && (
            <div className="text-xl text-green-600">Configuración y ajustes.</div>
          )}
        </main>
      </div>
    </div>
  );
}
