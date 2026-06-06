// src/app/api/admin/generate-descriptions/route.ts
// Generates descriptionRo and descriptionRu for all products missing them.
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type SpecRecord = Record<string, string>;

function buildRo(name: string, s: SpecRecord): string {
  const p: string[] = [];
  const cpu = s.procesor || s.cpuModel || '';
  const ram = s.ram || '';
  const storage = s.storage || '';
  const display = s.display || '';
  const gpu = s.gpu || s.gpuModel || '';
  const os = s.os || '';
  const brand = name.split(' ')[0] || '';

  p.push(`${name} — dispozitiv performant semnat ${brand}`);
  if (cpu) p.push(`echipat cu procesor ${cpu}`);
  if (ram) p.push(`${ram} memorie RAM`);
  if (storage) p.push(`stocare ${storage}`);
  if (display) p.push(`display ${display}`);
  if (gpu) p.push(`placă video ${gpu}`);
  if (os) p.push(`sistem de operare ${os}`);
  p.push('Ideal pentru utilizare zilnică, productivitate și divertisment.');
  return p.join(', ') + '.';
}

function buildRu(name: string, s: SpecRecord): string {
  const p: string[] = [];
  const cpu = s.procesor || s.cpuModel || '';
  const ram = s.ram || '';
  const storage = s.storage || '';
  const display = s.display || '';
  const gpu = s.gpu || s.gpuModel || '';
  const os = s.os || '';
  const brand = name.split(' ')[0] || '';

  p.push(`${name} — производительное устройство от ${brand}`);
  if (cpu) p.push(`оснащён процессором ${cpu}`);
  if (ram) p.push(`${ram} оперативной памяти`);
  if (storage) p.push(`накопитель ${storage}`);
  if (display) p.push(`дисплей ${display}`);
  if (gpu) p.push(`видеокарта ${gpu}`);
  if (os) p.push(`операционная система ${os}`);
  p.push('Идеально подходит для повседневного использования, продуктивности и развлечений.');
  return p.join(', ') + '.';
}

export async function POST() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, descriptionRo: true, descriptionRu: true, specs: true },
    });

    let updated = 0;
    const logs: string[] = [];

    for (const prod of products) {
      const descRoExisting = prod.descriptionRo as string | null;
      const descRuExisting = prod.descriptionRu as string | null;
      if (descRoExisting && descRuExisting) continue;

      const specs = (prod.specs ?? {}) as unknown as SpecRecord;
      const descRo = descRoExisting || buildRo(prod.name, specs);
      const descRu = descRuExisting || buildRu(prod.name, specs);

      await prisma.product.update({
        where: { id: prod.id },
        data: { descriptionRo: descRo, descriptionRu: descRu },
      });
      updated++;
      logs.push(prod.name);
    }

    return NextResponse.json({ success: true, updated, total: products.length, logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
