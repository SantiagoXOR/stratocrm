# Primera Etapa - CRM Inmobiliario STRATO

## 📋 Objetivo

Transformar el boilerplate actual en un CRM funcional con gestión completa de leads, dashboard con métricas y una interfaz profesional.

## 🎯 Alcance

### Funcionalidades Implementadas

1. **Layout Completo del Dashboard**
   - Sidebar con navegación
   - Header con información del usuario
   - Menú de usuario con logout
   - Diseño responsive

2. **Gestión Completa de Leads (CRUD)**
   - Listar leads con paginación
   - Crear nuevos leads
   - Editar leads existentes
   - Eliminar leads
   - Ver detalle de lead
   - Filtros avanzados
   - Búsqueda
   - Ordenamiento

3. **Dashboard con Métricas**
   - Tarjetas de estadísticas
   - Gráficos de distribución
   - Lista de leads recientes

4. **Componentes UI**
   - Componentes shadcn/ui necesarios
   - Formularios con validación
   - Modales y diálogos
   - Tablas interactivas

5. **API Routes**
   - Endpoints REST para leads
   - Validación con Zod
   - Manejo de errores

## 📊 Estado Actual vs Objetivo

### Estado Inicial

- ✅ Next.js 16 + TypeScript + Prisma configurado
- ✅ Autenticación con NextAuth funcionando
- ✅ Esquema de base de datos completo
- ✅ Sistema de roles (ADMIN, ANALISTA, VENDEDOR)
- ✅ Validación con Zod (`leadSchema`)
- ⚠️ Solo 2 componentes UI (Button, Card)
- ⚠️ Layout básico sin sidebar
- ⚠️ Dashboard sin funcionalidad

### Estado Objetivo

- ✅ Layout completo con Sidebar y Header
- ✅ Gestión CRUD completa de leads
- ✅ Dashboard con métricas y gráficos
- ✅ Componentes UI necesarios instalados
- ✅ API routes funcionales
- ✅ Página de detalle de lead
- ✅ Login mejorado

## 🏗️ Arquitectura

### Estructura de Componentes

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navegación lateral
│   │   ├── Header.tsx           # Barra superior
│   │   └── UserMenu.tsx         # Menú del usuario
│   ├── leads/
│   │   ├── LeadsTable.tsx       # Tabla de leads
│   │   ├── LeadForm.tsx         # Formulario
│   │   ├── LeadDialog.tsx       # Modal crear/editar
│   │   ├── LeadFilters.tsx      # Filtros
│   │   ├── LeadActions.tsx      # Acciones por lead
│   │   └── LeadDetail.tsx       # Vista detallada
│   └── dashboard/
│       ├── StatsCards.tsx       # Tarjetas de métricas
│       ├── LeadsChart.tsx       # Gráfico de leads
│       └── RecentLeads.tsx      # Leads recientes
```

### Estructura de API

```
src/app/api/
└── leads/
    ├── route.ts                 # GET (listar), POST (crear)
    └── [id]/
        └── route.ts             # GET, PUT, DELETE
```

### Estructura de Páginas

```
src/app/(dashboard)/
├── dashboard/
│   └── page.tsx                 # Dashboard principal
├── leads/
│   ├── page.tsx                 # Lista de leads
│   └── [id]/
│       └── page.tsx             # Detalle de lead
└── layout.tsx                   # Layout del dashboard
```

## 🔧 Implementación Detallada

### 1. Componentes UI de shadcn/ui

**Componentes a instalar:**
- `input` - Campos de formulario
- `table` - Tablas de datos
- `dialog` - Modales
- `select` - Dropdowns
- `badge` - Etiquetas de estado
- `separator` - Divisores
- `avatar` - Avatares de usuario
- `dropdown-menu` - Menús contextuales
- `label` - Etiquetas de formulario
- `textarea` - Campos de texto largo
- `skeleton` - Estados de carga
- `alert-dialog` - Confirmaciones

**Comando:**
```bash
npx shadcn-ui@latest add input table dialog select badge separator avatar dropdown-menu label textarea skeleton alert-dialog
```

### 2. Layout del Dashboard

#### Sidebar.tsx
- Navegación principal
- Enlaces: Dashboard, Leads, Conversaciones (placeholder)
- Indicador de rol del usuario
- Colapso en móvil
- Iconos con lucide-react

#### Header.tsx
- Título de la aplicación
- Integración de UserMenu
- Barra superior fija

#### UserMenu.tsx
- Avatar del usuario
- Información: nombre, email, rol
- Botón de logout
- Dropdown menu

### 3. API Routes para Leads

#### GET /api/leads
**Funcionalidad:**
- Listar leads con paginación
- Filtros: estado, origen, búsqueda
- Ordenamiento: sortBy, sortOrder
- Retornar total para paginación

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 10
  estado?: string;      // Filtro por estado
  origen?: string;      // Filtro por origen
  search?: string;      // Búsqueda general
  sortBy?: string;     // Campo para ordenar
  sortOrder?: 'asc' | 'desc';  // Dirección
}
```

**Response:**
```typescript
{
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### POST /api/leads
**Funcionalidad:**
- Crear nuevo lead
- Validar con `leadSchema`
- Retornar lead creado

**Body:**
```typescript
LeadInput // Según leadSchema
```

#### GET /api/leads/[id]
**Funcionalidad:**
- Obtener lead por ID
- Incluir relaciones: events, conversations

#### PUT /api/leads/[id]
**Funcionalidad:**
- Actualizar lead existente
- Validar con `leadSchema`
- Actualizar `updatedAt` automáticamente

#### DELETE /api/leads/[id]
**Funcionalidad:**
- Eliminar lead (hard delete)
- Verificar permisos según rol

### 4. Gestión de Leads

#### LeadsTable.tsx
**Características:**
- Columnas: nombre, teléfono, email, estado, origen, fecha
- Paginación con controles
- Ordenamiento por columnas (click en header)
- Acciones por fila (editar, eliminar, ver detalles)
- Estados de carga con Skeleton
- Responsive

#### LeadForm.tsx
**Características:**
- Formulario reutilizable (crear/editar)
- React Hook Form con Zod resolver
- Validación en tiempo real
- Campos:
  - nombre (requerido)
  - dni (opcional, único)
  - telefono (requerido)
  - email (opcional, validado)
  - ingresos (opcional, número)
  - zona (opcional)
  - producto (opcional)
  - monto (opcional, número)
  - origen (select: whatsapp, instagram, facebook, comentario, web, ads)
  - estado (select: NUEVO, EN_REVISION, PREAPROBADO, RECHAZADO, DOC_PENDIENTE, DERIVADO)
  - notas (textarea)

#### LeadDialog.tsx
**Características:**
- Modal para crear/editar
- Integra LeadForm
- Llamadas API
- Notificaciones con sonner
- Cerrar y refrescar lista al guardar

#### LeadFilters.tsx
**Características:**
- Filtro por estado (select)
- Filtro por origen (select)
- Búsqueda por texto (input)
- Botón limpiar filtros
- Actualización en tiempo real

#### LeadActions.tsx
**Características:**
- Dropdown menu por lead
- Acciones: editar, eliminar, ver detalles
- Confirmación de eliminación (AlertDialog)
- Navegación a detalle

### 5. Dashboard

#### StatsCards.tsx
**Métricas:**
- Total de leads
- Leads nuevos (últimos 7 días)
- Leads en revisión
- Leads preaprobados

**Diseño:**
- Tarjetas con iconos
- Valores destacados
- Variación de color por métrica

#### LeadsChart.tsx
**Funcionalidad:**
- Gráfico de distribución por estado
- Usar recharts
- Tipo: barras o pie chart
- Interactivo

#### RecentLeads.tsx
**Funcionalidad:**
- Lista de últimos 5 leads
- Mostrar: nombre, teléfono, estado, fecha
- Link a página de detalle
- Actualización automática

### 6. Página de Detalle

#### /leads/[id]/page.tsx
**Secciones:**
1. Información básica
   - Nombre, DNI, CUIL
   - Teléfono, Email
   - Fechas de creación/actualización

2. Información financiera
   - Ingresos
   - Monto solicitado
   - Producto
   - Zona

3. Información adicional
   - Origen
   - Estado (badge)
   - Agencia
   - Banco
   - Trabajo actual
   - Notas

4. Historial de eventos
   - Últimos eventos relacionados
   - Tipo y fecha
   - Payload (si aplica)

5. Conversaciones asociadas
   - Lista de conversaciones (placeholder)
   - Estado y última actividad

**Acciones:**
- Botón editar (abre LeadDialog)
- Botón volver a lista
- Breadcrumb opcional

## 🎨 Consideraciones de Diseño

### Responsive Design
- **Mobile-first approach**: Diseño pensado primero para móviles
- **Sidebar colapsable**: Se oculta automáticamente en pantallas pequeñas
- **Tabla responsive**: Scroll horizontal en móvil, vista completa en desktop
- **Formularios adaptativos**: Campos se reorganizan según tamaño de pantalla
- **Breakpoints**: Usar breakpoints de Tailwind (sm, md, lg, xl)

### Accesibilidad
- **Labels semánticos**: Todos los inputs tienen labels asociados
- **ARIA attributes**: Agregar donde sea necesario para lectores de pantalla
- **Navegación por teclado**: Todas las funciones accesibles sin mouse
- **Contraste adecuado**: Cumplir con WCAG 2.1 nivel AA
- **Focus visible**: Indicadores claros de elementos enfocados

### UX
- **Estados de carga**: Skeleton loaders durante fetch de datos
- **Mensajes de error**: Descriptivos y accionables
- **Confirmaciones**: Diálogos de confirmación para acciones destructivas
- **Feedback inmediato**: Toasts para operaciones exitosas/fallidas
- **Validación en tiempo real**: Con React Hook Form y Zod

### Mejores Prácticas Next.js

**Server Components por defecto:**
```typescript
// ✅ Correcto: Server Component
export default async function LeadsPage() {
  const leads = await db.lead.findMany();
  return <LeadsTable leads={leads} />;
}

// ⚠️ Solo cuando sea necesario: Client Component
'use client';
export function LeadForm() {
  // Interactividad del usuario
}
```

**Route Handlers modernos:**
```typescript
// ✅ Usar Route Handlers (App Router)
// app/api/leads/route.ts
export async function GET(request: NextRequest) {
  // ...
}

// ❌ Evitar API Routes legacy (Pages Router)
// pages/api/leads.ts
```

Ver [TECNOLOGIAS.md](TECNOLOGIAS.md) para más detalles sobre Next.js y otras tecnologías.

## 🔒 Seguridad

### Autenticación
- **Middleware protection**: Todas las rutas protegidas con `withAuth` de NextAuth
- **Session verification**: Verificación de sesión en API routes
- **JWT tokens**: Tokens seguros con expiración configurable
- **Password hashing**: bcrypt con salt rounds apropiados

### Validación
- **Validación en cliente**: Zod con React Hook Form para UX inmediata
- **Validación en servidor**: Zod en API routes para seguridad
- **Sanitización**: Limpieza de inputs antes de guardar
- **Type safety**: TypeScript + Zod para prevenir errores

### Permisos
- **Role-based access**: Verificación de roles en middleware
- **API protection**: Validar permisos en cada endpoint
- **Future**: Restricciones granulares por operación

### Mejores Prácticas de Seguridad

**NextAuth.js:**
```typescript
// Middleware para proteger rutas
export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'ADMIN';
      }
      return !!token;
    },
  },
});
```

**Validación en API:**
```typescript
// Siempre validar en servidor
export async function POST(request: Request) {
  const body = await request.json();
  const validated = leadSchema.parse(body); // Zod valida y sanitiza
  // ...
}
```

Ver [TECNOLOGIAS.md](TECNOLOGIAS.md) para más sobre NextAuth.js y seguridad.

## 📈 Métricas y Rendimiento

### Optimizaciones

**Next.js:**
- **Server Components**: Reducen bundle size del cliente
- **Streaming**: Renderizado progresivo con Suspense
- **Caching**: Aprovechar cache de Next.js para datos estáticos
- **Code splitting**: Automático con App Router

**Prisma:**
- **Índices estratégicos**: En campos usados frecuentemente en WHERE
- **Select específico**: Limitar campos retornados
- **Paginación**: `skip` y `take` para listas grandes
- **Includes selectivos**: Solo cargar relaciones necesarias

**React:**
- **React Hook Form**: Mínimos re-renders
- **Memoization**: `useMemo` y `useCallback` cuando sea necesario
- **Lazy loading**: Cargar componentes pesados bajo demanda

### Métricas a Monitorear
- **Tiempo de carga inicial**: < 3 segundos
- **Tiempo de respuesta de API**: < 1 segundo
- **Bundle size**: Monitorear tamaño de JavaScript
- **Consultas a BD**: Optimizar queries lentas
- **Core Web Vitals**: LCP, FID, CLS

### Ejemplo de Query Optimizada

```typescript
// ✅ Optimizado: Select específico + paginación + índices
const leads = await db.lead.findMany({
  select: {
    id: true,
    nombre: true,
    telefono: true,
    estado: true,
    createdAt: true,
  },
  where: { estado: 'NUEVO' }, // Usa índice
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }, // Usa índice
});

// ❌ No optimizado: Trae todo + sin paginación
const leads = await db.lead.findMany({
  include: { events: true, conversations: true },
});
```

Ver [TECNOLOGIAS.md](TECNOLOGIAS.md) para más sobre optimización con Prisma.

## 🧪 Testing

### Cobertura
- Tests unitarios para componentes
- Tests de integración para API
- Tests E2E para flujos críticos

### Casos de Prueba
- Crear lead
- Editar lead
- Eliminar lead
- Filtrar leads
- Búsqueda
- Paginación
- Autenticación

## 📝 Notas de Implementación

### Orden Sugerido
1. **Instalar componentes UI** - Base para toda la UI
2. **Crear layout** - Sidebar, Header, UserMenu (estructura base)
3. **Configurar API routes** - Backend antes del frontend
4. **Implementar página de leads** - Funcionalidad principal
5. **Crear formulario y modal** - Interacciones de usuario
6. **Mejorar dashboard** - Métricas y visualizaciones
7. **Agregar página de detalle** - Vista completa de lead
8. **Mejorar login** - UX de autenticación

### Dependencias
- Componentes UI → Layout
- API routes → Componentes de leads
- Componentes de leads → Página de leads
- API routes → Dashboard

### Patrones de Código

**Formulario con React Hook Form + Zod:**
```typescript
const form = useForm<LeadInput>({
  resolver: zodResolver(leadSchema),
  mode: 'onChange',
});

const onSubmit = async (data: LeadInput) => {
  // data está validado y tipado
  await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
```

**API Route con validación:**
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const validated = leadSchema.parse(body);
  const lead = await db.lead.create({ data: validated });
  return NextResponse.json(lead, { status: 201 });
}
```

Ver [TECNOLOGIAS.md](TECNOLOGIAS.md) para ejemplos completos y mejores prácticas.

## 🚀 Próximos Pasos

Después de completar la primera etapa:
1. Gestión de conversaciones
2. Integración con WhatsApp Business API
3. Sistema de asistentes IA
4. Reportes avanzados
5. Exportación de datos

---

**Estado**: En desarrollo  
**Versión**: 1.0.0  
**Última actualización**: 2024

