import { useEffect, useState } from "react"
import type { WorkListType,  WorkType } from "../../type"
import { api } from "../../api"
import style from './WorkForm.module.css'
import Toast, { TOAST_MSG } from "../Toast/Toast"
import {  WORK_STATUSES } from "../../constants"

interface WorkFormProps {
    onSuccess: () => void;
    initData?: WorkType
}

const WorkForm = ({ onSuccess, initData }: WorkFormProps) => {
    const [workData, setWorkData] = useState<Partial<WorkType>>({})
    const [workTypes,setWorkTypes] = useState<WorkListType[]>([])

    const [toastOpen, setToastOpen] = useState<boolean>(false)
    const [toastTypeMsg, setToastTypeMsg] = useState<string>('')
    const [toastMsg, setToastMsg] = useState<string>('')


    useEffect(() => {
        if (initData) {
            setWorkData(initData)
        }
        fetchListData()
    }, [initData])

    const fetchListData = async () => {
        try {
            const response =await api.getWorkTypes()
            setWorkTypes(response.data)
        } catch (error) {
            setToastTypeMsg(TOAST_MSG.ERROR)
            setToastMsg("Ошибка загрузки справочников.")
        }
    }
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault()
        let response;
        const { id, createdAt, updatedAt, isDeleted,workTypes,team, ...cleanData } = workData;
        const data: any = { ...cleanData };
        try {
            if (initData) {
                response = await api.updateWork(initData.id, data)
            } else {
                response = await api.createWork(data)
            }

            setTimeout(() => {
                setWorkData({})
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

            <Toast
                isOpen={toastOpen}
                message={toastMsg}
                messageTitle={toastTypeMsg}
                onClose={() => setToastOpen(false)}
                autoCloseTime={4000} />

            <div className={style.formFlex}>
                <h2>{initData ? 'Обновить данные по работе' : 'Создать работу'}</h2>
                <form onSubmit={handleSubmit}>

                    <label htmlFor="name">Название</label>
                    <input type="text" id="name" value={workData.name || ''} onChange={(e) => setWorkData({ ...workData, name: e.target.value })} />

                    <label htmlFor="wellId">Номер скважины</label>
                    <input type="text" id="wellId" value={workData.wellId || ''} onChange={(e) => setWorkData({ ...workData, wellId: e.target.value })} />

                    <label htmlFor="status">Статус работы</label>
                    <select id="status" value={workData.status || ''} onChange={(e) => setWorkData({ ...workData, status:e.target.value as typeof WORK_STATUSES[keyof typeof WORK_STATUSES]})}>
                        <option value="" disabled>Выберите...</option>
                        {
                            Object.values(WORK_STATUSES).map(status =>
                                <option key={status} value={status}>{status}</option>
                            )
                        }
                    </select>

                    <label htmlFor="workType">Тип работы</label>
                    <select id="workType" value={workData.workTypeId || ''} onChange={(e) => setWorkData({ ...workData, workTypeId: Number(e.target.value) })}>
                        <option value="" disabled>Выберите...</option>
                        {
                            workTypes.map(status =>
                                <option key={status.id} value={status.id}>{status.name}</option>
                            )
                        }
                    </select>



                    <button type="submit">{initData ? 'Обновить' : 'Создать'}</button>
                </form>
            </div>
        </div>
    )
}

export default WorkForm