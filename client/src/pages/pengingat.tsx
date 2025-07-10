import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

interface Reminder {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  kategori: 'stok' | 'pembayaran' | 'tugas' | 'lainnya';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  status: 'aktif' | 'selesai' | 'terlewat';
  dibuat: string;
}

export default function Pengingat() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching reminders
    const mockData: Reminder[] = [
      {
        id: "1",
        judul: "Stok Roti Tawar Menipis",
        deskripsi: "Stok roti tawar tinggal 5 pcs, perlu restock segera",
        tanggal: "2025-07-10",
        waktu: "16:00",
        kategori: 'stok',
        prioritas: 'tinggi',
        status: 'aktif',
        dibuat: "2025-07-10T10:00:00Z"
      },
      {
        id: "2",
        judul: "Pembayaran Supplier",
        deskripsi: "Bayar tagihan supplier bulan ini",
        tanggal: "2025-07-11",
        waktu: "09:00",
        kategori: 'pembayaran',
        prioritas: 'tinggi',
        status: 'aktif',
        dibuat: "2025-07-09T15:30:00Z"
      },
      {
        id: "3",
        judul: "Bersih-bersih Toko",
        deskripsi: "Jadwal bersih-bersih mingguan",
        tanggal: "2025-07-10",
        waktu: "14:00",
        kategori: 'tugas',
        prioritas: 'sedang',
        status: 'selesai',
        dibuat: "2025-07-08T12:00:00Z"
      }
    ];
    
    setTimeout(() => {
      setReminders(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityBadge = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi':
        return <Badge className="bg-red-500 text-white">Tinggi</Badge>;
      case 'sedang':
        return <Badge className="bg-yellow-500 text-white">Sedang</Badge>;
      case 'rendah':
        return <Badge className="bg-green-500 text-white">Rendah</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-blue-500 text-white">Aktif</Badge>;
      case 'selesai':
        return <Badge className="bg-green-500 text-white">Selesai</Badge>;
      case 'terlewat':
        return <Badge className="bg-red-500 text-white">Terlewat</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
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

  const aktifCount = reminders.filter(r => r.status === 'aktif').length;
  const selesaiCount = reminders.filter(r => r.status === 'selesai').length;
  const terlewatCount = reminders.filter(r => r.status === 'terlewat').length;
  const tinggiCount = reminders.filter(r => r.prioritas === 'tinggi' && r.status === 'aktif').length;

  return (
    <div className="p-6 space-y-6">
      {/* New Feature Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white mb-6">
        <div className="flex items-center space-x-3">
          <Bell size={24} />
          <div>
            <h2 className="font-bold">Fitur Baru - Pengingat</h2>
            <p className="text-sm opacity-90">Kelola pengingat dan notifikasi penting</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengingat</h1>
          <p className="text-gray-600">Kelola pengingat dan notifikasi untuk bisnis Anda</p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          <Plus size={16} className="mr-2" />
          Tambah Pengingat
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{aktifCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prioritas Tinggi</p>
                <p className="text-2xl font-bold text-gray-900">{tinggiCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{selesaiCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terlewat</p>
                <p className="text-2xl font-bold text-gray-900">{terlewatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengingat</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Bell className="animate-pulse mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat pengingat...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Belum ada pengingat</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
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
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle size={14} className="mr-1" />
                          Selesai
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
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
    </div>
  );
}
