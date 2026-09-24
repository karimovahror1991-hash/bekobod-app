import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Отправка сообщения в Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ============ HEALTH ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============ TELEGRAM WEBHOOK ============
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message?.from) {
      return res.sendStatus(200);
    }

    await pool.query(
      `INSERT INTO bot_users (user_id, username, first_name, last_interaction) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_interaction = NOW()`,
      [message.from.id, message.from.username || null, message.from.first_name || null]
    );

    if (message?.text === '/admin' && message.from.id === 988368940) {
      const messagesResult = await pool.query(
        "SELECT * FROM admin_messages WHERE status = 'new' ORDER BY created_at DESC LIMIT 10"
      );

      if (messagesResult.rows.length === 0) {
        await sendTelegramMessage(message.from.id, "📭 Yangi xabarlar yo'q");
      } else {
        let text = `📬 <b>Yangi xabarlar (${messagesResult.rows.length})</b>\n\n`;
        messagesResult.rows.forEach((msg, i) => {
          text += `<b>${i + 1}.</b> ${msg.user_name || 'Foydalanuvchi'} (ID: <code>${msg.user_id}</code>)\n`;
          text += `💬 ${msg.message}\n`;
          text += `📅 ${new Date(msg.created_at).toLocaleString('uz-UZ')}\n`;
          text += `✍️ Javob: <code>/reply ${msg.id} Ваш ответ</code>\n\n`;
        });
        await sendTelegramMessage(message.from.id, text);
      }
    }

          // Команда /add_event (с поддержкой фото)
    if ((message?.text?.startsWith('/add_event') || message?.caption?.startsWith('/add_event')) && message.from.id === 988368940) {
      const text = message.text || message.caption || '';
      const parts = text.split('|').map((s: string) => s.trim());
      
      if (parts.length < 4) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_event kategoriya | sarlavha | tavsif | sana | joy | telefon</code>\n\n` +
          `<b>Misol:</b>\n<code>/add_event madaniyat | Konsert | Shahar kuni | 2026-09-25 18:00 | Mustaqillik maydoni | +998901234567</code>\n\n` +
          `<b>Rasm bilan:</b> Rasm yuboring va izohga shu formatni yozing.\n\n` +
          `<b>Kategoriyalar:</b> madaniyat, sport, bayram, talim, rasmiy, bozor, tugilgan_kun`
        );
      } else {
        const category = parts[0].replace('/add_event', '').trim();
        const title = parts[1];
        const description = parts[2];
        const eventDate = parts[3];
        const location = parts[4] || null;
        const phone = parts[5] || null;

        // Получаем file_id фото, если оно есть
        let imageUrl = null;
        if (message.photo && message.photo.length > 0) {
          // Берём самое большое фото
          const largestPhoto = message.photo[message.photo.length - 1];
          imageUrl = largestPhoto.file_id;
        }

        const result = await pool.query(
          `INSERT INTO events (category, title, description, event_date, location, phone, image_url, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
          [category, title, description, eventDate, location, phone, imageUrl]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Tadbir qo'shildi!</b>\n\n` +
          `📌 ${title}\n` +
          `📅 ${eventDate}\n` +
          `📍 ${location || 'ko\'rsatilmagan'}\n` +
          `🖼 Rasm: ${imageUrl ? 'bor' : 'yo\'q'}\n` +
          `ID: <code>${result.rows[0].id}</code>`
        );
      }
    }

    // Команда /delete_event ID
    if (message?.text?.startsWith('/delete_event') && message.from.id === 988368940) {
      const parts = message.text.split(' ');
      const eventId = Number(parts[1]);

      if (!eventId) {
        await sendTelegramMessage(
          message.from.id,
          "❌ <code>/delete_event ID</code>\nMisol: <code>/delete_event 1</code>"
        );
      } else {
        const result = await pool.query(
          'DELETE FROM events WHERE id = $1 RETURNING title',
          [eventId]
        );

        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Tadbir topilmadi (ID: ${eventId})`);
        } else {
          await sendTelegramMessage(
            message.from.id,
            `✅ Tadbir o'chirildi: <b>${result.rows[0].title}</b>`
          );
        }
      }
    }

    if (message?.text?.startsWith('/reply') && message.from.id === 988368940) {
      const parts = message.text.split(' ');
      const messageId = Number(parts[1]);
      const replyText = parts.slice(2).join(' ');
    // Команда /delete_event ID
    if (message?.text?.startsWith('/delete_event') && message.from.id === 988368940) {
      const parts = message.text.split(' ');
      const eventId = Number(parts[1]);

      if (!eventId) {
        await sendTelegramMessage(
          message.from.id,
          "❌ <code>/delete_event ID</code>\nMisol: <code>/delete_event 1</code>"
        );
      } else {
        const result = await pool.query(
          'DELETE FROM events WHERE id = $1 RETURNING title',
          [eventId]
        );

        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Tadbir topilmadi (ID: ${eventId})`);
        } else {
          await sendTelegramMessage(
            message.from.id,
            `✅ Tadbir o'chirildi: <b>${result.rows[0].title}</b>`
          );
        }
      }
    }
      if (!messageId || !replyText) {
        await sendTelegramMessage(
          message.from.id,
          "❌ <code>/reply ID текст</code>\nMasalan: <code>/reply 5 Rahmat!</code>"
        );
      } else {
        await pool.query(
          "UPDATE admin_messages SET reply = $1, status = 'answered', replied_at = NOW() WHERE id = $2",
          [replyText, messageId]
        );

        const msgResult = await pool.query(
          'SELECT user_id FROM admin_messages WHERE id = $1',
          [messageId]
        );

        if (msgResult.rows.length > 0) {
          await sendTelegramMessage(
            msgResult.rows[0].user_id,
            `📩 <b>Administrator javobi:</b>\n\n${replyText}`
          );
        }

        await sendTelegramMessage(message.from.id, `✅ Javob yuborildi (ID: ${messageId})`);
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.sendStatus(200);
  }
});

// ============ TAXI ============
app.post('/api/taxi/create', async (req, res) => {
  try {
    const { driverName, driverPhone, direction, totalSeats, userId } = req.body;
    if (!driverName || !driverPhone || !direction) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    const result = await pool.query(
      `INSERT INTO taxi_rides (driver_name, driver_phone, direction, total_seats, booked_seats, status, user_id)
       VALUES ($1, $2, $3, $4, 0, 'active', $5) RETURNING *`,
      [driverName, driverPhone, direction, totalSeats || 4, userId || null]
    );
    res.json({ ride: result.rows[0] });
  } catch (error: any) {
    console.error('Taxi create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/taxi/list', async (req, res) => {
  try {
    const { direction } = req.query;
    let query = `SELECT * FROM taxi_rides WHERE status = 'active'`;
    const params: any[] = [];
    if (direction) {
      query += ` AND direction = $1`;
      params.push(direction);
    }
    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ rides: result.rows });
  } catch (error: any) {
    console.error('Taxi list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/taxi/book', async (req, res) => {
  try {
    const { rideId, passengerName, passengerPhone } = req.body;
    if (!rideId) return res.status(400).json({ error: 'Не указан рейс' });

    const rideResult = await pool.query('SELECT * FROM taxi_rides WHERE id = $1', [rideId]);
    if (rideResult.rows.length === 0) return res.status(404).json({ error: 'Рейс не найден' });

    const ride = rideResult.rows[0];
    if (ride.booked_seats >= ride.total_seats) return res.status(400).json({ error: 'Мест больше нет' });

    await pool.query(
      'INSERT INTO taxi_bookings (ride_id, passenger_name, passenger_phone) VALUES ($1, $2, $3)',
      [rideId, passengerName || null, passengerPhone || null]
    );

    const newBooked = ride.booked_seats + 1;
    const newStatus = newBooked >= ride.total_seats ? 'full' : 'active';
    await pool.query(
      'UPDATE taxi_rides SET booked_seats = $1, status = $2 WHERE id = $3',
      [newBooked, newStatus, rideId]
    );

    res.json({ ok: true, bookedSeats: newBooked, status: newStatus });
  } catch (error: any) {
    console.error('Taxi book error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/taxi/cancel-booking', async (req, res) => {
  try {
    const { rideId, passengerPhone } = req.body;
    if (!rideId) return res.status(400).json({ error: 'Не указан рейс' });

    if (passengerPhone) {
      await pool.query('DELETE FROM taxi_bookings WHERE ride_id = $1 AND passenger_phone = $2', [rideId, passengerPhone]);
    } else {
      await pool.query(
        `DELETE FROM taxi_bookings WHERE id = (SELECT id FROM taxi_bookings WHERE ride_id = $1 ORDER BY created_at DESC LIMIT 1)`,
        [rideId]
      );
    }

// Удалить рейс (только владелец)
app.post('/api/taxi/delete', async (req, res) => {
  try {
    const { rideId, userId } = req.body;
    if (!rideId || !userId) {
      return res.status(400).json({ error: 'Не указан рейс или пользователь' });
    }

    // Проверяем, что рейс принадлежит этому пользователю
    const rideResult = await pool.query(
      'SELECT user_id FROM taxi_rides WHERE id = $1',
      [rideId]
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Рейс не найден' });
    }

    if (Number(rideResult.rows[0].user_id) !== Number(userId)) {
      return res.status(403).json({ error: 'Bu reys sizga tegishli emas' });
    }

    await pool.query('DELETE FROM taxi_rides WHERE id = $1', [rideId]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Taxi delete error:', error);
    res.status(500).json({ error: error.message });
  }
});
    const rideResult = await pool.query('SELECT booked_seats FROM taxi_rides WHERE id = $1', [rideId]);
    if (rideResult.rows.length > 0) {
      const newBooked = Math.max(0, rideResult.rows[0].booked_seats - 1);
      const newStatus = newBooked < 4 ? 'active' : 'full';
      await pool.query('UPDATE taxi_rides SET booked_seats = $1, status = $2 WHERE id = $3', [newBooked, newStatus, rideId]);
    }

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/taxi/rate', async (req, res) => {
  try {
    const { rideId, rating } = req.body;
    if (!rideId || !rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Неверная оценка' });
    await pool.query('INSERT INTO taxi_ratings (ride_id, rating) VALUES ($1, $2)', [rideId, rating]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Taxi rate error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/taxi/rating/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const result = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM taxi_ratings WHERE ride_id = $1',
      [rideId]
    );
    const avg = result.rows[0].avg_rating ? Number(result.rows[0].avg_rating) : 0;
    const count = Number(result.rows[0].count);
    res.json({ avgRating: Math.round(avg * 10) / 10, count });
  } catch (error: any) {
    console.error('Taxi rating error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/taxi/register', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Заполните имя и телефон' });

    const existing = await pool.query('SELECT * FROM taxi_drivers WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: `Bu raqam allaqachon ${existing.rows[0].name} nomiga ro'yxatdan o'tgan.`,
        alreadyExists: true,
        driver: existing.rows[0]
      });
    }

    const result = await pool.query(
      'INSERT INTO taxi_drivers (name, phone) VALUES ($1, $2) RETURNING *',
      [name, phone]
    );
    res.json({ driver: result.rows[0], alreadyExists: false });
  } catch (error: any) {
    console.error('Taxi register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/taxi/drivers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM taxi_drivers ORDER BY name ASC');
    res.json({ drivers: result.rows });
  } catch (error: any) {
    console.error('Taxi drivers error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/taxi/driver-rating/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const result = await pool.query(
      `SELECT AVG(r.rating) as avg_rating, COUNT(*) as count 
       FROM taxi_ratings r
       JOIN taxi_rides tr ON r.ride_id = tr.id
       WHERE tr.driver_phone = $1`,
      [phone]
    );
    const avg = result.rows[0].avg_rating ? Number(result.rows[0].avg_rating) : 0;
    const count = Number(result.rows[0].count);
    res.json({ avgRating: Math.round(avg * 10) / 10, count });
  } catch (error: any) {
    console.error('Driver rating error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SERVICES ============
app.post('/api/services/register', async (req, res) => {
  try {
    const { name, phone, category, description } = req.body;
    if (!name || !phone || !category) return res.status(400).json({ error: 'Заполните имя, телефон и категорию' });

    const existing = await pool.query('SELECT * FROM service_providers WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.json({ provider: existing.rows[0], alreadyExists: true });
    }

    const result = await pool.query(
      'INSERT INTO service_providers (name, phone, category, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, category, description || null]
    );
    res.json({ provider: result.rows[0], alreadyExists: false });
  } catch (error: any) {
    console.error('Service register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/list', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM service_providers';
    const params: any[] = [];
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ providers: result.rows });
  } catch (error: any) {
    console.error('Services list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services/rate', async (req, res) => {
  try {
    const { providerId, rating } = req.body;
    if (!providerId || !rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Неверная оценка' });
    await pool.query('INSERT INTO service_ratings (provider_id, rating) VALUES ($1, $2)', [providerId, rating]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Service rate error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/rating/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const result = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM service_ratings WHERE provider_id = $1',
      [providerId]
    );
    const avg = result.rows[0].avg_rating ? Number(result.rows[0].avg_rating) : 0;
    const count = Number(result.rows[0].count);
    res.json({ avgRating: Math.round(avg * 10) / 10, count });
  } catch (error: any) {
    console.error('Service rating error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN MESSAGES ============
app.post('/api/admin/message', async (req, res) => {
  try {
    const { userId, userName, message } = req.body;
    if (!userId || !message || !message.trim()) return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    const result = await pool.query(
      'INSERT INTO admin_messages (user_id, user_name, message) VALUES ($1, $2, $3) RETURNING *',
      [userId, userName || null, message.trim()]
    );
    res.json({ message: result.rows[0] });
  } catch (error: any) {
    console.error('Admin message error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/my-messages', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Не указан пользователь' });
    const result = await pool.query(
      'SELECT * FROM admin_messages WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ messages: result.rows });
  } catch (error: any) {
    console.error('My messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/all-messages', async (req, res) => {
  try {
    const { adminId } = req.query;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    const result = await pool.query('SELECT * FROM admin_messages ORDER BY created_at DESC LIMIT 50');
    res.json({ messages: result.rows });
  } catch (error: any) {
    console.error('All messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reply', async (req, res) => {
  try {
    const { adminId, messageId, reply } = req.body;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    if (!messageId || !reply || !reply.trim()) return res.status(400).json({ error: 'Ответ не может быть пустым' });
    await pool.query(
      "UPDATE admin_messages SET reply = $1, status = 'answered', replied_at = NOW() WHERE id = $2",
      [reply.trim(), messageId]
    );
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Admin reply error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ JOBS (VAKANSIYA) ============
app.post('/api/jobs/create', async (req, res) => {
  try {
    const { companyName, position, salary, description, phone, category } = req.body;
    if (!companyName || !position || !phone) return res.status(400).json({ error: 'Заполните компанию, должность и телефон' });
    const result = await pool.query(
      'INSERT INTO jobs (company_name, position, salary, description, phone, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [companyName, position, salary || null, description || null, phone, category || 'boshqa']
    );
    res.json({ job: result.rows[0] });
  } catch (error: any) {
    console.error('Job create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/list', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs WHERE status = 'active' ORDER BY created_at DESC");
    res.json({ jobs: result.rows });
  } catch (error: any) {
    console.error('Jobs list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ RESTAURANTS ============
app.get('/api/restaurants/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY created_at DESC');
    res.json({ restaurants: result.rows });
  } catch (error: any) {
    console.error('Restaurants list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/restaurants/create', async (req, res) => {
  try {
    const { adminId, name, category, address, phone, description } = req.body;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    if (!name) return res.status(400).json({ error: 'Укажите название' });
    const result = await pool.query(
      'INSERT INTO restaurants (name, category, address, phone, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category || null, address || null, phone || null, description || null]
    );
    res.json({ restaurant: result.rows[0] });
  } catch (error: any) {
    console.error('Restaurant create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ NEWS ============

// Список новостей
app.get('/api/news/list', async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM news';
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json({ news: result.rows });
  } catch (error: any) {
    console.error('News list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить новость (только для админа)
app.post('/api/news/create', async (req, res) => {
  try {
    const { adminId, category, title, content, imageUrl, source } = req.body;

    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    if (!category || !title) {
      return res.status(400).json({ error: 'Укажите категорию и заголовок' });
    }

    const result = await pool.query(
      'INSERT INTO news (category, title, content, image_url, source) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category, title, content || null, imageUrl || null, source || null]
    );

    res.json({ news: result.rows[0] });
  } catch (error: any) {
    console.error('News create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Автоматический сбор новостей (Sputnik через Telegram)
app.get('/api/fetch-news', async (req, res) => {
  try {
    const response = await fetch('https://t.me/s/sputnik_lotin');
    const html = await response.text();

    // Разбиваем на сообщения
    const messages = html.split('tgme_widget_message_wrap').slice(1);
    let added = 0;

    for (const msg of messages.slice(0, 20)) {
      // Текст поста
      const textMatch = msg.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
      // Ссылка на пост
      const linkMatch = msg.match(/data-post="([^"]*)"/);

      if (!textMatch || !linkMatch) continue;

      // Очищаем текст от HTML
      let text = textMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Первая строка — заголовок
      const lines = text.split('\n').filter((l: string) => l.trim());
      const title = lines[0] ? lines[0].substring(0, 200) : 'Yangilik';
      const content = lines.slice(1).join('\n').substring(0, 1000);

      const link = `https://t.me/${linkMatch[1]}`;

      const existing = await pool.query(
        'SELECT id FROM news WHERE source = $1',
        [link]
      );

      if (existing.rows.length === 0) {
        let category = 'uzbekistan';
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('бекабад') || lowerTitle.includes('bekobod')) {
          category = 'bekobod';
        }

        await pool.query(
          `INSERT INTO news (category, title, content, source) VALUES ($1, $2, $3, $4)`,
          [category, title, content, link]
        );
        added++;
      }
    }

    res.json({ added });
  } catch (error: any) {
    console.error('Fetch news error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Автоматический сбор мировых новостей (BBC через Telegram)
app.get('/api/fetch-world-news', async (req, res) => {
  try {
    const response = await fetch('https://t.me/s/bbcuzbek');
    const html = await response.text();

    const messages = html.split('tgme_widget_message_wrap').slice(1);
    let added = 0;

    for (const msg of messages.slice(0, 20)) {
      const textMatch = msg.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
      const linkMatch = msg.match(/data-post="([^"]*)"/);

      if (!textMatch || !linkMatch) continue;

      let text = textMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      const lines = text.split('\n').filter((l: string) => l.trim());
      const title = lines[0] ? lines[0].substring(0, 200) : 'Jahon yangiligi';
      const content = lines.slice(1).join('\n').substring(0, 1000);

      const link = `https://t.me/${linkMatch[1]}`;

      const existing = await pool.query(
        'SELECT id FROM news WHERE source = $1',
        [link]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO news (category, title, content, source) VALUES ($1, $2, $3, $4)`,
          ['jahon', title, content, link]
        );
        added++;
      }
    }

    res.json({ added });
  } catch (error: any) {
    console.error('Fetch world news error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ EVENTS (TADBIRLAR) ============

// Список событий
app.get('/api/events/list', async (req, res) => {
  try {
    const { category } = req.query;

    let query = "SELECT * FROM events WHERE status = 'active'";
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY event_date ASC';

    const result = await pool.query(query, params);
    
    // Преобразуем file_id в URL для фото
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const events = await Promise.all(result.rows.map(async (event) => {
      if (event.image_url && !event.image_url.startsWith('http') && botToken) {
        try {
          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${event.image_url}`);
          const fileData = await fileRes.json();
          if (fileData.ok) {
            event.image_url = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          }
        } catch (e) {
          console.error('File fetch error:', e);
        }
      }
      return event;
    }));

    res.json({ events });
  } catch (error: any) {
    console.error('Events list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отправить заявку на поздравление (для дней рождения)
app.post('/api/events/birthday-request', async (req, res) => {
  try {
    const { userId, userName, name, birthDate, message, phone } = req.body;

    if (!name || !birthDate || !message) {
      return res.status(400).json({ error: 'Заполните имя, дату и поздравление' });
    }

    const result = await pool.query(
      `INSERT INTO events (category, title, description, event_date, phone, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      ['tugilgan_kun', name, message, birthDate, phone || null]
    );

    // Уведомляем админа
    await sendTelegramMessage(
      988368940,
      `🎂 <b>Yangi tug'ilgan kun so'rovi!</b>\n\n` +
      `👤 Ism: ${name}\n` +
      `📅 Sana: ${birthDate}\n` +
      `💬 Xabar: ${message}\n` +
      `📞 Telefon: ${phone || 'ko\'rsatilmagan'}\n\n` +
      `✅ Tasdiqlash: <code>/approve_event ${result.rows[0].id}</code>`
    );

    res.json({ ok: true, event: result.rows[0] });
  } catch (error: any) {
    console.error('Birthday request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Одобрить событие (только для админа)
app.post('/api/events/approve', async (req, res) => {
  try {
    const { adminId, eventId } = req.body;

    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    await pool.query(
      "UPDATE events SET status = 'active' WHERE id = $1",
      [eventId]
    );

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Event approve error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ STATIC (ЛОВУШКА В САМОМ КОНЦЕ!) ============
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Bekobod server running on port ${PORT}`);
});