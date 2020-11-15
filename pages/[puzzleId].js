import CopyLabel from 'components/CopyLabel';
import Crossword from 'components/Crossword';
import { findPuzzleFB, initializeListenerFB } from 'data/firebaseAPI';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from 'styles/PuzzlePage.module.scss';

const PuzzlePage = () => {
    const router = useRouter();
    const { puzzleId } = router.query;

    const [loading, setLoading] = useState(true);
    const [puzzle, setPuzzle] = useState();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    // data fetch
    useEffect(() => {
        if (puzzleId) {
            findPuzzleFB(puzzleId).then((res) => {
                if (res) {
                    // store entire puzzle state
                    const p = { ...res };
                    p.puzzleId = puzzleId;
                    setPuzzle(p);

                    // start listeners for db changes
                    initializeListenerFB(puzzleId, 'title', setTitle);
                    initializeListenerFB(puzzleId, 'author', setAuthor);
                }
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

    if (!loading && !puzzle)
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
        <div className="page">
            <div className={styles.crosswordHeader}>
                <div className="crossword-title">
                    {title}
                    {/* <AutosizeInput
                        name="title"
                        value={title}
                        onChange={onTitleChange}
                        inputStyle={{ fontSize: '200%', border: 'none' }}
                    /> */}
                    <span>by</span>
                    {author}
                    {/* <AutosizeInput
                        name="author"
                        value={author}
                        onChange={onAuthorChange}
                        inputStyle={{ border: 'none' }}
                    /> */}
                </div>

                <div className="d-flex-center">
                    Puzzle ID: <CopyLabel style={{ marginLeft: '0.5rem' }}>{puzzleId}</CopyLabel>
                </div>
            </div>

            <div className={styles.crosswordWrapper}>
                <Crossword puzzle={puzzle} />
            </div>
        </div>
    );
};

export default PuzzlePage;
