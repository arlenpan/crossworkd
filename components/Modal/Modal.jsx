import styles from './Modal.module.scss';

const Modal = ({ children, style, onClose }) => {
    const handleClose = () => {
        if (onClose) onClose();
    };

    return (
        <div className={styles.modal} style={style}>
            <div className={styles.backdrop} />

            <div className={styles.modalWrapper}>
                <div className={styles.modalInner}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className={styles.closeButton} onClick={handleClose}>
                            &times;
                        </button>
                    </div>
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
