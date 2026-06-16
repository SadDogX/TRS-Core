import { useEffect, useState } from "react"
import type { EmployeeType } from "../../type"
import { api } from "../../api"
import Modal from "../../components/Modal/Modal"
import EmployeeForm from "../../components/EmployeeForm/EmployeeForm"

const EmployeesPage = () => {
    const [employees, setEmployees] = useState<EmployeeType[]>([])
    const [error, setError] = useState<string>('')
    const [modalOpen, setModalOpen] = useState<boolean>(false)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.getEmployees();
                setEmployees(response.data || []);
                setError('')

            } catch {
                setError('Ошибка загрузки сотрудников');
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
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <Modal isOpen={modalOpen} onclose={() => setModalOpen(false)}>
                <EmployeeForm onSuccess={() => {

                    setModalOpen(false)
                    fetchEmployees()
                }
                }>

                </EmployeeForm>
            </Modal>
            <button type="submit" onClick={() => setModalOpen(true)}>Создать сотрудника</button>
            <div className="grid-cards-employees">
                <div className="card-employee">
                    {employees.map((employee) => (
                        <div className="card-employee" key={employee.id}>
                            <span>{employee.fullName}</span>
                            <span>{employee.positionId}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default EmployeesPage