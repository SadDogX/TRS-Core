import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { MSG } from '../constants';

const router = Router();

/* --------------------------------- LOGING --------------------------------- */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ error: MSG.REQ_EMP_ID_AND_PASSWORD});
    }
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return res.status(401).json({ error: MSG.WRONG_EMP_ID_OR_PASSWORD });
    }

    const validPassword = await bcrypt.compare(password, employee.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: MSG.WRONG_EMP_ID_OR_PASSWORD });
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
    res.json({ data:{token, user} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
    console.error('POST /api/auth/login:', error);
  }
});

export default router;