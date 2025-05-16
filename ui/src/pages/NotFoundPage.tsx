import { ProdErrorPage } from '../components/ProdErrorPage';

export default function NotFoundPage() {
  return <ProdErrorPage text="Page not found." canRefresh={false} />;
}
