import { useEffect, useState } from "react"
import type { BaseType, EmployeeType, PositionType } from "../../type"
import { api } from "../../api"
import { ROLES } from "../../constants"
import './EmployeeForm.css'



const EmployeeForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [password, setPassword] = useState<string>('user123')
    const [employeeData, setEmployeeData] = useState<Partial<EmployeeType>>({})
    const [error, setError] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [basesData, setBasesData] = useState<BaseType[]>([])
    const [positionData, setPositionData] = useState<PositionType[]>([])

    useEffect(() => {
        const fetchListData = async () => {
            try {
                const bases = await api.getBases()
                const positions = await api.getPositions()
                setBasesData(bases.data || [])
                setPositionData(positions.data || [])
                setError('')
            } catch (error) {
                setError("Ошибка загрузки справочников.")
                setMessage('')
            }
        }
        fetchListData()
    }, [])

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        try {
            const data = { ...employeeData, password }
            await api.createEmployee(data)
            console.log(data)
            setMessage('Пользователь создан успешно.')
            setTimeout(() => {
                onSuccess?.();
                setMessage('')
            }, 2000)
            setEmployeeData({})
            setPassword('admin123')

        } catch (error) {
            setError('Ошибка при сохранении пользователя..')
        }
    }

    return (
        <div className="wrapper">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <div className="employee-form-flex">
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