# Tecnologías y Stack - CRM Inmobiliario STRATO

## 📋 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Next.js](#nextjs)
3. [Prisma](#prisma)
4. [NextAuth.js](#nextauthjs)
5. [React Hook Form](#react-hook-form)
6. [Zod](#zod)
7. [shadcn/ui](#shadcnui)
8. [Recharts](#recharts)
9. [Mejores Prácticas](#mejores-prácticas)

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI accesibles
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - Endpoints REST
- **Prisma** - ORM para PostgreSQL
- **NextAuth.js** - Autenticación
- **PostgreSQL** - Base de datos (Supabase)
- **WhatsApp Business API** - Integración de mensajería

### Herramientas
- **Vitest** - Testing unitario
- **Playwright** - Testing E2E
- **ESLint** - Linting
- **TypeScript** - Type checking

## ⚛️ Next.js

### Características Utilizadas

#### App Router
Next.js 16 utiliza el **App Router**, un sistema de enrutamiento basado en el sistema de archivos que aprovecha las últimas características de React:

- **Server Components**: Componentes renderizados en el servidor por defecto
- **Server Actions**: Funciones asíncronas del servidor que se pueden llamar directamente desde componentes
- **Suspense**: Para manejar estados de carga
- **Streaming**: Renderizado progresivo

#### Estructura de Rutas

```
app/
├── (dashboard)/          # Route group (no afecta URL)
│   ├── dashboard/
│   │   └── page.tsx     # /dashboard
│   ├── leads/
│   │   ├── page.tsx     # /leads
│   │   └── [id]/
│   │       └── page.tsx # /leads/[id]
│   └── layout.tsx       # Layout compartido
├── api/
│   ├── leads/
│   │   ├── route.ts     # API: /api/leads
│   │   └── [id]/
│   │       └── route.ts # API: /api/leads/[id]
│   └── webhooks/
│       └── whatsapp/
│           └── route.ts # API: /api/webhooks/whatsapp
└── layout.tsx           # Layout raíz
```

#### Route Handlers (API Routes)

Los Route Handlers en el App Router reemplazan las API Routes tradicionales:

```typescript
// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const leads = await db.lead.findMany();
  return NextResponse.json({ data: leads });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lead = await db.lead.create({ data: body });
  return NextResponse.json(lead, { status: 201 });
}
```

**Características:**
- Usa Web Request y Response APIs estándar
- Soporta métodos HTTP: GET, POST, PUT, DELETE, PATCH, etc.
- Type-safe con TypeScript
- Acceso a cookies, headers, y utilidades de Next.js

#### Server Components vs Client Components

**Server Components** (por defecto):
- Renderizados en el servidor
- No pueden usar hooks de React
- Acceso directo a base de datos
- No se envían al cliente (menor bundle)

```typescript
// app/leads/page.tsx (Server Component)
import { db } from '@/lib/db';

export default async function LeadsPage() {
  const leads = await db.lead.findMany();
  return <LeadsTable leads={leads} />;
}
```

**Client Components** (con 'use client'):
- Renderizados en el cliente
- Pueden usar hooks y estado
- Interactividad del usuario

```typescript
'use client';

import { useState } from 'react';

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### Referencias Oficiales

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## 🗄️ Prisma

### Características Utilizadas

#### Schema Definition
Prisma utiliza un lenguaje de modelado declarativo para definir el esquema de base de datos:

```prisma
model Lead {
  id          String   @id @default(cuid())
  nombre      String
  telefono    String
  estado      String   @default("NUEVO")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  events        Event[]
  conversations Conversation[]

  @@index([telefono])
  @@index([estado])
}
```

#### Prisma Client
Cliente type-safe generado automáticamente desde el schema:

```typescript
import { db } from '@/lib/db';

// Query type-safe
const lead = await db.lead.findUnique({
  where: { id: 'clx123' },
  include: { events: true }
});

// TypeScript infiere el tipo automáticamente
lead.nombre // string
lead.events // Event[]
```

#### Migraciones
Sistema de migraciones declarativo:

```bash
# Crear migración
npx prisma migrate dev --name add_whatsapp_support

# Aplicar migraciones en producción
npx prisma migrate deploy
```

**Workflow:**
1. Modificar `schema.prisma`
2. Ejecutar `prisma migrate dev`
3. Prisma genera SQL y lo aplica
4. Prisma Client se regenera automáticamente

#### Queries Comunes

```typescript
// Find many con filtros y paginación
const leads = await db.lead.findMany({
  where: {
    estado: 'NUEVO',
    telefono: { contains: '549' }
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});

// Incluir relaciones
const lead = await db.lead.findUnique({
  where: { id },
  include: {
    events: true,
    conversations: {
      include: { messages: true }
    }
  }
});

// Transacciones
await db.$transaction([
  db.lead.create({ data: leadData }),
  db.event.create({ data: eventData })
]);
```

### Referencias Oficiales

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## 🔐 NextAuth.js

### Características Utilizadas

#### Credentials Provider
Autenticación con email y contraseña:

```typescript
// lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
```

#### Session Management
Sesiones JWT para aplicaciones serverless:

```typescript
// Obtener sesión en Server Component
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');
  // ...
}

// Obtener sesión en Client Component
'use client';
import { useSession } from 'next-auth/react';

export function Component() {
  const { data: session, status } = useSession();
  // ...
}
```

#### Middleware Protection
Protección de rutas con middleware:

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Verificar rol si es necesario
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'ADMIN';
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

### Referencias Oficiales

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Session Management](https://next-auth.js.org/configuration/options#session)
- [Middleware](https://next-auth.js.org/configuration/nextjs#middleware)

## 📝 React Hook Form

### Características Utilizadas

#### Integración con Zod
Validación type-safe con Zod resolver:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type LeadInput } from '@/lib/validators';

export function LeadForm() {
  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      estado: 'NUEVO',
    },
    mode: 'onChange', // Validación en tiempo real
  });

  const onSubmit = async (data: LeadInput) => {
    // data está validado y tipado
    await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register('nombre')}
        placeholder="Nombre"
      />
      {form.formState.errors.nombre && (
        <span>{form.formState.errors.nombre.message}</span>
      )}
      {/* ... más campos */}
    </form>
  );
}
```

#### Ventajas de React Hook Form

1. **Performance**: Mínimos re-renders
2. **Type Safety**: Integración con TypeScript y Zod
3. **Validación**: Integración con múltiples validadores
4. **Tamaño**: ~11KB sin dependencias
5. **UX**: Validación en tiempo real

#### Modos de Validación

```typescript
const form = useForm({
  mode: 'onChange',    // Validar en cada cambio
  // mode: 'onBlur',   // Validar al perder foco
  // mode: 'onSubmit', // Validar solo al enviar
  // mode: 'onTouched', // Validar después del primer blur
  // mode: 'all',       // Validar en todos los eventos
});
```

### Referencias Oficiales

- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Resolver](https://github.com/react-hook-form/resolvers#zod)
- [useForm API](https://react-hook-form.com/docs/useform)
- [Validation](https://react-hook-form.com/docs/useform/register)

## ✅ Zod

### Características Utilizadas

#### Schema Definition
Definición de esquemas type-safe:

```typescript
import { z } from 'zod';

export const leadSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().optional(),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  ingresos: z.number().positive().optional(),
  estado: z.enum(['NUEVO', 'EN_REVISION', 'PREAPROBADO', 'RECHAZADO']),
  origen: z.enum(['whatsapp', 'instagram', 'facebook', 'web', 'ads']).optional(),
});

// Inferir tipo TypeScript
export type LeadInput = z.infer<typeof leadSchema>;
```

#### Validación en API Routes

```typescript
// app/api/leads/route.ts
import { leadSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = leadSchema.parse(body);
    
    // Crear lead (datos ya validados)
    const lead = await db.lead.create({
      data: validatedData,
    });
    
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

#### Validación Avanzada

```typescript
const schema = z.object({
  telefono: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido'),
  email: z.string()
    .email('Email inválido')
    .refine((email) => email.endsWith('@example.com'), {
      message: 'Debe ser email corporativo',
    }),
  monto: z.number()
    .positive('El monto debe ser positivo')
    .max(10000000, 'Monto demasiado alto'),
})
.refine((data) => data.monto <= data.ingresos * 10, {
  message: 'El monto no puede exceder 10 veces los ingresos',
  path: ['monto'],
});
```

### Referencias Oficiales

- [Zod Documentation](https://zod.dev)
- [API Reference](https://zod.dev/README)
- [TypeScript Integration](https://zod.dev/?id=typescript)

## 🎨 shadcn/ui

### Características Utilizadas

#### Instalación de Componentes
Componentes instalados usando CLI:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
```

#### Uso de Componentes

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

export function LeadDialog() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <h2>Nuevo Lead</h2>
        </DialogHeader>
        <form>
          <Input placeholder="Nombre" />
          <Button type="submit">Guardar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

#### Personalización
Los componentes son copiados a tu proyecto, permitiendo personalización completa:

```typescript
// components/ui/button.tsx
export const Button = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        'base-styles',
        className // Puedes agregar estilos personalizados
      )}
      {...props}
    />
  );
};
```

### Referencias Oficiales

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Components](https://ui.shadcn.com/docs/components)
- [Installation](https://ui.shadcn.com/docs/installation)

## 📊 Recharts

### Características Utilizadas

#### Gráficos en Dashboard

```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { estado: 'NUEVO', cantidad: 45 },
  { estado: 'EN_REVISION', cantidad: 30 },
  { estado: 'PREAPROBADO', cantidad: 20 },
];

export function LeadsChart() {
  return (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="estado" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="cantidad" fill="#8884d8" />
    </BarChart>
  );
}
```

### Referencias Oficiales

- [Recharts Documentation](https://recharts.org)
- [Examples](https://recharts.org/examples)

## 🎯 Mejores Prácticas

### Next.js

1. **Usar Server Components por defecto**
   - Solo usar 'use client' cuando sea necesario
   - Reducir bundle size del cliente

2. **Optimizar Data Fetching**
   - Usar `fetch` con caching apropiado
   - Implementar loading states con Suspense

3. **Route Handlers para APIs**
   - Usar Route Handlers en lugar de API Routes legacy
   - Aprovechar Web APIs estándar

### Prisma

1. **Índices Estratégicos**
   - Agregar índices en campos usados frecuentemente en WHERE
   - Índices en campos de ordenamiento

2. **Queries Eficientes**
   - Usar `select` para limitar campos retornados
   - Incluir relaciones solo cuando sea necesario
   - Usar paginación para listas grandes

3. **Transacciones para Operaciones Atómicas**
   - Agrupar operaciones relacionadas
   - Manejar rollback en caso de error

### NextAuth.js

1. **Seguridad**
   - Usar JWT para serverless
   - Validar roles en middleware
   - Hash de contraseñas con bcrypt

2. **Session Management**
   - Configurar expiración apropiada
   - Implementar refresh tokens si es necesario

### React Hook Form

1. **Validación**
   - Usar Zod para validación centralizada
   - Validación en cliente y servidor

2. **Performance**
   - Usar `mode: 'onChange'` para mejor UX
   - Evitar re-renders innecesarios

### Zod

1. **Schemas Reutilizables**
   - Crear schemas base y extenderlos
   - Usar `.pick()`, `.omit()`, `.extend()`

2. **Mensajes de Error**
   - Proporcionar mensajes descriptivos
   - Usar `.refine()` para validaciones complejas

---

**Versión**: 1.0.0  
**Última actualización**: 2024

