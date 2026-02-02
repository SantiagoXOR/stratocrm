---
name: Primera Etapa CRM Inmobiliario
overview: Transformar el boilerplate en un CRM funcional con layout completo, gestión de leads (CRUD), dashboard con métricas y componentes UI necesarios usando shadcn/ui.
todos:
  - id: add-ui-components
    content: "Instalar componentes UI de shadcn/ui: input, table, dialog, select, badge, separator, avatar, dropdown-menu, label, textarea, skeleton, alert-dialog"
    status: pending
  - id: create-layout-components
    content: "Crear componentes de layout: Sidebar.tsx, Header.tsx, UserMenu.tsx con navegación y diseño responsive"
    status: pending
    dependencies:
      - add-ui-components
  - id: update-dashboard-layout
    content: Actualizar layout.tsx del dashboard para integrar Sidebar y Header
    status: pending
    dependencies:
      - create-layout-components
  - id: create-leads-api
    content: "Crear API routes: /api/leads/route.ts (GET, POST) y /api/leads/[id]/route.ts (GET, PUT, DELETE) con validación y paginación"
    status: pending
  - id: create-leads-components
    content: "Crear componentes de leads: LeadsTable.tsx, LeadForm.tsx, LeadDialog.tsx, LeadFilters.tsx, LeadActions.tsx"
    status: pending
    dependencies:
      - add-ui-components
      - create-leads-api
  - id: create-leads-page
    content: Crear página /leads/page.tsx integrando todos los componentes de leads con funcionalidad CRUD completa
    status: pending
    dependencies:
      - create-leads-components
  - id: create-dashboard-components
    content: "Crear componentes del dashboard: StatsCards.tsx, LeadsChart.tsx, RecentLeads.tsx con métricas y gráficos"
    status: pending
    dependencies:
      - add-ui-components
      - create-leads-api
  - id: update-dashboard-page
    content: Actualizar página /dashboard/page.tsx con métricas, gráficos y leads recientes
    status: pending
    dependencies:
      - create-dashboard-components
  - id: create-lead-detail
    content: Crear página /leads/[id]/page.tsx y componente LeadDetail.tsx para ver información completa del lead
    status: pending
    dependencies:
      - create-leads-api
      - add-ui-components
  - id: improve-signin-page
    content: Mejorar página de login usando componentes shadcn/ui manteniendo funcionalidad existente
    status: pending
    dependencies:
      - add-ui-components
  - id: configure-toaster
    content: Agregar Toaster de sonner en layout.tsx principal para notificaciones globales
    status: pending
---

# Primera Etapa - CRM Inmobiliario STRATO

## Objetivo

Transformar el boilerplate actual en un CRM funcional con gestión completa de leads, dashboard con métricas y una interfaz profesional.

## Estado Actual

- ✅ Next.js 16 + TypeScript + Prisma configurado
- ✅ Autenticación con NextAuth funcionando
- ✅ Esquema de base de datos completo (Lead, User, Event, Conversation)
- ✅ Sistema de roles (ADMIN, ANALISTA, VENDEDOR)
- ✅ Validación con Zod (`leadSchema` en `src/lib/validators.ts`)
- ⚠️ Solo 2 componentes UI (Button, Card)
- ⚠️ Layout básico sin sidebar
- ⚠️ Dashboard sin funcionalidad

## Implementación

### 1. Agregar Componentes UI de shadcn/ui

Instalar los siguientes componentes usando `npx shadcn-ui@latest add`:

- `input` - Para formularios
- `table` - Para listar leads
- `dialog` - Para modales de crear/editar
- `select` - Para dropdowns (estado, origen)
- `badge` - Para mostrar estados
- `separator` - Para dividir secciones
- `avatar` - Para mostrar usuarios
- `dropdown-menu` - Para menús de acciones
- `label` - Para etiquetas de formularios
- `textarea` - Para campos de texto largo (notas)
- `skeleton` - Para estados de carga
- `alert-dialog` - Para confirmaciones de eliminación

### 2. Crear Layout del Dashboard Completo

**Archivo: [src/app/(dashboard)/layout.tsx](src/app/\\\\(dashboard)/layout.tsx)**

- Reemplazar el layout básico actual
- Integrar Sidebar y Header como componentes

**Nuevo: [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)**

- Navegación lateral con menú
- Enlaces: Dashboard, Leads, Conversaciones (placeholder)
- Indicador de rol del usuario
- Diseño responsive con colapso en móvil
- Usar `lucide-react` para iconos

**Nuevo: [src/components/layout/Header.tsx](src/components/layout/Header.tsx)**

- Barra superior con título y acciones
- Integrar UserMenu

**Nuevo: [src/components/layout/UserMenu.tsx](src/components/layout/UserMenu.tsx)**

- Menú dropdown con Avatar
- Mostrar nombre, email y rol
- Botón de logout usando `signOut` de next-auth

### 3. Configurar API Routes para Leads

**Nuevo: [src/app/api/leads/route.ts](src/app/api/leads/route.ts)**

- `GET`: Listar leads con paginación, filtros y búsqueda
- Query params: `page`, `limit`, `estado`, `origen`, `search`, `sortBy`, `sortOrder`
- Retornar total de registros para paginación
- `POST`: Crear nuevo lead
- Validar con `leadSchema` de `src/lib/validators.ts`
- Usar `db` de `src/lib/db.ts`
- Retornar lead creado

**Nuevo: [src/app/api/leads/[id]/route.ts](src/app/api/leads/[id]/route.ts)**

- `GET`: Obtener lead por ID con relaciones (events, conversations)
- `PUT`: Actualizar lead existente
- Validar con `leadSchema`
- Actualizar `updatedAt` automáticamente
- `DELETE`: Eliminar lead (hard delete)
- Verificar permisos según rol si es necesario

### 4. Crear Funciones Helper para API (Opcional)

**Nuevo: [src/lib/api.ts](src/lib/api.ts)**

- Funciones helper para llamadas API si no se usa tRPC
- Tipos TypeScript para requests/responses
- Manejo de errores centralizado

### 5. Implementar Gestión de Leads

**Nuevo: [src/app/(dashboard)/leads/page.tsx](src/app/\\\\(dashboard)/leads/page.tsx)**

- Página principal de gestión de leads
- Integrar LeadsTable, LeadFilters y botón para crear lead
- Estado para filtros y paginación

**Nuevo: [src/components/leads/LeadsTable.tsx](src/components/leads/LeadsTable.tsx)**

- Tabla con columnas: nombre, teléfono, email, estado, origen, fecha creación
- Paginación con controles
- Ordenamiento por columnas (click en header)
- Acciones por fila (editar, eliminar, ver detalles)
- Estados de carga con Skeleton
- Usar componente `table` de shadcn/ui

**Nuevo: [src/components/leads/LeadForm.tsx](src/components/leads/LeadForm.tsx)**

- Formulario reutilizable para crear/editar
- Usar `react-hook-form` con `@hookform/resolvers/zod`
- Validación con `leadSchema`
- Campos: nombre, dni, teléfono, email, ingresos, zona, producto, monto, origen, estado, notas
- Manejo de errores y estados de carga

**Nuevo: [src/components/leads/LeadDialog.tsx](src/components/leads/LeadDialog.tsx)**

- Modal para crear/editar lead
- Integrar LeadForm
- Llamadas API para crear/actualizar
- Notificaciones con `sonner` (toast)
- Cerrar y refrescar lista al guardar

**Nuevo: [src/components/leads/LeadFilters.tsx](src/components/leads/LeadFilters.tsx)**

- Filtros: estado (select), origen (select), búsqueda (input)
- Botón para limpiar filtros
- Usar componentes shadcn/ui

**Nuevo: [src/components/leads/LeadActions.tsx](src/components/leads/LeadActions.tsx)**

- Dropdown menu con acciones: editar, eliminar, ver detalles
- Confirmación de eliminación con AlertDialog
- Navegación a página de detalle

### 6. Mejorar Dashboard Principal

**Modificar: [src/app/(dashboard)/dashboard/page.tsx](src/app/\\\\(dashboard)/dashboard/page.tsx)**

- Reemplazar contenido básico
- Integrar StatsCards, LeadsChart y RecentLeads

**Nuevo: [src/components/dashboard/StatsCards.tsx](src/components/dashboard/StatsCards.tsx)**

- Tarjetas con métricas:
- Total de leads
- Leads nuevos (últimos 7 días)
- Leads en revisión
- Leads preaprobados
- Usar componente `card` de shadcn/ui
- Iconos con `lucide-react`

**Nuevo: [src/components/dashboard/LeadsChart.tsx](src/components/dashboard/LeadsChart.tsx)**

- Gráfico de distribución de leads por estado
- Usar `recharts` (ya instalado)
- Gráfico de barras o pie chart

**Nuevo: [src/components/dashboard/RecentLeads.tsx](src/components/dashboard/RecentLeads.tsx)**

- Lista de últimos 5 leads creados
- Mostrar: nombre, teléfono, estado, fecha
- Link a página de detalle

### 7. Mejorar Página de Login

**Modificar: [src/app/auth/signin/page.tsx](src/app/auth/signin/page.tsx)**

- Reemplazar inputs HTML por componente `input` de shadcn/ui
- Mejorar diseño visual manteniendo funcionalidad
- Usar componente `button` mejorado
- Mejor manejo de estados de error

### 8. Agregar Página de Detalle de Lead

**Nuevo: [src/app/(dashboard)/leads/[id]/page.tsx](src/app/(dashboard)/leads/[id]/page.tsx)**

- Obtener lead por ID desde API
- Mostrar información completa del lead
- Secciones:
- Información básica (nombre, contacto, etc.)
- Información financiera (ingresos, monto, producto)
- Historial de eventos (últimos eventos relacionados)
- Conversaciones asociadas (placeholder)
- Botón para editar (abre LeadDialog)
- Botón para volver a lista
- Navegación breadcrumb opcional

**Nuevo: [src/components/leads/LeadDetail.tsx](src/components/leads/LeadDetail.tsx)**

- Componente para mostrar detalles del lead
- Formatear fechas con `date-fns`
- Badges para estados
- Layout organizado con cards

### 9. Configurar Toaster para Notificaciones

**Modificar: [src/app/layout.tsx](src/app/layout.tsx)**

- Agregar `<Toaster />` de `sonner` para notificaciones globales

## Consideraciones Técnicas

- Usar Server Components cuando sea posible (páginas, layout)
- Usar Client Components solo cuando sea necesario (formularios, interacciones)
- Validación en cliente (Zod) y servidor (API routes)
- Manejo de errores consistente
- Estados de carga en todas las operaciones asíncronas
- Diseño responsive (mobile-first)
- Accesibilidad básica (labels, ARIA cuando sea necesario)

## Orden de Implementación Sugerido

1. Agregar componentes UI de shadcn/ui
2. Crear layout completo (Sidebar, Header, UserMenu)
3. Configurar API routes para leads
4. Implementar página de leads con tabla y filtros
5. Crear formulario y modal de lead
6. Mejorar dashboard con métricas
7. Agregar página de detalle de lead
8. Mejorar página de login