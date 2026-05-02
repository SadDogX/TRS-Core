import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ error: 'EmployeeID и пароль обязательны' });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return res.status(401).json({ error: 'Неверный EmployeeID или пароль' });
    }

    const validPassword = await bcrypt.compare(password, employee.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный EmployeeID или пароль' });
    }

    const token = jwt.sign(
      {
        employeeId: employee.employeeId,
        role: employee.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    const { passwordHash, ...user } = employee;
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;