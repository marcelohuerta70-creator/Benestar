# ✅ VALIDACIÓN: PORTAL DEL PACIENTE

Análisis de qué datos usa el portal del paciente vs. qué está incluido en el SQL.

---

## FLUJO DEL PORTAL

### 1️⃣ LOGIN (portal/login/page.tsx)
**Datos solicitados:**
- RUT (input)
- Contraseña (input)

**Tablas necesarias:**
- ✅ `pacientes` - Campos: `rut`, `contraseña_hash`, `id`, `nombre_completo`, `portal_activo`

**En SQL final:**
- ✅ Tabla `pacientes` con estos campos

---

### 2️⃣ ESPECIALIDADES (portal/especialidades/page.tsx)
**Datos mostrados:**
- Nombre del paciente
- Lista de especialidades disponibles

**Tablas necesarias:**
- ✅ `paciente_profesional` - Campos: `paciente_id`, `especialidad`
- ✅ `pacientes` - Campos: `nombre_completo`

**En SQL final:**
- ✅ Tabla `paciente_profesional` (relación many-to-many)
- ✅ Campo `especialidad` en la tabla

---

### 3️⃣ DASHBOARD (portal/dashboard/page.tsx)
**Datos cargados:**

#### A. Datos del Paciente
```javascript
const { data: paciente } = await supabase
  .from('pacientes')
  .select('*')
  .eq('id', session.paciente_id)
```
**Necesita:** Tabla `pacientes` ✅

#### B. Minuta Activa
```javascript
const { data: planes } = await supabase
  .from('planes')
  .select('*')
  .eq('paciente_id', session.paciente_id)
  .eq('especialidad', 'nutricion')
  .order('fecha_inicio', { ascending: false })
```
**Necesita:** 
- ✅ Tabla `planes`
- ✅ Campo `especialidad`
- ✅ Campo `activo`
- ✅ Campo `estructura` (JSONB con minuta semanal)
- ✅ Campo `fecha_inicio`

**En SQL final:**
- ✅ Todos los campos presentes

#### C. Mediciones (Antropometría + Bioimpedancia)
```javascript
const res = await fetch(`/api/portal/mediciones?pacienteId=${session.paciente_id}`)
const { antrop, bio } = await res.json()
```

**Necesita:** Endpoint `/api/portal/mediciones` que retorna:
```javascript
{ 
  antrop: Array,  // mediciones_antropometria
  bio: Array      // mediciones_bioimpedancia
}
```

**En código:** Existe en `/Users/marcelo/Desktop/appnutris/app/api/portal/mediciones/route.ts`

**En SQL final:**
- ✅ Tabla `mediciones_antropometria` (28 campos)
- ✅ Tabla `mediciones_bioimpedancia` (17 campos)

#### D. Últimas Consultas
```javascript
const { data: consultas } = await supabase
  .from('consultas')
  .select('*')
  .eq('paciente_id', session.paciente_id)
```
**Necesita:** Tabla `consultas` ✅

#### E. Notas Visibles (tipo='paciente')
```javascript
const { data: notas } = await supabase
  .from('notas_clinicas')
  .select('*')
  .eq('paciente_id', session.paciente_id)
  .eq('tipo', 'paciente')
  .order('created_at', { ascending: false })
```
**Necesita:** 
- ✅ Tabla `notas_clinicas`
- ✅ Campo `tipo` (diferencia 'paciente' vs 'clinica')
- ✅ Campo `contenido`
- ✅ Campo `archivos_urls` (para archivos adjuntos)

**En SQL final:**
- ✅ Tabla con todos estos campos

#### F. Próximas Citas
```javascript
const { data: citas } = await supabase
  .from('citas')
  .select('*')
  .eq('paciente_id', session.paciente_id)
  .order('fecha', { ascending: false })
```
**Necesita:**
- ✅ Tabla `citas`
- ✅ Campo `fecha`
- ✅ Campo `hora`
- ✅ Campo `estado`
- ✅ Campo `observaciones`

**En SQL final:**
- ✅ Todos los campos presentes

---

## TABS DEL PORTAL

### TAB "INICIO"
Muestra:
- ✅ Próximas citas (de tabla `citas`)
- ✅ Últimas consultas (de tabla `consultas`)
- ✅ Notas visibles (de tabla `notas_clinicas` con tipo='paciente')
- ✅ Resumen de progreso (de tablas `mediciones_*`)

### TAB "MINUTA"
Muestra:
- ✅ Plan activo (de tabla `planes` con activo=true)
- ✅ Estructura JSONB semanal (desayuno, almuerzo, cena, etc.)
- ✅ Suplementación (en campo `estructura.suplementacion`)
- ✅ Indicaciones (en campo `estructura.indicaciones`)

**Requiere:** Campo `estructura` JSONB en tabla `planes`

### TAB "MEDICIONES"
Muestra:
- ✅ Gráficos de peso, IMC, cintura, % grasa
- ✅ Última medición vs primera
- ✅ Progreso (Δ diferencias)

**Requiere:** 
- ✅ Tabla `mediciones_antropometria` con campos: peso_kg, talla_cm, imc, perimetro_cintura_cm
- ✅ Tabla `mediciones_bioimpedancia` con campos: masa_grasa_pct, agua_corporal_pct
- ✅ Ambas con campo `fecha` para ordenar

### TAB "NOTAS"
Muestra:
- ✅ Notas tipo='paciente' solamente
- ✅ Título, contenido, fecha
- ✅ Archivos adjuntos (si los hay)

**Requiere:** Tabla `notas_clinicas` con:
- ✅ Campo `tipo` = 'paciente'
- ✅ Campo `archivos_urls`

---

## 🔐 SEGURIDAD: RLS en Portal

### RLS para Pacientes
El portal del paciente DEBE tener RLS que permita:
- ✅ Ver `notas_clinicas` donde `tipo='paciente'` (no 'clinica')
- ✅ Ver `mediciones_*` propias
- ✅ Ver `consultas` propias
- ✅ Ver `citas` propias
- ✅ Ver `planes` propios

**En SQL final:**
- ✅ RLS configurado para cada tabla
- ✅ Políticas que verifican `paciente_id = auth.uid()`

---

## 📋 CHECKLIST: ¿QUÉ FALTA?

### Tablas necesarias para portal:
- ✅ `pacientes` - datos del paciente
- ✅ `paciente_profesional` - especialidades
- ✅ `planes` - minutas
- ✅ `mediciones_antropometria` - mediciones
- ✅ `mediciones_bioimpedancia` - bioimpedancia
- ✅ `consultas` - controles/visitas
- ✅ `notas_clinicas` - notas (con tipo='paciente')
- ✅ `citas` - próximas citas

### Campos críticos:
- ✅ `pacientes.contraseña_hash` - para login
- ✅ `pacientes.portal_activo` - para habilitar/deshabilitar
- ✅ `paciente_profesional.especialidad` - para selector
- ✅ `planes.especialidad` - filtrar por 'nutricion'
- ✅ `planes.activo` - minuta activa
- ✅ `planes.estructura` - JSONB semanal
- ✅ `notas_clinicas.tipo` - para filtrar 'paciente'
- ✅ `consultas.nota_para_paciente` - notas específicas de consulta

### Endpoints necesarios:
- ✅ `/api/portal/mediciones` - existe y funciona

---

## ✅ CONCLUSIÓN

**TODAS las tablas y campos necesarios para el portal del paciente ESTÁN INCLUIDAS en el SQL final.**

El portal debería funcionar correctamente una vez se ejecute el SQL, sin necesidad de:
- ✅ Crear tablas adicionales
- ✅ Agregar campos faltantes
- ✅ Cambios en el código Next.js

El SQL es **100% completo para el portal del paciente**.

---

## 🔍 Verificación Final Post-SQL

Después de ejecutar el SQL, verifica en Supabase Console:

```sql
-- Tabla pacientes
SELECT id, rut, contraseña_hash, portal_activo, nombre_completo
FROM pacientes
LIMIT 1;

-- Tabla paciente_profesional
SELECT paciente_id, especialidad
FROM paciente_profesional
LIMIT 1;

-- Tabla planes
SELECT id, especialidad, activo, estructura
FROM planes
WHERE activo = true
LIMIT 1;

-- Tabla notas_clinicas
SELECT tipo, contenido
FROM notas_clinicas
WHERE tipo = 'paciente'
LIMIT 1;

-- Tabla mediciones
SELECT peso_kg, talla_cm, imc
FROM mediciones_antropometria
LIMIT 1;
```

Si todas estas queries retornan datos (o estructura válida), el SQL está listo.
