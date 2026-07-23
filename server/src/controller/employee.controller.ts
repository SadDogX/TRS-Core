import { Controller } from "../type";
import { handleServerError } from "../utills/http/error";
import * as employeeService from '../services/employee.service'
import prisma from "../lib/prisma";
import { ENTITY, MSG } from "../constants";

export const getBusyEmployee:Controller = async (req,res)=> {
    try {
        const result =await employeeService.getBusyEmployee(prisma,req.user)
        return res.status(200).json({message:MSG.ENTITY_WAS_READ(ENTITY.TEAMMEMBERS),data:result})
    } catch (error:any) {
        return handleServerError(res,error,'GET ')
    }
}