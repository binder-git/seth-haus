import { RouterProvider } from "react-router-dom";
import { OuterErrorBoundary } from './components/OuterErrorBoundary';
import { router } from './router';

export const AppWrapper = () => {
  return (
    <OuterErrorBoundary>
      <RouterProvider router={router} />
    </OuterErrorBoundary>
  );
};
