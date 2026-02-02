/**
 * ESLint rule: no-external-service-imports
 * 
 * Detecta imports de SDKs de servicios externos en código frontend.
 * El frontend debe usar el cliente API interno, no SDKs externos directamente.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohíbe imports de SDKs de servicios externos en frontend',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      externalServiceImport:
        'No se permite importar SDKs de servicios externos en frontend. Usa el cliente API interno (import { api } from "@/lib/api") en su lugar.',
    },
  },

  create(context) {
    // SDKs externos prohibidos
    const forbiddenImports = [
      '@manychat/sdk',
      '@uchat/sdk',
      '@elevenlabs/sdk',
      'manychat',
      'uchat',
      'elevenlabs',
      'whatsapp-business-api',
    ]

    // Rutas permitidas (backend puede usar servicios externos)
    const allowedPaths = [
      'src/app/api',
      'src/services',
      'src/lib/api-helpers.ts',
    ]

    /**
     * Verifica si el archivo está en una ruta permitida
     */
    function isInAllowedPath(filename) {
      return allowedPaths.some((path) => filename.includes(path))
    }

    return {
      ImportDeclaration(node) {
        const filename = context.getFilename()

        // Permitir imports en backend
        if (isInAllowedPath(filename)) {
          return
        }

        // Verificar si el import es de un SDK prohibido
        const source = node.source.value

        if (
          forbiddenImports.some((forbidden) =>
            source.toLowerCase().includes(forbidden.toLowerCase())
          )
        ) {
          context.report({
            node,
            messageId: 'externalServiceImport',
          })
        }
      },
    }
  },
}
