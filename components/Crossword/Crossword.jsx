import { initializeListenerFB, updatePuzzleFB } from 'data/firebaseAPI';
import useStateRef from 'hooks/useStateRef';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { generateDefaultArray } from 'util/crosswordArray';
import CrosswordGrid from './CrosswordGrid';

const CELL_DARK_CHAR = '.';

const Crossword = ({}) => {
    const router = useRouter();
    const { puzzleId } = router.query;

    // GRID STATE
    const [grid, setGrid, gridRef] = useStateRef(generateDefaultArray(15, 15));
    const [activeCell, setActiveCell, activeCellRef] = useStateRef(null);
    const [orientation, setOrientation, orientationRef] = useStateRef(false); // f = row traverse, t = col traverse
    const [mirror, setMirror, mirrorRef] = useStateRef(true);

    // DATA
    const [clues, setClues] = useState();

    // SETTINGS
    const [highlightMirror, setHighlightMirror] = useState(true);

    // INTIALIZATION
    useEffect(() => {
        console.log('FIREBASE', puzzleId);

        // initialize firebase sync
        initializeListenerFB(puzzleId, 'grid', (grid) => setGrid(JSON.parse(grid)));

        // assign key handler
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

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

    return (
        <div>
            <CrosswordGrid
                crossword={grid}
                mirror={mirror}
                highlightMirror={mirror && highlightMirror}
                activeCell={activeCell}
                setActiveCell={setActiveCell}
                orientation={orientation}
                setOrientation={setOrientation}
            />
        </div>
    );
};

export default Crossword;
