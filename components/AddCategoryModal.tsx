"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [categoryName, setCategoryName] = useState("");

  const handleSave = async () => {
    if (categoryName.trim()) {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: categoryName }),
        });
        if (response.status === 200) {
          onSave(categoryName);
          setCategoryName("");
          onClose();
          alert("Category created successfully!");
          window.location.reload();
        }
      } catch (error) {
        console.error("Error saving category:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add category</h2>
        <div className="mb-4">
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category name"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};
