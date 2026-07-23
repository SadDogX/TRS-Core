import { ROLES } from "../constants";

export function applyEmployeeScope(user: any) {
    switch (user.role) {
        case ROLES.ADMIN:
            return {}
        case ROLES.COORDINATOR:
            return {
                createdById: user.id
            }
        case ROLES.LEADER:
            return {
                team: {
                    is: {
                        leaderId: user.id
                    }
                }
            }
        case ROLES.WORKER:
            return {
                employeeId: user.id
            }
        default:
            return { employeeId: user.id };
    }
}