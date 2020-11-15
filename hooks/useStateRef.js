import { useState, useRef, useEffect } from 'react';

// used to access state in event listeners by providing the state by reference
const useStateRef = (initialValue) => {
    const [state, setState] = useState(initialValue);
    const ref = useRef(state);

    useEffect(() => {
        ref.current = state;
    }, [state]);

    return [state, setState, ref];
};

export default useStateRef;
