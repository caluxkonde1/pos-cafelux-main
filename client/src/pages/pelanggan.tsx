import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Download, Edit, Trash2, Users, Mail, Phone, MapPin, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type Customer, type TransactionWithItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { z } from "zod";

type CustomerFormData = z.infer<typeof insertCustomerSchema>;

export default function Pelanggan() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: transactions = [] } = useQuery<TransactionWithItems[]>({
    queryKey: ["/api/transactions"],
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: CustomerFormData) => {
      const response = await apiRequest("POST", "/api/customers", customerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pelanggan Ditambahkan",
        description: "Data pelanggan baru berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setAddModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Gagal Menambahkan Pelanggan",
        description: "Terjadi kesalahan saat menambahkan pelanggan",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CustomerFormData> }) => {
      const response = await apiRequest("PUT", `/api/customers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pelanggan Diperbarui",
        description: "Data pelanggan berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setEditModalOpen(false);
      setEditingCustomer(null);
    },
    onError: () => {
      toast({
        title: "Gagal Memperbarui Pelanggan",
        description: "Terjadi kesalahan saat memperbarui pelanggan",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/customers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pelanggan Dihapus",
        description: "Data pelanggan berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: () => {
      toast({
        title: "Gagal Menghapus Pelanggan",
        description: "Terjadi kesalahan saat menghapus pelanggan",
        variant: "destructive",
      });
    },
  });

  const addForm = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      nama: "",
      email: "",
      telepon: "",
      alamat: "",
    },
  });

  const editForm = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getCustomerTier = (totalPembelian: string) => {
    const total = parseFloat(totalPembelian);
    if (total >= 10000000) return { label: "Platinum", color: "bg-purple-100 text-purple-800" };
    if (total >= 5000000) return { label: "Gold", color: "bg-yellow-100 text-yellow-800" };
    if (total >= 1000000) return { label: "Silver", color: "bg-gray-100 text-gray-800" };
    return { label: "Bronze", color: "bg-orange-100 text-orange-800" };
  };

  const filteredCustomers = customers.filter(customer =>
    customer.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.telepon?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = (data: CustomerFormData) => {
    addCustomerMutation.mutate(data);
  };

  const handleEditCustomer = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data });
    }
  };

  const handleDeleteCustomer = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    editForm.reset({
      nama: customer.nama,
      email: customer.email || "",
      telepon: customer.telepon || "",
      alamat: customer.alamat || "",
    });
    setEditModalOpen(true);
  };

  const openDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const getCustomerTransactions = (customerId: number) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.jumlahTransaksi > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.totalPembelian), 0);

  return (
    <div className="space-y-6">
      <Header 
        title="Pelanggan" 
        subtitle="Kelola data pelanggan dan riwayat pembelian" 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Total Pelanggan</p>
                <p className="text-2xl font-bold text-qasir-text">{totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Pelanggan Aktif</p>
                <p className="text-2xl font-bold text-qasir-text">{activeCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Total Pembelian</p>
                <p className="text-2xl font-bold text-qasir-text">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-qasir-text">Daftar Pelanggan</CardTitle>
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-qasir-red hover:bg-red-600">
                  <Plus className="mr-2" size={16} />
                  Tambah Pelanggan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddCustomer)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Masukkan email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="telepon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Telepon</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nomor telepon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="alamat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Masukkan alamat lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={addCustomerMutation.isPending}>
                        {addCustomerMutation.isPending ? "Menyimpan..." : "Simpan"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, email, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2" size={16} />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Export
            </Button>
          </div>

          {/* Customers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Transaksi</TableHead>
                  <TableHead>Total Pembelian</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-qasir-text-light">
                        <Users className="mx-auto mb-2" size={32} />
                        <p>Tidak ada pelanggan ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const tier = getCustomerTier(customer.totalPembelian);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.nama}</p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(customer.createdAt), { 
                                addSuffix: true, 
                                locale: id 
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="mr-1 h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                            {customer.telepon && (
                              <div className="flex items-center text-sm">
                                <Phone className="mr-1 h-3 w-3" />
                                {customer.telepon}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start">
                            <MapPin className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm line-clamp-2">{customer.alamat || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.jumlahTransaksi}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(customer.totalPembelian)}</TableCell>
                        <TableCell>
                          <Badge className={tier.color}>{tier.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDetailModal(customer)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditModal(customer)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pelanggan</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCustomer)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Masukkan email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="telepon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor telepon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan alamat lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={updateCustomerMutation.isPending}>
                  {updateCustomerMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Dasar</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nama:</strong> {selectedCustomer.nama}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email || "-"}</p>
                    <p><strong>Telepon:</strong> {selectedCustomer.telepon || "-"}</p>
                    <p><strong>Alamat:</strong> {selectedCustomer.alamat || "-"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Statistik</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Transaksi:</strong> {selectedCustomer.jumlahTransaksi}</p>
                    <p><strong>Total Pembelian:</strong> {formatCurrency(selectedCustomer.totalPembelian)}</p>
                    <p><strong>Bergabung:</strong> {format(new Date(selectedCustomer.createdAt), 'dd MMMM yyyy', { locale: id })}</p>
                    <p><strong>Tier:</strong> 
                      <Badge className={`ml-2 ${getCustomerTier(selectedCustomer.totalPembelian).color}`}>
                        {getCustomerTier(selectedCustomer.totalPembelian).label}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold mb-3">Riwayat Transaksi Terbaru</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCustomerTransactions(selectedCustomer.id).slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.nomorTransaksi}</TableCell>
                          <TableCell>{format(new Date(transaction.createdAt), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{transaction.items.length} item</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(transaction.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {getCustomerTransactions(selectedCustomer.id).length === 0 && (
                    <div className="text-center py-8 text-qasir-text-light">
                      <p>Belum ada transaksi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
