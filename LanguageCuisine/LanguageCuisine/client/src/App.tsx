import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Penjualan from "@/pages/penjualan";
import Produk from "@/pages/produk";
import Laporan from "@/pages/laporan";
import Pelanggan from "@/pages/pelanggan";
import Pegawai from "@/pages/pegawai";
import Berlangganan from "@/pages/berlangganan";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-qasir-bg">
      <Sidebar />
      <div className="flex-1 lg:ml-72">
        <Header />
        <main className="p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/penjualan" component={Penjualan} />
            <Route path="/produk" component={Produk} />
            <Route path="/laporan" component={Laporan} />
            <Route path="/pelanggan" component={Pelanggan} />
            <Route path="/pegawai" component={Pegawai} />
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
