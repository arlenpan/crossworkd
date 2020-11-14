import { useRef, useState } from 'react';
import copyUrlToClipboard from './copyUrlToClipboard';
import styles from './CopyLabel.module.scss';

const TIME = 3000;

const CopyLabel = ({ children, style }) => {
    const [showCopy, setShowCopy] = useState();
    const ref = useRef();

    const onClick = (e) => {
        if (!showCopy) {
            copyUrlToClipboard(children);
            setShowCopy(true);
            setTimeout(() => {
                if (setShowCopy) setShowCopy(false);
            }, TIME);
        } else {
            setShowCopy(false);
        }
    };

    return (
        <span className={styles.labeled} onClick={onClick} ref={ref} style={style}>
            {showCopy ? 'Copied to Clipboard!' : children}
        </span>
    );
};

export default CopyLabel;
