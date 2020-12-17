import CopyLabel from 'components/CopyLabel';
import { CELL_DARK_CHAR } from 'data/consts';
import { subscribeCluesFB, subscribeGridFB, subscribePuzzleFB, updateCluesFb, updateGridFB } from 'data/firebaseAPI';
import useStateRef from 'hooks/useStateRef';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
    findActiveNumber,
    generateCrosswordNum,
    generateCrosswordState,
    generateDefaultArray,
} from 'util/crosswordUtils';
import { generatePuz } from 'util/downloadPuz';
import isGridsSame from 'util/isGridsSame';
import styles from './Crossword.module.scss';
import CrosswordCluesList from './CrosswordCluesList';
import CrosswordGrid from './CrosswordGrid';
import CrosswordSettings from './CrosswordSettings';

const Crossword = ({}) => {
    const router = useRouter();
    const { puzzleId } = router.query;

    // GRID STATE (synced with Firebase)
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [grid, setGrid, gridRef] = useStateRef(); // 2d grid representing crossword
    const [clues, setClues] = useState(); // 2d grid representing clues. We track this to maintain clue position if a number changes

    // derived state
    const [numbers, setNumbers] = useState(); // 2d grid representing numbers
    const [crosswordState, setCrosswordState] = useState(); // dictionary containing all clues, values to number

    // SETTINGS
    const [activeCell, setActiveCell, activeCellRef] = useStateRef(null); // [x,y] of active selected cell
    const [orientation, setOrientation, orientationRef] = useStateRef(false); // f = row traverse, t = col traverse
    const [mirror, setMirror, mirrorRef] = useStateRef(true); // bool checking if mirroring is on
    const [highlightMirror, setHighlightMirror] = useState(true); // bool checking if mirror highlighting is on
    const [showSettings, setShowSettings] = useState(false);

    // INTIALIZATION
    useEffect(() => {
        // initialize firebase sync
        // TODO: control updates by timestamp
        subscribePuzzleFB(puzzleId, 'title', setTitle);
        subscribePuzzleFB(puzzleId, 'author', setAuthor);
        subscribeGridFB(puzzleId, gridRef, setGrid);
        subscribeCluesFB(puzzleId, clues, setClues);

        // assign kb handler
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    // ON CROSSWORD UPDATES
    useEffect(() => {
        console.log('');
        console.log('GRID UPDATE', grid);

        if (grid) {
            // check if we need to update numbers
            const newNumbers = generateCrosswordNum(grid);
            if (!isGridsSame(newNumbers, numbers)) {
                console.log('NUMBERS UPDATE', newNumbers);
                setNumbers(newNumbers);
            }

            // update state
            const state = generateCrosswordState(grid, newNumbers);
            setCrosswordState(state);
            console.log('STATE UPDATE', state);
        }
    }, [grid]);

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
            updateGridFB(puzzleId, newGrid);
        }
    };

    const setClue = (data, x, y, direction) => {
        const newClues = [...clues];
        if (!newClues[y][x]) {
            newClues[y][x] = {
                down: '',
                across: '',
            };
        }

        newClues[y][x][direction] = data;
        setClues(newClues);
        updateCluesFb(puzzleId, newClues);
    };

    // HANDLERS

    const onClearClick = () => {
        const grid = generateDefaultArray(15, 15);
        setGrid(grid);
        updateGridFB(puzzleId, grid);
    };

    const onMirrorClick = () => {
        setMirror(!mirror);
    };

    const onHighlightMirrorClick = () => {
        setHighlightMirror(!highlightMirror);
    };

    const onDownloadPuzClick = () => {
        generatePuz(grid, numbers, clues, crosswordState, title, author);
    };

    const onEditSettings = () => {
        setShowSettings(true);
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
                    activeNumber={findActiveNumber(activeCell, orientation, numbers)}
                    orientation={orientation}
                    crosswordState={crosswordState}
                    clues={clues}
                    setClue={setClue}
                />
            </div>

            <div className={styles.crosswordFooter}>
                <button onClick={onClearClick}>Clear</button>
                <button onClick={onMirrorClick}>Mirroring: {mirror ? 'ON' : 'OFF'}</button>
                <button onClick={onHighlightMirrorClick}>Highlight Mirror: {highlightMirror ? 'ON' : 'OFF'}</button>
                <button onClick={onDownloadPuzClick}>Export PUZ</button>
                <button onClick={onEditSettings}>Settings</button>
            </div>

            {showSettings && <CrosswordSettings onClose={() => setShowSettings(false)} />}
        </>
    );
};

export default Crossword;
