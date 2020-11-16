import React, { useRef } from 'react';
// import useWindowSize from '../hooks/useWindowSize';
import CrosswordClue from './CrosswordClue';
import styles from './CrosswordCluesList.module.scss';

const CrosswordCluesList = ({ activeCell, numbers, orientation, clues, setClues }) => {
    // const windowSize = useWindowSize();

    const renderList = (orientationDown) => {
        const direction = orientationDown ? 'down' : 'across';
        return <div className="crossword-clues-list">
            
        </div>;
    };

    //         {Object.keys(crosswordState).map((num) => {
    //             const value = crosswordState[num];
    //             const { x, y } = value;
    //             const clue = clues?.[y]?.[x]?.[direction] || '';
    //             const isActive = activeNumber === parseInt(num) && orientation !== orientationDown;

    //             if (value[direction]) {
    //                 const word = value[direction].value;
    //                 return (
    //                     <CrosswordClue
    //                         key={num}
    //                         number={num}
    //                         word={word}
    //                         clue={clue}
    //                         isActive={isActive}
    //                         onChange={(val) => setClue(val, x, y, direction)}
    //                         // windowSize={windowSize}
    //                     />
    //                 );
    //             }
    //             return null;
    //         })}

    return (
        <div className={styles.crosswordClues}>
            <div>
                <h3>ACROSS</h3>
                {renderList(false)}
            </div>
            <div>
                <h3>DOWN</h3>
                {renderList(true)}
            </div>
        </div>
    );
};

export default CrosswordCluesList;
