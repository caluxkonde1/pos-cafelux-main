import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  User,
  Shield,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Eye,
  EyeOff
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";

interface Employee {
  id: number;
  nama: string;
  username: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  tanggalLahir?: string;
  tanggalMasuk: string;
  role: 'pemilik' | 'admin' | 'supervisor' | 'kasir' | 'pelayan';
  status: 'aktif' | 'tidak_aktif' | 'cuti';
  gaji?: number;
  jamKerja: string;
  outletId?: number;
  permissions: string[];
  catatan?: string;
  fotoProfile?: string;
  createdAt: string;
  updatedAt: string;
}

const ROLES = [
  { value: 'pemilik', label: 'Pemilik', color: 'bg-red-100 text-red-800' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'supervisor', label: 'Supervisor', color: 'bg-blue-100 text-blue-800' },
  { value: 'kasir', label: 'Kasir', color: 'bg-green-100 text-green-800' },
  { value: 'pelayan', label: 'Pelayan', color: 'bg-yellow-100 text-yellow-800' },
];

const PERMISSIONS = [
  'kelola_produk', 'kelola_kategori', 'kelola_transaksi', 'kelola_pelanggan',
  'kelola_pegawai', 'kelola_laporan', 'kelola_kas', 'kelola_diskon',
  'kelola_outlet', 'kelola_pengaturan'
];

export default function PegawaiComplete() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission, userRole } = usePermissions();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    password: "",
    email: "",
    telepon: "",
    alamat: "",
    tanggalLahir: "",
    tanggalMasuk: new Date().toISOString().split('T')[0],
    role: "kasir",
    status: "aktif",
    gaji: "",
    jamKerja: "08:00-17:00",
    permissions: [] as string[],
    catatan: ""
  });

  // Check if user can manage employees
  const canManageEmployees = hasPermission('kelola_pegawai') || ['pemilik', 'admin', 'supervisor'].includes(userRole);
  const canEditStatus = ['pemilik', 'admin', 'supervisor'].includes(userRole);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    enabled: canManageEmployees,
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
      if (!response.ok) throw new Error("Failed to create employee");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pegawai berhasil ditambahkan!" });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menambahkan pegawai",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update employee");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pegawai berhasil diperbarui!" });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setShowEditModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui pegawai",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete employee");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pegawai berhasil dihapus!" });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus pegawai",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || employee.role === filterRole;
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      nama: "",
      username: "",
      password: "",
      email: "",
      telepon: "",
      alamat: "",
      tanggalLahir: "",
      tanggalMasuk: new Date().toISOString().split('T')[0],
      role: "kasir",
      status: "aktif",
      gaji: "",
      jamKerja: "08:00-17:00",
      permissions: [],
      catatan: ""
    });
    setSelectedEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      nama: employee.nama,
      username: employee.username,
      password: "",
      email: employee.email || "",
      telepon: employee.telepon || "",
      alamat: employee.alamat || "",
      tanggalLahir: employee.tanggalLahir || "",
      tanggalMasuk: employee.tanggalMasuk,
      role: employee.role,
      status: employee.status,
      gaji: employee.gaji?.toString() || "",
      jamKerja: employee.jamKerja,
      permissions: employee.permissions,
      catatan: employee.catatan || ""
    });
    setShowEditModal(true);
  };

  const handleSubmit = () => {
    if (!formData.nama || !formData.username) {
      toast({
        title: "Form tidak lengkap",
        description: "Nama dan username harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEmployee && !formData.password) {
      toast({
        title: "Form tidak lengkap",
        description: "Password harus diisi untuk pegawai baru",
        variant: "destructive",
      });
      return;
    }

    const employeeData = {
      ...formData,
      gaji: formData.gaji ? parseFloat(formData.gaji) : undefined,
    };

    // Remove password if empty (for updates)
    if (!formData.password && selectedEmployee) {
      delete employeeData.password;
    }

    if (selectedEmployee) {
      updateEmployeeMutation.mutate({ id: selectedEmployee.id, data: employeeData });
    } else {
      createEmployeeMutation.mutate(employeeData);
    }
  };

  const handleDelete = (employee: Employee) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pegawai ${employee.nama}?`)) {
      deleteEmployeeMutation.mutate(employee.id);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nama', 'Username', 'Email', 'Telepon', 'Role', 'Status', 'Gaji', 'Jam Kerja', 'Tanggal Masuk'],
      ...filteredEmployees.map(employee => [
        employee.nama,
        employee.username,
        employee.email || '',
        employee.telepon || '',
        employee.role,
        employee.status,
        employee.gaji?.toString() || '',
        employee.jamKerja,
        employee.tanggalMasuk
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pegawai-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: "Data pegawai berhasil diekspor!" });
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find(r => r.value === role) || ROLES[3];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'cuti': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (!canManageEmployees) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
            <p className="text-gray-600">
              Anda tidak memiliki izin untuk mengelola data pegawai.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pegawai</h1>
        <p className="text-gray-600">Manajemen pegawai dan hak akses sistem</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pegawai</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pegawai Aktif</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === 'aktif').length}</p>
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
                <p className="text-sm text-gray-600">Admin & Supervisor</p>
                <p className="text-2xl font-bold">{employees.filter(e => ['admin', 'supervisor'].includes(e.role)).length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pegawai Cuti</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === 'cuti').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
                  placeholder="Cari pegawai..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                  <SelectItem value="cuti">Cuti</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pegawai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p>Memuat data pegawai...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Tidak ada pegawai ditemukan</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{employee.nama}</h3>
                    <p className="text-sm text-gray-600">@{employee.username}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getRoleInfo(employee.role).color}>
                        {getRoleInfo(employee.role).label}
                      </Badge>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {canEditStatus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {employee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{employee.email}</span>
                    </div>
                  )}
                  {employee.telepon && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{employee.telepon}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{employee.jamKerja}</span>
                  </div>
                  {employee.gaji && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Rp {employee.gaji.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Bergabung: {new Date(employee.tanggalMasuk).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? "Edit Pegawai" : "Tambah Pegawai Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Dasar</h3>
              
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
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Username untuk login"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Password {selectedEmployee ? "(kosongkan jika tidak diubah)" : "*"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Masukkan password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
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
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Kerja</h3>
              
              <div>
                <Label htmlFor="role">Role/Jabatan</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={!canEditStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                    <SelectItem value="cuti">Cuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tanggalMasuk">Tanggal Masuk</Label>
                <Input
                  id="tanggalMasuk"
                  type="date"
                  value={formData.tanggalMasuk}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggalMasuk: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="jamKerja">Jam Kerja</Label>
                <Input
                  id="jamKerja"
                  value={formData.jamKerja}
                  onChange={(e) => setFormData(prev => ({ ...prev, jamKerja: e.target.value }))}
                  placeholder="08:00-17:00"
                />
              </div>

              <div>
                <Label htmlFor="gaji">Gaji (Rp)</Label>
                <Input
                  id="gaji"
                  type="number"
                  value={formData.gaji}
                  onChange={(e) => setFormData(prev => ({ ...prev, gaji: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Hak Akses</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PERMISSIONS.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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
                placeholder="Catatan tambahan tentang pegawai"
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
              disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
            >
              {createEmployeeMutation.isPending || updateEmployeeMutation.isPending
                ? "Menyimpan..."
                : selectedEmployee
                ? "Perbarui"
                : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
