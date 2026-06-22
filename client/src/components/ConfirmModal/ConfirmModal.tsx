import style from './ConfirmModal.module.css';

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
        <div className={style.overlay}>
            <div className={style.confirmModal}>
                <h3 className={style.title}>{title}</h3>
                <p className={style.message}>{message}</p>
                <div className={style.footerButtons}>
                    <button className={style.btnOk} onClick={() => {
                        onConfirm(true);
                        onClose();
                    }}>Ок</button>
                    <button className={style.btnCancel} onClick={() => {
                        onConfirm(false);
                        onClose();
                    }}>Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;