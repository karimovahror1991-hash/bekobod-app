import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============ ADMINS ============
const SUPER_ADMIN = 988368940;
const ADMINS = [988368940, 259258146]; // главный + второй админ
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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

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
 // Команда /add_place (рестораны, кафе и т.д.)
    if (message?.text?.startsWith('/add_place') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split('|').map((s: string) => s.trim());
      
      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_place kategoriya | nomi | manzil | telefon | tavsif</code>\n\n` +
          `<b>Kategoriyalar:</b> fastfood, milliy, kafe, restoran, chayxana, shirinlik, yarim_tayyor\n\n` +
          `<b>Misol:</b>\n<code>/add_place fastfood | AGASI FOOD | Bunyodkor 55 | +998903277714 | Mazali taomlar</code>`
        );
      } else {
        const category = parts[0].replace('/add_place', '').trim();
        const name = parts[1];
        const address = parts[2] || null;
        const phone = parts[3] || null;
        const description = parts[4] || null;

        const result = await pool.query(
          'INSERT INTO restaurants (name, category, address, phone, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [name, category, address, phone, description]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Qo'shildi!</b>\n\n📌 ${name}\n📍 ${address || "yo'q"}\n📞 ${phone || "yo'q"}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }

    // Команда /delete_place ID
    if (message?.text?.startsWith('/delete_place') && ADMINS.includes(message.from.id)) {
      const placeId = Number(message.text.split(' ')[1]);

      if (!placeId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_place ID");
      } else {
        const result = await pool.query('DELETE FROM restaurants WHERE id = $1 RETURNING name', [placeId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${placeId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].name}</b>`);
        }
      }
    }
    await pool.query(
      `INSERT INTO bot_users (user_id, username, first_name, last_interaction) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_interaction = NOW()`,
      [message.from.id, message.from.username || null, message.from.first_name || null]
    );

    if (message?.text === '/admin' && ADMINS.includes(message.from.id)) {
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

    if ((message?.text?.startsWith('/add_event') || message?.caption?.startsWith('/add_event')) && ADMINS.includes(message.from.id)) {
      const text = message.text || message.caption || '';
      const parts = text.split('|').map((s: string) => s.trim());
      if (parts.length < 4) {
        await sendTelegramMessage(message.from.id, `❌ Format: /add_event kategoriya | sarlavha | tavsif | sana | joy | telefon`);
      } else {
        const category = parts[0].replace('/add_event', '').trim();
        const title = parts[1];
        const description = parts[2];
        const eventDate = parts[3];
        const location = parts[4] || null;
        const phone = parts[5] || null;
        let imageUrl = null;
        if (message.photo && message.photo.length > 0) {
          imageUrl = message.photo[message.photo.length - 1].file_id;
        }
        const result = await pool.query(
          `INSERT INTO events (category, title, description, event_date, location, phone, image_url, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
          [category, title, description, eventDate, location, phone, imageUrl]
        );
        await sendTelegramMessage(message.from.id, `✅ Tadbir qo'shildi! ID: ${result.rows[0].id}`);
      }
    }

    if (message?.text?.startsWith('/delete_event') && ADMINS.includes(message.from.id)) {
      const eventId = Number(message.text.split(' ')[1]);
      if (!eventId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_event ID");
      } else {
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING title', [eventId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Tadbir topilmadi (ID: ${eventId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ Tadbir o'chirildi: ${result.rows[0].title}`);
        }
      }
    }

    if (message?.text?.startsWith('/reply') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split(' ');
      const messageId = Number(parts[1]);
      const replyText = parts.slice(2).join(' ');
      if (!messageId || !replyText) {
        await sendTelegramMessage(message.from.id, "❌ /reply ID текст");
      } else {
        await pool.query("UPDATE admin_messages SET reply = $1, status = 'answered', replied_at = NOW() WHERE id = $2", [replyText, messageId]);
        const msgResult = await pool.query('SELECT user_id FROM admin_messages WHERE id = $1', [messageId]);
        if (msgResult.rows.length > 0) {
          await sendTelegramMessage(msgResult.rows[0].user_id, `📩 Administrator javobi:\n\n${replyText}`);
        }
        await sendTelegramMessage(message.from.id, `✅ Javob yuborildi (ID: ${messageId})`);
      }
    }

    // Команда /add_contact
    if (message?.text?.startsWith('/add_contact') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split('|').map((s: string) => s.trim());
      
      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_contact kategoriya | nomi | telefon | manzil</code>\n\n` +
          `<b>Kategoriyalar:</b> favqulodda, hokimiyat, aloqa, banklar, soliq, boshqa\n\n` +
          `<b>Misol:</b>\n<code>/add_contact banklar | Xalq banki | +998712102002 | Navoiy 5</code>`
        );
      } else {
        const category = parts[0].replace('/add_contact', '').trim();
        const name = parts[1];
        const phone = parts[2] || null;
        const address = parts[3] || null;

        const result = await pool.query(
          'INSERT INTO contacts (category, name, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
          [category, name, phone, address]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Kontakt qo'shildi!</b>\n\n📌 ${name}\n📂 ${category}\n📞 ${phone || "yo'q"}\n📍 ${address || "yo'q"}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }

    // Команда /delete_contact ID
    if (message?.text?.startsWith('/delete_contact') && ADMINS.includes(message.from.id)) {
      const contactId = Number(message.text.split(' ')[1]);

      if (!contactId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_contact ID");
      } else {
        const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING name', [contactId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${contactId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].name}</b>`);
        }
      }
    }
    if (message?.text?.startsWith('/add_med') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split('|').map((s: string) => s.trim());
      if (parts.length < 3) {
        await sendTelegramMessage(message.from.id, `❌ /add_med tur | nomi | manzil | telefon | tavsif`);
      } else {
        const type = parts[0].replace('/add_med', '').trim();
        const name = parts[1];
        const address = parts[2] || null;
        const phone = parts[3] || null;
        const description = parts[4] || null;
        const result = await pool.query(
          'INSERT INTO doctors (type, name, specialty, phone, address, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [type, name, description || type, phone, address, null]
        );
        await sendTelegramMessage(message.from.id, `✅ ${type} qo'shildi! ID: ${result.rows[0].id}`);
      }
    }

    if (message?.text?.startsWith('/delete_med') && ADMINS.includes(message.from.id)) {
      const medId = Number(message.text.split(' ')[1]);
      if (!medId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_med ID");
      } else {
        const result = await pool.query('DELETE FROM doctors WHERE id = $1 RETURNING name', [medId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${medId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: ${result.rows[0].name}`);
        }
      }
    }
    
    // Команда /add_news (ручное добавление новости)
    if (message?.text?.startsWith('/add_news') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split('|').map((s: string) => s.trim());

      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_news kategoriya | sarlavha | matn | manba</code>\n\n` +
          `<b>Kategoriyalar:</b> bekobod, jahon\n\n` +
          `<b>Misol:</b>\n<code>/add_news bekobod | Yangi park ochildi | Shahar markazida yangi park ochildi | https://t.me/...</code>`
        );
      } else {
        const category = parts[0].replace('/add_news', '').trim();
        const title = parts[1];
        const content = parts[2] || null;
        const source = parts[3] || null;

        const result = await pool.query(
          `INSERT INTO news (category, title, content, source) VALUES ($1, $2, $3, $4) RETURNING *`,
          [category, title, content, source]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Yangilik qo'shildi!</b>\n\n📂 ${category}\n📰 ${title}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }
    // Команда /add_news с фото или видео (через caption)
if ((message?.caption?.startsWith('/add_news')) && ADMINS.includes(message.from.id)) {
  const parts = message.caption.split('|').map((s: string) => s.trim());

  if (parts.length < 3) {
    await sendTelegramMessage(
      message.from.id,
      `❌ <b>Format (s фото/видео):</b>\n<code>/add_news kategoriya | sarlavha | matn | manba</code>\n\n` +
      `<b>Отправь фото или видео с этой подписью.</b>`
    );
  } else {
    const category = parts[0].replace('/add_news', '').trim();
    const title = parts[1];
    const content = parts[2] || null;
    const source = parts[3] || null;

    // Получаем file_id
    let fileId = null;
    let mediaType = null;

    if (message.photo && message.photo.length > 0) {
      // Берём самый большой размер
      fileId = message.photo[message.photo.length - 1].file_id;
      mediaType = 'photo';
    } else if (message.video) {
      fileId = message.video.file_id;
      mediaType = 'video';
    }

    const result = await pool.query(
      `INSERT INTO news (category, title, content, source, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [category, title, content, source, fileId]
    );

    await sendTelegramMessage(
      message.from.id,
      `✅ <b>Yangilik qo'shildi!</b>\n\n📂 ${category}\n📰 ${title}\n🖼 ${mediaType || 'yo\'q'}\nID: <code>${result.rows[0].id}</code>`
    );
  }
}
    // Команда /delete_news ID
    if (message?.text?.startsWith('/delete_news') && ADMINS.includes(message.from.id)) {
      const newsId = Number(message.text.split(' ')[1]);

      if (!newsId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_news ID");
      } else {
        const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING title', [newsId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${newsId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].title}</b>`);
        }
      }
    }
        // Команда /add_book
    if (message?.text?.startsWith('/add_book') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split('|').map((s: string) => s.trim());

      if (parts.length < 4) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_book kategoriya | muallif | nomi | fayl_link | tavsif</code>\n\n` +
          `<b>Kategoriyalar:</b> badiiy, diniy, ilmiy, bolalar\n\n` +
          `<b>Misol:</b>\n<code>/add_book badiiy | Cho'lpon | Kecha va kunduz | https://t.me/... | Roman</code>`
        );
      } else {
        const category = parts[0].replace('/add_book', '').trim();
        const author = parts[1];
        const title = parts[2];
        const fileUrl = parts[3];
        const description = parts[4] || null;

        const result = await pool.query(
          `INSERT INTO books (category, title, author, description, file_url)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [category, title, author, description, fileUrl]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Kitob qo'shildi!</b>\n\n📂 ${category}\n📚 ${title}\n✍️ ${author}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }
    // Команда /add_city_taxi
    if (message?.text?.startsWith('/add_city_taxi') && ADMINS.includes(message.from.id)) {
      const parts = message.text.split('|').map((s: string) => s.trim());

      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_city_taxi nomi | telefon | tavsif</code>\n\n` +
          `<b>Misol:</b>\n<code>/add_city_taxi Bekobod Taxi | +998901234567 | Tezkor xizmat</code>`
        );
      } else {
        const name = parts[0].replace('/add_city_taxi', '').trim();
        const phone = parts[1];
        const description = parts[2] || null;

        const result = await pool.query(
          'INSERT INTO city_taxi (name, phone, description) VALUES ($1, $2, $3) RETURNING *',
          [name, phone, description]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Shahar taksi qo'shildi!</b>\n\n📌 ${name}\n📞 ${phone}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }

    // Команда /delete_city_taxi ID
    if (message?.text?.startsWith('/delete_city_taxi') && ADMINS.includes(message.from.id)) {
      const taxiId = Number(message.text.split(' ')[1]);
      if (!taxiId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_city_taxi ID");
      } else {
        const result = await pool.query('DELETE FROM city_taxi WHERE id = $1 RETURNING name', [taxiId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${taxiId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].name}</b>`);
        }
      }
    }
    // Команда /delete_book ID
    if (message?.text?.startsWith('/delete_book') && ADMINS.includes(message.from.id)) {
      const bookId = Number(message.text.split(' ')[1]);

      if (!bookId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_book ID");
      } else {
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING title', [bookId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${bookId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].title}</b>`);
        }
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
    if (!driverName || !driverPhone || !direction) return res.status(400).json({ error: 'Заполните все поля' });
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
    const { rideId, passengerName, passengerPhone, userId } = req.body;
    if (!rideId) return res.status(400).json({ error: 'Не указан рейс' });
    const rideResult = await pool.query('SELECT * FROM taxi_rides WHERE id = $1', [rideId]);
    if (rideResult.rows.length === 0) return res.status(404).json({ error: 'Рейс не найден' });
    const ride = rideResult.rows[0];
    if (ride.booked_seats >= ride.total_seats) return res.status(400).json({ error: 'Мест больше нет' });
    await pool.query(
      'INSERT INTO taxi_bookings (ride_id, passenger_name, passenger_phone, user_id) VALUES ($1, $2, $3, $4)',
      [rideId, passengerName || null, passengerPhone || null, userId || null]
    );
    const newBooked = ride.booked_seats + 1;
    const newStatus = newBooked >= ride.total_seats ? 'full' : 'active';
    await pool.query('UPDATE taxi_rides SET booked_seats = $1, status = $2 WHERE id = $3', [newBooked, newStatus, rideId]);
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
      await pool.query(`DELETE FROM taxi_bookings WHERE id = (SELECT id FROM taxi_bookings WHERE ride_id = $1 ORDER BY created_at DESC LIMIT 1)`, [rideId]);
    }
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

app.post('/api/taxi/delete', async (req, res) => {
  try {
    const { rideId, userId } = req.body;
    if (!rideId || !userId) return res.status(400).json({ error: 'Не указан рейс или пользователь' });
    const rideResult = await pool.query('SELECT user_id, direction FROM taxi_rides WHERE id = $1', [rideId]);
    if (rideResult.rows.length === 0) return res.status(404).json({ error: 'Рейс не найден' });
    if (Number(rideResult.rows[0].user_id) !== Number(userId)) return res.status(403).json({ error: 'Bu reys sizga tegishli emas' });

    const direction = rideResult.rows[0].direction;

    // Находим всех пассажиров этого рейса
    const passengers = await pool.query('SELECT user_id FROM taxi_bookings WHERE ride_id = $1 AND user_id IS NOT NULL', [rideId]);

    // Удаляем рейс и бронирования
    await pool.query('DELETE FROM taxi_bookings WHERE ride_id = $1', [rideId]);
    await pool.query('DELETE FROM taxi_rides WHERE id = $1', [rideId]);

    // Отправляем уведомления пассажирам
    for (const p of passengers.rows) {
      await sendTelegramMessage(
        p.user_id,
        `⚠️ <b>Reys bekor qilindi!</b>\n\n🚗 Yo'nalish: <b>${direction}</b>\n\nHaydovchi reysni bekor qildi. Iltimos, boshqa reysni tanlang.`
      );
    }

    res.json({ ok: true, notified: passengers.rows.length });
  } catch (error: any) {
    console.error('Taxi delete error:', error);
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
    const result = await pool.query('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM taxi_ratings WHERE ride_id = $1', [rideId]);
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
    const { name, phone, userId } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Заполните имя и телефон' });
    const existing = await pool.query('SELECT * FROM taxi_drivers WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Bu raqam allaqachon ${existing.rows[0].name} nomiga ro'yxatdan o'tgan.`, alreadyExists: true, driver: existing.rows[0] });
    }
    const result = await pool.query('INSERT INTO taxi_drivers (name, phone, user_id) VALUES ($1, $2, $3) RETURNING *', [name, phone, userId || null]);
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
      `SELECT AVG(r.rating) as avg_rating, COUNT(*) as count FROM taxi_ratings r JOIN taxi_rides tr ON r.ride_id = tr.id WHERE tr.driver_phone = $1`,
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
// ============ CITY TAXI (городское такси) ============

// Список городских такси
app.get('/api/city-taxi/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM city_taxi ORDER BY name ASC');
    res.json({ taxis: result.rows });
  } catch (error: any) {
    console.error('City taxi list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить городское такси (только админ)
app.post('/api/city-taxi/create', async (req, res) => {
  try {
    const { adminId, name, phone, description } = req.body;
    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    if (!name || !phone) {
      return res.status(400).json({ error: 'Укажите название и телефон' });
    }
    const result = await pool.query(
      'INSERT INTO city_taxi (name, phone, description) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, description || null]
    );
    res.json({ taxi: result.rows[0] });
  } catch (error: any) {
    console.error('City taxi create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить городское такси (только админ)
app.post('/api/city-taxi/delete', async (req, res) => {
  try {
    const { adminId, taxiId } = req.body;
    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const result = await pool.query('DELETE FROM city_taxi WHERE id = $1 RETURNING name', [taxiId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topilmadi' });
    }
    res.json({ ok: true, name: result.rows[0].name });
  } catch (error: any) {
    console.error('City taxi delete error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ SERVICES ============
app.post('/api/services/register', async (req, res) => {
  try {
    const { name, phone, category, description } = req.body;
    if (!name || !phone || !category) return res.status(400).json({ error: 'Заполните имя, телефон и категорию' });
    const existing = await pool.query('SELECT * FROM service_providers WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) return res.json({ provider: existing.rows[0], alreadyExists: true });
    const result = await pool.query('INSERT INTO service_providers (name, phone, category, description) VALUES ($1, $2, $3, $4) RETURNING *', [name, phone, category, description || null]);
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
    const result = await pool.query('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM service_ratings WHERE provider_id = $1', [providerId]);
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
    const result = await pool.query('INSERT INTO admin_messages (user_id, user_name, message) VALUES ($1, $2, $3) RETURNING *', [userId, userName || null, message.trim()]);
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
    const result = await pool.query('SELECT * FROM admin_messages WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
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
    await pool.query("UPDATE admin_messages SET reply = $1, status = 'answered', replied_at = NOW() WHERE id = $2", [reply.trim(), messageId]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Admin reply error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CONTACTS (SHAHAR TELEFONLARI) ============

app.get('/api/contacts/list', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM contacts';
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    res.json({ contacts: result.rows });
  } catch (error: any) {
    console.error('Contacts list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts/create', async (req, res) => {
  try {
    const { adminId, category, name, phone, address } = req.body;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    if (!category || !name) return res.status(400).json({ error: 'Укажите категорию и название' });
    const result = await pool.query(
      'INSERT INTO contacts (category, name, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, name, phone || null, address || null]
    );
    res.json({ contact: result.rows[0] });
  } catch (error: any) {
    console.error('Contact create error:', error);
    res.status(500).json({ error: error.message });
  }
});
   // ============ JOBS (VAKANSIYA) ============
app.post('/api/jobs/create', async (req, res) => {
  try {
    const { companyName, position, salary, description, phone, category } = req.body;
    if (!companyName || !position || !phone) return res.status(400).json({ error: 'Заполните компанию, должность и телефон' });
    const result = await pool.query('INSERT INTO jobs (company_name, position, salary, description, phone, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [companyName, position, salary || null, description || null, phone, category || 'boshqa']);
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
    const result = await pool.query('INSERT INTO restaurants (name, category, address, phone, description) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, category || null, address || null, phone || null, description || null]);
    res.json({ restaurant: result.rows[0] });
  } catch (error: any) {
    console.error('Restaurant create error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Оценить ресторан
app.post('/api/restaurants/rate', async (req, res) => {
  try {
    const { restaurantId, rating, userId } = req.body;
    if (!restaurantId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Неверная оценка' });
    }
    await pool.query(
      'INSERT INTO restaurant_ratings (restaurant_id, rating, user_id) VALUES ($1, $2, $3)',
      [restaurantId, rating, userId || null]
    );
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Restaurant rate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить средний рейтинг ресторана
app.get('/api/restaurants/rating/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const result = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM restaurant_ratings WHERE restaurant_id = $1',
      [restaurantId]
    );
    const avg = result.rows[0].avg_rating ? Number(result.rows[0].avg_rating) : 0;
    const count = Number(result.rows[0].count);
    res.json({ avgRating: Math.round(avg * 10) / 10, count });
  } catch (error: any) {
    console.error('Restaurant rating error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ NEWS ============
   app.get('/api/news/list', async (req, res) => {
  try {
        // Удаляем новости старше 3 дней
    await pool.query(`DELETE FROM news WHERE created_at < NOW() - INTERVAL '3 days'`);
        // Удаляем новости категории bekobod старше 30 дней
    await pool.query(`DELETE FROM news WHERE category = 'bekobod' AND created_at < NOW() - INTERVAL '30 days'`);
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

app.post('/api/news/create', async (req, res) => {
  try {
    const { adminId, category, title, content, imageUrl, source } = req.body;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    if (!category || !title) return res.status(400).json({ error: 'Укажите категорию и заголовок' });
    const result = await pool.query('INSERT INTO news (category, title, content, image_url, source) VALUES ($1, $2, $3, $4, $5) RETURNING *', [category, title, content || null, imageUrl || null, source || null]);
    res.json({ news: result.rows[0] });
  } catch (error: any) {
    console.error('News create error:', error);
    res.status(500).json({ error: error.message });
  }
});

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

      // Парсим фото из поста
      let imageUrl: string | null = null;
      const photoMatch = msg.match(/background-image:url\('([^']+)'\)/);
      if (photoMatch) {
        imageUrl = photoMatch[1];
      }

      const existing = await pool.query('SELECT id FROM news WHERE source = $1', [link]);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO news (category, title, content, source, image_url) VALUES ($1, $2, $3, $4, $5)`,
          ['jahon', title, content, link, imageUrl]
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

// ============ EVENTS ============
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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const events = await Promise.all(result.rows.map(async (event) => {
      if (event.image_url && !event.image_url.startsWith('http') && botToken) {
        try {
          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${event.image_url}`);
          const fileData = await fileRes.json();
          if (fileData.ok) {
            event.image_url = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          }
        } catch (e) {}
      }
      return event;
    }));
    res.json({ events });
  } catch (error: any) {
    console.error('Events list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/birthday-request', async (req, res) => {
  try {
    const { userId, userName, name, birthDate, message, phone } = req.body;
    if (!name || !birthDate || !message) return res.status(400).json({ error: 'Заполните имя, дату и поздравление' });
    const result = await pool.query(
      `INSERT INTO events (category, title, description, event_date, phone, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      ['tugilgan_kun', name, message, birthDate, phone || null]
    );
    await sendTelegramMessage(988368940, `🎂 Yangi tug'ilgan kun so'rovi! Ism: ${name}, Sana: ${birthDate}, Xabar: ${message}, Tel: ${phone || 'yo\'q'}\n\nTasdiqlash: /approve_event ${result.rows[0].id}`);
    res.json({ ok: true, event: result.rows[0] });
  } catch (error: any) {
    console.error('Birthday request error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/approve', async (req, res) => {
  try {
    const { adminId, eventId } = req.body;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    await pool.query("UPDATE events SET status = 'active' WHERE id = $1", [eventId]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Event approve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ IBODAT (NAMOZ VAQTLARI) ============
app.get('/api/prayer-times', async (req, res) => {
  try {
    const response = await fetch('https://api.aladhan.com/v1/timings?latitude=40.22&longitude=69.22&method=2');
    const data = await response.json();
    if (data.code !== 200) throw new Error('API error');
    const timings = data.data.timings;
    const hijri = data.data.date.hijri;
    const gregorian = data.data.date.gregorian;
    res.json({
      timings: { Fajr: timings.Fajr, Sunrise: timings.Sunrise, Dhuhr: timings.Dhuhr, Asr: timings.Asr, Maghrib: timings.Maghrib, Isha: timings.Isha },
      hijri: { day: hijri.day, month: hijri.month.en, year: hijri.year },
      gregorian: { date: gregorian.date, weekday: gregorian.weekday.en },
    });
  } catch (error: any) {
    console.error('Prayer times error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ KURS VALYUT ============
app.get('/api/exchange-rates', async (req, res) => {
  try {
    const response = await fetch('https://cbu.uz/ru/arkhiv-kursov-valyut/json/');
    const data = await response.json();

    const usd = data.find((item: any) => item.Ccy === 'USD');
    const eur = data.find((item: any) => item.Ccy === 'EUR');
    const rub = data.find((item: any) => item.Ccy === 'RUB');

    res.json({
      usd: usd ? Number(usd.Rate) : null,
      eur: eur ? Number(eur.Rate) : null,
      rub: rub ? Number(rub.Rate) : null,
      date: usd ? usd.Date : null,
    });
  } catch (error: any) {
    console.error('Exchange rates error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ SURALAR ============
app.get('/api/surahs', async (req, res) => {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    if (data.code !== 200) throw new Error('API error');
    res.json({ surahs: data.data });
  } catch (error: any) {
    console.error('Surahs error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/surah/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}/editions/en.transliteration,ru.kuliev`);
    const data = await response.json();
    if (data.code !== 200) throw new Error('API error');
    const transliteration = data.data[0];
    const translation = data.data[1];
    const ayahs = transliteration.ayahs.map((ayah: any, index: number) => ({
      number: ayah.numberInSurah,
      transliteration: ayah.text || '',
      translation: translation.ayahs[index]?.text || '',
    }));
    res.json({
      number: transliteration.number,
      name: transliteration.name,
      englishName: transliteration.englishName,
      englishNameTranslation: transliteration.englishNameTranslation,
      revelationType: transliteration.revelationType,
      numberOfAyahs: transliteration.numberOfAyahs,
      ayahs,
    });
  } catch (error: any) {
    console.error('Surah error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ TIBBIYOT ============
app.get('/api/med/list', async (req, res) => {
  try {
    const { type, specialty } = req.query;
    let query = 'SELECT * FROM doctors';
    const params: any[] = [];
    const conditions: string[] = [];
    if (type && type !== 'all') {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }
    if (specialty && specialty !== 'all') {
      conditions.push(`specialty = $${params.length + 1}`);
      params.push(specialty);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    res.json({ med: result.rows });
  } catch (error: any) {
    console.error('Med list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить медучреждение (только для админа)
app.post('/api/med/create', async (req, res) => {
  try {
    const { adminId, type, name, specialty, phone, address, description } = req.body;

    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    if (!name || !type) {
      return res.status(400).json({ error: 'Укажите название и тип' });
    }

    const result = await pool.query(
      'INSERT INTO doctors (type, name, specialty, phone, address, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [type, name, specialty || type, phone || null, address || null, description || null]
    );

    res.json({ med: result.rows[0] });
  } catch (error: any) {
    console.error('Med create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CONTACTS (SHAHAR TELEFONLARI) ============

// Список контактов
app.get('/api/contacts/list', async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM contacts';
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json({ contacts: result.rows });
  } catch (error: any) {
    console.error('Contacts list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить контакт (только для админа)
app.post('/api/contacts/create', async (req, res) => {
  try {
    const { adminId, category, name, phone, address } = req.body;

    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    if (!category || !name) {
      return res.status(400).json({ error: 'Укажите категорию и название' });
    }

    const result = await pool.query(
      'INSERT INTO contacts (category, name, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, name, phone || null, address || null]
    );

    res.json({ contact: result.rows[0] });
  } catch (error: any) {
    console.error('Contact create error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ KUTUBXONA (BOOKS) ============

// Список книг
app.get('/api/books/list', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM books';
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ books: result.rows });
  } catch (error: any) {
    console.error('Books list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить книгу (только для админа)
app.post('/api/books/create', async (req, res) => {
  try {
    const { adminId, category, title, author, description, fileUrl, coverUrl } = req.body;
    if (Number(adminId) !== 988368940) return res.status(403).json({ error: 'Доступ запрещён' });
    if (!category || !title || !fileUrl) return res.status(400).json({ error: 'Укажите категорию, название и ссылку на файл' });

    const result = await pool.query(
      `INSERT INTO books (category, title, author, description, file_url, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [category, title, author || null, description || null, fileUrl, coverUrl || null]
    );
    res.json({ book: result.rows[0] });
  } catch (error: any) {
    console.error('Book create error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ TRANSLATE ============
app.post('/api/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;
    if (!text || !from || !to) {
      return res.status(400).json({ error: 'text, from, to required' });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data: any = await response.json();

    const translated = data[0].map((item: any) => item[0]).join('');

    res.json({ translated, from, to });
  } catch (error: any) {
    console.error('Translate error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ OLDI SOTDI (LISTINGS) ============
// Загрузка фото на ImgBB
app.post('/api/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'image required' });

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'IMGBB_API_KEY not set' });

    const formData = new URLSearchParams();
    formData.append('image', image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data: any = await response.json();
    if (!data.success) {
      return res.status(500).json({ error: data.error?.message || 'Upload failed' });
    }

    res.json({ url: data.data.url, thumb: data.data.thumb?.url || data.data.url });
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Список объявлений
app.get('/api/listings/list', async (req, res) => {
  try {
    // Удаляем объявления старше 15 дней
    await pool.query(`DELETE FROM listings WHERE created_at < NOW() - INTERVAL '15 days'`);

    const { category } = req.query;
    let query = "SELECT * FROM listings WHERE status = 'active'";
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' AND category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC LIMIT 100';
    const result = await pool.query(query, params);
    res.json({ listings: result.rows });
  } catch (error: any) {
    console.error('Listings list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создать объявление
app.post('/api/listings/create', async (req, res) => {
  try {
    const { category, title, description, price, phone, imageUrls, userId } = req.body;
    if (!category || !title || !phone) {
      return res.status(400).json({ error: 'Kategoriya, sarlavha va telefon kerak' });
    }
    const result = await pool.query(
      `INSERT INTO listings (category, title, description, price, phone, image_urls, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [category, title, description || null, price || null, phone, imageUrls || [], userId || null]
    );
    res.json({ listing: result.rows[0] });
  } catch (error: any) {
    console.error('Listing create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить объявление (только своё)
app.post('/api/listings/delete', async (req, res) => {
  try {
    const { listingId, userId } = req.body;
    if (!listingId || !userId) return res.status(400).json({ error: 'ID kerak' });
    const result = await pool.query(
      'DELETE FROM listings WHERE id = $1 AND user_id = $2 RETURNING title',
      [listingId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Bu e'lon sizga tegishli emas" });
    }
    res.json({ ok: true, title: result.rows[0].title });
  } catch (error: any) {
    console.error('Listing delete error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ STATIC ============
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Bekobod server running on port ${PORT}`);
});