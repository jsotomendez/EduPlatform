import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// La carpeta de subidas estará en backend/uploads (subimos un nivel desde backend/config)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === '.pdf' ? '.pdf' : '';
    const baseName = path.basename(file.originalname, ext);
    // Remover caracteres potencialmente peligrosos o que no sean seguros en sistemas de archivos
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `submission_${Date.now()}_${safeBaseName}${safeExt}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isMimePdf = file.mimetype === 'application/pdf';
    const ext = path.extname(file.originalname).toLowerCase();
    const isExtPdf = ext === '.pdf';

    if (isMimePdf && isExtPdf) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

export { UPLOADS_DIR };
