// src/app/api/schedule/route.ts — Public work schedule (for footer)
import prisma from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/utils';

const DEFAULT_SCHEDULE = [
  { dayOfWeek: 'monday',    dayNameRo: 'Luni',      dayNameRu: 'Понедельник', isOpen: true,  startTime: '09:00', endTime: '18:00', order: 0 },
  { dayOfWeek: 'tuesday',   dayNameRo: 'Marți',     dayNameRu: 'Вторник',     isOpen: true,  startTime: '09:00', endTime: '18:00', order: 1 },
  { dayOfWeek: 'wednesday', dayNameRo: 'Miercuri',   dayNameRu: 'Среда',       isOpen: true,  startTime: '09:00', endTime: '18:00', order: 2 },
  { dayOfWeek: 'thursday',  dayNameRo: 'Joi',       dayNameRu: 'Четверг',     isOpen: true,  startTime: '09:00', endTime: '18:00', order: 3 },
  { dayOfWeek: 'friday',    dayNameRo: 'Vineri',     dayNameRu: 'Пятница',     isOpen: true,  startTime: '09:00', endTime: '18:00', order: 4 },
  { dayOfWeek: 'saturday',  dayNameRo: 'Sâmbătă',   dayNameRu: 'Суббота',     isOpen: true,  startTime: '10:00', endTime: '16:00', order: 5 },
  { dayOfWeek: 'sunday',    dayNameRo: 'Duminică',   dayNameRu: 'Воскресенье', isOpen: false, startTime: null,    endTime: null,    order: 6 },
];

export async function GET() {
  try {
    const count = await prisma.workSchedule.count();
    if (count === 0) {
      await prisma.workSchedule.createMany({ data: DEFAULT_SCHEDULE });
    }
    const schedule = await prisma.workSchedule.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return successResponse({ schedule });
  } catch {
    return serverErrorResponse();
  }
}
