# Integraciones con Servicios Externos - STRATO CRM

## 📋 Índice

1. [ManyChat](#manychat)
2. [UChat](#uchat)
3. [ElevenLabs](#elevenlabs)
4. [WhatsApp Business API](#whatsapp-business-api)
5. [Configuración por Tenant](#configuración-por-tenant)
6. [Webhooks](#webhooks)
7. [Casos de Uso](#casos-de-uso)

## 💬 ManyChat

### Descripción

ManyChat es una plataforma de automatización de marketing conversacional que permite crear chatbots para Facebook Messenger, Instagram y WhatsApp.

### Casos de Uso en STRATO

1. **Calificación Automática de Leads**
   - Preguntas automáticas al recibir consulta
   - Clasificación por tipo de búsqueda (compra, alquiler, venta)
   - Captura de información básica

2. **Envío de Fichas de Propiedades**
   - Envío automático de propiedades según filtros
   - Galería de imágenes
   - Información detallada

3. **Agendamiento de Visitas**
   - Integración con calendario
   - Confirmaciones automáticas
   - Recordatorios

4. **Seguimiento Post-Visita**
   - Encuestas de satisfacción
   - Solicitud de feedback
   - Ofertas de seguimiento

### Arquitectura de Integración

```
ManyChat Flow
    │
    ├──► User Message
    │         │
    │         ▼
    │    ManyChat Bot (configurado en ManyChat)
    │         │
    │         ├──► Auto-responder (simple)
    │         └──► Webhook → STRATO API
    │                        │
    │                        ▼
    │                   Process & Store
    │
    └──► STRATO → ManyChat
                │
                ├──► Send Message
                ├──► Update User Tags
                └──► Trigger Flow
```

### Configuración

#### Variables de Entorno

```env
MANYCHAT_API_KEY=your_api_key
MANYCHAT_API_URL=https://api.manychat.com
```

#### Configuración por Tenant

```typescript
// En Tenant.config (JSON)
{
  "manychat": {
    "apiKey": "tenant_specific_key",
    "pageId": "facebook_page_id",
    "flowId": "default_flow_id",
    "webhookUrl": "https://strato.com/api/webhooks/manychat",
    "isActive": true
  }
}
```

### API Endpoints

#### POST /api/webhooks/manychat

Recibe webhooks de ManyChat cuando un usuario interactúa con el bot.

**Payload de ejemplo**:
```json
{
  "event_type": "message",
  "subscriber": {
    "id": "123456",
    "phone": "+5491123456789",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "message": {
    "text": "Estoy buscando un departamento en Palermo"
  },
  "page_id": "facebook_page_id"
}
```

**Procesamiento**:
1. Identificar tenant desde `page_id`
2. Buscar o crear lead con `phone`
3. Crear/actualizar conversación
4. Procesar mensaje y determinar acción
5. Responder a ManyChat si es necesario

#### POST /api/integrations/manychat/send

Envía mensaje a través de ManyChat.

**Request**:
```json
{
  "subscriberId": "123456",
  "message": "Aquí tienes las propiedades que buscas",
  "attachments": [
    {
      "type": "image",
      "url": "https://..."
    }
  ]
}
```

### Implementación

```typescript
// src/integrations/manychat/service.ts
export class ManyChatService {
  private apiKey: string;
  private apiUrl: string;

  constructor(config: ManyChatConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || 'https://api.manychat.com';
  }

  async sendMessage(subscriberId: string, message: string) {
    const response = await fetch(
      `${this.apiUrl}/fb/sending/sendContent`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriber_id: subscriberId,
          data: {
            version: 'v2',
            content: {
              messages: [
                {
                  type: 'text',
                  text: message,
                },
              ],
            },
          },
        }),
      }
    );

    return response.json();
  }

  async updateSubscriberTags(
    subscriberId: string,
    tags: string[]
  ) {
    // Actualizar tags del suscriptor en ManyChat
  }

  async triggerFlow(subscriberId: string, flowId: string) {
    // Disparar un flow específico en ManyChat
  }
}
```

## 📱 UChat

### Descripción

UChat es una plataforma similar a ManyChat, enfocada principalmente en WhatsApp Business API.

### Diferencias con ManyChat

- **Enfoque**: Más orientado a WhatsApp
- **API**: Diferente estructura de API
- **Características**: Similar funcionalidad pero con implementación distinta

### Casos de Uso

Similares a ManyChat pero con énfasis en:
- WhatsApp como canal principal
- Integración más directa con WhatsApp Business API
- Flujos específicos para el mercado latinoamericano

### Configuración

```typescript
{
  "uchat": {
    "apiKey": "tenant_specific_key",
    "instanceId": "whatsapp_instance_id",
    "webhookUrl": "https://strato.com/api/webhooks/uchat",
    "isActive": true
  }
}
```

### Implementación

```typescript
// src/integrations/uchat/service.ts
export class UChatService {
  async sendMessage(phoneNumber: string, message: string) {
    // Implementación específica de UChat
  }
}
```

## 🎙️ ElevenLabs

### Descripción

ElevenLabs es un servicio de síntesis de voz con IA que genera voces naturales y expresivas.

### Casos de Uso en STRATO

1. **Mensajes de Voz Personalizados**
   - Confirmaciones de visitas con nombre del cliente
   - Recordatorios de llamadas
   - Seguimiento post-visita

2. **Campañas de Fidelización**
   - Mensajes de voz para clientes existentes
   - Información sobre nuevas propiedades
   - Ofertas especiales

3. **IVR (Interactive Voice Response)**
   - Llamadas automatizadas para calificación
   - Encuestas de satisfacción
   - Confirmaciones de citas

4. **Contenido de Audio**
   - Narración de descripciones de propiedades
   - Tours de audio de propiedades
   - Mensajes informativos

### Arquitectura

```
Campaign/Event Trigger
    │
    ▼
ElevenLabs Service
    │
    ├──► Generate Voice
    │         │
    │         ▼
    │    Audio Buffer (MP3/WAV)
    │         │
    │         ▼
    └──► Store & Deliver
            │
            ├──► WhatsApp (via ManyChat/UChat)
            ├──► Phone Call (via Twilio)
            └──► Email Attachment
```

### Configuración

```typescript
{
  "elevenlabs": {
    "apiKey": "tenant_specific_key",
    "defaultVoiceId": "21m00Tcm4TlvDq8ikWAM", // Rachel (femenina)
    "voices": {
      "spanish_male": "voice_id_1",
      "spanish_female": "voice_id_2"
    },
    "model": "eleven_multilingual_v2",
    "isActive": true
  }
}
```

### Implementación

```typescript
// src/integrations/elevenlabs/service.ts
export class ElevenLabsService {
  private apiKey: string;
  private apiUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
  }

  async generateVoice(
    text: string,
    voiceId?: string,
    options?: VoiceOptions
  ): Promise<Buffer> {
    const response = await fetch(
      `${this.apiUrl}/text-to-speech/${voiceId || config.defaultVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: options?.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: options?.stability || 0.5,
            similarity_boost: options?.similarityBoost || 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async sendVoiceMessage(
    phoneNumber: string,
    text: string,
    voiceId?: string
  ) {
    // 1. Generar audio
    const audioBuffer = await this.generateVoice(text, voiceId);

    // 2. Enviar a través de WhatsApp o llamada
    // Opción A: WhatsApp (via ManyChat/UChat)
    await this.sendViaWhatsApp(phoneNumber, audioBuffer);

    // Opción B: Llamada telefónica (via Twilio)
    // await this.sendViaPhoneCall(phoneNumber, audioBuffer);
  }

  private async sendViaWhatsApp(
    phoneNumber: string,
    audioBuffer: Buffer
  ) {
    // Convertir buffer a base64 o subir a storage
    // Enviar a través de ManyChat/UChat API
  }
}
```

### Casos de Uso Específicos

#### 1. Confirmación de Visita

```typescript
// src/services/campaigns/voice-campaign.ts
export async function sendVisitConfirmation(lead: Lead, visitDate: Date) {
  const tenant = await getTenant(lead.tenantId);
  const elevenLabs = new ElevenLabsService(tenant.config.elevenlabs);

  const message = `
    Hola ${lead.nombre}, te confirmo que tenemos agendada tu visita 
    para el ${format(visitDate, 'dd/MM/yyyy')} a las ${format(visitDate, 'HH:mm')}.
    Te esperamos. ¡Saludos!
  `;

  const audio = await elevenLabs.generateVoice(
    message,
    tenant.config.elevenlabs.voices.spanish_female
  );

  await sendViaWhatsApp(lead.telefono, audio);
}
```

#### 2. Campaña de Fidelización

```typescript
export async function sendLoyaltyVoiceMessage(
  lead: Lead,
  property: Property
) {
  const message = `
    Hola ${lead.nombre}, tenemos una nueva propiedad que podría interesarte.
    Es un ${property.tipo} en ${property.zona} por $${property.precio}.
    ¿Te gustaría conocer más detalles?
  `;

  // Generar y enviar voz
}
```

## 📞 WhatsApp Business API

### Descripción

Integración directa con WhatsApp Business API de Meta (anteriormente Facebook).

### Casos de Uso

- Comunicación directa sin intermediarios
- Mayor control sobre mensajes
- Mejor para volúmenes altos
- Plantillas aprobadas por Meta

### Configuración

```typescript
{
  "whatsapp": {
    "phoneNumberId": "whatsapp_phone_number_id",
    "accessToken": "whatsapp_access_token",
    "businessAccountId": "business_account_id",
    "verifyToken": "webhook_verify_token",
    "webhookUrl": "https://strato.com/api/webhooks/whatsapp",
    "isActive": true
  }
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/whatsapp/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Verificar que viene de WhatsApp
  if (body.object === 'whatsapp_business_account') {
    // Procesar mensaje
    await processWhatsAppMessage(body);
  }

  return NextResponse.json({ status: 'ok' });
}

export async function GET(request: Request) {
  // Verificación de webhook (Meta requiere esto)
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}
```

## ⚙️ Configuración por Tenant

### Modelo de Datos

```prisma
model TenantIntegration {
  id          String   @id @default(cuid())
  tenantId    String
  provider    String   // "MANYCHAT", "UCHAT", "ELEVENLABS", "WHATSAPP"
  config      String   @db.Json
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, provider])
  @@index([tenantId])
  @@index([provider])
}
```

### Gestión de Configuración

```typescript
// src/services/integrations/config-service.ts
export class IntegrationConfigService {
  async getConfig(tenantId: string, provider: string) {
    const integration = await db.tenantIntegration.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider,
        },
      },
    });

    if (!integration || !integration.isActive) {
      throw new Error(`Integration ${provider} no configurada o inactiva`);
    }

    return integration.config as any;
  }

  async updateConfig(
    tenantId: string,
    provider: string,
    config: any
  ) {
    return db.tenantIntegration.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider,
        },
      },
      create: {
        tenantId,
        provider,
        config,
        isActive: true,
      },
      update: {
        config,
        updatedAt: new Date(),
      },
    });
  }
}
```

## 🔔 Webhooks

### Estructura General

Todos los webhooks siguen este patrón:

```
External Service
    │
    ▼
POST /api/webhooks/{provider}
    │
    ├──► Verify Request (autenticación)
    ├──► Identify Tenant
    ├──► Process Payload
    ├──► Create/Update Data
    └──► Respond (si es necesario)
```

### Seguridad de Webhooks

1. **Verificación de Firma**: Validar que el request viene del servicio real
2. **Rate Limiting**: Prevenir abuso
3. **Idempotencia**: Manejar duplicados
4. **Logging**: Registrar todos los webhooks

### Implementación Base

```typescript
// src/lib/webhooks/base-handler.ts
export abstract class WebhookHandler {
  abstract verifyRequest(request: Request): Promise<boolean>;
  abstract identifyTenant(payload: any): Promise<string>;
  abstract processPayload(payload: any, tenantId: string): Promise<void>;

  async handle(request: Request) {
    // 1. Verificar
    const isValid = await this.verifyRequest(request);
    if (!isValid) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Parse payload
    const payload = await request.json();

    // 3. Identificar tenant
    const tenantId = await this.identifyTenant(payload);

    // 4. Procesar
    await this.processPayload(payload, tenantId);

    return NextResponse.json({ status: 'ok' });
  }
}
```

## 📝 Casos de Uso Completos

### Caso 1: Lead desde Meta Ads → ManyChat → Lead en STRATO

1. Usuario hace click en anuncio de Meta Ads
2. Llega a landing page y completa formulario
3. Formulario envía a ManyChat (webhook)
4. ManyChat inicia conversación automática
5. ManyChat envía webhook a STRATO con datos del lead
6. STRATO crea lead y conversación
7. STRATO puede responder a través de ManyChat API

### Caso 2: Campaña de Fidelización con Voz

1. Cron job ejecuta campaña de fidelización
2. Obtiene leads de "Base de Relaciones" (clientes existentes)
3. Para cada lead:
   - Genera mensaje personalizado
   - Genera audio con ElevenLabs
   - Envía a través de WhatsApp (ManyChat/UChat)
4. Registra evento de campaña

### Caso 3: Agendamiento de Visita con Confirmación de Voz

1. Agente agenda visita desde STRATO
2. Sistema crea evento de tipo "VISITA_AGENDADA"
3. Trigger automático:
   - Genera mensaje de confirmación personalizado
   - Genera audio con ElevenLabs
   - Envía a través de WhatsApp
4. 24 horas antes: Envía recordatorio de voz
5. Post-visita: Envía encuesta de satisfacción

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025
