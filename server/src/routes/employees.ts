import { Router, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// GET /api/employees
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { baseId, role, isBlocked } = req.query;
    const where: any = {};

    if (req.user.role === 'worker') {
      where.employeeId = req.user.employeeId;
    } else {
      if (baseId) where.baseId = String(baseId);
      if (role) where.role = String(role);
      if (isBlocked !== undefined) where.isBlocked = String(isBlocked) === 'true';
    }

    const employees = await prisma.employee.findMany({ where });
    const result = employees.map(({ passwordHash, ...rest }) => rest);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/employees/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeId: req.params.id },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    if (req.user.role === 'worker' && req.user.employeeId !== req.params.id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { passwordHash, ...result } = employee;
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/employees — только admin
router.post('/', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { employeeId, fullName, email,phone, password, role, baseId } = req.body;

    if (!employeeId || !/^E\d{6}$/.test(employeeId)) {
      return res.status(400).json({ error: 'Неверный формат EmployeeID (E + 6 цифр)' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Пароль минимум 6 символов' });
    }

    const existing = await prisma.employee.findUnique({ where: { employeeId } });
    if (existing) {
      return res.status(400).json({ error: 'Сотрудник с таким EmployeeID уже существует' });
    }

    if (email) {
      const existingEmail = await prisma.employee.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email уже используется' });
      }
    }

    if (!phone) {
        return res.status(400).json({ error: 'Телефон обязателен' });
    }   

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        email,
        phone,
        passwordHash: hashedPassword,
        role: role || 'worker',
        baseId: baseId || null,
      },
    });

    const { passwordHash, ...result } = employee;
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/employees/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const target = await prisma.employee.findUnique({
      where: { employeeId: req.params.id },
    });

    if (!target) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    // Админ может всё
    if (req.user.role === 'admin') {
      const { password, employeeId, ...rest } = req.body;
      const data: any = { ...rest };

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: 'Пароль минимум 6 символов' });
        }
        data.passwordHash = await bcrypt.hash(password, 10);
      }

      const updated = await prisma.employee.update({
        where: { employeeId: req.params.id },
        data,
      });

      const { passwordHash, ...result } = updated;
      return res.json(result);
    }

    // Координатор может менять только isBlocked
    if (req.user.role === 'coordinator') {
      if (req.body.isBlocked !== undefined) {
        const updated = await prisma.employee.update({
          where: { employeeId: req.params.id },
          data: { isBlocked: req.body.isBlocked },
        });

        const { passwordHash, ...result } = updated;
        return res.json(result);
      }

      return res.status(403).json({ error: 'Координатор может менять только блокировку' });
    }

    // Worker может обновить только свой email
    if (req.user.role === 'worker' && req.user.employeeId === req.params.id) {
      const { email } = req.body;
      if (email !== undefined) {
        const updated = await prisma.employee.update({
          where: { employeeId: req.params.id },
          data: { email },
        });

        const { passwordHash, ...result } = updated;
        return res.json(result);
      }

      return res.status(403).json({ error: 'Недостаточно прав для изменения других полей' });
    }

    return res.status(403).json({ error: 'Недостаточно прав' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/employees/:id/toggle-block — toggle isBlocked (admin и coordinator)
router.patch('/:id/toggle-block', authenticate, requireRole('admin', 'coordinator'), async (req: Request, res: Response) => {
  try {
    const target = await prisma.employee.findUnique({
      where: { employeeId: req.params.id },
    });

    if (!target) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    const updated = await prisma.employee.update({
      where: { employeeId: req.params.id },
      data: { isBlocked: !target.isBlocked },
    });

    res.json({ employeeId: updated.employeeId, isBlocked: updated.isBlocked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;