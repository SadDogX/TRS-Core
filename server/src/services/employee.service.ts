

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