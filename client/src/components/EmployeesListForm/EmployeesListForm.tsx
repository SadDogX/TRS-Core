import React, { useEffect, useState } from 'react';
import style from './EmployeesListForm.module.css';
import { ENTITY, MSG } from '../../constants';
import { api } from '../../api';
import type { EmployeeType } from '../../type';

interface EmployeesListFormProps {
    teamId: string;
    onSuccess: () => void
}

const EmployeesListForm = ({ teamId, onSuccess }: EmployeesListFormProps) => {
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const response = await api.getEmployees()
            setEmployees(response.data || [])
        } catch (error: any) {
            console.error(MSG.TBL_IS_EMPTY(ENTITY.EMPLOYEE), error.message)
        }
    }
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        try {
            await Promise.all(employees
                .filter(employee => selectedIds.includes(employee.id))
                .map(employee => {
                    api.addTeamMember(teamId, employee.id)
                }
                ))
            onSuccess()
        } catch (error: any) {
            console.error(MSG.SERVER_ERROR, error.message)
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
                <button type="submit">Добавить</button>
            </form>
        </>
    );
};

export default EmployeesListForm;