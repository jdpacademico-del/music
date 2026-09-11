-- ============================================================
-- MOISESMUSIC — Esquema de Base de Datos para Supabase (Plan Gratis)
-- Ejecuta este script completo en el "SQL Editor" de tu panel de Supabase.
-- ============================================================

-- 1. Tabla de Contenidos del Sitio (Títulos, Textos y Enlaces Generales)
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla de Eventos y Fechas de Conciertos (Tour)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE,
  day_str TEXT NOT NULL,
  month_year_str TEXT NOT NULL,
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  tag TEXT,
  button_text TEXT DEFAULT 'BOLETOS' NOT NULL,
  ticket_url TEXT DEFAULT '#' NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Discografía y Lanzamientos (Música)
CREATE TABLE IF NOT EXISTS public.music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- SENCILLO, EP, ÁLBUM, COLABORACIÓN
  year TEXT,
  meta TEXT,
  stream_url TEXT DEFAULT '#' NOT NULL,
  cover_url TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabla de Galería de Fotos
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabla de Noticias y Entradas del Blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_str TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT DEFAULT '#' NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- Permite lectura pública para los visitantes del sitio y
-- escritura/edición únicamente para administradores autenticados.
-- ============================================================

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas para site_content
CREATE POLICY "Lectura pública de site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admin inserción de site_content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin actualización de site_content" ON public.site_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin eliminación de site_content" ON public.site_content FOR DELETE TO authenticated USING (true);

-- Políticas para events
CREATE POLICY "Lectura pública de events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin inserción de events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin actualización de events" ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin eliminación de events" ON public.events FOR DELETE TO authenticated USING (true);

-- Políticas para music
CREATE POLICY "Lectura pública de music" ON public.music FOR SELECT USING (true);
CREATE POLICY "Admin inserción de music" ON public.music FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin actualización de music" ON public.music FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin eliminación de music" ON public.music FOR DELETE TO authenticated USING (true);

-- Políticas para gallery
CREATE POLICY "Lectura pública de gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admin inserción de gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin actualización de gallery" ON public.gallery FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin eliminación de gallery" ON public.gallery FOR DELETE TO authenticated USING (true);

-- Políticas para blog_posts
CREATE POLICY "Lectura pública de blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin inserción de blog_posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin actualización de blog_posts" ON public.blog_posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin eliminación de blog_posts" ON public.blog_posts FOR DELETE TO authenticated USING (true);

-- ============================================================
-- DATOS SEMILLA INICIALES (Contenido actual del sitio)
-- ============================================================

INSERT INTO public.site_content (key, value, description) VALUES
  ('topbar_text', '#NuevaMúsica — escucha el último sencillo de MoisesMusic', 'Texto de la barra de aviso superior'),
  ('hero_tag', '#NuevaMúsica', 'Etiqueta superior en Inicio'),
  ('hero_title', 'MÚSICA QUE <em>HABLA</em><br>DE LO QUE VIVIMOS', 'Título principal del Hero en Inicio'),
  ('hero_subtitle', 'Sitio oficial de MoisesMusic. Nuevo sencillo disponible ahora — conciertos, historias y todo el proyecto musical en un solo lugar.', 'Subtítulo del Hero'),
  ('hero_music_btn_url', '#musica', 'Enlace del botón Escuchar música en Hero'),
  ('hero_tour_btn_url', '#tour', 'Enlace del botón Ver fechas de tour en Hero'),
  ('next_event_title', '14 Noviembre — Bogotá', 'Título del próximo evento en la barra ticker'),
  ('next_event_venue', 'Teatro Principal', 'Recinto del próximo evento en la barra ticker'),
  ('next_event_link', '#tour', 'Enlace del próximo evento en la barra ticker'),
  ('bio_title', 'MOISESMUSIC ES <em>HISTORIA, RITMO</em><br>Y UN MENSAJE QUE CONECTA', 'Título principal de la sección Bio'),
  ('bio_text', 'Este es el espacio para contar la historia de MoisesMusic: de dónde viene el proyecto, qué lo inspira y hacia dónde va. Reemplaza este texto con la biografía real — orígenes, influencias musicales, momentos clave de la carrera y la visión detrás de cada canción.', 'Texto de biografía'),
  ('stat_years', '10+', 'Años de carrera'),
  ('stat_concerts', '50+', 'Conciertos realizados'),
  ('stat_projects', '3', 'Proyectos lanzados'),
  ('shop_title', 'MIRA NUESTROS <em>PRODUCTOS</em>', 'Título de la tienda'),
  ('shop_btn_url', '#', 'Enlace del botón Visitar la tienda'),
  ('contact_email', 'contacto@moisesmusic.com', 'Email principal de contacto'),
  ('booking_email', 'booking@moisesmusic.com', 'Email para booking y prensa'),
  ('whatsapp_url', 'https://wa.me/000000000000', 'Enlace o número de WhatsApp'),
  ('instagram_url', 'https://instagram.com/moisesmusic', 'Enlace de perfil de Instagram'),
  ('facebook_url', 'https://facebook.com/moisesmusic', 'Enlace de perfil de Facebook'),
  ('twitter_url', 'https://x.com/moisesmusic', 'Enlace de perfil de X (Twitter)'),
  ('youtube_url', 'https://www.youtube.com/@moisesmusic', 'Enlace de canal de YouTube'),
  ('spotify_url', 'https://open.spotify.com/artist/moisesmusic', 'Enlace de artista en Spotify'),
  ('apple_music_url', 'https://music.apple.com/artist/moisesmusic', 'Enlace de Apple Music')
ON CONFLICT (key) DO NOTHING;

-- Eventos iniciales
INSERT INTO public.events (day_str, month_year_str, city, venue, tag, button_text, ticket_url, display_order) VALUES
  ('14', 'NOV 2026', 'Bogotá, Colombia', 'Teatro Principal', 'POCOS BOLETOS', 'BOLETOS', '#', 1),
  ('02', 'DIC 2026', 'Medellín, Colombia', 'Auditorio Central', NULL, 'BOLETOS', '#', 2),
  ('18', 'ENE 2027', 'Barranquilla, Colombia', 'Plaza de Eventos', NULL, 'BOLETOS', '#', 3),
  ('09', 'FEB 2027', 'Ciudad de México, México', 'Por confirmar', NULL, 'NOTIFICARME', '#', 4)
ON CONFLICT DO NOTHING;

-- Música inicial
INSERT INTO public.music (title, category, year, meta, stream_url, display_order) VALUES
  ('Título del sencillo', 'SENCILLO', '2026', 'Disponible en todas las plataformas', 'https://open.spotify.com/artist/moisesmusic', 1),
  ('Segundo sencillo', 'SENCILLO', '2025', 'Disponible en todas las plataformas', 'https://open.spotify.com/artist/moisesmusic', 2),
  ('Nombre del EP', 'EP', '2025', 'Disponible en todas las plataformas', 'https://open.spotify.com/artist/moisesmusic', 3),
  ('Nombre del álbum', 'ÁLBUM', '2024', 'Disponible en todas las plataformas', 'https://open.spotify.com/artist/moisesmusic', 4),
  ('Título del sencillo 3', 'SENCILLO', '2024', 'Disponible en todas las plataformas', 'https://open.spotify.com/artist/moisesmusic', 5),
  ('Título con artista invitado', 'COLABORACIÓN', '2024', 'Disponible en todas las plataformas', 'https://open.spotify.com/artist/moisesmusic', 6)
ON CONFLICT DO NOTHING;
