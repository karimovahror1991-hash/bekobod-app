import 'dotenv/config';
import sharp from 'sharp';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Сжатие одного base64 фото
async function compressBase64(base64Input: string | null): Promise<string | null> {
  try {
    if (!base64Input || !base64Input.startsWith('data:image/')) return null;

    const base64Data = base64Input.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const compressed = await sharp(buffer)
      .resize({ width: 500, withoutEnlargement: true })
      .jpeg({ quality: 55 })
      .toBuffer();

    if (compressed.length >= buffer.length) {
      return base64Input;
    }

    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch (e: any) {
    return null;
  }
}

// Обработка таблицы с одним полем image_url
async function compressTable(
  tableName: string,
  nameField: string
): Promise<{ before: number; after: number; count: number }> {
  console.log(`\n📦 Таблица: ${tableName}`);

  const result = await pool.query(
    `SELECT id, ${nameField} as name, image_url FROM ${tableName} WHERE image_url LIKE 'data:image/%'`
  );

  console.log(`  Найдено записей с фото: ${result.rows.length}`);

  let totalBefore = 0;
  let totalAfter = 0;
  let updated = 0;

  for (const row of result.rows) {
    const before = Buffer.from(row.image_url.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
    totalBefore += before;

    const compressed = await compressBase64(row.image_url);
    if (compressed && compressed !== row.image_url) {
      await pool.query(`UPDATE ${tableName} SET image_url = $1 WHERE id = $2`, [compressed, row.id]);
      const after = Buffer.from(compressed.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      totalAfter += after;
      updated++;
      console.log(`  ✅ [${row.id}] ${row.name}: ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB`);
    } else {
      totalAfter += before;
    }
  }

  return { before: totalBefore, after: totalAfter, count: updated };
}

// Обработка listings (image_url + image_urls массив)
async function compressListings(): Promise<{ before: number; after: number; count: number }> {
  console.log(`\n📦 Таблица: listings (image_url + image_urls)`);

  const result = await pool.query(
    `SELECT id, title as name, image_url, image_urls FROM listings`
  );

  let totalBefore = 0;
  let totalAfter = 0;
  let updated = 0;

  for (const row of result.rows) {
    const updates: any = {};
    let changed = false;

    // Главное фото
    if (row.image_url && row.image_url.startsWith('data:image/')) {
      const before = Buffer.from(row.image_url.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      totalBefore += before;
      const compressed = await compressBase64(row.image_url);
      if (compressed && compressed !== row.image_url) {
        updates.image_url = compressed;
        changed = true;
        totalAfter += Buffer.from(compressed.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      } else {
        totalAfter += before;
      }
    }

    // Массив фото
    if (Array.isArray(row.image_urls) && row.image_urls.length > 0) {
      const newUrls: string[] = [];
      for (const url of row.image_urls) {
        if (!url || !url.startsWith('data:image/')) {
          newUrls.push(url);
          continue;
        }
        const before = Buffer.from(url.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
        totalBefore += before;
        const compressed = await compressBase64(url);
        if (compressed && compressed !== url) {
          newUrls.push(compressed);
          changed = true;
          totalAfter += Buffer.from(compressed.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
        } else {
          newUrls.push(url);
          totalAfter += before;
        }
      }
      updates.image_urls = newUrls;
    }

    if (changed) {
      const setParts: string[] = [];
      const values: any[] = [];
      let i = 1;
      if (updates.image_url) { setParts.push(`image_url = $${i++}`); values.push(updates.image_url); }
      if (updates.image_urls) { setParts.push(`image_urls = $${i++}`); values.push(updates.image_urls); }
      values.push(row.id);
      await pool.query(`UPDATE listings SET ${setParts.join(', ')} WHERE id = $${i}`, values);
      updated++;
      console.log(`  ✅ [${row.id}] ${row.name}`);
    }
  }

  return { before: totalBefore, after: totalAfter, count: updated };
}

async function main() {
  console.log('🚀 Начинаем сжатие фото во всех таблицах...');

  const results = {
    shops: await compressTable('shops', 'name'),
    doctors: await compressTable('doctors', 'name'),
    events: await compressTable('events', 'title'),
    ads: await compressTable('ads', 'title'),
    listings: await compressListings(),
  };

  let totalBefore = 0;
  let totalAfter = 0;
  let totalUpdated = 0;

  for (const [name, r] of Object.entries(results)) {
    totalBefore += r.before;
    totalAfter += r.after;
    totalUpdated += r.count;
    console.log(`\n📊 ${name}: обновлено ${r.count}, ${Math.round(r.before / 1024)} KB → ${Math.round(r.after / 1024)} KB`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Всего обновлено: ${totalUpdated}`);
  console.log(`📊 Было:  ${Math.round(totalBefore / 1024 / 1024 * 10) / 10} МБ`);
  console.log(`📊 Стало: ${Math.round(totalAfter / 1024 / 1024 * 10) / 10} МБ`);
  if (totalBefore > 0) {
    console.log(`📉 Экономия: ${Math.round((1 - totalAfter / totalBefore) * 100)}%`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await pool.end();
}

main().catch(e => {
  console.error('💥 Фатальная ошибка:', e);
  process.exit(1);
});