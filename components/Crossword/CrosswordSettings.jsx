import Modal from 'components/Modal';

const CrosswordSettings = ({ onClose, onSave }) => {
    return (
        <Modal onClose={onClose}>
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>Columns:</div>
                    <input value="15" />
                </div>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>Rows:</div>
                    <input value="15" />
                </div>
                <button type="submit">Save</button>
            </div>
        </Modal>
    );
};

export default CrosswordSettings;
