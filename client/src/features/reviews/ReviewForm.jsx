import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import TextArea from '@/components/common/TextArea';
import { getErrorDetails } from '@/utils/getErrorMessage';
import { StarInput } from './Stars';
import { useCreateReviewMutation, useUpdateReviewMutation } from './reviewsApi';
import styles from './reviews.module.css';

export default function ReviewForm({ movieId, review, onDone }) {
  const isEdit = Boolean(review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? '');
  const [error, setError] = useState('');
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating === 0) {
      setError('Choose a star rating.');
      return;
    }

    setError('');
    const text = comment.trim();
    try {
      if (isEdit) {
        await updateReview({ id: review.id, rating, comment: text }).unwrap();
      } else {
        await createReview({ movieId, rating, ...(text ? { comment: text } : {}) }).unwrap();
      }
      toast.success(isEdit ? 'Review updated' : 'Thanks for your review!');
      onDone?.();
    } catch (requestError) {
      setError(getErrorDetails(requestError));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      )}
      <StarInput value={rating} onChange={setRating} disabled={isCreating || isUpdating} />
      <TextArea
        label="Your review (optional)"
        rows={3}
        maxLength={1000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="What did you think?"
      />
      <div className={styles.actions}>
        {isEdit && (
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isCreating || isUpdating}>
          {isEdit ? 'Save review' : 'Post review'}
        </Button>
      </div>
    </form>
  );
}
