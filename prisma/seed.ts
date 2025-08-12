import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Usuarios de ejemplo
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@gym.com',
      password: 'admin123', // Cambia por hash si usas auth real
      isAdmin: true,
      gender: 'male',
      birthDate: new Date('1990-01-01'),
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      name: 'Normal User',
      email: 'user@gym.com',
      password: 'user123',
      isAdmin: false,
      gender: 'female',
      birthDate: new Date('1995-05-15'),
    },
  });

  // ¿Quieres agregar más usuarios de prueba? ¿Algún dato especial para ellos?

    // Tipos de máquina de ejemplo
    const machineTypeCardio = await prisma.machineType.create({
      data: {
        name: 'Cardio',
        description: 'Máquinas para ejercicios cardiovasculares',
      },
    });

    const machineTypeFuerza = await prisma.machineType.create({
      data: {
        name: 'Fuerza',
        description: 'Máquinas para ejercicios de fuerza',
      },
    });

    const machineTypeFuncional = await prisma.machineType.create({
      data: {
        name: 'Funcional',
        description: 'Máquinas para ejercicios funcionales y de estabilidad',
      },
    });

    const machineTypeFlexibilidad = await prisma.machineType.create({
      data: {
        name: 'Flexibilidad',
        description: 'Máquinas para ejercicios de estiramiento y movilidad',
      },
    });

    const machineTypePotencia = await prisma.machineType.create({
      data: {
        name: 'Potencia',
        description: 'Máquinas para ejercicios explosivos y de potencia',
      },
    });

    const machineTypeCore = await prisma.machineType.create({
      data: {
        name: 'Core',
        description: 'Máquinas para ejercicios de core y estabilidad',
      },
    });

    const machineTypeHiit = await prisma.machineType.create({
      data: {
        name: 'HIIT',
        description: 'Máquinas para entrenamiento de intervalos de alta intensidad',
      },
    });

    const machineTypeRehabilitacion = await prisma.machineType.create({
      data: {
        name: 'Rehabilitación',
        description: 'Máquinas para ejercicios de rehabilitación y recuperación',
      },
    });

    // Músculos de ejemplo
    const musclePectoral = await prisma.muscle.create({
      data: {
        name: 'Pecho',
      },
    });

    const muscleBiceps = await prisma.muscle.create({
      data: {
        name: 'Bíceps',
      },
    });

    const muscleTriceps = await prisma.muscle.create({
      data: {
        name: 'Tríceps',
      },
    });

    const muscleCuadriceps = await prisma.muscle.create({
      data: {
        name: 'Cuádriceps',
      },
    });

    const muscleEspalda = await prisma.muscle.create({
      data: {
        name: 'Espalda',
      },
    });

    const muscleHombro = await prisma.muscle.create({
      data: {
        name: 'Hombro',
      },
    });

    const musclePantorrilla = await prisma.muscle.create({
      data: {
        name: 'Pantorrilla',
      },
    });

    const muscleIsquiotibiales = await prisma.muscle.create({
      data: {
        name: 'Isquiotibiales',
      },
    });

    const muscleAbdomen = await prisma.muscle.create({
      data: {
        name: 'Abdomen',
      },
    });

    const muscleGluteos = await prisma.muscle.create({
      data: {
        name: 'Glúteos',
      },
    });
    // Máquinas de ejemplo
    // Cardio
    await prisma.machine.create({
      data: {
        name: 'Remo en T',
        description: 'Ejercicio cardiovascular y de fuerza para espalda y brazos.',
        typeId: machineTypeCardio.id,
        muscles: { connect: [{ id: muscleEspalda.id }, { id: muscleBiceps.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Bicicleta de spinning',
        description: 'Ejercicio cardiovascular intenso para piernas y glúteos.',
        typeId: machineTypeCardio.id,
        muscles: { connect: [{ id: muscleCuadriceps.id }, { id: muscleGluteos.id }] },
      },
    });

    // Fuerza
    await prisma.machine.create({
      data: {
        name: 'Press de banca',
        description: 'Ejercicio de fuerza para pecho y tríceps.',
        typeId: machineTypeFuerza.id,
        muscles: { connect: [{ id: musclePectoral.id }, { id: muscleTriceps.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Extensión de tríceps',
        description: 'Ejercicio de fuerza para el desarrollo de los tríceps.',
        typeId: machineTypeFuerza.id,
        muscles: { connect: [{ id: muscleTriceps.id }] },
      },
    });

    // Funcional
    await prisma.machine.create({
      data: {
        name: 'TRX',
        description: 'Entrenamiento funcional con suspensión para todo el cuerpo.',
        typeId: machineTypeFuncional.id,
        muscles: { connect: [{ id: muscleEspalda.id }, { id: muscleAbdomen.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Bosuball',
        description: 'Ejercicios de estabilidad y abdomen.',
        typeId: machineTypeFuncional.id,
        muscles: { connect: [{ id: muscleAbdomen.id }] },
      },
    });

    // Flexibilidad
    await prisma.machine.create({
      data: {
        name: 'Estiramiento de cuádriceps',
        description: 'Mejora la flexibilidad de los cuádriceps y piernas.',
        typeId: machineTypeFlexibilidad.id,
        muscles: { connect: [{ id: muscleCuadriceps.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Estiramiento de espalda',
        description: 'Mejora la flexibilidad y movilidad de la espalda.',
        typeId: machineTypeFlexibilidad.id,
        muscles: { connect: [{ id: muscleEspalda.id }] },
      },
    });

    // Potencia
    await prisma.machine.create({
      data: {
        name: 'Cajón pliométrico',
        description: 'Saltos explosivos para potencia y coordinación.',
        typeId: machineTypePotencia.id,
        muscles: { connect: [{ id: muscleCuadriceps.id }, { id: muscleGluteos.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Sled de empuje',
        description: 'Ejercicio explosivo para tren inferior y core.',
        typeId: machineTypePotencia.id,
        muscles: { connect: [{ id: muscleCuadriceps.id }, { id: muscleAbdomen.id }] },
      },
    });

    // Core
    await prisma.machine.create({
      data: {
        name: 'Banco de abdominales',
        description: 'Ejercicios para fortalecer el abdomen y core.',
        typeId: machineTypeCore.id,
        muscles: { connect: [{ id: muscleAbdomen.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Rueda abdominal',
        description: 'Ejercicio de core y estabilidad.',
        typeId: machineTypeCore.id,
        muscles: { connect: [{ id: muscleAbdomen.id }, { id: muscleEspalda.id }] },
      },
    });

    // HIIT
    await prisma.machine.create({
      data: {
        name: 'Battle ropes',
        description: 'Entrenamiento de intervalos con cuerdas para todo el cuerpo.',
        typeId: machineTypeHiit.id,
        muscles: { connect: [{ id: muscleHombro.id }, { id: muscleEspalda.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Air bike',
        description: 'Ejercicio HIIT de alta intensidad para tren superior e inferior.',
        typeId: machineTypeHiit.id,
        muscles: { connect: [{ id: muscleCuadriceps.id }, { id: muscleBiceps.id }] },
      },
    });

    // Rehabilitación
    await prisma.machine.create({
      data: {
        name: 'Extensión de cuádriceps',
        description: 'Ejercicio de rehabilitación y fuerza para cuádriceps.',
        typeId: machineTypeRehabilitacion.id,
        muscles: { connect: [{ id: muscleCuadriceps.id }] },
      },
    });
    await prisma.machine.create({
      data: {
        name: 'Remo asistido',
        description: 'Rehabilitación y fortalecimiento de espalda y brazos.',
        typeId: machineTypeRehabilitacion.id,
        muscles: { connect: [{ id: muscleEspalda.id }, { id: muscleBiceps.id }] },
      },
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
