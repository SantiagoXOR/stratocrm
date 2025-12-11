# 📂 Estructura del Boilerplate

Este documento describe la estructura completa del boilerplate y el propósito de cada archivo y carpeta.

## 📁 Estructura de Directorios

```
boilerplate/
│
├── 📄 Archivos de Configuración Raíz
│   ├── package.json              # Dependencias y scripts npm
│   ├── tsconfig.json             # Configuración TypeScript
│   ├── next.config.js            # Configuración Next.js
│   ├── tailwind.config.ts        # Configuración Tailwind CSS
│   ├── postcss.config.js         # Configuración PostCSS
│   ├── components.json           # Configuración shadcn/ui
│   ├── playwright.config.ts      # Configuración Playwright (E2E)
│   ├── vitest.config.ts          # Configuración Vitest (Unit)
│   ├── .eslintrc.json           # Configuración ESLint
│   ├── .gitignore               # Archivos ignorados por Git
│   ├── .env.example             # Ejemplo de variables de entorno
│   └── next-env.d.ts            # Tipos de Next.js
│
├── 📚 Documentación
│   ├── README.md                 # Documentación principal
│   ├── SETUP.md                  # Guía de configuración rápida
│   ├── BOILERPLATE-GUIDE.md      # Guía completa del boilerplate
│   └── ESTRUCTURA.md             # Este archivo
│
├── 🗄️ Base de Datos (Prisma)
│   └── prisma/
│       ├── schema.prisma         # Esquema de la base de datos
│       └── seed.ts               # Script para poblar datos iniciales
│
├── 🎨 Código Fuente (src/)
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Layout raíz de la aplicación
│   │   ├── page.tsx              # Página principal (/)
│   │   ├── globals.css           # Estilos globales y Tailwind
│   │   │
│   │   ├── (dashboard)/          # Grupo de rutas protegidas
│   │   │   ├── layout.tsx        # Layout del dashboard (con autenticación)
│   │   │   └── dashboard/
│   │   │       └── page.tsx      # Página del dashboard (/dashboard)
│   │   │
│   │   ├── auth/                 # Rutas de autenticación
│   │   │   └── signin/
│   │   │       └── page.tsx      # Página de login (/auth/signin)
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts  # Endpoint de NextAuth
│   │       └── health/
│   │           └── route.ts      # Health check endpoint
│   │
│   ├── components/               # Componentes React
│   │   └── ui/                   # Componentes UI básicos (shadcn/ui)
│   │       ├── button.tsx       # Componente Button
│   │       └── card.tsx          # Componente Card
│   │
│   ├── lib/                      # Utilidades y configuraciones
│   │   ├── auth.ts              # Configuración NextAuth
│   │   ├── db.ts                # Cliente Prisma (singleton)
│   │   ├── utils.ts             # Utilidades generales
│   │   └── validators.ts        # Esquemas de validación Zod
│   │
│   ├── types/                    # Tipos TypeScript
│   │   └── next-auth.d.ts       # Extensiones de tipos NextAuth
│   │
│   └── middleware.ts             # Middleware de Next.js (protección de rutas)
│
└── 📁 Archivos Estáticos
    └── public/                   # Archivos estáticos (imágenes, favicon, etc.)
```

## 📝 Descripción de Archivos Clave

### Configuración

- **package.json**: Define todas las dependencias del proyecto y scripts npm disponibles
- **tsconfig.json**: Configuración del compilador TypeScript con paths aliases
- **next.config.js**: Configuración de Next.js (optimizaciones, webpack, etc.)
- **tailwind.config.ts**: Configuración de Tailwind CSS con colores personalizados
- **components.json**: Configuración de shadcn/ui para agregar componentes

### Base de Datos

- **prisma/schema.prisma**: Define todos los modelos de la base de datos usando Prisma Schema Language
- **prisma/seed.ts**: Script que se ejecuta para poblar la base de datos con datos iniciales (usuarios demo, reglas, etc.)

### Autenticación

- **src/lib/auth.ts**: Configuración completa de NextAuth.js con proveedores y callbacks
- **src/app/api/auth/[...nextauth]/route.ts**: Endpoint de NextAuth que maneja todas las rutas de autenticación
- **src/middleware.ts**: Middleware que protege rutas del dashboard requiriendo autenticación
- **src/types/next-auth.d.ts**: Extensiones de tipos para agregar campos personalizados a User y Session

### UI y Componentes

- **src/app/globals.css**: Estilos globales, variables CSS y utilidades de Tailwind
- **src/components/ui/**: Componentes básicos de shadcn/ui (Button, Card, etc.)

### Utilidades

- **src/lib/utils.ts**: Funciones utilitarias generales (cn, formatCurrency, formatDate)
- **src/lib/db.ts**: Cliente Prisma configurado como singleton para evitar múltiples instancias
- **src/lib/validators.ts**: Esquemas de validación usando Zod para validar datos

### Rutas y Páginas

- **src/app/page.tsx**: Página principal de la aplicación (landing)
- **src/app/(dashboard)/layout.tsx**: Layout que protege las rutas del dashboard
- **src/app/(dashboard)/dashboard/page.tsx**: Página principal del dashboard
- **src/app/auth/signin/page.tsx**: Página de inicio de sesión

### API Routes

- **src/app/api/health/route.ts**: Endpoint de health check para monitoreo
- **src/app/api/auth/[...nextauth]/route.ts**: Endpoint de NextAuth

## 🔄 Flujo de la Aplicación

1. **Usuario accede a `/`** → Ve la página principal
2. **Usuario intenta acceder a `/dashboard`** → Middleware redirige a `/auth/signin` si no está autenticado
3. **Usuario inicia sesión** → NextAuth valida credenciales contra la base de datos
4. **Usuario autenticado** → Puede acceder a rutas protegidas del dashboard
5. **API Routes** → Procesan requests y usan el cliente Prisma para interactuar con la base de datos

## 🎯 Próximos Pasos para Personalizar

1. **Agregar modelos**: Edita `prisma/schema.prisma` y ejecuta `npm run db:migrate`
2. **Agregar componentes**: Usa `npx shadcn-ui@latest add [component]`
3. **Crear nuevas páginas**: Agrega archivos en `src/app/`
4. **Crear API endpoints**: Agrega archivos en `src/app/api/`
5. **Personalizar estilos**: Edita `src/app/globals.css` y `tailwind.config.ts`

## 📚 Convenciones

- **Rutas**: Usar App Router de Next.js (archivos en `src/app/`)
- **Componentes**: PascalCase para nombres de componentes
- **Utilidades**: camelCase para funciones utilitarias
- **Tipos**: PascalCase para tipos e interfaces
- **Constantes**: UPPER_SNAKE_CASE para constantes

