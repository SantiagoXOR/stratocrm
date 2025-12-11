# 📦 Guía del Boilerplate CRM Phorencial

Este boilerplate contiene todo lo necesario para comenzar un nuevo proyecto CRM basado en la arquitectura de Phorencial.

## 📁 Estructura del Boilerplate

```
boilerplate/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos iniciales (usuarios demo)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (dashboard)/   # Rutas protegidas
│   │   ├── api/           # API routes
│   │   ├── auth/          # Autenticación
│   │   └── layout.tsx     # Layout principal
│   ├── components/
│   │   └── ui/            # Componentes shadcn/ui básicos
│   ├── lib/               # Utilidades y configuraciones
│   ├── middleware.ts      # Middleware de Next.js
│   └── types/             # Tipos TypeScript
├── public/                # Archivos estáticos
├── .env.example          # Variables de entorno (copia a .env.local)
├── package.json          # Dependencias
├── tsconfig.json         # Configuración TypeScript
├── tailwind.config.ts    # Configuración Tailwind
├── next.config.js        # Configuración Next.js
├── README.md             # Documentación principal
└── SETUP.md             # Guía de configuración rápida
```

## 🚀 Inicio Rápido

### 1. Copiar el Boilerplate

```bash
# Copiar a tu nuevo proyecto
cp -r boilerplate mi-nuevo-crm
cd mi-nuevo-crm
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo .env.local desde el ejemplo
cp .env.example .env.local

# Editar .env.local con tus credenciales
```

**Variables mínimas requeridas:**

```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generar-con-openssl-rand-hex-32
JWT_SECRET=otro-secret-diferente
```

### 4. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos demo
npm run db:seed
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🔐 Credenciales Demo

Después de ejecutar `npm run db:seed`, puedes usar:

- **Admin**: admin@phorencial.com / admin123
- **Analista**: analista@phorencial.com / analista123  
- **Vendedor**: vendedor@phorencial.com / vendedor123

## 🎨 Características Incluidas

### ✅ Autenticación
- NextAuth.js configurado
- Login con credenciales
- Soporte para OAuth (Google) - configurable
- Middleware de protección de rutas
- Sistema de roles (ADMIN, ANALISTA, VENDEDOR)

### ✅ Base de Datos
- Prisma ORM configurado
- Esquema base con modelos principales:
  - Lead (leads)
  - User (usuarios)
  - Event (eventos)
  - Conversation (conversaciones)
  - Message (mensajes)
  - Assistant (asistentes)
  - Rule (reglas)
  - WhatsAppSync (sincronización con WhatsApp)

### ✅ UI Components
- shadcn/ui configurado
- Componentes básicos incluidos:
  - Button
  - Card
- Tailwind CSS configurado
- Sistema de colores personalizable

### ✅ Testing
- Playwright configurado para E2E
- Vitest configurado para unitarios
- Configuración lista para usar

## 📝 Próximos Pasos

### 1. Personalizar el Esquema

Edita `prisma/schema.prisma` para agregar tus modelos:

```prisma
model MiModelo {
  id        String   @id @default(cuid())
  nombre    String
  createdAt DateTime @default(now())
}
```

Luego ejecuta:
```bash
npm run db:migrate
```

### 2. Agregar Componentes UI

```bash
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

### 3. Crear Nuevas Rutas

Agrega archivos en `src/app/`:

```typescript
// src/app/mi-ruta/page.tsx
export default function MiRuta() {
  return <div>Mi nueva ruta</div>
}
```

### 4. Crear API Routes

```typescript
// src/app/api/mi-endpoint/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hola' })
}
```

### 5. Configurar OAuth (Opcional)

Edita `src/lib/auth.ts` para agregar proveedores OAuth:

```typescript
import GoogleProvider from 'next-auth/providers/google'

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... otros proveedores
]
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Poblar con datos demo
npm run db:studio        # Abrir Prisma Studio (GUI)

# Testing
npm test                 # Tests unitarios (Vitest)
npm run test:e2e         # Tests E2E (Playwright)
npm run test:ui          # Tests con UI

# Utilidades
npm run lint             # Linting
npm run type-check       # Verificación de tipos
```

## 📚 Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `README.md` y `SETUP.md`
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté accesible
4. Revisa los logs del servidor para errores

## 📄 Licencia

MIT License - Siéntete libre de usar este boilerplate para tus proyectos.

