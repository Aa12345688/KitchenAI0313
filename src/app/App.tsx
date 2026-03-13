import { RouterProvider } from 'react-router';
import { router } from './routes';
import { IngredientProvider } from './services/IngredientContext';

export default function App() {
  return (
    <IngredientProvider>
      <div className="aurora-bg">
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
      </div>
      <div className="relative z-10">
        <RouterProvider router={router} />
      </div>
    </IngredientProvider>
  );
}
