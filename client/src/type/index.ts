import { ASSIGNMENT_ROLES, ROLES, WORK_STATUSES } from "../constants"

export type ApiResponse<T> = {
    message?: string,
    data?: T,
    error?: string;
}
export type EmployeeType = {
    id: string,
    employee_Id: string,
    fullName: string,
    email: string,
    phone: string,
    role: typeof ROLES[keyof typeof ROLES],
    baseId?: string,
    positionId: number,
    isBlocked: boolean,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string

    position?: PositionType;
    base?: BaseType;
}

export type PositionType = {
    id: number,
    name: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}

export type BaseType = {
    id: string,
    name: string,
    city: string,
    address?: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}


export type TeamType = {
    id: string,
    name?:string,
    status: string,
    createdById: string,
    leader:EmployeeType,
    leaderId: string,
    workId?: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}

export type TeamMemberType = {
    id: string,
    teamId: string,
    employeeId: string,
    joinedAt: string,
    removedAt?: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}
export type WorkType = {
    id: string,
    name: string,
    status: typeof WORK_STATUSES[keyof typeof WORK_STATUSES],
    wellId: string,
    workTypeId: number,
    supervisorId: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
    workTypes?:WorkListType,
    team?:TeamType
}

export type WorkAssignmentType = {
    id: string,
    workId: string,
    employeeId: string,
    role: typeof ASSIGNMENT_ROLES[keyof typeof ASSIGNMENT_ROLES],
    startDate: string,
    endDate?: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}

export type WorkListType = {
    id: number,
    name: string,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
}