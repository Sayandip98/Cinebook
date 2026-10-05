import { Hammer } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';

export default function PlaceholderPage({ title, phase }) {
  return (
    <EmptyState
      icon={Hammer}
      title={title}
      message={`This screen is built in ${phase}.`}
      action={<Button to={ROUTES.HOME}>Back to home</Button>}
    />
  );
}
