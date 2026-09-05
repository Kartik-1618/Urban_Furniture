"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

interface Contact {
  id: number;
  name: string;
  type: "customer" | "vendor" | "both";
  email: string;
  phone: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"customer" | "vendor" | "both">("customer");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const fetchContacts = async () => {
    try {
      const res = await api.get("/contacts/");
      setContacts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/contacts/", {
        name, type, email, phone
      });
      setOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      fetchContacts();
    } catch (e) {
      console.error(e);
      alert("Error creating contact");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
          <p className="text-sm text-gray-500 mt-1">Team members with access to the workspace</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003B95] hover:bg-[#003B95]/90 text-white rounded-md px-6 shadow-sm">Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-[#003B95] hover:bg-[#003B95]/90">Save Contact</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Name</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Email</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Role / Type</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell className="text-gray-500">{contact.email}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    contact.type === 'customer' ? "bg-[#0099FF] text-white" : "bg-[#003B95] text-white"
                  )}>
                    {contact.type === 'customer' ? 'Customer' : 'Vendor'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                    Active
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
