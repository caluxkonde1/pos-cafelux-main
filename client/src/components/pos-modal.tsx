import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Search, Trash2, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Customer } from "@shared/schema";

interface POSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSModal({ open, onOpenChange }: POSModalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "kartu" | "ewallet" | "qris">("tunai");
  const [cashAmount, setCashAmount] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: open,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest("POST", "/api/transactions", transactionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaksi Berhasil",
        description: "Transaksi penjualan telah berhasil dicatat",
      });
      setCart([]);
      setSelectedCustomer(null);
      setCashAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Transaksi Gagal",
        description: "Terjadi kesalahan saat memproses transaksi",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stok) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, item.product.stok) }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.harga) * item.quantity), 0);
  const pajak = subtotal * 0.1; // 10% tax
  const total = subtotal + pajak;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "tunai" && (!cashAmount || parseFloat(cashAmount) < total)) {
      toast({
        title: "Pembayaran Tidak Cukup",
        description: "Jumlah uang tunai harus lebih besar atau sama dengan total",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      transaction: {
        customerId: selectedCustomer?.id || null,
        kasirId: 1, // Default admin user
        subtotal: subtotal.toString(),
        pajak: pajak.toString(),
        diskon: "0",
        total: total.toString(),
        metodePembayaran: paymentMethod,
        status: "completed",
      },
      items: cart.map(item => ({
        productId: item.product.id,
        namaProduk: item.product.nama,
        harga: item.product.harga,
        jumlah: item.quantity,
        subtotal: (parseFloat(item.product.harga) * item.quantity).toString(),
      })),
    };

    createTransactionMutation.mutate(transactionData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-qasir-text">Kasir POS</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
          {/* Products Section */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari produk atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-96">
              {filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{product.nama}</h4>
                      <p className="text-xs text-gray-500">{product.kode}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-qasir-red">{formatCurrency(parseFloat(product.harga))}</span>
                        <Badge variant={product.stok > 0 ? "secondary" : "destructive"}>
                          {product.stok > 0 ? `Stok: ${product.stok}` : "Habis"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart and Checkout Section */}
          <div className="space-y-4">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keranjang Belanja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Keranjang masih kosong</p>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.nama}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(parseFloat(item.product.harga))}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "tunai", label: "Tunai", icon: Banknote },
                    { id: "kartu", label: "Kartu", icon: CreditCard },
                    { id: "ewallet", label: "E-Wallet", icon: Smartphone },
                    { id: "qris", label: "QRIS", icon: Smartphone },
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <Button
                        key={method.id}
                        variant={paymentMethod === method.id ? "default" : "outline"}
                        className="flex items-center space-x-2"
                        onClick={() => setPaymentMethod(method.id as any)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{method.label}</span>
                      </Button>
                    );
                  })}
                </div>
                
                {paymentMethod === "tunai" && (
                  <div className="mt-3">
                    <Input
                      type="number"
                      placeholder="Jumlah uang tunai"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                    {cashAmount && parseFloat(cashAmount) >= total && (
                      <p className="text-sm text-green-600 mt-1">
                        Kembalian: {formatCurrency(parseFloat(cashAmount) - total)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total and Checkout */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (10%)</span>
                    <span>{formatCurrency(pajak)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-qasir-red">{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full mt-4 bg-qasir-red hover:bg-red-600"
                  onClick={handleCheckout}
                  disabled={createTransactionMutation.isPending}
                >
                  {createTransactionMutation.isPending ? "Memproses..." : "Proses Pembayaran"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
