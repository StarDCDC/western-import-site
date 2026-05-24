// src/app/api/admin/schedule/route.ts — Admin work schedule CRUD
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

// Default schedule seed data
const DEFAULT_SCHEDULE = [
  { dayOfWeek: 'monday',    dayNameRo: 'Luni',      dayNameRu: 'Понедельник', isOpen: true,  startTime: '09:00', endTime: '18:00', order: 0 },
  { dayOfWeek: 'tuesday',   dayNameRo: 'Marți',     dayNameRu: 'Вторник',     isOpen: true,  startTime: '09:00', endTime: '18:00', order: 1 },
  { dayOfWeek: 'wednesday', dayNameRo: 'Miercuri',   dayNameRu: 'Среда',       isOpen: true,  startTime: '09:00', endTime: '18:00', order: 2 },
  { dayOfWeek: 'thursday',  dayNameRo: 'Joi',       dayNameRu: 'Четверг',     isOpen: true,  startTime: '09:00', endTime: '18:00', order: 3 },
  { dayOfWeek: 'friday',    dayNameRo: 'Vineri',     dayNameRu: 'Пятница',     isOpen: true,  startTime: '09:00', endTime: '18:00', order: 4 },
  { dayOfWeek: 'saturday',  dayNameRo: 'Sâmbătă',   dayNameRu: 'Суббота',     isOpen: true,  startTime: '10:00', endTime: '16:00', order: 5 },
  { dayOfWeek: 'sunday',    dayNameRo: 'Duminică',   dayNameRu: 'Воскресенье', isOpen: false, startTime: null,    endTime: null,    order: 6 },
];

async function ensureSchedule() {
  const count = await prisma.workSchedule.count();
  if (count === 0) {
    await prisma.workSchedule.createMany({ data: DEFAULT_SCHEDULE });
  }
}

// GET /api/admin/schedule
export async function GET() {
  try {
    await ensureSchedule();
    const schedule = await prisma.workSchedule.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return successResponse({ schedule });
  } catch {
    return serverErrorResponse();
  }
}

// PUT /api/admin/schedule — update entire schedule
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return errorResponse('Neautorizat', 401);

    const body = await request.json();
    const { schedule } = body as {
      schedule: Array<{
        id: string;
        isOpen: boolean;
        startTime: string | null;
        endTime: string | null;
        specialHours?: unknown;
      }>;
    };

    // Update each day
    const updates = schedule.map((day) =>
      prisma.workSchedule.update({
        where: { id: day.id },
        data: {
          isOpen: day.isOpen,
          startTime: day.startTime,
          endTime: day.endTime,
          ...(day.specialHours !== undefined ? { specialHours: day.specialHours as any } : {}),
        },
      })
    );

    await prisma.$transaction(updates);

    const updated = await prisma.workSchedule.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return successResponse({ schedule: updated });
  } catch {
    return serverErrorResponse();
  }
}

// PATCH /api/admin/schedule — toggle single day
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return errorResponse('Neautorizat', 401);

    const body = await request.json();
    const { id, isOpen } = body as { id: string; isOpen?: boolean };

    if (!id) return errorResponse('ID obligatoriu');

    const updated = await prisma.workSchedule.update({
      where: { id },
      data: {
        ...(isOpen !== undefined ? { isOpen } : {}),
      },
    });

    return successResponse({ schedule: updated });
  } catch {
    return serverErrorResponse();
  }
}
