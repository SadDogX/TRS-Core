import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { ENTITY, MSG, ROLES, ROLESNAME } from "../constants";
import prisma from "../lib/prisma";

const router = Router()

/* --------------------------------- Create --------------------------------- */
router.post("/:workId/assignments", authenticate, requireRole(ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { id, role } = req.body
        const employee = await prisma.employee.findFirst({ where: { id: id } })
        if (!employee) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE,id) })
        }
        if (employee.isDeleted) {
            return res.status(400).json({ error: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.EMPLOYEE,id) })
        }
        if (employee.isBlocked) {
            return res.status(400).json({ error: MSG.EMP_IS_BLOCKED })
        }
        if (role !== ROLES.WORKER && role !== ROLES.LEADER) {
            return res.status(400).json({error:MSG.WORK_ROLE_INVALID});
        }

        const work = await prisma.work.findFirst({ where: { id: req.params.workId } })
        if (!work) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.id) })
        }
        if (work.isDeleted) {
            return res.status(400).json({ error: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.WORK,work.id) })
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
                workRole:role
            }
        })
        res.status(201).json({ message: MSG.ENTITY_WAS_CREATED(ENTITY.WORK_ASSIGNMENT,assignment.id), data: assignment })

    } catch (error) {
        console.error('POST /api/works/:workId/assignments:', error);
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
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.workId) })
        }

        const where: any = {}
        where.workId = work.id
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.work = { team: { is: { createdById: req.user.id } } }
                break
            case ROLES.LEADER:
                where.work = { supervisorId: req.user.id }
                break
            case ROLES.WORKER:
                where.employeeId = req.user.id
                break
            case ROLES.ADMIN:
                break
        }
        const result = await prisma.workAssignment.findMany({
            where
        })

        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.WORK_ASSIGNMENT), data: result })

    } catch (error) {
        console.error('GET /api/works/:workId/assignments:', error);
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
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.workId) })
        }

        const where: any = {}
        where.workId = work.id
        where.id = req.params.id
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.work = { team: { is: { createdById: req.user.id } } }
                break
            case ROLES.LEADER:
                where.work = { supervisorId: req.user.id }
                break
            case ROLES.WORKER:
                where.employeeId = req.user.id
                break
            case ROLES.ADMIN:
                break
        }
        const result = await prisma.workAssignment.findFirst({
            where
        })
        if (!result) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK_ASSIGNMENT,req.params.id) })
        }

        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.WORK_ASSIGNMENT), data: result })

    } catch (error) {
        console.error('GET /api/works/:workId/assignments/:id:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })

    }
})
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
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.workId) })
        }

        if (req.user.role === ROLES.COORDINATOR && req.user.id !== work.team?.createdById) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLES.COORDINATOR) })
        }
        const { newRole } = req.body

        if (![ROLES.LEADER, ROLES.WORKER].includes(newRole)) {
            return res.status(400).json({ error: MSG.WORK_ROLE_INVALID })
        }

        const assignment = await prisma.workAssignment.update({
            where: {
                id: req.params.id,
                workId: work.id,
            },
            data: { workRole: newRole }
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.WORK_ASSIGNMENT,assignment.id),data:assignment })

    } catch (error) {
        console.error('PATCH /api/works/:workId/updaterole/:id:', error);
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
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.workId) })
        }
        await prisma.workAssignment.delete({
            where: {
                workId: work.id,
                id: req.params.id
            }
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.WORK_ASSIGNMENT,req.params.id) })
    } catch (error) {
        console.error('DELETE /api/works/:workId/assignments/:id/hard:', error);
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
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.workId) })
        }

        if(req.user.role===ROLES.COORDINATOR&& req.user.id!==work.team?.createdById){
            return res.status(403).json({error:MSG.ACCESS_DENIED})
        }
        await prisma.workAssignment.update({
            where: {
                workId: work.id,
                id: req.params.id
            },
            data:{isDeleted:true}
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.WORK_ASSIGNMENT,req.params.id) })
    } catch (error) {
        console.error('DELETE /api/works/:workId/assignments/:id/soft:', error);
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
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK,req.params.workId) })
        }

        if(req.user.role===ROLES.COORDINATOR&& req.user.id!==work.team?.createdById){
            return res.status(403).json({error:MSG.ACCESS_DENIED})
        }
        await prisma.workAssignment.update({
            where: {
                workId: work.id,
                id: req.params.id
            },
            data:{isDeleted:false}
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.WORK_ASSIGNMENT,req.params.id) })
    } catch (error) {
        console.error('PATCH /api/works/:workId/assignments/:id/restore:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
export default router