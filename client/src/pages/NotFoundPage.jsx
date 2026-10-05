import { SearchX } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      message="The page you are looking for does not exist or has moved."
      action={<Button to={ROUTES.HOME}>Back to home</Button>}
    />
  );
}
