import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import TextArea from '@/components/common/TextArea';
import { applyFieldErrors, getErrorDetails, getErrorMessage } from '@/utils/getErrorMessage';
import { toList } from '@/utils/formHelpers';
import {
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useUploadPosterMutation,
} from './dashboardApi';
import styles from './dashboard.module.css';

const CERTIFICATES = ['U', 'UA', 'A'];
const STATUSES = [
  { value: 'UPCOMING', label: 'Coming soon' },
  { value: 'NOW_SHOWING', label: 'Now showing' },
  { value: 'ENDED', label: 'Ended' },
];
const POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const POSTER_MAX_BYTES = 5 * 1024 * 1024;

const buildDefaults = (movie) =>
  movie
    ? {
        title: movie.title,
        description: movie.description,
        genres: movie.genres.join(', '),
        languages: movie.languages.join(', '),
        durationMinutes: movie.durationMinutes,
        releaseDate: movie.releaseDate.slice(0, 10),
        certificate: movie.certificate,
        director: movie.director ?? '',
        trailerUrl: movie.trailerUrl ?? '',
        status: movie.status,
      }
    : {
        title: '',
        description: '',
        genres: '',
        languages: '',
        durationMinutes: '',
        releaseDate: '',
        certificate: 'UA',
        director: '',
        trailerUrl: '',
        status: 'UPCOMING',
      };

function MovieForm({ movie, onClose }) {
  const isEdit = Boolean(movie);
  const fileRef = useRef(null);
  const [createMovie, { isLoading: isCreating }] = useCreateMovieMutation();
  const [updateMovie, { isLoading: isUpdating }] = useUpdateMovieMutation();
  const [uploadPoster, { isLoading: isUploading }] = useUploadPosterMutation();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: buildDefaults(movie) });

  const onSubmit = async (values) => {
    setFormError('');

    const poster = fileRef.current?.files?.[0];
    if (poster && (!POSTER_TYPES.includes(poster.type) || poster.size > POSTER_MAX_BYTES)) {
      setFormError('The poster must be a JPG, PNG or WebP image up to 5 MB.');
      return;
    }

    const body = {
      title: values.title.trim(),
      description: values.description.trim(),
      genres: toList(values.genres),
      languages: toList(values.languages),
      durationMinutes: Number(values.durationMinutes),
      releaseDate: values.releaseDate,
      certificate: values.certificate,
      status: values.status,
    };
    if (values.director.trim()) body.director = values.director.trim();
    if (values.trailerUrl.trim()) body.trailerUrl = values.trailerUrl.trim();

    try {
      const saved = isEdit
        ? await updateMovie({ id: movie.id, ...body }).unwrap()
        : await createMovie(body).unwrap();

      if (poster) {
        const formData = new FormData();
        formData.append('poster', poster);
        try {
          await uploadPoster({ id: saved.id, formData }).unwrap();
        } catch (uploadError) {
          toast.error(`Movie saved, but the poster failed: ${getErrorMessage(uploadError)}`);
        }
      }

      toast.success(isEdit ? 'Movie updated' : 'Movie created');
      onClose();
    } catch (error) {
      applyFieldErrors(error, setError);
      setFormError(getErrorDetails(error));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <p className={styles.alert} role="alert">
          {formError}
        </p>
      )}

      <Input
        label="Title"
        error={errors.title?.message}
        {...register('title', {
          required: 'Title is required',
          maxLength: { value: 200, message: 'Too long' },
        })}
      />
      <TextArea
        label="Description"
        error={errors.description?.message}
        {...register('description', {
          required: 'Description is required',
          maxLength: { value: 2000, message: 'At most 2000 characters' },
        })}
      />
      <div className={styles.grid2}>
        <Input
          label="Genres"
          hint="Comma separated"
          error={errors.genres?.message}
          {...register('genres', {
            validate: (v) => toList(v).length > 0 || 'Add at least one genre',
          })}
        />
        <Input
          label="Languages"
          hint="Comma separated"
          error={errors.languages?.message}
          {...register('languages', {
            validate: (v) => toList(v).length > 0 || 'Add at least one language',
          })}
        />
      </div>
      <div className={styles.grid2}>
        <Input
          label="Duration (minutes)"
          type="number"
          error={errors.durationMinutes?.message}
          {...register('durationMinutes', {
            required: 'Duration is required',
            min: { value: 1, message: 'At least 1' },
            max: { value: 600, message: 'At most 600' },
          })}
        />
        <Input
          label="Release date"
          type="date"
          error={errors.releaseDate?.message}
          {...register('releaseDate', { required: 'Release date is required' })}
        />
      </div>
      <div className={styles.grid2}>
        <Select label="Certificate" {...register('certificate')}>
          {CERTIFICATES.map((certificate) => (
            <option key={certificate} value={certificate}>
              {certificate}
            </option>
          ))}
        </Select>
        <Select label="Status" {...register('status')}>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={styles.grid2}>
        <Input label="Director (optional)" {...register('director')} />
        <Input
          label="Trailer link (optional)"
          type="url"
          placeholder="https://"
          error={errors.trailerUrl?.message}
          {...register('trailerUrl', {
            validate: (v) => !v || v.startsWith('https://') || 'Use an https link',
          })}
        />
      </div>

      <div className={styles.fileRow}>
        <label htmlFor="poster-file" className={styles.fieldsetTitle}>
          Poster (optional)
        </label>
        <input id="poster-file" ref={fileRef} type="file" accept={POSTER_TYPES.join(',')} />
        <span className={styles.muted}>JPG, PNG or WebP, up to 5 MB.</span>
      </div>

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isCreating || isUpdating || isUploading}>
          {isEdit ? 'Save changes' : 'Create movie'}
        </Button>
      </div>
    </form>
  );
}

export default function MovieFormModal({ open, movie, onClose }) {
  return (
    <Modal open={open} title={movie ? 'Edit movie' : 'Add movie'} onClose={onClose}>
      <MovieForm movie={movie} onClose={onClose} />
    </Modal>
  );
}
