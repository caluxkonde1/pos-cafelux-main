import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Download, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import type { z } from "zod";

type ProductFormData = z.infer<typeof insertProductSchema>;

export default function Produk() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produk Ditambahkan",
        description: "Produk baru berhasil ditambahkan ke inventory",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setAddModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Gagal Menambahkan Produk",
        description: "Terjadi kesalahan saat menambahkan produk",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductFormData> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produk Diperbarui",
        description: "Data produk berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditModalOpen(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast({
        title: "Gagal Memperbarui Produk",
        description: "Terjadi kesalahan saat memperbarui produk",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produk Dihapus",
        description: "Produk berhasil dihapus dari inventory",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({
        title: "Gagal Menghapus Produk",
        description: "Terjadi kesalahan saat menghapus produk",
        variant: "destructive",
      });
    },
  });

  const addForm = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      nama: "",
      kode: "",
      kategori: "",
      harga: "",
      stok: 0,
      deskripsi: "",
      gambar: null,
      isActive: true,
    },
  });

  const editForm = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Habis</Badge>;
    } else if (stock < 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Stok Rendah</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Tersedia</Badge>;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.kode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.kategori === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (data: ProductFormData) => {
    addProductMutation.mutate(data);
  };

  const handleEditProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      nama: product.nama,
      kode: product.kode,
      kategori: product.kategori,
      harga: product.harga,
      stok: product.stok,
      deskripsi: product.deskripsi || "",
      gambar: product.gambar,
      isActive: product.isActive,
    });
    setEditModalOpen(true);
  };

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stok < 10 && p.stok > 0).length;
  const outOfStockProducts = products.filter(p => p.stok === 0).length;

  return (
    <div className="space-y-6">
      <Header 
        title="Produk" 
        subtitle="Kelola inventory dan data produk toko Anda" 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Total Produk</p>
                <p className="text-2xl font-bold text-qasir-text">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Stok Rendah</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-yellow-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-qasir-text-light text-sm">Stok Habis</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-qasir-text">Daftar Produk</CardTitle>
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-qasir-red hover:bg-red-600">
                  <Plus className="mr-2" size={16} />
                  Tambah Produk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Produk Baru</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddProduct)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Produk</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama produk" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="kode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kode Produk</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan kode produk" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
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
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.nama}>
                                  {category.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="harga"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Masukkan harga" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="stok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stok</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Masukkan jumlah stok" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="deskripsi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Masukkan deskripsi produk" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={addProductMutation.isPending}>
                        {addProductMutation.isPending ? "Menyimpan..." : "Simpan"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama atau kode produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.nama}>
                    {category.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2" size={16} />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Export
            </Button>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-qasir-text-light">
                        <Package className="mx-auto mb-2" size={32} />
                        <p>Tidak ada produk ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.kode}</TableCell>
                      <TableCell>{product.nama}</TableCell>
                      <TableCell>{product.kategori}</TableCell>
                      <TableCell>{formatCurrency(product.harga)}</TableCell>
                      <TableCell>{product.stok}</TableCell>
                      <TableCell>{getStockBadge(product.stok)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditProduct)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama produk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan kode produk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.nama}>
                            {category.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="harga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Masukkan harga" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="stok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Masukkan jumlah stok" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan deskripsi produk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
