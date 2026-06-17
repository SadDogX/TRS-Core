import { useEffect } from "react";
import styles from './Toast.module.css'



export const TOAST_MSG = {
    ERROR: 'Ошибка!',
    WARNING: 'Предупреждение!',
    INFORMATION: "Информация",
} as const

interface ToastProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    messageTitle: string;
    autoCloseTime:number
}
const Toast = ({ isOpen, onClose, message, messageTitle,autoCloseTime }: ToastProps) => {

    const typeClass = messageTitle === TOAST_MSG.ERROR ? styles.error :
        messageTitle === TOAST_MSG.WARNING ? styles.warning : styles.info;


    useEffect(() => {
        if (!isOpen) return
        const timer = setTimeout(() => {
            onClose()
        }, autoCloseTime);
        return () => clearTimeout(timer)
    }, [isOpen, onClose])

    if (!isOpen) return null
    return (
        <div className={`${styles['toast-window']} ${typeClass}`} onClick={() => {
            onClose()
        }}>
            <h2>{messageTitle}</h2>
            <span>{message}</span>
        </div>
    )
}

export default Toast