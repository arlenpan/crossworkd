import { useState } from 'react';
import { useRouter } from 'next/router';
import { createNewPuzzleFB } from 'data/firebaseAPI';
import styles from 'styles/Page.module.scss';

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
        <div className={styles.page} style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h1 style={{ marginBottom: '2rem' }}>Crossworkd</h1>
                <button style={{ marginBottom: '2rem' }} onClick={onNewPuzzleClick}>
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
                <button onClick={onContinueClick} disabled={!puzzleId}>
                    Continue Editing
                </button>
            </div>
        </div>
    );
};

export default HomePage;
