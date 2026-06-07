import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { ROLES, TEAM_STATUS, MSG } from "../constants";

const router = Router()
/* --------------------------------- Create --------------------------------- */
router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { leaderId } = req.body

        const leader = await prisma.employee.findUnique({
            where: {
                id: leaderId
            }
        })

        if (!leader) {
            return res.status(400).json({ error: MSG.EMP_NOT_FOUND })
        }

        if (leader.isBlocked) {
            return res.status(400).json({ error: MSG.EMP_IS_BLOCKED })
        }

        const team = await prisma.team.create({
            data: {
                leaderId: leaderId,
                createdById: req.user.employeeId,
                status: TEAM_STATUS.FORMING
            }
        })
        res.status(201).json(team)


    } catch (error) {
        console.log(MSG.SERVER_ERROR)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
router.post('/:teamId/members', authenticate, requireRole(ROLES.COORDINATOR, ROLES.ADMIN), async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.body
        const { teamId } = req.params

        const employee = await prisma.employee.findUnique({ where: { employeeId: employeeId } })
        if (!employee) {
            return res.status(404).json({ error: MSG.EMP_ID_WRONG })
        }
        if (employee.isBlocked) {
            return res.status(400).json({ error: MSG.EMP_IS_BLOCKED })
        }
        const team = await prisma.team.findUnique({ where: { id: teamId } })
        if (!team) {
            return res.status(400).json({ error: MSG.TEAM_ID_WRONG })
        }
        if(team.isDeleted){
            
            return res.status(400).json({ error: MSG.TEAM_IS_DELETED_SOFT })
        }
        if (req.user.role === ROLES.COORDINATOR && req.user.employeeId !== team.createdById) {
            return res.status(400).json({ error: MSG.ACCESS_DENIED })
        }

        const existing = await prisma.teamMember.findFirst({
            where:{
                employeeId:employeeId,
                isDeleted:false,
                removedAt:null,
                teamId:teamId
            }
        })
        if (existing){
            return res.status(400).json({error:MSG.EMP_ALREADY_IN_TEAM})
        }
        const member= await prisma.teamMember.create({
            data:{
                employeeId:employeeId,
                teamId:teamId
            }
        })
        res.status(200).json({ message: MSG.TEAM_IS_CREATED,data:member})
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* ---------------------------------- Read ---------------------------------- */
router.get('/teams', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (user.role === ROLES.ADMIN) {
            const teams = await prisma.team.findMany()
            if (teams.length === 0) {
                console.log(MSG.TBL_IS_EMPTY)
                return res.json({ information: MSG.TBL_IS_EMPTY })
            }
            res.json(teams)
        }

        if (user.role === ROLES.COORDINATOR) {
            const teams = await prisma.team.findMany({
                where: {
                    createdById: user.employeeId,
                    isDeleted: false
                }
            })
            if (teams.length === 0) {
                console.log(MSG.TBL_IS_EMPTY)
                return res.json({ information: MSG.TBL_IS_EMPTY })
            }
            res.json(teams)
        }

        if (user.role === ROLES.LEADER) {
            const teams = await prisma.team.findMany({
                where: {
                    leaderId: user.employeeId,
                    isDeleted: false
                }
            })
            if (teams.length === 0) {
                console.log(MSG.TEAM_SET_ERROR)
                return res.json({ information: MSG.TEAM_SET_ERROR })
            }
            res.json(teams)
        }

        if (user.role === ROLES.WORKER) {
            const teams = await prisma.team.findMany({
                where: {
                    members: {
                        some: {
                            employeeId: user.employeeId
                        },
                    },
                    isDeleted: false
                }
            })
            if (teams.length === 0) {
                console.log(MSG.EMP_OUT_OF_TEAM)
                return res.json({ information: MSG.EMP_OUT_OF_TEAM })
            }
            res.json(teams)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.get('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const where: any = { id: req.params.id };
        if (req.user.role === ROLES.COORDINATOR) {
            where.isDeleted = false;
            where.createdById = req.user.employeeId
        }
        const team = await prisma.team.findFirst(where)
        if (!team) {
            return res.json({ error: MSG.WORK_ID_WRONG })
        }
        res.json(team)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

/* --------------------------------- Update --------------------------------- */
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {

        const target = await prisma.team.findUnique({
            where: { id: req.params.id }
        })

        if (!target) {
            return res.status(400).json({ error: MSG.TEAM_ID_WRONG })
        }

        const { leaderId, status } = req.body

        const leader_data = await prisma.employee.findUnique({
            where: {
                id: leaderId
            }
        })

        if (!leader_data) {
            return res.status(400).json({ error: MSG.EMP_ID_WRONG })
        }
        if (leader_data.isBlocked) {
            return res.status(400).json({ error: MSG.EMP_IS_BLOCKED })
        }
        if (leader_data.isDeleted) {
            return res.status(400).json({ error: MSG.EMP_IS_CHECK_DELETED })
        }

        if (req.user.role === ROLES.COORDINATOR && target.createdById !== req.user.employeeId) {
            return res.json({ error: MSG.WORK_OUT_ACCESS })
        }

        const updat_target = await prisma.team.update({
            where: { id: req.params.id },
            data: { leaderId, status }
        })

        res.json(updat_target)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Delete HARD--------------------------------- */
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {

        await prisma.team.delete({
            where: { id: req.params.id }
        })
        res.status(200).json({ message: MSG.TEAM_IS_DELETED })
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(400).json({ error: MSG.TEAM_ID_WRONG })
        }
        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Delete  Soft--------------------------------- */
router.delete('/:id/soft', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {

        const team = await prisma.team.findFirst({
            where: { id: req.params.id }
        })

        if (!team) {
            return res.status(400).json({ error: MSG.TEAM_ID_WRONG })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.employeeId) {
            return res.status(400).json({ error: MSG.ACCESS_DENIED })
        }
        await prisma.team.update(
            {
                where: { id: req.params.id },
                data: { isDeleted: true }
            }
        )
        res.status(200).json({ message: MSG.TEAM_IS_DELETED_SOFT })
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: MSG.TEAM_ID_WRONG })
        }

        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.patch("/:id/restore", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const team = await prisma.team.findFirst({ where: { id: req.params.id } })
        if (!team) {
            return res.status(400).json({ error: MSG.TEAM_ID_WRONG })
        }
        if (team.isDeleted) {
            return res.status(400).json({ error: MSG.TEAM_SET_ERROR })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.employeeId) {
            return res.status(400).json({ error: MSG.ACCESS_DENIED })
        }
        await prisma.team.update({
            where: { id: req.params.id },
            data: { isDeleted: false }
        })
        res.status(200).json({ message: MSG.RES_STATUS_UPDATE })
    }
    catch (error: any) {
        if (error.code === "P2025") {
            return res.status(400).json({ error: MSG.TEAM_ID_WRONG })
        }
        console.log(error)
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})


export default router