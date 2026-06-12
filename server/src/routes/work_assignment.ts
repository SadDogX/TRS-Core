import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { MSG, ROLES } from "../constants";
import prisma from "../lib/prisma";
import { error } from "node:console";

const router = Router()

/* --------------------------------- Create --------------------------------- */
router.post("/:workId/assignments", authenticate, requireRole(ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { employeeId, role } = req.body
        const employee = await prisma.employee.findFirst({ where: { id: employeeId } })
        if (!employee) {
            return res.status(404).json({ error: MSG.EMP_ID_WRONG })
        }
        if (employee.isDeleted) {
            return res.status(400).json({ error: MSG.EMP_IS_DELETED })
        }
        if (employee.isBlocked) {
            return res.status(400).json({ error: MSG.EMP_IS_BLOCKED })
        }
        if (role !== "worker" && role !== "supervisor") {
            return res.status(400).json({ error: MSG.WORK_ROLE_INVALID });
        }

        const work = await prisma.work.findFirst({ where: { id: req.params.workId } })
        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }
        if (work.isDeleted) {
            return res.status(400).json({ error: MSG.WORK_SOFT_DELETE })
        }
        const alreadyAssignment = await prisma.workAssignment.findFirst({
            where: {
                workId: work.id,
                employeeId: employee.id,
                isDeleted: false
            }
        })
        if (alreadyAssignment) {
            return res.status(400).json({ error: MSG.WORK_ASSIGNMENT_ALREADY_EXISTS })
        }
        const work_assignment = await prisma.workAssignment.findMany({ where: { workId: req.params.workId, isDeleted: false } })
        if (work_assignment.length > 5) {
            return res.status(409).json({ error: MSG.WORK_ASSIGNMENT_EMPLOYEES_ENOUGHT })
        }

        const assignment = await prisma.workAssignment.create({
            data: {
                workId: work.id,
                employeeId: employee.id,
                role
            }
        })
        res.status(201).json({ message: MSG.WORK_ASSIGNMENT_IS_CREATED, data: assignment })

    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })

    }
})

/* --------------------------------- Read By Id --------------------------------- */
router.get('/:workId/assignments', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.LEADER, ROLES.WORKER), async (req: Request, res: Response) => {
    try {
        const work = await prisma.work.findFirst({
            where: {
                id: req.params.workId,
                isDeleted: false
            },
            include: {
                team: true
            }
        })
        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }

        const where: any = {}
        where.workId = work.id
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.work = { team: { is: { createdById: req.user.employeeId } } }
                break
            case ROLES.LEADER:
                where.work = { supervisorId: req.user.employeeId }
                break
            case ROLES.WORKER:
                where.employeeId = req.user.employeeId
                break
            case ROLES.ADMIN:
                break
        }
        const result = await prisma.workAssignment.findMany({
            where
        })

        res.status(200).json({ message: MSG.WORK_ASSIGNMENT_DATA_GET_OK, data: result })

    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })

    }
})

router.get('/:workId/assignments/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.LEADER, ROLES.WORKER), async (req: Request, res: Response) => {
    try {
        const work = await prisma.work.findFirst({
            where: {
                id: req.params.workId,
                isDeleted: false
            },
            include: {
                team: true
            }
        })
        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }

        const where: any = {}
        where.workId = work.id
        where.id = req.params.id
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.work = { team: { is: { createdById: req.user.employeeId } } }
                break
            case ROLES.LEADER:
                where.work = { supervisorId: req.user.employeeId }
                break
            case ROLES.WORKER:
                where.employeeId = req.user.employeeId
                break
            case ROLES.ADMIN:
                break
        }
        const result = await prisma.workAssignment.findFirst({
            where
        })
        if (!result) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }

        res.status(200).json({ message: MSG.WORK_ASSIGNMENT_DATA_GET_OK, data: result })

    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })

    }
})

/* -------------------------------- Read all -------------------------------- */
/* --------------------------------- Update --------------------------------- */
router.patch('/:workId/updaterole/:id', authenticate, requireRole(ROLES.COORDINATOR, ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        const work = await prisma.work.findFirst({
            where: {
                id: req.params.workId,
                isDeleted: false
            },
            include: {
                team: true
            }
        })
        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }

        if (req.user.role === ROLES.COORDINATOR && req.user.employeeId !== work.team?.createdById) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED })
        }
        const { newRole } = req.body

        if (![ROLES.LEADER, ROLES.WORKER].includes(newRole)) {
            return res.status(400).json({ error: MSG.WORK_ROLE_INVALID })
        }

        await prisma.workAssignment.update({
            where: {
                id: req.params.id,
                workId: work.id,
            },
            data: { role: newRole }
        })
        res.status(200).json({ message: MSG.WORK_ASSIGNMENT_ROLE_UPDATE_OK })

    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Hard Delete --------------------------------- */
router.delete('/:workId/assignments/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        const work = await prisma.work.findFirst({
            where: { id: req.params.workId },
            include: { team: true }
        })

        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }
        await prisma.workAssignment.delete({
            where: {
                workId: work.id,
                id: req.params.id
            }
        })
        res.status(200).json({ message: MSG.WORK_ASSIGNMENT_HARD_DELETE })
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Soft Delete --------------------------------- */
router.delete('/:workId/assignments/:id/soft', authenticate, requireRole(ROLES.ADMIN,ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const work = await prisma.work.findFirst({
            where: { id: req.params.workId },
            include: { team: true }
        })

        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }

        if(req.user.role===ROLES.COORDINATOR&& req.user.employeeId!==work.team?.createdById){
            return res.status(403).json({error:MSG.ACCESS_DENIED})
        }
        await prisma.workAssignment.update({
            where: {
                workId: work.id,
                id: req.params.id
            },
            data:{isDeleted:true}
        })
        res.status(200).json({ message: MSG.WORK_ASSIGNMENT_SOFT_DELETE })
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Restore delete item --------------------------------- */
router.patch('/:workId/assignments/:id/restore', authenticate, requireRole(ROLES.ADMIN,ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const work = await prisma.work.findFirst({
            where: { id: req.params.workId },
            include: { team: true }
        })

        if (!work) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ID_WRONG })
        }

        if(req.user.role===ROLES.COORDINATOR&& req.user.employeeId!==work.team?.createdById){
            return res.status(403).json({error:MSG.ACCESS_DENIED})
        }
        await prisma.workAssignment.update({
            where: {
                workId: work.id,
                id: req.params.id
            },
            data:{isDeleted:false}
        })
        res.status(200).json({ message: MSG.WORK_ASSIGNMENT_RESTORE })
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
export default router