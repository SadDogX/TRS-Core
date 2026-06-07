import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { MSG, ROLES } from "../constants";
import { error, log } from "node:console";
import { read } from "node:fs";

const router = Router();

// GET /api/positions
/* -------------------------------- READ ALL -------------------------------- */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const positions = await prisma.position.findMany();
        if (positions.length == 0) {
            return res.json({ message: MSG.TBL_IS_EMPTY })
        }
        res.json(positions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* ------------------------------- READ BY ID ------------------------------- */
// GET /api/positions/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const position = await prisma.position.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!position) {
            return res.status(404).json({ error: MSG.POS_ID_WRONG });
        }
        res.json(position);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* --------------------------------- CREATE --------------------------------- */
// POST /api/positions
router.post("/", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: MSG.REQ_POSITION });
        }
        const newPosition = await prisma.position.create({
            data: { name },
        });
        res.status(201).json(newPosition);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* --------------------------------- UPDATE --------------------------------- */
// PUT /api/positions/:id
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const position = await prisma.position.update({
            where: { id: parseInt(req.params.id) },
            data: { name },
        });
        res.json(position);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.POS_ID_WRONG });
        }
        console.error(error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
/* ------------------------------- HARD DELETE ------------------------------ */
// DELETE /api/positions/:id
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        await prisma.position.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: MSG.POS_IS_DELETED });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.POS_ID_WRONG });
        }
        console.error(error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
//! ------------------------------- SOFT DELETE ------------------------------ */
router.patch('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({ error: MSG.POS_ID_WRONG })
        }
        const position = await prisma.position.findFirst(
            {
                where: {
                    id
                }
            }
        )
        if (!position) {
            return res.json({ error: MSG.POS_ID_WRONG })
        }
        await prisma.position.update(
            {
                where: { id },
                data: {
                    isDeleted: !position.isDeleted
                }
            }
        )
        res.json({ message: MSG.POS_IS_CHECK_DELETED });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: MSG.POS_ID_WRONG });
        }
        console.error(error);
        res.status(500).json({ error: MSG.SERVER_ERROR });
    }
});
export default router;