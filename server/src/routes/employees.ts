import { Router, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { ENTITY, MSG, ROLES, ROLESNAME } from '../constants';
import { getEmpployeeDependencies } from '../services/employee.service';

const router = Router();

/* --------------------------------- CREATE --------------------------------- */
router.post('/', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { employeeId, fullName, positionId, email, phone, password, role, baseId } = req.body;
    console.log(employeeId)
    if (!employeeId || !/^E\d{6}$/.test(employeeId)) {
      return res.status(400).json({ error: MSG.STR_EXXXXXX_WRONG_FORMAT(employeeId) });
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

    const existingPhone = await prisma.employee.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: `Телефон : ${existingPhone.phone} уже используется у пользователя - ${existingPhone.fullName}` });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        positionId,
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
    console.error('POST /api/employees:', error);
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

    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.WORKER) {
      where.isDeleted = false;
    }

    const employees = await prisma.employee.findMany(
      {
        where,
        include: {
          position: true,
          base: true
        },

      });
    const result = employees.map(({ passwordHash, ...rest }) => rest);
    res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.EMPLOYEE), data: result });
  } catch (error) {
    console.error('GET /api/employees:', error);
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
    console.error('GET /api/employees/:id:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* --------------------------------- UPDATE --------------------------------- */
// PUT /api/employees/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const target = await prisma.employee.findUnique({
      where: { id: req.params.id },
    });

    if (!target) {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }

    if (req.user.role === ROLES.ADMIN) {
      const { password, id, ...rest } = req.body;
      const data: any = { ...rest };

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: MSG.STR_PASSWORD_WRONG_FORMAT });
        }
        data.passwordHash = await bcrypt.hash(password, 10);
      }
      const updated = await prisma.employee.update({
        where: { id: req.params.id },
        data,
      });

      const { passwordHash, ...result } = updated;
      return res.json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.EMPLOYEE, result.id), data: result });
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
        return res.json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.EMPLOYEE, result.id), data: result });
      }

      return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.WORKER]) });
    }

    return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.LEADER]) });
  } catch (error) {
    console.error('PUT /api/employees/:id:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- BLOCKED ------------------------------ */
// PATCH /api/employees/:id/toggle-block — toggle isBlocked (admin и coordinator)
router.patch('/:id/toggle-block', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const target = await prisma.employee.findUnique({
      where: { id: req.params.id },
    });

    if (!target) {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }

    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: { isBlocked: !target.isBlocked },
    });

    res.json({  message: MSG.ENTITY_WAS_UPDATED(ENTITY.EMPLOYEE, updated.employeeId), data: { isBlocked: updated.isBlocked }, });
  } catch (error) {
    console.error('PATCH /api/employees/:id/toggle-block:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- SOFT DELETE ------------------------------ */
router.delete('/:id/soft', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
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
    console.error('DELETE /api/employees/:id/soft', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});

/* ------------------------------- HARD DELETE ------------------------------ */
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const dependencies=await getEmpployeeDependencies(prisma, req.params.id)
    if (dependencies.hasDependencies) {
      return res.status(400).json({ error: MSG.ENTITY_HAS_DEPENDENCIES(ENTITY.EMPLOYEE, req.params.id),data:dependencies });
    }
    await prisma.employee.delete({
      where: { id: req.params.id }
    });
    res.json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.EMPLOYEE, req.params.id), data: null });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }
    console.error('DELETE /api/employees/:id/hard:', error);
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
    res.json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.EMPLOYEE, updated.fullName), data: result });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, req.params.id) });
    }
    console.error('PATCH /api/employees/:id/restore:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});

export default router;
