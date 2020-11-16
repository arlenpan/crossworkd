import { generateDefaultArray } from 'util/crosswordUtils';
import isGridsSame from 'util/isGridsSame';
import { fbdb } from './firebase';

export const createNewPuzzleFB = () => {
    const puzzleRef = fbdb.ref('puzzles');
    const blankGrid = JSON.stringify(generateDefaultArray(15, 15));
    const newPuzzleRef = puzzleRef.push({
        title: 'Untitled',
        author: 'Anonymous',
        createdAt: Date.now(),
        grid: blankGrid,
        clues: blankGrid,
    });
    return newPuzzleRef.key;
};

export const findPuzzleFB = async (puzzleId) => {
    const puzzleRef = fbdb.ref(`puzzles/${puzzleId}`);
    const snapshot = await puzzleRef.once('value');
    const retVal = snapshot.val();
    if (retVal) {
        retVal.grid = JSON.parse(retVal.grid);
        retVal.clues = JSON.parse(retVal.clues);
    }
    return retVal;
};

export const updatePuzzleFB = (puzzleId, keyword, value) => {
    const newValue = typeof value === 'Array' ? JSON.stringify(value) : value;
    const ref = fbdb.ref(`puzzles/${puzzleId}/${keyword}`);
    ref.set(newValue);
};

export const subscribePuzzleFB = (puzzleId, keyword, cb) => {
    const ref = fbdb.ref(`puzzles/${puzzleId}/${keyword}`);
    ref.on('value', (snapshot) => {
        const value = snapshot.val();
        cb(value);
    });
};

export const subscribeGridFB = (puzzleId, gridRef, setGrid) => {
    subscribePuzzleFB(puzzleId, 'grid', (g) => {
        // diff grids to avoid unnecessary updates
        const newGrid = JSON.parse(g);
        const oldGrid = gridRef.current;
        if (!isGridsSame(newGrid, oldGrid)) setGrid(newGrid);
    });
};

export const subscribeCluesFB = (puzzleId, clues, setClues) => {
    // diff grids to avoid unnecessary updates
    subscribePuzzleFB(puzzleId, 'clues', (g) => {
        // diff grids to avoid unnecessary updates
        const newClues = JSON.parse(g);
        if (!isGridsSame(newClues, clues)) setClues(newClues);
    });
};
