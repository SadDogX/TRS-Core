import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import style from './LoginForm.module.css';

const LoginForm = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        console.log(employeeId, password);
        setError('');
        try {
            await login(employeeId, password );
            navigate('/employees');
        } catch {
            setError('Неверный EmployeeID или пароль');
        }
    };

    return (
        <form className={style.form} onSubmit={handleSubmit}>
            <h3>Вход в TRS Core</h3>
            {error && <p className={style.error}>{error}</p>}
            <input
                name="employeeId"
                type="text"
                placeholder="E000001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
            />
            <input
                name="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Войти</button>
        </form>
    );
};

export default LoginForm;