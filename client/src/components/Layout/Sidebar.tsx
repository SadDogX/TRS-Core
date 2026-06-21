import { NavLink } from 'react-router-dom'
import { ROLES } from '../../constants'
import type { EmployeeType } from '../../type'
import style from './Sidebar.module.css'
interface SidebarProps {
    className?: string
    user?: EmployeeType
}


const Sidebar = ({ user, className }: SidebarProps) => {
    if (!user) return null
    const getNavClass = ({ isActive }: { isActive: boolean }) => ` ${style.link} ${isActive ? style.active : ''}`;
    let menu;
    if (user.role === ROLES.ADMIN) {
        menu = (
            <>
                <NavLink className={getNavClass} to="/employees">Сотрудники</NavLink>
                <NavLink className={getNavClass} to="/teams">Бригады</NavLink>
                <NavLink className={getNavClass} to="/works">Работы</NavLink>
                <NavLink className={getNavClass} to="/bases">Базы</NavLink>
                <NavLink className={getNavClass} to="/positions">Должности</NavLink>
            </>
        );
    } else if (user.role === ROLES.COORDINATOR) {
        menu = (
            <>
                <NavLink className={getNavClass} to="/employees">Сотрудники</NavLink>
                <NavLink className={getNavClass} to="/teams">Бригады</NavLink>
                <NavLink className={getNavClass} to="/works">Работы</NavLink>
            </>
        );
    } else if (user.role === ROLES.LEADER) {
        menu = (
            <>
                <NavLink className={getNavClass} to="/profile">Профиль</NavLink>
                <NavLink className={getNavClass} to="/teams">Мои бригады</NavLink>
                <NavLink className={getNavClass} to="/works">Мои работы</NavLink>
            </>
        );
    } else {
        menu = (
            <>
                <NavLink className={getNavClass} to="/profile">Профиль</NavLink>
                <NavLink className={getNavClass} to="/works">Мои работы</NavLink>
            </>
        );
    }
    return (
        <div className={`${style.sidebar} ${className || ''}`}>
            <div className={`${style.menu_list}`}>
                {menu}
            </div>
        </div>
    )
}
export default Sidebar