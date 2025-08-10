"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function AddMachineForm() {
  // Normaliza texto: quita tildes, espacios extra y pasa a minúsculas
  function normalize(str: string) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  const [machines, setMachines] = useState<{ id: number; name: string; imageUrl?: string }[]>([]);
  const fetchMachines = async () => {
    try {
      const res = await fetch("/api/machine?all=1");
      const data = await res.json();
      if (Array.isArray(data)) setMachines(data);
      else if (Array.isArray(data.machines)) setMachines(data.machines);
      else if (Array.isArray(data.data)) setMachines(data.data);
    } catch {}
  };
  useEffect(() => {
    fetchMachines();
  }, []);
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [muscleSearch, setMuscleSearch] = useState("");
  const [showMuscleModal, setShowMuscleModal] = useState(false);
  const [newMuscle, setNewMuscle] = useState("");
  const [muscleError, setMuscleError] = useState("");
  const [muscles, setMuscles] = useState<{ id: number; name: string }[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newType, setNewType] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [typeError, setTypeError] = useState("");
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    typeId: "",
    mainMuscle: "",
    description: "",
    muscleIds: [] as string[]
  });
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    fetch("/api/machinetype")
      .then((res) => res.json())
      .then((data) => setTypes(data));
    fetch("/api/muscle")
      .then((res) => res.json())
      .then((data) => setMuscles(data));
  }, []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user?.isAdmin) {
    return <div className="text-red-500 font-bold p-8">Solo administradores pueden agregar ejercicios.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, typeId: e.target.value });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("typeId", form.typeId);
      formData.append("mainMuscle", form.mainMuscle);
      formData.append("description", form.description);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (form.muscleIds && form.muscleIds.length > 0) {
        form.muscleIds.forEach(id => formData.append("muscles", id));
      }
      const res = await fetch("/api/machine", {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess("Ejercicio creado exitosamente.");
        setForm({ name: "", typeId: "", mainMuscle: "", description: "", muscleIds: [] });
        setImageFile(null);
        setImagePreview(null);
        await fetchMachines();
      } else {
        if (res.status === 409) {
          setError("Ya existe un ejercicio/máquina con ese nombre.");
        } else {
          setError(json.error || "Error al crear ejercicio.");
        }
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-gray-900 border-2 border-green-600 rounded-3xl shadow-2xl p-8 mt-8 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Agregar nuevo ejercicio/máquina</h2>
      {error && <div className="text-red-500 text-center mb-2 animate-shake">{error}</div>}
      {success && <div className="text-green-500 text-center mb-2 animate-fade-in">{success}</div>}
      <div>
        <label className="block mb-2 text-sm font-semibold text-green-600">Nombre</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className={`w-full px-4 py-2 rounded-lg border border-green-600 bg-black text-white ${machines.some(m => normalize(m.name) === normalize(form.name)) ? "border-red-500" : ""}`}
          placeholder="Ej: Press de banca"
        />
        {/* Live feedback: show matching exercises */}
        {form.name.trim().length > 0 && (
          <div className="mt-2">
            <div className="text-green-400 text-xs mb-1">Ejercicios/máquinas similares:</div>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-green-700 bg-black">
              {machines.filter(m => normalize(m.name).includes(normalize(form.name))).length > 0 ? (
                machines.filter(m => normalize(m.name).includes(normalize(form.name))).map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-1 border-b border-green-800 last:border-b-0">
                    {m.imageUrl && <img src={m.imageUrl} alt={m.name} className="h-8 w-8 rounded border border-green-600 object-cover" />}
                    <span className={`font-bold ${normalize(m.name) === normalize(form.name) ? "text-red-400" : "text-green-300"}`}>{m.name}</span>
                    {normalize(m.name) === normalize(form.name) && (
                      <span className="ml-2 text-xs text-red-400 font-bold">(Ya existe)</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-1 text-gray-400">No hay coincidencias</div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-end gap-2 relative">
        <div className="flex-1">
          <label className="block mb-2 text-sm font-semibold text-green-600">Tipo</label>
          <div>
            <button
              type="button"
              className={`w-full px-4 py-2 rounded-lg border border-green-600 bg-black text-white text-left ${!form.typeId ? 'text-gray-400' : ''}`}
              onClick={() => setShowTypeDropdown((v) => !v)}
            >
              {form.typeId
                ? types.find(t => t.id === Number(form.typeId))?.name
                : "Selecciona un tipo..."}
            </button>
            {showTypeDropdown && (
              <div className="absolute z-10 w-full bg-gray-900 border-2 border-green-600 rounded-xl shadow-xl mt-2">
                <input
                  type="text"
                  value={typeSearch}
                  onChange={e => setTypeSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-t-xl border-b border-green-600 bg-black text-white"
                  placeholder="Buscar tipo..."
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto">
                  {types
                    .filter(type => type.name.toLowerCase().includes(typeSearch.toLowerCase()))
                    .map(type => (
                      <button
                        key={type.id}
                        type="button"
                        className={`w-full text-left px-4 py-2 hover:bg-green-800 ${form.typeId == String(type.id) ? 'bg-green-700 text-white' : 'text-green-300'}`}
                        onClick={() => {
                          setForm({ ...form, typeId: String(type.id) });
                          setShowTypeDropdown(false);
                        }}
                      >
                        <span className="font-bold">{type.name}</span>
                      </button>
                    ))}
                  {types.filter(type => type.name.toLowerCase().includes(typeSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-gray-400">No hay resultados</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold shadow hover:bg-green-800 transition"
          onClick={() => { setShowTypeModal(true); setTypeError(""); }}
        >
          +
        </button>
      </div>

      {/* Modal para agregar tipo */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-green-600 rounded-2xl p-8 w-full max-w-xs shadow-2xl relative">
            <button className="absolute top-2 right-3 text-green-600 text-xl font-bold" onClick={() => setShowTypeModal(false)}>&times;</button>
            <h3 className="text-lg font-bold text-green-600 mb-4">Agregar tipo de máquina</h3>
            <input
              type="text"
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-green-600 bg-black text-white mb-3"
              placeholder="Ej: Fuerza, Cardio, etc."
              autoFocus
            />
            {/* Live feedback: show matching types */}
            {newType.trim().length > 0 && (
              <div className="mb-3">
                <div className="text-green-400 text-xs mb-1">Tipos existentes con ese nombre:</div>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-green-700 bg-black">
                  {types.filter(t => t.name.toLowerCase().includes(newType.trim().toLowerCase())).length > 0 ? (
                    types.filter(t => t.name.toLowerCase().includes(newType.trim().toLowerCase())).map(t => (
                      <div key={t.id} className="px-3 py-1 text-green-300 border-b border-green-800 last:border-b-0">
                        <span className="font-bold">{t.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-1 text-gray-400">No hay coincidencias</div>
                  )}
                </div>
              </div>
            )}
            <textarea
              value={newTypeDesc}
              onChange={e => setNewTypeDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-green-600 bg-black text-white mb-3"
              placeholder="Descripción del tipo (obligatoria)"
              rows={2}
            />
            {typeError && <div className="text-red-500 text-sm mb-2">{typeError}</div>}
            <button
              type="button"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-md shadow hover:bg-green-800 transition"
              onClick={async () => {
                setTypeError("");
                if (newType.trim().length < 2) {
                  setTypeError("El nombre debe tener al menos 2 caracteres.");
                  return;
                }
                if (newTypeDesc.trim().length < 2) {
                  setTypeError("La descripción es obligatoria y debe tener al menos 2 caracteres.");
                  return;
                }
                if (types.some(t => t.name.toLowerCase() === newType.trim().toLowerCase())) {
                  setTypeError("Ya existe un tipo con ese nombre.");
                  return;
                }
                const res = await fetch("/api/machinetype", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newType, description: newTypeDesc })
                });
                const data = await res.json();
                if (res.ok) {
                  setTypes([...types, data]);
                  setNewType("");
                  setNewTypeDesc("");
                  setShowTypeModal(false);
                } else {
                  setTypeError(data.error || "Error al agregar tipo.");
                }
              }}
            >Agregar</button>
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 relative">
        <div className="flex-1">
          <label className="block mb-2 text-sm font-semibold text-green-600">Músculos principales</label>
          <div>
            <button
              type="button"
              className={`w-full px-4 py-2 rounded-lg border border-green-600 bg-black text-white text-left ${!form.muscleIds?.length ? 'text-gray-400' : ''}`}
              onClick={() => setShowMuscleDropdown((v) => !v)}
            >
              {form.muscleIds?.length
                ? muscles.filter(m => form.muscleIds.includes(String(m.id))).map(m => m.name).join(", ")
                : "Selecciona músculos..."}
            </button>
            {showMuscleDropdown && (
              <div className="absolute z-10 w-full bg-gray-900 border-2 border-green-600 rounded-xl shadow-xl mt-2">
                <input
                  type="text"
                  value={muscleSearch}
                  onChange={e => setMuscleSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-t-xl border-b border-green-600 bg-black text-white"
                  placeholder="Buscar músculo..."
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto">
                  {muscles
                    .filter(muscle => muscle.name.toLowerCase().includes(muscleSearch.toLowerCase()))
                    .map(muscle => (
                      <button
                        key={muscle.id}
                        type="button"
                        className={`w-full text-left px-4 py-2 hover:bg-green-800 ${form.muscleIds?.includes(String(muscle.id)) ? 'bg-green-700 text-white' : 'text-green-300'}`}
                        onClick={() => {
                          const idStr = String(muscle.id);
                          setForm({
                            ...form,
                            muscleIds: form.muscleIds?.includes(idStr)
                              ? form.muscleIds.filter(id => id !== idStr)
                              : [...(form.muscleIds || []), idStr]
                          });
                        }}
                      >
                        <span className="font-bold">{muscle.name}</span>
                      </button>
                    ))}
                  {muscles.filter(muscle => muscle.name.toLowerCase().includes(muscleSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-gray-400">No hay resultados</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold shadow hover:bg-green-800 transition"
          onClick={() => { setShowMuscleModal(true); setMuscleError(""); }}
        >
          +
        </button>
      </div>

      {/* Modal para agregar músculo */}
      {showMuscleModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-green-600 rounded-2xl p-8 w-full max-w-xs shadow-2xl relative">
            <button className="absolute top-2 right-3 text-green-600 text-xl font-bold" onClick={() => setShowMuscleModal(false)}>&times;</button>
            <h3 className="text-lg font-bold text-green-600 mb-4">Agregar músculo</h3>
            <input
              type="text"
              value={newMuscle}
              onChange={e => setNewMuscle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-green-600 bg-black text-white mb-3"
              placeholder="Ej: Pecho, Espalda, Pierna..."
              autoFocus
            />
            {/* Live feedback: show matching muscles */}
            {newMuscle.trim().length > 0 && (
              <div className="mb-3">
                <div className="text-green-400 text-xs mb-1">Músculos existentes con ese nombre:</div>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-green-700 bg-black">
                  {muscles.filter(m => m.name.toLowerCase().includes(newMuscle.trim().toLowerCase())).length > 0 ? (
                    muscles.filter(m => m.name.toLowerCase().includes(newMuscle.trim().toLowerCase())).map(m => (
                      <div key={m.id} className="px-3 py-1 text-green-300 border-b border-green-800 last:border-b-0">
                        <span className="font-bold">{m.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-1 text-gray-400">No hay coincidencias</div>
                  )}
                </div>
              </div>
            )}
            {muscleError && <div className="text-red-500 text-sm mb-2">{muscleError}</div>}
            <button
              type="button"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-md shadow hover:bg-green-800 transition"
              onClick={async () => {
                setMuscleError("");
                if (newMuscle.trim().length < 2) {
                  setMuscleError("El nombre debe tener al menos 2 caracteres.");
                  return;
                }
                if (muscles.some(m => m.name.toLowerCase() === newMuscle.trim().toLowerCase())) {
                  setMuscleError("Ya existe un músculo con ese nombre.");
                  return;
                }
                try {
                  const res = await fetch("/api/muscle", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newMuscle })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setMuscles([...muscles, data]);
                    setNewMuscle("");
                    setShowMuscleModal(false);
                  } else {
                    setMuscleError(data.error || "Error al agregar músculo.");
                  }
                } catch {
                  setMuscleError("No se pudo conectar con el servidor.");
                }
              }}
            >Agregar</button>
          </div>
        </div>
      )}
      <div>
        <label className="block mb-2 text-sm font-semibold text-green-600">Imagen (archivo local)</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 rounded-lg border border-green-600 bg-black text-white" />
        {imageFile && (
          <div className="mt-2 text-green-400 text-xs">Imagen seleccionada: {imageFile.name}</div>
        )}
        {imagePreview && (
          <div className="mt-4 flex flex-col items-center">
            <span className="text-green-600 text-xs mb-1">Vista previa:</span>
            <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg border-2 border-green-600" />
          </div>
        )}
      </div>
      <div>
        <label className="block mb-2 text-sm font-semibold text-green-600">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-green-600 bg-black text-white" placeholder="Describe el ejercicio, si aísla el músculo, recomendaciones, etc." />
      </div>
      <button
        type="submit"
        disabled={loading || machines.some(m => normalize(m.name) === normalize(form.name))}
        className={`w-full bg-green-600 text-white py-3 rounded-lg font-extrabold text-lg shadow-lg hover:bg-green-800 transition-transform duration-200 tracking-wide ${machines.some(m => normalize(m.name) === normalize(form.name)) ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {loading ? "Guardando..." : machines.some(m => normalize(m.name) === normalize(form.name)) ? "Ya existe ese ejercicio" : "Agregar ejercicio"}
      </button>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </form>
  );
}
