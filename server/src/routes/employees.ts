import { Router, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { ENTITY, MSG, ROLES, ROLESNAME } from '../constants';

const router = Router();

/* --------------------------------- CREATE --------------------------------- */
router.post('/', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { employeeId, fullName, email, phone, password, role, baseId } = req.body;

    if (!employeeId || !/^E\d{6}$/.test(employeeId)) {
      return res.status(400).json({ error: MSG.STR_MAIL_WRONG_FORMAT });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: MSG.STR_PASSWORD_WRONG_FORMAT });
    }

    const existing = await prisma.employee.findUnique({ where: { employeeId } });
    if (existing) {
      return res.status(400).json({ error: MSG.ENTITY_ALREADY_HAVE(ENTITY.EMPLOYEE, employeeId) });
    }

    if (email) {
      const existingEmail = await prisma.employee.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: MSG.STR_MAIL_ALREADY_HAVE });
      }
    }

    if (!phone) {
      return res.status(400).json({ error: MSG.REQ_FIELD_PHONE });
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
    res.status(201).json({ message: MSG.ENTITY_WAS_CREATED(ENTITY.EMPLOYEE, employeeId), data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* -------------------------------- READ ALL -------------------------------- */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { baseId, role, isBlocked } = req.query;
    const where: any = {};

    if (req.user.role === ROLES.WORKER) {
      where.employeeId = req.user.employeeId;
    } else {
      if (baseId) where.baseId = String(baseId);
      if (role) where.role = String(role);
      if (isBlocked !== undefined) where.isBlocked = String(isBlocked) === 'true';
    }

    const employees = await prisma.employee.findMany(
      {
        where,
        include: {
          postion: true
        },

      });
    const result = employees.map(({ passwordHash, ...rest }) => rest);
    res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.EMPLOYEE), data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- READ BY ID ------------------------------- */
// GET /api/employees/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeId: req.params.id },
    });

    if (!employee) {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }

    if (req.user.role === 'worker' && req.user.employeeId !== req.params.id) {
      return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.WORKER]) });
    }

    const { passwordHash, ...result } = employee;
    res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.EMPLOYEE), data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: MSG.SERVER_ERROR
    });
  }
});
/* --------------------------------- UPDATE --------------------------------- */
// PUT /api/employees/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const target = await prisma.employee.findUnique({
      where: { employeeId: req.params.id },
    });

    if (!target) {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }

    if (req.user.role === ROLES.ADMIN) {
      const { password, employeeId, ...rest } = req.body;
      const data: any = { ...rest };

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: MSG.STR_PASSWORD_WRONG_FORMAT });
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
    if (req.user.role === ROLES.COORDINATOR) {
      if (req.body.isBlocked !== undefined) {
        const updated = await prisma.employee.update({
          where: { employeeId: req.params.id },
          data: { isBlocked: req.body.isBlocked },
        });

        const { passwordHash, ...result } = updated;
        return res.status(200).json({ messge: MSG.ENTITY_WAS_UPDATED(ENTITY.EMPLOYEE, result.id), data: result });
      }

      return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]) });
    }

    // Worker может обновить только свой email
    if (req.user.role === ROLES.WORKER && req.user.employeeId === req.params.id) {
      const { email } = req.body;
      if (email !== undefined) {
        const updated = await prisma.employee.update({
          where: { employeeId: req.params.id },
          data: { email },
        });

        const { passwordHash, ...result } = updated;
        return res.json(result);
      }

      return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.WORKER]) });
    }

    return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.LEADER]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- BLOCKED ------------------------------ */
// PATCH /api/employees/:id/toggle-block — toggle isBlocked (admin и coordinator)
router.patch('/:id/toggle-block', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const target = await prisma.employee.findUnique({
      where: { employeeId: req.params.id },
    });

    if (!target) {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }

    const updated = await prisma.employee.update({
      where: { employeeId: req.params.id },
      data: { isBlocked: !target.isBlocked },
    });

    res.json({ employeeId: updated.employeeId, isBlocked: updated.isBlocked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- SOFT DELETE ------------------------------ */
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const updated = await prisma.employee.update({
      where: { employeeId: req.params.id },
      data: { isDeleted: true }
    });
    const { passwordHash, ...result } = updated;
    res.json({ message: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.EMPLOYEE, updated.fullName), data: result });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});

/* ------------------------------- HARD DELETE ------------------------------ */
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    await prisma.employee.delete({
      where: { employeeId: req.params.id }
    });
    res.json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.EMPLOYEE, req.params.id) });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});

/* ------------------------------- RESTORE ------------------------------ */
router.patch('/:id/restore', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const updated = await prisma.employee.update({
      where: { employeeId: req.params.id },
      data: { isDeleted: false }
    });
    const { passwordHash, ...result } = updated;
    res.json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.EMPLOYEE, updated.fullName) });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});

export default router;