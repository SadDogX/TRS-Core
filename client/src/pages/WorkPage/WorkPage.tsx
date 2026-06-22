import { useEffect, useState } from "react"
import type { WorkType } from "../../type"
import { api } from "../../api"
import Modal from "../../components/Modal/Modal"
import Toast, { TOAST_MSG } from "../../components/Toast/Toast"
import { ENTITY, MSG, WORK_STATUS_COLORS } from "../../constants"
import style from './WorkPage.module.css'
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import { FiEdit, FiLink, FiLink2, FiTrash2 } from 'react-icons/fi'
import WorkForm from "../../components/WorkForm/WorkForm"

const WorkPage = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false)

    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')

    const [works, setWorks] = useState<WorkType[]>([])
    

    const [selectedWork, setSelectedWork] = useState<WorkType | undefined>()
    const [editingWork, setEditingWork] = useState<WorkType | null>()

    useEffect(() => {
        fetchWork();
    }, []);

    const showToast = (title: string, message: string) => {
        setToastTypeMsg(title);
        setToastMsg(message);
        setToastOpen(true);
    }

    const fetchWork = async () => {
        const response = await api.getWorks();
        setWorks(response.data || []);
    };

    const deleteWork = async (id: string | undefined) => {
        if (!id) return;
        await api.deleteWork(id)
    }



    return (
        <div className={style.wrapper}>
            <Modal isOpen={modalOpen} onclose={() => {
                setModalOpen(false)
                setEditingWork(null)
            }}>
                <WorkForm initData={editingWork} onSuccess={() => {
                    showToast(TOAST_MSG.INFORMATION,
                        editingWork ?
                            MSG.ENTITY_WAS_UPDATED(ENTITY.WORK, editingWork.name) :
                            MSG.ENTITY_WAS_CREATED(ENTITY.WORK, selectedWork?.name))
                    setModalOpen(false)
                    setEditingWork(null)
                    fetchWork()
                }
                }>
                </WorkForm>
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
                            await deleteWork(selectedWork.id)
                            fetchWork()
                            showToast(TOAST_MSG.INFORMATION, MSG.ENTITY_WAS_HARD_DELETED(ENTITY.TEAM, selectedWork.id))
                        } catch (error: any) {
                            showToast(TOAST_MSG.ERROR, error.message)
                        }
                    }
                }} >
            </ConfirmModal>

            <button type="button" className={style.fab} onClick={() => setModalOpen(true)}>+</button>
            <div className={style.gridCards}>
                {
            /* -------------------------------- CARD_ITEMS ------------------------------- */
                    works.map((work) => (
                        <div key={work.id} className={style.card} style={{
                            color:WORK_STATUS_COLORS[work.status].color,
                            background:WORK_STATUS_COLORS[work.status].bg,
                        }}>
                            <h3>{work.name}</h3>
                            <span>{`Бригадир: ${work.team?.leader?.fullName||'Не назначен'}`}</span>
                            <div className={style.cardFooter}>
                                <div className={style.cardFooterIconList}>
                                    <button title="Привязать бригаду" onClick={() => {
                                        setEditingWork(work),
                                            setModalOpen(true)
                                    }}><FiLink size={32} color="#435290ff" /></button>
                                    <button title="Назначить бригаду" onClick={() => {
                                        setEditingWork(work),
                                            setModalOpen(true)
                                    }}><FiLink2 size={32} color="#435290ff" /></button>
                                    <button title="Редактировать" onClick={() => {
                                        setEditingWork(work),
                                            setModalOpen(true)
                                    }}><FiEdit size={32} /></button>
                                    <button title="Удалить" onClick={() => {
                                        setSelectedWork(work)
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

export default WorkPage