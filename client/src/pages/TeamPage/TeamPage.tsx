import { useEffect, useState } from "react"
import type { TeamType } from "../../type"
import { api } from "../../api"
import Modal from "../../components/Modal/Modal"
import Toast, { TOAST_MSG } from "../../components/Toast/Toast"
import { ENTITY, MSG, TEAM_STATUS, TEAM_STATUS_COLOR } from "../../constants"
import style from './TeamPage.module.css'
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import TeamForm from "../../components/TeamForm/TeamForm"

const TeamPage = () => {
    const [teams, setTeam] = useState<TeamType[]>([])
    const [modalOpen, setModalOpen] = useState<boolean>(false)

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
        setTeam(response.data || []);
    };

    const deleteTeam = async (id: string | undefined) => {
        if (!id) return;
        await api.deleteTeam(id)
    }



    return (
        <div className={style.wrapper}>
            <Modal isOpen={modalOpen} onclose={() => {
                setModalOpen(false)
                setEditingTeam(null)
            }}>
                <TeamForm initData={editingTeam} onSuccess={() => {
                    showToast(TOAST_MSG.INFORMATION,
                        editingTeam ?
                            MSG.ENTITY_WAS_UPDATED(ENTITY.TEAM, editingTeam.name) :
                            MSG.ENTITY_WAS_CREATED(ENTITY.TEAM, selectedTeam?.name))
                    setModalOpen(false)
                    setEditingTeam(null)
                    fetchTeam()
                }
                }>
                </TeamForm>
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
                        } catch (error: any) {
                            showToast(TOAST_MSG.ERROR, error.message)
                        }
                    }
                }} >
            </ConfirmModal>

            <button type="button" className={style.fab} onClick={() => setModalOpen(true)}>+</button>
            <div className={style.gridCards}>
                {
                    teams.map((team) => (
                        <div key={team.id} className={style.card}
                            style={{
                                color: TEAM_STATUS_COLOR[team.status].color,
                                background: TEAM_STATUS_COLOR[team.status].bg
                            }} >
                            <h3>{team.name}</h3>
                            <span>{`Бригадир: ${team.leaderId}`}</span>
                            <div className={style.cardFooter}>
                                <div className={style.cardFooterIconList}>
                                    <button title="Редактировать" onClick={() => {
                                        setEditingTeam(team),
                                            setModalOpen(true)
                                    }}><FiEdit size={32} /></button>
                                    <button title="Удалить" onClick={() => {
                                        setSelectedTeam(team)
                                        setConfirmOpen(true)
                                    }}><FiTrash2 size={32} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

        </div >
    )
}

export default TeamPage