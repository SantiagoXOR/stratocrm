# Documentación - CRM Inmobiliario STRATO

Bienvenido a la documentación completa del CRM Inmobiliario STRATO. Esta documentación cubre todos los aspectos del proyecto, desde la arquitectura hasta la implementación.

## 📚 Índice de Documentación

### Documentación Principal

1. **[README Principal](../README.md)**
   - Descripción general del proyecto
   - Instalación y configuración
   - Estructura del proyecto
   - Guía de inicio rápido

2. **[Primera Etapa](PRIMERA_ETAPA.md)**
   - Objetivos y alcance de la primera etapa
   - Arquitectura y estructura de componentes
   - Implementación detallada
   - Consideraciones de diseño y seguridad

3. **[Requerimientos](REQUERIMIENTOS.md)**
   - Requerimientos funcionales
   - Requerimientos no funcionales
   - Requerimientos técnicos
   - Casos de uso
   - Modelo de datos
   - Especificaciones de interfaz

4. **[Diagramas](DIAGRAMAS.md)**
   - Diagrama de base de datos (ERD)
   - Diagrama de arquitectura
   - Diagrama de flujo de datos
   - Diagrama de componentes
   - Diagrama de flujo de usuario
   - Diagrama de seguridad

5. **[API Reference](API.md)**
   - Documentación completa de endpoints
   - Autenticación
   - Leads API
   - Códigos de estado HTTP
   - Manejo de errores
   - Tipos TypeScript
   - Ejemplos de uso

6. **[Tecnologías y Stack](TECNOLOGIAS.md)**
   - Documentación detallada de todas las tecnologías
   - Next.js App Router y Server Components
   - Prisma ORM y migraciones
   - NextAuth.js y autenticación
   - React Hook Form y Zod
   - shadcn/ui y Recharts
   - Mejores prácticas y referencias oficiales

7. **[Esquema de Base de Datos](SCHEMA.md)**
   - Modelos de datos detallados
   - Relaciones entre entidades
   - Índices y optimizaciones
   - Validaciones
   - Migraciones
   - Decisiones de diseño

8. **[Integración WhatsApp](WHATSAPP.md)**
   - Guía completa de integración con WhatsApp Business API
   - Configuración y autenticación
   - Envío y recepción de mensajes
   - Plantillas y webhooks
   - Manejo de errores

## 🎯 Guías por Tema

### Para Desarrolladores

**Empezar a Desarrollar:**
1. Lee el [README Principal](../README.md) para configuración
2. Revisa [Primera Etapa](PRIMERA_ETAPA.md) para entender la arquitectura
3. Consulta [API Reference](API.md) para endpoints disponibles

**Entender la Arquitectura:**
- [Diagramas](DIAGRAMAS.md) - Visualización de la arquitectura
- [Primera Etapa](PRIMERA_ETAPA.md) - Estructura de componentes

**Implementar Funcionalidades:**
- [Requerimientos](REQUERIMIENTOS.md) - Especificaciones funcionales
- [API Reference](API.md) - Contratos de API
- [Primera Etapa](PRIMERA_ETAPA.md) - Patrones de implementación

### Para Product Owners / Analistas

**Entender el Sistema:**
- [Requerimientos](REQUERIMIENTOS.md) - Funcionalidades y casos de uso
- [Diagramas](DIAGRAMAS.md) - Flujos de usuario y arquitectura

**Planificar Nuevas Features:**
- [Requerimientos](REQUERIMIENTOS.md) - Modelo de datos y especificaciones
- [Primera Etapa](PRIMERA_ETAPA.md) - Patrones establecidos

### Para QA / Testing

**Entender Funcionalidades:**
- [Requerimientos](REQUERIMIENTOS.md) - Casos de uso y especificaciones
- [API Reference](API.md) - Endpoints y respuestas esperadas

**Planificar Tests:**
- [Requerimientos](REQUERIMIENTOS.md) - Casos de uso detallados
- [API Reference](API.md) - Códigos de error y validaciones

## 📖 Estructura de Documentación

```
docs/
├── README.md              # Este archivo - Índice de documentación
├── TECNOLOGIAS.md         # Documentación detallada de tecnologías
├── PRIMERA_ETAPA.md       # Detalles de implementación primera etapa
├── REQUERIMIENTOS.md      # Especificaciones funcionales y técnicas
├── DIAGRAMAS.md           # Diagramas de arquitectura y flujos
├── API.md                 # Documentación de API REST
├── SCHEMA.md              # Esquema de base de datos detallado
└── WHATSAPP.md            # Guía de integración WhatsApp Business API
```

## 🔍 Búsqueda Rápida

### Por Funcionalidad

- **Autenticación**: [Requerimientos - RF-01](REQUERIMIENTOS.md#rf-01-autenticación-y-autorización), [API - Autenticación](API.md#autenticación)
- **Gestión de Leads**: [Requerimientos - RF-02](REQUERIMIENTOS.md#rf-02-gestión-de-leads), [API - Leads](API.md#leads-api)
- **Dashboard**: [Requerimientos - RF-03](REQUERIMIENTOS.md#rf-03-dashboard), [Primera Etapa - Dashboard](PRIMERA_ETAPA.md#5-dashboard)
- **Interfaz de Usuario**: [Requerimientos - RF-04](REQUERIMIENTOS.md#rf-04-interfaz-de-usuario), [Primera Etapa - Layout](PRIMERA_ETAPA.md#2-crear-layout-del-dashboard-completo)

### Por Componente Técnico

- **Base de Datos**: [Esquema de Base de Datos](SCHEMA.md), [Diagramas - ERD](DIAGRAMAS.md#diagrama-de-base-de-datos), [Requerimientos - Modelo de Datos](REQUERIMIENTOS.md#modelo-de-datos)
- **API Routes**: [API Reference](API.md), [Primera Etapa - API Routes](PRIMERA_ETAPA.md#3-configurar-api-routes-para-leads)
- **Componentes React**: [Primera Etapa - Componentes](PRIMERA_ETAPA.md#5-implementar-gestión-de-leads), [Diagramas - Componentes](DIAGRAMAS.md#diagrama-de-componentes)
- **Autenticación**: [Diagramas - Seguridad](DIAGRAMAS.md#diagrama-de-seguridad), [API - Autenticación](API.md#autenticación)

## 📊 Diagramas Disponibles

Todos los diagramas están en [DIAGRAMAS.md](DIAGRAMAS.md):

1. **Diagrama de Base de Datos**
   - Modelo Entidad-Relación (ERD)
   - Esquema relacional detallado

2. **Diagrama de Arquitectura**
   - Arquitectura general del sistema
   - Arquitectura de capas

3. **Diagrama de Flujo de Datos**
   - Flujo: Crear Lead
   - Flujo: Listar Leads
   - Flujo: Autenticación

4. **Diagrama de Componentes**
   - Estructura de componentes React
   - Relaciones entre componentes

5. **Diagrama de Flujo de Usuario**
   - Flujo principal: Gestión de Leads
   - Flujo: Autenticación y Navegación

6. **Diagrama de Responsive Design**
   - Breakpoints y layouts

7. **Diagrama de Seguridad**
   - Flujo de autenticación y autorización

## 🚀 Guías de Inicio Rápido

### Para Nuevos Desarrolladores

1. **Configuración Inicial**
   ```bash
   # Ver README principal
   cat ../README.md
   ```

2. **Entender la Arquitectura**
   - Lee [Primera Etapa](PRIMERA_ETAPA.md)
   - Revisa [Diagramas](DIAGRAMAS.md)

3. **Explorar el Código**
   - Revisa la estructura en [README Principal](../README.md#estructura-del-proyecto)
   - Consulta [Primera Etapa - Implementación](PRIMERA_ETAPA.md#implementación-detallada)

4. **Probar la API**
   - Consulta [API Reference](API.md)
   - Usa los ejemplos proporcionados

### Para Contribuir

1. **Entender Requerimientos**
   - Lee [Requerimientos](REQUERIMIENTOS.md)
   - Revisa casos de uso relevantes

2. **Seguir Patrones Establecidos**
   - Consulta [Primera Etapa](PRIMERA_ETAPA.md) para patrones
   - Revisa estructura de componentes

3. **Documentar Cambios**
   - Actualiza documentación relevante
   - Agrega diagramas si es necesario

## 📝 Convenciones de Documentación

### Formato

- **Markdown** para toda la documentación
- **Mermaid** para diagramas
- **TypeScript** para ejemplos de código
- **JSON** para ejemplos de API

### Estructura de Secciones

- Cada documento tiene un índice al inicio
- Secciones numeradas para referencia
- Ejemplos de código con sintaxis destacada
- Notas y advertencias cuando sea necesario

### Versionado

- Cada documento incluye versión y fecha
- Cambios importantes documentados
- Historial de versiones cuando sea relevante

## 🔄 Actualización de Documentación

La documentación debe actualizarse cuando:

- Se agregan nuevas funcionalidades
- Se modifican endpoints de API
- Se cambia la arquitectura
- Se actualizan requerimientos
- Se agregan nuevos diagramas

## 📞 Soporte

Para preguntas sobre la documentación:

1. Revisa primero esta documentación
2. Consulta el código fuente
3. Contacta al equipo de desarrollo

## 📚 Recursos Adicionales

### Documentación Externa

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Zod Docs](https://zod.dev)

### Documentación del Proyecto

- [Setup Guide](../SETUP.md)
- [Boilerplate Guide](../BOILERPLATE-GUIDE.md)
- [Estructura](../ESTRUCTURA.md)

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Mantenido por**: Equipo STRATO

