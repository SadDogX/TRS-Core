import style from './Modal.module.css'

interface ModalProps {
    isOpen: boolean;
    onclose: () => void;
    children: React.ReactNode
}

const Modal = ({ children, isOpen, onclose }: ModalProps) => {

    if (!isOpen) return null

    return (
        <div className={style.overlay} onClick={(e)=>{
            if (e.target===e.currentTarget) onclose()
        }
        }>
            <div className={style.window} onClick={(e) => e.stopPropagation}>
                {children}
            </div>
        </div>
    )
}

export default Modal