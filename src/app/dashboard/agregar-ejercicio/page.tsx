"use client";
import AddMachineForm from "../components/AddMachineForm";
import { useAuth } from "@/context/AuthContext";

export default function AgregarEjercicioPage() {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return <div className="text-red-500 font-bold p-8">Solo administradores pueden agregar ejercicios.</div>;
  }
  return <AddMachineForm />;
}
