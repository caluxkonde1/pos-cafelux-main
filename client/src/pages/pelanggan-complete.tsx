import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Star
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: number;
  nama: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  pekerjaan?: string;
  catatan?: string;
  totalTransaksi: number;
  totalBelanja: number;
  poinLoyalitas: number;
  status: 'aktif' | 'tidak_aktif';
  kategori: 'reguler' | 'vip' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export default function PelangganComplete() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggalLahir: "",
    jenisKelamin: "",
    pekerjaan: "",
    catatan: "",
    kategori: "reguler",
    status: "aktif"
  });

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pelanggan berhasil ditambahkan!" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menambahkan pelanggan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update customer");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pelanggan berhasil diperbarui!" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setShowEditModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui pelanggan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete customer");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pelanggan berhasil dihapus!" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus pelanggan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.telepon?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    const matchesKategori = filterKategori === "all" || customer.kategori === filterKategori;
    
    return matchesSearch && matchesStatus && matchesKategori;
  });

  const resetForm = () => {
    setFormData({
      nama: "",
      email: "",
      telepon: "",
      alamat: "",
      tanggalLahir: "",
      jenisKelamin: "",
      pekerjaan: "",
      catatan: "",
      kategori: "reguler",
      status: "aktif"
    });
    setSelectedCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      nama: customer.nama,
      email: customer.email || "",
      telepon: customer.telepon || "",
      alamat: customer.alamat || "",
      tanggalLahir: customer.tanggalLahir || "",
      jenisKelamin: customer.jenisKelamin || "",
      pekerjaan: customer.pekerjaan || "",
      catatan: customer.catatan || "",
      kategori: customer.kategori,
      status: customer.status
    });
    setShowEditModal(true);
  };

  const handleSubmit = () => {
    if (!formData.nama) {
      toast({
        title: "Form tidak lengkap",
        description: "Nama pelanggan harus diisi",
        variant: "destructive",
      });
      return;
    }

    const customerData = {
      ...formData,
      totalTransaksi: 0,
      totalBelanja: 0,
      poinLoyalitas: 0,
    };

    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data: customerData });
    } else {
      createCustomerMutation.mutate(customerData);
    }
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pelanggan ${customer.nama}?`)) {
      deleteCustomerMutation.mutate(customer.id);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nama', 'Email', 'Telepon', 'Alamat', 'Kategori', 'Status', 'Total Transaksi', 'Total Belanja', 'Poin Loyalitas'],
      ...filteredCustomers.map(customer => [
        customer.nama,
        customer.email || '',
        customer.telepon || '',
        customer.alamat || '',
        customer.kategori,
        customer.status,
        customer.totalTransaksi.toString(),
        customer.totalBelanja.toString(),
        customer.poinLoyalitas.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pelanggan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: "Data pelanggan berhasil diekspor!" });
  };

  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pelanggan</h1>
        <p className="text-gray-600">Manajemen data pelanggan dan loyalitas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pelanggan VIP</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.kategori === 'vip').length}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pelanggan Aktif</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.status === 'aktif').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Poin</p>
                <p className="text-2xl font-bold">{customers.reduce((sum, c) => sum + (c.poinLoyalitas || 0), 0)}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="reguler">Reguler</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p>Memuat data pelanggan...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Tidak ada pelanggan ditemukan</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.nama}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className={getKategoriColor(customer.kategori)}>
                        {customer.kategori ? customer.kategori.toUpperCase() : ''}
                      </Badge>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(customer)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.telepon && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{customer.telepon}</span>
                    </div>
                  )}
                  {customer.alamat && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{customer.alamat}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Transaksi</p>
                    <p className="font-semibold">{customer.totalTransaksi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Belanja</p>
                    <p className="font-semibold">Rp {(customer.totalBelanja || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Poin</p>
                    <p className="font-semibold text-yellow-600">{customer.poinLoyalitas || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="telepon">Nomor Telepon</Label>
              <Input
                id="telepon"
                value={formData.telepon}
                onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
              <Input
                id="tanggalLahir"
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData(prev => ({ ...prev, tanggalLahir: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <Select value={formData.jenisKelamin} onValueChange={(value) => setFormData(prev => ({ ...prev, jenisKelamin: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pekerjaan">Pekerjaan</Label>
              <Input
                id="pekerjaan"
                value={formData.pekerjaan}
                onChange={(e) => setFormData(prev => ({ ...prev, pekerjaan: e.target.value }))}
                placeholder="Masukkan pekerjaan"
              />
            </div>

            <div>
              <Label htmlFor="kategori">Kategori Pelanggan</Label>
              <Select value={formData.kategori} onValueChange={(value) => setFormData(prev => ({ ...prev, kategori: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reguler">Reguler</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                placeholder="Masukkan alamat lengkap"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                value={formData.catatan}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                placeholder="Catatan tambahan tentang pelanggan"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending || updateCustomerMutation.isPending
                ? "Menyimpan..."
                : selectedCustomer
                ? "Perbarui"
                : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
