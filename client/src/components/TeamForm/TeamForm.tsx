import { useEffect, useState } from "react"
import type { EmployeeType, TeamType } from "../../type"
import { api } from "../../api"
import style from './Team.module.css'
import Toast, { TOAST_MSG } from "../Toast/Toast"
import { useAuth } from "../../context/AuthContext"
import { TEAM_STATUS } from "../../constants"

interface TeamFormProps {
    onSuccess: () => void;
    initData?: TeamType
}

const TeamForm = ({ onSuccess, initData }: TeamFormProps) => {
    const [teamData, setTeamData] = useState<Partial<TeamType>>({})
    const [owner, setOwner] = useState<EmployeeType>(null)
    const [employees, setemployees] = useState<EmployeeType[]>([])
    // const [work, setWork] = useState<WorkerType>(null)

    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')

    const auth = useAuth()

    useEffect(() => {
        const fetchListData = async () => {
            try {
                setOwner(auth.user)
                setemployees((await api.getEmployees()).data)
            } catch (error) {
                setToastTypeMsg(TOAST_MSG.ERROR)
                setToastMsg("Ошибка загрузки справочников.")
            }
        }

        if (initData) {
            setTeamData(initData)
        }
        fetchListData()
    }, [initData])

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        let response;
        const { id, createdAt, updatedAt, isDeleted, workId, ...cleanData } = teamData;
        const data: any = { ...cleanData };
        try {
            if (initData) {

                response = await api.updateTeam(initData.id, data)
            } else {
                if(!owner) return
                console.log(owner)
                data.createdById = owner.id
                response = await api.createTeam(data)
            }

            setTimeout(() => {
                setTeamData({})
                onSuccess?.();
            }, 500)

        } catch (error: any) {
            setToastOpen(true)
            setToastTypeMsg(TOAST_MSG.ERROR)
            setToastMsg(error.message)
        }
    }

    return (
        <div className={style.wrapper}>
            <Toast isOpen={toastOpen} message={toastMsg} messageTitle={toastTypeMsg} onClose={() => setToastOpen(false)} autoCloseTime={4000} />
            <div className={style.formFlex}>
                <h2>{initData ? 'Обновить данные бригады' : 'Создать бригаду'}</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Название</label>
                    <input type="text" id="name" value={teamData.name || ''} onChange={(e) => setTeamData({ ...teamData, name: e.target.value })} />


                    <label htmlFor="leaderId">Бригадир</label>
                    <select id="leaderId" value={teamData.leaderId || ''} onChange={(e) => setTeamData({ ...teamData, leaderId: e.target.value })}>
                        <option value="" disabled>Выберите...</option>
                        {
                            employees
                            .filter((emp)=>!emp.isBlocked && !emp.isDeleted)
                            .map(employee => (
                                <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                            ))
                        }
                    </select>

                    <label htmlFor="status">Статус</label>
                    <select id="status" value={teamData.status || ''} onChange={(e) => setTeamData({ ...teamData, status: e.target.value })}>
                        <option value="" disabled>Выберите...</option>
                        {
                            Object.values(TEAM_STATUS).map(status =>
                                <option key={status} value={status}>{status}</option>
                            )
                        }
                    </select>



                    <button type="submit">{initData ? 'Обновить' : 'Создать'}</button>
                </form>
            </div>
        </div>
    )
}

export default TeamForm