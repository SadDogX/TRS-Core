import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { ROLES, TEAM_STATUS } from "../constants";
import { error } from "console";

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
            return res.status(400).json({ error: "Сотрудник не найден." })
        }

        if (leader.isBlocked) {
            return res.status(400).json({ error: "Сотрудник заблокирован" })
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
        console.log("Ошибка сервера")
        res.json({ error: "Ошибка сервера" })
    }
})
/* ---------------------------------- Read ---------------------------------- */
router.get('/teams', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (user.role == ROLES.ADMIN) {
            const teams = await prisma.team.findMany()
            if (teams.length===0) {
                console.log("в таблиые нет данных")
                return res.json({ information: "Таблица бригады пуста" })
            }
            res.json(teams)
        }

        if (user.role == ROLES.COORDINATOR) {
            const teams = await prisma.team.findMany({
                where: {
                    createdById: user.employeeId,
                    isDeleted: false
                }
            })
            if (teams.length===0) {
                console.log("в таблиые нет данных")
                return res.json({ information: "Таблица бригады пуста" })
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
            if (teams.length===0) {
                console.log("Проблема в назначении")
                return res.json({ information: "Ошибка в назначении бригады" })
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
            if (teams.length===0) {
                console.log("вы вне бригады")
                return res.json({ information: "Вы вне бригады" })
            }
            res.json(teams)
        }
    } catch (error) {
        console.log(error)
        res.json({ error: "Ошибка сервера" })
    }
})

router.get('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {
            const where:any = {id:req.params.id};
            if (req.user.role== ROLES.COORDINATOR){
                where.isDeleted = false;
                where.createdById = req.user.employeeId
            }
            const team = await prisma.team.findFirst(where)
            if (!team){
                return res.json({error:"Нет работ с данным ID"})
            }
            res.json(team)
    } catch (error) {
        console.log(error)
        res.json({ error: "Ошибка сервера" })
    }
})

/* --------------------------------- Update --------------------------------- */
router.put('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log(error)
        res.json({ error: "Ошибка сервера" })
    }
})
/* --------------------------------- Delete HARD--------------------------------- */
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log(error)
        res.json({ error: "Ошибка сервера" })
    }
})
/* --------------------------------- Delete --------------------------------- */
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.COORDINATOR), async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log(error)
        res.json({ error: "Ошибка сервера" })
    }
})
export default router