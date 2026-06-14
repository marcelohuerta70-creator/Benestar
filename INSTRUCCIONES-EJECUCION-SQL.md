# INSTRUCCIONES: EJECUTAR SQL EN SUPABASE

## ⚠️ PRE-REQUISITO: BACKUP

Antes de hacer cualquier cosa:

1. Ve a **Supabase Console** → **Database** → **Backups**
2. Click en **"Create manual backup"**
3. Espera a que termine

---

## PASO 1: LIMPIAR TABLAS VIEJAS

Archivo: `1-DROP-TABLES-OLD.sql`

1. Ve a Supabase Console → **SQL Editor**
2. Click **"New query"**
3. **Copia y pega** el contenido de `1-DROP-TABLES-OLD.sql`
4. Click **"RUN"** (botón verde)
5. Espera mensaje: `✅ Todas las tablas eliminadas`

---

## PASO 2: CREAR SCHEMA NUEVO

Archivo: `2-CREATE-SCHEMA-FINAL.sql`

1. Ve a Supabase Console → **SQL Editor**
2. Click **"New query"**
3. **Copia y pega** el contenido de `2-CREATE-SCHEMA-FINAL.sql`
4. Click **"RUN"** (botón verde)
5. Espera mensaje: `✅ Schema creado exitosamente`

---

## VERIFICACIÓN

Después de ejecutar, verifica que todo esté bien:

### En Supabase Console → Table Editor, deberías ver:
- ✅ `pacientes` (45 campos)
- ✅ `consultas` (20 campos)
- ✅ `mediciones_antropometria` (28 campos)
- ✅ `mediciones_bioimpedancia` (17 campos)
- ✅ `medicamentos`
- ✅ `planes`
- ✅ `suplementos`
- ✅ `notas_clinicas`
- ✅ `citas`
- ✅ `examenes`
- ✅ `perfiles_profesionales`
- ✅ `paciente_profesional`

### En Supabase Console → Authentication, deberías tener:
- ✅ Tu usuario profesional (que creaste)
- ✅ RLS habilitado en todas las tablas

---

## TROUBLESHOOTING

### Si da error en PASO 1:
- Es normal si algunas tablas no existen
- El script usa `DROP IF EXISTS`, así que ignora los errores de "no existe"

### Si da error en PASO 2:
- Revisa que hayas ejecutado el PASO 1 primero
- Si dice "UUID extension does not exist", corre esto primero:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

### Si la app no funciona después:
- Probablemente es porque el código TypeScript espera diferentes nombres de campos
- Pero validamos que los nombres coincidan exactamente, así que debería funcionar
- Si hay un campo faltante, revisa los documentos:
  - `ANALISIS-CAMPOS-EXHAUSTIVO.md`
  - `VALIDACION-CAMPOS-CRITICOS.md`

---

## DESPUÉS DE CREAR EL SCHEMA

### En tu código Next.js, asegúrate que:

1. **Supabase está inicializado** (`lib/supabase.ts`)
   ```typescript
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

2. **Las variables de entorno están configuradas** (`.env.local`)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. **Los tipos en `lib/types.ts` coinciden** con el schema de BD
   - Verificamos que coinciden al 100%

4. **RLS está habilitado** en producción
   - Para desarrollo, puedes desactivarlo momentáneamente

---

## ✅ CHECKLIST FINAL

- [ ] Hiciste backup en Supabase
- [ ] Ejecutaste `1-DROP-TABLES-OLD.sql` sin errores
- [ ] Ejecutaste `2-CREATE-SCHEMA-FINAL.sql` sin errores
- [ ] Ves las 12 tablas en Table Editor
- [ ] Las variables de entorno están correctas
- [ ] Reiniciaste la app Next.js (si estaba corriendo)

Si todo está ✅, la app debería funcionar sin cambios de código.

---

## DUDAS

Si algo falla:
1. Revisa los documentos de análisis
2. Verifica los nombres de campos coincidan
3. Chequea que no haya typos en la ejecución del SQL

No hay "modificaciones posteriores necesarias" - el SQL está validado al 100%.
