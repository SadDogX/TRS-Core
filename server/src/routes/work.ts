import { Router, Request, Response } from "express"
import prisma from "../lib/prisma"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/requireRole"
import { ENTITY, MSG, ROLES, ROLESNAME, WORK_STATUSES } from "../constants"
import { connect } from "http2"

const router = Router()
/* --------------------------------- Create --------------------------------- */
router.post("/", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name, status, wellId, workTypeId, supervisorId } = req.body
        if (status && !Object.values(WORK_STATUSES).includes(status)) {
            return res.status(400).json({ error: MSG.WORK_STATUS_IS_WRONG })
        }

        const work = await prisma.work.create({
            data: {
                name: name,
                wellId: wellId,
                status: status,
                workTypeId: workTypeId
            }
        })
        res.status(201).json({ message: MSG.ENTITY_WAS_CREATED(ENTITY.WORK, work.id), data: work })


    } catch (error: any) {
        console.error('POST /api/works:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* -------------------------------- Read all -------------------------------- */
router.get("/", authenticate, async (req: Request, res: Response) => {
    try {
        const where: any = {};
        switch (req.user.role) {
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.LEADER:
                where.team = {is:{leaderId:req.user.employeeId}}
                break;
            case ROLES.WORKER:
                where.assignments = { some: { employeeId: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break;
        }
        const works = await prisma.work.findMany({ 
            where, 
            include: { 
                team: {include:{leader:true}}, 
                workType: true 
            } })
        console.log(works)
        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.WORK), data: works })
    } catch (error) {
        console.error('GET /api/works:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* -------------------------------- Work types ------------------------------- */
router.get("/types", authenticate, async (req: Request, res: Response) => {
    try {
        const workTypes = await prisma.workType.findMany()
        if (workTypes.length === 0) {
            return res.status(404).json({ error: MSG.WORK_TYPES_NO_DATA })
        }
        res.status(200).json({ message: MSG.WORK_TYPES_IS_LOADING, data: workTypes })

    } catch (error) {
        console.error('GET /api/works/type:', error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
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
                where.team = {is:{leaderId:req.user.employeeId}}
                break;
            case ROLES.WORKER:
                where.assignments = { some: { employeeId: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break;
        }
        const work = await prisma.work.findFirst({
            where: where,
            include: { team: {include:{leader:true}}, assignments: true }
        })
        if (!work) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[req.user.role]) })
        }
        return res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.WORK), data: work })
    } catch (error) {
        console.error('GET /api/works/:id:', error);
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
                where.team = {is:{leaderId:req.user.employeeId}}
                break;
            case ROLES.ADMIN:
                break;
        }
        const target = await prisma.work.findFirst({
            where: where,
            include: { team: {include:{leader:true}} }
        })
        if (!target) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
        }

        const data = req.body
        const {workTypeId} = req.body
        if(workTypeId){
            data.workType = {connect:{id:workTypeId}}
            delete data.workTypeId
        }

        const updated_target = await prisma.work.update({
            where: { id: target.id },
            data: data
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.WORK, updated_target.id), data: updated_target })
    } catch (error) {
        console.error('PUT /api/works/:id:', error);
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
                where.team = {is:{leaderId:req.user.employeeId}}
                break;
            case ROLES.ADMIN:
                break;
        }

        const target = await prisma.work.findFirst({
            where: where,
            include: { team: {include:{leader:true}} }
        })

        if (!target) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
        }

        const { new_status } = req.body
        if (!Object.values(WORK_STATUSES).includes(new_status)) {
            return res.status(400).json({ error: MSG.WORK_STATUS_IS_WRONG })
        }

        const update_target = await prisma.work.update({
            where: { id: req.params.id },
            data: {
                status: new_status
            }
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.WORK, req.params.id), data: update_target })
    } catch (error) {
        console.error('PATCH /api/works/:id/status:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Hard Delete --------------------------------- */
router.delete("/:id/hard", authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        await prisma.work.delete({
            where: { id: req.params.id }
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.WORK, req.params.id) })
    } catch (error: any) {
        console.error('DELETE /api/works/:id/hard:', error);
        if (error.code === "P2025")
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
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
                where.team = {is:{leaderId:req.user.employeeId}}
                break;
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break
        }
        const target = await prisma.work.findFirst({ where })

        if (!target) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
        }

        await prisma.work.update({
            where: { id: target.id },
            data: {
                isDeleted: true
            }
        })

        res.status(200).json({ message: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.WORK, req.params.id) })

    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
        console.error('DELETE /api/works/:id/soft:', error);
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
                where.team = {is:{leaderId:req.user.employeeId}}
                break;
            case ROLES.COORDINATOR:
                where.team = { is: { createdById: req.user.employeeId } }
                break;
            case ROLES.ADMIN:
                break
        }
        const target = await prisma.work.findFirst({ where })

        if (!target) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
        }

        await prisma.work.update({
            where: { id: target.id },
            data: {
                isDeleted: false
            }
        })

        res.status(200).json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.WORK, req.params.id) })

    } catch (error: any) {
        console.error('PATCH /api/works/:id/restore:', error);
        if (error.code === "P2025")
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, req.params.id) })
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

export default router