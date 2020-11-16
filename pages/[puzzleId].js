import Crossword from 'components/Crossword';
import { findPuzzleFB } from 'data/firebaseAPI';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from 'styles/Page.module.scss';

const PuzzlePage = () => {
    const router = useRouter();
    const { puzzleId } = router.query;

    const [loading, setLoading] = useState(true);
    const [puzzleExists, setPuzzleExists] = useState();

    // data fetch
    useEffect(() => {
        if (puzzleId) {
            findPuzzleFB(puzzleId).then((res) => {
                if (res) setPuzzleExists(true);
                setLoading(false);
            });
        }
    }, [puzzleId]);

    if (loading)
        return (
            <div className="page">
                <div>Loading...</div>
            </div>
        );

    if (!loading && !puzzleExists)
        return (
            <div className="page">
                <div style={{ marginBottom: '0.5rem' }}>Puzzle Not Found</div>
                <Link href="/" className="w-100">
                    <a>
                        <button className="w-100">Return Home</button>
                    </a>
                </Link>
            </div>
        );

    return (
        <div className={styles.page}>
            <Crossword />
        </div>
    );
};

export default PuzzlePage;
