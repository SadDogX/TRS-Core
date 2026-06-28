import { useEffect, useState } from "react"
import type { EmployeeType } from "../../type"
import { api } from "../../api"
import Modal from "../../components/Modal/Modal"
import EmployeeForm from "../../components/EmployeeForm/EmployeeForm"
import Toast, { TOAST_MSG } from "../../components/Toast/Toast"
import { ENTITY, MSG } from "../../constants"
import style from './EmployeesPage.module.css'
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import { FiEdit, FiLock, FiUnlock, FiTrash2 } from 'react-icons/fi'

const EmployeesPage = () => {
    const [employees, setEmployees] = useState<EmployeeType[]>([])
    const [modalOpen, setModalOpen] = useState<boolean>(false)

    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')

    const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | undefined>()

    const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>()

    useEffect(() => {
        fetchEmployees();
    }, []);

    const showToast = (title: string, message: string) => {
        setToastTypeMsg(title);
        setToastMsg(message);
        setToastOpen(true);
    }

    const fetchEmployees = async () => {
        const response = await api.getEmployees();
        setEmployees(response.data || []);
    };

    const deleteEmployee = async (id: string | undefined) => {
        if (!id) return;
        await api.deleteEmployee(id)
    }

    const toggleLockEmployee = async (id: string) => {
        await api.toggleBlockEmployee(id)
    }

    return (
        <div className={style.wrapper}>
            <Modal isOpen={modalOpen} onclose={() => {
                setModalOpen(false)
                setEditingEmployee(null)
            }}>
                <EmployeeForm initData={editingEmployee} onSuccess={() => {
                    showToast(TOAST_MSG.INFORMATION,
                        editingEmployee ?
                            MSG.ENTITY_WAS_UPDATED(ENTITY.EMPLOYEE, editingEmployee.fullName) :
                            MSG.ENTITY_WAS_CREATED(ENTITY.EMPLOYEE, selectedEmployee?.fullName))
                    setModalOpen(false)
                    setEditingEmployee(null)
                    fetchEmployees()
                }
                }>
                </EmployeeForm>
            </Modal>
            <Toast
                isOpen={toastOpen}
                onClose={() => setToastOpen(false)}
                message={toastMsg}
                messageTitle={toastTypeMsg}
                autoCloseTime={5000}>
            </Toast>
            <ConfirmModal
                isOpen={confirmOpen}
                message="Вы действительно хотите удалить?"
                title="Удаление элемента."
                onClose={() => setConfirmOpen(false)}
                onConfirm={async (confirm) => {
                    if (confirm) {
                        try {
                            await deleteEmployee(selectedEmployee.id)
                            fetchEmployees()
                            showToast(TOAST_MSG.INFORMATION, MSG.ENTITY_WAS_HARD_DELETED(ENTITY.EMPLOYEE, selectedEmployee.fullName))
                        } catch (data: any) {
                            const dependencies = data.data
                            const message= `Сотрудник ${selectedEmployee.fullName} не может быть удален, имеет следующие зависимости:\n
                            В бригаде:${dependencies.teamMember}
                            Бригадир:${dependencies.teamsAsLeader}
                            Создатель бригады:${dependencies.teamsAsCreator}
                            В работе:${dependencies.workAssignment}`
                            console.log(message)
                            showToast(TOAST_MSG.ERROR, message||data.error)
                        }
                    }
                }} >
            </ConfirmModal>

            <button type="button" className={style.fab} onClick={() => setModalOpen(true)}>+</button>
            <div className={style.gridCardsEmployees}>
                {employees.map((employee) => (
                    <div className={style.cardEmployee} key={employee.id} >
                        <h3>{employee.fullName}</h3>
                        <span>{employee.position.name}</span>
                        <div className={style.cardFooter}>
                            <div className={style.cardFooterIconList}>
                                <button title="Заблокировать" onClick={async () => {
                                    try {
                                        await toggleLockEmployee(employee.id)
                                        fetchEmployees()
                                        showToast(TOAST_MSG.INFORMATION, (employee.isBlocked ? 'Разблокирован' : 'Заблокирован') + ' сотрудник :' + employee.fullName)
                                    } catch (data: any) {
                                        showToast(TOAST_MSG.ERROR, data.error)
                                    }
                                }}>
                                    {employee.isBlocked ? <FiLock size={32}/> : <FiUnlock size={32} />}</button>
                                <button title="Редактировать" onClick={() => {
                                    setEditingEmployee(employee),
                                        setModalOpen(true)
                                }}><FiEdit size={32}/></button>
                                <button title="Удалить" onClick={() => {
                                    setSelectedEmployee(employee)
                                    setConfirmOpen(true)
                                }}><FiTrash2 size={32}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div >
    )
}

export default EmployeesPage