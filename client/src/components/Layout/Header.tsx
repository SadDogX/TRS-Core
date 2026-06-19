import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { EmployeeType } from '../../type'
import style from './Header.module.css'

interface HeaderProps {
    className?: string
    user?: EmployeeType
}

const Header = ({ className, user }: HeaderProps) => {

    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className={`${style.header} ${className || ''}`}>
            {user && <div className={style.userInfo}>
                <span className={style.userName}>{user.fullName}</span>
                <button className={style.logoutButton} onClick={handleLogout}>
                    Выход
                </button>
            </div>}
        </header>
    )
}
export default Header