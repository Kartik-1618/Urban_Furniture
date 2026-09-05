"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface Product {
  id: number;
  sku: string;
  name: string;
  sales_price: number;
  stock_qty: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/products/", {
        sku, 
        name, 
        sales_price: parseFloat(price), 
        stock_qty: parseInt(stock, 10)
      });
      setOpen(false);
      setSku("");
      setName("");
      setPrice("");
      setStock("");
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Error creating product");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Goods and services catalogue</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003B95] hover:bg-[#003B95]/90 text-white rounded-md px-6 shadow-sm">Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" required value={sku} onChange={e => setSku(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Sales Price</Label>
                  <Input id="price" type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Qty</Label>
                  <Input id="stock" type="number" required value={stock} onChange={e => setStock(e.target.value)} />
                </div>
              </div>
            <Button type="submit" className="w-full bg-[#003B95] hover:bg-[#003B95]/90">Save Product</Button>
          </form>
        </DialogContent>
      </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="p-4 border-b">
           <Input placeholder="Search products" className="max-w-md bg-transparent" />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Name</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Type</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Sales Price</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Cost</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-[#003B95]">{product.name}</TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
                    {product.type === 'goods' ? 'Goods' : 'Service'}
                  </span>
                </TableCell>
                <TableCell>₹{product.sales_price?.toLocaleString()}</TableCell>
                <TableCell>₹{product.cost_price?.toLocaleString() ?? 0}</TableCell>
                <TableCell className="text-gray-500">General</TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
