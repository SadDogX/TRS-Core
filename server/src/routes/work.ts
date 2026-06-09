import { Router, Request, Response } from "express"
import prisma from "../lib/prisma"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/requireRole"
import { MSG, ROLES, WORK_STATUSES } from "../constants"
import { error } from "node:console"
import { pictureDir } from "@tauri-apps/api/path"

const router = Router()
/* --------------------------------- Create --------------------------------- */
router.post("/", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name, status, wellId, workTypeId, supervisorId } = req.body
        if (status && !WORK_STATUSES.includes(status)) {
            return res.status(400).json({ error: MSG.WORK_STATUS_IS_WRONG })
        }


        const supervisor = await prisma.employee.findFirst({
            where: { id: supervisorId }
        })
        if (!supervisor) {
            return res.status(404).json({ error: MSG.EMP_ID_WRONG })
        }


        const work = await prisma.work.create({
            data: {
                name: name,
                wellId: wellId,
                status: status,
                supervisorId: supervisorId,
                workTypeId: workTypeId
            }
        })
        console.log(work)
        res.status(201).json({ message: MSG.WORK_IS_CREATED, data: work })


    } catch (error: any) {
        console.log(error)
        res.json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Read By Id --------------------------------- */
router.get("/:id", authenticate, async (req: Request, res: Response) => {
    try {
        const where: any = {}
        where.id = req.params.id
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.LEADER:
                where.supervisorId = req.user.employeeId
                break;
            case ROLES.WORKER:
                where.assignments = { some: { employeeId: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break;
        }
        const work = await prisma.work.findFirst({
            where: where,
            include: { team: true, assignments: true }
        })
        if (!work) {
            return res.status(404).json({ error: MSG.ACCESS_DENIED })
        }
        console.log(work)
        return res.status(200).json({ message: MSG.WORK_DATA_GET_OK, data: work })
    } catch (error) {
        console.log(MSG.SERVER_ERROR)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* -------------------------------- Read all -------------------------------- */
router.get("/works", authenticate, async (req: Request, res: Response) => {
    try {
        const where: any = {};
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.LEADER:
                where.supervisorId = req.user.employeeId
                break;
            case ROLES.WORKER:
                where.assignments = { some: { employeeId: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break;
        }
        const works = await prisma.work.findMany({ where })
        console.log(works)
        res.status(200).json({ message: MSG.WORK_DATA_GET_OK, data: works })
    } catch (error) {
        console.log(MSG.SERVER_ERROR)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Update --------------------------------- */
router.put("/:id", authenticate, requireRole(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.LEADER), async (req: Request, res: Response) => {
    try {

        const where: any = {};
        where.id = req.params.id
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } };
                break;
            case ROLES.LEADER:
                where.supervisorId = req.user.employeeId
                break;
            case ROLES.ADMIN:
                break;
        }
        const target = await prisma.work.findFirst({
            where: where,
            include: { team: true }
        })
        if (!target) {
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        }

        const data = req.body
        const updated_target = await prisma.work.update({
            where: { id: target.id },
            data: data
        })
        res.status(200).json({ message: MSG.WORK_UPDATE_OK, data: updated_target })
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.patch("/:id/status", authenticate, requireRole(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.LEADER), async (req: Request, res: Response) => {
    try {
        const where: any = {}
        where.id = req.params.id;

        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.LEADER:
                where.supervisorId = req.user.employeeId;
                break;
            case ROLES.ADMIN:
                break;
        }

        const target = await prisma.work.findFirst({
            where: where,
            include: { team: true }
        })

        if (!target) {
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        }

        const { new_status } = req.body
        if (!WORK_STATUSES.includes(new_status)) {
            return res.status(400).json({ error: MSG.WORK_STATUS_IS_WRONG })
        }

        const update_target = await prisma.work.update({
            where: { id: req.params.id },
            data: {
                status: new_status
            }
        })
        res.status(200).json({ message: MSG.WORK_UPDATE_OK, data: update_target })
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Hard Delete --------------------------------- */
router.delete("/:id/hard", authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        await prisma.work.delete({
            where: { id: req.params.id }
        })
        res.status(200).json({ message: "Успешное удаление." })
    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(400).json({ error: MSG.WORK_ID_WRONG })
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Soft Delete --------------------------------- */
router.delete("/:id/soft", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.LEADER), async (req: Request, res: Response) => {
    try {
        const where: any = {}
        where.id = req.params.id
        switch (req.user.role) {
            case ROLES.LEADER:
                where.supervisorId = req.user.employeeId
                break;
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break
        }
        const target = await prisma.work.findFirst({ where })

        if (!target) {
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        }

        await prisma.work.update({
            where: { id: target.id },
            data: {
                isDeleted: true
            }
        })

        res.status(200).json({ message: MSG.WORK_SOFT_DELETE })

    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Restore delete item --------------------------------- */
router.patch("/:id/restore", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.LEADER), async (req: Request, res: Response) => {
    try {
        const where: any = {}
        where.id = req.params.id
        switch (req.user.role) {
            case ROLES.LEADER:
                where.supervisorId = req.user.employeeId
                break;
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break
        }
        const target = await prisma.work.findFirst({ where })

        if (!target) {
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        }

        await prisma.work.update({
            where: { id: target.id },
            data: {
                isDeleted: false
            }
        })

        res.status(200).json({ message: MSG.WORK_RESTORE })

    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* ----------------------------- TEAM ASSIGmMENT ---------------------------- */
router.patch("/:id/assign", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { workId } = req.body
        const team = await prisma.team.findFirst({ where: { id: req.params.id } })
        if (!team) {
            return res.status(404).json({ error: MSG.TEAM_ID_WRONG })
        }
        if (team.isDeleted) {
            return res.status(400).json({ error: MSG.TEAM_IS_DELETED_SOFT })
        }
        if (team.workId) {
            return res.status(400).json({ error: MSG.TEAM_SET_ALREADY })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.employeeId) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED })
        }
        const work = await prisma.work.findFirst({ where: { id: workId, isDeleted: false } });
        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ID_WRONG });
        }
        const workBusy = await prisma.team.findFirst({ where: { workId: workId, isDeleted: false } })

        if (workBusy) {
            return res.status(400).json({ error: MSG.TEAM_ASSIGNED_ALREADY });
        }

        await prisma.team.update({
            where: {
                id: team.id
            },
            data: { workId: workId }
        })

        res.status(200).json({ message: MSG.TEAM_ASSIGNED_TO_WORK });
    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.patch("/:id/unassign", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const team = await prisma.team.findFirst({ where: { id: req.params.id } })
        if (!team) {
            return res.status(404).json({ error: MSG.TEAM_ID_WRONG })
        }
        if (team.isDeleted) {
            return res.status(400).json({ error: MSG.TEAM_IS_DELETED_SOFT })
        }
        if (!team.workId) {
            return res.status(400).json({ error: MSG.TEAM_ALREADY_FREE  })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.employeeId) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED })
        }


        await prisma.team.update({
            where: {
                id: team.id
            },
            data: { workId: null }
        })

        res.status(200).json({ message: MSG.TEAM_ASSIGNED_TO_WORK });
    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
export default router