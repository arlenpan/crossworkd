import { DIR_ACROSS, DIR_DOWN } from 'data/consts';
import CrosswordClue from './CrosswordClue';
import styles from './CrosswordCluesList.module.scss';

const CrosswordCluesList = ({ activeNumber, orientation, crosswordState, clues, setClue }) => {
    const activeOrientation = orientation ? DIR_ACROSS : DIR_DOWN;

    const renderList = (direction) => {
        return (
            <div className={styles.crosswordCluesList}>
                {crosswordState &&
                    Object.keys(crosswordState).map((num) => {
                        const { x, y } = crosswordState[num];
                        const clue = clues?.[y]?.[x]?.[direction] || '';
                        const isActive = activeNumber === parseInt(num) && direction === activeOrientation;

                        if (crosswordState[num][direction]) {
                            const word = crosswordState[num][direction].value;
                            return (
                                <CrosswordClue
                                    key={num}
                                    number={num}
                                    word={word}
                                    clue={clue}
                                    isActive={isActive}
                                    onChange={(val) => setClue(val, x, y, direction)}
                                />
                            );
                        }
                        return null;
                    })}
            </div>
        );
    };

    return (
        <div className={styles.crosswordClues}>
            <div>
                <h3>ACROSS</h3>
                {renderList(DIR_ACROSS)}
            </div>
            <div>
                <h3>DOWN</h3>
                {renderList(DIR_DOWN)}
            </div>
        </div>
    );
};

export default CrosswordCluesList;
