import { CELL_DARK_CHAR } from 'data/consts';

export const generateDefaultArray = (width, height) => [...Array(height)].map(() => [...Array(width)]);

export const generateCrosswordNum = (crossword) => {
    const numbers = generateDefaultArray(crossword[0].length, crossword.length);

    let count = 1;
    for (let y = 0; y < crossword.length; y++) {
        // build all down numbers
        for (let x = 0; x < crossword[y].length; x++) {
            const cell = crossword[y][x];

            // skip dark squares
            if (cell === CELL_DARK_CHAR) continue;

            const addNum =
                // if on edge, add number
                x === 0 ||
                y === 0 ||
                // if cell above is dark, add number
                (y > 0 && crossword[y - 1][x] === CELL_DARK_CHAR) ||
                // if cell left is dark, add number
                (x > 0 && crossword[y][x - 1] === CELL_DARK_CHAR);

            if (addNum) {
                numbers[y][x] = count;
                count++;
            }
        }
    }

    return numbers;
};
