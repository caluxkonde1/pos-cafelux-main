import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Penjualan from "@/pages/penjualan";
import Produk from "@/pages/produk";
import KelolaProduk from "@/pages/kelola-produk";
import AturStok from "@/pages/atur-stok";
import Stok from "@/pages/stok";
import Diskon from "@/pages/diskon";
import Laporan from "@/pages/laporan";
import Pelanggan from "@/pages/pelanggan";
import Pegawai from "@/pages/pegawai";
import Berlangganan from "@/pages/berlangganan";
import MenungguPembayaran from "@/pages/menunggu-pembayaran";
import Absensi from "@/pages/absensi";
import RiwayatTransaksi from "@/pages/riwayat-transaksi";
import RekapKas from "@/pages/rekap-kas";
import Pengingat from "@/pages/pengingat";
import Inventaris from "@/pages/inventaris";
import PengaturanMeja from "@/pages/pengaturan-meja";
import EnhancedSidebar from "@/components/enhanced-sidebar";
import Header from "@/components/header";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-qasir-bg">
      <EnhancedSidebar />
      <div className="flex-1 lg:ml-72">
        <Header />
        <main className="p-4 lg:p-6 pt-16 lg:pt-6 pb-24 lg:pb-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/menunggu-pembayaran" component={MenungguPembayaran} />
            <Route path="/absensi" component={Absensi} />
            <Route path="/penjualan" component={Penjualan} />
            <Route path="/riwayat-transaksi" component={RiwayatTransaksi} />
            <Route path="/rekap-kas" component={RekapKas} />
            <Route path="/pengingat" component={Pengingat} />
            <Route path="/produk" component={Produk} />
            <Route path="/kelola-produk" component={KelolaProduk} />
            <Route path="/atur-stok" component={AturStok} />
            <Route path="/stok" component={Stok} />
            <Route path="/diskon" component={Diskon} />
            <Route path="/laporan" component={Laporan} />
            <Route path="/pelanggan" component={Pelanggan} />
            <Route path="/pegawai" component={Pegawai} />
            <Route path="/inventaris" component={Inventaris} />
            <Route path="/pengaturan-meja" component={PengaturanMeja} />
            <Route path="/berlangganan" component={Berlangganan} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
