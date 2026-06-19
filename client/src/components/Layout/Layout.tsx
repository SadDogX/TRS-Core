import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from './Header'
import style from './Layout.module.css'
import Sidebar from './Sidebar'


const Layout = () => {
    const { user, loading } = useAuth()
    if (loading) return <div>Loading...</div>
    // if (!user) return <div>Not authorized</div>
    return (
        <div className={style.layout}>
            <Header className={style.header} user={user}></Header>
            <Sidebar className={style.sidebar} ></Sidebar>
            <main className={style.content}>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout