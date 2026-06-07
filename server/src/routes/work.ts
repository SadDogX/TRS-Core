import { Router, Request, Response } from "express"
import prisma from "../lib/prisma"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/requireRole"
import { MSG, ROLES, WORK_STATUSES } from "../constants"
import { error } from "node:console"

const router = Router()
/* --------------------------------- Create --------------------------------- */
router.post("/", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { name, status, wellId, workTypeId, teamId, supervisorId } = req.body
        if (status && !WORK_STATUSES.includes(status)) {
            return res.status(400).json({ error: MSG.WORK_STATUS_IS_WRONG })
        }
        const team = await prisma.team.findFirst({
            where: { id: teamId }
        })
        if (!team) {
            return res.status(404).json({ error: MSG.TEAM_ID_WRONG })
        }
        if (req.user.role === ROLES.COORDINATOR && req.user.employeeId !== team.createdById) {
            return res.status(400).json({ error: MSG.ACCESS_DENIED })
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
                teamId: teamId,
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
        const work = await prisma.work.findFirst({
            where: {
                id: req.params.id
            },
            include: { team: true, assignments: true }
        })
        if (!work) {
            return res.status(404).json({ error: MSG.ACCESS_DENIED })
        }
        if (req.user.role === ROLES.COORDINATOR && req.user.employeeId !== work.team.createdById) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED })
        }
        if (req.user.role === ROLES.LEADER && req.user.employeeId !== work.supervisorId) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED })
        }
        if (req.user.role === ROLES.WORKER) {
            const isAssigned = work.assignments?.some(a => a.employeeId === req.user.employeeId)
            if (!isAssigned) {
                return res.status(403).json({ error: MSG.ACCESS_DENIED })
            }
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
                where.team = { createdById: req.user.employeeId }
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
        const target = await prisma.work.findFirst({ 
            where: { id: req.params.id } ,
            include:{team:true}
        })
        if (!target) {
            return res.status(404).json({ error: MSG.WORK_ID_WRONG })
        }
        if (req.user.role===ROLES.COORDINATOR && req.user.employeeId!== target.team.createdById){
            return res.status(403).json({ error: MSG.WORK_OUT_ACCESS })
        }
        if (req.user.role===ROLES.LEADER && req.user.employeeId!== target.supervisorId){
            return res.status(403).json({ error: MSG.WORK_OUT_ACCESS })
        }
        const data = req.body
        const updated_target =await prisma.work.update({
            where: { id: target.id },
            data: data
        })
        res.status(200).json({ message: MSG.WORK_UPDATE_OK,data:updated_target })
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.patch("/:id/status",authenticate, requireRole(ROLES.COORDINATOR, ROLES.ADMIN, ROLES.LEADER), async (req: Request, res: Response)=>{
    try {
        const target = await prisma.work.findFirst({
            where:{id:req.params.id},
            include:{team:true}
        })

        if (!target){
            return res.status(404).json({error:MSG.WORK_ID_WRONG})
        }

        if (req.user.role===ROLES.COORDINATOR && req.user.employeeId!== target.team.createdById){
            return res.status(403).json({ error: MSG.WORK_OUT_ACCESS })
        }
        if (req.user.role===ROLES.LEADER && req.user.employeeId!== target.supervisorId){
            return res.status(403).json({ error: MSG.WORK_OUT_ACCESS })
        }

        const {new_status} = req.body
        if (!WORK_STATUSES.includes(new_status)){
            return res.status(400).json({error:MSG.WORK_STATUS_IS_WRONG})
        }
        
        const update_target= await prisma.work.update({
            where:{id:req.params.id},
            data:{
                status:new_status
            }
        })
        res.status(200).json({message:MSG.WORK_UPDATE_OK,data:update_target})
    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Hard Delete --------------------------------- */
/* --------------------------------- Soft Delete --------------------------------- */
/* --------------------------------- Restore delete item --------------------------------- */

export default router