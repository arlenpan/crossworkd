import { generateDefaultArray } from 'util/crosswordArray';
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

export const initializeListenerFB = (puzzleId, keyword, cb) => {
    const ref = fbdb.ref(`puzzles/${puzzleId}/${keyword}`);
    const callbackWrapper = (snapshot) => {
        const value = snapshot.val();
        cb(value);
    };
    ref.on('value', callbackWrapper);
};
