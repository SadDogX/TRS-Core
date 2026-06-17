import { useEffect, useState } from "react"
import type { EmployeeType, PositionType } from "../../type"
import { api } from "../../api"
import Modal from "../../components/Modal/Modal"
import EmployeeForm from "../../components/EmployeeForm/EmployeeForm"
import Toast, { TOAST_MSG } from "../../components/Toast/Toast"
import { ENTITY, MSG } from "../../constants"
import './EmployeesPage.css'

const EmployeesPage = () => {
    const [employees, setEmployees] = useState<EmployeeType[]>([])
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.getEmployees();
                setEmployees(response.data || []);
                // setToastTypeMsg(TOAST_MSG.INFORMATION)
                // setToastMsg(response.message)
                // setToastOpen(true)

            } catch (error) {
                setToastTypeMsg(TOAST_MSG.ERROR)
                setToastMsg(MSG.ENTITY_WAS_READ(ENTITY.EMPLOYEE))
                setToastOpen(true)
            }
        };
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const response = await api.getEmployees();
        setEmployees(response.data || []);
    };
    return (
        <div className="wrapper">
            <Modal isOpen={modalOpen} onclose={() => setModalOpen(false)}>
                <EmployeeForm onSuccess={() => {
                    setToastTypeMsg(TOAST_MSG.INFORMATION);
                    setToastMsg(MSG.ENTITY_WAS_CREATED(ENTITY.EMPLOYEE, 0));
                    setToastOpen(true);
                    setModalOpen(false)
                    fetchEmployees()
                }
                }>
                </EmployeeForm>
            </Modal>
            <Toast isOpen={toastOpen} onClose={() => setToastOpen(false)} message={toastMsg} messageTitle={toastTypeMsg} autoCloseTime={4000}></Toast>

            <button type="submit" onClick={() => setModalOpen(true)}>Создать сотрудника</button>
            <div className="grid-cards-employees">
                {employees.map((employee) => (
                    <div className="card-employee" key={employee.id}>
                        <h6>{employee.fullName}</h6>
                        <span>{employee.position.name}</span>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default EmployeesPage