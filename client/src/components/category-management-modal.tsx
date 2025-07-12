import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Edit, Trash2, Plus, Palette } from "lucide-react";
import { useProducts } from "../hooks/use-products";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagementModal({ isOpen, onClose }: CategoryManagementModalProps) {
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    warna: "#3B82F6"
  });

  const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useProducts();

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      nama: category.nama,
      deskripsi: category.deskripsi || "",
      warna: category.warna || "#3B82F6"
    });
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, formData);
        alert('Kategori berhasil diupdate!');
      } else {
        // Add new category
        await addCategory(formData);
        alert('Kategori berhasil ditambahkan!');
      }
      
      // Reset form
      setEditingCategory(null);
      setFormData({
        nama: "",
        deskripsi: "",
        warna: "#3B82F6"
      });
    } catch (error: any) {
      console.error('Save category error:', error);
      alert(error.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await deleteCategory(categoryId);
        alert('Kategori berhasil dihapus!');
      } catch (error: any) {
        console.error('Delete category error:', error);
        alert(error.message || 'Gagal menghapus kategori');
      }
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({
      nama: "",
      deskripsi: "",
      warna: "#3B82F6"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Kategori</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Kategori *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Masukkan nama kategori"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warna">Warna</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="warna"
                    type="color"
                    value={formData.warna}
                    onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <div 
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: formData.warna }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Deskripsi kategori (opsional)"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={!formData.nama.trim() || isLoading}
                className="flex-1"
              >
                {editingCategory ? 'Update' : 'Tambah'} Kategori
              </Button>
              {editingCategory && (
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Batal
                </Button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Daftar Kategori ({categories.length})</h3>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Palette className="mx-auto mb-2" size={32} />
                <p>Belum ada kategori</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.warna }}
                      ></div>
                      <div>
                        <h4 className="font-medium">{category.nama}</h4>
                        {category.deskripsi && (
                          <p className="text-sm text-gray-600">{category.deskripsi}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ID: {category.id}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
