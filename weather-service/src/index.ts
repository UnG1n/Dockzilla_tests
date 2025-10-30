import express from "express";
import axios from "axios";
import Redis from "ioredis";
import path from "path";

const app = express();
const PORT = 3000;
const redis = new Redis({
  lazyConnect: true,
  connectTimeout: 1000,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
});

// Инициализируем соединение с Redis, но не блокируем сервер при ошибке
redis.connect().catch(() => {
  console.warn("Redis is not available, working without persistent cache");
});

app.use(express.static(path.join(__dirname, "..", "public")));

const WEATHER_TTL = 15 * 60; // 15 минут

// Получить координаты по названию города
async function getCityCoords(city: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
  const response = await axios.get(url);
  if (response.data?.results?.length) {
    return {
      lat: response.data.results[0].latitude,
      lon: response.data.results[0].longitude,
      name: response.data.results[0].name,
      country: response.data.results[0].country,
    };
  }
  throw new Error("City not found");
}

// Получить прогноз погоды по координатам
async function getWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`;
  const response = await axios.get(url);
  return response.data;
}

async function readCache(key: string): Promise<any | null> {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function writeCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // ignore cache errors
  }
}

app.get("/weather", async (req, res) => {
  const rawCity = (req.query.city as string) || "";
  const city = rawCity.trim();
  if (!city) return res.status(400).json({ error: "city required" });

  const cacheKey = `weather:${city.toLowerCase()}`;

  try {
    const cached = await readCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const coords = await getCityCoords(city);
    const weather = await getWeather(coords.lat, coords.lon);

    // Берём только ближайшие 24 часа
    const times: string[] = weather.hourly?.time?.slice(0, 24) || [];
    const temperatures: number[] = weather.hourly?.temperature_2m?.slice(0, 24) || [];

    if (times.length === 0 || temperatures.length === 0) {
      return res.status(502).json({ error: "weather data unavailable" });
    }

    const result = {
      city: coords.name,
      country: coords.country,
      hourly: {
        time: times,
        temperature_2m: temperatures,
      },
    };

    await writeCache(cacheKey, result, WEATHER_TTL);
    return res.json(result);

  } catch (err) {
    return res.status(500).json({ error: (err as any)?.message || "unknown error" });
  }
});

// Корневой маршрут для удобства открытия страницы
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Weather server started at http://localhost:${PORT}`);
});
