import CopyLabel from 'components/CopyLabel';
import { CELL_DARK_CHAR } from 'data/consts';
import { initializeListenerFB, updatePuzzleFB } from 'data/firebaseAPI';
import useStateRef from 'hooks/useStateRef';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import compareGrids from 'util/compareGrids';
import { generateCrosswordNum, generateDefaultArray } from 'util/crosswordUtils';
import styles from './Crossword.module.scss';
import CrosswordCluesList from './CrosswordCluesList';
import CrosswordGrid from './CrosswordGrid';

const Crossword = ({}) => {
    const router = useRouter();
    const { puzzleId } = router.query;

    // GRID STATE
    const [grid, setGrid, gridRef] = useStateRef(generateDefaultArray(15, 15));
    const [activeCell, setActiveCell, activeCellRef] = useStateRef(null);
    const [orientation, setOrientation, orientationRef] = useStateRef(false); // f = row traverse, t = col traverse
    const [mirror, setMirror, mirrorRef] = useStateRef(true);

    // DATA
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [clues, setClues] = useState();
    const [numbers, setNumbers] = useState();

    // SETTINGS
    const [highlightMirror, setHighlightMirror] = useState(true);

    // INTIALIZATION
    useEffect(() => {
        console.log('FIREBASE', puzzleId);

        // initialize firebase sync
        initializeListenerFB(puzzleId, 'grid', (g) => {
            // diff grids to avoid unnecessary updates
            // TODO: control updates by timestamp
            const newGrid = JSON.parse(g);
            const oldGrid = gridRef.current;
            const isSame = compareGrids(newGrid, oldGrid);
            if (!isSame) setGrid(newGrid);
        });

        // start listeners for db changes
        initializeListenerFB(puzzleId, 'title', setTitle);
        initializeListenerFB(puzzleId, 'author', setAuthor);

        // assign key handler
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    // ON CROSSWORD UPDATES
    useEffect(() => {
        console.log('GRID UPDATE', grid);

        // check if we need to update numbers
        if (grid) {
            const newNumbers = generateCrosswordNum(grid);
            const isSame = compareGrids(newNumbers, numbers);
            if (!isSame) setNumbers(newNumbers);
        }
    }, [grid]);

    // ON NUMBER UPDATES
    useEffect(() => {
        console.log('NUMBERS UPDATE', numbers);

        // check if we need to update clues
        if (numbers) {
            
        }
    }, [numbers]);

    const onKeyDown = (e) => {
        const grid = gridRef.current;
        const activeCell = activeCellRef.current;
        const orientation = orientationRef.current;

        if (!activeCell) return;

        // ORIENTATION
        if (e.key === 'Enter') {
            setOrientation(!orientation);
        }

        // DELETION
        if (e.key === 'Backspace') {
            let newRow = activeCell[0];
            let newCol = activeCell[1];

            // check if current cell is filled
            if (grid[newRow][newCol]) {
                setCell(null, newRow, newCol);
            } else {
                // otherwise, delete previous cell
                if (!orientation) {
                    newRow = newRow > 0 ? newRow - 1 : 0;
                } else {
                    newCol = newCol > 0 ? newCol - 1 : 0;
                }
                if (grid[newRow][newCol]) {
                    setCell(null, newRow, newCol);
                }
                if (newRow !== activeCell[0] || newCol !== activeCell[1]) {
                    setActiveCell([newRow, newCol]);
                }
            }
        }

        // SETTING VALUES
        const valueKey = (e.keyCode >= 65 && e.keyCode <= 90) || e.key === CELL_DARK_CHAR || e.key === ' ';
        if (valueKey) {
            if (e.key !== ' ') setCell(e.key, activeCell[0], activeCell[1]);
            const newRow = !orientation && activeCell[0] < grid.length - 1 ? activeCell[0] + 1 : activeCell[0];
            const newCol = orientation && activeCell[1] < grid[0].length - 1 ? activeCell[1] + 1 : activeCell[1];
            if (newRow !== activeCell[0] || newCol !== activeCell[1]) {
                setActiveCell([newRow, newCol]);
            }
        }

        // MOVEMENT
        const movementKey = e.keyCode >= 37 && e.keyCode <= 40;
        if (movementKey) {
            // we do not move but change orientation if not in the correct one
            const incorrectOrientation =
                (!orientation && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) ||
                (orientation && (e.key === 'ArrowUp' || e.key === 'ArrowDown'));

            if (incorrectOrientation) {
                setOrientation(!orientation);
            } else {
                let newRow = activeCell[0];
                let newCol = activeCell[1];
                switch (e.key) {
                    case 'ArrowUp':
                        newRow--;
                        break;
                    case 'ArrowDown':
                        newRow++;
                        break;
                    case 'ArrowRight':
                        newCol++;
                        break;
                    case 'ArrowLeft':
                        newCol--;
                        break;
                    default:
                        break;
                }

                // we're allowed to exceed bounds here
                if (newRow > grid.length - 1) newRow = newRow % grid.length;
                if (newCol > grid[0].length - 1) newCol = newCol % grid[0].length;
                if (newRow < 0) newRow = grid.length - 1;
                if (newCol < 0) newCol = grid[0].length - 1;
                setActiveCell([newRow, newCol]);
            }
        }
    };

    const setCell = (data, row, col) => {
        const grid = gridRef.current;
        const mirror = mirrorRef.current;
        let hasUpdate = false;

        const newGrid = [...grid];
        const updateCell = newGrid[row][col];

        // update cell
        if (updateCell !== data) {
            newGrid[row][col] = data;
            hasUpdate = true;
        }

        // update mirror, if necessary
        if (mirror) {
            const mirrorRow = newGrid.length - 1 - row;
            const mirrorCol = newGrid[0].length - 1 - col;
            const mirrorCell = newGrid[mirrorRow][mirrorCol];

            if (data === CELL_DARK_CHAR) {
                if (mirrorCell !== CELL_DARK_CHAR) {
                    newGrid[mirrorRow][mirrorCol] = CELL_DARK_CHAR;
                    hasUpdate = true;
                }
            } else if (data && data !== CELL_DARK_CHAR) {
                if (mirrorCell === CELL_DARK_CHAR) {
                    newGrid[mirrorRow][mirrorCol] = null;
                    hasUpdate = true;
                }
            } else if (!data) {
                // cell deletion
                if (updateCell === CELL_DARK_CHAR && mirrorCell === CELL_DARK_CHAR) {
                    newGrid[mirrorRow][mirrorCol] = null;
                    hasUpdate = true;
                }
            }
        }

        if (hasUpdate) {
            setGrid(newGrid);
            updatePuzzleFB(puzzleId, 'grid', JSON.stringify(newGrid));
        }
    };

    // HANDLERS

    const onClearClick = () => {
        const grid = generateDefaultArray(15, 15);
        setGrid(grid);
        updatePuzzleFB(puzzleId, 'grid', JSON.stringify(grid));
    };

    const onMirrorClick = () => {
        setMirror(!mirror);
    };

    const onHighlightMirrorClick = () => {
        setHighlightMirror(!highlightMirror);
    };

    return (
        <>
            <div className={styles.crosswordHeader}>
                <div className={styles.crosswordTitle}>
                    {title}
                    {/* <AutosizeInput
                        name="title"
                        value={title}
                        onChange={onTitleChange}
                        inputStyle={{ fontSize: '200%', border: 'none' }}
                    /> */}
                    <span>by</span>
                    {author}
                    {/* <AutosizeInput
                        name="author"
                        value={author}
                        onChange={onAuthorChange}
                        inputStyle={{ border: 'none' }}
                    /> */}
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    Puzzle ID: <CopyLabel style={{ marginLeft: '0.5rem' }}>{puzzleId}</CopyLabel>
                </div>
            </div>

            <div className={styles.crosswordWrapper}>
                <CrosswordGrid
                    crossword={grid}
                    numbers={numbers}
                    mirror={mirror}
                    highlightMirror={mirror && highlightMirror}
                    activeCell={activeCell}
                    setActiveCell={setActiveCell}
                    orientation={orientation}
                    setOrientation={setOrientation}
                />
                <CrosswordCluesList
                    activeCell={activeCell}
                    numbers={numbers}
                    orientation={orientation}
                    clues={clues}
                    setClues={setClues}
                />
            </div>

            <div className={styles.crosswordFooter}>
                <button onClick={onClearClick}>Clear</button>
                <button onClick={onMirrorClick}>Mirroring: {mirror ? 'ON' : 'OFF'}</button>
                <button onClick={onHighlightMirrorClick}>Highlight Mirror: {highlightMirror ? 'ON' : 'OFF'}</button>
                {/* <button onClick={onDownloadPuzClick}>Export PUZ</button> */}
            </div>
        </>
    );
};

export default Crossword;
