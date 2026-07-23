import { PrismaClient } from '@prisma/client';
import type { BusyEmployee } from '../type'
import { ASSIGNMENT_ROLES } from '../constants';
import { applyEmployeeScope } from '../query';
import { log } from 'node:console';

export async function getEmpployeeDependencies(prisma: any, id: string) {
    const [teamMember, teamsAsLeader, teamsAsCreator, workAssignment] = await Promise.all([
        prisma.teamMember.count({ where: { employeeId: id } }),
        prisma.team.count({ where: { leaderId: id } }),
        prisma.team.count({ where: { createdById: id } }),
        prisma.workAssignment.count({ where: { employeeId: id } }),
    ])
    return {
        teamMember,
        teamsAsLeader,
        teamsAsCreator,
        workAssignment,
        hasDependencies:
            teamMember +
            teamsAsLeader +
            teamsAsCreator +
            workAssignment > 0,
    };

}

export async function getBusyEmployee(prisma: PrismaClient, user: any) {
    const busyWorkers = await prisma.teamMember.findMany(
        {
          where:{...applyEmployeeScope(user)},
            select: {
                teamId: true,
                id: true
            }
        }
    )
    // console.log('worker',busyWorkers)
    const busyLeaders = await prisma.team.findMany({
        where: { createdById: user.id },
        select: {
            id: true,
            leaderId:true
        }
    })
    // console.log('leader',busyLeaders)

    const result: BusyEmployee[] = [
        ...busyLeaders.map(item => ({
            id: item.leaderId,
            role: ASSIGNMENT_ROLES.LEADER,
            teamId: item.id
        })),
        ...busyWorkers.map(item => ({
            id: item.id,
            role: ASSIGNMENT_ROLES.WORKER,
            teamId: item.teamId
        }))]
        // console.log(result);
        
    return result

}