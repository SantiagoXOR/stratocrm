/**
 * ESLint Plugin Personalizado
 * 
 * Reglas personalizadas para el proyecto CRM Inmobiliario
 */

module.exports = {
  rules: {
    'no-prisma-query-without-tenant': require('./rules/no-prisma-query-without-tenant'),
    'no-external-service-imports': require('./rules/no-external-service-imports'),
  },
  configs: {
    recommended: {
      rules: {
        'custom/no-prisma-query-without-tenant': 'error',
        'custom/no-external-service-imports': 'error',
      },
    },
  },
}
