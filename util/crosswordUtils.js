import { CELL_DARK_CHAR, DIR_ACROSS, DIR_DOWN } from 'data/consts';

export const generateDefaultArray = (width, height) => [...Array(height)].map(() => [...Array(width)]);

export const generateCrosswordNum = (grid) => {
    const numbers = generateDefaultArray(grid[0].length, grid.length);

    let count = 1;
    for (let y = 0; y < grid.length; y++) {
        // build all down numbers
        for (let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];

            // skip dark squares
            if (cell === CELL_DARK_CHAR) {
                numbers[y][x] = CELL_DARK_CHAR;
                continue;
            }

            const addNum =
                // if on edge, add number
                x === 0 ||
                y === 0 ||
                // if cell above is dark, add number
                (y > 0 && grid[y - 1][x] === CELL_DARK_CHAR) ||
                // if cell left is dark, add number
                (x > 0 && grid[y][x - 1] === CELL_DARK_CHAR);

            if (addNum) {
                numbers[y][x] = count;
                count++;
            }
        }
    }

    return numbers;
};

// generates state of entire crossword with values and lengths
export const generateCrosswordState = (grid, numbers) => {
    if (!grid || !numbers) return;

    const newList = {};

    const addToList = (num, value, direction, y, x) => {
        if (!newList[num]) newList[num] = {};
        newList[num][direction] = {
            value,
            length: value.length,
        };
        newList[num].x = x;
        newList[num].y = y;
    };

    // go through all the numbers
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (!numbers[y][x] || numbers[y][x] === CELL_DARK_CHAR) continue; // skip all blank tiles

            // valid down
            if (y === 0 || (y > 0 && grid[y - 1][x] === CELL_DARK_CHAR)) {
                const num = numbers[y][x];
                const value = findActiveWord([y, x], true, grid, numbers);
                addToList(num, value, DIR_DOWN, y, x);
            }

            // valid across
            if (x === 0 || (x > 0 && grid[y][x - 1] === CELL_DARK_CHAR)) {
                const num = numbers[y][x];
                const value = findActiveWord([y, x], false, grid, numbers);
                addToList(num, value, DIR_ACROSS, y, x);
            }
        }
    }

    return newList;
};

export const findActiveNumber = (activeCell, orientationX, numbers) => {
    if (!activeCell || !numbers) return;
    let activeY = activeCell[0];
    let activeX = activeCell[1];
    if (numbers[activeY][activeX] === CELL_DARK_CHAR) return null;

    // which way are we looking?
    if (orientationX) {
        // row traverse
        while (activeX > 0 && numbers[activeY][activeX - 1] !== CELL_DARK_CHAR) {
            activeX--;
        }
    } else {
        // column traverse
        while (activeY > 0 && numbers[activeY - 1][activeX] !== CELL_DARK_CHAR) {
            activeY--;
        }
    }

    return numbers[activeY][activeX];
};

// prints active word at cell and orientation position
const findActiveWord = (activeCell, orientationY, grid, numbers) => {
    if (!activeCell || !grid || !numbers) return;
    let activeY = activeCell[0];
    let activeX = activeCell[1];
    if (grid[activeY][activeX] === CELL_DARK_CHAR) return null;

    const getChar = (x, y) => (grid[y][x] ? grid[y][x] : '-');

    // now traverse down to find the word
    let word = getChar(activeX, activeY);
    if (orientationY) {
        // column traverse
        while (activeY < grid.length - 1 && grid[activeY + 1][activeX] !== CELL_DARK_CHAR) {
            activeY++;
            word += getChar(activeX, activeY);
        }
    } else {
        // row traverse
        while (activeX < grid[0].length - 1 && grid[activeY][activeX + 1] !== CELL_DARK_CHAR) {
            activeX++;
            word += getChar(activeX, activeY);
        }
    }

    return word;
};
