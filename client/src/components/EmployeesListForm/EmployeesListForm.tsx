import React, { useEffect, useState } from 'react';
import style from './EmployeesListForm.module.css';
import { ENTITY, MSG } from '../../constants';
import { api } from '../../api';
import type { EmployeeType, MembersOfTeam, TeamType } from '../../type';

interface EmployeesListFormProps {
    team: TeamType;
    onSuccess: () => void
    initData: MembersOfTeam[]
}

const EmployeesListForm = ({ team, onSuccess, initData }: EmployeesListFormProps) => {
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const response = await api.getEmployees()
            const busyEmployeeIds = (await api.getBusyEmployeeIds()).data
            const busyEmployee:string[] = (await api.getBusyEmployeeIds()).data.map(emp=>emp.id)
            const freeEmployees = response.data
                .filter(e => {
                    const isBlocked = busyEmployeeIds.map(emp => emp.id === e.id && emp.teamId!==team.id)
                    return isBlocked
                })
            // console.log(busyEmployeeIds);
            // console.log('init:',initData);
            
            setEmployees(freeEmployees)
            
            initData && setSelectedIds(initData.find(data => data.teamId === team.id)?.memberIds ?? [])
            setSelectedIds([...selectedIds,...busyEmployee])
        } catch (data: any) {
            console.error(MSG.TBL_IS_EMPTY(ENTITY.EMPLOYEE), data.error.message)
        }
    }
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        try {

            const currentMembers = initData.find(data => data.teamId === team.id)?.memberIds ?? []
            const subMembers = currentMembers.filter(member => !selectedIds.includes(member))
            if (subMembers.length > 0) await api.updateMembersTeamById(team.id, subMembers)


            const addMembers = selectedIds.filter(member => !currentMembers.includes(member))

            if (addMembers.length > 0) await Promise.all(
                addMembers
                    .map(employeeId => {
                        return api.addTeamMember(team.id, employeeId)
                    }
                    ))

            onSuccess()
        } catch (data: any) {
            console.error(MSG.SERVER_ERROR, data.error)
        }
    };

    const toggleEmployees = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(_id => _id !== id)
                : [...prev, id])
    }

    return (
        <>
            <h3 className={style.title}>Выберите сотрудников</h3>
            <form className={style.form} onSubmit={handleSubmit}>
                <div className={style.employeeCol}>
                    { }
                    {employees
                        .filter((employee => !employee.isBlocked && !employee.isDeleted)).map((employee =>
                            <div className={style.employeeRow} key={employee.id}>
                                <input type="checkbox"
                                    disabled = {employees.some(emp=> emp.id===team.leaderId)}
                                    checked={selectedIds.includes(employee.id)}
                                    onChange={() => toggleEmployees(employee.id)} />
                                <span >{employee.fullName}</span>
                            </div>
                        ))}
                </div>
                <button type="submit">{initData.some(e=>e.teamId===team.id&&e.memberIds.length>0) ? 'Обновить' : 'Добавить'}</button>
            </form>
        </>
    );
};

export default EmployeesListForm;