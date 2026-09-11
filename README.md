# MoisesMusic — Sitio Web Oficial

Sitio web oficial de **MoisesMusic** desarrollado en HTML5 semántico, CSS moderno y JavaScript vanilla, optimizado para despliegue rápido, gratuito y de alto rendimiento en **GitHub** y **Vercel**.

---

## 🚀 Características
- **Arquitectura Single-Page (SPA)** fluida sin recarga de página mediante enrutamiento por hash (`#inicio`, `#bio`, `#tour`, `#blog`, `#musica`, `#galeria`, `#donar`, `#contacto`).
- **Diseño 100% responsivo** y moderno optimizado para dispositivos móviles, tablets y computadoras.
- **Tipografías premium**: Fraunces (editorial/titular), Inter (lectura UI) y Syne (botones y pestañas modernas en mayúsculas).
- **Iconos vectoriales limpios (SVG)** para redes sociales: X, Facebook, Instagram, YouTube, WhatsApp y Correo.
- **Botón volver arriba ("^")** tanto al final de cada vista como en botón flotante con detección de scroll.
- **Gestor de contenidos dinámico (CMS)** integrado con **Supabase (Plan Gratis)**: edita eventos del tour, títulos, textos, discografía y redes sociales desde un panel de control con formularios y autenticación segura (`/admin`).
- **Preparado para producción** con encabezados de seguridad HTTP y caché optimizado para Vercel.

---

## ⚡ Conexión con Supabase (Plan 100% Gratuito)

Para que el administrador pueda editar eventos, títulos y canciones desde `/admin` sin tocar código:

### 1. Crear proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com) y crea una cuenta gratuita (o inicia sesión con GitHub).
2. Haz clic en **"New Project"** y asígnale un nombre (ej. `moisesmusic-db`), una contraseña segura y elige la región más cercana.

### 2. Crear las tablas de la Base de Datos
1. En tu panel de Supabase, en el menú lateral izquierdo ve a **"SQL Editor"**.
2. Abre el archivo [`supabase-schema.sql`](supabase-schema.sql) de este repositorio, copia todo su contenido, pégalo en el editor SQL de Supabase y haz clic en **"Run"**.
3. Esto creará automáticamente las tablas (`events`, `site_content`, `music`, `gallery`, `blog_posts`), los datos semilla iniciales y la seguridad **RLS (Row Level Security)**.

### 3. Crear tu Usuario Administrador
1. En el panel de Supabase, ve a **"Authentication"** > **"Users"**.
2. Haz clic en **"Add User"** > **"Create User"**.
3. Ingresa tu correo y una contraseña segura para administrar la página.

### 4. Conectar el Panel `/admin`
1. En Supabase ve a **"Project Settings"** (el engranaje abajo a la izquierda) > **"API"**.
2. Copia:
   - **Project URL**
   - **Project API Keys (`anon` / `public`)**
3. Abre tu sitio web en `/admin` (o abre `admin.html`), ve a la pestaña **"⚙️ Supabase Config"**, pega la URL y la Anon Key, y haz clic en **Guardar**.
4. ¡Inicia sesión con tu correo y contraseña! Desde ese momento, cualquier cambio que guardes en los formularios actualizará automáticamente tu página en vivo.

---

## 📦 Despliegue gratuito en GitHub + Vercel

Este proyecto no requiere compiladores, servidores complejos ni bases de datos de pago: se ejecuta como un sitio estático de velocidad ultra-rápida a través de la red perimetral (Edge CDN) gratuita de Vercel.

### 1. Subir el proyecto a GitHub

1. Abre la terminal en la carpeta del proyecto.
2. Si aún no tienes un repositorio en GitHub, crea uno nuevo en [github.com/new](https://github.com/new) (puede ser público o privado, por ejemplo `moisesmusic`).
3. Ejecuta los siguientes comandos:

```bash
# Inicializar repositorio local
git init -b main

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "feat: sitio web oficial de MoisesMusic listo para produccion"

# Vincular con tu repositorio en GitHub (reemplaza TU_USUARIO y TU_REPOSITORIO)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir el código a GitHub
git push -u origin main
```

---

### 2. Conectar y Desplegar en Vercel (100% Gratis)

1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de **GitHub**.
2. Haz clic en el botón **"Add New..."** y selecciona **"Project"**.
3. En la lista de repositorios de GitHub, busca `moisesmusic` y haz clic en **"Import"**.
4. En la pantalla de configuración:
   - **Framework Preset**: Vercel detectará automáticamente `Other` (sitio estático).
   - **Root Directory**: `./` (déjalo por defecto).
   - No necesitas configurar variables de entorno obligatorias para el diseño actual.
5. Haz clic en el botón azul **"Deploy"**.
6. ¡Listo! En menos de 20 segundos tendrás tu sitio en vivo con una URL segura con certificado SSL gratuito:
   `https://tu-proyecto.vercel.app`

---

### 3. Actualizaciones automáticas (CI/CD)

Cada vez que realices un cambio en el código y hagas un `git push`:

```bash
git add .
git commit -m "actualizacion de contenido"
git push
```

Vercel detectará el cambio y actualizará el sitio en línea de forma automática e instantánea.

---

### 4. (Opcional) Vincular un dominio propio gratuito o personalizado

En el panel de Vercel de tu proyecto:
1. Ve a **Settings** > **Domains**.
2. Escribe tu dominio (ejemplo: `moisesmusic.com` o `www.moisesmusic.com`).
3. Sigue las instrucciones de DNS que te proporciona Vercel (configurar un registro `A` o `CNAME`). Vercel generará el certificado SSL HTTPS de forma gratuita y automática.

---

## 💻 Desarrollo Local

Si deseas probar el sitio localmente antes de subirlo:

```bash
# Con Node.js instalado:
npm run dev

# O simplemente abriendo index.html en cualquier navegador web.
```
