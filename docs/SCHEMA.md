# Esquema de Base de Datos - CRM Inmobiliario STRATO

## 📋 Índice

1. [Resumen](#resumen)
2. [Modelos de Datos](#modelos-de-datos)
3. [Relaciones](#relaciones)
4. [Índices](#índices)
5. [Validaciones](#validaciones)
6. [Migraciones](#migraciones)

## 🎯 Resumen

El esquema de base de datos está diseñado para soportar un CRM inmobiliario completo con gestión de leads, eventos, conversaciones y usuarios. Utiliza PostgreSQL como base de datos y Prisma como ORM.

### Tecnologías

- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **IDs**: CUID (Collision-resistant Unique Identifier)

## 📊 Modelos de Datos

### Lead

Modelo principal para gestionar clientes potenciales (leads).

```prisma
model Lead {
  id          String   @id @default(cuid())
  nombre      String
  dni         String?  @unique
  cuil        String?
  telefono    String
  email       String?
  ingresos    Int?
  zona        String?
  producto    String?
  monto       Int?
  origen      String?
  utmSource   String?
  estado      String   @default("NUEVO")
  agencia     String?
  banco       String?
  trabajo_actual String?
  notas       String?
  whatsappId   String?  @unique
  tags         String?
  customFields String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  events        Event[]
  conversations Conversation[]
  syncLogs      WhatsAppSync[]

  @@index([telefono])
  @@index([estado])
  @@index([createdAt])
  @@index([origen])
  @@index([whatsappId])
}
```

**Campos Clave:**
- `id`: Identificador único (CUID)
- `nombre`: Nombre completo del lead (requerido)
- `dni`: Documento Nacional de Identidad (único, opcional)
- `telefono`: Teléfono de contacto (requerido, indexado)
- `estado`: Estado del lead (default: "NUEVO", indexado)
- `whatsappId`: ID de WhatsApp para sincronización (único, opcional)

**Estados Válidos:**
- `NUEVO`
- `EN_REVISION`
- `PREAPROBADO`
- `RECHAZADO`
- `DOC_PENDIENTE`
- `DERIVADO`

**Orígenes Válidos:**
- `whatsapp`
- `instagram`
- `facebook`
- `comentario`
- `web`
- `ads`

### Event

Registro de eventos relacionados con leads.

```prisma
model Event {
  id        String   @id @default(cuid())
  leadId    String?
  tipo      String
  payload   String?
  createdAt DateTime @default(now())
  lead      Lead?    @relation(fields: [leadId], references: [id])

  @@index([leadId])
  @@index([tipo])
  @@index([createdAt])
}
```

**Tipos de Eventos Comunes:**
- `CREATED` - Lead creado
- `UPDATED` - Lead actualizado
- `STATUS_CHANGED` - Cambio de estado
- `CONTACTED` - Contacto realizado
- `DOCUMENT_RECEIVED` - Documento recibido
- `APPROVED` - Aprobado
- `REJECTED` - Rechazado

**Payload:**
JSON string con información adicional del evento.

### User

Usuarios del sistema con autenticación.

```prisma
model User {
  id        String   @id @default(cuid())
  nombre    String
  email     String   @unique
  hash      String
  rol       String   @default("VENDEDOR")
  createdAt DateTime @default(now())
  
  assignedConversations Conversation[]
  createdAssistants     Assistant[]
}
```

**Roles:**
- `ADMIN` - Acceso completo
- `ANALISTA` - Análisis y gestión
- `VENDEDOR` - Gestión limitada

**Seguridad:**
- `hash`: Contraseña hasheada con bcrypt
- `email`: Único, usado para autenticación

### Conversation

Conversaciones asociadas a leads (WhatsApp, Instagram, etc.).

```prisma
model Conversation {
  id            String   @id @default(cuid())
  leadId        String?
  platform      String
  platformId    String
  status        String   @default("open")
  assignedTo    String?
  lastMessageAt DateTime @default(now())
  whatsappData  String?
  phoneNumberId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  lead          Lead?    @relation(fields: [leadId], references: [id])
  messages      Message[]
  assignedUser  User?    @relation(fields: [assignedTo], references: [id])
  
  @@unique([platform, platformId])
  @@index([status])
  @@index([assignedTo])
  @@index([lastMessageAt])
}
```

**Plataformas:**
- `whatsapp` - WhatsApp Business API
- `instagram` - Instagram Direct
- `facebook` - Facebook Messenger

**Estados:**
- `open` - Abierta
- `closed` - Cerrada
- `pending` - Pendiente

### Message

Mensajes dentro de conversaciones.

```prisma
model Message {
  id             String   @id @default(cuid())
  conversationId String
  direction      String
  content        String
  mediaUrl       String?
  messageType    String   @default("text")
  platformMsgId  String?  @unique
  sentAt         DateTime @default(now())
  readAt         DateTime?
  deliveredAt    DateTime?
  
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  
  @@index([conversationId])
  @@index([sentAt])
}
```

**Direction:**
- `inbound` - Mensaje recibido
- `outbound` - Mensaje enviado

**Tipos de Mensaje:**
- `text` - Texto
- `image` - Imagen
- `video` - Video
- `audio` - Audio
- `document` - Documento

### Assistant

Asistentes IA configurados en el sistema.

```prisma
model Assistant {
  id            String   @id @default(cuid())
  nombre        String
  descripcion   String?
  instrucciones String   @db.Text
  isDefault     Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  creator       User     @relation(fields: [createdBy], references: [id])
  
  @@index([createdBy])
  @@index([isActive])
  @@index([isDefault])
}
```

**Características:**
- `instrucciones`: Instrucciones del asistente (texto largo)
- `isDefault`: Asistente por defecto
- `isActive`: Si está activo

### Rule

Reglas de configuración del sistema.

```prisma
model Rule {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Uso:**
Configuración del sistema almacenada como key-value.

### WhatsAppSync

Registro de sincronizaciones con WhatsApp Business API.

```prisma
model WhatsAppSync {
  id          String   @id @default(cuid())
  leadId      String
  syncType    String
  status      String   @default("pending")
  direction   String
  data        String?
  error       String?
  retryCount  Int      @default(0)
  createdAt   DateTime @default(now())
  completedAt DateTime?
  
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  @@index([leadId])
  @@index([status])
  @@index([syncType])
  @@index([createdAt])
}
```

**Tipos de Sincronización:**
- `lead_created` - Lead creado
- `lead_updated` - Lead actualizado
- `status_changed` - Estado cambiado
- `message_sent` - Mensaje enviado
- `message_received` - Mensaje recibido

**Direcciones:**
- `to_whatsapp` - Hacia WhatsApp
- `from_whatsapp` - Desde WhatsApp

**Estados:**
- `pending` - Pendiente
- `completed` - Completado
- `failed` - Fallido

### WhatsAppTemplate

Plantillas de mensajes aprobadas por Meta para WhatsApp.

```prisma
model WhatsAppTemplate {
  id          String   @id @default(cuid())
  name        String   @unique
  category    String
  language    String   @default("es")
  content     String   @db.Text
  status      String   @default("pending")
  metaId      String?  @unique
  approvedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([category])
  @@index([language])
}
```

**Categorías:**
- `MARKETING` - Mensajes promocionales
- `UTILITY` - Confirmaciones, recordatorios
- `AUTHENTICATION` - Códigos de verificación

**Estados:**
- `pending` - Pendiente de aprobación
- `approved` - Aprobada por Meta
- `rejected` - Rechazada
- `paused` - Pausada

## 🔗 Relaciones

### Diagrama de Relaciones

```
Lead (1) ──── (N) Event
Lead (1) ──── (N) Conversation
Lead (1) ──── (N) WhatsAppSync

User (1) ──── (N) Conversation (assignedTo)
User (1) ──── (N) Assistant (createdBy)

Conversation (1) ──── (N) Message
```

### Relaciones Detalladas

**Lead → Event (One-to-Many)**
- Un lead puede tener múltiples eventos
- Evento puede no tener lead (eventos globales)
- `leadId` es opcional

**Lead → Conversation (One-to-Many)**
- Un lead puede tener múltiples conversaciones
- Conversación puede no tener lead inicialmente
- `leadId` es opcional

**Lead → WhatsAppSync (One-to-Many)**
- Un lead puede tener múltiples sincronizaciones
- Cascade delete: si se elimina lead, se eliminan syncs

**User → Conversation (One-to-Many)**
- Un usuario puede tener múltiples conversaciones asignadas
- `assignedTo` es opcional

**User → Assistant (One-to-Many)**
- Un usuario puede crear múltiples asistentes
- `createdBy` es requerido

**Conversation → Message (One-to-Many)**
- Una conversación puede tener múltiples mensajes
- `conversationId` es requerido

## 📑 Índices

### Índices de Lead

```prisma
@@index([telefono])      // Búsqueda por teléfono
@@index([estado])        // Filtrado por estado
@@index([createdAt])      // Ordenamiento por fecha
@@index([origen])        // Filtrado por origen
@@index([whatsappId])    // Búsqueda por ID WhatsApp
```

### Índices de Event

```prisma
@@index([leadId])        // Eventos por lead
@@index([tipo])          // Filtrado por tipo
@@index([createdAt])    // Ordenamiento por fecha
```

### Índices de Conversation

```prisma
@@index([status])        // Filtrado por estado
@@index([assignedTo])   // Conversaciones asignadas
@@index([lastMessageAt]) // Ordenamiento por última actividad
@@unique([platform, platformId]) // Unicidad por plataforma
```

### Índices de Message

```prisma
@@index([conversationId]) // Mensajes por conversación
@@index([sentAt])        // Ordenamiento por fecha
```

### Índices de WhatsAppSync

```prisma
@@index([leadId])       // Syncs por lead
@@index([status])       // Filtrado por estado
@@index([syncType])     // Filtrado por tipo
@@index([createdAt])    // Ordenamiento por fecha
```

### Índices de WhatsAppTemplate

```prisma
@@index([status])       // Filtrado por estado de aprobación
@@index([category])     // Filtrado por categoría
@@index([language])     // Filtrado por idioma
```

## ✅ Validaciones

### Validaciones a Nivel de Base de Datos

**Lead:**
- `dni`: Único si existe
- `whatsappId`: Único si existe
- `telefono`: Requerido
- `nombre`: Requerido
- `estado`: Default "NUEVO"

**User:**
- `email`: Único, requerido
- `hash`: Requerido
- `rol`: Default "VENDEDOR"

**Conversation:**
- `platform` + `platformId`: Único (combinado)

**Message:**
- `platformMsgId`: Único si existe

### Validaciones a Nivel de Aplicación (Zod)

Ver `src/lib/validators.ts` para esquemas de validación completos.

**Lead Schema:**
```typescript
{
  nombre: string (min 1)
  dni: string (opcional, único)
  telefono: string (min 1)
  email: string (email válido, opcional)
  ingresos: number (positivo, opcional)
  estado: enum (NUEVO, EN_REVISION, PREAPROBADO, RECHAZADO, DOC_PENDIENTE, DERIVADO)
  origen: enum (whatsapp, instagram, facebook, comentario, web, ads, opcional)
  // ... otros campos
}
```

## 🔄 Migraciones

### Comandos de Migración

```bash
# Crear nueva migración
npm run db:migrate

# Aplicar migraciones pendientes
npm run db:migrate

# Resetear base de datos (desarrollo)
npm run db:reset

# Generar cliente Prisma
npm run db:generate

# Ver estado de migraciones
npx prisma migrate status
```

### Convenciones de Migraciones

- Nombres descriptivos: `add_lead_custom_fields`
- Una migración por cambio lógico
- Incluir rollback si es posible
- Probar en desarrollo antes de producción

### Migraciones Existentes

La base de datos inicial incluye:
- Tablas principales (Lead, User, Event, etc.)
- Índices optimizados
- Relaciones configuradas
- Valores por defecto

## 📈 Optimizaciones

### Consultas Frecuentes Optimizadas

1. **Listar Leads con Filtros**
   - Índices en `estado`, `origen`, `createdAt`
   - Índice en `telefono` para búsquedas

2. **Eventos por Lead**
   - Índice en `leadId` y `createdAt`
   - Ordenamiento eficiente

3. **Conversaciones Activas**
   - Índice en `status` y `lastMessageAt`
   - Filtrado rápido

4. **Sincronizaciones Pendientes**
   - Índice en `status` y `createdAt`
   - Consultas eficientes

### Consideraciones de Rendimiento

- **Paginación**: Siempre usar para listas grandes
- **Índices**: Agregar según patrones de consulta
- **Relaciones**: Cargar solo cuando sea necesario
- **Cascade Deletes**: Configurados apropiadamente

## 🔒 Seguridad

### Datos Sensibles

- **Passwords**: Hasheados con bcrypt
- **Emails**: Únicos, validados
- **DNI**: Único, opcional

### Integridad Referencial

- Foreign keys configuradas
- Cascade deletes donde aplica
- Constraints de unicidad
- Valores por defecto apropiados

## 📝 Notas de Diseño

### Decisiones de Diseño

1. **CUIDs vs UUIDs**: CUIDs para mejor rendimiento en índices
2. **Campos JSON**: `payload`, `whatsappData`, `customFields` como strings JSON
3. **Timestamps**: `createdAt` y `updatedAt` automáticos
4. **Soft Deletes**: No implementados en primera etapa (hard delete)

### Extensiones Futuras

- Soft deletes para leads
- Auditoría de cambios
- Versionado de datos
- Archivos adjuntos
- Notificaciones

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**ORM**: Prisma 5.9.1  
**Base de Datos**: PostgreSQL

