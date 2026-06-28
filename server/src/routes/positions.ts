import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { ENTITY, MSG, ROLES } from "../constants";


const router = Router();

/* --------------------------------- CREATE --------------------------------- */
router.post("/", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: MSG.REQ_POSITION });
        }
        const newPosition = await prisma.position.create({
            data: { name },
        });
        res.status(201).json({ message: MSG.ENTITY_WAS_CREATED(ENTITY.POSITION, newPosition.id), data: newPosition });
    } catch (error) {
        console.error('POST /api/positions:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* -------------------------------- READ ALL -------------------------------- */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const positions = await prisma.position.findMany();
        if (positions.length == 0) {
            return res.json({ message: MSG.TBL_IS_EMPTY , data: [] })
        }
        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.POSITION), data: positions });

    } catch (error) {
        console.error('GET /api/positions:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* ------------------------------- READ BY ID ------------------------------- */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const position = await prisma.position.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!position) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }
        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.POSITION), data: position });

    } catch (error) {
        console.error('GET /api/positions/:id:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* --------------------------------- UPDATE --------------------------------- */
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const position = await prisma.position.update({
            where: { id: parseInt(req.params.id) },
            data: { name },
        });
        res.status(200).json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.POSITION, position.id), data: position });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }
        console.error('PUT /api/positions/:id:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* ------------------------------- HARD DELETE ------------------------------ */
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        await prisma.position.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.POSITION, req.params.id) ,data: { id: parseInt(req.params.id) } });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }
        console.error('DELETE /api/positions/:id/hard:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* ------------------------------- SOFT DELETE ------------------------------ */
router.delete('/:id/soft', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) ,data:{id:req.params.id} })
        }
        const position = await prisma.position.findFirst(
            {
                where: {
                    id
                }
            }
        )
        if (!position) {
            return res.json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id), data: { id: req.params.id } })
        }
        await prisma.position.update(
            {
                where: { id },
                data: {
                    isDeleted: !position.isDeleted
                }
            }
        )
        res.json({ message: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.POSITION, req.params.id), data: position });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }
        console.error('DELETE /api/positions/:id/soft:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* ------------------------------- RESTORE ------------------------------ */
router.patch('/:id/restore', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }

        const position = await prisma.position.findFirst({ where: { id } });
        if (!position) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }

        await prisma.position.update({
            where: { id },
            data: { isDeleted: false }
        });

        res.json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.POSITION, req.params.id), data: position });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.POSITION, req.params.id) });
        }
        console.error('PATCH /api/positions/:id/restore:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
export default router;