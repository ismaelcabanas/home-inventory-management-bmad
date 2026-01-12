import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from '@/features/inventory/context/InventoryContext';
import { InventoryList } from '@/features/inventory/components/InventoryList';

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          <Route path="/" element={<InventoryList />} />
          <Route path="/shopping" element={<div>Shopping List (Coming Soon)</div>} />
          <Route path="/scan" element={<div>Receipt Scanner (Coming Soon)</div>} />
        </Routes>
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
