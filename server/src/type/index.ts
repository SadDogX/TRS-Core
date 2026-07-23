import { ASSIGNMENT_ROLES } from "../constants"
import { Request, Response } from "express";

export type Controller = (req: Request, res: Response) => Promise<any> | any

export type AssignmentRole = typeof ASSIGNMENT_ROLES[keyof typeof ASSIGNMENT_ROLES]

export type BusyEmployee={
    id: string,
    role: AssignmentRole,
    teamId: string
}