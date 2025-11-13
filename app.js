import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import incomeRoutes from './modules/construction/routes/income.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/construction/income', incomeRoutes);

export default app;
