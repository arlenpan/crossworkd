import React, { useEffect, useRef } from 'react';
// import { MEDIA_BREAKPOINT_MD } from '../styles/mediaQuery';

const CrosswordClue = ({ number, word, clue, isActive, onChange, windowSize }) => {
    const ref = useRef();

    // useEffect(() => {
    //     if (isActive && windowSize?.width > MEDIA_BREAKPOINT_MD) {
    //         ref.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [isActive]);

    const onInputChange = (e) => {
        const value = e.target.value;
        onChange(value);
    };

    return (
        <div className={isActive ? 'active' : ''} ref={ref}>
            <h4>
                {number}: {word} ({word.length})
            </h4>
            <textarea placeholder="Type Clue" onChange={onInputChange} value={clue} maxLength={100} />
        </div>
    );
};

export default CrosswordClue;
