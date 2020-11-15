import { useRef, useEffect } from 'react';
import { generateDefaultArray } from 'util/crosswordArray';
import styles from './CrosswordGrid.module.scss';

const CrosswordGrid = ({
    crossword = generateDefaultArray(15, 15),
    numbers,
    mirror,
    highlightMirror,
    activeCell,
    setActiveCell,
    orientation,
    setOrientation,
}) => {
    const ref = useRef();

    useEffect(() => {
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, []);

    const onClickOutside = (e) => {
        if (ref && !ref.current.contains(e.target)) {
            setActiveCell(null);
        }
    };

    const onCellClick = (rowIndex, colIndex) => {
        const isActive = activeCell && activeCell[0] === rowIndex && activeCell[1] === colIndex;
        if (isActive) {
            setOrientation(!orientation);
        } else {
            setActiveCell([rowIndex, colIndex]);
        }
    };

    const renderCell = (data, rowIndex, colIndex) => {
        const isDark = data === '.';
        const isActive = activeCell && activeCell[0] === rowIndex && activeCell[1] === colIndex;
        const isMirror =
            highlightMirror &&
            mirror &&
            activeCell &&
            activeCell[0] === crossword.length - 1 - rowIndex &&
            activeCell[1] === crossword[0].length - 1 - colIndex;
        const isHighlighted =
            !isActive &&
            !isDark &&
            activeCell &&
            (orientation ? activeCell[0] === rowIndex : activeCell[1] === colIndex);

        let className = '';
        if (isDark) className += ` ${styles.dark}`;
        if (isActive) className += ` ${styles.active}`;
        if (isMirror) className += ` ${styles.mirror}`;
        if (isHighlighted) className += ` ${styles.highlighted}`;

        return (
            <td key={colIndex} className={className} onClick={() => onCellClick(rowIndex, colIndex)}>
                {numbers && <div className="label">{numbers[rowIndex][colIndex]}</div>}
                <span>{data}</span>
                <input value={data || ''} onClick={() => {}} onChange={() => {}} />
            </td>
        );
    };

    return (
        <div className={styles.crosswordGrid} ref={ref}>
            <table>
                <tbody>
                    {crossword.map((row, rowIndex) => (
                        <tr key={rowIndex}>{row.map((column, colIndex) => renderCell(column, rowIndex, colIndex))}</tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CrosswordGrid;
