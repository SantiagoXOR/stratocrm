# 🏢 STRATO - CRM Inmobiliario

Sistema de gestión de relaciones con clientes (CRM) especializado para el sector inmobiliario, desarrollado con tecnologías modernas y mejores prácticas.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estado del Proyecto](#estado-del-proyecto)
- [Primera Etapa](#primera-etapa)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)
- [API Reference](#api-reference)

## 🎯 Descripción General

STRATO es un CRM diseñado específicamente para gestionar leads inmobiliarios, desde su captación hasta su conversión. El sistema permite gestionar información de clientes potenciales, seguimiento de conversaciones, eventos y métricas de rendimiento.

## ✨ Características

### Implementadas (Primera Etapa)

- ✅ **Autenticación y Autorización**
  - Sistema de autenticación con NextAuth.js
  - Roles: ADMIN, ANALISTA, VENDEDOR
  - Protección de rutas con middleware

- ✅ **Gestión de Leads**
  - CRUD completo de leads
  - Filtros avanzados (estado, origen, búsqueda)
  - Paginación y ordenamiento
  - Vista detallada de leads

- ✅ **Dashboard Interactivo**
  - Métricas en tiempo real
  - Gráficos de distribución
  - Leads recientes
  - Estadísticas por estado

- ✅ **Interfaz de Usuario**
  - Diseño moderno con shadcn/ui
  - Layout responsive con Sidebar y Header
  - Componentes reutilizables
  - Notificaciones toast

### Próximas Etapas

- 🔄 Gestión de Conversaciones
- 🔄 Integración con WhatsApp Business API
- 🔄 Sistema de Asistentes IA
- 🔄 Reportes avanzados
- 🔄 Exportación de datos
- 🔄 Integración con Google APIs (Maps, Docs)

## 🛠️ Tecnologías

El proyecto utiliza un stack moderno y type-safe basado en Next.js 16 con App Router, aprovechando las últimas características de React como Server Components y Server Actions.

### Frontend
- **Next.js 16** - Framework React con App Router, Server Components y Route Handlers
- **TypeScript** - Tipado estático para mayor seguridad y productividad
- **Tailwind CSS** - Estilos utility-first para diseño rápido y consistente
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **React Hook Form** - Manejo de formularios performante con validación
- **Zod** - Validación de esquemas TypeScript-first
- **Recharts** - Gráficos y visualizaciones interactivas
- **Lucide React** - Iconos modernos y ligeros

### Backend
- **Next.js API Routes** - Route Handlers con Web APIs estándar
- **Prisma** - ORM type-safe con migraciones declarativas
- **NextAuth.js** - Autenticación completa con JWT y providers
- **PostgreSQL** - Base de datos relacional (Supabase)
- **WhatsApp Business API** - Integración de mensajería bidireccional
- **Google APIs** - Integraciones adicionales (Maps, Docs)

### Herramientas
- **Vitest** - Testing unitario rápido y moderno
- **Playwright** - Testing E2E para flujos completos
- **ESLint** - Linting y calidad de código
- **TypeScript** - Type checking en tiempo de compilación

Para más detalles sobre cada tecnología, consulta [TECNOLOGIAS.md](docs/TECNOLOGIAS.md).

## 📊 Estado del Proyecto

### Primera Etapa - CRM Funcional ✅

**Objetivo**: Transformar el boilerplate en un CRM funcional con gestión completa de leads.

**Alcance**:
- Layout completo del dashboard
- CRUD de leads
- Dashboard con métricas
- Componentes UI necesarios
- API routes para operaciones CRUD

**Estado**: En desarrollo

Ver [PRIMERA_ETAPA.md](docs/PRIMERA_ETAPA.md) para detalles completos.

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- PostgreSQL (o cuenta de Supabase)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd "STRATO SOFTWARE INMOBILIARIO"
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. **Configurar base de datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos iniciales
npm run db:seed
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/strato_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-con-openssl-rand-hex-32"

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="tu-phone-number-id"
WHATSAPP_ACCESS_TOKEN="tu-access-token"
WHATSAPP_VERIFY_TOKEN="tu-verify-token"
WHATSAPP_BUSINESS_ACCOUNT_ID="tu-business-account-id"
WHATSAPP_WEBHOOK_URL="https://tu-dominio.com/api/webhooks/whatsapp"

# Google APIs (opcional)
GOOGLE_MAPS_API_KEY="tu-google-maps-api-key"
GOOGLE_DOCS_API_KEY="tu-google-docs-api-key"
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

### Usuarios Demo

Después de ejecutar `npm run db:seed`, puedes usar:

| Email                   | Contraseña  | Rol      |
| ----------------------- | ----------- | -------- |
| admin@strato.com    | admin123    | ADMIN    |
| analista@strato.com | analista123 | ANALISTA |
| vendedor@strato.com | vendedor123 | VENDEDOR |

## 📁 Estructura del Proyecto

```
STRATO SOFTWARE INMOBILIARIO/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts                # Datos iniciales
├── src/
│   ├── app/                   # Rutas de Next.js (App Router)
│   │   ├── (dashboard)/       # Rutas protegidas
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── leads/         # Gestión de leads
│   │   │   │   ├── [id]/      # Detalle de lead
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx     # Layout del dashboard
│   │   ├── api/               # API Routes
│   │   │   ├── leads/         # Endpoints de leads
│   │   │   │   ├── [id]/      # Operaciones por ID
│   │   │   │   └── route.ts
│   │   │   └── auth/          # Autenticación
│   │   ├── auth/              # Páginas de autenticación
│   │   └── layout.tsx         # Layout principal
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── leads/             # Componentes de leads
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadDialog.tsx
│   │   │   ├── LeadFilters.tsx
│   │   │   ├── LeadActions.tsx
│   │   │   └── LeadDetail.tsx
│   │   └── dashboard/         # Componentes del dashboard
│   │       ├── StatsCards.tsx
│   │       ├── LeadsChart.tsx
│   │       └── RecentLeads.tsx
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── db.ts              # Cliente Prisma
│   │   ├── utils.ts           # Utilidades
│   │   ├── validators.ts      # Validaciones Zod
│   │   └── api.ts             # Helpers de API
│   └── types/                 # Tipos TypeScript
├── public/                    # Archivos estáticos
├── docs/                      # Documentación
│   ├── PRIMERA_ETAPA.md
│   ├── REQUERIMIENTOS.md
│   ├── API.md
│   └── DIAGRAMAS.md
└── package.json
```

## 📚 Documentación

### Documentación Principal

- [Índice de Documentación](docs/README.md) - Guía completa de toda la documentación
- [Tecnologías y Stack](docs/TECNOLOGIAS.md) - Documentación detallada de todas las tecnologías utilizadas
- [Primera Etapa](docs/PRIMERA_ETAPA.md) - Detalles de implementación de la primera etapa
- [Requerimientos](docs/REQUERIMIENTOS.md) - Especificaciones funcionales y técnicas
- [API Reference](docs/API.md) - Documentación de endpoints
- [Diagramas](docs/DIAGRAMAS.md) - Diagramas de arquitectura y base de datos
- [Esquema de Base de Datos](docs/SCHEMA.md) - Especificación completa del esquema
- [Integración WhatsApp](docs/WHATSAPP.md) - Guía de integración con WhatsApp Business API

### Guías

- [Setup Guide](SETUP.md) - Guía de configuración inicial
- [Boilerplate Guide](BOILERPLATE-GUIDE.md) - Información del boilerplate base
- [Estructura](ESTRUCTURA.md) - Estructura del proyecto

## 🔌 API Reference

### Leads

#### GET /api/leads
Lista leads con paginación y filtros.

**Query Parameters:**
- `page` (number): Número de página (default: 1)
- `limit` (number): Items por página (default: 10)
- `estado` (string): Filtrar por estado
- `origen` (string): Filtrar por origen
- `search` (string): Búsqueda por nombre, teléfono o email
- `sortBy` (string): Campo para ordenar
- `sortOrder` (string): 'asc' o 'desc'

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

#### POST /api/leads
Crea un nuevo lead.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+5491123456789",
  "email": "juan@example.com",
  "estado": "NUEVO",
  ...
}
```

#### GET /api/leads/[id]
Obtiene un lead por ID con relaciones.

#### PUT /api/leads/[id]
Actualiza un lead existente.

#### DELETE /api/leads/[id]
Elimina un lead.

Ver [API.md](docs/API.md) para documentación completa.

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests E2E
npm run test:e2e

# Tests con UI
npm run test:ui
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar con datos demo
npm run db:studio        # Abrir Prisma Studio
npm run db:push          # Push schema sin migración
npm run db:reset         # Reset y seed

# Calidad de código
npm run lint             # Linting
npm run type-check       # Verificación de tipos

# Testing
npm test                 # Tests unitarios
npm run test:e2e         # Tests E2E
npm run test:ui          # Tests con UI
```

## 🎨 Personalización

### Tema y Colores

Edita `tailwind.config.ts` y `src/app/globals.css` para personalizar colores y estilos.

### Agregar Nuevos Modelos

1. Edita `prisma/schema.prisma`
2. Ejecuta `npm run db:migrate`
3. Genera tipos: `npm run db:generate`

### Agregar Nuevas Rutas

Crea archivos en `src/app/` siguiendo la estructura de App Router de Next.js.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License

## 👥 Equipo

Desarrollado por el equipo de STRATO Software Inmobiliario

---

**Versión**: 1.0.0 (Primera Etapa)  
**Última actualización**: Dic 2025
