const compareGrids = (arr1, arr2) => {
    if (!arr1 || !arr2) return;
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return;
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].length !== arr2[i].length) return false;

        for (let j = 0; j < arr1[i].length; j++) {
            if (arr1[i][j] !== arr2[i][j]) {
                return false;
            }
        }
    }

    return true;
};

export default compareGrids;
