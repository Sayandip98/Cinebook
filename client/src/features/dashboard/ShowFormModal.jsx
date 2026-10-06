import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import { useGetMoviesQuery } from '@/features/movies/moviesApi';
import { applyFieldErrors, getErrorDetails } from '@/utils/getErrorMessage';
import { isoToIstInput, istInputToIso, nowIstInput } from '@/utils/dateInput';
import {
  useCreateShowMutation,
  useGetManageTheatersQuery,
  useGetScreensQuery,
  useUpdateShowMutation,
} from './dashboardApi';
import styles from './dashboard.module.css';

function ShowForm({ show, onClose }) {
  const isEdit = Boolean(show);
  const [createShow, { isLoading: isCreating }] = useCreateShowMutation();
  const [updateShow, { isLoading: isUpdating }] = useUpdateShowMutation();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: isEdit
      ? {
          language: show.language,
          startTime: isoToIstInput(show.startTime),
          basePrice: show.basePrice,
        }
      : { theater: '', screen: '', movie: '', language: '', startTime: '', basePrice: 200 },
  });

  const theaterId = watch('theater');
  const movieId = watch('movie');

  const theaters = useGetManageTheatersQuery({ limit: 50, isActive: true }, { skip: isEdit });
  const screens = useGetScreensQuery(theaterId, { skip: isEdit || !theaterId });
  const movies = useGetMoviesQuery({ limit: 50, sort: 'title_asc' }, { skip: isEdit });

  const availableMovies = (movies.data?.movies ?? []).filter((movie) => movie.status !== 'ENDED');
  const selectedMovie = availableMovies.find((movie) => movie.id === movieId);
  const languages = isEdit ? show.movie.languages : (selectedMovie?.languages ?? []);

  const onSubmit = async (values) => {
    setFormError('');
    try {
      if (isEdit) {
        const body = { language: values.language, basePrice: Number(values.basePrice) };
        if (values.startTime !== isoToIstInput(show.startTime)) {
          body.startTime = istInputToIso(values.startTime);
        }
        await updateShow({ id: show.id, ...body }).unwrap();
        toast.success('Show updated');
      } else {
        await createShow({
          movie: values.movie,
          screen: values.screen,
          startTime: istInputToIso(values.startTime),
          language: values.language,
          basePrice: Number(values.basePrice),
        }).unwrap();
        toast.success('Show created');
      }
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

      {isEdit ? (
        <p className={styles.sub}>
          {show.movie.title} · {show.theater.name}, {show.screen.name}
        </p>
      ) : (
        <>
          <div className={styles.grid2}>
            <Select
              label="Theater"
              error={errors.theater?.message}
              {...register('theater', {
                required: 'Choose a theater',
                onChange: () => resetField('screen'),
              })}
            >
              <option value="">Select theater</option>
              {theaters.data?.theaters.map((theater) => (
                <option key={theater.id} value={theater.id}>
                  {theater.name} ({theater.city})
                </option>
              ))}
            </Select>
            <Select
              label="Screen"
              error={errors.screen?.message}
              disabled={!theaterId}
              {...register('screen', { required: 'Choose a screen' })}
            >
              <option value="">Select screen</option>
              {screens.data?.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.name} ({screen.type}, {screen.totalSeats} seats)
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Movie"
            error={errors.movie?.message}
            {...register('movie', {
              required: 'Choose a movie',
              onChange: () => resetField('language'),
            })}
          >
            <option value="">Select movie</option>
            {availableMovies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </Select>
        </>
      )}

      <div className={styles.grid2}>
        <Select
          label="Language"
          error={errors.language?.message}
          disabled={languages.length === 0}
          {...register('language', { required: 'Choose a language' })}
        >
          <option value="">Select language</option>
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </Select>
        <Input
          label="Base price (Rs)"
          type="number"
          min="0"
          max="5000"
          step="1"
          error={errors.basePrice?.message}
          {...register('basePrice', {
            required: 'Enter a price',
            min: { value: 0, message: 'Cannot be negative' },
            max: { value: 5000, message: 'At most 5000' },
          })}
        />
      </div>

      <Input
        label="Start time (IST)"
        type="datetime-local"
        min={isEdit ? undefined : nowIstInput()}
        error={errors.startTime?.message}
        hint="The end time is calculated from the movie's duration."
        {...register('startTime', { required: 'Choose a start time' })}
      />

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isCreating || isUpdating}>
          {isEdit ? 'Save changes' : 'Create show'}
        </Button>
      </div>
    </form>
  );
}

export default function ShowFormModal({ open, show, onClose }) {
  return (
    <Modal open={open} title={show ? 'Edit show' : 'Add show'} onClose={onClose}>
      <ShowForm show={show} onClose={onClose} />
    </Modal>
  );
}
