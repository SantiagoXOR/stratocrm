# Arquitectura del Sistema - CRM Inmobiliario STRATO

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura Multitenancy](#arquitectura-multitenancy)
3. [Arquitectura de Servicios](#arquitectura-de-servicios)
4. [Integración con Servicios Externos](#integración-con-servicios-externos)
5. [Flujos de Datos](#flujos-de-datos)
6. [Decisiones de Diseño](#decisiones-de-diseño)
7. [Plan de Migración](#plan-de-migración)

## 🎯 Visión General

ASTOR es un CRM inmobiliario multitenant que permite a múltiples agencias inmobiliarias gestionar sus leads, propiedades, conversaciones y campañas de forma independiente y segura.

### Principios Arquitectónicos

1. **Multitenancy**: Aislamiento completo de datos por tenant (agencia)
2. **Escalabilidad**: Arquitectura preparada para crecimiento horizontal
3. **Integración**: Conectividad con servicios externos (ManyChat, UChat, ElevenLabs)
4. **Modularidad**: Componentes desacoplados y reutilizables
5. **Seguridad**: Aislamiento de datos y autenticación robusta

### Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: NextAuth.js con JWT
- **Servicios Externos**: ManyChat, UChat, ElevenLabs, WhatsApp Business API

## 🏢 Arquitectura Multitenancy

### Estrategia: Row-Level Security (RLS) con Tenant ID

Implementamos multitenancy usando **Shared Database, Shared Schema** con aislamiento a nivel de fila mediante un campo `tenantId` en cada tabla.

#### Ventajas

- ✅ Costo eficiente (una sola base de datos)
- ✅ Mantenimiento simplificado
- ✅ Migraciones centralizadas
- ✅ Fácil agregación de métricas globales
- ✅ Escalabilidad horizontal del servidor de aplicaciones

#### Desventajas y Mitigaciones

- ⚠️ **Riesgo de fuga de datos**: Mitigado con middleware y validación estricta
- ⚠️ **Consultas más complejas**: Mitigado con helpers y abstracciones

### Modelo de Datos Multitenant

#### Nuevo Modelo: Tenant (Organización)

```prisma
model Tenant {
  id          String   @id @default(cuid())
  nombre      String
  slug        String   @unique  // Para subdominios o rutas
  email       String?
  telefono    String?
  config      String?  @db.Json  // Configuración personalizada
  isActive    Boolean  @default(true)
  plan        String   @default("BASIC")  // BASIC, PRO, ENTERPRISE
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  leads       Lead[]
  properties  Property[]
  campaigns   Campaign[]
  integrations TenantIntegration[]
  
  @@index([slug])
  @@index([isActive])
}
```

#### Modificaciones a Modelos Existentes

Todos los modelos que requieren aislamiento por tenant deben incluir:

```prisma
tenantId  String
tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
```

**Modelos que requieren tenantId:**
- ✅ Lead
- ✅ Event
- ✅ Conversation
- ✅ Message
- ✅ Property (nuevo)
- ✅ Campaign (nuevo)
- ✅ User (pertenece a un tenant)
- ✅ Assistant
- ✅ WhatsAppTemplate
- ✅ WhatsAppSync

**Modelos globales (sin tenantId):**
- ❌ Rule (configuración global del sistema)

### Middleware de Tenant Context

```typescript
// src/lib/tenant.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { db } from './db';

export async function getTenantContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  // Obtener tenant del usuario
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true }
  });
  
  return user?.tenant || null;
}

export function withTenant<T>(
  handler: (tenantId: string) => Promise<T>
) {
  return async (): Promise<T> => {
    const tenant = await getTenantContext();
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }
    return handler(tenant.id);
  };
}
```

### Prisma Middleware para Aislamiento

```typescript
// src/lib/db.ts
import { Prisma } from '@prisma/client';

export const tenantMiddleware: Prisma.Middleware = async (params, next) => {
  // Agregar filtro tenantId automáticamente en queries
  if (params.model && ['Lead', 'Event', 'Conversation'].includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      if (!params.args.where) params.args.where = {};
      // tenantId se inyecta desde el contexto
    }
  }
  return next(params);
};
```

## 🔌 Arquitectura de Servicios

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Dashboard │  │  Leads   │  │Campaigns │  │ Properties│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Next.js API Routes)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ /api/leads│  │/api/campaigns│/api/properties│/api/webhooks│
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Business Logic Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Lead      │  │ Campaign │  │ Property │  │ Integration│  │
│  │ Service   │  │ Service  │  │ Service  │  │ Service   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Access Layer (Prisma)                       │
│                    PostgreSQL                                │
│              (Multitenant con tenantId)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ ManyChat │  │  UChat   │  │ElevenLabs│  │ WhatsApp │    │
│  │          │  │          │  │          │  │ Business │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Capas de la Aplicación

#### 1. Presentation Layer (Frontend)
- **Responsabilidad**: UI/UX, interacción con usuario
- **Tecnología**: Next.js App Router, React Server Components
- **Componentes**: Páginas, componentes UI, formularios

#### 2. API Layer (Route Handlers)
- **Responsabilidad**: Endpoints REST, validación de entrada, autenticación
- **Tecnología**: Next.js API Routes
- **Patrón**: Controller pattern

#### 3. Business Logic Layer
- **Responsabilidad**: Lógica de negocio, reglas de dominio
- **Tecnología**: TypeScript, servicios modulares
- **Estructura**: `src/services/`

#### 4. Data Access Layer
- **Responsabilidad**: Acceso a base de datos, queries optimizadas
- **Tecnología**: Prisma ORM
- **Aislamiento**: Filtrado automático por tenantId

#### 5. Integration Layer
- **Responsabilidad**: Comunicación con servicios externos
- **Tecnología**: HTTP clients, webhooks
- **Estructura**: `src/integrations/`

## 🔗 Integración con Servicios Externos

### ManyChat Integration

**Propósito**: Automatización de conversaciones en Facebook Messenger y WhatsApp

#### Arquitectura

```
WhatsApp/Facebook Message
        │
        ▼
   ManyChat Webhook
        │
        ▼
  /api/webhooks/manychat
        │
        ▼
  ManyChat Service
        │
        ├──► Create/Update Lead
        ├──► Route to Agent
        └──► Trigger Campaign
```

#### Implementación

```typescript
// src/integrations/manychat/service.ts
export class ManyChatService {
  async handleWebhook(payload: ManyChatWebhook) {
    // 1. Identificar tenant desde configuración
    const tenant = await this.getTenantFromConfig(payload);
    
    // 2. Crear o actualizar lead
    const lead = await this.syncLead(payload, tenant.id);
    
    // 3. Crear conversación
    const conversation = await this.createConversation(lead, payload);
    
    // 4. Procesar respuesta automática si aplica
    await this.processAutoResponse(conversation, tenant);
  }
  
  async sendMessage(conversationId: string, message: string) {
    // Enviar mensaje a través de ManyChat API
  }
}
```

#### Modelo de Datos

```prisma
model TenantIntegration {
  id          String   @id @default(cuid())
  tenantId    String
  provider    String   // "MANYCHAT", "UCHAT", "ELEVENLABS"
  config      String   @db.Json  // API keys, webhook URLs, etc.
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, provider])
  @@index([tenantId])
}
```

### UChat Integration

**Propósito**: Alternativa a ManyChat, automatización de WhatsApp

#### Diferencias con ManyChat

- Similar arquitectura pero con API diferente
- Enfoque más en WhatsApp Business API
- Puede coexistir con ManyChat para diferentes tenants

#### Implementación

```typescript
// src/integrations/uchat/service.ts
export class UChatService {
  async handleWebhook(payload: UChatWebhook) {
    // Similar a ManyChat pero con lógica específica de UChat
  }
}
```

### ElevenLabs Integration

**Propósito**: Síntesis de voz para mensajes personalizados y llamadas automatizadas

#### Casos de Uso

1. **Mensajes de Voz Personalizados**
   - Confirmaciones de visitas
   - Recordatorios de llamadas
   - Seguimiento post-visita

2. **IVR (Interactive Voice Response)**
   - Llamadas automatizadas para calificación de leads
   - Encuestas de satisfacción
   - Confirmaciones de citas

3. **Contenido de Audio**
   - Narración de información de propiedades
   - Mensajes de campañas de fidelización

#### Arquitectura

```
Campaign/Event Trigger
        │
        ▼
  ElevenLabs Service
        │
        ├──► Generate Voice
        │         │
        │         ▼
        │    Audio File
        │         │
        │         ▼
        └──► Send via WhatsApp/Phone
```

#### Implementación

```typescript
// src/integrations/elevenlabs/service.ts
export class ElevenLabsService {
  async generateVoice(
    text: string,
    voiceId: string,
    tenantId: string
  ): Promise<Buffer> {
    const config = await this.getTenantConfig(tenantId);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
        }),
      }
    );
    
    return Buffer.from(await response.arrayBuffer());
  }
  
  async sendVoiceMessage(
    phoneNumber: string,
    audioBuffer: Buffer,
    tenantId: string
  ) {
    // Enviar a través de WhatsApp Business API o ManyChat/UChat
  }
}
```

### WhatsApp Business API Integration

**Propósito**: Comunicación directa con WhatsApp (alternativa/complemento a ManyChat/UChat)

#### Flujo de Mensajes

```
Inbound Message
        │
        ▼
  WhatsApp Webhook
        │
        ▼
  /api/webhooks/whatsapp
        │
        ▼
  WhatsApp Service
        │
        ├──► Create/Update Lead
        ├──► Create Conversation
        └──► Route to Agent or Bot
```

## 📊 Flujos de Datos

### Flujo 1: Consulta desde Meta Ads → Lead Creation

```
Meta Ads Click
    │
    ▼
Landing Page (Formulario)
    │
    ▼
POST /api/leads
    │
    ├──► Create Lead (con tenantId)
    ├──► Create Event (tipo: CREATED, origen: ads)
    └──► Trigger Campaign (Oportunidades)
            │
            ▼
    ManyChat/UChat Bot
            │
            ▼
    Welcome Message + Qualification
```

### Flujo 2: WhatsApp Directo → Conversación → Lead

```
WhatsApp Message (Wapp Directo)
    │
    ▼
ManyChat/UChat Webhook
    │
    ▼
/api/webhooks/manychat
    │
    ├──► Identify Tenant (desde phoneNumberId)
    ├──► Create/Update Lead
    ├──► Create Conversation
    └──► Process Bot Response
            │
            ├──► Auto-responder (si bot activo)
            └──► Route to Agent (si requiere intervención)
```

### Flujo 3: Campaña de Fidelización → Voice Message

```
Cron Job / Scheduled Task
    │
    ▼
Campaign Service
    │
    ├──► Get Leads (Base de Relaciones)
    ├──► Filter by Criteria
    └──► For each Lead:
            │
            ├──► Generate Voice (ElevenLabs)
            │         │
            │         ▼
            │    Audio Buffer
            │         │
            └──► Send via WhatsApp (ManyChat/UChat)
```

### Flujo 4: Búsqueda de Propiedades → Oportunidad

```
Comprador/Locador Request
    │
    ▼
Agent Interface
    │
    ├──► NO tengo propias
    │         │
    │         ▼
    │    Generate Search Alert
    │         │
    │         ▼
    │    Agent Search
    │         │
    │         ▼
    │    Load Properties in Astor
    │         │
    │         ▼
    │    Astor Orders Properties
    │
    └──► SI tengo propias
            │
            ▼
    Send Property Cards
            │
            ▼
    Follow-up Questions
            │
            ├──► No le gustan → Continue Search
            └──► Si le gustan → Coordinate Visit
```

## 🎨 Decisiones de Diseño

### 1. Multitenancy: Shared Database vs Separate Databases

**Decisión**: Shared Database con Row-Level Security

**Razones**:
- Costo eficiente para múltiples tenants pequeños/medianos
- Facilita agregaciones y reportes globales
- Migraciones más simples
- Escalabilidad horizontal del servidor de aplicaciones

**Alternativa considerada**: Separate Databases
- Más seguro pero más costoso
- Mejor para tenants enterprise grandes

### 2. Identificación de Tenant

**Decisión**: Multi-estrategia

1. **Subdomain**: `tenant1.strato.com` → Identificar tenant desde subdomain
2. **Path-based**: `/t/tenant-slug/dashboard` → Identificar desde URL
3. **User-based**: Tenant asociado al usuario en sesión

**Implementación**:
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const subdomain = request.headers.get('host')?.split('.')[0];
  const tenant = await getTenantBySlug(subdomain);
  // Inyectar tenant en headers para uso en API routes
}
```

### 3. Integración de Servicios: Sincrónico vs Asíncrono

**Decisión**: Híbrido

- **Síncrono**: Webhooks de entrada (ManyChat, UChat, WhatsApp)
- **Asíncrono**: Operaciones pesadas (generación de voz, envío masivo)

**Implementación**:
- Webhooks procesados inmediatamente
- Tareas pesadas en cola (futuro: Bull/BullMQ con Redis)

### 4. Gestión de Configuración por Tenant

**Decisión**: Base de datos + JSON fields

```prisma
model Tenant {
  config String? @db.Json  // Configuración flexible
}

// Ejemplo de config:
{
  "manychat": {
    "apiKey": "...",
    "pageId": "...",
    "webhookUrl": "..."
  },
  "elevenlabs": {
    "apiKey": "...",
    "defaultVoiceId": "..."
  },
  "features": {
    "voiceMessages": true,
    "autoResponder": true
  }
}
```

## 🔄 Plan de Migración

### Fase 1: Preparación del Esquema Multitenant

1. **Crear modelo Tenant**
   ```bash
   npm run db:migrate -- --name add_tenant_model
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

3. **Migración de datos existentes**
   - Crear tenant por defecto
   - Asignar todos los registros existentes al tenant por defecto

### Fase 2: Implementación de Middleware

1. **Tenant Context Middleware**
   - `src/lib/tenant.ts`
   - Helpers para obtener tenant actual

2. **Prisma Middleware**
   - Filtrado automático por tenantId
   - Validación de tenantId en mutations

3. **API Route Middleware**
   - Validación de tenant en cada request
   - Inyección de tenantId en queries

### Fase 3: Nuevos Modelos

1. **Property Model**
   ```prisma
   model Property {
     id          String   @id @default(cuid())
     tenantId    String
     titulo      String
     descripcion String?  @db.Text
     precio      Int?
     zona        String?
     tipo        String?  // CASA, DEPARTAMENTO, TERRENO, etc.
     estado      String   @default("DISPONIBLE")
     // ... más campos
     
     tenant      Tenant   @relation(fields: [tenantId], references: [id])
     leads       Lead[]   // Leads interesados en esta propiedad
   }
   ```

2. **Campaign Model**
   ```prisma
   model Campaign {
     id          String   @id @default(cuid())
     tenantId    String
     nombre      String
     tipo        String   // OPORTUNIDADES, FIDELIZACION, PROPIEDADES, CAPTACION
     estado      String   @default("DRAFT")
     config      String?  @db.Json
     scheduledAt DateTime?
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     tenant      Tenant   @relation(fields: [tenantId], references: [id])
   }
   ```

3. **TenantIntegration Model**
   - Ya descrito arriba

### Fase 4: Integraciones

1. **ManyChat Integration**
   - Service layer
   - Webhook handler
   - API client

2. **UChat Integration**
   - Similar a ManyChat

3. **ElevenLabs Integration**
   - Service layer
   - Voice generation
   - Audio delivery

### Fase 5: Actualización de UI

1. **Tenant Selector** (si multi-tenant por usuario)
2. **Configuración de Integraciones**
3. **Gestión de Propiedades**
4. **Gestión de Campañas**

## 🔒 Seguridad Multitenant

### Principios

1. **Aislamiento Estricto**: Nunca exponer datos de otro tenant
2. **Validación en Múltiples Capas**: Middleware, Service Layer, Database
3. **Auditoría**: Log de accesos y cambios por tenant
4. **Rate Limiting**: Por tenant para prevenir abuso

### Implementación

```typescript
// src/lib/security.ts
export async function validateTenantAccess(
  tenantId: string,
  resourceTenantId: string
) {
  if (tenantId !== resourceTenantId) {
    throw new Error('Acceso no autorizado a recurso de otro tenant');
  }
}

// Uso en API routes
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userTenantId = session.user.tenantId;
  
  const lead = await db.lead.findUnique({ where: { id } });
  validateTenantAccess(userTenantId, lead.tenantId);
  
  return NextResponse.json(lead);
}
```

## 📈 Escalabilidad Futura

### Consideraciones

1. **Caché por Tenant**: Redis con prefijo de tenantId
2. **Colas de Trabajo**: Bull/BullMQ con aislamiento por tenant
3. **CDN**: Assets estáticos con tenant-specific paths
4. **Database Sharding**: Si un tenant crece mucho, migrar a DB separada

### Métricas a Monitorear

- Número de leads por tenant
- Uso de API de servicios externos por tenant
- Tiempo de respuesta de queries por tenant
- Uso de almacenamiento por tenant

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2025  
**Estado**: En diseño
