import { CELL_DARK_CHAR } from 'data/consts';
import { saveAs } from 'file-saver';

/**
 * Set of helper functions for creating PUZ files
 * many thanks to https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
 */

const crosswordToStr = (crossword) => {
    let str = '';
    for (let i = 0; i < crossword.length; i++) {
        for (let j = 0; j < crossword[i].length; j++) {
            if (crossword[i][j] === null) {
                str += ' ';
            } else {
                str += crossword[i][j].toUpperCase();
            }
        }
    }
    return str;
};

const crosswordToStateStr = (crossword) => {
    let str = '';
    for (let i = 0; i < crossword.length; i++) {
        for (let j = 0; j < crossword[i].length; j++) {
            str += crossword[i][j] === '.' ? '.' : '-';
        }
    }
    return str;
};

const cluesToClueStr = (cluesDict) => {
    const numbers = Object.keys(cluesDict);
    return numbers
        .map((n) => {
            const clues = cluesDict[n];
            const acrossStr = clues.across ? clues.across + '\0' : '';
            const downStr = clues.down ? clues.down + '\0' : '';
            return acrossStr + downStr;
        })
        .join('');
};

const strToUint8 = (s) => new Uint8Array(s.split('').map((c, i) => s.charCodeAt(i)));

const DEFAULT_EMPTY_CLUE = ' ';

const generateClueList = (clueGrid /** 2d array */, clueNumbersGrid /** 2d array */, crosswordState) => {
    const clueDict = {};

    for (let i = 0; i < clueGrid.length; i++) {
        for (let j = 0; j < clueGrid[i].length; j++) {
            // every position needs to have valid clues
            if (clueNumbersGrid[i][j] && clueNumbersGrid[i][j] !== CELL_DARK_CHAR) {
                const num = clueNumbersGrid[i][j];
                const clue = clueGrid[i][j];
                const state = crosswordState[num];
                
                clueDict[num] = {};
                // state must be valid in order to insert clue
                if (state.across) {
                    clueDict[num].across = (clue && clue.across) || DEFAULT_EMPTY_CLUE;
                }
                if (state.down) {
                    clueDict[num].down = (clue && clue.down) || DEFAULT_EMPTY_CLUE;
                }
            }
        }
    }

    return clueDict;
};

export const generatePuz = (crossword, numbers, clueGrid, crosswordState, title = 'Puzzle', author = 'No Author') => {
    const checksum = strToUint8('??');
    const fileMagic = strToUint8('ACROSS&DOWN\0');
    const cibChecksum = strToUint8('??');
    const maskedLowChecksum = strToUint8('LLLL');
    const maskedHighChecksum = strToUint8('HHHH');
    const versionStr = strToUint8('1.0\0');
    const reserved1C = strToUint8('\0\0');
    const scrambledChecksum = strToUint8('\0\0');
    const reserved20 = strToUint8('\0'.repeat(12));
    const width = new Uint8Array([15]);
    const height = new Uint8Array([15]);
    const numClues = new Uint16Array([100]);
    const unknownBitmask = strToUint8('\0\0');
    const scrambledTag = strToUint8('\0\0');

    const cwLayoutStr = crosswordToStr(crossword);
    const layout = strToUint8(cwLayoutStr);

    const cwStateStr = crosswordToStateStr(crossword);
    const layoutState = strToUint8(cwStateStr);

    const titleStr = strToUint8(title + '\0');
    const authorStr = strToUint8(author + '\0');
    const copyright = strToUint8('(c) 2020 Arlen Pan' + '\0');

    const clues = generateClueList(clueGrid, numbers, crosswordState);
    const cluesStringified = cluesToClueStr(clues);
    const cluesStr = strToUint8(cluesStringified);

    const blob = new Blob([
        checksum,
        fileMagic,
        cibChecksum,
        maskedLowChecksum,
        maskedHighChecksum,
        versionStr,
        reserved1C,
        scrambledChecksum,
        reserved20,
        width,
        height,
        numClues,
        unknownBitmask,
        scrambledTag,
        layout,
        layoutState,
        titleStr,
        authorStr,
        copyright,
        cluesStr,
    ]);
    saveAs(blob, `${title}.puz`);
};
