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
            where:{
                workId:work.id,
                employeeId:employee.id,
                isDeleted:false
            }
        })
        if (alreadyAssignment){
            return res.status(400).json({error:MSG.WORK_ASSIGNMENT_ALREADY_EXISTS})
        }
        const work_assignment = await prisma.workAssignment.findMany({ where: { workId: req.params.workId, isDeleted: false } })
        if (work_assignment.length > 5) {
            return res.status(409).json({ error: MSG.WORK_ASSIGNMENT_EMPLOYEES_ENOUGHT })
        }

        const assignment = await prisma.workAssignment.create({
            data:{
                workId:work.id,
                employeeId:employee.id,
                role
            }
        })
        res.status(201).json({message:MSG.WORK_ASSIGNMENT_IS_CREATED,data:assignment})

    } catch (error) {
        res.status(500).json({ error: MSG.SERVER_ERROR })

    }
})
/* --------------------------------- Read By Id --------------------------------- */
/* -------------------------------- Read all -------------------------------- */
/* --------------------------------- Update --------------------------------- */
/* --------------------------------- Hard Delete --------------------------------- */
/* --------------------------------- Soft Delete --------------------------------- */
/* --------------------------------- Restore delete item --------------------------------- */
