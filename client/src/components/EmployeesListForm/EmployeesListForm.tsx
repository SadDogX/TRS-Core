import React, { useEffect, useState } from 'react';
import style from './EmployeesListForm.module.css';
import { ENTITY, MSG } from '../../constants';
import { api } from '../../api';
import type { EmployeeType, MembersOfTeam } from '../../type';

interface EmployeesListFormProps {
    teamId: string;
    onSuccess: () => void
    initData: MembersOfTeam[]
}

const EmployeesListForm = ({ teamId, onSuccess, initData }: EmployeesListFormProps) => {
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const response = await api.getEmployees()
            setEmployees(response.data || [])
            initData && setSelectedIds(initData.find(data => data.teamId === teamId)?.memberIds ?? [])
        } catch (data: any) {
            console.error(MSG.TBL_IS_EMPTY(ENTITY.EMPLOYEE), data.error.message)
        }
    }
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        try {

            const currentMembers = initData.find(data => data.teamId === teamId)?.memberIds ?? []
            const subMembers = currentMembers.filter(member => !selectedIds.includes(member))
            if (subMembers.length > 0) await api.updateMembersTeamById(teamId, subMembers)


            const addMembers = selectedIds.filter(member => !currentMembers.includes(member))

            if (addMembers.length > 0) await Promise.all(
                addMembers
                    .map(employeeId => {
                        return api.addTeamMember(teamId, employeeId)
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

                                    checked={selectedIds.includes(employee.id)}
                                    onChange={() => toggleEmployees(employee.id)} />
                                <span >{employee.fullName}</span>
                            </div>
                        ))}
                </div>
                <button type="submit">{initData.length > 0 ? 'Обновить' : 'Добавить'}</button>
            </form>
        </>
    );
};

export default EmployeesListForm;