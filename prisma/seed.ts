import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios demo
  console.log('👥 Creando usuarios demo...')
  
  const users = [
    {
      nombre: 'Admin',
      email: 'admin@phorencial.com',
      password: 'admin123',
      rol: 'ADMIN',
    },
    {
      nombre: 'Analista Demo',
      email: 'analista@phorencial.com',
      password: 'analista123',
      rol: 'ANALISTA',
    },
    {
      nombre: 'Vendedor Demo',
      email: 'vendedor@phorencial.com',
      password: 'vendedor123',
      rol: 'VENDEDOR',
    },
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        nombre: userData.nombre,
        email: userData.email,
        hash: hashedPassword,
        rol: userData.rol,
      },
    })
    
    console.log(`✅ Usuario creado: ${userData.email} (${userData.rol})`)
  }

  // Crear reglas de scoring por defecto
  console.log('📊 Creando reglas de scoring...')
  
  const rules = [
    {
      key: 'edadMin',
      value: JSON.stringify({ min: 18 }),
    },
    {
      key: 'edadMax',
      value: JSON.stringify({ max: 75 }),
    },
    {
      key: 'minIngreso',
      value: JSON.stringify({ min: 200000 }),
    },
  ]

  for (const rule of rules) {
    await prisma.rule.upsert({
      where: { key: rule.key },
      update: {},
      create: rule,
    })
  }

  console.log('✅ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

