import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Download, Edit, Trash2, Bus, Mail, Phone, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User, type TransactionWithItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import type { z } from "zod";

type EmployeeFormData = z.infer<typeof insertUserSchema>;

export default function Pegawai() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, we'll simulate employee data since the current schema only has users
  // In a real application, you would have a separate employees endpoint
  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"], // This would be /api/employees in real app
    queryFn: async () => {
      // Simulating employee data for demo
      return [
        {
          id: 1,
          username: "admin",
          password: "admin123",
          email: "admin@qasir.com",
          nama: "Admin Toko",
          role: "admin",
          isActive: true,
          createdAt: new Date("2024-01-01"),
        },
        {
          id: 2,
          username: "kasir1",
          password: "kasir123",
          email: "kasir1@qasir.com",
          nama: "Siti Nurhaliza",
          role: "kasir",
          isActive: true,
          createdAt: new Date("2024-01-15"),
        },
        {
          id: 3,
          username: "kasir2", 
          password: "kasir123",
          email: "kasir2@qasir.com",
          nama: "Budi Santoso",
          role: "kasir",
          isActive: true,
          createdAt: new Date("2024-02-01"),
        },
        {
          id: 4,
          username: "supervisor1",
          password: "super123", 
          email: "supervisor@qasir.com",
          nama: "Andi Prasetyo",
          role: "supervisor",
          isActive: false,
          createdAt: new Date("2024-01-20"),
        },
      ];
    },
  });

  const { data: transactions = [] } = useQuery<TransactionWithItems[]>({
    queryKey: ["/api/transactions"],
  });

  const addForm = useForm<EmployeeFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      nama: "",
      role: "kasir",
      isActive: true,
    },
  });

  const editForm = useForm<EmployeeFormData>({
    resolver: zodResolver(insertUserSchema),
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'kasir':
        return <Badge className="bg-blue-100 text-blue-800">Kasir</Badge>;
      case 'supervisor':
        return <Badge className="bg-green-100 text-green-800">Supervisor</Badge>;
      case 'pemilik':
        return <Badge className="bg-purple-100 text-purple-800">Pemilik</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Nonaktif</Badge>;
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddEmployee = (data: EmployeeFormData) => {
    toast({
      title: "Demo Mode",
      description: "Fitur tambah pegawai dalam mode demo. Data tidak akan tersimpan.",
    });
    setAddModalOpen(false);
  };

  const handleEditEmployee = (data: EmployeeFormData) => {
    toast({
      title: "Demo Mode", 
      description: "Fitur edit pegawai dalam mode demo. Data tidak akan tersimpan.",
    });
    setEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) {
      toast({
        title: "Demo Mode",
        description: "Fitur hapus pegawai dalam mode demo. Data tidak akan terhapus.",
      });
    }
  };

  const openEditModal = (employee: User) => {
    setEditingEmployee(employee);
    editForm.reset({
      username: employee.username,
      password: "",
      email: employee.email,
      nama: employee.nama,
      role: employee.role,
      isActive: employee.isActive,
    });
    setEditModalOpen(true);
  };

  const openDetailModal = (employee: User) => {
    setSelectedEmployee(employee);
    setDetailModalOpen(true);
  };

  const getEmployeeTransactions = (employeeId: number) => {
    return transactions.filter(t => t.kasirId === employeeId);
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.isActive).length;
  const adminCount = employees.filter(e => e.role === 'admin').length;

  return (
    <div className="space-y-6">
      <Header 
        title="Pegawai" 
        subtitle="Kelola data pegawai dan akses sistem" 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Total Pegawai</p>
                <p className="text-2xl font-bold text-qasir-text">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bus className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Pegawai Aktif</p>
                <p className="text-2xl font-bold text-qasir-text">{activeEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bus className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Administrator</p>
                <p className="text-2xl font-bold text-qasir-text">{adminCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Bus className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-qasir-text">Daftar Pegawai</CardTitle>
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-qasir-red hover:bg-red-600">
                  <Plus className="mr-2" size={16} />
                  Tambah Pegawai
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Pegawai Baru</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddEmployee)} className="space-y-4">
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan username" {...field} />
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Masukkan password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kasir">Kasir</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="pemilik">Pemilik</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit">
                        Simpan
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
                placeholder="Cari nama, username, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kasir">Kasir</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="pemilik">Pemilik</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2" size={16} />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Export
            </Button>
          </div>

          {/* Employees Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-qasir-text-light">
                        <Bus className="mx-auto mb-2" size={32} />
                        <p>Tidak ada pegawai ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-qasir-red rounded-full flex items-center justify-center">
                            <Bus className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="font-medium">{employee.nama}</p>
                            <p className="text-sm text-gray-500">ID: {employee.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{employee.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(employee.role)}</TableCell>
                      <TableCell>{getStatusBadge(employee.isActive)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(employee.createdAt), { 
                          addSuffix: true, 
                          locale: id 
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDetailModal(employee)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditModal(employee)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Employee Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pegawai</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditEmployee)} className="space-y-4">
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username" {...field} />
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kasir">Kasir</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="pemilik">Pemilik</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Employee Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pegawai</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Dasar</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nama:</strong> {selectedEmployee.nama}</p>
                    <p><strong>Username:</strong> {selectedEmployee.username}</p>
                    <p><strong>Email:</strong> {selectedEmployee.email}</p>
                    <p><strong>Role:</strong> {getRoleBadge(selectedEmployee.role)}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedEmployee.isActive)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Aktivitas</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bergabung:</strong> {format(new Date(selectedEmployee.createdAt), 'dd MMMM yyyy', { locale: id })}</p>
                    <p><strong>Transaksi:</strong> {getEmployeeTransactions(selectedEmployee.id).length}</p>
                    <p><strong>Login Terakhir:</strong> Hari ini</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold mb-3">Aktivitas Transaksi Terbaru</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getEmployeeTransactions(selectedEmployee.id).slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.nomorTransaksi}</TableCell>
                          <TableCell>{format(new Date(transaction.createdAt), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{transaction.customer?.nama || "Umum"}</TableCell>
                          <TableCell className="font-semibold">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(parseFloat(transaction.total))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {getEmployeeTransactions(selectedEmployee.id).length === 0 && (
                    <div className="text-center py-8 text-qasir-text-light">
                      <p>Belum ada aktivitas transaksi</p>
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
