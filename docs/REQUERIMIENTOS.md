# Requerimientos - Primera Etapa CRM Inmobiliario STRATO

## 📋 Índice

1. [Requerimientos Funcionales](#requerimientos-funcionales)
2. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
3. [Requerimientos Técnicos](#requerimientos-técnicos)
4. [Casos de Uso](#casos-de-uso)
5. [Modelo de Datos](#modelo-de-datos)
6. [Interfaz de Usuario](#interfaz-de-usuario)

## 🎯 Requerimientos Funcionales

### RF-01: Autenticación y Autorización

**RF-01.1**: El sistema debe permitir autenticación de usuarios mediante email y contraseña.

**RF-01.2**: El sistema debe mantener sesiones de usuario mediante JWT.

**RF-01.3**: El sistema debe implementar tres roles:
- **ADMIN**: Acceso completo al sistema
- **ANALISTA**: Acceso a gestión de leads y análisis
- **VENDEDOR**: Acceso limitado a gestión de leads asignados

**RF-01.4**: El sistema debe proteger rutas según el rol del usuario.

**RF-01.5**: El sistema debe permitir cerrar sesión de forma segura.

### RF-02: Gestión de Leads

**RF-02.1**: El sistema debe permitir crear nuevos leads con la siguiente información:
- Nombre (requerido)
- DNI (opcional, único)
- CUIL (opcional)
- Teléfono (requerido)
- Email (opcional, validado)
- Ingresos (opcional, numérico)
- Zona (opcional)
- Producto (opcional)
- Monto (opcional, numérico)
- Origen (opcional: whatsapp, instagram, facebook, comentario, web, ads)
- Estado (default: NUEVO)
- Agencia (opcional)
- Banco (opcional)
- Trabajo actual (opcional)
- Notas (opcional)
- Tags (opcional)
- Campos personalizados (opcional)

**RF-02.2**: El sistema debe permitir listar leads con:
- Paginación (configurable)
- Filtros por estado
- Filtros por origen
- Búsqueda por nombre, teléfono o email
- Ordenamiento por cualquier columna
- Información de total de registros

**RF-02.3**: El sistema debe permitir editar leads existentes.

**RF-02.4**: El sistema debe permitir eliminar leads (hard delete).

**RF-02.5**: El sistema debe permitir ver el detalle completo de un lead incluyendo:
- Información básica
- Información financiera
- Historial de eventos
- Conversaciones asociadas

**RF-02.6**: El sistema debe validar datos de leads antes de guardar:
- Validación en cliente (tiempo real)
- Validación en servidor (seguridad)

**RF-02.7**: El sistema debe mostrar estados de leads con badges visuales:
- NUEVO
- EN_REVISION
- PREAPROBADO
- RECHAZADO
- DOC_PENDIENTE
- DERIVADO

### RF-03: Dashboard

**RF-03.1**: El dashboard debe mostrar métricas principales:
- Total de leads
- Leads nuevos (últimos 7 días)
- Leads en revisión
- Leads preaprobados

**RF-03.2**: El dashboard debe mostrar gráfico de distribución de leads por estado.

**RF-03.3**: El dashboard debe mostrar lista de últimos 5 leads creados con:
- Nombre
- Teléfono
- Estado
- Fecha de creación
- Link a detalle

**RF-03.4**: Las métricas deben actualizarse en tiempo real.

### RF-04: Interfaz de Usuario

**RF-04.1**: El sistema debe tener un layout consistente con:
- Sidebar de navegación
- Header con información del usuario
- Área de contenido principal

**RF-04.2**: El sidebar debe incluir:
- Enlace a Dashboard
- Enlace a Leads
- Enlace a Conversaciones (placeholder)
- Indicador de rol del usuario

**RF-04.3**: El header debe incluir:
- Título de la aplicación
- Menú del usuario con:
  - Nombre y email
  - Rol
  - Botón de logout

**RF-04.4**: La interfaz debe ser responsive:
- Adaptable a móviles
- Adaptable a tablets
- Adaptable a desktop

**RF-04.5**: El sistema debe mostrar notificaciones toast para:
- Operaciones exitosas
- Errores
- Advertencias

**RF-04.6**: El sistema debe mostrar estados de carga durante operaciones asíncronas.

### RF-05: API REST

**RF-05.1**: El sistema debe exponer endpoints REST para:
- GET /api/leads - Listar leads
- POST /api/leads - Crear lead
- GET /api/leads/[id] - Obtener lead
- PUT /api/leads/[id] - Actualizar lead
- DELETE /api/leads/[id] - Eliminar lead

**RF-05.2**: Los endpoints deben retornar respuestas JSON estructuradas.

**RF-05.3**: Los endpoints deben manejar errores de forma consistente.

**RF-05.4**: Los endpoints deben validar datos de entrada.

## 🔧 Requerimientos No Funcionales

### RNF-01: Rendimiento

**RNF-01.1**: El tiempo de carga inicial de la aplicación no debe exceder 3 segundos.

**RNF-01.2**: Las consultas a la base de datos deben optimizarse con índices apropiados.

**RNF-01.3**: La paginación debe ser eficiente para listas grandes (>1000 registros).

**RNF-01.4**: Las operaciones CRUD deben completarse en menos de 1 segundo.

### RNF-02: Escalabilidad

**RNF-02.1**: El sistema debe soportar al menos 10,000 leads sin degradación de rendimiento.

**RNF-02.2**: La arquitectura debe permitir escalamiento horizontal.

**RNF-02.3**: La base de datos debe estar optimizada para consultas frecuentes.

### RNF-03: Seguridad

**RNF-03.1**: Todas las comunicaciones deben usar HTTPS en producción.

**RNF-03.2**: Las contraseñas deben almacenarse con hash bcrypt.

**RNF-03.3**: Los tokens JWT deben tener expiración configurable.

**RNF-03.4**: El sistema debe validar y sanitizar todas las entradas de usuario.

**RNF-03.5**: El sistema debe implementar protección CSRF.

### RNF-04: Usabilidad

**RNF-04.1**: La interfaz debe ser intuitiva y fácil de usar.

**RNF-04.2**: Los mensajes de error deben ser claros y accionables.

**RNF-04.3**: El sistema debe proporcionar feedback inmediato a las acciones del usuario.

**RNF-04.4**: La navegación debe ser consistente en toda la aplicación.

### RNF-05: Mantenibilidad

**RNF-05.1**: El código debe seguir estándares de TypeScript.

**RNF-05.2**: El código debe estar documentado apropiadamente.

**RNF-05.3**: El sistema debe usar componentes reutilizables.

**RNF-05.4**: El sistema debe tener tests automatizados.

### RNF-06: Accesibilidad

**RNF-06.1**: El sistema debe cumplir con WCAG 2.1 nivel AA.

**RNF-06.2**: Todos los elementos interactivos deben ser accesibles por teclado.

**RNF-06.3**: Los formularios deben tener labels apropiados.

**RNF-06.4**: El contraste de colores debe cumplir estándares.

## 💻 Requerimientos Técnicos

### RT-01: Tecnologías

**RT-01.1**: Frontend:
- Next.js 14+ con App Router
- TypeScript 5+
- React 18+
- Tailwind CSS 3+
- shadcn/ui
- React Hook Form
- Zod
- Recharts

**RT-01.2**: Backend:
- Next.js API Routes
- Prisma ORM
- NextAuth.js
- PostgreSQL (Supabase)

**RT-01.3**: Herramientas:
- ESLint
- Prettier
- Vitest
- Playwright

### RT-02: Base de Datos

**RT-02.1**: El sistema debe usar PostgreSQL como base de datos.

**RT-02.2**: El esquema debe estar definido en Prisma.

**RT-02.3**: Las migraciones deben ser versionadas.

**RT-02.4**: Los índices deben estar optimizados para consultas frecuentes.

### RT-03: Arquitectura

**RT-03.1**: El sistema debe usar Server Components cuando sea posible.

**RT-03.2**: Client Components solo para interacciones.

**RT-03.3**: Separación clara entre lógica de negocio y presentación.

**RT-03.4**: API routes para operaciones CRUD.

### RT-04: Validación

**RT-04.1**: Validación en cliente con Zod.

**RT-04.2**: Validación en servidor con Zod.

**RT-04.3**: Mensajes de error descriptivos.

## 📖 Casos de Uso

### CU-01: Iniciar Sesión

**Actor**: Usuario (ADMIN, ANALISTA, VENDEDOR)

**Precondiciones**: Usuario tiene cuenta válida

**Flujo Principal**:
1. Usuario accede a `/auth/signin`
2. Usuario ingresa email y contraseña
3. Sistema valida credenciales
4. Sistema crea sesión
5. Sistema redirige a `/dashboard`

**Flujo Alternativo 3a**: Credenciales inválidas
- Sistema muestra mensaje de error
- Usuario puede reintentar

**Postcondiciones**: Usuario autenticado y en dashboard

### CU-02: Crear Lead

**Actor**: Usuario autenticado

**Precondiciones**: Usuario tiene sesión activa

**Flujo Principal**:
1. Usuario navega a `/leads`
2. Usuario hace click en "Nuevo Lead"
3. Sistema muestra modal con formulario
4. Usuario completa información requerida
5. Usuario hace click en "Guardar"
6. Sistema valida datos
7. Sistema crea lead
8. Sistema muestra notificación de éxito
9. Sistema cierra modal y actualiza lista

**Flujo Alternativo 6a**: Datos inválidos
- Sistema muestra errores de validación
- Usuario corrige y reintenta

**Postcondiciones**: Nuevo lead creado en sistema

### CU-03: Listar Leads

**Actor**: Usuario autenticado

**Precondiciones**: Usuario tiene sesión activa

**Flujo Principal**:
1. Usuario navega a `/leads`
2. Sistema carga lista de leads (página 1)
3. Sistema muestra tabla con leads
4. Usuario puede:
   - Cambiar de página
   - Aplicar filtros
   - Buscar
   - Ordenar por columna

**Postcondiciones**: Usuario ve lista de leads

### CU-04: Editar Lead

**Actor**: Usuario autenticado

**Precondiciones**: Lead existe en sistema

**Flujo Principal**:
1. Usuario navega a `/leads`
2. Usuario hace click en acciones de un lead
3. Usuario selecciona "Editar"
4. Sistema muestra modal con formulario prellenado
5. Usuario modifica información
6. Usuario hace click en "Guardar"
7. Sistema valida datos
8. Sistema actualiza lead
9. Sistema muestra notificación de éxito
10. Sistema cierra modal y actualiza lista

**Postcondiciones**: Lead actualizado

### CU-05: Eliminar Lead

**Actor**: Usuario autenticado (preferiblemente ADMIN)

**Precondiciones**: Lead existe en sistema

**Flujo Principal**:
1. Usuario navega a `/leads`
2. Usuario hace click en acciones de un lead
3. Usuario selecciona "Eliminar"
4. Sistema muestra diálogo de confirmación
5. Usuario confirma eliminación
6. Sistema elimina lead
7. Sistema muestra notificación de éxito
8. Sistema actualiza lista

**Flujo Alternativo 5a**: Usuario cancela
- Sistema cierra diálogo
- No se elimina lead

**Postcondiciones**: Lead eliminado del sistema

### CU-06: Ver Detalle de Lead

**Actor**: Usuario autenticado

**Precondiciones**: Lead existe en sistema

**Flujo Principal**:
1. Usuario navega a `/leads`
2. Usuario hace click en un lead o en "Ver detalles"
3. Sistema navega a `/leads/[id]`
4. Sistema carga información completa del lead
5. Sistema muestra:
   - Información básica
   - Información financiera
   - Historial de eventos
   - Conversaciones asociadas
6. Usuario puede editar o volver a lista

**Postcondiciones**: Usuario ve detalle completo del lead

### CU-07: Filtrar Leads

**Actor**: Usuario autenticado

**Precondiciones**: Usuario está en `/leads`

**Flujo Principal**:
1. Usuario aplica filtros (estado, origen, búsqueda)
2. Sistema actualiza lista según filtros
3. Usuario puede limpiar filtros
4. Sistema muestra lista sin filtros

**Postcondiciones**: Lista filtrada según criterios

### CU-08: Ver Dashboard

**Actor**: Usuario autenticado

**Precondiciones**: Usuario tiene sesión activa

**Flujo Principal**:
1. Usuario accede a `/dashboard`
2. Sistema carga métricas
3. Sistema muestra:
   - Tarjetas de estadísticas
   - Gráfico de distribución
   - Leads recientes
4. Métricas se actualizan automáticamente

**Postcondiciones**: Usuario ve dashboard con métricas

## 🗄️ Modelo de Datos

### Entidad: Lead

**Atributos**:
- `id` (String, PK, CUID)
- `nombre` (String, requerido)
- `dni` (String, opcional, único)
- `cuil` (String, opcional)
- `telefono` (String, requerido, indexado)
- `email` (String, opcional)
- `ingresos` (Int, opcional)
- `zona` (String, opcional)
- `producto` (String, opcional)
- `monto` (Int, opcional)
- `origen` (String, opcional, indexado)
- `utmSource` (String, opcional)
- `estado` (String, default: "NUEVO", indexado)
- `agencia` (String, opcional)
- `banco` (String, opcional)
- `trabajo_actual` (String, opcional)
- `notas` (String, opcional)
- `whatsappId` (String, opcional, único, indexado)
- `tags` (String, opcional)
- `customFields` (String, opcional, JSON)
- `createdAt` (DateTime, indexado)
- `updatedAt` (DateTime)

**Relaciones**:
- `events` (One-to-Many con Event)
- `conversations` (One-to-Many con Conversation)
- `syncLogs` (One-to-Many con WhatsAppSync)

**Índices**:
- `telefono`
- `estado`
- `createdAt`
- `origen`
- `whatsappId`

### Entidad: Event

**Atributos**:
- `id` (String, PK, CUID)
- `leadId` (String, FK, indexado)
- `tipo` (String, indexado)
- `payload` (String, opcional, JSON)
- `createdAt` (DateTime, indexado)

**Relaciones**:
- `lead` (Many-to-One con Lead)

### Entidad: User

**Atributos**:
- `id` (String, PK, CUID)
- `nombre` (String, requerido)
- `email` (String, único)
- `hash` (String, requerido)
- `rol` (String, default: "VENDEDOR")
- `createdAt` (DateTime)

**Relaciones**:
- `assignedConversations` (One-to-Many con Conversation)
- `createdAssistants` (One-to-Many con Assistant)

### Estados de Lead

Valores permitidos:
- `NUEVO`
- `EN_REVISION`
- `PREAPROBADO`
- `RECHAZADO`
- `DOC_PENDIENTE`
- `DERIVADO`

### Orígenes de Lead

Valores permitidos:
- `whatsapp`
- `instagram`
- `facebook`
- `comentario`
- `web`
- `ads`

## 🎨 Interfaz de Usuario

### Diseño General

**Principios**:
- Diseño limpio y moderno
- Colores consistentes
- Tipografía legible
- Espaciado adecuado

**Componentes Principales**:
- Sidebar: Navegación lateral, 250px ancho
- Header: Barra superior, 64px altura
- Content: Área principal, responsive

### Pantallas

**Login**:
- Formulario centrado
- Campos: email, contraseña
- Botón de envío
- Mensajes de error

**Dashboard**:
- Grid de tarjetas de métricas (4 columnas)
- Gráfico central
- Lista de leads recientes

**Lista de Leads**:
- Filtros en la parte superior
- Tabla con paginación
- Botón "Nuevo Lead"
- Acciones por fila

**Detalle de Lead**:
- Secciones organizadas en cards
- Información agrupada lógicamente
- Botones de acción

### Responsive

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptaciones**:
- Sidebar colapsable en móvil
- Tabla con scroll horizontal en móvil
- Grid de métricas: 1 columna móvil, 2 tablet, 4 desktop

---

**Versión**: 1.0.0  
**Fecha**: 2024  
**Estado**: Aprobado para Primera Etapa

