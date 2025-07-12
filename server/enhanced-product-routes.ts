import { Router } from "express";
import { db } from "./db";
import { products, categories, productVariants, productImages, brands } from "../shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

const router = Router();

// Get all brands
router.get("/brands", async (req, res) => {
  try {
    const allBrands = await db.select().from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.nama));
    res.json(allBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: "Failed to fetch brands" });
  }
});

// Create new brand
router.post("/brands", async (req, res) => {
  try {
    const { nama, deskripsi, logo } = req.body;
    
    if (!nama) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const [newBrand] = await db.insert(brands).values({
      nama,
      deskripsi,
      logo,
      isActive: true,
    }).returning();

    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ message: "Failed to create brand" });
  }
});

// Enhanced product creation with variants and images
router.post("/products/enhanced", async (req, res) => {
  try {
    const {
      nama,
      kode,
      barcode,
      kategoriId,
      kategori,
      harga,
      hargaBeli,
      stok,
      stokMinimal,
      satuan,
      deskripsi,
      gambar,
      pajak,
      diskonMaksimal,
      brandId,
      isProdukFavorit,
      variants,
      images,
      wholesalePrice,
      wholesaleMinQty,
    } = req.body;

    if (!nama || !harga || !kategoriId) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    // Create the main product
    const [newProduct] = await db.insert(products).values({
      nama,
      kode: kode || `PRD${Date.now()}`,
      barcode,
      kategoriId,
      kategori,
      harga: parseFloat(harga),
      hargaBeli: hargaBeli ? parseFloat(hargaBeli) : null,
      stok: parseInt(stok) || 0,
      stokMinimal: parseInt(stokMinimal) || 5,
      satuan: satuan || "pcs",
      deskripsi,
      gambar,
      pajak: parseFloat(pajak) || 0,
      diskonMaksimal: parseFloat(diskonMaksimal) || 0,
      brandId: brandId ? parseInt(brandId) : null,
      isProdukFavorit: isProdukFavorit || false,
      hasVariants: variants && variants.length > 0,
      primaryImageUrl: gambar,
      wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
      wholesaleMinQty: wholesaleMinQty ? parseInt(wholesaleMinQty) : 1,
      isActive: true,
    }).returning();

    // Create product variants if provided
    if (variants && variants.length > 0) {
      const variantData = variants.map((variant: any) => ({
        productId: newProduct.id,
        nama: variant.name,
        harga: parseFloat(variant.price),
        hargaBeli: variant.hargaBeli ? parseFloat(variant.hargaBeli) : null,
        stok: parseInt(variant.stock) || 0,
        stokMinimal: parseInt(variant.stokMinimal) || 5,
        barcode: variant.barcode,
        sku: variant.sku || `${newProduct.kode}-${variant.name.replace(/\s+/g, '-').toLowerCase()}`,
        isActive: true,
      }));

      await db.insert(productVariants).values(variantData);
    }

    // Create product images if provided
    if (images && images.length > 0) {
      const imageData = images.map((image: any, index: number) => ({
        productId: newProduct.id,
        imageUrl: image.url,
        imageName: image.name,
        imageSize: image.size,
        isPrimary: index === 0,
        sortOrder: index,
      }));

      await db.insert(productImages).values(imageData);
    } else if (gambar) {
      // Create single image record for the main product image
      await db.insert(productImages).values({
        productId: newProduct.id,
        imageUrl: gambar,
        imageName: `${nama}-main-image`,
        isPrimary: true,
        sortOrder: 0,
      });
    }

    // Fetch the complete product with relations
    const completeProduct = await db
      .select({
        id: products.id,
        nama: products.nama,
        kode: products.kode,
        barcode: products.barcode,
        kategori: products.kategori,
        harga: products.harga,
        hargaBeli: products.hargaBeli,
        stok: products.stok,
        stokMinimal: products.stokMinimal,
        satuan: products.satuan,
        deskripsi: products.deskripsi,
        gambar: products.gambar,
        pajak: products.pajak,
        diskonMaksimal: products.diskonMaksimal,
        isProdukFavorit: products.isProdukFavorit,
        hasVariants: products.hasVariants,
        brandName: brands.nama,
        categoryName: categories.nama,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.kategoriId, categories.id))
      .where(eq(products.id, newProduct.id))
      .limit(1);

    res.status(201).json(completeProduct[0]);
  } catch (error) {
    console.error("Error creating enhanced product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// Get product with variants and images
router.get("/products/:id/complete", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Get main product
    const [product] = await db
      .select({
        id: products.id,
        nama: products.nama,
        kode: products.kode,
        barcode: products.barcode,
        kategori: products.kategori,
        harga: products.harga,
        hargaBeli: products.hargaBeli,
        stok: products.stok,
        stokMinimal: products.stokMinimal,
        satuan: products.satuan,
        deskripsi: products.deskripsi,
        gambar: products.gambar,
        pajak: products.pajak,
        diskonMaksimal: products.diskonMaksimal,
        isProdukFavorit: products.isProdukFavorit,
        hasVariants: products.hasVariants,
        wholesalePrice: products.wholesalePrice,
        wholesaleMinQty: products.wholesaleMinQty,
        brandId: products.brandId,
        brandName: brands.nama,
        categoryName: categories.nama,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.kategoriId, categories.id))
      .where(eq(products.id, productId));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get product variants
    const variants = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.nama));

    // Get product images
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

    const completeProduct = {
      ...product,
      variants,
      images,
    };

    res.json(completeProduct);
  } catch (error) {
    console.error("Error fetching complete product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Get products with enhanced data
router.get("/products/enhanced", async (req, res) => {
  try {
    const { kategori, brand, favorit, hasVariants, limit = 50, offset = 0 } = req.query;

    let query = db
      .select({
        id: products.id,
        nama: products.nama,
        kode: products.kode,
        barcode: products.barcode,
        kategori: products.kategori,
        harga: products.harga,
        hargaBeli: products.hargaBeli,
        stok: products.stok,
        stokMinimal: products.stokMinimal,
        satuan: products.satuan,
        deskripsi: products.deskripsi,
        gambar: products.gambar,
        pajak: products.pajak,
        diskonMaksimal: products.diskonMaksimal,
        isProdukFavorit: products.isProdukFavorit,
        hasVariants: products.hasVariants,
        brandName: brands.nama,
        categoryName: categories.nama,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.kategoriId, categories.id))
      .where(eq(products.isActive, true));

    // Apply filters
    if (kategori) {
      query = query.where(eq(products.kategori, kategori as string));
    }
    if (brand) {
      query = query.where(eq(products.brandId, parseInt(brand as string)));
    }
    if (favorit === 'true') {
      query = query.where(eq(products.isProdukFavorit, true));
    }
    if (hasVariants === 'true') {
      query = query.where(eq(products.hasVariants, true));
    }

    const enhancedProducts = await query
      .orderBy(desc(products.isProdukFavorit), desc(products.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(enhancedProducts);
  } catch (error) {
    console.error("Error fetching enhanced products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Update product variants
router.put("/products/:id/variants", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { variants } = req.body;

    // Delete existing variants
    await db.delete(productVariants).where(eq(productVariants.productId, productId));

    // Insert new variants
    if (variants && variants.length > 0) {
      const variantData = variants.map((variant: any) => ({
        productId,
        nama: variant.name,
        harga: parseFloat(variant.price),
        hargaBeli: variant.hargaBeli ? parseFloat(variant.hargaBeli) : null,
        stok: parseInt(variant.stock) || 0,
        stokMinimal: parseInt(variant.stokMinimal) || 5,
        barcode: variant.barcode,
        sku: variant.sku,
        isActive: true,
      }));

      await db.insert(productVariants).values(variantData);

      // Update product to indicate it has variants
      await db.update(products)
        .set({ hasVariants: true, updatedAt: new Date() })
        .where(eq(products.id, productId));
    } else {
      // Update product to indicate it has no variants
      await db.update(products)
        .set({ hasVariants: false, updatedAt: new Date() })
        .where(eq(products.id, productId));
    }

    res.json({ message: "Product variants updated successfully" });
  } catch (error) {
    console.error("Error updating product variants:", error);
    res.status(500).json({ message: "Failed to update product variants" });
  }
});

// Upload product image
router.post("/products/:id/images", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { imageUrl, imageName, imageSize, isPrimary } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // If this is set as primary, update other images to not be primary
    if (isPrimary) {
      await db.update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, productId));
    }

    // Get the next sort order
    const existingImages = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    const sortOrder = existingImages.length;

    const [newImage] = await db.insert(productImages).values({
      productId,
      imageUrl,
      imageName: imageName || `product-${productId}-image-${sortOrder + 1}`,
      imageSize: imageSize || null,
      isPrimary: isPrimary || existingImages.length === 0,
      sortOrder,
    }).returning();

    // Update product primary image if this is the primary image
    if (isPrimary || existingImages.length === 0) {
      await db.update(products)
        .set({ 
          primaryImageUrl: imageUrl,
          gambar: imageUrl,
          updatedAt: new Date() 
        })
        .where(eq(products.id, productId));
    }

    res.status(201).json(newImage);
  } catch (error) {
    console.error("Error uploading product image:", error);
    res.status(500).json({ message: "Failed to upload product image" });
  }
});

// Delete product image
router.delete("/products/:productId/images/:imageId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const imageId = parseInt(req.params.imageId);

    // Get the image to be deleted
    const [imageToDelete] = await db
      .select()
      .from(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));

    if (!imageToDelete) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete the image
    await db.delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));

    // If this was the primary image, set another image as primary
    if (imageToDelete.isPrimary) {
      const [nextImage] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.sortOrder))
        .limit(1);

      if (nextImage) {
        await db.update(productImages)
          .set({ isPrimary: true })
          .where(eq(productImages.id, nextImage.id));

        await db.update(products)
          .set({ 
            primaryImageUrl: nextImage.imageUrl,
            gambar: nextImage.imageUrl,
            updatedAt: new Date() 
          })
          .where(eq(products.id, productId));
      } else {
        // No more images, clear the primary image
        await db.update(products)
          .set({ 
            primaryImageUrl: null,
            gambar: null,
            updatedAt: new Date() 
          })
          .where(eq(products.id, productId));
      }
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({ message: "Failed to delete product image" });
  }
});

export default router;
