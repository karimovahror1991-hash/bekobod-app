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

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============ TAXI ============

// Создать рейс (таксист)
app.post('/api/taxi/create', async (req, res) => {
  try {
    const { driverName, driverPhone, direction, totalSeats } = req.body;

    if (!driverName || !driverPhone || !direction) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const result = await pool.query(
      `INSERT INTO taxi_rides (driver_name, driver_phone, direction, total_seats, booked_seats, status)
       VALUES ($1, $2, $3, $4, 0, 'active')
       RETURNING *`,
      [driverName, driverPhone, direction, totalSeats || 4]
    );

    res.json({ ride: result.rows[0] });
  } catch (error: any) {
    console.error('Taxi create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Список активных рейсов
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

// Забронировать место (пассажир)
app.post('/api/taxi/book', async (req, res) => {
  try {
    const { rideId, passengerName, passengerPhone } = req.body;

    if (!rideId) {
      return res.status(400).json({ error: 'Не указан рейс' });
    }

    // Проверяем, есть ли места
    const rideResult = await pool.query(
      'SELECT * FROM taxi_rides WHERE id = $1',
      [rideId]
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Рейс не найден' });
    }

    const ride = rideResult.rows[0];

    if (ride.booked_seats >= ride.total_seats) {
      return res.status(400).json({ error: 'Мест больше нет' });
    }

    // Бронируем
    await pool.query(
      'INSERT INTO taxi_bookings (ride_id, passenger_name, passenger_phone) VALUES ($1, $2, $3)',
      [rideId, passengerName || null, passengerPhone || null]
    );

    // Обновляем счётчик
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

// Удалить рейс (таксист)
app.post('/api/taxi/delete', async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({ error: 'Не указан рейс' });
    }

    await pool.query('DELETE FROM taxi_rides WHERE id = $1', [rideId]);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('Taxi delete error:', error);
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