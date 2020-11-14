import CopyLabel from 'components/CopyLabel';
import Crossword from 'components/Crossword';
import { findPuzzleFB } from 'data/firebaseAPI';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from 'styles/PuzzlePage.module.scss';

const PuzzlePage = () => {
    const router = useRouter();
    const { puzzleId } = router.query;

    const [loading, setLoading] = useState(true);
    const [puzzle, setPuzzle] = useState();

    // data fetch
    useEffect(() => {
        findPuzzleFB(puzzleId).then((res) => {
            if (res) {
                const p = { ...res };
                p.puzzleId = puzzleId;
                setPuzzle(p);
            }
            setLoading(false);
        });
    }, [puzzleId]);

    if (loading) return <div>Loading...</div>;

    if (!loading && !puzzle)
        return (
            <div className="page">
                <div className="d-flex-column d-flex-center">
                    <div style={{ marginBottom: '0.5rem' }}>Puzzle Not Found</div>
                    <Link href="/" className="w-100">
                        <a>
                            <button className="w-100">Return Home</button>
                        </a>
                    </Link>
                </div>
            </div>
        );

    console.log(styles);
    return (
        <div className={styles.crosswordPage}>
            <div className={styles.crosswordHeader}>
                <div className="crossword-title">
                    {puzzle.title}
                    {/* <AutosizeInput
                        name="title"
                        value={title}
                        onChange={onTitleChange}
                        inputStyle={{ fontSize: '200%', border: 'none' }}
                    /> */}
                    <span>by</span>
                    {puzzle.author}
                    {/* <AutosizeInput
                        name="author"
                        value={author}
                        onChange={onAuthorChange}
                        inputStyle={{ border: 'none' }}
                    /> */}
                </div>

                <div className="d-flex-center">
                    Puzzle ID: <CopyLabel style={{ marginLeft: '0.5rem' }}>{puzzle.puzzleId}</CopyLabel>
                </div>
            </div>

            <div className={styles.crosswordWrapper}>
                <Crossword />
            </div>
        </div>
    );
};

export default PuzzlePage;
