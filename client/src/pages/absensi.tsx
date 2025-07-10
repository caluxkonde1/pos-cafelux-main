import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Users, Calendar, MapPin, Camera, CheckCircle, XCircle, Crown } from "lucide-react";

interface AttendanceRecord {
  id: string;
  pegawaiId: string;
  nama: string;
  jabatan: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar?: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
  lokasi: string;
  foto?: string;
}

export default function Absensi() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching attendance data
    const mockData: AttendanceRecord[] = [
      {
        id: "1",
        pegawaiId: "PGW001",
        nama: "Andi Susanto",
        jabatan: "Kasir",
        tanggal: "2025-07-10",
        jamMasuk: "08:00",
        jamKeluar: "17:00",
        status: 'hadir',
        lokasi: "Toko Utama",
        foto: "/api/placeholder/40/40"
      },
      {
        id: "2",
        pegawaiId: "PGW002", 
        nama: "Siti Nurhaliza",
        jabatan: "Barista",
        tanggal: "2025-07-10",
        jamMasuk: "08:15",
        status: 'terlambat',
        lokasi: "Toko Utama",
        foto: "/api/placeholder/40/40"
      },
      {
        id: "3",
        pegawaiId: "PGW003",
        nama: "Budi Santoso", 
        jabatan: "Supervisor",
        tanggal: "2025-07-10",
        jamMasuk: "07:45",
        jamKeluar: "18:00",
        status: 'hadir',
        lokasi: "Toko Utama",
        foto: "/api/placeholder/40/40"
      }
    ];
    
    setTimeout(() => {
      setAttendanceRecords(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir':
        return <Badge className="bg-green-500 text-white">Hadir</Badge>;
      case 'terlambat':
        return <Badge className="bg-yellow-500 text-white">Terlambat</Badge>;
      case 'izin':
        return <Badge className="bg-blue-500 text-white">Izin</Badge>;
      case 'sakit':
        return <Badge className="bg-orange-500 text-white">Sakit</Badge>;
      case 'alpha':
        return <Badge className="bg-red-500 text-white">Alpha</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const hadirCount = attendanceRecords.filter(r => r.status === 'hadir').length;
  const terlambatCount = attendanceRecords.filter(r => r.status === 'terlambat').length;
  const izinCount = attendanceRecords.filter(r => r.status === 'izin').length;
  const alphaCount = attendanceRecords.filter(r => r.status === 'alpha').length;

  return (
    <div className="p-6 space-y-6">
      {/* PRO Feature Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white mb-6">
        <div className="flex items-center space-x-3">
          <Crown size={24} />
          <div>
            <h2 className="font-bold">Fitur PRO - Manajemen Absensi</h2>
            <p className="text-sm opacity-90">Kelola kehadiran pegawai dengan fitur lengkap</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absensi Pegawai</h1>
          <p className="text-gray-600">Kelola kehadiran dan jam kerja pegawai</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            <Camera size={16} className="mr-2" />
            Absen Sekarang
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-gray-900">{hadirCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-gray-900">{terlambatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Izin</p>
                <p className="text-2xl font-bold text-gray-900">{izinCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alpha</p>
                <p className="text-2xl font-bold text-gray-900">{alphaCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>Daftar Absensi - {new Date(selectedDate).toLocaleDateString('id-ID')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Clock className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat data absensi...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Belum ada data absensi untuk tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={record.foto || "/api/placeholder/40/40"}
                        alt={record.nama}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.nama}</h3>
                        <p className="text-sm text-gray-500">{record.jabatan} • {record.pegawaiId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Jam Masuk</p>
                        <p className="font-medium">{record.jamMasuk}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Jam Keluar</p>
                        <p className="font-medium">{record.jamKeluar || '-'}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Lokasi</p>
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} className="text-gray-400" />
                          <p className="font-medium text-sm">{record.lokasi}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Status</p>
                        {getStatusBadge(record.status)}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Camera className="mx-auto mb-3 text-blue-500" size={32} />
            <h3 className="font-semibold mb-2">Absen Masuk</h3>
            <p className="text-sm text-gray-600">Catat kehadiran dengan foto</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-3 text-green-500" size={32} />
            <h3 className="font-semibold mb-2">Absen Keluar</h3>
            <p className="text-sm text-gray-600">Catat jam pulang kerja</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto mb-3 text-purple-500" size={32} />
            <h3 className="font-semibold mb-2">Laporan Absensi</h3>
            <p className="text-sm text-gray-600">Lihat rekap kehadiran</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
