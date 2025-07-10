import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  title = "Dashboard", 
  subtitle = "Pantau performa bisnis Anda secara real-time" 
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-qasir-text">{title}</h2>
          <p className="text-qasir-text-light">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-qasir-text-light" />
            <span className="absolute -top-1 -right-1 bg-qasir-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-qasir-text">Admin Toko</p>
              <p className="text-xs text-qasir-text-light">Toko Sumber Rejeki</p>
            </div>
            <div className="w-10 h-10 bg-qasir-red rounded-full flex items-center justify-center">
              <span className="text-white font-medium">AT</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
