// components/Sidebar.tsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Store,
  Package,
  Book,
  Megaphone,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Home" },
    { icon: Store, label: "Stores" },
    { icon: Package, label: "Products", active: true },
    { icon: Book, label: "Catalogue" },
    { icon: Megaphone, label: "Promotions" },
    { icon: FileText, label: "Reports" },
    { icon: FileText, label: "Docs" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <span className="text-lg font-bold mb-4 bg-teal-500 mr-10 p-2 rounded-md">
          Lemon Inc.
        </span>
        <nav className="space-y-2 mt-4">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start ${
                item.active ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 p-4 w-64">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">Andy Samberg</p>
            <p className="text-xs text-gray-500">andy.samberg@gmail.com</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}
