"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  type: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/accounts/");
      setAccounts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chart of Accounts</h2>
          <p className="text-sm text-gray-500 mt-1">Ledger accounts grouped by type</p>
        </div>
        <Button className="bg-[#003B95] hover:bg-[#003B95]/90 text-white rounded-md px-6 shadow-sm">Add Account</Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Account Name</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12">Code</TableHead>
              <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider h-12 text-right">Opening Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium text-[#003B95]">{account.name}</TableCell>
                <TableCell className="text-gray-500">{account.code}</TableCell>
                <TableCell className="text-right">₹{account.balance?.toLocaleString() || '0'}</TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
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
