import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import Header from "@/components/header";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: PlanFeature[];
  isPopular?: boolean;
  buttonText: string;
  description: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "IDR",
    interval: "selamanya",
    description: "Gratis!",
    buttonText: "Mulai Berlangganan",
    features: [
      { name: "Sistem kasir POS", included: true },
      { name: "Terima semua jenis pembayaran digital dengan QRIS", included: true },
      { name: "Dapat melakukan scan produk dengan mudah", included: true },
      { name: "Laporan dasar penjualan dengan rentang tanggal 30 hari", included: true },
      { name: "Kelola 50 produk", included: true },
      { name: "Mengelola 1 outlet", included: true },
      { name: "Pantau 2 pegawai", included: true },
      { name: "Sistem kasir POS", included: false },
      { name: "Analisis usaha dengan laporan penjualan lebih lengkap", included: false },
      { name: "Periode akses laporan sesuai masa aktivasi langganan", included: false },
      { name: "Kelola lebih dari 50 produk tentang batas", included: false },
      { name: "Lebih cuan dengan jual produk lebih banyak", included: false },
      { name: "Kelola diskon", included: false },
      { name: "Export produk", included: false },
      { name: "Pajak per produk", included: false },
      { name: "Pantau pegawai tak terbatas", included: false },
      { name: "Otomasis pegawai", included: false },
      { name: "Dan lain-lain", included: false },
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 57577,
    currency: "IDR",
    interval: "bulan",
    description: "Terpilih",
    buttonText: "Mulai Berlangganan",
    isPopular: true,
    features: [
      { name: "Sistem kasir POS", included: true },
      { name: "Analisis usaha dengan laporan penjualan lebih lengkap", included: true },
      { name: "Periode akses laporan sesuai masa aktivasi langganan", included: true },
      { name: "Kelola lebih dari jual produk (bentuk) batas tambahan", included: true },
      { name: "Lebih cuan dengan jual produk lebih banyak", included: true },
      { name: "Kelola diskon", included: true },
      { name: "Export produk", included: true },
      { name: "Pajak per produk", included: true },
      { name: "Pantau pegawai tak terbatas", included: true },
      { name: "Otomasis pegawai", included: true },
      { name: "Dan lain-lain", included: true },
    ]
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    price: 2154,
    currency: "IDR",
    interval: "bulan",
    description: "Tersingkat per outlet",
    buttonText: "Mulai Berlangganan",
    features: [
      { name: "Sistem kasir POS", included: true },
      { name: "Analisis usaha dengan laporan penjualan lebih lengkap", included: true },
      { name: "Periode akses laporan sesuai masa aktivasi langganan", included: true },
      { name: "Kelola lebih dari jual produk (bentuk) batas tambahan", included: true },
      { name: "Lebih cuan dengan jual produk lebih banyak", included: true },
      { name: "Kelola lebih baku", included: true },
      { name: "Lebih cuan dengan jual produk lebih banyak", included: true },
      { name: "Kelola diskon", included: true },
      { name: "Dan lain-lain", included: true },
      { name: "Plus fitur:", included: true },
      { name: "Api kassa di struk", included: true },
      { name: "Track pesanan langganan terdepat ke dapur", included: true },
      { name: "Catatan pembarangan struk", included: true },
      { name: "Catat uang PO pesanan", included: true },
      { name: "Monitor analisis pesanan", included: true },
      { name: "Label berdaasarkan tipe pembayaran", included: true },
      { name: "Branding logo usaha di struk", included: true },
      { name: "Kelola bundel", included: true },
      { name: "Pengingat kedaluwarsa produk", included: true },
      { name: "Kelola harga grosir", included: true },
      { name: "Dan lain-lain", included: true },
    ]
  }
];

export default function Berlangganan() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would implement the actual subscription logic
    console.log(`Subscribing to plan: ${planId}`);
  };

  return (
    <div className="p-6">
      <Header 
        title="Langganan Qasir Pro" 
        subtitle="Pilih paket berlangganan yang sesuai dengan kebutuhan bisnis Anda"
      />

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.isPopular ? 'border-qasir-red ring-2 ring-qasir-red/20' : 'border-gray-200'}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-qasir-red text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.description}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  {plan.id === "free" && <Zap className="w-6 h-6 text-gray-500 mr-2" />}
                  {plan.id === "pro" && <Crown className="w-6 h-6 text-qasir-red mr-2" />}
                  {plan.id === "pro_plus" && <Star className="w-6 h-6 text-yellow-500 mr-2" />}
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                </div>
                
                {!plan.isPopular && plan.id !== "free" && (
                  <p className="text-sm text-gray-600">{plan.description}</p>
                )}
                
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold text-qasir-red">
                      Gratis!
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-500">Hanya</div>
                      <div className="text-3xl font-bold text-qasir-red">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-gray-500">/{plan.interval}</div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full mb-6 ${
                    plan.isPopular 
                      ? 'bg-qasir-red hover:bg-qasir-red/90 text-white' 
                      : plan.id === "free"
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Semua paket berlangganan sudah termasuk dukungan teknis 24/7 dan pembaruan otomatis.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Batalkan kapan saja tanpa biaya tambahan.
          </p>
        </div>
      </div>
    </div>
  );
}