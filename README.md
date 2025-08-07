# 🏋️ Gym Tracker App

Aplicación web para registrar rutinas de entrenamiento, progresos físicos y estadísticas de gimnasio.  
Desarrollada con **Next.js**, **TypeScript**, **PostgreSQL** y **Prisma**.

---

## 🚀 Características

- 🗓 Registro y gestión de rutinas semanales personalizadas
- 📊 Seguimiento de progresos: peso, repeticiones, cargas y medidas corporales
- 🏋️ Registro de ejercicios realizados y comparación con sesiones anteriores
- 🧠 Autenticación segura _(próximamente)_
- 📈 Dashboard visual con estadísticas

---

## 🧑‍💻 Tech Stack

| Tecnología                                    | Descripción                             |
| --------------------------------------------- | --------------------------------------- |
| [Next.js](https://nextjs.org/)                | Framework React para frontend y backend |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático para JS                 |
| [PostgreSQL](https://www.postgresql.org/)     | Base de datos relacional                |
| [Prisma ORM](https://www.prisma.io/)          | ORM moderno para PostgreSQL             |
| [Tailwind CSS](https://tailwindcss.com/)      | Framework de estilos CSS                |

---

## ⚡ Instalación rápida

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/Ignxciop/gym
   cd gym
   ```

2. **Instala dependencias:**

   ```bash
   npm install
   ```

3. **Configura el entorno:**

   - Copia el archivo `.env.example` a `.env` y edita la variable `DATABASE_URL` con tus credenciales de PostgreSQL.

   ```bash
   cp .env.example .env
   # Edita .env con tu editor favorito
   ```

4. **Aplica las migraciones de la base de datos:**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **(Opcional) Abre Prisma Studio para ver la base de datos:**

   ```bash
   npx prisma studio
   ```

6. **Inicia la aplicación:**

   ```bash
   npm run dev
   ```

---

## 📝 Notas

- Asegúrate de tener PostgreSQL corriendo localmente o usa un servicio en la nube.
- El proyecto está en desarrollo activo. ¡Pull requests y sugerencias son bienvenidas!
- Para desarrollo, puedes poblar la base de datos usando Prisma Studio.

---

## 📄 Licencia

MIT

---

## ✨ Autor

Ignacio — [https://github.com/Ignxciop/]
[josenunezm2001@gmail.com]

---

> Si te resulta útil, ¡dale una estrella al repo!
