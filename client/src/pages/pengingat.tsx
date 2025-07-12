import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Plus, Clock, AlertTriangle, CheckCircle, Calendar, Edit, Package, Send } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/hooks/use-permissions";

interface Reminder {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  kategori: 'stok' | 'pembayaran' | 'tugas' | 'lainnya';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  status: 'aktif' | 'selesai' | 'terlewat';
  createdAt: string;
}

interface LowStockProduct {
  id: number;
  nama: string;
  stok: number;
  stokMinimal: number;
  kategori: string;
}

const reminderSchema = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  waktu: z.string().min(1, "Waktu harus diisi"),
  kategori: z.enum(['stok', 'pembayaran', 'tugas', 'lainnya']),
  prioritas: z.enum(['tinggi', 'sedang', 'rendah']),
});

type ReminderForm = z.infer<typeof reminderSchema>;

export default function Pengingat() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const queryClient = useQueryClient();
  const { currentUser } = usePermissions();

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    queryFn: async () => {
      const response = await fetch('/api/reminders');
      if (!response.ok) throw new Error('Failed to fetch reminders');
      return response.json();
    }
  });

  const { data: lowStockProducts = [] } = useQuery<LowStockProduct[]>({
    queryKey: ["/api/products/low-stock"],
    queryFn: async () => {
      const response = await fetch('/api/products/low-stock');
      if (!response.ok) throw new Error('Failed to fetch low stock products');
      return response.json();
    }
  });

  // Send low stock notifications to all roles
  useEffect(() => {
    if (lowStockProducts.length > 0 && !notificationSent) {
      sendLowStockNotifications();
      setNotificationSent(true);
    }
  }, [lowStockProducts, notificationSent]);

  const sendLowStockNotifications = async () => {
    try {
      await fetch('/api/notifications/low-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: lowStockProducts,
          message: `${lowStockProducts.length} produk memiliki stok rendah dan perlu segera diisi ulang.`
        }),
      });
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  };

  const form = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      judul: '',
      deskripsi: '',
      tanggal: '',
      waktu: '',
      kategori: 'tugas',
      prioritas: 'sedang',
    },
  });

  const addReminderMutation = useMutation({
    mutationFn: async (data: ReminderForm) => {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: currentUser?.username || 'Unknown'
        }),
      });
      if (!response.ok) throw new Error('Failed to add reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setAddModalOpen(false);
      form.reset();
      alert('Pengingat berhasil ditambahkan!');
    },
    onError: (error) => {
      console.error('Add reminder error:', error);
      alert('Gagal menambahkan pengingat');
    }
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ReminderForm> }) => {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setEditModalOpen(false);
      setSelectedReminder(null);
      alert('Pengingat berhasil diupdate!');
    },
    onError: (error) => {
      console.error('Update reminder error:', error);
      alert('Gagal mengupdate pengingat');
    }
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reminders/${id}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to complete reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      alert('Pengingat berhasil diselesaikan!');
    },
    onError: (error) => {
      console.error('Complete reminder error:', error);
      alert('Gagal menyelesaikan pengingat');
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, newStock }: { productId: number; newStock: number }) => {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stok: newStock }),
      });
      if (!response.ok) throw new Error('Failed to update stock');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      alert('Stok berhasil diupdate!');
    },
    onError: (error) => {
      console.error('Update stock error:', error);
      alert('Gagal mengupdate stok');
    }
  });

  const handleAddReminder = () => {
    form.reset({
      judul: '',
      deskripsi: '',
      tanggal: '',
      waktu: '',
      kategori: 'tugas',
      prioritas: 'sedang',
    });
    setAddModalOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    form.reset({
      judul: reminder.judul,
      deskripsi: reminder.deskripsi,
      tanggal: reminder.tanggal,
      waktu: reminder.waktu,
      kategori: reminder.kategori,
      prioritas: reminder.prioritas,
    });
    setEditModalOpen(true);
  };

  const handleCompleteReminder = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menyelesaikan pengingat ini?')) {
      completeReminderMutation.mutate(id);
    }
  };

  const handleUpdateStock = (productId: number, newStock: number) => {
    if (newStock <= 0) {
      alert('Stok harus lebih dari 0');
      return;
    }
    updateStockMutation.mutate({ productId, newStock });
  };

  const onSubmit = (data: ReminderForm) => {
    if (selectedReminder) {
      updateReminderMutation.mutate({ id: selectedReminder.id, data });
    } else {
      addReminderMutation.mutate(data);
    }
  };

  const getPriorityBadge = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi':
        return <Badge className="bg-red-100 text-red-800">Tinggi</Badge>;
      case 'sedang':
        return <Badge className="bg-yellow-100 text-yellow-800">Sedang</Badge>;
      case 'rendah':
        return <Badge className="bg-green-100 text-green-800">Rendah</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-blue-100 text-blue-800">Aktif</Badge>;
      case 'selesai':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'terlewat':
        return <Badge className="bg-red-100 text-red-800">Terlewat</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (kategori: string) => {
    switch (kategori) {
      case 'stok':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'pembayaran':
        return <Clock className="text-blue-500" size={20} />;
      case 'tugas':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const aktifCount = reminders.filter((r: Reminder) => r.status === 'aktif').length;
  const selesaiCount = reminders.filter((r: Reminder) => r.status === 'selesai').length;
  const terlewatCount = reminders.filter((r: Reminder) => r.status === 'terlewat').length;
  const tinggiCount = reminders.filter((r: Reminder) => r.prioritas === 'tinggi' && r.status === 'aktif').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengingat</h1>
          <p className="text-gray-600">Kelola pengingat dan notifikasi untuk bisnis Anda</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-orange-600" size={20} />
                <CardTitle className="text-orange-800">Peringatan Stok Rendah</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setStockModalOpen(true)}
                >
                  <Package className="mr-2" size={16} />
                  Kelola Stok
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={sendLowStockNotifications}
                >
                  <Send className="mr-2" size={16} />
                  Kirim Notifikasi
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-2">
              {lowStockProducts.length} produk memiliki stok rendah dan perlu segera diisi ulang.
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 3).map((product: LowStockProduct) => (
                <Badge key={product.id} variant="outline" className="text-orange-700 border-orange-300">
                  {product.nama} ({product.stok}/{product.stokMinimal})
                </Badge>
              ))}
              {lowStockProducts.length > 3 && (
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  +{lowStockProducts.length - 3} lainnya
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex justify-end">
        <Button 
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={handleAddReminder}
        >
          <Plus size={16} className="mr-2" />
          Tambah Pengingat
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{aktifCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Prioritas Tinggi</p>
                <p className="text-2xl font-bold text-gray-900">{tinggiCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{selesaiCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Terlewat</p>
                <p className="text-2xl font-bold text-gray-900">{terlewatCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="text-gray-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Daftar Pengingat</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Belum ada pengingat</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder: Reminder) => (
                <div key={reminder.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(reminder.kategori)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{reminder.judul}</h3>
                          {getPriorityBadge(reminder.prioritas)}
                          {getStatusBadge(reminder.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{reminder.deskripsi}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{new Date(reminder.tanggal).toLocaleDateString('id-ID')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{reminder.waktu}</span>
                          </div>
                          <span className="capitalize">{reminder.kategori}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {reminder.status === 'aktif' && (
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleCompleteReminder(reminder.id)}
                          disabled={completeReminderMutation.isPending}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Selesai
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditReminder(reminder)}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Reminder Modal */}
      <Dialog open={addModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setAddModalOpen(false);
          setEditModalOpen(false);
          setSelectedReminder(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedReminder ? 'Edit Pengingat' : 'Tambah Pengingat'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="judul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul pengingat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan deskripsi pengingat"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tanggal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waktu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stok">Stok</SelectItem>
                        <SelectItem value="pembayaran">Pembayaran</SelectItem>
                        <SelectItem value="tugas">Tugas</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioritas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tinggi">Tinggi</SelectItem>
                        <SelectItem value="sedang">Sedang</SelectItem>
                        <SelectItem value="rendah">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                    setSelectedReminder(null);
                  }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={addReminderMutation.isPending || updateReminderMutation.isPending}
                >
                  {(addReminderMutation.isPending || updateReminderMutation.isPending) 
                    ? 'Menyimpan...' 
                    : selectedReminder ? 'Update' : 'Simpan'
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stock Management Modal */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kelola Stok Rendah</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {lowStockProducts.map((product: LowStockProduct) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{product.nama}</h4>
                  <p className="text-sm text-gray-600">
                    Kategori: {product.kategori} | Stok: {product.stok} | Minimal: {product.stokMinimal}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Stok baru"
                    className="w-24"
                    min="1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newStock = parseInt((e.target as HTMLInputElement).value);
                        if (newStock > 0) {
                          handleUpdateStock(product.id, newStock);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const newStock = parseInt(input.value);
                      if (newStock > 0) {
                        handleUpdateStock(product.id, newStock);
                        input.value = '';
                      }
                    }}
                    disabled={updateStockMutation.isPending}
                  >
                    {updateStockMutation.isPending ? 'Loading...' : 'Update'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
