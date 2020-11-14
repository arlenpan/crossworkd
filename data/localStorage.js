export const saveCrosswordToStorage = (crossword) => {
    localStorage.setItem('crossword', JSON.stringify(crossword));
};

export const getCrosswordFromStorage = () => {
    console.log('fetching cw');
    const value = localStorage.getItem('crossword');
    return value ? JSON.parse(value) : null;
};

export const saveCluesToStorage = (clues) => {
    localStorage.setItem('clues', JSON.stringify(clues));
};

export const getCluesFromStorage = () => {
    console.log('fetching clues');
    const value = localStorage.getItem('clues');
    return value ? JSON.parse(value) : null;
};
