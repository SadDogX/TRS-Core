import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { ENTITY, MSG, ROLES } from '../constants';

const router = Router();

/* --------------------------------- CREATE --------------------------------- */
router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const { name, city, address } = req.body;
    if (!name || !city) {
      return res.status(400).json({ error: MSG.REQ_CITY });
    }
    const base = await prisma.base.create({
      data: { name, city, address },
    });
    res.status(201).json({message:MSG.ENTITY_WAS_CREATED(ENTITY.BASE,base.id),data:base});
  } catch (error) {
    console.error('POST /api/bases:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ---------------------------------- READ ---------------------------------- */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const bases = await prisma.base.findMany({
      include: {
        employees: {
          select: {
            employeeId: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
    res.status(200).json({message:MSG.ENTITY_WAS_READ(ENTITY.BASE),data:bases});
  } catch (error) {
    console.error('GET /api/bases:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- READ BY ID ------------------------------- */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const base = await prisma.base.findUnique({
      where: { id: req.params.id },
      include: {
        employees: {
          select: {
            employeeId: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
    if (!base) {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.BASE, req.params.id) })

    }
    res.status(200).json({message:MSG.ENTITY_WAS_READ(ENTITY.BASE),data:base});
  } catch (error) {
    console.error('GET /api/bases/:id:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* --------------------------------- UPDATE --------------------------------- */
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const { name, city, address } = req.body;
    const base = await prisma.base.update({
      where: { id: req.params.id },
      data: { name, city, address },
    });
    res.status(200).json({message:MSG.ENTITY_WAS_UPDATED(ENTITY.BASE,base.id),data:base});
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.BASE, req.params.id) })
    }
    console.error('PUT /api/bases/:id:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* --------------------------------- HARD DELETE --------------------------------- */
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    await prisma.base.delete({
      where: { id: req.params.id },
    });
    res.json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.BASE,req.params.id) });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.BASE, req.params.id) })
    }
    console.error('DELETE /api/bases/:id/hard:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- SOFT DELETE ------------------------------ */
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const base = await prisma.base.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    })
    res.json({ message: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.BASE,req.params.id) })
  } catch (error: any) {
    if (error.code == "P2025") {
      res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.BASE, req.params.id) })
    }
    console.error('DELETE /api/bases/:id/soft:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
})
/* --------------------------------- RESTORE --------------------------------- */
router.patch('/:id/restore', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const base = await prisma.base.update({
      where: { id: req.params.id },
      data: { isDeleted: false }
    });
    res.json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.BASE, req.params.id) });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.BASE, req.params.id) });
    }
    console.error('PATCH /api/bases/:id/restore:', error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
export default router;