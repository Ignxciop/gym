"use client";
import React, { useState } from "react";
// Componente modal para editar la fecha de nacimiento
function EditBirthDateModal({ currentBirthDate, onSave, onClose, email }: { currentBirthDate: string | null; onSave: (data: any) => void; onClose: () => void; email: string }) {
    // Parse currentBirthDate (yyyy-mm-dd) if exists
    let initialDay = "", initialMonth = "", initialYear = "";
    if (currentBirthDate) {
        const [y, m, d] = currentBirthDate.split("-");
        initialDay = d;
        initialMonth = m;
        initialYear = y;
    }
    const [day, setDay] = useState(initialDay);
    const [month, setMonth] = useState(initialMonth);
    const [year, setYear] = useState(initialYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        setError("");
        if (!day || !month || !year) {
            setError("Completa día, mes y año");
            return;
        }
        // Validación básica
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > new Date().getFullYear()) {
            setError("Fecha inválida");
            return;
        }
        // Validar fecha real usando new Date(year, month-1, day)
        const testDate = new Date(yearNum, monthNum - 1, dayNum);
        if (
            isNaN(testDate.getTime()) ||
            testDate.getDate() !== dayNum ||
            (testDate.getMonth() + 1) !== monthNum ||
            testDate.getFullYear() !== yearNum
        ) {
            setError("Fecha inválida");
            return;
        }
        // Confirmación solo si es la primera vez (no hay currentBirthDate)
        if (!currentBirthDate) {
            const confirmed = window.confirm("¿Estás seguro de que quieres registrar esta fecha de nacimiento? Solo podrás hacerlo una vez.");
            if (!confirmed) return;
        }
        // Armar fecha en formato yyyy-mm-dd
        const birthDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        setLoading(true);
        try {
            const res = await fetch("/api/userdata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, birthDate, updateBirthDate: true }),
            });
            const data = await res.json();
            if (res.ok) {
                onSave(data);
                onClose();
            } else {
                setError(data.error || "Error al actualizar la fecha de nacimiento");
            }
        } catch {
            setError("Error de red");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-xs shadow-2xl border-2 border-green-700">
                <h3 className="text-lg font-bold text-green-500 mb-4">Registrar fecha de nacimiento</h3>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        placeholder="DD"
                        value={day}
                        onChange={e => setDay(e.target.value.replace(/\D/g, ""))}
                        className="w-12 px-2 py-2 rounded bg-gray-800 text-white border border-green-600 focus:outline-none text-center"
                    />
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        placeholder="MM"
                        value={month}
                        onChange={e => setMonth(e.target.value.replace(/\D/g, ""))}
                        className="w-12 px-2 py-2 rounded bg-gray-800 text-white border border-green-600 focus:outline-none text-center"
                    />
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="AAAA"
                        value={year}
                        onChange={e => setYear(e.target.value.replace(/\D/g, ""))}
                        className="w-16 px-2 py-2 rounded bg-gray-800 text-white border border-green-600 focus:outline-none text-center"
                    />
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-800 disabled:opacity-60">
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal para seleccionar género
function EditGenderModal({ onSave, onClose, email }: { onSave: (g: string) => void; onClose: () => void; email: string }) {
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        setError("");
        if (!selected) {
            setError("Selecciona un género");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/userdata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, gender: selected })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al guardar género");
            onSave(selected);
            onClose();
        } catch (err: any) {
            setError(err.message || "Error al guardar género");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-xs shadow-2xl border-2 border-green-700">
                <h3 className="text-lg font-bold text-green-500 mb-4">Seleccionar género</h3>
                <div className="flex gap-4 mb-4 justify-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="modal-gender" value="M" checked={selected === "M"} onChange={() => setSelected("M")} />
                        <span>Masculino</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="modal-gender" value="F" checked={selected === "F"} onChange={() => setSelected("F")} />
                        <span>Femenino</span>
                    </label>
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-800 disabled:opacity-60">
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Formulario para agregar nuevos datos físicos del usuario
function UserDataForm({ email, onSuccess, showHeightAge, birthDate }: { email: string; onSuccess: (data: any) => void; showHeightAge: boolean; birthDate: string | null | undefined }) {
    const [weight, setWeight] = useState("");
    const [notes, setNotes] = useState("");
    const [height, setHeight] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // birthDate viene por prop desde ProfileSection

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const body: any = { email, weight: parseFloat(weight), notes };
            if (showHeightAge) {
                body.height = parseInt(height);
            }
            const res = await fetch("/api/userdata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("¡Datos actualizados!");
                setWeight("");
                setNotes("");
                setHeight("");
                onSuccess(data);
            } else {
                setError(data.error || "Error al guardar");
            }
        } catch {
            setError("Error de red");
        } finally {
            setLoading(false);
        }
    };

    // Validaciones para deshabilitar el botón y mostrar mensajes
    const noBirthDate = !birthDate;
    const heightInvalid = showHeightAge && (!height || isNaN(Number(height)) || Number(height) <= 0);
    const disableGuardar = loading || noBirthDate || heightInvalid;

    return (
        <>
            <style>{inputNumberNoArrows}</style>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                <div className="flex gap-4 flex-wrap items-end">
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        placeholder="Peso (kg)"
                        className={`px-4 py-3 rounded bg-gray-800 text-white border border-green-600 focus:outline-none ${showHeightAge ? 'w-32' : 'w-37'} text-lg hide-arrows`}
                        required
                    />
                    {showHeightAge && (
                        <input
                            type="number"
                            min="0"
                            value={height}
                            onChange={e => setHeight(e.target.value)}
                            placeholder="Estatura (cm)"
                            className="px-4 py-3 rounded bg-gray-800 text-white border border-green-600 focus:outline-none w-43 text-lg hide-arrows"
                            required
                        />
                    )}
                    <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Notas (opcional)"
                        className="px-4 py-3 rounded bg-gray-800 text-white border border-green-600 focus:outline-none flex-1 text-lg"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-800 text-white font-bold px-6 py-3 rounded text-lg shadow"
                        disabled={disableGuardar}
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
                {noBirthDate && (
                    <span className="text-yellow-400 text-base font-semibold">Debes registrar tu fecha de nacimiento para poder guardar tus datos físicos.</span>
                )}
                {heightInvalid && !noBirthDate && (
                    <span className="text-yellow-400 text-base font-semibold">Debes ingresar tu estatura para el primer registro.</span>
                )}
                {error && <span className="text-red-500 text-base font-semibold">{error}</span>}
                {success && <span className="text-green-500 text-base font-semibold">{success}</span>}
            </form>
        </>
    );
}

// Quita las flechas de los inputs type number en todos los navegadores
const inputNumberNoArrows = `
  input.hide-arrows::-webkit-outer-spin-button,
  input.hide-arrows::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input.hide-arrows {
    -moz-appearance: textfield;
  }
`;


// Aquí va la función principal del perfil, sin props, que maneja el estado y la lógica internamente

import { useAuth } from "@/context/AuthContext";

function PerfilPage() {
  const { user: authUser } = useAuth();
  const email = authUser?.email || "";
  // Estado local para user y userData
  const [user, setUser] = useState<any>({ name: '', email: '', birthDate: null, avatarUrl: '', gender: '' });
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditBirthDate, setShowEditBirthDate] = useState(false);
  const [showEditGender, setShowEditGender] = useState(false);

  // Fetch inicial de datos del usuario y su historial
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        if (!email) {
          setError('No se encontró el email del usuario.');
          setLoading(false);
          return;
        }
        // Fetch user info
        const resUser = await fetch(`/api/userinfo?email=${email}`);
        const userInfo = await resUser.json();
        // Fetch user data history
        const resData = await fetch(`/api/userdata?email=${email}`);
        const userDataArr = await resData.json();
        setUser({
          name: userInfo.name || '',
          email: userInfo.email || email,
          birthDate: userInfo.birthDate || null,
          avatarUrl: userInfo.avatarUrl || '',
          gender: userInfo.gender || '',
        });
        setUserData(Array.isArray(userDataArr) ? userDataArr : []);
      } catch (err: any) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [email]);

  // Helpers para avatar y género
  const getAvatarUrl = (u: any) => {
    if (u.avatarUrl && typeof u.avatarUrl === "string" && u.avatarUrl.trim() !== "") {
      if (u.avatarUrl.startsWith("http")) return u.avatarUrl;
      if (typeof window !== "undefined") {
        return window.location.origin + u.avatarUrl;
      }
      return u.avatarUrl;
    }
    return "";
  };
  const getGender = (u: any) => (u.gender === "M" || u.gender === "F") ? u.gender : "";
  const getGenderSaved = (u: any) => u.gender === "M" || u.gender === "F";

  // Estado para avatar y género
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File|null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [gender, setGender] = useState('');
  const [genderSuccess, setGenderSuccess] = useState("");
  const [genderError, setGenderError] = useState("");
  const [savingGender, setSavingGender] = useState(false);
  const [genderSaved, setGenderSaved] = useState(false);

  // Sincronizar avatar y género si cambia el usuario
  React.useEffect(() => {
    setAvatarPreview(getAvatarUrl(user));
    setGender(getGender(user));
    setGenderSaved(getGenderSaved(user));
  }, [user]);

  // Fecha de nacimiento actual (formato yyyy-mm-dd)
  const currentBirthDateRaw = user.birthDate ? user.birthDate.split('T')[0] : null;
  let currentBirthDate = null;
  if (currentBirthDateRaw) {
    const [y, m, d] = currentBirthDateRaw.split('-');
    currentBirthDate = `${d}-${m}-${y}`;
  }
  // Edad actual calculada
  const currentAge = userData[0]?.age || null;

  // Actualiza el último registro localmente con el objeto actualizado
  const handleBirthDateSave = async (updatedUserData: any) => {
    if (userData.length > 0) {
      const updated = [...userData];
      updated[0] = { ...updatedUserData };
      setUserData(updated);
    }
    // Refrescar datos del usuario
    if (user.email) {
      const res = await fetch(`/api/userinfo?email=${user.email}`);
      const userInfo = await res.json();
      setUser({
        ...user,
        birthDate: userInfo.birthDate || null,
        avatarUrl: userInfo.avatarUrl || "",
        gender: userInfo.gender || "",
      });
    }
  };

  // Asegura que el nuevo registro tenga createdAt para la tabla
  const handleUserDataSuccess = (newData: any) => {
    if (!newData.createdAt) {
      newData.createdAt = new Date().toISOString();
    } else if (typeof newData.createdAt === 'number') {
      newData.createdAt = new Date(newData.createdAt).toISOString();
    }
    setUserData([newData, ...userData]);
  };

  // Input ref para click en círculo
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  // Maneja el cambio de archivo de avatar y guarda automáticamente
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError("");
    setAvatarSuccess("");
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        formData.append("email", user.email || "");
        const res = await fetch("/api/userdata", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          setAvatarSuccess("Foto de perfil actualizada");
          if (user.email) {
            const res = await fetch(`/api/userinfo?email=${user.email}`);
            const userInfo = await res.json();
            setUser({
              ...user,
              avatarUrl: userInfo.avatarUrl || data.avatarUrl || "",
              gender: userInfo.gender || user.gender || "",
              birthDate: userInfo.birthDate || user.birthDate || null,
            });
            setAvatarPreview(getAvatarUrl(userInfo));
          }
        } else {
          setAvatarError(data.error || "Error al subir imagen");
        }
      } catch (err: any) {
        setAvatarError(err.message || "Error al subir imagen");
      }
    }
  };

  // Click en círculo de avatar
  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  // Guardar género
  const handleGenderSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenderError("");
    setGenderSuccess("");
    setSavingGender(true);
    try {
      const res = await fetch("/api/userdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, gender })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar género");
      setGenderSuccess("Género guardado correctamente");
      setGenderSaved(true);
      if (user.email) {
        const res = await fetch(`/api/userinfo?email=${user.email}`);
        const userInfo = await res.json();
        setUser({
          ...user,
          gender: userInfo.gender || data.gender || "",
          avatarUrl: userInfo.avatarUrl || user.avatarUrl || "",
          birthDate: userInfo.birthDate || user.birthDate || null,
        });
      }
    } catch (err: any) {
      setGenderError(err.message || "Error al guardar género");
    } finally {
      setSavingGender(false);
    }
  };

  // Mostrar loading o error
  if (loading) {
    return <div className="text-center text-green-400 text-xl font-bold mt-20">Cargando perfil...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 text-xl font-bold mt-20">{error}</div>;
  }

  // Solo mostrar campos de estatura y fecha de nacimiento si no hay datos previos
  const showHeightAge = userData.length === 0;

  return (
    <div className="max-w-4xl mx-auto bg-black/60 rounded-2xl shadow-2xl p-14 border-2 border-green-600 mt-12 backdrop-blur-md">
      {/* Dos columnas principales: izquierda (avatar, correo, edad), derecha (nombre, fecha de nacimiento, género) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-3 gap-x-20 gap-y-8 mb-12 items-center">
        {/* Fila 1: Avatar y Nombre */}
        <div className="flex justify-center sm:justify-start">
          <div className="relative flex-shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-green-500 bg-gray-800 shadow-lg hover:opacity-90 transition cursor-pointer"
                onClick={handleAvatarClick}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full border-4 border-green-500 bg-gray-800 flex items-center justify-center text-gray-500 text-4xl font-bold cursor-pointer shadow-lg hover:opacity-90 transition"
                onClick={handleAvatarClick}
              >
                {/* Sin imagen */}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center min-w-0 w-full">
          <div className="text-white text-2xl font-semibold mb-1">Nombre:</div>
          <div className="text-green-300 text-3xl font-extrabold mb-2 break-all"><span>{user.name}</span></div>
        </div>
        {/* Fila 2: Correo y Fecha de nacimiento */}
        <div className="flex flex-col justify-center min-w-0 w-full">
          <div className="text-white text-2xl font-semibold mb-1">Correo:</div>
          <div className="text-green-300 text-2xl font-extrabold mb-2 break-all"><span>{user.email}</span></div>
        </div>
        <div className="flex flex-col justify-center min-w-0 w-full">
          <div className="text-white text-2xl font-semibold mb-1">Fecha de nacimiento:</div>
          {user.birthDate ? (
            <div className="text-green-300 text-2xl font-extrabold mb-2 break-all"><span>{currentBirthDate}</span></div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-xl font-bold">No registrado</span>
              <button
                className="text-green-400 underline text-base font-medium px-2 py-1 rounded hover:text-green-200 transition border border-green-700"
                onClick={() => setShowEditBirthDate(true)}
              >Registrar</button>
            </div>
          )}
        </div>
        {/* Fila 3: Edad y Género */}
        <div className="flex flex-col justify-center min-w-0 w-full">
          <div className="text-white text-2xl font-semibold mb-1">Edad:</div>
          <div className="text-green-300 text-2xl font-extrabold mb-1">{currentAge ? `${currentAge} años` : '--'}</div>
        </div>
        <div className="flex flex-col justify-center min-w-0 w-full">
          <div className="text-white text-2xl font-semibold mb-1">Género:</div>
          {user.gender === 'M' || user.gender === 'F' ? (
            <div className="text-green-300 text-2xl font-extrabold mb-1">{user.gender === 'M' ? 'Masculino' : 'Femenino'}</div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-400 text-xl font-bold">No registrado</span>
              <button
                className="text-green-400 underline text-base font-medium px-2 py-1 rounded hover:text-green-200 transition border border-green-700"
                onClick={() => setShowEditGender(true)}
              >Registrar</button>
            </div>
          )}
        </div>
      </div>
      {/* Resto de la info (formulario) */}
      {avatarSuccess && <div className="text-green-500 text-sm text-center mb-2">{avatarSuccess}</div>}
      {avatarError && <div className="text-red-500 text-sm text-center mb-2">{avatarError}</div>}
      <div className="mb-4">
        <UserDataForm
          email={user.email || ''}
          onSuccess={handleUserDataSuccess}
          showHeightAge={showHeightAge}
          birthDate={user.birthDate}
        />
      </div>

      {/* Tabla de historial de datos físicos */}
      {userData.length > 0 && (
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full bg-gray-900 rounded-xl shadow border border-green-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-green-400 text-lg font-bold text-left">Fecha</th>
                <th className="px-4 py-3 text-green-400 text-lg font-bold text-left">Peso (kg)</th>
                <th className="px-4 py-3 text-green-400 text-lg font-bold text-left">Nota</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((row, idx) => {
                let fecha = '--';
                let d = null;
                const dateValue = row.date;
                if (dateValue) {
                  if (typeof dateValue === 'string' && !isNaN(Date.parse(dateValue))) {
                    d = new Date(dateValue);
                  } else if (typeof dateValue === 'number') {
                    d = new Date(dateValue);
                  } else if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
                    d = new Date(Number(dateValue));
                  }
                }
                if (d && !isNaN(d.getTime())) {
                  fecha = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                }
                return (
                  <tr key={row.id || idx} className="border-t border-green-800 hover:bg-gray-800/60 transition">
                    <td className="px-4 py-2 text-green-200 text-base font-semibold">{fecha}</td>
                    <td className="px-4 py-2 text-green-200 text-base font-semibold">{row.weight ?? '--'}</td>
                    <td className="px-4 py-2 text-green-200 text-base font-semibold">{row.notes ?? '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showEditBirthDate && (
        <EditBirthDateModal
          currentBirthDate={user.birthDate ?? null}
          onSave={handleBirthDateSave}
          onClose={() => setShowEditBirthDate(false)}
          email={user.email || ''}
        />
      )}
      {showEditGender && (
        <EditGenderModal
          onSave={g => {
            setGender(g);
            setShowEditGender(false);
          }}
          onClose={() => setShowEditGender(false)}
          email={user.email || ''}
        />
      )}
    </div>
  );
}

export default PerfilPage;
