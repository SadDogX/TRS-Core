import './ConfirmModal.css'

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (flag: boolean) => void;
    title: string;
    message: string;
}

const ConfirmModal = ({ isOpen, message, onClose, onConfirm, title }: ConfirmModalProps) => {
    if (!isOpen) return null;
    return (
        <div className='overlay'>
            <div className='confirm-modal '>
                <h3 className='title'>{title}</h3>
                <p className='message'>{message}</p>
                <div className='footer-buttons'>
                    <button className='btn_ok' onClick={() => {
                        onConfirm(true)
                        onClose()
                    }}>Ок</button>
                    <button className='btn_cancel' onClick={() => {
                        onConfirm(false)
                        onClose()
                    }}>Отемена</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal