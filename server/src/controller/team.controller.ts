import * as teamService from '.././services/team.service'
import { ENTITY, MSG } from '../constants';
import { handleServerError } from '../utills/http/error';
import { Controller } from '../type';

export const createTeam: Controller = async (req, res) => {
    try {
        const team: any = await teamService.createTeam(req.body, req.user)

        return res.status(201).json({
            message: MSG.ENTITY_WAS_CREATED(ENTITY.TEAM, team.id),
            data: team
        })
    } catch (error: any) {
        return handleServerError(res, error, 'POST /teams:')
    }
}

export const createLinkMembers: Controller = async (req, res) => {
    try {
        const members = await teamService.createLinkMembers(req.body.id, req.params.teamId, req.user)
        return res.status(201).json({
            message: MSG.ENTITY_WAS_CREATED(ENTITY.TEAMMEMBERS, req.params.teamId),
            data: members
        })
    } catch (error) {
        handleServerError(res, error, 'POST /api/teams/:teamId/members:')
    }
}

export const getTeamMemberIds: Controller = async (req, res) => {
    try {
        const membersOfTeam = await teamService.getTeamMemberIds(req.params.teamId, req.user)
        return res.status(200).json({ message: MSG.ENTITY_WAS_READ(ENTITY.TEAMMEMBERS), data: membersOfTeam })
    } catch (error) {
        return handleServerError(res, error, 'GET /api/teams/:teamId/members:')
    }
}

export const updateTeamMemberByIds: Controller = async (req, res) => {
    try {
        const memberIds = req.body
        const teamId = req.params.teamId
        const result = await teamService.removeMembersFromTeam(teamId, memberIds)
        return res.status(200).json({ message: MSG.ENTITY_WAS_HARD_DELETED(ENTITY.TEAMMEMBERS, `${result} шт. `), data: result })
    } catch (error) {
        return handleServerError(res, error, 'PATCH(DELETE) /api/teams/:teamId/members:')
    }
}
