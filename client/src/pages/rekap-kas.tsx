import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle, Eye, Download, FileText, BarChart3 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/hooks/use-permissions";

interface CashEntry {
  id: number;
  tanggal: string;
  waktu: string;
  jenis: 'masuk' | 'keluar';
  kategori: string;
  deskripsi: string;
  jumlah: number;
  saldo: number;
  kasir: string;
  referensi?: string;
  createdAt: string;
}

const cashEntrySchema = z.object({
  jenis: z.enum(['masuk', 'keluar']),
  kategori: z.string().min(1, "Kategori harus diisi"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  jumlah: z.number().min(1, "Jumlah harus lebih dari 0"),
  referensi: z.string().optional(),
});

type CashEntryForm = z.infer<typeof cashEntrySchema>;

export default function RekapKas() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterJenis, setFilterJenis] = useState("semua");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedJenis, setSelectedJenis] = useState<'masuk' | 'keluar'>('masuk');

  const queryClient = useQueryClient();
  const { currentUser } = usePermissions();

  const { data: cashEntries = [], isLoading } = useQuery<CashEntry[]>({
    queryKey: ["/api/cash-entries", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/cash-entries?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch cash entries');
      return response.json();
    }
  });

  const form = useForm<CashEntryForm>({
    resolver: zodResolver(cashEntrySchema),
    defaultValues: {
      jenis: 'masuk',
      kategori: '',
      deskripsi: '',
      jumlah: 0,
      referensi: '',
    },
  });

  const addCashEntryMutation = useMutation({
    mutationFn: async (data: CashEntryForm) => {
      const response = await fetch('/api/cash-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          kasir: currentUser?.username || 'Unknown'
        }),
      });
      if (!response.ok) throw new Error('Failed to add cash entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-entries"] });
      setAddModalOpen(false);
      form.reset();
      alert('Transaksi kas berhasil ditambahkan!');
    },
    onError: (error) => {
      console.error('Add cash entry error:', error);
      alert('Gagal menambahkan transaksi kas');
    }
  });

  const handleExportCash = async () => {
    try {
      // Generate CSV content from filtered entries
      const csvContent = generateCashCSV(filteredEntries);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-kas-${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Data kas berhasil diexport!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data');
    }
  };

  const generateCashCSV = (data: CashEntry[]) => {
    const headers = [
      'Tanggal',
      'Waktu',
      'Jenis',
      'Kategori',
      'Deskripsi',
      'Jumlah',
      'Saldo',
      'Kasir',
      'Referensi'
    ];
    
    const csvRows = [
      headers.join(','),
      ...data.map(entry => [
        new Date(entry.createdAt).toLocaleDateString('id-ID'),
        new Date(entry.createdAt).toLocaleTimeString('id-ID'),
        entry.jenis === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
        entry.kategori,
        entry.deskripsi,
        entry.jumlah,
        entry.saldo,
        entry.kasir,
        entry.referensi || ''
      ].join(','))
    ];
    
    return csvRows.join('\n');
  };

  const handleAddCashEntry = (jenis: 'masuk' | 'keluar') => {
    setSelectedJenis(jenis);
    form.setValue('jenis', jenis);
    form.reset({
      jenis,
      kategori: '',
      deskripsi: '',
      jumlah: 0,
      referensi: '',
    });
    setAddModalOpen(true);
  };

  const handleShowReport = () => {
    setReportModalOpen(true);
  };

  const onSubmit = (data: CashEntryForm) => {
    addCashEntryMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredEntries = cashEntries.filter(entry => {
    const matchesJenis = filterJenis === "semua" || entry.jenis === filterJenis;
    return matchesJenis;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Kas</h1>
          <p className="text-gray-600">Kelola dan pantau arus kas harian</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCash}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => handleAddCashEntry('masuk')}
          >
            <PlusCircle size={16} className="mr-2" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Masuk</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMasuk)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Keluar</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalKeluar)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Selisih</p>
                <p className={`text-2xl font-bold ${selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(selisih)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selisih >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Calculator className={selisih >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Saldo Akhir</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(saldoAkhir)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              Arus Kas - {new Date(selectedDate).toLocaleDateString('id-ID')}
            </CardTitle>
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
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
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
                          <Badge className={entry.jenis === 'masuk' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {entry.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{entry.deskripsi}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleTimeString('id-ID')} • Kasir: {entry.kasir}
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
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleAddCashEntry('masuk')}
        >
          <CardContent className="p-6 text-center">
            <PlusCircle className="mx-auto mb-3 text-green-500" size={32} />
            <h3 className="font-semibold mb-2">Tambah Transaksi</h3>
            <p className="text-sm text-gray-600">Catat pemasukan kas</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleAddCashEntry('keluar')}
        >
          <CardContent className="p-6 text-center">
            <MinusCircle className="mx-auto mb-3 text-red-500" size={32} />
            <h3 className="font-semibold mb-2">Kas Keluar</h3>
            <p className="text-sm text-gray-600">Catat pengeluaran kas</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleShowReport}
        >
          <CardContent className="p-6 text-center">
            <BarChart3 className="mx-auto mb-3 text-blue-500" size={32} />
            <h3 className="font-semibold mb-2">Laporan Kas</h3>
            <p className="text-sm text-gray-600">Lihat rekap bulanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Cash Entry Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Tambah {selectedJenis === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="jenis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Transaksi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masuk">Kas Masuk</SelectItem>
                        <SelectItem value="keluar">Kas Keluar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {selectedJenis === 'masuk' ? (
                          <>
                            <SelectItem value="Modal Awal">Modal Awal</SelectItem>
                            <SelectItem value="Penjualan">Penjualan</SelectItem>
                            <SelectItem value="Piutang">Piutang</SelectItem>
                            <SelectItem value="Lain-lain">Lain-lain</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Operasional">Operasional</SelectItem>
                            <SelectItem value="Gaji">Gaji</SelectItem>
                            <SelectItem value="Pembelian">Pembelian</SelectItem>
                            <SelectItem value="Sewa">Sewa</SelectItem>
                            <SelectItem value="Listrik">Listrik</SelectItem>
                            <SelectItem value="Lain-lain">Lain-lain</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
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
                        placeholder="Masukkan deskripsi transaksi"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jumlah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referensi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referensi (Opsional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nomor referensi atau keterangan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddModalOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCashEntryMutation.isPending}
                >
                  {addCashEntryMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Laporan Kas Bulanan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select defaultValue={new Date().getMonth().toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Januari</SelectItem>
                    <SelectItem value="1">Februari</SelectItem>
                    <SelectItem value="2">Maret</SelectItem>
                    <SelectItem value="3">April</SelectItem>
                    <SelectItem value="4">Mei</SelectItem>
                    <SelectItem value="5">Juni</SelectItem>
                    <SelectItem value="6">Juli</SelectItem>
                    <SelectItem value="7">Agustus</SelectItem>
                    <SelectItem value="8">September</SelectItem>
                    <SelectItem value="9">Oktober</SelectItem>
                    <SelectItem value="10">November</SelectItem>
                    <SelectItem value="11">Desember</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select defaultValue={new Date().getFullYear().toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Ringkasan Bulanan</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Pemasukan</p>
                  <p className="font-semibold text-green-600">{formatCurrency(totalMasuk)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Pengeluaran</p>
                  <p className="font-semibold text-red-600">{formatCurrency(totalKeluar)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Selisih</p>
                  <p className={`font-semibold ${selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selisih)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Saldo Akhir</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(saldoAkhir)}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handleExportCash}>
              <Download className="mr-2" size={16} />
              Export Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
