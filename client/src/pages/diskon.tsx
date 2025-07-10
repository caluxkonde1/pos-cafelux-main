import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Percent, DollarSign, Calendar, Tag, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Discount {
  id: number;
  nama: string;
  type: "percentage" | "fixed";
  value: string;
  minPurchase: string;
  maxDiscount: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  usageCount?: number;
}

export default function DiskonPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/discounts");
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      } else {
        throw new Error("Failed to fetch discounts");
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data diskon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setEditingDiscount(null);
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.value || !formData.minPurchase) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = editingDiscount ? `/api/discounts/${editingDiscount.id}` : "/api/discounts";
      const method = editingDiscount ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: editingDiscount ? "Diskon berhasil diperbarui" : "Diskon berhasil dibuat",
        });
        
        setIsDialogOpen(false);
        resetForm();
        fetchDiscounts();
      } else {
        throw new Error("Failed to save discount");
      }
    } catch (error) {
      console.error("Error saving discount:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan diskon",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      nama: discount.nama,
      type: discount.type,
      value: discount.value,
      minPurchase: discount.minPurchase,
      maxDiscount: discount.maxDiscount || "",
      startDate: discount.startDate ? discount.startDate.split('T')[0] : "",
      endDate: discount.endDate ? discount.endDate.split('T')[0] : "",
      isActive: discount.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus diskon ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Diskon berhasil dihapus",
        });
        fetchDiscounts();
      } else {
        throw new Error("Failed to delete discount");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus diskon",
        variant: "destructive",
      });
    }
  };

  const toggleDiscountStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: `Diskon berhasil ${!isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        });
        fetchDiscounts();
      } else {
        throw new Error("Failed to toggle discount status");
      }
    } catch (error) {
      console.error("Error toggling discount status:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status diskon",
        variant: "destructive",
      });
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}%`;
    } else {
      return `Rp ${parseFloat(discount.value).toLocaleString()}`;
    }
  };

  const isDiscountActive = (discount: Discount) => {
    if (!discount.isActive) return false;
    
    const now = new Date();
    const startDate = discount.startDate ? new Date(discount.startDate) : null;
    const endDate = discount.endDate ? new Date(discount.endDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  const filteredDiscounts = discounts.filter(discount =>
    discount.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDiscounts = discounts.filter(d => isDiscountActive(d));
  const totalSavings = discounts.reduce((total, discount) => {
    // This would come from actual usage data
    return total + (discount.usageCount || 0) * parseFloat(discount.value);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qasir-red mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data diskon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-qasir-text">Manajemen Diskon</h1>
          <p className="text-qasir-text-light">Kelola promosi dan diskon untuk pelanggan</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-qasir-red hover:bg-red-600"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Diskon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? "Edit Diskon" : "Buat Diskon Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingDiscount ? "Perbarui informasi diskon" : "Buat diskon atau promosi baru untuk pelanggan"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Diskon *</Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Diskon Member 10%"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Jenis Diskon *</Label>
                  <Select value={formData.type} onValueChange={(value: "percentage" | "fixed") => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="value">
                    Nilai Diskon * {formData.type === "percentage" ? "(%)" : "(Rp)"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder={formData.type === "percentage" ? "10" : "50000"}
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase">Minimal Pembelian (Rp) *</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    placeholder="100000"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: e.target.value }))}
                  />
                </div>

                {formData.type === "percentage" && (
                  <div>
                    <Label htmlFor="maxDiscount">Maksimal Diskon (Rp)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="50000"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Tanggal Berakhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Aktifkan diskon</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSubmit} className="flex-1 bg-qasir-red hover:bg-red-600">
                  {editingDiscount ? "Perbarui" : "Buat"} Diskon
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diskon</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.length}</div>
            <p className="text-xs text-muted-foreground">Semua diskon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diskon Aktif</CardTitle>
            <Percent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDiscounts.length}</div>
            <p className="text-xs text-muted-foreground">Sedang berjalan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penggunaan</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discounts.reduce((total, d) => total + (d.usageCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Kali digunakan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penghematan</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Hemat pelanggan</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Discounts Alert */}
      {activeDiscounts.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Percent className="h-5 w-5 mr-2" />
              Diskon Aktif Saat Ini
            </CardTitle>
            <CardDescription className="text-green-700">
              {activeDiscounts.length} diskon sedang berjalan dan dapat digunakan pelanggan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDiscounts.map((discount) => (
                <div key={discount.id} className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-sm">{discount.nama}</h4>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {formatDiscountValue(discount)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Min. pembelian: Rp {parseFloat(discount.minPurchase).toLocaleString()}
                  </p>
                  {discount.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Berakhir: {new Date(discount.endDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Diskon</CardTitle>
              <CardDescription>Kelola semua diskon dan promosi</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari diskon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Diskon</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Min. Pembelian</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Penggunaan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {searchTerm ? "Tidak ada diskon yang ditemukan" : "Belum ada diskon dibuat"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.nama}</TableCell>
                    <TableCell>
                      <Badge variant={discount.type === "percentage" ? "default" : "secondary"}>
                        {discount.type === "percentage" ? "Persentase" : "Nominal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatDiscountValue(discount)}
                    </TableCell>
                    <TableCell>
                      Rp {parseFloat(discount.minPurchase).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {discount.startDate || discount.endDate ? (
                        <div className="text-sm">
                          {discount.startDate && (
                            <div>{new Date(discount.startDate).toLocaleDateString('id-ID')}</div>
                          )}
                          {discount.endDate && (
                            <div>s/d {new Date(discount.endDate).toLocaleDateString('id-ID')}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Tidak terbatas</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={discount.isActive}
                          onCheckedChange={() => toggleDiscountStatus(discount.id, discount.isActive)}
                        />
                        {isDiscountActive(discount) ? (
                          <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Nonaktif</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold">{discount.usageCount || 0}x</div>
                        <div className="text-gray-500">digunakan</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(discount)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(discount.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
