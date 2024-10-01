import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { TagsInput } from "react-tag-input-component";
import axios from "axios";

const schema = z.object({
  productName: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  image: z
    .any()
    .refine(
      (file) =>
        typeof window !== "undefined" && file instanceof File && file.size > 0,
      "Image is required"
    ),
  variants: z
    .array(
      z.object({
        option: z.string().min(1, "Option is required"),
        values: z.array(z.string()).min(1, "At least one value is required"),
      })
    )
    .min(1, "At least one variant is required"),
  combinations: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        inStock: z.boolean(),
        quantity: z.number().min(0, "Quantity must be 0 or greater"),
      })
    )
    .min(1, "At least one combination is required"),
  price: z.number().min(0, "Price must be greater than 0").default(0),
  discount: z.number().min(0, "Discount must be 0 or greater").default(0),
  discountType: z.enum(["percentage", "flat"]),
});
type FormData = z.infer<typeof schema>;

interface ProductAdditionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

export function ProductAdditionForm({
  isOpen,
  onClose,
  onSave,
}: ProductAdditionFormProps) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  interface Category {
    id: string;
    name: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors: formErrors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      variants: [{ option: "", values: [] }],
      combinations: [{ sku: "", inStock: false, quantity: 0 }],
      discountType: "percentage",
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: combinationFields,
    append: appendCombination,
    remove: removeCombination,
  } = useFieldArray({
    control,
    name: "combinations",
  });

  const variants = watch("variants");
  const discountType = watch("discountType", "percentage");

  useEffect(() => {
    if (
      variants.length > 0 &&
      variants.every((v) => v.option && v.values.length > 0)
    ) {
      const newCombinations = generateCombinations(variants);
      setValue("combinations", newCombinations);
    }
  }, [variants, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKEND_URL}/categories`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("category", data.category);
    formData.append("brand", data.brand);
    formData.append("image", data.image);
    formData.append("price", data.price.toString());
    formData.append("discount", data.discount.toString());
    formData.append("discountType", data.discountType);

    data.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][option]`, variant.option);
      variant.values.forEach((value, valueIndex) => {
        formData.append(`variants[${index}][values][${valueIndex}]`, value);
      });
    });

    data.combinations.forEach((combination, index) => {
      formData.append(`combinations[${index}][sku]`, combination.sku);
      formData.append(
        `combinations[${index}][inStock]`,
        combination.inStock.toString()
      );
      formData.append(
        `combinations[${index}][quantity]`,
        combination.quantity.toString()
      );
    });

    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/categories/${data.category}/products`,
        formData
      );
      if (response.status === 200) {
        onSave(data);
        alert("Product saved successfully!"); 
        onClose(); 
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error", error.message);
      } else {
        console.log("Unknown error", error);
      }
      alert("Failed to add product. Check console for more details.");
    }
  };

  const generateCombinations = (
    variants: { option: string; values: string[] }[]
  ) => {
    const combinations = variants.reduce<string[][]>(
      (acc, { values }) => acc.flatMap((x) => values.map((y) => [...x, y])),
      [[]]
    );
    return combinations.map((combo) => ({
      sku: "",
      inStock: false,
      quantity: 0,
      combination: combo.join(" /"),
    }));
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setValue("price", isNaN(value) ? 0 : value);
  };

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setValue("discount", isNaN(value) ? 0 : value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setValue("image", file, { shouldValidate: true });
    }
  };

  const handleDiscountTypeChange = (type: "percentage" | "flat") => {
    setValue("discountType", type);
  };

  const canProceed = async (currentStep: number) => {
    const fieldsToValidate: (
      | "productName"
      | "category"
      | "brand"
      | "image"
      | "variants"
      | "combinations"
      | "price"
      | "discount"
      | "discountType"
      | `variants.${number}`
      | `variants.${number}.option`
      | `variants.${number}.values`
      | `variants.${number}.values.${number}`
      | `combinations.${number}`
      | `combinations.${number}.sku`
    )[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate.push("productName", "category", "brand", "image");
        break;
      case 2:
        fieldsToValidate.push("variants");
        break;
      case 3:
        fieldsToValidate.push("combinations");
        combinationFields.forEach((_, index) => {
          fieldsToValidate.push(`combinations.${index}.sku`);
        });
        break;
      case 4:
        fieldsToValidate.push("price", "discount", "discountType");
        break;
      default:
        break;
    }

    const result = await trigger(fieldsToValidate);

    if (currentStep === 3) {
      const skus = combinationFields.map((_, index) =>
        watch(`combinations.${index}.sku`)
      );
      const duplicateSkus = skus
        .map((sku, index) => ({ sku, index }))
        .filter(
          (item, index, self) =>
            self.findIndex((t) => t.sku === item.sku) !== index
        );

      if (duplicateSkus.length > 0) {
        setErrors(
          "Duplicate SKUs detected, please ensure all SKUs are unique."
        );

        return false;
      }
    }

    return result;
  };

  const handleAddVariant = () => {
    if (
      variants.length === 0 ||
      (variants.length > 0 &&
        variants[variants.length - 1].option &&
        variants[variants.length - 1].values.length > 0)
    ) {
      setErrors(null);
      appendVariant({ option: "", values: [] });
    } else {
      setErrors(
        "Please fill out the previous variant fields before adding a new one."
      );
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input id="productName" {...register("productName")} />
              {formErrors.productName && (
                <p className="text-red-500 text-sm">
                  {formErrors.productName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                {...register("category", { required: "Category is required" })}
                onChange={(e) => setValue("category", e.target.value)}
                className="block w-full p-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {formErrors.category && (
                <p className="text-red-500 text-sm">
                  {formErrors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Input id="brand" {...register("brand")} />
              {formErrors.brand && (
                <p className="text-red-500 text-sm">
                  {formErrors.brand.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="image"
                className="inline-flex items-center space-x-2 cursor-pointer text-blue-600 border border-blue-600 rounded-md px-4 py-2 hover:bg-blue-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <path d="M21 15l-5-5L5 21"></path>
                </svg>
                <span>Upload Image</span>
              </label>
              <input
                type="file"
                id="image"
                className="hidden"
                {...register("image")}
                onChange={handleFileChange}
              />
              {formErrors.image && (
                <p className="text-red-500 text-sm">
                  {typeof formErrors.image.message === "string"
                    ? formErrors.image.message
                    : null}
                </p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {errors && (
              <div className="error-message text-red-500">{errors}</div>
            )}
            <div className="flex flex-row items-start justify-between ">
              <Label htmlFor="category">Category *</Label>
              <Label htmlFor="category" className="pr-32">
                Values *
              </Label>
            </div>
            {variantFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Input
                  placeholder="Option"
                  {...register(`variants.${index}.option`, {
                    required: "Option is required",
                  })}
                />
                {formErrors.variants?.[index]?.option && (
                  <span className="text-red-500">
                    {formErrors.variants[index].option.message}
                  </span>
                )}
                <Controller
                  name={`variants.${index}.values`}
                  control={control}
                  rules={{ required: "Values are required" }}
                  render={({ field }) => (
                    <>
                      <TagsInput
                        value={Array.isArray(field.value) ? field.value : []}
                        onChange={(tags) => field.onChange(tags)}
                        placeHolder="Enter values"
                      />
                      {formErrors.variants?.[index]?.values && (
                        <span className="text-red-500">
                          {formErrors.variants[index].values.message}
                        </span>
                      )}
                    </>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            {/* Labels row */}
            <div className="flex space-x-4">
              <Label htmlFor="sku" className="w-1/3">
                SKU *
              </Label>
              <Label htmlFor="inStock" className="w-1/6">
                In stock
              </Label>
              <Label htmlFor="quantity" className="w-1/6">
                Quantity
              </Label>
            </div>
            {errors && <p className="text-red-500">{errors}</p>}
            {combinationFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4">
                {/* SKU Input */}
                <div className="flex flex-col w-1/3">
                  <Input
                    id={`sku-${index}`}
                    placeholder="SKU"
                    className={
                      formErrors?.combinations?.[index]?.sku
                        ? "border-red-500"
                        : ""
                    }
                    {...register(`combinations.${index}.sku` as const, {
                      required: "Field cannot be empty",
                      validate: (value) => {
                        if (value.trim() === "") {
                          return "Field cannot be empty";
                        }
                        const isDuplicate = combinationFields.some(
                          (field, i) =>
                            i !== index &&
                            watch(`combinations.${i}.sku`) === value
                        );
                        return isDuplicate ? "SKU must be unique" : true;
                      },
                    })}
                  />
                  {formErrors?.combinations?.[index]?.sku && (
                    <span className="text-red-500 text-sm">
                      {formErrors.combinations[index].sku.message}
                    </span>
                  )}
                </div>

                {/* In Stock Switch */}
                <div className="w-1/6 flex items-center justify-center">
                  <Controller
                    name={`combinations.${index}.inStock` as const}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`inStock-${index}`}
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            setValue(`combinations.${index}.quantity`, 0);
                          }
                        }}
                      />
                    )}
                  />
                </div>

                {/* Quantity Input */}
                <div className="w-1/6">
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="Quantity"
                    className="w-full"
                    disabled={!watch(`combinations.${index}.inStock`)}
                    {...register(`combinations.${index}.quantity` as const, {
                      valueAsNumber: true,
                      validate: (value) =>
                        watch(`combinations.${index}.inStock`) && value > 0
                          ? true
                          : "Quantity must be greater than 0",
                    })}
                  />
                </div>

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCombination(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add Combination Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const hasEmptyFields = combinationFields.some(
                  (field, index) =>
                    !watch(`combinations.${index}.sku`) ||
                    (watch(`combinations.${index}.inStock`) &&
                      !watch(`combinations.${index}.quantity`))
                );
                if (!hasEmptyFields) {
                  appendCombination({
                    sku: "",
                    inStock: false,
                    quantity: 0,
                  });
                }
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Combination
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            {/* Price Field */}
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                {...register("price", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Price cannot be negative" },
                })}
                onChange={handlePriceChange}
              />
              {formErrors.price && (
                <p className="text-red-500 text-sm">
                  {formErrors.price.message}
                </p>
              )}
            </div>

            {/* Discount Field */}
            <div>
              <Label htmlFor="discount">Discount *</Label>
              <div className="flex">
                <Input
                  id="discount"
                  type="number"
                  {...register("discount", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Discount cannot be negative" },
                  })}
                  onChange={handleDiscountChange}
                />

                {/* Toggle Button for Discount Type */}
                <div className="flex ml-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-l ${
                      discountType === "percentage"
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => handleDiscountTypeChange("percentage")}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-r border ${
                      discountType === "flat"
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => handleDiscountTypeChange("flat")}
                  >
                    $
                  </button>
                </div>
              </div>
              {formErrors.discount && (
                <p className="text-red-500 text-sm">
                  {formErrors.discount.message}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      style={{ border: "none" }}
    >
      <Card className="w-[550px]">
        <div className="flex flex-row items-center justify-between py-4">
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
            <CardDescription>
              Enter the details of your new product.
            </CardDescription>
          </CardHeader>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <CardContent>
          <Tabs
            value={step.toString()}
            onValueChange={(value) => setStep(parseInt(value))}
          >
            <TabsList className="grid w-full grid-cols-4 justify-evenly">
              <TabsTrigger
                value="1"
                data-current-step={step}
                disabled={step !== 1}
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="2"
                data-current-step={step}
                disabled={step < 2}
              >
                Variants
              </TabsTrigger>
              <TabsTrigger
                value="3"
                data-current-step={step}
                disabled={step < 3}
              >
                Combinations
              </TabsTrigger>
              <TabsTrigger
                value="4"
                data-current-step={step}
                disabled={step < 4}
              >
                Price Info
              </TabsTrigger>
            </TabsList>
            <TabsContent value={step.toString()}>
              {renderStepContent()}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          {step < 4 ? (
            <Button
              type="button"
              onClick={async () => {
                if (await canProceed(step)) {
                  setStep(Math.min(4, step + 1));
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={!isValid}>
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
