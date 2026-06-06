/**
 * ARCHIVO DE CONFIGURACIÓN DE SUPABASE
 * =====================================
 * Pasos para activar la base de datos en la nube (GRATIS):
 *
 * 1. Creá una cuenta en https://supabase.com
 *    (podés entrar directamente con tu cuenta de GitHub, es gratis)
 *
 * 2. Creá un proyecto nuevo (elegí la región más cercana, ej. South America)
 *
 * 3. Una vez creado el proyecto, andá a "SQL Editor" (menú de la izquierda)
 *    y ejecutá este comando para crear la tabla:
 *
 *      create table kv (key text primary key, value jsonb);
 *
 * 4. Andá a Settings > API (menú de la izquierda)
 *    - Copiá el "Project URL"  → pegalo en SUPABASE_URL abajo
 *    - Copiá el "anon public" key → pegalo en SUPABASE_KEY abajo
 *
 * 5. Guardá este archivo y listo. La próxima vez que abras la web
 *    se conectará automáticamente a Supabase.
 */

window.SUPABASE_URL = 'TU_PROJECT_URL_AQUI';   // ej: https://xyzxyzxyz.supabase.co
window.SUPABASE_KEY = 'TU_ANON_KEY_AQUI';       // ej: eyJhbGciOiJIUzI1NiIsIn...
