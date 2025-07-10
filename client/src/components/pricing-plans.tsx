import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Gratis",
    price: "Rp 0",
    period: "/bulan",
    description: "Untuk bisnis kecil yang baru memulai",
    features: [
      "Sistem kasir POS",
      "Laporan penjualan basic",
      "Manajemen produk",
      "1 Outlet",
      "Transaksi unlimited",
    ],
    buttonText: "Paket Saat Ini",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "Rp 577",
    period: "/bulan",
    description: "Untuk bisnis yang ingin bertumbuh",
    features: [
      "Semua fitur Gratis",
      "Laporan penjualan lengkap",
      "Manajemen pelanggan",
      "Integrasi QRIS",
      "5 Outlet",
      "API akses",
      "Support prioritas",
    ],
    buttonText: "Mulai Berlangganan",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Pro Plus",
    price: "Rp 2.154",
    period: "/bulan",
    description: "Untuk bisnis enterprise",
    features: [
      "Semua fitur Pro",
      "Analitik bisnis advanced",
      "Website usaha gratis",
      "API integrasi penuh",
      "Unlimited Outlet",
      "Custom branding",
      "Dedicated support",
      "Multi warehouse",
    ],
    buttonText: "Mulai Berlangganan",
    buttonVariant: "default" as const,
    popular: false,
  },
];

export default function PricingPlans() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-qasir-text mb-2">Paket Berlangganan</h3>
        <p className="text-qasir-text-light">Pilih paket yang sesuai dengan kebutuhan bisnis Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={plan.name}
            className={`relative hover:shadow-lg transition-shadow ${
              plan.popular ? "border-2 border-qasir-red" : "border border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-qasir-red text-white px-4 py-1">Terpopuler</Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-center">
                <h4 className="text-lg font-semibold text-qasir-text mb-2">{plan.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-qasir-text">{plan.price}</span>
                  <span className="text-qasir-text-light">{plan.period}</span>
                </div>
                <p className="text-sm text-qasir-text-light">{plan.description}</p>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button
                variant={plan.buttonVariant}
                className={`w-full ${
                  plan.buttonVariant === "default" 
                    ? "bg-qasir-red hover:bg-red-600" 
                    : "border-qasir-red text-qasir-red hover:bg-qasir-red hover:text-white"
                }`}
              >
                {plan.buttonText}
              </Button>
              
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-qasir-text">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
