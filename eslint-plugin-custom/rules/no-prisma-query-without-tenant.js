/**
 * ESLint rule: no-prisma-query-without-tenant
 * 
 * Detecta queries de Prisma que no incluyen filtro por tenantId
 * cuando el modelo tiene campo tenantId.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detecta queries de Prisma sin filtro de tenantId',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingTenantId: 'Query de Prisma debe incluir filtro por tenantId en where clause. Modelos con tenantId requieren aislamiento de datos.',
    },
  },

  create(context) {
    // Modelos que requieren tenantId (cuando se implementen)
    const modelsRequiringTenant = ['lead', 'conversation', 'message']

    /**
     * Verifica si un objeto tiene propiedad tenantId en where
     */
    function hasTenantIdInWhere(node) {
      if (!node || node.type !== 'ObjectExpression') {
        return false
      }

      const whereProperty = node.properties.find(
        (prop) =>
          prop.key &&
          (prop.key.name === 'where' || prop.key.value === 'where')
      )

      if (!whereProperty || whereProperty.value.type !== 'ObjectExpression') {
        return false
      }

      // Verificar si hay tenantId en el where
      return whereProperty.value.properties.some(
        (prop) =>
          prop.key &&
          (prop.key.name === 'tenantId' || prop.key.value === 'tenantId')
      )
    }

    /**
     * Verifica si es una query de Prisma a un modelo que requiere tenantId
     */
    function isPrismaQueryRequiringTenant(node) {
      // Buscar patrones como: db.lead.findMany, db.conversation.findFirst, etc.
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'MemberExpression'
      ) {
        const objectName = node.callee.object?.property?.name || node.callee.object?.name
        const methodName = node.callee.property?.name

        // Verificar si es db.lead, db.conversation, etc.
        if (objectName === 'db' || objectName === 'tx') {
          const modelName = node.callee.object?.property
            ? node.callee.object.property.name
            : node.callee.object.name === 'db'
            ? node.callee.property?.name
            : null

          if (
            modelName &&
            modelsRequiringTenant.includes(modelName.toLowerCase())
          ) {
            // Verificar métodos que requieren where
            const methodsRequiringWhere = [
              'findMany',
              'findFirst',
              'findUnique',
              'update',
              'updateMany',
              'delete',
              'deleteMany',
              'count',
              'groupBy',
            ]

            return methodsRequiringWhere.includes(methodName)
          }
        }
      }

      return false
    }

    return {
      CallExpression(node) {
        if (isPrismaQueryRequiringTenant(node)) {
          // Buscar argumento con where
          const whereArgument = node.arguments.find(
            (arg) => arg.type === 'ObjectExpression'
          )

          if (!whereArgument || !hasTenantIdInWhere(whereArgument)) {
            context.report({
              node,
              messageId: 'missingTenantId',
            })
          }
        }
      },
    }
  },
}
