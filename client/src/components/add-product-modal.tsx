import { useEffect } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

interface AddProductModalProps {
  onAddProduct: (product: any) => void;
  trigger?: React.ReactNode;
}

export function AddProductModal({ onAddProduct, trigger }: AddProductModalProps) {
  const [, setLocation] = useLocation();

  // Navigate to new add product page instead of opening modal
  const handleAddProductClick = () => {
    setLocation("/tambah-produk");
  };

  // Keyboard shortcut: Ctrl+Shift+P untuk tambah produk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setLocation("/tambah-produk");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  return (
    <>
      {trigger ? (
        <div onClick={handleAddProductClick}>
          {trigger}
        </div>
      ) : (
        <Button 
          onClick={handleAddProductClick}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
          style={{ bottom: '274px' }} // Naikkan 200px dari posisi sekarang (74px + 200px = 274px)
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}
    </>
  );
}
