import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

interface FileMeta {
  filename: string;
  originalname: string;
  uploadDate: number;
  lastDownloadDate: number | null;
  downloadCount: number;
}

const filesMeta: Record<string, FileMeta> = {};

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

const AUTH_TOKEN = "secret_example_token_123";
const USER = { username: "user", password: "password" };

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === USER.username && password === USER.password) {
    return res.json({ token: AUTH_TOKEN });
  }
  return res.status(401).json({ error: "Неверные учетные данные" });
});

app.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не был загружен" });
  }

  const fileMeta: FileMeta = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    uploadDate: Date.now(),
    lastDownloadDate: null,
    downloadCount: 0
  };
  filesMeta[req.file.filename] = fileMeta;

  res.json({ downloadUrl: `/download/${req.file.filename}` });
});

app.get("/download/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const meta = filesMeta[fileId];
  if (!meta) {
    return res.status(404).send("Файл не найден");
  }

  const filePath = path.join(UPLOAD_DIR, meta.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Файл не найден");
  }

  meta.lastDownloadDate = Date.now();
  meta.downloadCount++;

  res.download(filePath, meta.originalname);
});

app.get("/stats/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const meta = filesMeta[fileId];
  if (!meta) {
    return res.status(404).json({ error: "Файл не найден" });
  }
  res.json({
    originalName: meta.originalname,
    uploadDate: meta.uploadDate,
    lastDownloadDate: meta.lastDownloadDate,
    downloadCount: meta.downloadCount
  });
});

function cleanOldFiles() {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  for (const fileId in filesMeta) {
    const meta = filesMeta[fileId];
    const lastSeen = meta.lastDownloadDate ?? meta.uploadDate;
    if (now - lastSeen > THIRTY_DAYS) {
      const filePath = path.join(UPLOAD_DIR, meta.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Удалён файл: ${meta.filename}`);
      }
      delete filesMeta[fileId];
    }
  }
}

setInterval(cleanOldFiles, 12 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
