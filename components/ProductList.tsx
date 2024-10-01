import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCategoryModal } from "@/components/AddCategoryModal"; // Import the modal
import Image from "next/image";

interface Product {
  name: string;
  price: string;
  brand: string;
  image: string;
  priceInr: number;
}

interface Category {
  id: string;
  name: string;
}

export const ProductList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchCategories() {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/categories`);
      const data = await response.json();
      setCategories(data);

      // Fetch products for each category
      data.forEach(async (category: Category) => {
        const productResponse = await fetch(
          `${process.env.BACKEND_URL}/categories/${category.id}/products`
        );
        const productData = await productResponse.json();
        setProducts((prevProducts) => ({
          ...prevProducts,
          [category.id]: productData,
        }));
      });
    } catch (error) {
      console.error("Error fetching categories or products:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSave={(categoryName) => {
          setIsModalOpen(false);
          console.log("Saved category:", categoryName);
        }}
      />
      <div className="grid grid-cols-4 gap-8">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
              <div className="space-y-8">
                {products[category.id]?.map((product, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Image
                      src={`${process.env.BACKEND_URL}/${product.image}`}
                      alt=""
                      width={64}
                      height={64}
                      className="rounded-md w-auto h-auto"
                    />
                    <div>
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <p className="text-md text-gray-500">
                        Price: {product.priceInr}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {product.brand}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
