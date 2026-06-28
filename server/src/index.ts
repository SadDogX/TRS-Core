import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Только после этого — все остальные импорты
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma';
import authRouter from './routes/auth';
import basesRouter from './routes/bases';
import employeesRouter from './routes/employees';
import postionsRouter from './routes/positions';
import teamRouter from './routes/teams';
import workRouter from './routes/work';
import workAssignments from './routes/work_assignment';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/bases', basesRouter);
app.use('/api/positions', postionsRouter);
app.use('/api/team',teamRouter);
app.use('/api/works',workRouter);
app.use('/api/workassignment',workAssignments)

app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);

app.get('/api/health', (req, res) => {
  res.json({ message:'Server is running',data:{status:'ok'} });
});
async function main() {
  try {
    await prisma.$connect();
    console.log('DB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();