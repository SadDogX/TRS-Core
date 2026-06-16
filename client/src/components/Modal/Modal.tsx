import './Modal.css'
interface ModalProps {
    isOpen: boolean;
    onclose: () => void;
    children: React.ReactNode
}

const Modal = ({ children, isOpen, onclose }: ModalProps) => {

    if (!isOpen) return null

    return (
        <div className="wrapper-modal" onClick={(e)=>{
            if (e.target===e.currentTarget) onclose()
        }
        }>
            <div className="modal-window" onClick={(e) => e.stopPropagation}>
                {children}
            </div>
        </div>
    )
}

export default Modal