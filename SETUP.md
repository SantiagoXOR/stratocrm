# 🚀 Guía de Configuración del Boilerplate

## Paso 1: Instalación de Dependencias

```bash
npm install
```

## Paso 2: Configuración de Base de Datos

### Opción A: Usar Supabase (Recomendado)

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > Database y copia la connection string
4. Actualiza `DATABASE_URL` en `.env.local`

### Opción B: PostgreSQL Local

1. Instala PostgreSQL localmente
2. Crea una base de datos:
   ```sql
   CREATE DATABASE phorencial_crm;
   ```
3. Configura `DATABASE_URL` en `.env.local`

## Paso 3: Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Generar NEXTAUTH_SECRET
# En Linux/Mac: openssl rand -hex 32
# En Windows PowerShell: -join ((48..57) + (97..122) | Get-Random -Count 32 | % {[char]$_})

NEXTAUTH_SECRET=tu-secret-generado
JWT_SECRET=otro-secret-diferente
DATABASE_URL=postgresql://usuario:password@host:5432/database
```

## Paso 4: Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos demo
npm run db:seed
```

## Paso 5: Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Paso 6: Iniciar Sesión

Usa las credenciales demo creadas por el seed:

- **Admin**: admin@phorencial.com / admin123
- **Analista**: analista@phorencial.com / analista123
- **Vendedor**: vendedor@phorencial.com / vendedor123

## 🎯 Próximos Pasos

1. **Personalizar el esquema**: Edita `prisma/schema.prisma` según tus necesidades
2. **Agregar componentes**: Usa `npx shadcn-ui@latest add [component]` para agregar componentes
3. **Crear nuevas rutas**: Agrega archivos en `src/app/` siguiendo el App Router de Next.js
4. **Configurar autenticación OAuth**: Edita `src/lib/auth.ts` para agregar Google OAuth u otros proveedores

## 📚 Recursos

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

