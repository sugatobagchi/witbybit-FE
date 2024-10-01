// components/DashboardHeader.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { AddCategoryModal } from "./AddCategoryModal";
import { ProductAdditionForm } from "@/components/product-addition-form"; // Import your product addition form
import Modal from "./Modal"; // Import the Modal component

interface DashboardHeaderProps {
  onAddCategory: (categoryName: string) => void;
  onAddProduct: (product: Product) => void; // Product interface should be defined for types
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onAddCategory,
  onAddProduct,
}) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
          Add Category
        </Button>
        <Button onClick={() => setIsProductModalOpen(true)}>Add Product</Button>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={onAddCategory}
      />

      {/* Add Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      >
        <ProductAdditionForm 
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={onAddProduct}
        />
      </Modal>
    </div>
  );
};
