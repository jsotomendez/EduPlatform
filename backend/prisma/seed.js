import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

async function main() {
  console.log('Iniciando sembrado de base de datos...');

  if (!fs.existsSync(DB_PATH)) {
    console.log('No se encontró backend/data/db.json. Nada que sembrar.');
    return;
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf-8');
  const dbData = JSON.parse(rawData);

  // 1. Sembrar Cursos
  console.log('Sembrando cursos...');
  const courseLessonsMap = new Map(); // Para rastrear qué lecciones pertenecen a qué curso/módulo
  for (const c of dbData.courses || []) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        icon: c.icon,
        color: c.color,
        instructor: c.instructor,
        instructorAvatar: c.instructorAvatar,
        estimatedHours: c.estimatedHours || {},
        progress: c.progress || 0.0,
        status: c.status || 'locked',
        adaptedFor: c.adaptedFor,
        curriculumAligned: c.curriculumAligned !== undefined ? c.curriculumAligned : true,
        tags: c.tags || [],
        rating: c.rating || 0.0,
        enrolled: c.enrolled || 0,
      },
    });

    // Sembrar Módulos de este curso
    for (const m of c.modules || []) {
      await prisma.module.upsert({
        where: { id: m.id },
        update: {},
        create: {
          id: m.id,
          courseId: c.id,
          title: m.title,
          description: m.description || '',
          completed: m.completed || false,
        },
      });

      // Guardar mapeo de lecciones a este módulo
      for (const lessonId of m.lessons || []) {
        courseLessonsMap.set(lessonId, { courseId: c.id, moduleId: m.id });
      }
    }
  }

  // 2. Sembrar Lecciones
  console.log('Sembrando lecciones...');
  for (const l of dbData.lessons || []) {
    // Si no está mapeado por el módulo, buscar fallback o deducir
    const mapping = courseLessonsMap.get(l.id) || { courseId: l.courseId, moduleId: l.moduleId };
    if (!mapping.moduleId) {
      console.warn(`Advertencia: Lección ${l.id} no tiene un moduleId asociado. Se omitirá.`);
      continue;
    }
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        courseId: mapping.courseId,
        moduleId: mapping.moduleId,
        title: l.title,
        type: l.type || 'video',
        duration: l.duration || 10,
        completed: l.completed || false,
        order: l.order || 1,
        quiz: l.quiz || [],
        contentByStyle: l.contentByStyle || {},
      },
    });
  }

  // 3. Sembrar Usuarios
  console.log('Sembrando usuarios...');
  for (const u of dbData.users || []) {
    // Resolver campos requeridos y tipos
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role || 'student',
        avatar: u.avatar,
        university: u.university || 'Universidad de Córdoba',
        program: u.program,
        department: u.department,
        semester: u.semester || 1,
        cognitiveProfile: u.cognitiveProfile || null,
        preferences: u.preferences || {},
        stats: u.stats || {},
        enrolledCourses: u.enrolledCourses || [],
        courseProgress: u.courseProgress || {},
        courses: u.courses || [],
        joinedAt: u.joinedAt ? new Date(u.joinedAt) : new Date(),
      },
    });
  }

  // 4. Sembrar Actividades
  console.log('Sembrando actividades...');
  for (const a of dbData.activities || []) {
    // Validar que el usuario exista antes de crearla
    const userExists = await prisma.user.findUnique({ where: { id: a.userId } });
    if (!userExists) continue;

    // Asegurarse de que el ID sea único y compatible
    await prisma.activity.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        userId: a.userId,
        type: a.type,
        description: a.description,
        timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
      },
    });
  }

  // 5. Sembrar Badges
  console.log('Sembrando insignias (badges)...');
  for (const b of dbData.badges || []) {
    const userExists = await prisma.user.findUnique({ where: { id: b.userId } });
    if (!userExists) continue;

    await prisma.badge.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        userId: b.userId,
        name: b.name,
        description: b.description,
        icon: b.icon,
        unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : new Date(),
      },
    });
  }

  // 6. Sembrar Tareas
  console.log('Sembrando tareas...');
  for (const t of dbData.tasks || []) {
    // Para simplificar, si no tiene userId en db.json (tarea global), se asigna a todos los estudiantes o al estudiante demo u_001
    const userId = t.userId || 'u_001';
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) continue;

    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        userId,
        title: t.title,
        course: t.course,
        dueDate: t.dueDate,
        status: t.status || 'pending',
      },
    });
  }

  // 7. Sembrar Posts del Foro
  console.log('Sembrando publicaciones del foro...');
  for (const p of dbData.posts || []) {
    const userExists = await prisma.user.findUnique({ where: { id: p.authorId } });
    if (!userExists) continue;

    await prisma.forumPost.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        authorId: p.authorId,
        authorName: p.authorName,
        authorAvatar: p.authorAvatar,
        course: p.course || 'General',
        courseId: p.courseId || 'c_001',
        title: p.title,
        content: p.content,
        tags: p.tags || [],
        likes: p.likes || 0,
        replies: p.replies || 0,
        solved: p.solved !== undefined ? p.solved : false,
        aiResponse: p.aiResponse || null,
        timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
      },
    });
  }

  console.log('¡Sembrado completado con éxito!');
}

main()
  .catch((e) => {
    console.error('Error durante el sembrado de la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
