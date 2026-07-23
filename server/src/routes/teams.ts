import { Router, Request, Response } from "express";
import * as teamController from '../controller/team.controller'
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { ROLES, MSG, WORK_STATUSES, ENTITY, ROLESNAME } from "../constants";

const router = Router()
/* --------------------------------- Create --------------------------------- */
router.post('/', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), teamController.createTeam)
router.post('/:teamId/members', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), teamController.createLinkMembers)
/* ---------------------------------- Read ---------------------------------- */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (user.role === ROLES.ADMIN) {
            const teams = await prisma.team.findMany()
            if (teams.length === 0) {
                return res.json({ information: MSG.TBL_IS_EMPTY(ENTITY.TEAM), data: [] })
            }
            res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAM), data: teams });

        }

        if (user.role === ROLES.COORDINATOR) {
            const teams = await prisma.team.findMany({
                where: {
                    createdById: user.id,
                    isDeleted: false
                }
            })
            if (teams.length === 0) {
                return res.json({ information: MSG.TBL_IS_EMPTY(ENTITY.TEAM), data: [] })
            }
            res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAM), data: teams });

        }

        if (user.role === ROLES.LEADER) {
            const teams = await prisma.team.findMany({
                where: {
                    leaderId: user.id,
                    isDeleted: false
                }
            })
            if (teams.length === 0) {
                return res.json({ information: MSG.TBL_IS_EMPTY(ENTITY.TEAM), data: [] })
            }
            res.json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAM), data: teams });
        }

        if (user.role === ROLES.WORKER) {
            const teams = await prisma.team.findMany({
                where: {
                    members: {
                        some: {
                            id: user.id
                        },
                    },
                    isDeleted: false
                }
            })
            if (teams.length === 0) {
                return res.json({ information: MSG.TBL_IS_EMPTY(ENTITY.TEAM), data: [] })
            }
            res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAM), data: teams });

        }
    } catch (error) {
        console.error('GET /api/teams:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
router.get('/members', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const where: any = { isDeleted: false }
        if (req.user.role === ROLES.COORDINATOR)
            where.team = { createdById: req.user.id }
        const teamMember = await prisma.teamMember.findMany(
            {
                where
            });
        if (teamMember.length === 0) {
            return res.status(200).json({ error: MSG.TBL_IS_EMPTY(ENTITY.TEAMMEMBERS), data: null })
        }

        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAMMEMBERS), data: teamMember })


    } catch (error) {
        console.error('GET /api/members', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
router.get('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const where: any = { id: req.params.id };
        if (req.user.role === ROLES.COORDINATOR) {
            where.isDeleted = false;
            where.createdById = req.user.id
        }
        const team = await prisma.team.findFirst(where)
        if (!team) {
            return res.json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id), data: { id: req.params.id } })
        }
        res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAM), data: team });
    } catch (error) {
        console.error('GET /api/teams/:id:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
router.get('/:teamId/members', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), teamController.getTeamMemberIds)
/* --------------------------------- Update --------------------------------- */
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {

        const target = await prisma.team.findUnique({
            where: { id: req.params.id }
        })

        if (!target) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }

        const { leaderId, status } = req.body

        const leader_data = await prisma.employee.findUnique({
            where: {
                id: leaderId
            }
        })

        if (!leader_data) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, leaderId) })
        }
        if (leader_data.isBlocked) {
            return res.status(400).json({ error: MSG.EMP_IS_BLOCKED })
        }
        if (leader_data.isDeleted) {
            return res.status(400).json({ error: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.EMPLOYEE, leaderId) })
        }

        if (req.user.role === ROLES.COORDINATOR && target.createdById !== req.user.id) {
            return res.json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]), data: { id: req.params.id } })
        }

        const updat_target = await prisma.team.update({
            where: { id: req.params.id },
            data: { leaderId, status }
        })

        res.json({ message: MSG.ENTITY_WAS_UPDATED(ENTITY.TEAM, updat_target.id), data: updat_target })
    } catch (error) {
        console.error('PUT /api/teams/:id:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
/* --------------------------------- Delete HARD--------------------------------- */
router.delete('/:id/hard', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {

        await prisma.team.delete({
            where: { id: req.params.id }
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.TEAM, req.params.id) })
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }
        console.error('DELETE /api/teams/:id/hard:', error);
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
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.id) {
            return res.status(400).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]) })
        }
        await prisma.team.update(
            {
                where: { id: req.params.id },
                data: { isDeleted: true }
            }
        )
        res.status(200).json({ message: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.TEAM, req.params.id) })
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }

        console.error('DELETE /api/teams/:id/soft:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.patch("/:id/restore", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const team = await prisma.team.findFirst({ where: { id: req.params.id } })
        if (!team) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.id) {
            return res.status(400).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]) })
        }
        await prisma.team.update({
            where: { id: req.params.id },
            data: { isDeleted: false }
        })
        res.status(200).json({ message: MSG.ENTITY_WAS_RESTORE(ENTITY.TEAM, req.params.id) })
    }
    catch (error: any) {
        if (error.code === "P2025") {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }
        console.error('PATCH /api/teams/:id/restore:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})


router.patch('/:teamId/members', authenticate,teamController.updateTeamMemberByIds)

/* ----------------------------- TEAM ASSIGmMENT ---------------------------- */
router.patch('/:id/assign', authenticate, requireRole(ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const { workId } = req.body
        const target = await prisma.team.findFirst({
            where: { id: req.params.id, isDeleted: false },
            include: { members: true }
        })
        const work = await prisma.work.findFirst({
            where: {
                id: workId,
                isDeleted: false
            }
        })
        if (!target) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }
        if (!work) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, workId) })
        }
        if (target.workId) {
            return res.status(400).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.WORK, target.workId) })
        }
        if (target.members.length == 0) {
            return res.status(404).json({ error: MSG.TBL_IS_EMPTY(ENTITY.TEAM) })
        }

        if (req.user.role === ROLES.COORDINATOR && req.user.id !== target.createdById) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]) })
        }
        if (work.status !== WORK_STATUSES.DRAFT) {
            return res.status(404).json({ error: MSG.WORK_ASSIGNMENT_ALREADY_EXISTS })
        }
        const workBusy = await prisma.team.findFirst({ where: { workId, isDeleted: false } });
        if (workBusy) {
            return res.status(400).json({ error: MSG.ENTITY_ALREADY_HAVE(ENTITY.WORK, workBusy.id) });
        }
        await prisma.team.update({
            where: { id: target.id },
            data: { workId: work.id }
        })

        const assignment_team = await prisma.workAssignment.createMany({
            data: target.members
                .filter(employe => !employe.isDeleted && !employe.removedAt)
                .map(item => ({
                    workId,
                    employeeId: item.id,
                    role: item.id === target.leaderId ? ROLES.LEADER : ROLES.WORKER
                }))
        })

        res.status(200).json({ message: MSG.TEAM_ASSIGNED_TO_WORK, count: assignment_team.count });

    } catch (error) {
        console.error('PATCH /api/teams/:id/assign:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})

router.patch("/:id/unassign", authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
        const team = await prisma.team.findFirst({ where: { id: req.params.id } })
        if (!team) {
            return res.status(404).json({ error: MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, req.params.id) })
        }
        if (team.isDeleted) {
            return res.status(400).json({ error: MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.TEAM, req.params.id) })
        }
        if (!team.workId) {
            return res.status(400).json({ error: MSG.TEAM_ALREADY_FREE })
        }
        if (req.user.role === ROLES.COORDINATOR && team.createdById !== req.user.id) {
            return res.status(403).json({ error: MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]) })
        }


        await prisma.team.update({
            where: {
                id: team.id
            },
            data: { workId: null }
        })

        res.status(200).json({ message: MSG.TEAM_ASSIGNED_TO_WORK });
    } catch (error: any) {
        console.error('PATCH /api/teams/:id/unassign:', error);
        res.status(500).json({ error: MSG.SERVER_ERROR })
    }
})
export default router
