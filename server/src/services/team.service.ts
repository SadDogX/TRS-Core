import { ENTITY, MSG, ROLES, ROLESNAME, TEAM_STATUS } from "../constants"
import prisma from "../lib/prisma"
import { ensureNotNull, ensureTeamAcceess } from "./access.service"

export async function createTeam(dto: any, user: any) {
    const { leaderId, name, status } = dto

    const leader = await prisma.employee.findUnique({
        where: { id: leaderId }
    })

    if (!leader) {
        throw new Error(MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, leaderId))
    }

    if (leader.isBlocked) {
        throw new Error(MSG.EMP_IS_BLOCKED)
    }

    return prisma.team.create({
        data: {
            name: name?.trim() || null,
            leaderId,
            createdById: user.id,
            status: status || TEAM_STATUS.FORMING
        }
    })
}
export async function createLinkMembers(employeeId: string, teamId: string, user: any) {

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
        throw new Error(MSG.ENTITY_NOT_FOUND_ID(ENTITY.EMPLOYEE, employeeId))
    }
    if (employee.isBlocked) {
        throw new Error(MSG.EMP_IS_BLOCKED)
    }
    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) {
        throw new Error(MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, teamId))
    }
    if (team.isDeleted) {

        throw new Error(MSG.ENTITY_WAS_SOFT_DELETE(ENTITY.TEAM, teamId))
    }
    if (user.role === ROLES.COORDINATOR && user.id !== team.createdById) {
        throw new Error(MSG.ACCESS_DENIED(ROLESNAME[ROLES.COORDINATOR]))
    }

    const existing = await prisma.teamMember.findFirst({
        where: {
            employeeId,
            teamId,
            isDeleted: false,
            removedAt: null,
        }
    })
    if (existing) {
        throw new Error(MSG.ENTITY_ALREADY_HAVE(ENTITY.EMPLOYEE, employeeId))
    }
    return prisma.teamMember.create({
        data: {
            employeeId: employeeId,
            teamId: teamId
        }
    })
}
export async function getTeamMemberIds(teamId: string, user: any) {
    const team = await prisma.team.findFirst({ where: { id: teamId } })
    ensureNotNull(team, MSG.ENTITY_NOT_FOUND_ID(ENTITY.TEAM, teamId))
    ensureTeamAcceess(team, user)

    const membersOfTeam = await prisma.teamMember.findMany({
        where: {
            teamId: teamId
        },

    })

    if (membersOfTeam.length === 0) {
        return []
    }

    return membersOfTeam.map(member => member.employeeId)
}

export async function removeMembersFromTeam(teamId: string, memberIds: string[]) {
    const deleteMembers = await prisma.teamMember.deleteMany({
        where: {
            teamId,
            employeeId: { in: memberIds }
        }
    })
    return deleteMembers.count
}