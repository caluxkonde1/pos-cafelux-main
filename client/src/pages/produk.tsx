import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProdukPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id.toString());
      }
    }
    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    async function fetchProducts() {
      let query = supabase.from("products").select("*").order("nama");
      if (searchTerm) {
        query = query.ilike("nama", `%${searchTerm}%`);
      }
      if (favoriteOnly) {
        query = query.eq("is_favorite", true);
      }
      if (activeCategory) {
        query = query.eq("kategoriId", parseInt(activeCategory));
      }
      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
    }
    fetchProducts();
  }, [searchTerm, favoriteOnly, activeCategory]);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">Produk</h1>

      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Cari Produk"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button
          variant={favoriteOnly ? "default" : "outline"}
          onClick={() => setFavoriteOnly(!favoriteOnly)}
        >
          Favorit
        </Button>
      </div>

      <Tabs
        value={activeCategory || undefined}
        onValueChange={(value) => setActiveCategory(value)}
      >
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id.toString()}>
              {cat.nama}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id.toString()}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products
                .filter((p) => p.kategoriId === cat.id)
                .map((product) => (
                  <div
                    key={product.id}
                    className="border rounded p-4 flex flex-col space-y-2"
                  >
                    <div className="font-semibold">{product.nama}</div>
                    <div>Harga: Rp{product.harga.toLocaleString()}</div>
                    <div>Stok: {product.stok}</div>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
