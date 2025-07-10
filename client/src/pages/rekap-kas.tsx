import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle, Eye, Download } from "lucide-react";

interface CashEntry {
  id: string;
  tanggal: string;
  waktu: string;
  jenis: 'masuk' | 'keluar';
  kategori: string;
  deskripsi: string;
  jumlah: number;
  saldo: number;
  kasir: string;
  referensi?: string;
}

export default function RekapKas() {
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterJenis, setFilterJenis] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching cash summary data
    const mockData: CashEntry[] = [
      {
        id: "1",
        tanggal: "2025-07-10",
        waktu: "09:00:00",
        jenis: 'masuk',
        kategori: "Modal Awal",
        deskripsi: "Modal kas awal hari",
        jumlah: 500000,
        saldo: 500000,
        kasir: "Andi Susanto"
      },
      {
        id: "2",
        tanggal: "2025-07-10",
        waktu: "10:30:22",
        jenis: 'masuk',
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 25000,
        saldo: 525000,
        kasir: "Siti Nurhaliza",
        referensi: "T1752132320001"
      },
      {
        id: "3",
        tanggal: "2025-07-10",
        waktu: "11:15:45",
        jenis: 'keluar',
        kategori: "Operasional",
        deskripsi: "Beli gas untuk kompor",
        jumlah: 15000,
        saldo: 510000,
        kasir: "Andi Susanto"
      },
      {
        id: "4",
        tanggal: "2025-07-10",
        waktu: "14:20:10",
        jenis: 'masuk',
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 35000,
        saldo: 545000,
        kasir: "Siti Nurhaliza",
        referensi: "T1752132320004"
      },
      {
        id: "5",
        tanggal: "2025-07-10",
        waktu: "15:45:33",
        jenis: 'keluar',
        kategori: "Gaji",
        deskripsi: "Bonus harian kasir",
        jumlah: 50000,
        saldo: 495000,
        kasir: "Andi Susanto"
      },
      {
        id: "6",
        tanggal: "2025-07-10",
        waktu: "16:30:15",
        jenis: 'masuk',
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 28000,
        saldo: 523000,
        kasir: "Siti Nurhaliza",
        referensi: "T1752132320005"
      }
    ];
    
    setTimeout(() => {
      setCashEntries(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredEntries = cashEntries.filter(entry => {
    const matchesDate = entry.tanggal === selectedDate;
    const matchesJenis = filterJenis === "semua" || entry.jenis === filterJenis;
    return matchesDate && matchesJenis;
  });

  const totalMasuk = filteredEntries
    .filter(entry => entry.jenis === 'masuk')
    .reduce((sum, entry) => sum + entry.jumlah, 0);

  const totalKeluar = filteredEntries
    .filter(entry => entry.jenis === 'keluar')
    .reduce((sum, entry) => sum + entry.jumlah, 0);

  const saldoAkhir = filteredEntries.length > 0 
    ? filteredEntries[filteredEntries.length - 1].saldo 
    : 0;

  const selisih = totalMasuk - totalKeluar;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Kas</h1>
          <p className="text-gray-600">Kelola dan pantau arus kas harian</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            <PlusCircle size={16} className="mr-2" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Masuk</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalMasuk)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Keluar</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalKeluar)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selisih >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Calculator className={selisih >= 0 ? 'text-green-600' : 'text-red-600'} size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selisih</p>
                <p className={`text-lg font-bold ${selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(selisih)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Akhir</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(saldoAkhir)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Cash Flow */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Arus Kas - {new Date(selectedDate).toLocaleDateString('id-ID')}</CardTitle>
            <Select value={filterJenis} onValueChange={setFilterJenis}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Transaksi</SelectItem>
                <SelectItem value="masuk">Kas Masuk</SelectItem>
                <SelectItem value="keluar">Kas Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Calculator className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-gray-500">Memuat data kas...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Belum ada transaksi kas untuk tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        entry.jenis === 'masuk' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {entry.jenis === 'masuk' ? (
                          <PlusCircle className="text-green-600" size={20} />
                        ) : (
                          <MinusCircle className="text-red-600" size={20} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{entry.kategori}</h3>
                          <Badge className={entry.jenis === 'masuk' ? 'bg-green-500' : 'bg-red-500'}>
                            {entry.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{entry.deskripsi}</p>
                        <p className="text-xs text-gray-500">
                          {entry.waktu} • Kasir: {entry.kasir}
                          {entry.referensi && ` • Ref: ${entry.referensi}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        entry.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.jenis === 'masuk' ? '+' : '-'}{formatCurrency(entry.jumlah)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Saldo: {formatCurrency(entry.saldo)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Detail
                        </Button>
                      </div>
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
            <PlusCircle className="mx-auto mb-3 text-green-500" size={32} />
            <h3 className="font-semibold mb-2">Kas Masuk</h3>
            <p className="text-sm text-gray-600">Catat pemasukan kas</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MinusCircle className="mx-auto mb-3 text-red-500" size={32} />
            <h3 className="font-semibold mb-2">Kas Keluar</h3>
            <p className="text-sm text-gray-600">Catat pengeluaran kas</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Calculator className="mx-auto mb-3 text-blue-500" size={32} />
            <h3 className="font-semibold mb-2">Laporan Kas</h3>
            <p className="text-sm text-gray-600">Lihat rekap bulanan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
