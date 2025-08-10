// Centraliza la lógica de autenticación y llamadas API relacionadas

export async function login(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error de login");
  // El token ya está en la cookie, no se retorna
  return true;
}

export async function fetchUserInfo() {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("No autenticado");
  return await res.json();
}

export async function fetchUserData() {
  const res = await fetch("/api/userdata");
  if (!res.ok) throw new Error("No se pudo obtener datos de usuario");
  return await res.json();
}

export async function logout() {
  // Elimina la cookie del token en el backend
  await fetch("/api/logout", { method: "POST" });
}
