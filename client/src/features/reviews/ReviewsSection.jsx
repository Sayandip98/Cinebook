import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import SectionHeader from '@/components/common/SectionHeader';
import Skeleton from '@/components/common/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import ReviewForm from './ReviewForm';
import { StarDisplay } from './Stars';
import { useDeleteReviewMutation, useGetMyReviewQuery, useGetReviewsQuery } from './reviewsApi';
import styles from './reviews.module.css';

const PAGE_SIZE = 5;

export default function ReviewsSection({ movie }) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const reviews = useGetReviewsQuery({ movieId: movie.id, page, limit: PAGE_SIZE, sort: 'newest' });
  const mine = useGetMyReviewQuery(movie.id, { skip: !isAuthenticated });
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const myReview = mine.data?.review;

  const handleDelete = async () => {
    try {
      await deleteReview(toDelete.id).unwrap();
      toast.success('Review deleted');
      setPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  let yourReview;
  if (!isAuthenticated) {
    yourReview = (
      <p className={styles.hint}>
        <Link to={ROUTES.LOGIN}>Sign in</Link> to review this movie.
      </p>
    );
  } else if (myReview && editing) {
    yourReview = (
      <ReviewForm movieId={movie.id} review={myReview} onDone={() => setEditing(false)} />
    );
  } else if (myReview) {
    yourReview = (
      <div className={styles.mine}>
        <div>
          <StarDisplay value={myReview.rating} />
          {myReview.comment && <p className={styles.comment}>{myReview.comment}</p>}
        </div>
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setToDelete(myReview)}>
            Delete
          </Button>
        </div>
      </div>
    );
  } else if (mine.data?.canReview) {
    yourReview = <ReviewForm movieId={movie.id} />;
  } else if (!mine.isLoading) {
    yourReview = (
      <p className={styles.hint}>You can review this movie after attending a show you booked.</p>
    );
  }

  let list;
  if (reviews.isLoading) {
    list = <Skeleton style={{ height: '6rem' }} />;
  } else if (reviews.isError) {
    list = <EmptyState icon={MessageSquare} title="Could not load reviews" />;
  } else if (reviews.data.reviews.length === 0) {
    list = (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        message="Be the first to share what you thought."
      />
    );
  } else {
    list = (
      <>
        <ul className={cx(styles.list, reviews.isFetching && styles.busy)}>
          {reviews.data.reviews.map((review) => {
            const isOwner = review.user?.id === user?.id;
            return (
              <li key={review.id} className={styles.card}>
                <div className={styles.top}>
                  {review.user?.avatar?.url ? (
                    <img src={review.user.avatar.url} alt="" className={styles.avatar} />
                  ) : (
                    <span className={cx(styles.avatar, styles.avatarFallback)} aria-hidden="true">
                      {review.user?.name?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                  )}
                  <div className={styles.who}>
                    <strong>
                      {review.user?.name ?? 'Former user'}
                      {isOwner && <span className={styles.you}> (you)</span>}
                    </strong>
                    <span className={styles.date}>{formatDate(review.createdAt)}</span>
                  </div>
                  <StarDisplay value={review.rating} size={14} />
                  {isAdmin && !isOwner && (
                    <Button size="sm" variant="ghost" onClick={() => setToDelete(review)}>
                      Remove
                    </Button>
                  )}
                </div>
                {review.comment && <p className={styles.comment}>{review.comment}</p>}
              </li>
            );
          })}
        </ul>
        <Pagination meta={reviews.data.meta} onPageChange={setPage} />
      </>
    );
  }

  return (
    <section className={cx('container', styles.section)}>
      <SectionHeader eyebrow="What people say" title="Reviews" />

      {movie.ratingCount > 0 && (
        <div className={styles.summary}>
          <span className={styles.average}>{movie.ratingAverage.toFixed(1)}</span>
          <StarDisplay value={movie.ratingAverage} size={18} />
          <span>
            {movie.ratingCount} {movie.ratingCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      )}

      <div className={styles.yours}>{yourReview}</div>
      {list}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this review?"
        message="The review is removed and the movie's rating is recalculated."
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
