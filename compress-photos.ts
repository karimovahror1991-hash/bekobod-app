import 'dotenv/config';
import sharp from 'sharp';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Функция сжатия одного base64 фото
async function compressBase64(base64Input: string): Promise<string | null> {
  try {
    // Пропускаем пустые / битые
    if (!base64Input || !base64Input.startsWith('data:image/')) {
      return null;
    }

    // Очищаем префикс
    const base64Data = base64Input.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Сжимаем до 500px, quality 55
    const compressed = await sharp(buffer)
      .resize({ width: 500, withoutEnlargement: true })
      .jpeg({ quality: 55 })
      .toBuffer();

    // Проверка: стало ли меньше?
    if (compressed.length >= buffer.length) {
      console.log(`  ⏭  Пропуск — новое больше (${buffer.length} → ${compressed.length})`);
      return base64Input; // не сжимаем, если хуже
    }

    const before = Math.round(buffer.length / 1024);
    const after = Math.round(compressed.length / 1024);
    console.log(`  ✅ ${before} KB → ${after} KB`);

    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch (e: any) {
    console.error(`  ❌ Ошибка: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Начинаем сжатие фото ресторанов...\n');

  // Загружаем все рестораны
  const result = await pool.query('SELECT id, name, image_url, menu_images FROM restaurants ORDER BY id');
  console.log(`📦 Найдено ресторанов: ${result.rows.length}\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let updatedCount = 0;

  for (const row of result.rows) {
    console.log(`\n📌 [${row.id}] ${row.name}`);

    const updates: any = {};

    // Сжимаем главное фото
    if (row.image_url && row.image_url.startsWith('data:image/')) {
      const before = Buffer.from(row.image_url.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      totalBefore += before;

      const compressed = await compressBase64(row.image_url);
      if (compressed) {
        updates.image_url = compressed;
        totalAfter += Buffer.from(compressed.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      } else {
        totalAfter += before;
      }
    }

    // Сжимаем меню
    if (row.menu_images && Array.isArray(row.menu_images) && row.menu_images.length > 0) {
      console.log(`  📋 Меню: ${row.menu_images.length} фото`);
      const newMenu: string[] = [];

      for (const img of row.menu_images) {
        if (!img || !img.startsWith('data:image/')) {
          newMenu.push(img);
          continue;
        }

        const before = Buffer.from(img.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
        totalBefore += before;

        const compressed = await compressBase64(img);
        if (compressed) {
          newMenu.push(compressed);
          totalAfter += Buffer.from(compressed.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
        } else {
          newMenu.push(img);
          totalAfter += before;
        }
      }

      updates.menu_images = newMenu;
    }

    // Если есть что обновлять
    if (Object.keys(updates).length > 0) {
      const setParts: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (updates.image_url) {
        setParts.push(`image_url = $${i++}`);
        values.push(updates.image_url);
      }
      if (updates.menu_images) {
        setParts.push(`menu_images = $${i++}`);
        values.push(updates.menu_images);
      }

      values.push(row.id);
      await pool.query(`UPDATE restaurants SET ${setParts.join(', ')} WHERE id = $${i}`, values);
      updatedCount++;
      console.log(`  💾 Сохранено`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Обновлено ресторанов: ${updatedCount}`);
  console.log(`📊 Было:  ${Math.round(totalBefore / 1024 / 1024 * 10) / 10} МБ`);
  console.log(`📊 Стало: ${Math.round(totalAfter / 1024 / 1024 * 10) / 10} МБ`);
  console.log(`📉 Экономия: ${Math.round((1 - totalAfter / totalBefore) * 100)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await pool.end();
}

main().catch(e => {
  console.error('💥 Фатальная ошибка:', e);
  process.exit(1);
});