"use client";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

type Machine = { id: number; name: string; imageUrl?: string; description?: string };
type RoutineExerciseDraft = {
  machine: Machine;
  machineId: number;
  notes: string;
  restTime: number;
  sets: number;
};
type RoutineDraft = {
  name: string;
  description: string;
  exercises: RoutineExerciseDraft[];
};

export default function RoutineManager() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RoutineDraft>({ name: "", description: "", exercises: [] });
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [exerciseDraft, setExerciseDraft] = useState<RoutineExerciseDraft | null>(null);
  const [exerciseError, setExerciseError] = useState("");

  useEffect(() => {
    fetch("/api/machine?all=1")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMachines(data);
        else if (Array.isArray(data.machines)) setMachines(data.machines);
        else if (Array.isArray(data.data)) setMachines(data.data);
      });
  }, []);

  const [machineSearch, setMachineSearch] = useState<string>("");
  const filteredMachines: Machine[] = machines.filter((m: Machine) => m.name.toLowerCase().includes(machineSearch.toLowerCase()));

  // Fetch routines
  const fetchRoutines = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/routine");
      const data = await res.json();
      setRoutines(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudo cargar rutinas");
    }
    setLoading(false);
  };
  useEffect(() => { fetchRoutines(); }, []);

  // Create routine
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          exercises: form.exercises.map((ex, idx) => ({
            machineId: ex.machineId,
            notes: ex.notes,
            restTime: ex.restTime,
            sets: ex.sets,
            order: idx + 1
          }))
        })
      });
      if (res.ok) {
        setForm({ name: "", description: "", exercises: [] });
        setShowForm(false);
        fetchRoutines();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear rutina");
      }
    } catch {
      setError("No se pudo conectar");
    }
    setLoading(false);
  };

  // Rename routine
  const handleRename = async (id: number, name: string, description: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/routine", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, description })
      });
      if (res.ok) fetchRoutines();
      else setError("Error al renombrar");
    } catch {
      setError("No se pudo conectar");
    }
    setLoading(false);
  };

  // Delete routine
  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/routine", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchRoutines();
      else setError("Error al eliminar");
    } catch {
      setError("No se pudo conectar");
    }
    setLoading(false);
  };

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  // Drag & drop handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = form.exercises.findIndex(ex => ex.machineId === active.id);
      const newIndex = form.exercises.findIndex(ex => ex.machineId === over.id);
      setForm({
        ...form,
        exercises: arrayMove(form.exercises, oldIndex, newIndex)
      });
    }
  };

  // Modal para agregar ejercicio
  const openExerciseModal = () => {
    setExerciseDraft({ machine: machines[0] || null, machineId: machines[0]?.id || 0, notes: "", restTime: 60, sets: 3 });
    setShowExerciseModal(true);
    setExerciseError("");
  };
  const handleAddExercise = () => {
    if (!exerciseDraft || !exerciseDraft.machineId) {
      setExerciseError("Selecciona una máquina");
      return;
    }
    if (form.exercises.some(ex => ex.machineId === exerciseDraft.machineId)) {
      setExerciseError("Ya agregaste esta máquina");
      return;
    }
    setForm({ ...form, exercises: [...form.exercises, exerciseDraft] });
    setShowExerciseModal(false);
    setExerciseDraft(null);
    setExerciseError("");
  };
  const handleRemoveExercise = (idx: number) => {
    setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== idx) });
  };
  const moveExercise = (idx: number, dir: "up" | "down") => {
    const arr = [...form.exercises];
    if (dir === "up" && idx > 0) {
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    }
    if (dir === "down" && idx < arr.length - 1) {
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    }
    setForm({ ...form, exercises: arr });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Tus rutinas</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button className="bg-green-600 text-white px-4 py-2 rounded mb-4" onClick={() => setShowForm(true)}>Crear nueva rutina</button>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border-2 border-green-600 rounded-xl p-4 mb-4">
          <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mb-2 px-3 py-2 rounded" required />
          <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mb-2 px-3 py-2 rounded" />
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-green-400">Ejercicios</span>
              <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded" onClick={openExerciseModal}>Agregar ejercicio</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={form.exercises.map(ex => ex.machineId)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {form.exercises.map((ex, idx) => (
                    <ExerciseItem
                      key={ex.machineId}
                      id={ex.machineId}
                      idx={idx}
                      ex={ex}
                      moveExercise={moveExercise}
                      handleRemoveExercise={handleRemoveExercise}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
          <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowForm(false)}>Cancelar</button>
        </form>
      )}

      {/* Modal para agregar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300">
          <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 shadow-2xl border border-green-500 rounded-2xl p-8 w-full max-w-md animate-fadeIn">
            <h3 className="text-2xl font-extrabold text-green-500 mb-6 text-center tracking-wide">Agregar ejercicio</h3>
            <div className="mb-4">
              <label className="block text-green-400 mb-2 font-semibold">Máquina</label>
              <input
                type="text"
                placeholder="Buscar máquina..."
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                value={machineSearch}
                onChange={e => setMachineSearch(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto rounded-lg border border-green-700 bg-gray-900/80 shadow-inner">
                {filteredMachines.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No se encontraron máquinas</div>
                ) : (
                  filteredMachines.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`flex items-center w-full px-4 py-3 gap-3 text-left rounded-lg transition-all duration-150 mb-1
                        ${exerciseDraft?.machineId === m.id ? "bg-green-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-green-900 hover:text-green-400"}`}
                      onClick={() => setExerciseDraft(exerciseDraft ? { ...exerciseDraft, machine: m, machineId: m.id } : null)}
                    >
                      {m.imageUrl && <img src={m.imageUrl} alt={m.name} className="w-10 h-10 object-cover rounded border border-green-600" />}
                      <div>
                        <span className="font-bold">{m.name}</span>
                        {m.description && <span className="block text-xs text-gray-400">{m.description}</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
              {exerciseDraft?.machine && (
                <div className="flex items-center mt-4 gap-4">
                  {exerciseDraft.machine.imageUrl && <img src={exerciseDraft.machine.imageUrl} alt={exerciseDraft.machine.name} className="w-16 h-16 object-cover rounded-lg border-2 border-green-600 shadow" />}
                  <span className="text-gray-300 text-base font-medium">{exerciseDraft.machine.description}</span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-green-400 mb-2 font-semibold">Nota/Descripción</label>
              <input type="text" value={exerciseDraft?.notes || ""} onChange={e => setExerciseDraft(exerciseDraft ? { ...exerciseDraft, notes: e.target.value } : null)} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-green-400 mb-2 font-semibold">Descanso (segundos)</label>
                <input type="number" min={0} value={exerciseDraft?.restTime || 60} onChange={e => setExerciseDraft(exerciseDraft ? { ...exerciseDraft, restTime: Number(e.target.value) } : null)} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-green-400 mb-2 font-semibold">Número de series</label>
                <input type="number" min={1} value={exerciseDraft?.sets || 3} onChange={e => setExerciseDraft(exerciseDraft ? { ...exerciseDraft, sets: Number(e.target.value) } : null)} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            {exerciseError && <div className="text-red-500 mb-4 text-center font-semibold">{exerciseError}</div>}
            <div className="flex justify-end gap-3 mt-6">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-all duration-150" onClick={handleAddExercise}>Agregar</button>
              <button className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white font-bold shadow transition-all duration-150" onClick={() => { setShowExerciseModal(false); setExerciseDraft(null); }}>Cancelar</button>
            </div>
          </div>
          <style>{`.animate-fadeIn { animation: fadeInModal 0.3s ease; } @keyframes fadeInModal { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
      )}
    </div>
  );
}

// Componente para ejercicio sortable
import React from "react";
type ExerciseItemProps = {
  id: number;
  idx: number;
  ex: RoutineExerciseDraft;
  moveExercise: (idx: number, dir: "up" | "down") => void;
  handleRemoveExercise: (idx: number) => void;
};
function ExerciseItem({ id, idx, ex, moveExercise, handleRemoveExercise }: ExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? "0 2px 8px #22c55e" : undefined,
    background: isDragging ? "#14532d" : undefined
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-gray-700 rounded p-2 flex items-center justify-between">
      <div>
        <span className="font-bold text-green-400">{ex.machine?.name}</span>
        <span className="ml-2 text-gray-300">Series: {ex.sets}, Descanso: {ex.restTime}s</span>
        {ex.notes && <span className="ml-2 text-gray-400 italic">{ex.notes}</span>}
      </div>
      <div className="flex gap-2">
        <button type="button" className="bg-gray-600 text-white px-2 py-1 rounded" onClick={() => moveExercise(idx, "up")}>↑</button>
        <button type="button" className="bg-gray-600 text-white px-2 py-1 rounded" onClick={() => moveExercise(idx, "down")}>↓</button>
        <button type="button" className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleRemoveExercise(idx)}>Eliminar</button>
      </div>
    </li>
  );
}
