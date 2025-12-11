# Integración WhatsApp Business API - CRM Inmobiliario STRATO

## 📋 Índice

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración Inicial](#configuración-inicial)
4. [Autenticación](#autenticación)
5. [Envío de Mensajes](#envío-de-mensajes)
6. [Recepción de Mensajes](#recepción-de-mensajes)
7. [Plantillas de Mensajes](#plantillas-de-mensajes)
8. [Webhooks](#webhooks)
9. [Estados de Mensajes](#estados-de-mensajes)
10. [Manejo de Errores](#manejo-de-errores)
11. [Referencias Oficiales](#referencias-oficiales)

## 🎯 Introducción

El CRM STRATO integra la **WhatsApp Business API** de Meta para permitir comunicación bidireccional con leads. Esta integración permite:

- Enviar mensajes automatizados a leads
- Recibir y procesar mensajes de leads
- Gestionar plantillas de mensajes aprobadas
- Registrar historial completo de conversaciones
- Sincronizar datos entre WhatsApp y el CRM

### Arquitectura

```
CRM STRATO
    ↓
WhatsApp Business API (Meta)
    ↓
WhatsApp Cloud API
    ↓
Número de WhatsApp Business
    ↓
Leads/Clientes
```

## 📋 Requisitos Previos

### 1. Cuenta de Meta Business

- Crear cuenta en [Meta Business Manager](https://business.facebook.com/)
- Verificar la cuenta empresarial
- Completar el proceso de verificación

### 2. Aplicación en Meta for Developers

- Crear aplicación en [Meta for Developers](https://developers.facebook.com/)
- Agregar producto "WhatsApp"
- Configurar permisos necesarios

### 3. Número de Teléfono

- Número de teléfono verificado
- Número debe poder recibir SMS para verificación
- Número no debe estar asociado a otra cuenta de WhatsApp Business

### 4. Opcional: BSP (Business Solution Provider)

Para facilitar la integración, se puede usar un BSP oficial como:
- **360Dialog** - [Documentación](https://docs.360dialog.com/docs)
- **WazzAPI** - [Documentación](https://wazzapi.com/)
- **Twilio** - [Documentación](https://www.twilio.com/docs/whatsapp)

## ⚙️ Configuración Inicial

### 1. Crear Aplicación en Meta

1. Ir a [Meta for Developers](https://developers.facebook.com/)
2. Crear nueva aplicación
3. Seleccionar tipo: "Business"
4. Agregar producto "WhatsApp"

### 2. Obtener Credenciales

Después de configurar la aplicación, necesitarás:

- **Phone Number ID**: ID del número de teléfono
- **Access Token**: Token de acceso permanente
- **Business Account ID**: ID de la cuenta empresarial
- **Verify Token**: Token para verificar webhooks (generar aleatoriamente)

### 3. Configurar Variables de Entorno

Agregar al archivo `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="tu-phone-number-id"
WHATSAPP_ACCESS_TOKEN="tu-access-token"
WHATSAPP_VERIFY_TOKEN="tu-verify-token-aleatorio"
WHATSAPP_BUSINESS_ACCOUNT_ID="tu-business-account-id"
WHATSAPP_WEBHOOK_URL="https://tu-dominio.com/api/webhooks/whatsapp"
```

### 4. Configurar Webhook

1. En Meta for Developers, ir a configuración de WhatsApp
2. Configurar URL del webhook: `https://tu-dominio.com/api/webhooks/whatsapp`
3. Configurar Verify Token (debe coincidir con `WHATSAPP_VERIFY_TOKEN`)
4. Suscribirse a eventos:
   - `messages` - Mensajes entrantes
   - `message_status` - Estados de mensajes enviados

## 🔐 Autenticación

### Autenticación con Access Token

Todas las solicitudes a la API de WhatsApp requieren autenticación mediante Bearer Token:

```typescript
const headers = {
  'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
}
```

### Renovación de Tokens

- Los tokens de acceso pueden expirar
- Implementar renovación automática si es necesario
- Usar tokens de larga duración cuando sea posible

## 📤 Envío de Mensajes

### Enviar Mensaje de Texto

```typescript
// POST https://graph.facebook.com/v18.0/{phone-number-id}/messages

const response = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '5491123456789', // Número en formato internacional sin +
      type: 'text',
      text: {
        body: 'Hola, gracias por contactarnos. ¿En qué podemos ayudarte?'
      }
    })
  }
);
```

### Enviar Mensaje con Plantilla

Para mensajes proactivos (fuera de ventana de 24 horas), usar plantillas aprobadas:

```typescript
const response = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '5491123456789',
      type: 'template',
      template: {
        name: 'bienvenida_inmobiliaria',
        language: {
          code: 'es'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: 'Juan Pérez'
              }
            ]
          }
        ]
      }
    })
  }
);
```

### Enviar Mensaje con Media

```typescript
// Primero subir el media
const mediaResponse = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    },
    body: formData // FormData con el archivo
  }
);

const mediaId = await mediaResponse.json();

// Luego enviar el mensaje
const messageResponse = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '5491123456789',
      type: 'image',
      image: {
        id: mediaId.id
      }
    })
  }
);
```

## 📥 Recepción de Mensajes

### Endpoint de Webhook

Crear endpoint en `src/app/api/webhooks/whatsapp/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Verificación del webhook
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // WhatsApp envía eventos en body.entry[]
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        const webhookEvent = entry.changes[0].value;
        
        // Procesar mensajes
        if (webhookEvent.messages) {
          for (const message of webhookEvent.messages) {
            await processIncomingMessage(message, webhookEvent);
          }
        }
        
        // Procesar estados de mensajes
        if (webhookEvent.statuses) {
          for (const status of webhookEvent.statuses) {
            await processMessageStatus(status);
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function processIncomingMessage(message: any, webhookEvent: any) {
  const phoneNumber = message.from;
  const messageId = message.id;
  const timestamp = parseInt(message.timestamp);
  const messageType = message.type;
  
  // Buscar o crear lead por teléfono
  let lead = await db.lead.findFirst({
    where: { telefono: phoneNumber }
  });
  
  if (!lead) {
    // Crear nuevo lead desde WhatsApp
    lead = await db.lead.create({
      data: {
        nombre: webhookEvent.contacts[0]?.profile?.name || 'Sin nombre',
        telefono: phoneNumber,
        origen: 'whatsapp',
        estado: 'NUEVO',
        whatsappId: phoneNumber
      }
    });
  }
  
  // Buscar o crear conversación
  let conversation = await db.conversation.findFirst({
    where: {
      platform: 'whatsapp',
      platformId: phoneNumber
    }
  });
  
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: lead.id,
        platform: 'whatsapp',
        platformId: phoneNumber,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        status: 'open'
      }
    });
  }
  
  // Guardar mensaje
  let content = '';
  let mediaUrl = null;
  
  if (messageType === 'text') {
    content = message.text.body;
  } else if (messageType === 'image' || messageType === 'video' || messageType === 'document') {
    content = message[messageType].caption || '';
    mediaUrl = message[messageType].id;
  }
  
  await db.message.create({
    data: {
      conversationId: conversation.id,
      direction: 'inbound',
      content: content,
      mediaUrl: mediaUrl,
      messageType: messageType,
      platformMsgId: messageId,
      sentAt: new Date(timestamp * 1000)
    }
  });
  
  // Actualizar última actividad de conversación
  await db.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() }
  });
  
  // Crear evento
  await db.event.create({
    data: {
      leadId: lead.id,
      tipo: 'MESSAGE_RECEIVED',
      payload: JSON.stringify({ messageType, messageId })
    }
  });
}

async function processMessageStatus(status: any) {
  const messageId = status.id;
  const statusType = status.status; // sent, delivered, read, failed
  
  // Actualizar mensaje en base de datos
  const message = await db.message.findUnique({
    where: { platformMsgId: messageId }
  });
  
  if (message) {
    const updateData: any = {};
    
    if (statusType === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (statusType === 'read') {
      updateData.readAt = new Date();
    }
    
    await db.message.update({
      where: { id: message.id },
      data: updateData
    });
  }
}
```

## 📝 Plantillas de Mensajes

### Crear Plantilla

Las plantillas deben ser aprobadas por Meta antes de usarse. Proceso:

1. Crear plantilla en Meta Business Manager
2. Enviar para aprobación
3. Esperar aprobación (puede tardar horas/días)
4. Usar plantilla en código

### Estructura de Plantilla

```json
{
  "name": "bienvenida_inmobiliaria",
  "category": "MARKETING",
  "language": "es",
  "components": [
    {
      "type": "BODY",
      "text": "Hola {{1}}, gracias por contactarnos. Estamos aquí para ayudarte con tu búsqueda inmobiliaria."
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "Ver propiedades"
        }
      ]
    }
  ]
}
```

### Categorías de Plantillas

- **MARKETING**: Mensajes promocionales
- **UTILITY**: Confirmaciones, recordatorios
- **AUTHENTICATION**: Códigos de verificación

### Gestionar Plantillas en el CRM

```typescript
// Guardar plantilla en base de datos
await db.whatsAppTemplate.create({
  data: {
    name: 'bienvenida_inmobiliaria',
    category: 'MARKETING',
    language: 'es',
    content: JSON.stringify(templateComponents),
    status: 'pending',
    metaId: templateIdFromMeta
  }
});
```

## 🔔 Webhooks

### Eventos Soportados

1. **messages** - Mensajes entrantes
2. **message_status** - Estados de mensajes (sent, delivered, read, failed)

### Verificación de Webhook

Meta verifica el webhook enviando un GET request:

```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=CHALLENGE
```

Debe responder con el `challenge` si el token es correcto.

### Seguridad

- Validar siempre el `verify_token`
- Usar HTTPS en producción
- Validar firma de webhook (opcional pero recomendado)

## 📊 Estados de Mensajes

### Estados Posibles

- **sent** - Mensaje enviado al servidor de WhatsApp
- **delivered** - Mensaje entregado al dispositivo
- **read** - Mensaje leído por el usuario
- **failed** - Mensaje fallido

### Procesar Estados

```typescript
async function updateMessageStatus(status: any) {
  const { id, status: statusType, timestamp } = status;
  
  const message = await db.message.findUnique({
    where: { platformMsgId: id }
  });
  
  if (!message) return;
  
  const updates: any = {};
  
  switch (statusType) {
    case 'delivered':
      updates.deliveredAt = new Date(parseInt(timestamp) * 1000);
      break;
    case 'read':
      updates.readAt = new Date(parseInt(timestamp) * 1000);
      break;
    case 'failed':
      // Registrar error
      await db.event.create({
        data: {
          leadId: message.conversation.leadId,
          tipo: 'MESSAGE_FAILED',
          payload: JSON.stringify({ messageId: id, error: status.errors })
        }
      });
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    await db.message.update({
      where: { id: message.id },
      data: updates
    });
  }
}
```

## ⚠️ Manejo de Errores

### Errores Comunes

1. **401 Unauthorized**
   - Token de acceso inválido o expirado
   - Verificar `WHATSAPP_ACCESS_TOKEN`

2. **403 Forbidden**
   - Permisos insuficientes
   - Verificar configuración en Meta Business Manager

3. **429 Too Many Requests**
   - Límite de rate limit excedido
   - Implementar retry con backoff exponencial

4. **400 Bad Request**
   - Datos inválidos en la solicitud
   - Verificar formato del número de teléfono
   - Verificar estructura del mensaje

### Implementar Retry Logic

```typescript
async function sendMessageWithRetry(data: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(/* ... */);
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 429) {
        // Rate limit, esperar antes de reintentar
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

## 📚 Referencias Oficiales

### Documentación Meta

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Cloud API Guide](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [WhatsApp Commerce Policy](https://www.whatsapp.com/legal/commerce-policy/)

### Recursos Adicionales

- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business Platform](https://www.whatsapp.com/business/platform)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/webhooks)

### BSPs Recomendados

- [360Dialog](https://www.360dialog.com/) - Documentación: [docs.360dialog.com](https://docs.360dialog.com/docs)
- [WazzAPI](https://wazzapi.com/) - Plataforma de mensajería empresarial
- [Twilio](https://www.twilio.com/docs/whatsapp) - Solución empresarial completa

## 🔒 Consideraciones de Seguridad

### Almacenamiento de Tokens

- Nunca commitear tokens en el código
- Usar variables de entorno
- Rotar tokens periódicamente
- Usar secretos en producción (Vercel, AWS Secrets Manager, etc.)

### Privacidad de Datos

- Cumplir con políticas de privacidad de WhatsApp
- Obtener consentimiento antes de enviar mensajes
- Respetar ventana de 24 horas para mensajes gratuitos
- Usar plantillas aprobadas para mensajes proactivos

### Rate Limits

- WhatsApp tiene límites de rate:
  - 1000 mensajes por segundo (varía según plan)
  - Implementar throttling y queue system
  - Monitorear uso y escalar según necesidad

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Basado en**: WhatsApp Business API v18.0

