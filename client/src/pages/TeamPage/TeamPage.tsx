import { useEffect, useState } from "react"
import type { EmployeeType, MembersOfTeam, TeamType } from "../../type"
import { api } from "../../api"
import Modal from "../../components/Modal/Modal"
import Toast, { TOAST_MSG } from "../../components/Toast/Toast"
import { ENTITY, MSG, TEAM_STATUS_COLOR } from "../../constants"
import style from './TeamPage.module.css'
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import { FiEdit, FiTrash2, FiUserPlus, FiUserX, FiXCircle } from 'react-icons/fi'

import TeamForm from "../../components/TeamForm/TeamForm"
import EmployeesListForm from "../../components/EmployeesListForm/EmployeesListForm"



const TeamPage = () => {
    const [teams, setTeams] = useState<TeamType[]>([])
    const [team, setTeam] = useState<TeamType>(null)
    const [employees, setEmployees] = useState<EmployeeType[]>([])
    const [modalTeamOpen, setmodalTeamOpen] = useState<boolean>(false)
    const [modalMemberOpen, setModalMemberOpen] = useState<boolean>(false)
    const [membersOfTeam, setMembersOfTeam] = useState<MembersOfTeam[]>([])

    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')

    const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
    const [selectedTeam, setSelectedTeam] = useState<TeamType | undefined>()

    const [editingTeam, setEditingTeam] = useState<TeamType | null>()

    useEffect(() => {
        fetchTeam();
    }, []);

    const showToast = (title: string, message: string) => {
        setToastTypeMsg(title);
        setToastMsg(message);
        setToastOpen(true);
    }

    const fetchTeam = async () => {
        const response = await api.getTeams();
        const result: MembersOfTeam[] = await Promise.all(
            response.data.map(async (team) => {
                const members = await api.getMembersOfTeam(team.id)
                return {teamId: team.id, memberIds: members.data as string[]}
            })
        )

        setMembersOfTeam(result)
        const employees = await api.getEmployees()
        setEmployees(employees.data || [])
        setTeams(response.data || []);
    };

    const deleteTeam = async (id: string | undefined) => {
        if (!id) return;
        await api.deleteTeam(id)
    }



    return (
        <div className={style.wrapper}>
            <Modal isOpen={modalTeamOpen} onclose={() => {
                setmodalTeamOpen(false)
                setEditingTeam(null)
            }}>
                <TeamForm initData={editingTeam} onSuccess={async () => {

                    showToast(TOAST_MSG.INFORMATION,
                        editingTeam ?
                            MSG.ENTITY_WAS_UPDATED(ENTITY.TEAM, editingTeam.name) :
                            MSG.ENTITY_WAS_CREATED(ENTITY.TEAM, selectedTeam?.name || ''))
                    setEditingTeam(null)
                    setmodalTeamOpen(false)
                    await fetchTeam()
                }
                }>
                </TeamForm>
            </Modal>
            <Modal isOpen={modalMemberOpen} onclose={() => {
                setModalMemberOpen(false)
            }}>
                <EmployeesListForm initData={membersOfTeam} onSuccess={() => {
                    setModalMemberOpen(false)
                    fetchTeam()
                }} team={team}>
                </EmployeesListForm>
            </Modal>
            <Toast
                isOpen={toastOpen}
                onClose={() => setToastOpen(false)}
                message={toastMsg}
                messageTitle={toastTypeMsg}
                autoCloseTime={4000}>
            </Toast>
            <ConfirmModal
                isOpen={confirmOpen}
                message="Вы действительно хотите удалить?"
                title="Удаление элемента."
                onClose={() => setConfirmOpen(false)}
                onConfirm={async (confirm) => {
                    if (confirm) {
                        try {
                            await deleteTeam(selectedTeam.id)
                            fetchTeam()
                            showToast(TOAST_MSG.INFORMATION, MSG.ENTITY_WAS_HARD_DELETED(ENTITY.TEAM, selectedTeam.id))
                        } catch (data: any) {
                            showToast(TOAST_MSG.ERROR, data.error)
                        }
                    }
                }} >
            </ConfirmModal>

            <button type="button" className={style.fab} onClick={() => setmodalTeamOpen(true)}>+</button>
            <div className={style.gridCards}>
                {
                    teams.map((team) => (
                        /* ------------------------------- CARD_ITEMS ------------------------------- */
                        <div key={team.id} className={style.card}
                            style={{
                                color: TEAM_STATUS_COLOR[team.status].color,
                                background: TEAM_STATUS_COLOR[team.status].bg
                            }} >
                            <h3>{team.name}</h3>
                            <span>{`Бригадир: ${employees.find((employee) => employee.id === team.leaderId)?.fullName || 'Не назначен'}`}</span>
                            <div className={style.cardFooter}>
                                <div className={style.cardFooterIconList}>
                                    <button title="Отчистить бригаду" onClick={() => {

                                    }}>
                                        <FiXCircle className={style.cardIcons} size={32} />
                                    </button>
                                    <button title="Удалить сотрудников" onClick={() => {

                                    }}>
                                        <FiUserX className={style.cardIcons} size={32} />
                                    </button>
                                    <button title="Добавить сотрудников" onClick={() => {
                                        setTeam(team)
                                        setModalMemberOpen(true)
                                    }}>
                                        <FiUserPlus size={32} className={style.cardIcons} />
                                    </button>
                                    <button title="Редактировать" onClick={() => {
                                        setEditingTeam(team),
                                            setmodalTeamOpen(true)
                                    }}><FiEdit size={32} className={style.cardIcons} /></button>
                                    <button title="Удалить" onClick={() => {
                                        setSelectedTeam(team)
                                        setConfirmOpen(true)
                                    }}><FiTrash2 size={32} className={style.cardIcons} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

        </div >
    )
}

export default TeamPage