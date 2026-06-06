// scripts/generate-descriptions.ts
// Generates descriptionRo and descriptionRu for products that have none,
// based on their specs (procesor, ram, storage, display, gpu, etc.).

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SpecRecord = Record<string, string>;

function buildDescriptionRo(name: string, specs: SpecRecord): string {
  const parts: string[] = [];
  const tip = specs.tip || '';
  const cpu = specs.procesor || specs.cpuModel || '';
  const ram = specs.ram || '';
  const storage = specs.storage || '';
  const display = specs.display || '';
  const gpu = specs.gpu || specs.gpuModel || '';
  const os = specs.os || '';

  if (tip) {
    const article = tip.match(/^[aeiouAEIOU]/) ? 'Acesta este un' : 'Acesta este un';
    parts.push(`${article} ${tip.toLowerCase()} performant de la ${name.split(' ')[0] || 'brand cunoscut'}`);
  } else {
    parts.push(`${name} — dispozitiv performant`);
  }

  if (cpu) parts.push(`echipat cu procesor ${cpu}`);
  if (ram) parts.push(`${ram} memorie RAM`);
  if (storage) parts.push(`stocare ${storage}`);
  if (display) parts.push(`display ${display}`);
  if (gpu) parts.push(`placă video ${gpu}`);
  if (os) parts.push(`sistem de operare ${os}`);

  parts.push('Ideal pentru utilizare zilnică, productivitate și divertisment.');

  return parts.join(', ') + '.';
}

function buildDescriptionRu(name: string, specs: SpecRecord): string {
  const parts: string[] = [];
  const tip = specs.tip || '';
  const cpu = specs.procesor || specs.cpuModel || '';
  const ram = specs.ram || '';
  const storage = specs.storage || '';
  const display = specs.display || '';
  const gpu = specs.gpu || specs.gpuModel || '';
  const os = specs.os || '';

  if (tip) {
    parts.push(`Это производительный ${tip.toLowerCase()} от ${name.split(' ')[0] || 'известного бренда'}`);
  } else {
    parts.push(`${name} — производительное устройство`);
  }

  if (cpu) parts.push(`оснащён процессором ${cpu}`);
  if (ram) parts.push(`${ram} оперативной памяти`);
  if (storage) parts.push(`накопитель ${storage}`);
  if (display) parts.push(`дисплей ${display}`);
  if (gpu) parts.push(`видеокарта ${gpu}`);
  if (os) parts.push(`операционная система ${os}`);

  parts.push('Идеально подходит для повседневного использования, продуктивности и развлечений.');

  return parts.join(', ') + '.';
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      descriptionRo: true,
      descriptionRu: true,
      specs: true,
    },
  });

  let updated = 0;
  for (const p of products) {
    if (p.descriptionRo && p.descriptionRu) continue;

    const specs = (p.specs as SpecRecord) || {};
    const descRo = p.descriptionRo || buildDescriptionRo(p.name, specs);
    const descRu = p.descriptionRu || buildDescriptionRu(p.name, specs);

    await prisma.product.update({
      where: { id: p.id },
      data: { descriptionRo: descRo, descriptionRu: descRu },
    });
    updated++;
    console.log(`✅ ${p.name}`);
  }

  console.log(`\nDone: ${updated}/${products.length} products updated.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
