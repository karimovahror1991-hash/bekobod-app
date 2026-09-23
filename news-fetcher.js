import fetch from 'node-fetch';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fetchNews() {
  try {
    console.log('🔄 Начинаем сбор новостей...');

    const res = await fetch('https://freenewsapi.ai/v1/search?host=uz.sputniknews.ru&size=20');
    const data = await res.json();

    if (!data.articles || data.articles.length === 0) {
      console.log('📭 Новых новостей нет');
      return;
    }

    let added = 0;

    for (const article of data.articles) {
      const existing = await pool.query(
        'SELECT id FROM news WHERE source = $1',
        [article.link]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO news (category, title, content, source) 
           VALUES ($1, $2, $3, $4)`,
          [
            'uzbekistan',
            article.title,
            article.lead || null,
            article.link
          ]
        );
        added++;
      }
    }

    console.log(`✅ Добавлено новых новостей: ${added}`);
  } catch (error) {
    console.error('❌ Ошибка сбора новостей:', error);
  } finally {
    await pool.end();
  }
}

fetchNews();