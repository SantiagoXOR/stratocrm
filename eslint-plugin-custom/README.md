# ESLint Plugin Personalizado

Plugin de ESLint con reglas personalizadas para el proyecto CRM Inmobiliario.

## Reglas Disponibles

### 1. `no-prisma-query-without-tenant`

Detecta queries de Prisma que no incluyen filtro por `tenantId` cuando el modelo requiere aislamiento de tenant.

**Ejemplo de error:**
```typescript
// ❌ Error: Query sin tenantId
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' }
})

// ✅ Correcto
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id,
    estado: 'NUEVO',
  }
})
```

### 2. `no-external-service-imports`

Prohíbe imports de SDKs de servicios externos en código frontend.

**Ejemplo de error:**
```typescript
// ❌ Error en frontend
import { ManyChatClient } from '@manychat/sdk'

// ✅ Correcto
import { api } from '@/lib/api'
```

## Instalación y Uso

### Opción 1: Usar Reglas Integradas (Recomendado)

Las reglas básicas ya están configuradas en `.eslintrc.json` usando `no-restricted-imports`.

### Opción 2: Usar Plugin Personalizado (Avanzado)

Para usar el plugin personalizado completo:

1. **Instalar como plugin local:**

```bash
# El plugin está en eslint-plugin-custom/
# ESLint lo detectará automáticamente si está en la raíz del proyecto
```

2. **Configurar en `.eslintrc.json`:**

```json
{
  "plugins": ["custom"],
  "rules": {
    "custom/no-prisma-query-without-tenant": "error",
    "custom/no-external-service-imports": "error"
  }
}
```

3. **O publicar como paquete npm (opcional):**

```bash
# Si quieres publicarlo como paquete npm
npm publish eslint-plugin-custom
```

## Limitaciones

Las reglas personalizadas tienen algunas limitaciones:

1. **Detección de queries Prisma**: Requiere análisis estático que puede no detectar todos los casos
2. **Detección de imports**: Funciona mejor con imports directos, puede no detectar imports dinámicos

## Mejoras Futuras

- [ ] Mejorar detección de queries Prisma con análisis más profundo
- [ ] Agregar regla para detectar uso de `any` sin justificación
- [ ] Agregar regla para detectar falta de validación en API routes
- [ ] Integrar con TypeScript para mejor detección de tipos

## Referencias

- [ESLint Custom Rules](https://eslint.org/docs/latest/developer-guide/working-with-rules)
- [Rule: Multitenancy](.cursor/rules/multitenancy.mdc)
- [Rule: Frontend API Abstraction](.cursor/rules/frontend-api-abstraction.mdc)
