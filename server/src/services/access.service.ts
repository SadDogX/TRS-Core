import { ENTITY, MSG, ROLES } from "../constants";

export function ensureTeamAcceess(team:any,user:any){
    if (user.role===ROLES.COORDINATOR && user.id!==team.createdById){
        throw new Error(MSG.ACCESS_DENIED(ENTITY.EMPLOYEE))
    }
    if (user.role===ROLES.LEADER && team.leaderId!==user.id){
        throw new Error(MSG.ACCESS_DENIED(ENTITY.EMPLOYEE))
    }
}

export function ensureNotNull(model:any,message:string)
    {
        if (!model){
            throw new Error(message)
        }
    }