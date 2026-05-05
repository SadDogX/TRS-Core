import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { MSG, ROLES } from '../constants';

const router = Router();

// GET /api/bases — все авторизованные могут смотреть
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
    res.json(bases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR  });
  }
});
/* ------------------------------- READ BY ID ------------------------------- */
// GET /api/bases/:id
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
      return res.status(404).json({ error: MSG.BASE_ID_WRONG });
    }
    res.json(base);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR});
  }
});

// POST /api/bases — только admin и coordinator
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
    res.status(201).json(base);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});

// PUT /api/bases/:id — только admin и coordinator
/* --------------------------------- UPDATE --------------------------------- */
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try {
    const { name, city, address } = req.body;
    const base = await prisma.base.update({
      where: { id: req.params.id },
      data: { name, city, address },
    });
    res.json(base);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.BASE_ID_WRONG });
    }
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* --------------------------------- HARD DELETE --------------------------------- */
// DELETE /api/bases/:id — только admin
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    await prisma.base.delete({
      where: { id: req.params.id },
    });
    res.json({ message: MSG.BASE_IS_DELETED});
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: MSG.BASE_ID_WRONG });
    }
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
});
/* ------------------------------- SOFT DELETE ------------------------------ */
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN,ROLES.COORDINATOR), async (req: Request, res: Response) => {
  try { 
    const base=await prisma.base.update({
      where:{id:req.params.id},
      data:{isDeleted:true}
    })
    res.json({message:MSG.BASE_IS_CHECK_DELETED})
  } catch (error:any) {
    if (error.code =="P2025"){
      console.log(MSG.BASE_ID_WRONG)
      res.json({error:MSG.BASE_ID_WRONG})
    }
    console.error(error);
    res.status(500).json({ error: MSG.SERVER_ERROR });
  }
})

export default router;