/**
 * Autofill product_specs from product name parsing
 * 
 * Parses names like:
 * "Lenovo ThinkPad X1 Yoga Gen 7 | i7-1265U | 16GB | 512GB | Iris Xe Graphics | 14.0" Touch"
 * 
 * And fills: cpuSeries, cpuModel, ram, storage, storageType, gpuModel, gpuSeries, gpuType, display, etc.
 * 
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/autofill-specs.ts
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

interface ProductRow {
  id: string;
  name: string;
  cpuModel: string | null;
  cpuSeries: string | null;
  ram: string | null;
  storage: string | null;
  storageType: string | null;
  gpuModel: string | null;
  gpuSeries: string | null;
  gpuType: string | null;
  display: string | null;
  resolution: string | null;
  refreshRate: string | null;
  os: string | null;
  weight: string | null;
}

// GPU detection from name parts
function detectGpu(nameParts: string[]): { gpuModel: string; gpuSeries: string; gpuType: string } | null {
  const full = nameParts.join(' ').toLowerCase();
  
  // NVIDIA patterns
  const nvidiaPatterns = [
    /RTX\s*(\d{4}\s*(?:Ti|SUPER)?)\b/i,
    /GTX\s*(\d{3,4}\s*(?:Ti|SUPER)?)\b/i,
    /GT\s*(\d{3,4})\b/i,
  ];
  
  for (const pat of nvidiaPatterns) {
    const m = full.match(pat);
    if (m) {
      return {
        gpuModel: m[0].replace(/\s+/g, ' ').trim(),
        gpuSeries: 'NVIDIA GeForce',
        gpuType: 'Dedicată',
      };
    }
  }

  // AMD Radeon patterns
  const amdPatterns = [
    /Radeon\s*(?:Pro\s*)?(\w+\s*\d{3,4}M?)/i,
    /RX\s*(\d{3,4}\w*)/i,
  ];
  
  for (const pat of amdPatterns) {
    const m = full.match(pat);
    if (m) {
      return {
        gpuModel: m[0].replace(/\s+/g, ' ').trim(),
        gpuSeries: 'AMD Radeon',
        gpuType: 'Dedicată',
      };
    }
  }

  // Intel GPU patterns
  const intelGpuPatterns = [
    /Iris\s*Xe/i,
    /Intel\s*Iris/i,
    /Intel\s*UHD/i,
    /Intel\s*Graphics/i,
    /UHD\s*Graphics/i,
  ];
  
  for (const pat of intelGpuPatterns) {
    const m = full.match(pat);
    if (m) {
      return {
        gpuModel: m[0].replace(/\s+/g, ' ').trim(),
        gpuSeries: 'Intel',
        gpuType: 'Integrată',
      };
    }
  }

  // Apple GPU
  if (/M[1-4]\s*(?:Pro|Max|Ultra)?/i.test(full) && /apple|macbook|mac/i.test(full)) {
    const m = full.match(/M[1-4]\s*(?:Pro|Max|Ultra)?/i);
    if (m) {
      return {
        gpuModel: m[0].trim(),
        gpuSeries: 'Apple',
        gpuType: 'Integrată',
      };
    }
  }

  // Snapdragon
  if (/snapdragon/i.test(full)) {
    const m = full.match(/Snapdragon\s*\w+\s*\w*\s*\d*/i);
    if (m) {
      return {
        gpuModel: 'Adreno GPU',
        gpuSeries: 'Qualcomm',
        gpuType: 'Integrată',
      };
    }
  }

  return null;
}

// CPU series detection from cpuModel
function detectCpuSeries(cpuModel: string): string | null {
  const cm = cpuModel.toLowerCase().trim();
  
  if (/^(i[3579]\s*\d{4,5})|(i[3579]-\d{4,5})/.test(cm) || /^core\s*(i[3579]|ultra|[3579]\s*\d{2,3})/.test(cm) || /^pentium/.test(cm) || /^celeron/.test(cm)) {
    return 'Intel Core';
  }
  if (/ryzen/i.test(cm)) return 'AMD Ryzen';
  if (/athlon/i.test(cm)) return 'AMD Athlon';
  if (/^(m[1-4]\s*(?:pro|max|ultra)?)$/.test(cm) || /^m[1-4]/.test(cm)) return 'Apple Silicon';
  if (/snapdragon/i.test(cm)) return 'Qualcomm Snapdragon';
  if (/^(apple\s*)?m[1-4]/i.test(cm)) return 'Apple Silicon';
  
  return null;
}

// Infer integrated GPU when no dedicated GPU mentioned and CPU is known
function inferIntegratedGpu(cpuModel: string, cpuSeries: string): { gpuModel: string; gpuSeries: string; gpuType: string } | null {
  const cm = cpuModel.toLowerCase();
  
  // Intel 12th gen+ typically Iris Xe
  if (cpuSeries === 'Intel Core') {
    // Extract gen number from model
    const genMatch = cm.match(/[i3579]\s*-?\s*(\d{4,5})/);
    if (genMatch) {
      const modelNum = parseInt(genMatch[1]);
      const gen = Math.floor(modelNum / 100);
      if (gen >= 11) {
        return { gpuModel: 'Iris Xe Graphics', gpuSeries: 'Intel', gpuType: 'Integrată' };
      }
      if (gen >= 6) {
        return { gpuModel: 'UHD Graphics', gpuSeries: 'Intel', gpuType: 'Integrată' };
      }
    }
    // Core Ultra
    if (/ultra/i.test(cm)) {
      return { gpuModel: 'Intel Arc Graphics', gpuSeries: 'Intel', gpuType: 'Integrată' };
    }
    // Pentium/Celeron
    if (/pentium/i.test(cm)) return { gpuModel: 'Intel HD Graphics', gpuSeries: 'Intel', gpuType: 'Integrată' };
    if (/celeron/i.test(cm)) return { gpuModel: 'Intel HD Graphics', gpuSeries: 'Intel', gpuType: 'Integrată' };
    // Core 3/5/7 (new naming)
    if (/^core\s*[357]\s*\d/i.test(cm)) {
      return { gpuModel: 'Iris Xe Graphics', gpuSeries: 'Intel', gpuType: 'Integrată' };
    }
  }
  
  // AMD Ryzen with integrated Vega/RDNA
  if (cpuSeries === 'AMD Ryzen') {
    const genMatch = cm.match(/ryzen\s*\d\s*(\d{4,5})/i);
    if (genMatch) {
      const modelNum = parseInt(genMatch[1]);
      const gen = Math.floor(modelNum / 1000);
      if (gen >= 6) {
        return { gpuModel: 'AMD Radeon Graphics', gpuSeries: 'AMD', gpuType: 'Integrată' };
      }
      return { gpuModel: 'AMD Radeon Vega', gpuSeries: 'AMD', gpuType: 'Integrată' };
    }
    return { gpuModel: 'AMD Radeon Graphics', gpuSeries: 'AMD', gpuType: 'Integrată' };
  }
  
  // AMD Athlon
  if (cpuSeries === 'AMD Athlon') {
    return { gpuModel: 'AMD Radeon Graphics', gpuSeries: 'AMD', gpuType: 'Integrată' };
  }
  
  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    include: { spec: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\n🔍 Total produse: ${products.length}\n`);

  let updated = 0;
  let skipped = 0;
  let created = 0;

  for (const product of products) {
    const spec = product.spec as ProductRow | null;
    const name = product.name;
    
    // Parse name parts separated by |
    const parts = name.split('|').map((p: string) => p.trim()).filter(Boolean);
    
    const updates: Record<string, string> = {};
    
    // --- CPU Series ---
    if (spec?.cpuModel && (!spec?.cpuSeries || spec.cpuSeries.trim() === '')) {
      const series = detectCpuSeries(spec.cpuModel);
      if (series) {
        updates.cpuSeries = series;
      }
    }
    
    // Also detect cpuModel from name if missing
    if (!spec?.cpuModel || spec.cpuModel.trim() === '') {
      // Try to find CPU in name parts
      for (const part of parts) {
        const cpuMatch = part.match(
          /((?:Intel\s+)?(?:Core\s+)?(?:Ultra\s+)?(?:i[3579])\s*-?\s*\d{4,5}\w*|(?:AMD\s+)?Ryzen\s+\d\s+\d{4,5}\w*|(?:Apple\s+)?M[1-4]\s*(?:Pro|Max|Ultra)?|Pentium\s+Gold?\s+\w+|Celeron\s+\w+|Snapdragon\s+\w+\s*\w*\s*\d*|Core\s+[3579]\s+\d{2,3}\w*)/i
        );
        if (cpuMatch) {
          updates.cpuModel = cpuMatch[1].replace(/^(Intel\s+|AMD\s+)/i, '').trim();
          const series = detectCpuSeries(updates.cpuModel);
          if (series && (!spec?.cpuSeries || spec.cpuSeries.trim() === '')) {
            updates.cpuSeries = series;
          }
          break;
        }
      }
    }
    
    // --- GPU ---
    const hasGpu = spec?.gpuModel && spec.gpuModel.trim() !== '';
    if (!hasGpu) {
      // Try detecting GPU from name
      const gpuInfo = detectGpu(parts);
      if (gpuInfo) {
        updates.gpuModel = gpuInfo.gpuModel;
        updates.gpuSeries = gpuInfo.gpuSeries;
        updates.gpuType = gpuInfo.gpuType;
      } else {
        // Infer integrated GPU from CPU
        const effectiveCpuModel = updates.cpuModel || spec?.cpuModel || '';
        const effectiveCpuSeries = updates.cpuSeries || spec?.cpuSeries || '';
        if (effectiveCpuModel && effectiveCpuSeries) {
          const inferred = inferIntegratedGpu(effectiveCpuModel, effectiveCpuSeries);
          if (inferred) {
            updates.gpuModel = inferred.gpuModel;
            updates.gpuSeries = inferred.gpuSeries;
            updates.gpuType = inferred.gpuType;
          }
        }
      }
    } else {
      // GPU model exists but maybe series/type missing
      if (!spec?.gpuSeries || spec.gpuSeries.trim() === '') {
        const gm = spec!.gpuModel!.toLowerCase();
        if (/rtx|gtx|gt/i.test(gm)) updates.gpuSeries = 'NVIDIA GeForce';
        else if (/radeon|rx/i.test(gm)) updates.gpuSeries = 'AMD Radeon';
        else if (/iris|uhd|intel/i.test(gm)) updates.gpuSeries = 'Intel';
        else if (/m[1-4]/i.test(gm)) updates.gpuSeries = 'Apple';
        else if (/adreno/i.test(gm)) updates.gpuSeries = 'Qualcomm';
      }
      if (!spec?.gpuType || spec.gpuType.trim() === '') {
        const gm = (spec?.gpuModel || '').toLowerCase();
        const gs = (updates.gpuSeries || spec?.gpuSeries || '').toLowerCase();
        if (/radeon pro|radeon.*\d{3,4}m|rtx|gtx/i.test(gm) || gs.includes('nvidia') || gs.includes('amd radeon')) {
          updates.gpuType = 'Dedicată';
        } else {
          updates.gpuType = 'Integrată';
        }
      }
    }
    
    // --- Storage Type ---
    if (!spec?.storageType || spec.storageType.trim() === '') {
      if (spec?.storage) {
        const st = spec.storage.toLowerCase();
        if (st.includes('ssd') && st.includes('hdd')) updates.storageType = 'SSD + HDD';
        else if (st.includes('ssd')) updates.storageType = 'SSD';
        else if (st.includes('hdd')) updates.storageType = 'HDD';
        else if (st.includes('emmc')) updates.storageType = 'eMMC';
        else updates.storageType = 'SSD'; // default for modern laptops
      }
    }

    // --- Apply updates ---
    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    if (spec) {
      // Update existing spec
      await prisma.productSpec.update({
        where: { productId: product.id },
        data: updates,
      });
      updated++;
      console.log(`✅ [UPD] ${name}`);
      console.log(`     → ${JSON.stringify(updates)}`);
    } else {
      // Create new spec row
      await prisma.productSpec.create({
        data: {
          productId: product.id,
          ...updates,
        },
      });
      created++;
      console.log(`🆕 [NEW] ${name}`);
      console.log(`     → ${JSON.stringify(updates)}`);
    }
  }

  console.log(`\n📊 Rezultat:`);
  console.log(`   Actualizate: ${updated}`);
  console.log(`   Create noi:  ${created}`);
  console.log(`   Skipate:     ${skipped}`);
  console.log(`   Total:       ${products.length}\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Eroare:', e);
  process.exit(1);
});
