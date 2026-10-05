import { useDispatch, useSelector } from 'react-redux';
import { MapPin } from 'lucide-react';
import { useGetCitiesQuery } from '@/features/theaters/theatersApi';
import { selectCity, setCity } from '@/features/ui/uiSlice';
import styles from './CitySelect.module.css';

export default function CitySelect() {
  const dispatch = useDispatch();
  const city = useSelector(selectCity);
  const { data: cities = [] } = useGetCitiesQuery();

  return (
    <label className={styles.wrapper}>
      <MapPin size={16} />
      <span className="sr-only">City</span>
      <select
        className={styles.select}
        value={city}
        onChange={(event) => dispatch(setCity(event.target.value))}
      >
        <option value="">All cities</option>
        {cities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
