import { useEffect, useState } from "react"
import type { BaseType, EmployeeType, PositionType } from "../../type"
import { api } from "../../api"
import { ROLES } from "../../constants"
import './EmployeeForm.css'
import Toast, { TOAST_MSG } from "../Toast/Toast"

interface EmployeeFormProps {
    onSuccess: () => void;
    initData?: EmployeeType
}


const EmployeeForm = ({ onSuccess, initData }: EmployeeFormProps) => {
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

        if (initData) {
            setEmployeeData(initData)
        }
        fetchListData()
    }, [initData])

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        let response;
        const { id, createdAt, updatedAt, position, base, isDeleted, isBlocked, ...cleanData } = employeeData;
        const data: any = { ...cleanData };
        try {
            if (initData) {
                if (password && password !== 'user123') {
                    data.password = password
                }
                console.log(data)
                console.log(password)
                response = await api.updateEmployee(initData.employeeId, data)
            } else {
                data.password = password
                response = await api.createEmployee(data)
            }

            setTimeout(() => {
                setEmployeeData({})
                setPassword('admin123')
                onSuccess?.();
            }, 500)

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
                <h2>{initData ? 'Обновить данные о пользователе' : 'Создать пользователя'}</h2>
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
                    <input type="text" id="employeeId" disabled={!!initData} value={employeeData.employeeId || ''} onChange={(e) => setEmployeeData({ ...employeeData, employeeId: e.target.value })} />
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
                    <button type="submit"> {initData ? 'Обновить' : 'Создать'}</button>
                </form>
            </div>
        </div>
    )
}

export default EmployeeForm