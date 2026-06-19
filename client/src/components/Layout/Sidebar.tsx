import style from './Sidebar.module.css'
interface SidebarProps{
    className?: string
}

const Sidebar = (props: SidebarProps)=>{
    return(
        <div className={`${style.sidebar} ${props.className || ''}`}>

        </div>
    )
}
export default Sidebar