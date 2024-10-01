// pages/dashboard.tsx
"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProductList } from "@/components/ProductList";
import { DashboardHeader } from "@/components/DashboardHeader";

interface Product {
  name: string;
  price: string;
  brand: string;
}

export default function Dashboard() {
  const [categories, setCategories] = useState<string[]>(["T-shirt"]);
  const [products, setProducts] = useState<Product[]>([
    { name: "Nike Air Jordan", price: "₹12,000", brand: "Nike" },
    { name: "Nike Dunk Low", price: "₹8,000", brand: "Nike" },
  ]);

  const handleAddCategory = (categoryName: string) => {
    setCategories((prevCategories) => [...prevCategories, categoryName]);
  };

  const handleAddProduct = (product: Product) => {
    setProducts((prevProducts) => [...prevProducts, product]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <DashboardHeader
          onAddCategory={handleAddCategory}
          onAddProduct={handleAddProduct}
        />
        <ProductList categories={categories} products={products} />
      </div>
    </div>
  );
}
