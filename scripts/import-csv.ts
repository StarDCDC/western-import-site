import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple CSV parser that handles quoted fields with commas
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          // Escaped double quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (char === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (char === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      i += 2;
      continue;
    }

    if (char === '\n') {
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  // Last field/row
  currentRow.push(currentField.trim());
  if (currentRow.length > 1 || currentRow[0] !== '') {
    rows.push(currentRow);
  }

  return rows;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

interface ParsedSpecs {
  cpuModel: string | null;
  cpuSeries: string | null;
  ram: string | null;
  storage: string | null;
  storageType: string | null;
  display: string | null;
  resolution: string | null;
  gpuModel: string | null;
  gpuSeries: string | null;
  gpuType: string | null;
  refreshRate: string | null;
}

function parseProductSpecs(name: string): ParsedSpecs {
  const specs: ParsedSpecs = {
    cpuModel: null, cpuSeries: null, ram: null, storage: null, storageType: null,
    display: null, resolution: null, gpuModel: null, gpuSeries: null, gpuType: null,
    refreshRate: null,
  };

  // Split by pipe to get segments
  const segments = name.split('|').map(s => s.trim());

  // Find display info from segments (e.g., '14.1" FHD IPS', '15.6" 144Hz')
  for (const seg of segments) {
    // Display size + extras
    const displayMatch = seg.match(/(\d+(?:\.\d+)?)[''"″]\s*(.*)/);
    if (displayMatch && !specs.display) {
      specs.display = `${displayMatch[1]}" ${displayMatch[2]}`.trim();
      const displayStr = displayMatch[2];

      // Resolution
      if (/4K|UHD/i.test(displayStr)) specs.resolution = '3840x2160';
      else if (/2K|QHD/i.test(displayStr)) specs.resolution = '2560x1440';
      else if (/FHD\+|FHD\s*\+/i.test(displayStr)) specs.resolution = '1920x1200';
      else if (/FHD|Full HD/i.test(displayStr)) specs.resolution = '1920x1080';
      else if (/HD[^+]/i.test(displayStr) && !/FHD|QHD|UHD/.test(displayStr)) specs.resolution = '1366x768';
      else if (/Retina/i.test(displayStr)) specs.resolution = 'Retina';

      // Refresh rate
      const hzMatch = displayStr.match(/(\d+)Hz/);
      if (hzMatch) specs.refreshRate = `${hzMatch[1]}Hz`;
    }

    // CPU - look for CPU patterns
    if (!specs.cpuModel) {
      // Intel Core iX XXXXX pattern
      const intelMatch = seg.match(/(?:Intel\s+)?Core\s+(?:i[3579]|i\d)\s+(\w+)/i);
      if (intelMatch) {
        const fullSeg = seg.match(/(?:Intel\s+)?Core\s+(i[3579]\s+\w+)/i);
        if (fullSeg) {
          specs.cpuModel = fullSeg[1].replace(/\s+/g, ' ');
          specs.cpuSeries = 'Intel Core';
        }
      }

      // i5/i7/i9 standalone pattern (e.g., "i7 10310U", "i5-10210U")
      const cpuMatch = seg.match(/\b(i[3579])\s*[-]?\s*(\w+)\b/);
      if (cpuMatch && !specs.cpuModel) {
        specs.cpuModel = `${cpuMatch[1]} ${cpuMatch[2]}`;
        specs.cpuSeries = 'Intel Core';
      }

      // Ryzen pattern
      const ryzenMatch = seg.match(/(Ryzen\s+\d+\s+\w+)/i);
      if (ryzenMatch && !specs.cpuModel) {
        specs.cpuModel = ryzenMatch[1];
        specs.cpuSeries = 'AMD Ryzen';
      }

      // R7 shorthand
      const rMatch = seg.match(/\b(R[357])\s+(\w+)\b/);
      if (rMatch && !specs.cpuModel) {
        specs.cpuModel = `Ryzen ${rMatch[1].replace('R', '')} ${rMatch[2]}`;
        specs.cpuSeries = 'AMD Ryzen';
      }

      // Core 3 pattern
      const coreMatch = seg.match(/(Core\s+3\s+\w+)/i);
      if (coreMatch && !specs.cpuModel) {
        specs.cpuModel = coreMatch[1];
        specs.cpuSeries = 'Intel Core';
      }
    }

    // RAM
    if (!specs.ram) {
      const ramMatch = seg.match(/(\d+)\s*GB/i);
      if (ramMatch && !seg.match(/SSD|HDD|TB|GB\s.*(?:SSD|HDD|Storage)/i)) {
        // Make sure it's not storage (e.g., 512GB)
        const num = parseInt(ramMatch[1]);
        if (num <= 128) { // reasonable RAM sizes: 4, 8, 12, 16, 32, 64, 128
          specs.ram = `${num}GB`;
        }
      }
    }

    // Storage
    if (!specs.storage) {
      const tbMatch = seg.match(/(\d+)\s*TB/i);
      const gbStorageMatch = seg.match(/(\d+)\s*GB/i);
      if (tbMatch) {
        specs.storage = `${tbMatch[1]}TB`;
        specs.storageType = 'SSD';
      } else if (gbStorageMatch) {
        const num = parseInt(gbStorageMatch[1]);
        if (num >= 128) { // storage is typically 128+
          specs.storage = `${num}GB`;
          specs.storageType = 'SSD';
        }
      }
    }

    // GPU
    if (!specs.gpuModel) {
      const gpuPatterns = [
        /(RTX\s+\d{4}\s*(?:Ti|SUPER)?)/i,
        /(GTX\s+\d{4}\s*(?:Ti|SUPER)?)/i,
        /(Radeon\s+(?:Pro\s+)?\w+)/i,
        /(Quadro\s+\w+)/i,
        /(Intel\s+Iris\s*(?:Xe)?)/i,
        /(Intel\s+Iris)/i,
        /(Iris\s+Xe)/i,
      ];
      for (const pat of gpuPatterns) {
        const m = seg.match(pat);
        if (m) {
          specs.gpuModel = m[1].trim();
          if (/RTX|GTX/.test(m[1])) {
            specs.gpuSeries = 'NVIDIA GeForce';
            specs.gpuType = 'Dedicată';
          } else if (/Radeon/.test(m[1])) {
            specs.gpuSeries = 'AMD Radeon';
            specs.gpuType = 'Dedicată';
          } else if (/Quadro/.test(m[1])) {
            specs.gpuSeries = 'NVIDIA Quadro';
            specs.gpuType = 'Dedicată';
          } else if (/Iris|Intel/.test(m[1])) {
            specs.gpuSeries = 'Intel';
            specs.gpuType = 'Integrată';
          }
          break;
        }
      }
    }

    // Refresh rate from segment (e.g., "144Hz" standalone in last segment)
    if (!specs.refreshRate) {
      const hzMatch = seg.match(/(\d+)Hz/);
      if (hzMatch) specs.refreshRate = `${hzMatch[1]}Hz`;
    }
  }

  return specs;
}

async function main() {
  console.log('Reading CSV file...');
  const csvPath = path.join(__dirname, '..', 'import-products-full.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  if (rows.length < 2) {
    console.error('CSV has no data rows');
    process.exit(1);
  }

  const headers = rows[0];
  console.log(`CSV headers: ${headers.join(', ')}`);
  console.log(`Total rows (including header): ${rows.length}`);

  // Find column indices
  const colIdx: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIdx[h] = i;
  });

  // Verify required columns exist
  const requiredCols = ['Nume', 'Preț obișnuit', 'Categorii', 'Imagini', 'Branduri'];
  for (const col of requiredCols) {
    if (colIdx[col] === undefined) {
      console.error(`Missing required column: ${col}`);
      console.log('Available columns:', headers);
      process.exit(1);
    }
  }

  // Clean existing data
  console.log('Cleaning existing products...');
  await prisma.productSpec.deleteMany({});
  await prisma.product.deleteMany({});

  // Get or create Laptopuri category
  let category = await prisma.category.findFirst({ where: { slug: 'laptopuri' } });
  if (!category) {
    category = await prisma.category.create({
      data: { nameRo: 'Laptopuri', nameRu: 'Ноутбуки', slug: 'laptopuri' },
    });
    console.log('Created category: Laptopuri');
  }

  // Brand cache
  const brandCache: Record<string, string> = {};

  async function getOrCreateBrandId(brandName: string): Promise<string> {
    const normalized = brandName.trim();
    if (brandCache[normalized]) return brandCache[normalized];

    const slug = slugify(normalized);
    let brand = await prisma.brand.findFirst({ where: { slug } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: normalized, slug },
      });
      console.log(`  Created brand: ${normalized} (${slug})`);
    }
    brandCache[normalized] = brand.id;
    return brand.id;
  }

  let imported = 0;
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 5) { skipped++; continue; }

    const get = (col: string): string => {
      const idx = colIdx[col];
      return idx !== undefined && idx < row.length ? row[idx] || '' : '';
    };

    const name = get('Nume');
    if (!name) { skipped++; continue; }

    const sku = get('SKU');
    const stock = parseInt(get('Stoc')) || 0;
    const promoPrice = get('Preț promoțional');
    const normalPrice = get('Preț obișnuit');
    const categoryName = get('Categorii');
    const imagesStr = get('Imagini');
    const brandName = get('Branduri');
    const description = get('Descriere scurtă');

    // Price logic: Preț promoțional → price (sale price), Preț obișnuit → oldPrice (regular price)
    // If only Preț obișnuit exists, that's the current price
    let price: number;
    let oldPrice: number | null = null;

    if (promoPrice && normalPrice) {
      price = parseFloat(promoPrice);
      oldPrice = parseFloat(normalPrice);
    } else if (normalPrice) {
      price = parseFloat(normalPrice);
    } else if (promoPrice) {
      price = parseFloat(promoPrice);
    } else {
      skipped++;
      continue;
    }

    if (isNaN(price) || price <= 0) { skipped++; continue; }

    // Parse images into JSON array
    const imageUrls = imagesStr
      .split(',')
      .map((url: string) => url.trim())
      .filter((url: string) => url.startsWith('http'));
    const imagesJson = JSON.stringify(imageUrls);

    // Create slug
    const slug = slugify(name);
    const uniqueSlug = `${slug}-${sku || r}`;

    // Get brand
    const brandId = await getOrCreateBrandId(brandName || 'Unknown');

    // Parse specs from product name
    const specs = parseProductSpecs(name);

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.replace(/^Nou\s*!\s*/i, '').trim(),
        slug: uniqueSlug,
        descriptionRo: description || null,
        price,
        oldPrice: oldPrice && oldPrice > price ? oldPrice : null,
        stock,
        sku: sku || null,
        condition: 'REFURBISHED',
        images: imagesJson,
        isActive: get('Publicat') === '1',
        isFeatured: false,
        categoryId: category.id,
        brandId,
      },
    });

    // Create product specs
    await prisma.productSpec.create({
      data: {
        productId: product.id,
        display: specs.display || null,
        storage: specs.storage || null,
        ram: specs.ram || null,
        cpuModel: specs.cpuModel || null,
        cpuSeries: specs.cpuSeries || null,
        gpuModel: specs.gpuModel || null,
        gpuSeries: specs.gpuSeries || null,
        gpuType: specs.gpuType || null,
        refreshRate: specs.refreshRate || null,
        resolution: specs.resolution || null,
        storageType: specs.storageType || null,
      },
    });

    imported++;
    console.log(`  [${imported}] ${name} - ${price} MDL${oldPrice ? ` (was ${oldPrice})` : ''} [${imageUrls.length} images]`);
  }

  console.log(`\n✅ Import complete: ${imported} products imported, ${skipped} skipped`);

  // Verify
  const totalProducts = await prisma.product.count();
  const totalSpecs = await prisma.productSpec.count();
  console.log(`\nDB verification: ${totalProducts} products, ${totalSpecs} specs`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
