# Plan de Implementación - Multitenancy y Servicios Externos

## 📋 Índice

1. [Fases de Implementación](#fases-de-implementación)
2. [Migración del Esquema](#migración-del-esquema)
3. [Implementación de Servicios](#implementación-de-servicios)
4. [Testing](#testing)
5. [Rollout](#rollout)

## ⚠️ Nota sobre Timeline

Este plan es un plan general. Para un timeline específico de **3 meses con 2 desarrolladores junior**, ver [PLAN_3_MESES.md](PLAN_3_MESES.md).

## 🚀 Fases de Implementación

### Fase 1: Preparación y Esquema Multitenant (Semana 1-2)

#### Objetivos
- Agregar soporte multitenant al esquema de base de datos
- Crear migraciones sin pérdida de datos
- Implementar middleware básico de tenant

#### Tareas

1. **Crear modelo Tenant**
   ```prisma
   model Tenant {
     id          String   @id @default(cuid())
     nombre      String
     slug        String   @unique
     email       String?
     telefono    String?
     config      String?  @db.Json
     isActive    Boolean  @default(true)
     plan        String   @default("BASIC")
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     users       User[]
     leads       Lead[]
     // ... más relaciones
   }
   ```

2. **Agregar tenantId a modelos existentes**
   - Lead
   - Event
   - Conversation
   - Message
   - User
   - Assistant
   - WhatsAppTemplate
   - WhatsAppSync

3. **Migración de datos**
   - Crear script de migración
   - Crear tenant por defecto
   - Asignar todos los registros existentes al tenant por defecto

4. **Actualizar índices**
   - Agregar índices compuestos (tenantId, id)
   - Actualizar índices existentes

#### Entregables
- ✅ Migración de Prisma ejecutada
- ✅ Datos existentes migrados
- ✅ Tests de migración pasando

### Fase 2: Middleware y Context (Semana 2-3)

#### Objetivos
- Implementar sistema de contexto de tenant
- Crear middleware para validación
- Actualizar queries existentes

#### Tareas

1. **Crear Tenant Context**
   ```typescript
   // src/lib/tenant.ts
   - getTenantContext()
   - withTenant()
   - validateTenantAccess()
   ```

2. **Prisma Middleware**
   - Filtrado automático por tenantId
   - Validación en mutations

3. **API Route Middleware**
   - Decorator/middleware para inyectar tenant
   - Validación automática

4. **Actualizar API Routes existentes**
   - /api/leads
   - /api/auth (si aplica)

#### Entregables
- ✅ Middleware funcionando
- ✅ Todas las queries filtradas por tenant
- ✅ Tests de aislamiento pasando

### Fase 3: Nuevos Modelos (Semana 3-4)

#### Objetivos
- Agregar modelos necesarios para funcionalidades nuevas
- Property, Campaign, TenantIntegration

#### Tareas

1. **Modelo Property**
   ```prisma
   model Property {
     id          String   @id @default(cuid())
     tenantId    String
     titulo      String
     descripcion String?  @db.Text
     precio      Int?
     zona        String?
     tipo        String?
     estado      String   @default("DISPONIBLE")
     // ... más campos
   }
   ```

2. **Modelo Campaign**
   ```prisma
   model Campaign {
     id          String   @id @default(cuid())
     tenantId    String
     nombre      String
     tipo        String
     estado      String   @default("DRAFT")
     config      String?  @db.Json
     // ...
   }
   ```

3. **Modelo TenantIntegration**
   - Ya definido en ARQUITECTURA.md

#### Entregables
- ✅ Modelos creados y migrados
- ✅ Relaciones configuradas
- ✅ API routes básicas

### Fase 4: Integración ManyChat (Semana 4-5)

#### Objetivos
- Integrar ManyChat para automatización de conversaciones
- Webhook handler funcional
- Envío de mensajes

#### Tareas

1. **Service Layer**
   ```typescript
   // src/integrations/manychat/service.ts
   - ManyChatService class
   - sendMessage()
   - updateSubscriberTags()
   - triggerFlow()
   ```

2. **Webhook Handler**
   ```typescript
   // src/app/api/webhooks/manychat/route.ts
   - POST handler
   - Verificación de request
   - Procesamiento de payload
   ```

3. **Configuración UI**
   - Formulario de configuración
   - Gestión de API keys
   - Testing de conexión

#### Entregables
- ✅ Webhook recibiendo mensajes
- ✅ Creación automática de leads
- ✅ Envío de mensajes funcionando

### Fase 5: Integración UChat (Semana 5-6)

#### Objetivos
- Similar a ManyChat pero con API diferente
- Permitir usar uno u otro según tenant

#### Tareas
- Similar a Fase 4 pero con UChatService
- Webhook handler específico
- Configuración independiente

#### Entregables
- ✅ UChat funcionando
- ✅ Tenants pueden elegir ManyChat o UChat

### Fase 6: Integración ElevenLabs (Semana 6-7)

#### Objetivos
- Generación de voz para mensajes personalizados
- Integración con campañas

#### Tareas

1. **Service Layer**
   ```typescript
   // src/integrations/elevenlabs/service.ts
   - ElevenLabsService class
   - generateVoice()
   - sendVoiceMessage()
   ```

2. **Campañas de Voz**
   - Confirmaciones de visitas
   - Recordatorios
   - Campañas de fidelización

3. **Storage de Audio**
   - Decidir: generar on-demand o cachear
   - Integración con storage (S3, Supabase Storage)

#### Entregables
- ✅ Generación de voz funcionando
- ✅ Envío de mensajes de voz
- ✅ Campañas automatizadas

### Fase 7: UI y Configuración (Semana 7-8)

#### Objetivos
- Interfaces para gestionar integraciones
- Configuración por tenant
- Testing de integraciones

#### Tareas

1. **Página de Configuración de Integraciones**
   - Lista de integraciones disponibles
   - Formularios de configuración
   - Testing de conexión
   - Estado de integración

2. **Gestión de Propiedades**
   - CRUD de propiedades
   - Asociación con leads
   - Búsqueda y filtros

3. **Gestión de Campañas**
   - Crear campañas
   - Programar ejecución
   - Ver resultados

#### Entregables
- ✅ UI completa para integraciones
- ✅ Configuración funcional
- ✅ Documentación de usuario

## 🔄 Migración del Esquema

### Paso 1: Crear Migración Inicial

```bash
# 1. Agregar modelo Tenant al schema.prisma
# 2. Crear migración
npm run db:migrate -- --name add_tenant_model --create-only

# 3. Revisar migración generada
# 4. Ejecutar migración
npm run db:migrate
```

### Paso 2: Agregar tenantId a Modelos Existentes

**Estrategia**: Migración en dos pasos para evitar pérdida de datos

#### Paso 2.1: Agregar columna nullable

```sql
-- En la migración
ALTER TABLE "Lead" ADD COLUMN "tenantId" TEXT;
-- Repetir para todos los modelos
```

#### Paso 2.2: Poblar tenantId y hacer NOT NULL

```typescript
// Script de migración de datos
// prisma/migrations/XXXX_populate_tenant_id/migration.sql

-- 1. Crear tenant por defecto si no existe
INSERT INTO "Tenant" (id, nombre, slug, "isActive", "createdAt", "updatedAt")
VALUES ('default-tenant-id', 'Tenant Por Defecto', 'default', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Asignar todos los registros al tenant por defecto
UPDATE "Lead" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
UPDATE "Event" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;
-- ... repetir para todos los modelos

-- 3. Hacer NOT NULL
ALTER TABLE "Lead" ALTER COLUMN "tenantId" SET NOT NULL;
-- ... repetir para todos los modelos

-- 4. Agregar foreign keys
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
-- ... repetir para todos los modelos

-- 5. Agregar índices
CREATE INDEX "Lead_tenantId_idx" ON "Lead"("tenantId");
-- ... repetir para todos los modelos
```

### Paso 3: Actualizar Constraints de Unicidad

Algunos campos únicos ahora deben ser únicos por tenant:

```sql
-- Antes: dni único globalmente
-- Después: dni único por tenant

-- Eliminar constraint único existente
ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_dni_key";

-- Agregar constraint único compuesto
CREATE UNIQUE INDEX "Lead_tenantId_dni_key" ON "Lead"("tenantId", "dni") 
WHERE "dni" IS NOT NULL;
```

## 🧪 Testing

### Tests de Aislamiento Multitenant

```typescript
// tests/multitenant.test.ts
describe('Multitenant Isolation', () => {
  it('should not allow access to other tenant data', async () => {
    const tenant1 = await createTenant('tenant1');
    const tenant2 = await createTenant('tenant2');
    
    const lead1 = await createLead(tenant1.id, { nombre: 'Lead 1' });
    
    // Intentar acceder desde tenant2
    const session = await createSession(tenant2.id);
    const response = await fetch(`/api/leads/${lead1.id}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    
    expect(response.status).toBe(403);
  });
});
```

### Tests de Integraciones

```typescript
// tests/integrations/manychat.test.ts
describe('ManyChat Integration', () => {
  it('should create lead from webhook', async () => {
    const payload = {
      event_type: 'message',
      subscriber: {
        phone: '+5491123456789',
        first_name: 'Juan'
      },
      message: { text: 'Hola' }
    };
    
    const response = await fetch('/api/webhooks/manychat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    expect(response.status).toBe(200);
    
    // Verificar que se creó el lead
    const lead = await db.lead.findFirst({
      where: { telefono: '+5491123456789' }
    });
    
    expect(lead).toBeDefined();
  });
});
```

## 📊 Rollout

### Estrategia de Despliegue

1. **Fase Beta** (Semana 8-9)
   - Desplegar a un tenant de prueba
   - Testing exhaustivo
   - Ajustes basados en feedback

2. **Rollout Gradual** (Semana 10+)
   - Migrar tenants existentes uno por uno
   - Monitorear métricas
   - Soporte activo

### Checklist de Rollout

- [ ] Migración de base de datos ejecutada
- [ ] Todos los tests pasando
- [ ] Documentación actualizada
- [ ] Backup de base de datos antes de migración
- [ ] Plan de rollback preparado
- [ ] Monitoreo configurado
- [ ] Equipo de soporte informado

### Monitoreo Post-Rollout

- **Métricas a monitorear**:
  - Tiempo de respuesta de queries
  - Errores de aislamiento
  - Uso de integraciones
  - Performance de webhooks

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Estado**: Planificación
