import sharp from 'sharp';
import crypto from 'crypto';
import express from 'express';
import * as cheerio from 'cheerio';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============ ADMINS ============
const SUPER_ADMIN = 988368940;
const ADMINS = [988368940, 259258146]; // главный + второй админ
// Валидация initData от Telegram
function validateInitData(initData: string, botToken: string): { valid: boolean; user?: any; error?: string } {
  try {
    if (!initData || !botToken) {
      return { valid: false, error: 'Missing initData or bot token' };
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return { valid: false, error: 'Missing hash in initData' };
    }

    // Проверка формата хеша
    if (!/^[0-9a-f]{64}$/i.test(hash)) {
      return { valid: false, error: 'Invalid hash format' };
    }

    // Убираем hash и сортируем по ключам
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // secret_key = HMAC-SHA256("WebAppData", bot_token)
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // computed_hash = HMAC-SHA256(secret_key, data_check_string)
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Timing-safe сравнение
    const valid = crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));

    if (!valid) {
      return { valid: false, error: 'Invalid hash' };
    }

    // Проверка срока давности (24 часа)
    const authDate = Number(params.get('auth_date') || 0);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return { valid: false, error: 'initData expired' };
    }

    // Парсим user
    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return { valid: true, user };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}
// Получить username бота (кэшируем)
let cachedBotUsername: string | null = null;
async function getBotUsername(): Promise<string> {
  if (cachedBotUsername) return cachedBotUsername;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return '';
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data: any = await res.json();
    if (data.ok && data.result?.username) {
      cachedBotUsername = data.result.username;
      return cachedBotUsername!;
    }
  } catch (e) {
    console.error('getBotUsername error:', e);
  }
  return '';
}
// Отправка сообщения с кнопками
async function sendTelegramMessageWithButtons(
  chatId: number,
  text: string,
  buttons: any[][]
): Promise<{ ok: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return { ok: false, error: 'No token' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
      })
    });
    const data: any = await res.json();
    return { ok: data.ok, error: data.description };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// Рассылка объявления всем пользователям
async function broadcastAnnouncement(
  announcementId: number,
  text: string
): Promise<{ sent: number; failed: number }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return { sent: 0, failed: 0 };

  // Получаем уникальных пользователей (объединение app_users и bot_users)
  const usersResult = await pool.query(`
    SELECT user_id FROM app_users
    UNION
    SELECT user_id FROM bot_users
  `);

  const users = usersResult.rows;
  console.log(`📢 Рассылка объявления #${announcementId} на ${users.length} пользователей...`);

  let sent = 0;
  let failed = 0;

  // Считаем текущее количество комментариев (0 при создании)
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM announcement_comments WHERE announcement_id = $1',
    [announcementId]
  );
  const commentsCount = Number(countResult.rows[0].count);

  // Кнопка — WebApp для комментариев
  const buttons = [
    [
      { 
        text: `💬 ${commentsCount} comments`, 
        web_app: { url: `https://bekobod-app-1.onrender.com/?screen=comments&announcement_id=${announcementId}` }
      }
    ]
  ];

  const messageText = `📢 <b>Объявление от администрации</b>\n\n${text}`;

  for (const user of users) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.user_id,
          text: messageText,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons }
        })
      });
      const data: any = await res.json();

      if (data.ok) {
        sent++;
        // Сохраняем message_id для будущих обновлений
        await pool.query(
          `INSERT INTO announcement_messages (announcement_id, user_id, message_id)
           VALUES ($1, $2, $3)`,
          [announcementId, user.user_id, data.result.message_id]
        );
      } else {
        failed++;
        console.log(`  ❌ Ошибка для ${user.user_id}: ${data.description}`);
      }
    } catch (e: any) {
      failed++;
      console.log(`  ❌ Ошибка для ${user.user_id}: ${e.message}`);
    }
    // Задержка 50мс (20 сообщений/сек — безопасно)
    await new Promise(r => setTimeout(r, 50));
  }

  // Обновляем статистику в БД
  await pool.query(
    'UPDATE announcements SET sent_count = $1, failed_count = $2 WHERE id = $3',
    [sent, failed, announcementId]
  );

  console.log(`✅ Рассылка завершена: ${sent} успешно, ${failed} ошибок`);
  return { sent, failed };
}
// Обновить кнопку комментариев у всех пользователей
async function updateCommentsButton(announcementId: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  // Считаем актуальное количество комментариев
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM announcement_comments WHERE announcement_id = $1',
    [announcementId]
  );
  const commentsCount = Number(countResult.rows[0].count);

  // Получаем все message_id этого объявления
  const messagesResult = await pool.query(
    'SELECT user_id, message_id FROM announcement_messages WHERE announcement_id = $1',
    [announcementId]
  );

  const buttons = [
    [
      {
        text: `💬 ${commentsCount} comments`,
        web_app: { url: `https://bekobod-app-1.onrender.com/?screen=comments&announcement_id=${announcementId}` }
      }
    ]
  ];

  console.log(`🔄 Обновление кнопки объявления #${announcementId}: ${commentsCount} comments, ${messagesResult.rows.length} сообщений`);

  let updated = 0;
  let failed = 0;

  for (const row of messagesResult.rows) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: row.user_id,
          message_id: row.message_id,
          reply_markup: { inline_keyboard: buttons }
        })
      });
      const data: any = await res.json();

      if (data.ok) {
        updated++;
      } else {
        failed++;
        if (data.error_code === 400) {
          console.log(`  ⏭ ${row.user_id}: сообщение устарело`);
        }
      }
    } catch (e: any) {
      failed++;
    }
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`✅ Обновлено: ${updated}, ошибок: ${failed}`);
}
app.use(express.json({ limit: '20mb' }));

// Глобальный лимит: 100 запросов в минуту с одного IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p so'rov. Keyinroq urinib ko'ring." }
});

// Строгий лимит: 10 запросов в минуту (для загрузки фото, перевода, трекинга)
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p so'rov. 1 daqiqadan keyin urinib ko'ring." }
});

app.use('/api', globalLimiter);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    // Пинг БД, чтобы Neon не засыпал
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch (e: any) {
    res.json({ status: 'ok', db: 'error', error: e.message });
  }
});
// Трекинг открытия приложения
app.post('/api/track', strictLimiter, async (req, res) => {
  try {
       const { initData } = req.body;

    // Валидация initData от Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    const validation = validateInitData(initData, botToken);

    if (!validation.valid) {
      console.warn('❌ Track: невалидный initData:', validation.error);
      return res.status(403).json({ error: 'Invalid initData' });
    }

    const userId = validation.user?.id;
    const username = validation.user?.username || null;
    const firstName = validation.user?.first_name || null;

    if (!userId) return res.status(400).json({ error: 'userId required' });

    await pool.query(
      `INSERT INTO app_users (user_id, username, first_name, last_seen)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_seen = NOW()`,
      [userId, username || null, firstName || null]
    );
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Track error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Регистрация вебхука Telegram (с секретом)
app.get('/api/setup-webhook', async (req, res) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const webhookUrl = 'https://bekobod-app-1.onrender.com/api/telegram-webhook';

    if (!botToken || !secret) {
      return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN или TELEGRAM_WEBHOOK_SECRET не заданы' });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ['message', 'callback_query', 'my_chat_member'],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Статистика (только главный админ)
app.get('/api/stats', async (req, res) => {
  try {
    const { adminId } = req.query;
    if (Number(adminId) !== 988368940) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const total = await pool.query('SELECT COUNT(*) FROM app_users');
    const online24 = await pool.query("SELECT COUNT(*) FROM app_users WHERE last_seen > NOW() - INTERVAL '24 hours'");
    const week = await pool.query("SELECT COUNT(*) FROM app_users WHERE last_seen > NOW() - INTERVAL '7 days'");
    const month = await pool.query("SELECT COUNT(*) FROM app_users WHERE last_seen > NOW() - INTERVAL '30 days'");

    res.json({
      total: Number(total.rows[0].count),
      online24: Number(online24.rows[0].count),
      week: Number(week.rows[0].count),
      month: Number(month.rows[0].count),
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Бейджи — сколько нового у пользователя
app.get('/api/badge/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { userId } = req.query;
    if (!userId) return res.json({ count: 0 });

    let totalQuery = '';
    if (section === 'news') totalQuery = 'SELECT COUNT(*) FROM news';
    else if (section === 'events') totalQuery = "SELECT COUNT(*) FROM events WHERE status = 'active'";
    else if (section === 'oldi_sotdi') totalQuery = "SELECT COUNT(*) FROM listings WHERE status = 'active'";
    else return res.json({ count: 0 });

    const totalResult = await pool.query(totalQuery);
    const total = Number(totalResult.rows[0].count);

    const viewResult = await pool.query(
      'SELECT last_count FROM user_views WHERE user_id = $1 AND section = $2',
      [userId, section]
    );
    const lastSeen = viewResult.rows.length > 0 ? Number(viewResult.rows[0].last_count) : 0;

    const diff = Math.max(0, total - lastSeen);
    res.json({ count: diff });
  } catch (error: any) {
    console.error('Badge error:', error);
    res.json({ count: 0 });
  }
});

// Отметить раздел как просмотренный
app.post('/api/badge/:section/seen', async (req, res) => {
  try {
    const { section } = req.params;
    const { userId } = req.body;
    if (!userId) return res.json({ ok: false });

    let totalQuery = '';
    if (section === 'news') totalQuery = 'SELECT COUNT(*) FROM news';
    else if (section === 'events') totalQuery = "SELECT COUNT(*) FROM events WHERE status = 'active'";
    else if (section === 'oldi_sotdi') totalQuery = "SELECT COUNT(*) FROM listings WHERE status = 'active'";
    else return res.json({ ok: false });

    const totalResult = await pool.query(totalQuery);
    const total = Number(totalResult.rows[0].count);

    await pool.query(
      `INSERT INTO user_views (user_id, section, last_count, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, section)
       DO UPDATE SET last_count = $3, updated_at = NOW()`,
      [userId, section, total]
    );

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Badge seen error:', error);
    res.json({ ok: false });
  }
});
// Бейджи по подкатегориям
app.get('/api/badge-sub/:section/:sub', async (req, res) => {
  try {
    const { section, sub } = req.params;
    const { userId } = req.query;
    if (!userId) return res.json({ count: 0 });

    let totalQuery = '';
    let params: any[] = [];

    if (section === 'news') {
      totalQuery = 'SELECT COUNT(*) FROM news WHERE category = $1';
      params = [sub];
    } else if (section === 'events') {
      totalQuery = "SELECT COUNT(*) FROM events WHERE status = 'active' AND category = $1";
      params = [sub];
    } else if (section === 'oldi_sotdi') {
      totalQuery = "SELECT COUNT(*) FROM listings WHERE status = 'active' AND category = $1";
      params = [sub];
    } else {
      return res.json({ count: 0 });
    }

    const totalResult = await pool.query(totalQuery, params);
    const total = Number(totalResult.rows[0].count);

    const viewResult = await pool.query(
      'SELECT last_count FROM user_views_sub WHERE user_id = $1 AND section = $2 AND subcategory = $3',
      [userId, section, sub]
    );
    const lastSeen = viewResult.rows.length > 0 ? Number(viewResult.rows[0].last_count) : 0;

    res.json({ count: Math.max(0, total - lastSeen) });
  } catch (error: any) {
    console.error('Badge-sub error:', error);
    res.json({ count: 0 });
  }
});

// Отметить подкатегорию как просмотренную
app.post('/api/badge-sub/:section/:sub/seen', async (req, res) => {
  try {
    const { section, sub } = req.params;
    const { userId } = req.body;
    if (!userId) return res.json({ ok: false });

    let totalQuery = '';
    let params: any[] = [];

    if (section === 'news') {
      totalQuery = 'SELECT COUNT(*) FROM news WHERE category = $1';
      params = [sub];
    } else if (section === 'events') {
      totalQuery = "SELECT COUNT(*) FROM events WHERE status = 'active' AND category = $1";
      params = [sub];
    } else if (section === 'oldi_sotdi') {
      totalQuery = "SELECT COUNT(*) FROM listings WHERE status = 'active' AND category = $1";
      params = [sub];
    } else {
      return res.json({ ok: false });
    }

    const totalResult = await pool.query(totalQuery, params);
    const total = Number(totalResult.rows[0].count);

    await pool.query(
      `INSERT INTO user_views_sub (user_id, section, subcategory, last_count, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, section, subcategory)
       DO UPDATE SET last_count = $4, updated_at = NOW()`,
      [userId, section, sub, total]
    );

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Badge-sub seen error:', error);
    res.json({ ok: false });
  }
});
// ============ TELEGRAM WEBHOOK ============
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    
        // Проверка секрета от Telegram
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      console.warn('❌ Webhook: неверный секрет');
      return res.sendStatus(403);
    }
        const { message, callback_query } = req.body;
        // ============ ОБРАБОТКА CALLBACK-КНОПОК ============
if (callback_query) {
  try {
    const data = callback_query.data || '';
    const userId = callback_query.from.id;
    const userName = callback_query.from.username
      ? `@${callback_query.from.username}`
      : callback_query.from.first_name || 'Foydalanuvchi';
    const chatId = callback_query.message?.chat?.id;
    const messageId = callback_query.message?.message_id;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // === Подтверждение отправки объявления ===
    if (data.startsWith('ann_send_') && userId === SUPER_ADMIN) {
      const announcementId = Number(data.replace('ann_send_', ''));

      // Меняем кнопку на "Отправка..."
      if (botToken && chatId && messageId) {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [[{ text: '⏳ Отправка...', callback_data: 'ignore' }]] }
          })
        });
      }

      // Получаем текст объявления
      const annResult = await pool.query('SELECT text FROM announcements WHERE id = $1', [announcementId]);
      if (annResult.rows.length === 0) {
        await sendTelegramMessage(chatId, '❌ Объявление не найдено');
        return res.sendStatus(200);
      }

      const text = annResult.rows[0].text;

      // Запускаем рассылку
      const result = await broadcastAnnouncement(announcementId, text);

        // Уведомляем админа
      await sendTelegramMessage(
        chatId,
        `✅ <b>Объявление отправлено!</b>\n\n` +
        `📤 Успешно: ${result.sent}\n` +
        `❌ Ошибок: ${result.failed}\n` +
        `ID: <code>${announcementId}</code>`
      );
    }

    // === Отмена отправки ===
    if (data.startsWith('ann_cancel_') && userId === SUPER_ADMIN) {
      const announcementId = Number(data.replace('ann_cancel_', ''));

      // Удаляем из БД
      await pool.query('DELETE FROM announcements WHERE id = $1', [announcementId]);

      // Меняем сообщение
      if (botToken && chatId && messageId) {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: '❌ <b>Объявление отменено</b>',
            parse_mode: 'HTML'
          })
        });
      }
    }

    // === Показать комментарии ===
    if (data.startsWith('ann_comments_')) {
      const announcementId = Number(data.replace('ann_comments_', ''));

      const comments = await pool.query(
        'SELECT user_name, text, created_at FROM announcement_comments WHERE announcement_id = $1 ORDER BY created_at ASC LIMIT 20',
        [announcementId]
      );

      let commentsText = `💬 <b>Комментарии (${comments.rows.length}):</b>\n\n`;

      if (comments.rows.length === 0) {
        commentsText += `<i>Пока комментариев нет. Будьте первым!</i>`;
      } else {
        comments.rows.forEach((c, i) => {
          const time = new Date(c.created_at).toLocaleString('uz-UZ', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
          });
          commentsText += `<b>${i + 1}.</b> ${c.user_name} <i>(${time})</i>\n${c.text}\n\n`;
        });
      }

      // Кнопка "Написать"
      const buttons = [[{ text: '✍️ Написать комментарий', callback_data: `ann_write_${announcementId}` }]];

      await sendTelegramMessageWithButtons(chatId, commentsText, buttons);
    }

    // === Написать комментарий ===
   if (data.startsWith('ann_write_')) {
  const announcementId = Number(data.replace('ann_write_', ''));

  // Сохраняем в БД, что этот пользователь пишет комментарий
  await pool.query(
    `INSERT INTO bot_users (user_id, username, first_name, last_interaction, pending_comment_announcement_id)
     VALUES ($1, $2, $3, NOW(), $4)
     ON CONFLICT (user_id) DO UPDATE 
     SET pending_comment_announcement_id = $4, last_interaction = NOW()`,
    [userId, callback_query.from.username || null, callback_query.from.first_name || null, announcementId]
  );

  await sendTelegramMessage(
    chatId,
    `✍️ <b>Напишите ваш комментарий:</b>\n\n` +
    `Просто отправьте текст следующим сообщением.\n` +
    `Для отмены: <code>/cancel</code>`
  );
}

    // Отвечаем Telegram, что callback обработан (обязательно!)
    if (botToken && callback_query.id) {
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback_query.id })
      });
    }
  } catch (e: any) {
    console.error('Callback error:', e);
  }
  return res.sendStatus(200);
}
// ============ ОБРАБОТКА КОММЕНТАРИЕВ ============
if (message?.text && !message.text.startsWith('/')) {
  // Проверяем, пишет ли пользователь комментарий
  const pendingResult = await pool.query(
    'SELECT pending_comment_announcement_id FROM bot_users WHERE user_id = $1',
    [message.from.id]
  );

  const pendingAnnouncementId = pendingResult.rows[0]?.pending_comment_announcement_id;

if (pendingAnnouncementId) {
  // Это комментарий!
  const commentText = message.text.trim();
  const userName = message.from.username
    ? `@${message.from.username}`
    : message.from.first_name || 'Foydalanuvchi';

  // Сохраняем комментарий + получаем ID
  const insertedComment = await pool.query(
    `INSERT INTO announcement_comments (announcement_id, user_id, user_name, text)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [pendingAnnouncementId, message.from.id, userName, commentText]
  );

  const newCommentId = insertedComment.rows[0].id;

  // Сбрасываем состояние
  await pool.query(
    'UPDATE bot_users SET pending_comment_announcement_id = NULL WHERE user_id = $1',
    [message.from.id]
  );

  // Уведомляем пользователя
  await sendTelegramMessage(
    message.from.id,
    `✅ <b>Комментарий добавлен!</b>\n\n` +
    `Ваш комментарий появится под объявлением.`
  );

  // Уведомляем админа (тебя) с ID
  await sendTelegramMessage(
    SUPER_ADMIN,
    `💬 <b>Новый комментарий к объявлению #${pendingAnnouncementId}</b>\n\n` +
    `👤 ${userName}\n` +
    `💬 ${commentText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 ID комментария: <code>${newCommentId}</code>\n\n` +
    `✍️ Ответить: <code>/reply_comment ${newCommentId} Ваш ответ</code>\n` +
    `🗑 Удалить: <code>/delete_comment ${newCommentId}</code>`
  );

  // Обновляем кнопку у ВСЕХ пользователей (в фоне)
  updateCommentsButton(pendingAnnouncementId).catch(e => console.error('Update button error:', e));

  return res.sendStatus(200);
}
}

// Команда /cancel — отмена комментария
if (message?.text === '/cancel') {
  await pool.query(
    'UPDATE bot_users SET pending_comment_announcement_id = NULL WHERE user_id = $1',
    [message.from.id]
  );
  await sendTelegramMessage(message.from.id, '❌ Отменено');
  return res.sendStatus(200);
}
// Команда /start — инструкция
if (message?.text === '/start') {
  const startText =
    `Assalomu alaykum! 👋\n\n` +
    `🏙️ <b>Bekobod Shahar Portali</b> ilovasiga xush kelibsiz!\n\n` +
    `👇 Ilovani ochish uchun pastdagi\n` +
    `   ko'k <b>Ochish</b> tugmasini bosing:\n\n` +
    `      ⬇️\n` +
    `   🟦 <b>Ochish</b> 🟦\n` +
    `      ⬆️\n\n` +
    `Agar tugma ko'rinmasa, ekranni pastga torting yoki Telegramni qayta ishga tushiring.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📌 <b>Maslahat:</b> Botni yo'qotmaslik uchun uni <b>yuqoriga qadab qo'ying</b> (Pin).\n\n` +
    `Buning uchun:\n` +
    `1️⃣ Chat ustiga uzoq bosing\n` +
    `2️⃣ <b>Pin</b> tugmasini tanlang\n\n` +
    `Shunda ilova doim qo'l ostingizda bo'ladi! 🚀`;

  const startButtons = [
    [
      {
        text: '📤 Do\'stlarga ulashish',
        url: `https://t.me/share/url?url=https://t.me/${(await getBotUsername())}&text=${encodeURIComponent('🏙️ Bekobod Shahar Portali — shahrimiz uchun bepul va qulay ilova!')}`
      }
    ]
  ];

  await sendTelegramMessageWithButtons(message.from.id, startText, startButtons);
  return res.sendStatus(200);
}
    // Команда /broadcast — создать объявление (только SUPER_ADMIN)
if (message?.text?.startsWith('/broadcast') && message.from.id === SUPER_ADMIN) {
  const text = message.text.replace('/broadcast', '').trim();

  if (!text) {
    await sendTelegramMessage(
      message.from.id,
      `❌ <b>Format:</b>\n<code>/broadcast Text ob'yavleniya</code>\n\n` +
      `<b>Misol:</b>\n<code>/broadcast 3-mikrorayonda suv 10:00 dan 14:00 gacha o'chiriladi</code>`
    );
    return res.sendStatus(200);
  }

  // Сохраняем в БД
  const result = await pool.query(
    'INSERT INTO announcements (text, created_by) VALUES ($1, $2) RETURNING *',
    [text, message.from.id]
  );

  const announcementId = result.rows[0].id;

  // Показываем превью с кнопками подтверждения
  const previewText =
    `📢 <b>Предпросмотр объявления</b>\n\n` +
    `${text}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `ID: <code>${announcementId}</code>`;

  const buttons = [
    [
      { text: '✅ Отправить', callback_data: `ann_send_${announcementId}` },
      { text: '❌ Отмена', callback_data: `ann_cancel_${announcementId}` }
    ]
  ];

  await sendTelegramMessageWithButtons(message.from.id, previewText, buttons);
  return res.sendStatus(200);
}
// Команда /reply_comment ID текст — ответ на комментарий (только SUPER_ADMIN)
if (message?.text?.startsWith('/reply_comment') && message.from.id === SUPER_ADMIN) {
  const parts = message.text.split(' ');
  const commentId = Number(parts[1]);
  const replyText = parts.slice(2).join(' ').trim();

  if (!commentId || !replyText) {
    await sendTelegramMessage(
      message.from.id,
      `❌ <b>Format:</b>\n<code>/reply_comment ID Text otveta</code>\n\n` +
      `<b>Misol:</b>\n<code>/reply_comment 5 Rahmat!</code>`
    );
    return res.sendStatus(200);
  }

  // Проверяем, что комментарий существует
  const check = await pool.query(
    'SELECT announcement_id, user_id, text FROM announcement_comments WHERE id = $1',
    [commentId]
  );

  if (check.rows.length === 0) {
    await sendTelegramMessage(message.from.id, `❌ Kommentariy topilmadi (ID: ${commentId})`);
    return res.sendStatus(200);
  }

  const { announcement_id, user_id, text: commentText } = check.rows[0];

  // Сохраняем ответ
  await pool.query(
    'UPDATE announcement_comments SET admin_reply = $1, admin_replied_at = NOW() WHERE id = $2',
    [replyText, commentId]
  );

  // Уведомляем автора комментария
  await sendTelegramMessage(
    user_id,
    `📢 <b>Administrator javobi!</b>\n\n` +
    `💬 Sizning izohingiz: ${commentText}\n\n` +
    `📢 Javob: <b>${replyText}</b>`
  );

  await sendTelegramMessage(
    message.from.id,
    `✅ <b>Javob yuborildi!</b>\n\n` +
    `🆔 Kommentariy: <code>${commentId}</code>\n` +
    `💬 Javob: ${replyText}`
  );

  return res.sendStatus(200);
}

// Команда /delete_comment ID — удалить комментарий (только SUPER_ADMIN)
if (message?.text?.startsWith('/delete_comment') && message.from.id === SUPER_ADMIN) {
  const commentId = Number(message.text.split(' ')[1]);

  if (!commentId) {
    await sendTelegramMessage(message.from.id, `❌ /delete_comment ID`);
    return res.sendStatus(200);
  }

  const check = await pool.query(
    'SELECT announcement_id, user_name, text FROM announcement_comments WHERE id = $1',
    [commentId]
  );

  if (check.rows.length === 0) {
    await sendTelegramMessage(message.from.id, `❌ Kommentariy topilmadi (ID: ${commentId})`);
    return res.sendStatus(200);
  }

  const { announcement_id } = check.rows[0];

  await pool.query('DELETE FROM announcement_comments WHERE id = $1', [commentId]);

  // Обновляем кнопку у всех
  updateCommentsButton(announcement_id).catch(e => console.error('Update error:', e));

  await sendTelegramMessage(
    message.from.id,
    `✅ <b>Kommentariy o'chirildi!</b>\n\n` +
    `🆔 <code>${commentId}</code>`
  );

  return res.sendStatus(200);
}
// Команда /delete_announcement ID — удалить объявление (только SUPER_ADMIN)
if (message?.text?.startsWith('/delete_announcement') && message.from.id === SUPER_ADMIN) {
  const announcementId = Number(message.text.split(' ')[1]);

  if (!announcementId) {
    await sendTelegramMessage(message.from.id, `❌ /delete_announcement ID`);
    return res.sendStatus(200);
  }

  // Проверяем, что объявление существует
  const check = await pool.query(
    'SELECT text FROM announcements WHERE id = $1',
    [announcementId]
  );

  if (check.rows.length === 0) {
    await sendTelegramMessage(message.from.id, `❌ Ob'yavlenie topilmadi (ID: ${announcementId})`);
    return res.sendStatus(200);
  }

  // Удаляем комментарии и связи с сообщениями
  await pool.query('DELETE FROM announcement_comments WHERE announcement_id = $1', [announcementId]);
  await pool.query('DELETE FROM announcement_messages WHERE announcement_id = $1', [announcementId]);

  // Удаляем само объявление
  await pool.query('DELETE FROM announcements WHERE id = $1', [announcementId]);

  await sendTelegramMessage(
    message.from.id,
    `✅ <b>Ob'yavlenie o'chirildi!</b>\n\n` +
    `🆔 <code>${announcementId}</code>\n\n` +
    `<i>Barcha izohlar ham o'chirildi.</i>`
  );

  return res.sendStatus(200);
}
// Команда /list_announcements — список всех объявлений (только SUPER_ADMIN)
if (message?.text === '/list_announcements' && message.from.id === SUPER_ADMIN) {
  const result = await pool.query(
    `SELECT a.id, a.text, a.created_at, a.sent_count, a.failed_count,
       (SELECT COUNT(*) FROM announcement_comments WHERE announcement_id = a.id) as comments_count
     FROM announcements a
     ORDER BY a.created_at DESC
     LIMIT 20`
  );

  if (result.rows.length === 0) {
    await sendTelegramMessage(message.from.id, `📭 Ob'yavleniyalar yo'q`);
    return res.sendStatus(200);
  }

  let text = `📋 <b>Ob'yavleniyalar (${result.rows.length}):</b>\n\n`;

  result.rows.forEach((row, i) => {
    const date = new Date(row.created_at).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const shortText = row.text.length > 60 ? row.text.substring(0, 60) + '...' : row.text;

    text += `<b>${i + 1}.</b> <code>ID: ${row.id}</code>\n`;
    text += `📅 ${date}\n`;
    text += `📝 ${shortText}\n`;
    text += `📤 Yuborildi: ${row.sent_count} | ❌ Xato: ${row.failed_count}\n`;
    text += `💬 Izohlar: ${row.comments_count}\n`;
    text += `🗑 O'chirish: <code>/delete_announcement ${row.id}</code>\n\n`;
  });

  await sendTelegramMessage(message.from.id, text);
  return res.sendStatus(200);
}
           // Команда /add_place (с фото или без)
    // Формат: /add_place kategoriya | nomi | manzil | telefon | ish_vaqti | tavsif
    if ((message?.text?.startsWith('/add_place') || message?.caption?.startsWith('/add_place')) && ADMINS.includes(message.from.id)) {
      const rawText = message.text || message.caption || '';
      const parts = rawText.split('|').map((s: string) => s.trim());

      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_place kategoriya | nomi | manzil | telefon | ish_vaqti | tavsif</code>\n\n` +
          `<b>Kategoriyalar:</b> fastfood, milliy, kafe, restoran, chayxana, shirinlik, yarim_tayyor\n\n` +
          `<b>Misol:</b>\n<code>/add_place fastfood | AGASI FOOD | Bunyodkor 55 | +998903277714 | 11:00-23:00 | Mazali taomlar</code>\n\n` +
          `<b>Rasm bilan:</b> rasm yuborib, izohga shu formatni yozing`
        );
      } else {
        const category = parts[0].replace('/add_place', '').trim();
        const name = parts[1];
        const address = parts[2] || null;
        const phone = parts[3] || null;
        const hours = parts[4] || null;
        const description = parts[5] || null;

        // Картинка — ImgBB
        let imageUrl: string | null = null;
        if (message.photo && message.photo.length > 0) {
          const fileId = message.photo[message.photo.length - 1].file_id;
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const imgbbKey = process.env.IMGBB_API_KEY;
                   if (botToken) {
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              if (!fileData.ok) throw new Error('Telegram error');

                          const tempUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              const arrayBuf = await fetch(tempUrl).then(r => r.arrayBuffer());
              const imageBuffer = Buffer.from(arrayBuf);

                // Сжимаем до 800px по ширине, качество 80%
              const compressed = await sharp(imageBuffer)
  .resize({ width: 800, withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();

                           // Конвертируем в base64 data URL
              imageUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;
                    } catch (e) {
              console.error('Photo upload error:', e);
            }
          }
        }

        const result = await pool.query(
          'INSERT INTO restaurants (name, category, address, phone, description, image_url, hours) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [name, category, address, phone, description, imageUrl, hours]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Qo'shildi!</b>\n\n📌 ${name}\n📍 ${address || "yo'q"}\n📞 ${phone || "yo'q"}\n🕐 ${hours || "yo'q"}\n📝 ${description || "yo'q"}\n🖼 ${imageUrl ? 'Ha' : "yo'q"}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }

    // Команда /add_menu ID — прикрепи фото меню к ресторану
       if (message?.photo && message.caption?.startsWith('/add_menu') && ADMINS.includes(message.from.id)) {
      const captionParts = message.caption.split('|').map((s: string) => s.trim());
      const idPart = captionParts[0].replace('/add_menu', '').trim();
      const restaurantId = Number(idPart);

      if (!restaurantId) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\nRasmga izoh yozing:\n<code>/add_menu ID</code>\n\n` +
          `<b>Misol:</b> <code>/add_menu 5</code>`
        );
      } else {
        const check = await pool.query('SELECT name FROM restaurants WHERE id = $1', [restaurantId]);
        if (check.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Restoran topilmadi (ID: ${restaurantId})`);
        } else {
          const fileId = message.photo[message.photo.length - 1].file_id;
          const botToken = process.env.TELEGRAM_BOT_TOKEN;

          if (!botToken) {
            await sendTelegramMessage(message.from.id, `❌ Server sozlamalari to'liq emas`);
          } else {
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              if (!fileData.ok) throw new Error('Telegram file error');

                            const tempUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              const arrayBuf = await fetch(tempUrl).then(r => r.arrayBuffer());
              const imageBuffer = Buffer.from(arrayBuf);

                // Сжимаем до 800px по ширине, качество 80%
              const compressed = await sharp(imageBuffer)
  .resize({ width: 800, withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();

              // Конвертируем в base64 data URL
              const finalUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;

              await pool.query(
                `UPDATE restaurants SET menu_images = array_append(COALESCE(menu_images, '{}'), $1) WHERE id = $2`,
                [finalUrl, restaurantId]
              );

              await sendTelegramMessage(
                message.from.id,
                `✅ <b>Menyu rasmi qo'shildi!</b>\n\n🏪 ${check.rows[0].name}\n📷 Rasm saqlandi\nID: <code>${restaurantId}</code>`
              );
            } catch (err: any) {
              console.error('Menu upload error:', err);
              await sendTelegramMessage(message.from.id, `❌ Xatolik: ${err.message}`);
            }
          }
        }
      }
    }
        // Команда /update_photo ID — обновить главное фото ресторана
        if (message?.photo && message.caption?.startsWith('/update_photo') && ADMINS.includes(message.from.id)) {
      const captionParts = message.caption.split('|').map((s: string) => s.trim());
      const idPart = captionParts[0].replace('/update_photo', '').trim();
      const restaurantId = Number(idPart);

      if (!restaurantId) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\nRasmga izoh yozing:\n<code>/update_photo ID</code>\n\n` +
          `<b>Misol:</b> <code>/update_photo 5</code>`
        );
      } else {
        const check = await pool.query('SELECT name FROM restaurants WHERE id = $1', [restaurantId]);
        if (check.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Restoran topilmadi (ID: ${restaurantId})`);
        } else {
          const fileId = message.photo[message.photo.length - 1].file_id;
          const botToken = process.env.TELEGRAM_BOT_TOKEN;

          if (!botToken) {
            await sendTelegramMessage(message.from.id, `❌ Server sozlamalari to'liq emas`);
          } else {
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              if (!fileData.ok) throw new Error('Telegram file error');

                           const tempUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              const arrayBuf = await fetch(tempUrl).then(r => r.arrayBuffer());
              const imageBuffer = Buffer.from(arrayBuf);

              // Сжимаем до 800px по ширине, качество 80%
              const compressed = await sharp(imageBuffer)
  .resize({ width: 800, withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();

              // Конвертируем в base64 data URL
              const finalUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;

              await pool.query(
                'UPDATE restaurants SET image_url = $1 WHERE id = $2',
                [finalUrl, restaurantId]
              );

              await sendTelegramMessage(
                message.from.id,
                `✅ <b>Rasm yangilandi!</b>\n\n🏪 ${check.rows[0].name}\n📷 Rasm saqlandi\nID: <code>${restaurantId}</code>`
              );
            } catch (err: any) {
              console.error('Update photo error:', err);
              await sendTelegramMessage(message.from.id, `❌ Xatolik: ${err.message}`);
            }
          }
        }
      }
    }
        // Команда /add_shop (с фото или без)
    // Формат: /add_shop kategoriya | nomi | manzil | telefon | ish_vaqti | tavsif
    if ((message?.text?.startsWith('/add_shop') || message?.caption?.startsWith('/add_shop')) && ADMINS.includes(message.from.id)) {
      const rawText = message.text || message.caption || '';
      const parts = rawText.split('|').map((s: string) => s.trim());

      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_shop kategoriya | nomi | manzil | telefon | ish_vaqti | tavsif</code>\n\n` +
          `<b>Kategoriyalar:</b>\n` +
          `oziq-ovqat — Продукты\n` +
          `kiyim — Одежда\n` +
          `elektronika — Электроника\n` +
          `gozallik — Красота\n` +
          `avto — Авто\n` +
          `usta — Мастера\n\n` +
          `<b>Misol:</b>\n<code>/add_shop oziq-ovqat | Korzinka | Navoiy 15 | +998901234567 | 08:00-23:00 | Oziq-ovqat</code>`
        );
      } else {
        const category = parts[0].replace('/add_shop', '').trim();
        const name = parts[1];
        const address = parts[2] || null;
        const phone = parts[3] || null;
        const hours = parts[4] || null;
        const description = parts[5] || null;

        // Фото → ImgBB
        let imageUrl: string | null = null;
        if (message.photo && message.photo.length > 0) {
          const fileId = message.photo[message.photo.length - 1].file_id;
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const imgbbKey = process.env.IMGBB_API_KEY;

                   if (botToken) {
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              if (!fileData.ok) throw new Error('Telegram error');

                           const tempUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              const arrayBuf = await fetch(tempUrl).then(r => r.arrayBuffer());
              const imageBuffer = Buffer.from(arrayBuf);

              // Сжимаем до 500px по ширине, качество 55%
              const compressed = await sharp(imageBuffer)
                .resize({ width: 500, withoutEnlargement: true })
.jpeg({ quality: 55 })
                .toBuffer();

                            // Конвертируем в base64 data URL
              imageUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;
            } catch (e) {
              console.error('Photo upload error:', e);
            }
          }
        }

        const result = await pool.query(
          `INSERT INTO shops (category, name, address, phone, hours, description, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [category, name, address, phone, hours, description, imageUrl]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Qo'shildi!</b>\n\n📌 ${name}\n📂 ${category}\n📍 ${address || "yo'q"}\n📞 ${phone || "yo'q"}\n🕐 ${hours || "yo'q"}\n🖼 ${imageUrl ? 'Ha' : "yo'q"}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }

    // Команда /delete_shop ID
    if (message?.text?.startsWith('/delete_shop') && ADMINS.includes(message.from.id)) {
      const shopId = Number(message.text.split(' ')[1]);
      if (!shopId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_shop ID");
      } else {
        const result = await pool.query('DELETE FROM shops WHERE id = $1 RETURNING name', [shopId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${shopId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].name}</b>`);
        }
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
           // Команда /add_med (с фото или без)
    // Формат: /add_med tur | nomi | manzil | telefon | ish_vaqti | tavsif
    if ((message?.text?.startsWith('/add_med') || message?.caption?.startsWith('/add_med')) && ADMINS.includes(message.from.id)) {
      const rawText = message.text || message.caption || '';
      const parts = rawText.split('|').map((s: string) => s.trim());

      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_med tur | nomi | manzil | telefon | ish_vaqti | tavsif</code>\n\n` +
          `<b>Turlar:</b> dorixona, kasalxona\n\n` +
          `<b>Misol:</b>\n<code>/add_med dorixona | Dori-Darmon | Navoiy 10 | +998901234567 | 24/7 | Zamonaviy dorixona</code>\n\n` +
          `<b>Rasm bilan:</b> rasm yuborib, izohga shu formatni yozing`
        );
      } else {
        const type = parts[0].replace('/add_med', '').trim();
        const name = parts[1];
        const address = parts[2] || null;
        const phone = parts[3] || null;
        const hours = parts[4] || null;
        const description = parts[5] || null;

              // Картинка — загружаем на ImgBB (постоянная ссылка)
        let imageUrl: string | null = null;
        if (message.photo && message.photo.length > 0) {
          const fileId = message.photo[message.photo.length - 1].file_id;
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const imgbbKey = process.env.IMGBB_API_KEY;

                   if (botToken) {
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              if (!fileData.ok) throw new Error('Telegram error');

                            const tempUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              const arrayBuf = await fetch(tempUrl).then(r => r.arrayBuffer());
              const imageBuffer = Buffer.from(arrayBuf);

              // Сжимаем до 500px по ширине, качество 55%
              const compressed = await sharp(imageBuffer)
               .resize({ width: 500, withoutEnlargement: true })
.jpeg({ quality: 55 })
                .toBuffer();

              // Конвертируем в base64 data URL
              imageUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;
            } catch (e) {
              console.error('Photo upload error:', e);
            }
          }
        }

        const result = await pool.query(
          'INSERT INTO doctors (type, name, specialty, phone, address, description, image_url, hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [type, name, description || type, phone, address, null, imageUrl, hours]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>${type} qo'shildi!</b>\n\n📌 ${name}\n📍 ${address || "yo'q"}\n📞 ${phone || "yo'q"}\n🕐 ${hours || "yo'q"}\n📝 ${description || "yo'q"}\n🖼 ${imageUrl ? 'Ha' : "yo'q"}\nID: <code>${result.rows[0].id}</code>`
        );
      }
    }
        // Команда /delete_med ID
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
      `❌ <b>Format:</b>\n<code>/add_news kategoriya | sarlavha | matn | youtube=... | instagram=...</code>\n\n` +
      `<b>Kategoriyalar:</b> bekobod, jahon\n\n` +
      `<b>Misol (YouTube):</b>\n<code>/add_news bekobod | Yangilik | Matn | youtube=https://youtu.be/abc</code>\n\n` +
      `<b>Misol (Instagram):</b>\n<code>/add_news bekobod | Yangilik | Matn | instagram=https://instagram.com/reel/xyz</code>\n\n` +
      `<b>Можно оба:</b>\n<code>/add_news bekobod | Yangilik | Matn | youtube=https://youtu.be/abc | instagram=https://instagram.com/reel/xyz</code>`
    );
  } else {
    const category = parts[0].replace('/add_news', '').trim();
    const title = parts[1];
    const content = parts[2] || null;

    // Парсим youtube= и instagram= из всех частей
    let youtubeUrl: string | null = null;
    let instagramUrl: string | null = null;
    let source: string | null = null;

    for (let i = 3; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('youtube=')) {
        youtubeUrl = part.replace('youtube=', '').trim();
      } else if (part.startsWith('instagram=')) {
        instagramUrl = part.replace('instagram=', '').trim();
      } else if (part.startsWith('http')) {
        // Старый формат — просто ссылка
        source = part;
      }
    }

    const result = await pool.query(
      `INSERT INTO news (category, title, content, source, youtube_url, instagram_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [category, title, content, source, youtubeUrl, instagramUrl]
    );

    let info = `✅ <b>Yangilik qo'shildi!</b>\n\n📂 ${category}\n📰 ${title}`;
    if (youtubeUrl) info += `\n▶️ YouTube: ha`;
    if (instagramUrl) info += `\n📷 Instagram: ha`;
    if (source) info += `\n🔗 Manba: ha`;
    info += `\nID: <code>${result.rows[0].id}</code>`;

    await sendTelegramMessage(message.from.id, info);
  }
}
   // Команда /add_news с фото или видео (через caption)
if ((message?.caption?.startsWith('/add_news')) && ADMINS.includes(message.from.id)) {
  const parts = message.caption.split('|').map((s: string) => s.trim());

  if (parts.length < 3) {
    await sendTelegramMessage(
      message.from.id,
      `❌ <b>Format (s фото/видео):</b>\n<code>/add_news kategoriya | sarlavha | matn | youtube=... | instagram=...</code>\n\n` +
      `<b>Отправь фото или видео с этой подписью.</b>\n\n` +
      `<b>Можно:</b> только youtube, только instagram, или оба.`
    );
  } else {
    const category = parts[0].replace('/add_news', '').trim();
    const title = parts[1];
    const content = parts[2] || null;

    // Парсим youtube= и instagram= из всех частей
    let youtubeUrl: string | null = null;
    let instagramUrl: string | null = null;
    let source: string | null = null;

    for (let i = 3; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('youtube=')) {
        youtubeUrl = part.replace('youtube=', '').trim();
      } else if (part.startsWith('instagram=')) {
        instagramUrl = part.replace('instagram=', '').trim();
      } else if (part.startsWith('http')) {
        source = part;
      }
    }

    // Получаем file_id
    let fileId = null;
    let mediaType = null;

    if (message.photo && message.photo.length > 0) {
      fileId = message.photo[message.photo.length - 1].file_id;
      mediaType = 'photo';
    } else if (message.video) {
      fileId = message.video.file_id;
      mediaType = 'video';
    }

    const result = await pool.query(
      `INSERT INTO news (category, title, content, source, image_url, youtube_url, instagram_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [category, title, content, source, fileId, youtubeUrl, instagramUrl]
    );

    let info = `✅ <b>Yangilik qo'shildi!</b>\n\n📂 ${category}\n📰 ${title}\n🖼 ${mediaType || 'yo\'q'}`;
    if (youtubeUrl) info += `\n▶️ YouTube: ha`;
    if (instagramUrl) info += `\n📷 Instagram: ha`;
    info += `\nID: <code>${result.rows[0].id}</code>`;

    await sendTelegramMessage(message.from.id, info);
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
           // Команда /add_ad (создать рекламу, только главный админ)
    // Формат: /add_ad sarlavha | matn | telefon | gradient | text_color | manzil | ish_vaqti | CTA
    if ((message?.text?.startsWith('/add_ad') || message?.caption?.startsWith('/add_ad')) && message.from.id === SUPER_ADMIN) {
      const rawText = message.text || message.caption || '';
      const parts = rawText.split('|').map((s: string) => s.trim());

      if (parts.length < 3) {
        await sendTelegramMessage(
          message.from.id,
          `❌ <b>Format:</b>\n<code>/add_ad sarlavha | matn | telefon | gradient | text_color | manzil | ish_vaqti | CTA</code>\n\n` +
          `<b>Gradientlar:</b>\n` +
          `from-amber-600 to-orange-700\n` +
          `from-rose-500 to-pink-600\n` +
          `from-red-600 to-orange-600\n` +
          `from-emerald-600 to-teal-700\n\n` +
          `<b>Цвет текста:</b> white, black, yellow, red, cyan, orange\n\n` +
          `<b>Misol:</b>\n` +
          `<code>/add_ad Choyxona Navruz | Milliy taomlar | +998901234567 | from-amber-600 to-orange-700 | white | Navoiy 15 | 10:00-23:00 | Chegirma 15%</code>`
        );
           } else {
        // Проверка лимита: максимум 4 рекламы
        const countResult = await pool.query("SELECT COUNT(*) FROM ads WHERE status = 'active'");
        const currentCount = Number(countResult.rows[0].count);
        if (currentCount >= 4) {
          await sendTelegramMessage(
            message.from.id,
            `❌ <b>Limit to'ldi!</b>\n\nMaksimal <b>4 ta reklama</b> qo'shish mumkin.\n\nAvval eskisini o'chiring: <code>/delete_ad ID</code>`
          );
          return;
        }

        const title = parts[0].replace('/add_ad', '').trim();
        const subtitle = parts[1] || null;
        const phone = parts[2] || null;
        const gradient = parts[3] || 'from-amber-600 to-orange-700';
        const textColor = parts[4] || 'white';
        const address = parts[5] || null;
        const hours = parts[6] || null;
        const cta = parts[7] || null;

        // Картинка — ImgBB
        let imageUrl: string | null = null;
        if (message.photo && message.photo.length > 0) {
          const fileId = message.photo[message.photo.length - 1].file_id;
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const imgbbKey = process.env.IMGBB_API_KEY;
                  if (botToken) {
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData: any = await fileRes.json();
              if (!fileData.ok) throw new Error('Telegram error');

                            const tempUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
              const arrayBuf = await fetch(tempUrl).then(r => r.arrayBuffer());
              const imageBuffer = Buffer.from(arrayBuf);

              // Сжимаем до 500px по ширине, качество 55%
              const compressed = await sharp(imageBuffer)
                .resize({ width: 500, withoutEnlargement: true })
.jpeg({ quality: 55 })
                .toBuffer();

              // Конвертируем в base64 data URL
              imageUrl = `data:image/jpeg;base64,${compressed.toString('base64')}`;
            } catch (e) {
              console.error('Photo upload error:', e);
            }
          }
        }

        const result = await pool.query(
          `INSERT INTO ads (title, subtitle, phone, gradient, image_url, text_color, address, hours, cta)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [title, subtitle, phone, gradient, imageUrl, textColor, address, hours, cta]
        );

        await sendTelegramMessage(
          message.from.id,
          `✅ <b>Reklama qo'shildi!</b>\n\n` +
          `📢 ${title}\n` +
          `📝 ${subtitle || "yo'q"}\n` +
          `📞 ${phone || "yo'q"}\n` +
          `🎨 ${gradient}\n` +
          `🔤 ${textColor}\n` +
          `📍 ${address || "yo'q"}\n` +
          `🕐 ${hours || "yo'q"}\n` +
          `🎯 ${cta || "yo'q"}\n` +
          `🖼 ${imageUrl ? 'Ha' : "yo'q"}\n` +
          `ID: <code>${result.rows[0].id}</code>`
        );
      }
    }
    // Команда /delete_ad ID (только главный админ)
    if (message?.text?.startsWith('/delete_ad') && message.from.id === SUPER_ADMIN) {
      const adId = Number(message.text.split(' ')[1]);
      if (!adId) {
        await sendTelegramMessage(message.from.id, "❌ /delete_ad ID");
      } else {
        const result = await pool.query('DELETE FROM ads WHERE id = $1 RETURNING title', [adId]);
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${adId})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ O'chirildi: <b>${result.rows[0].title}</b>`);
        }
      }
    }
        // Одобрить объявление (только главный админ)
    if (message?.text?.startsWith('/approve_listing') && message.from.id === SUPER_ADMIN) {
      const id = Number(message.text.split(' ')[1]);
      if (!id) {
        await sendTelegramMessage(message.from.id, "❌ /approve_listing ID");
      } else {
        const result = await pool.query(
          "UPDATE listings SET status = 'active' WHERE id = $1 RETURNING title, user_id, username",
          [id]
        );
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${id})`);
        } else {
          await sendTelegramMessage(message.from.id, `✅ E'lon #${id} tasdiqlandi: <b>${result.rows[0].title}</b>`);

          // Уведомление автору
          if (result.rows[0].user_id) {
            await sendTelegramMessage(
              result.rows[0].user_id,
              `✅ <b>E'loningiz tasdiqlandi!</b>\n\n📝 ${result.rows[0].title}\n\nU endi Oldi sotdi bo'limida ko'rinadi.`
            );
          }
        }
      }
    }

    // Отклонить объявление (только главный админ)
    if (message?.text?.startsWith('/reject_listing') && message.from.id === SUPER_ADMIN) {
      const id = Number(message.text.split(' ')[1]);
      if (!id) {
        await sendTelegramMessage(message.from.id, "❌ /reject_listing ID");
      } else {
        const result = await pool.query(
          "UPDATE listings SET status = 'rejected' WHERE id = $1 RETURNING title, user_id",
          [id]
        );
        if (result.rows.length === 0) {
          await sendTelegramMessage(message.from.id, `❌ Topilmadi (ID: ${id})`);
        } else {
          await sendTelegramMessage(message.from.id, `❌ E'lon #${id} rad etildi`);

          // Уведомление автору
          if (result.rows[0].user_id) {
            await sendTelegramMessage(
              result.rows[0].user_id,
              `❌ <b>E'loningiz rad etildi</b>\n\n📝 ${result.rows[0].title}\n\nQoidalarga mos kelmaganligi sababli o'chirildi.`
            );
          }
        }
      }
    }
        // Команда /stats (статистика приложения, только главный админ)
    if (message?.text === '/stats' && message.from.id === SUPER_ADMIN) {
      const total = await pool.query('SELECT COUNT(*) FROM app_users');
      const online24 = await pool.query("SELECT COUNT(*) FROM app_users WHERE last_seen > NOW() - INTERVAL '24 hours'");
      const week = await pool.query("SELECT COUNT(*) FROM app_users WHERE last_seen > NOW() - INTERVAL '7 days'");
      const month = await pool.query("SELECT COUNT(*) FROM app_users WHERE last_seen > NOW() - INTERVAL '30 days'");

      await sendTelegramMessage(
        message.from.id,
        `📊 <b>Ilova statistikasi</b>\n\n` +
        `👥 <b>Jami ochganlar:</b> ${total.rows[0].count}\n\n` +
        `🟢 <b>Onlayn (24 soat):</b> ${online24.rows[0].count}\n` +
        `📅 <b>Faol (7 kun):</b> ${week.rows[0].count}\n` +
        `📆 <b>Faol (30 kun):</b> ${month.rows[0].count}`
      );
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
    const { rideId, userId } = req.body;
    if (!rideId) return res.status(400).json({ error: 'Не указан рейс' });
    if (!userId) return res.status(400).json({ error: 'Не указан пользователь' });

    // Удаляем бронирование КОНКРЕТНО этого пользователя
    const deleteResult = await pool.query(
      'DELETE FROM taxi_bookings WHERE ride_id = $1 AND user_id = $2 RETURNING id',
      [rideId, userId]
    );

    // Если не нашли — пользователь и не бронировал
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Siz bu reysni band qilmagansiz' });
    }

    // Пересчитываем занятые места из реальной БД (надёжнее, чем -1)
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM taxi_bookings WHERE ride_id = $1',
      [rideId]
    );
    const newBooked = Number(countResult.rows[0].count);

    const rideResult = await pool.query('SELECT total_seats FROM taxi_rides WHERE id = $1', [rideId]);
    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reyс topilmadi' });
    }
    const totalSeats = rideResult.rows[0].total_seats;
    const newStatus = newBooked >= totalSeats ? 'full' : 'active';

    await pool.query(
      'UPDATE taxi_rides SET booked_seats = $1, status = $2 WHERE id = $3',
      [newBooked, newStatus, rideId]
    );

    res.json({ ok: true, bookedSeats: newBooked, status: newStatus });
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
    const { rideId, rating, userId } = req.body;
    if (!rideId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Неверная оценка' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'Avval Telegram orqali kiring' });
    }

    const existing = await pool.query(
      'SELECT id FROM taxi_ratings WHERE ride_id = $1 AND user_id = $2',
      [rideId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Siz allaqachon baholagansiz' });
    }

    await pool.query(
      'INSERT INTO taxi_ratings (ride_id, rating, user_id) VALUES ($1, $2, $3)',
      [rideId, rating, userId]
    );
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
// Моя оценка рейса
app.get('/api/taxi/my-rating/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.query;
    if (!userId) return res.json({ rating: null });

    const result = await pool.query(
      'SELECT rating FROM taxi_ratings WHERE ride_id = $1 AND user_id = $2',
      [rideId, userId]
    );
    res.json({ rating: result.rows.length > 0 ? result.rows[0].rating : null });
  } catch (error: any) {
    console.error('My taxi rating error:', error);
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
    if (!ADMINS.includes(Number(adminId))) {
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
    if (!ADMINS.includes(Number(adminId))) {
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
    const { providerId, rating, userId } = req.body;
    if (!providerId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Неверная оценка' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'Avval Telegram orqali kiring' });
    }

    const existing = await pool.query(
      'SELECT id FROM service_ratings WHERE provider_id = $1 AND user_id = $2',
      [providerId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Siz allaqachon baholagansiz' });
    }

    await pool.query(
      'INSERT INTO service_ratings (provider_id, rating, user_id) VALUES ($1, $2, $3)',
      [providerId, rating, userId]
    );
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
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
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
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
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
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
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
    const { companyName, position, salary, description, phone, category, userId } = req.body;
    if (!companyName || !position || !phone) return res.status(400).json({ error: 'Заполните компанию, должность и телефон' });
    const result = await pool.query(
      'INSERT INTO jobs (company_name, position, salary, description, phone, category, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [companyName, position, salary || null, description || null, phone, category || 'boshqa', userId || null]
    );
    res.json({ job: result.rows[0] });
  } catch (error: any) {
    console.error('Job create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить вакансию (только своё)
app.post('/api/jobs/delete', async (req, res) => {
  try {
    const { jobId, userId } = req.body;
    if (!jobId || !userId) return res.status(400).json({ error: 'ID kerak' });
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING position',
      [jobId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Bu vakansiya sizga tegishli emas" });
    }
    res.json({ ok: true, position: result.rows[0].position });
  } catch (error: any) {
    console.error('Job delete error:', error);
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
// Полный список ресторанов + рейтинги + мои оценки ОДНИМ запросом
app.get('/api/restaurants/list-full', async (req, res) => {
  try {
    const { userId } = req.query;

       // ⚡ БЕЗ фото: только метаданные (ускорение в 10-20 раз)
    const restaurants = await pool.query(
      `SELECT id, name, category, address, phone, hours, description, created_at 
       FROM restaurants 
       ORDER BY created_at DESC`
    );

    const ratings = await pool.query(
      'SELECT restaurant_id, AVG(rating) as avg, COUNT(*) as count FROM restaurant_ratings GROUP BY restaurant_id'
    );

    let myRatings: any[] = [];
    if (userId) {
      const r = await pool.query(
        'SELECT restaurant_id, rating FROM restaurant_ratings WHERE user_id = $1',
        [userId]
      );
      myRatings = r.rows;
    }

        const ratingsMap: any = {};
    ratings.rows.forEach(r => {
      const avgNum = Number(r.avg);
      ratingsMap[r.restaurant_id] = {
        avg: Math.round(avgNum * 10) / 10,
        count: Number(r.count),
      };
    });

    const myMap: any = {};
    myRatings.forEach(r => {
      myMap[r.restaurant_id] = r.rating;
    });

    const result = restaurants.rows.map(r => ({
      ...r,
      avgRating: ratingsMap[r.id]?.avg || 0,
      ratingCount: ratingsMap[r.id]?.count || 0,
      myRating: myMap[r.id] || null,
    }));

    res.json({ restaurants: result });
  } catch (error: any) {
    console.error('List-full error:', error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/restaurants/create', async (req, res) => {
  try {
    const { adminId, name, category, address, phone, description } = req.body;
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
    if (!name) return res.status(400).json({ error: 'Укажите название' });
    const result = await pool.query('INSERT INTO restaurants (name, category, address, phone, description) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, category || null, address || null, phone || null, description || null]);
    res.json({ restaurant: result.rows[0] });
  } catch (error: any) {
    console.error('Restaurant create error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Оценить ресторан (только один раз)
app.post('/api/restaurants/rate', async (req, res) => {
  try {
    const { restaurantId, rating, userId } = req.body;
    if (!restaurantId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Неверная оценка' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'Avval Telegram orqali kiring' });
    }

    // Проверка: уже оценивал?
    const existing = await pool.query(
      'SELECT id FROM restaurant_ratings WHERE restaurant_id = $1 AND user_id = $2',
      [restaurantId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Siz allaqachon baholagansiz' });
    }

    await pool.query(
      'INSERT INTO restaurant_ratings (restaurant_id, rating, user_id) VALUES ($1, $2, $3)',
      [restaurantId, rating, userId]
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
// Моя оценка ресторана
app.get('/api/restaurants/my-rating/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { userId } = req.query;
    if (!userId) return res.json({ rating: null });

    const result = await pool.query(
      'SELECT rating FROM restaurant_ratings WHERE restaurant_id = $1 AND user_id = $2',
      [restaurantId, userId]
    );
    res.json({ rating: result.rows.length > 0 ? result.rows[0].rating : null });
  } catch (error: any) {
    console.error('My rating error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Загрузка фото одного ресторана (по клику — быстрее в 10 раз)
app.get('/api/restaurants/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT image_url, menu_images FROM restaurants WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({
      image_url: result.rows[0].image_url,
      menu_images: result.rows[0].menu_images || [],
    });
  } catch (error: any) {
    console.error('Photos error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ DO'KONLAR VA XIZMATLAR ============

// Список магазинов/услуг
app.get('/api/shops/list', async (req, res) => {
  try {
       const { category } = req.query;
    // ⚡ БЕЗ фото: только метаданные (ускорение в 10 раз)
    let query = `SELECT id, category, name, address, phone, hours, description, created_at 
                 FROM shops`;
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ shops: result.rows });
  } catch (error: any) {
    console.error('Shops list error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Загрузка фото одного магазина (по клику — быстрее в 10 раз)
app.get('/api/shops/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT image_url FROM shops WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({
      image_url: result.rows[0].image_url || null,
    });
  } catch (error: any) {
    console.error('Shop photos error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Создать магазин/услугу (только админ)
app.post('/api/shops/create', async (req, res) => {
  try {
    const { adminId, category, name, address, phone, hours, description, imageUrl } = req.body;
    if (Number(adminId) !== SUPER_ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    if (!category || !name) {
      return res.status(400).json({ error: 'Kategoriya va nomi kerak' });
    }
    const result = await pool.query(
      `INSERT INTO shops (category, name, address, phone, hours, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [category, name, address || null, phone || null, hours || null, description || null, imageUrl || null]
    );
    res.json({ shop: result.rows[0] });
  } catch (error: any) {
    console.error('Shop create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить магазин/услугу
app.post('/api/shops/delete', async (req, res) => {
  try {
    const { adminId, shopId } = req.body;
    if (Number(adminId) !== SUPER_ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const result = await pool.query('DELETE FROM shops WHERE id = $1 RETURNING name', [shopId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topilmadi' });
    }
    res.json({ ok: true, name: result.rows[0].name });
  } catch (error: any) {
    console.error('Shop delete error:', error);
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
    let query = 'SELECT id, category, title, content, source, image_url, youtube_url, instagram_url, created_at FROM news';
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(query, params);

    // Преобразуем file_id в URL через Telegram getFile
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const news = await Promise.all(result.rows.map(async (item) => {
      if (item.image_url && !item.image_url.startsWith('http') && botToken) {
        try {
          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${item.image_url}`);
          const fileData = await fileRes.json();
          if (fileData.ok) {
            item.image_url = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          }
        } catch (e) {
          console.error('News image error:', e);
        }
      }
      return item;
    }));

    res.json({ news });
  } catch (error: any) {
    console.error('News list error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news/create', async (req, res) => {
  try {
    const { adminId, category, title, content, imageUrl, source } = req.body;
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
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
    const response = await fetch('https://t.me/s/kunuz');
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
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
    await pool.query("UPDATE events SET status = 'active' WHERE id = $1", [eventId]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Event approve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ IBODAT (NAMOZ VAQTLARI — namoz-vaqti.uz) ============
let prayerCache: { date: string; data: any } | null = null;

app.get('/api/prayer-times', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' });
    // Формат: DD.MM.YYYY
    const [day, month, year] = today.split('.').reverse().join('.').split('.');
    // Пересобираем как DD.MM.YYYY
    const todayStr = today.split('.').length === 3 ? today : today;
    // Правильный формат: DD.MM.YYYY
    const now = new Date();
    const tashkentDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
    const dd = String(tashkentDate.getDate()).padStart(2, '0');
    const mm = String(tashkentDate.getMonth() + 1).padStart(2, '0');
    const yyyy = tashkentDate.getFullYear();
    const dateKey = `${dd}.${mm}.${yyyy}`;

    // Кеш на 1 час
    if (prayerCache && prayerCache.date === dateKey) {
      return res.json(prayerCache.data);
    }

    const response = await fetch('https://namoz-vaqti.uz/?lang=lotin&period=month&region=bekobod');
    const html = await response.text();
    const $ = cheerio.load(html);

    // Ищем строку таблицы с сегодняшней датой
    let found: any = null;

    $('tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 7) {
        const rowDate = $(cells[0]).text().trim();
        if (rowDate === dateKey) {
          found = {
            date: rowDate,
            Fajr: $(cells[1]).text().trim(),
            Sunrise: $(cells[2]).text().trim(),
            Dhuhr: $(cells[3]).text().trim(),
            Asr: $(cells[4]).text().trim(),
            Maghrib: $(cells[5]).text().trim(),
            Isha: $(cells[6]).text().trim(),
          };
          return false; // break
        }
      }
    });

    if (!found) {
      // Если сегодня не нашли (например, конец месяца) — берём первую строку
      const firstRow = $('tr').filter((i, row) => $(row).find('td').length >= 7).first();
      const cells = firstRow.find('td');
      if (cells.length >= 7) {
        found = {
          date: $(cells[0]).text().trim(),
          Fajr: $(cells[1]).text().trim(),
          Sunrise: $(cells[2]).text().trim(),
          Dhuhr: $(cells[3]).text().trim(),
          Asr: $(cells[4]).text().trim(),
          Maghrib: $(cells[5]).text().trim(),
          Isha: $(cells[6]).text().trim(),
        };
      }
    }

    if (!found) {
      throw new Error('Namoz vaqtlari topilmadi');
    }

    // Hijri дата (можно взять с Aladhan отдельно, если нужно)
    let hijri = { day: '', month: '', year: '' };
    try {
           const hRes = await fetch('https://api.aladhan.com/v1/gToH?date=' + dateKey);
      const hData = await hRes.json();
      if (hData.code === 200) {
        hijri = {
          day: hData.data.hijri.day,
          month: hData.data.hijri.month.en,
          year: hData.data.hijri.year,
        };
      }
    } catch (e) {
      // Если не получилось — оставляем пустым
    }

    const result = {
      timings: {
        Fajr: found.Fajr,
        Sunrise: found.Sunrise,
        Dhuhr: found.Dhuhr,
        Asr: found.Asr,
        Maghrib: found.Maghrib,
        Isha: found.Isha,
      },
      hijri,
      gregorian: {
        date: found.date,
        weekday: tashkentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Tashkent' }),
      },
    };

    prayerCache = { date: dateKey, data: result };
    res.json(result);
  } catch (error: any) {
    console.error('Prayer times error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ HADISLAR ============

// Список категорий хадисов
app.get('/api/hadith/categories', async (req, res) => {
  try {
    const response = await fetch('https://hadeethenc.com/api/v1/categories/list/?language=uz');
    const data = await response.json();
    // Только корневые категории (parent_id === null)
    const rootCategories = data.filter((c: any) => c.parent_id === null);
    res.json({ categories: rootCategories });
  } catch (error: any) {
    console.error('Hadith categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Список хадисов в категории
app.get('/api/hadith/list', async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: 'category required' });

    const response = await fetch(`https://hadeethenc.com/api/v1/hadeeths/list/?language=uz&category_id=${category}`);
    const data = await response.json();
    res.json({ hadiths: data.data || [], meta: data.meta || {} });
  } catch (error: any) {
    console.error('Hadith list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Полный хадис по ID
app.get('/api/hadith/one', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    const response = await fetch(`https://hadeethenc.com/api/v1/hadeeths/one/?language=uz&id=${id}`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Hadith one error:', error);
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
// ============ MORNING MESSAGE (утреннее уведомление) ============
app.get('/api/cron/morning-message', async (req, res) => {
  try {
     // Проверка секрета
const secret = req.query.secret;
if (secret !== process.env.CRON_SECRET) {
  return res.status(403).json({ error: 'Forbidden' });
}

// 🧪 ТЕСТОВЫЙ РЕЖИМ: если test=1, отправляем ТОЛЬКО админу
const testMode = req.query.test === '1';

// Проверка времени: отправляем только после 8:00 по Ташкенту
if (!testMode) {
  const tashkentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' });
  const tashkentHour = new Date(tashkentTime).getHours();
  if (tashkentHour < 8) {
    return res.json({ ok: true, message: 'Too early (before 8:00 Tashkent)' });
  }
}

        // Проверяем, не отправляли ли уже сегодня (только в обычном режиме)
    const today = new Date().toISOString().split('T')[0];
    if (!testMode) {
      const lastSent = await pool.query(
        "SELECT value FROM cron_state WHERE key = 'last_morning_message'"
      );
      if (lastSent.rows.length > 0 && lastSent.rows[0].value === today) {
        return res.json({ ok: true, message: 'Already sent today' });
      }
    }

   // === 1. Погода ===
const lat = 40.22;
const lon = 69.22;
let temp = 0, humidity = 0, wind = 0;
try {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
  console.log('🌤 Fetching:', weatherUrl);

  const weatherRes = await fetch(weatherUrl);
  console.log('🌤 Status:', weatherRes.status);

  const weatherText = await weatherRes.text();
  console.log('🌤 Raw response:', weatherText.substring(0, 500));

  const weatherData: any = JSON.parse(weatherText);
  temp = Math.round(weatherData?.current?.temperature_2m || 0);
  humidity = weatherData?.current?.relative_humidity_2m || 0;
  wind = weatherData?.current?.wind_speed_10m || 0;

  console.log('🌤 Parsed:', { temp, humidity, wind });
} catch (e: any) {
  console.error('❌ Weather error:', e.message);
}

    // === 2. Курс валют ===
    const ratesRes = await fetch('https://cbu.uz/ru/arkhiv-kursov-valyut/json/');
    const ratesData: any[] = await ratesRes.json();

    const usd = ratesData.find((r: any) => r.Ccy === 'USD');
    const eur = ratesData.find((r: any) => r.Ccy === 'EUR');
    const rub = ratesData.find((r: any) => r.Ccy === 'RUB');

    
         // === 3.1. Время молитв ===
    let prayerFajr = '—', prayerDhuhr = '—', prayerAsr = '—', prayerMaghrib = '—', prayerIsha = '—';
    try {
      const todayDate = new Date();
      const dd = String(todayDate.getDate()).padStart(2, '0');
      const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
      const yyyy = todayDate.getFullYear();
      const dateKey = `${dd}.${mm}.${yyyy}`;

      const prayerRes = await fetch('https://namoz-vaqti.uz/?lang=lotin&period=month&region=bekobod');
      const prayerHtml = await prayerRes.text();
      const $ = cheerio.load(prayerHtml);

      $('tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 7) {
          const rowDate = $(cells[0]).text().trim();
          if (rowDate === dateKey) {
            prayerFajr = $(cells[1]).text().trim();
            prayerDhuhr = $(cells[3]).text().trim();
            prayerAsr = $(cells[4]).text().trim();
            prayerMaghrib = $(cells[5]).text().trim();
            prayerIsha = $(cells[6]).text().trim();
            return false;
          }
        }
      });
    } catch (e) {
      console.error('Prayer times error:', e);
    }

    // === 3.2. Дата ===
    const now = new Date();
    const weekdays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const weekday = weekdays[now.getDay()];
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    // === 3.3. Сообщение ===
    const message =
      `🌅 <b>Xayrli tong, Bekobod!</b>\n\n` +
      `📅 <b>${dateStr}, ${weekday}</b>\n\n` +
      `🌤 <b>Bugungi ob-havo:</b>\n` +
      `🌡 +${temp}°C\n` +
      `💧 Namlik: ${humidity}%\n` +
      `💨 Shamol: ${wind} km/soat\n\n` +
      `💵 <b>Valyuta kurslari:</b>\n` +
      (usd ? `🇺🇸 1 USD = ${Math.round(Number(usd.Rate))} so'm\n` : '') +
      (eur ? `🇪🇺 1 EUR = ${Math.round(Number(eur.Rate))} so'm\n` : '') +
      (rub ? `🇷🇺 1 RUB = ${Math.round(Number(rub.Rate))} so'm\n` : '') +
      `\n🕌 <b>Namoz vaqtlari:</b>\n` +
      `🌅 Bomdod: ${prayerFajr}\n` +
      `🌞 Peshin: ${prayerDhuhr}\n` +
      `🌤 Asr: ${prayerAsr}\n` +
      `🌆 Shom: ${prayerMaghrib}\n` +
      `🌙 Xufton: ${prayerIsha}`;

    // === 4. Рассылка ===
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return res.status(500).json({ error: 'No bot token' });

        let usersResult;
    if (testMode) {
      // 🧪 Только админу
      usersResult = { rows: [{ user_id: SUPER_ADMIN }] };
      console.log('🧪 TEST MODE: отправка только админу', SUPER_ADMIN);
    } else {
      // Всем
      usersResult = await pool.query(`
        SELECT user_id FROM app_users
        UNION
        SELECT user_id FROM bot_users
      `);
    }

    let sent = 0;
    let failed = 0;

    for (const user of usersResult.rows) {
      try {
        const res2 = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.user_id,
            text: message,
            parse_mode: 'HTML',
          }),
        });
        const data: any = await res2.json();
        if (data.ok) sent++;
        else failed++;
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 50));
    }

       // === 5. Сохраняем, что отправили (только в обычном режиме) ===
    if (!testMode) {
      await pool.query(
        `INSERT INTO cron_state (key, value, updated_at)
         VALUES ('last_morning_message', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [today]
      );
    }

    res.json({ ok: true, sent, failed, date: today });
  } catch (error: any) {
    console.error('Morning message error:', error);
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

    if (!ADMINS.includes(Number(adminId))) {
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

    if (!ADMINS.includes(Number(adminId))) {
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
    if (!ADMINS.includes(Number(adminId))) return res.status(403).json({ error: 'Доступ запрещён' });
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
app.post('/api/translate', strictLimiter, async (req, res) => {
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
// Загрузка фото (сжатие + base64, без внешних сервисов)
app.post('/api/upload-image', strictLimiter, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'image required' });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // ⚡ Сжимаем до 800px, качество 80% (как у ресторанов)
    const compressed = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const url = `data:image/jpeg;base64,${compressed.toString('base64')}`;
    res.json({ url, thumb: url });
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
    // ⚡ БЕЗ фото: только метаданные (ускорение в 10 раз)
    let query = `SELECT id, category, title, description, price, phone, user_id, status, created_at, username, first_name 
                 FROM listings WHERE status = 'active'`;
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
// Загрузка фото одного объявления (по клику — быстрее в 10 раз)
app.get('/api/listings/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT image_urls FROM listings WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({
      image_urls: result.rows[0].image_urls || [],
    });
  } catch (error: any) {
    console.error('Listing photos error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Создать объявление
app.post('/api/listings/create', async (req, res) => {
  try {
    const { category, title, description, price, phone, imageUrls, userId, username, firstName } = req.body;
    if (!category || !title || !phone) {
      return res.status(400).json({ error: 'Kategoriya, sarlavha va telefon kerak' });
    }
    const result = await pool.query(
      `INSERT INTO listings (category, title, description, price, phone, image_urls, user_id, username, first_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING *`,
      [category, title, description || null, price || null, phone, imageUrls || [], userId || null, username || null, firstName || null]
    );

    // Уведомление главному админу
    const photosCount = (imageUrls || []).length;
    const authorInfo = username ? `@${username}` : (firstName || 'Foydalanuvchi');

    await sendTelegramMessage(
      SUPER_ADMIN,
      `🆕 <b>Yangi e'lon (moderatsiya kerak)</b>\n\n` +
      `👤 ${authorInfo}\n` +
      `🆔 <code>${userId}</code>\n\n` +
      `📂 ${category}\n` +
      `📝 ${title}\n` +
      `💰 ${price || "yo'q"}\n` +
      `📞 ${phone}\n` +
      `🖼 Rasmlar: ${photosCount} ta\n` +
      `${description ? `📄 ${description.substring(0, 200)}...` : ''}\n\n` +
      `✅ Tasdiqlash: <code>/approve_listing ${result.rows[0].id}</code>\n` +
      `❌ Rad etish: <code>/reject_listing ${result.rows[0].id}</code>`
    );

    res.json({ listing: result.rows[0], pending: true });
  } catch (error: any) {
    console.error('Listing create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Пометить объявление как проданное
app.post('/api/listings/sold', async (req, res) => {
  try {
    const { listingId, userId } = req.body;
    if (!listingId || !userId) return res.status(400).json({ error: 'ID kerak' });

    // Проверяем, что объявление принадлежит пользователю
    const check = await pool.query(
      'SELECT user_id, title FROM listings WHERE id = $1',
      [listingId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'E\'lon topilmadi' });
    }
    if (Number(check.rows[0].user_id) !== Number(userId)) {
      return res.status(403).json({ error: 'Bu e\'lon sizga tegishli emas' });
    }

    // Помечаем как sold (не удаляем, чтобы сохранить историю)
    await pool.query(
      "UPDATE listings SET status = 'sold' WHERE id = $1",
      [listingId]
    );

    res.json({ ok: true, title: check.rows[0].title });
  } catch (error: any) {
    console.error('Listing sold error:', error);
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
// ============ ANNOUNCEMENTS (объявления от админа) ============

// Получить одно объявление по ID
app.get('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, text, created_at FROM announcements WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ announcement: result.rows[0] });
  } catch (error: any) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить все комментарии объявления
app.get('/api/announcements/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, user_id, user_name, text, created_at, admin_reply, admin_replied_at
       FROM announcement_comments 
       WHERE announcement_id = $1 
       ORDER BY created_at ASC 
       LIMIT 100`,
      [id]
    );
    res.json({ comments: result.rows });
  } catch (error: any) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить комментарий
app.post('/api/announcements/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, text } = req.body;

    if (!userId || !text || !text.trim()) {
      return res.status(400).json({ error: 'userId и text обязательны' });
    }

    // Проверка, что объявление существует
    const annCheck = await pool.query('SELECT id FROM announcements WHERE id = $1', [id]);
    if (annCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Сохраняем комментарий
    const result = await pool.query(
      `INSERT INTO announcement_comments (announcement_id, user_id, user_name, text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, userId, userName || null, text.trim()]
    );

    // Обновляем кнопку у ВСЕХ пользователей (в фоне)
    updateCommentsButton(Number(id)).catch(e => console.error('Update button error:', e));

    res.json({ comment: result.rows[0] });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ ADS (реклама) ============

// Список активной рекламы
app.get('/api/ads/list', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ads WHERE status = 'active' ORDER BY created_at DESC");
    res.json({ ads: result.rows });
  } catch (error: any) {
    console.error('Ads list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создать рекламу (только главный админ)
app.post('/api/ads/create', async (req, res) => {
  try {
    const { adminId, title, subtitle, phone, gradient } = req.body;
    if (Number(adminId) !== SUPER_ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Укажите заголовок' });
    }
    const result = await pool.query(
      `INSERT INTO ads (title, subtitle, phone, gradient) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, subtitle || null, phone || null, gradient || 'from-purple-600 to-indigo-700']
    );
    res.json({ ad: result.rows[0] });
  } catch (error: any) {
    console.error('Ad create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить рекламу (только главный админ)
app.post('/api/ads/delete', async (req, res) => {
  try {
    const { adminId, adId } = req.body;
    if (Number(adminId) !== SUPER_ADMIN) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const result = await pool.query('DELETE FROM ads WHERE id = $1 RETURNING title', [adId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topilmadi' });
    }
    res.json({ ok: true, title: result.rows[0].title });
  } catch (error: any) {
    console.error('Ad delete error:', error);
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