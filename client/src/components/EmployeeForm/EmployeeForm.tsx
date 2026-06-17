import { useEffect, useState } from "react"
import type { BaseType, EmployeeType, PositionType } from "../../type"
import { api } from "../../api"
import { ROLES } from "../../constants"
import './EmployeeForm.css'
import Toast, { TOAST_MSG } from "../Toast/Toast"



const EmployeeForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [password, setPassword] = useState<string>('user123')
    const [employeeData, setEmployeeData] = useState<Partial<EmployeeType>>({})
    const [basesData, setBasesData] = useState<BaseType[]>([])
    const [positionData, setPositionData] = useState<PositionType[]>([])

    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')

    useEffect(() => {
        const fetchListData = async () => {
            try {
                const bases = await api.getBases()
                const positions = await api.getPositions()
                setBasesData(bases.data || [])
                setPositionData(positions.data || [])
            } catch (error) {
                setToastTypeMsg(TOAST_MSG.ERROR)
                setToastMsg("Ошибка загрузки справочников.")
            }
        }
        fetchListData()
    }, [])

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        try {
            const data = { ...employeeData, password }
            const response = await api.createEmployee(data)
            setToastTypeMsg(TOAST_MSG.INFORMATION)
            setToastMsg(response.message)
            setToastOpen(true)
            setTimeout(() => {
                onSuccess?.();
            }, 2000)
            setEmployeeData({})
            setPassword('admin123')

        } catch (error: any) {
            setToastOpen(true)
            setToastTypeMsg(TOAST_MSG.ERROR)
            setToastMsg(error.message)
        }
    }

    return (
        <div className="wrapper">
            <Toast isOpen={toastOpen} message={toastMsg} messageTitle={toastTypeMsg} onClose={() => setToastOpen(false)} autoCloseTime={4000} ></Toast>
            <div className="employee-form-flex">
                <h2>Создать пользователя</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="fullname">ФИО</label>
                    <input type="text" id="fullname" value={employeeData.fullName || ''} onChange={(e) => setEmployeeData({ ...employeeData, fullName: e.target.value })} />
                    <label htmlFor="password">Пароль</label>
                    <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor="positionId">Должность</label>
                    <select id="positionId" value={employeeData.positionId || ''} onChange={(e) => setEmployeeData({ ...employeeData, positionId: Number(e.target.value) })}>
                        <option value="" disabled>Выберите...</option>
                        {
                            positionData.map(pos => (
                                <option key={pos.id} value={pos.id}>{pos.name}</option>
                            ))
                        }
                    </select>
                    <label htmlFor="employeeId">EXXXXXX</label>
                    <input type="text" id="employeeId" value={employeeData.employeeId || ''} onChange={(e) => setEmployeeData({ ...employeeData, employeeId: e.target.value })} />
                    <label htmlFor="email">Почта</label>
                    <input type="text" id="email" value={employeeData.email || ''} onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })} />
                    <label htmlFor="phone">Телефон</label>
                    <input type="text" id="phone" value={employeeData.phone || ''} onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })} />
                    <label htmlFor="baseId">База</label>
                    <select name="" id="baseId" value={employeeData.baseId || ''} onChange={(e) => setEmployeeData({ ...employeeData, baseId: e.target.value })}>
                        <option value="" disabled>Выберите...</option>
                        {
                            basesData.map(base => (
                                <option key={base.id} value={base.id}>{base.name}</option>
                            ))
                        }
                    </select>
                    <label htmlFor="role">Роль</label>
                    <select name="" id="role" value={employeeData.role || ''} onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value as typeof ROLES[keyof typeof ROLES] })}>
                        {Object.values(ROLES).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <button type="submit"> Создать</button>
                </form>
            </div>
        </div>
    )
}

export default EmployeeForm