import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { ROLES } from "../constants";

const router = Router();

// GET /api/positions
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const positions = await prisma.position.findMany();
        res.json(positions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении должностей" });
    }
});

// GET /api/positions/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const position = await prisma.position.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!position) {
            return res.status(404).json({ error: 'Должность не найдена' });
        }
        res.json(position);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении должности' });
    }
});

// POST /api/positions
router.post("/", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Название обязательно' });
        }
        const newPosition = await prisma.position.create({
            data: { name },
        });
        res.status(201).json(newPosition);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при создании должности" });
    }
});

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
            return res.status(404).json({ error: 'Должность не найдена' });
        }
        console.error(error);
        res.status(500).json({ error: "Ошибка при обновлении должности" });
    }
});

// DELETE /api/positions/:id
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        await prisma.position.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: "Должность удалена" });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Должность не найдена' });
        }
        console.error(error);
        res.status(500).json({ error: "Ошибка при удалении должности" });
    }
});

export default router;