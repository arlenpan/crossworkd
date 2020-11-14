import { useState } from 'react';
import { useRouter } from 'next/router';
import { createNewPuzzleFB } from 'data/firebaseAPI';

const HomePage = () => {
    const [puzzleId, setPuzzleId] = useState('');
    const router = useRouter();

    const onNewPuzzleClick = () => {
        const key = createNewPuzzleFB();
        router.push(`/${key}`);
    };

    const onPuzzleIdChange = (e) => {
        const value = e.target.value;
        setPuzzleId(value);
    };

    const onContinueClick = () => {
        router.push(`/${puzzleId}`);
    };

    return (
        <div className="page">
            <div className="d-flex-column d-flex-center">
                <h1 style={{ marginBottom: '2rem' }}>Crossworkd</h1>
                <button style={{ marginBottom: '2rem' }} className="w-100" onClick={onNewPuzzleClick}>
                    Start New Puzzle
                </button>

                <div style={{ marginBottom: '2rem' }}>- or -</div>

                <input
                    type="text"
                    placeholder="Puzzle ID"
                    style={{ marginBottom: '0.5rem' }}
                    value={puzzleId}
                    onChange={onPuzzleIdChange}
                />
                <button className="w-100" onClick={onContinueClick} disabled={!puzzleId}>
                    Continue Editing
                </button>
            </div>
        </div>
    );
};

export default HomePage;
