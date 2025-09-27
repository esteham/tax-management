import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatsCard } from '../shared/StatsCard';
import { DataTable, Column } from '../shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Download,
  Receipt,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dataService, TaxReturn, Payment, Invoice, UserProfile } from '../../utils/dataService';
import { pdfService } from '../../utils/pdfService';
import { toast } from 'sonner@2.0.3';

export function AdminDashboard() {
  const [activeItem, setActiveItem] = useState('overview');

  // Real data from dataService
  const [allReturns, setAllReturns] = useState<TaxReturn[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Initialize data service and load all data
    dataService.initializeData();
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    const returns = dataService.getAllTaxReturns();
    const payments = dataService.getAllPayments();
    const users = dataService.getAllUsers();
    const invoices = dataService.getInvoices(''); // Get all invoices
    
    setAllReturns(returns);
    setAllPayments(payments);
    setAllUsers(users);
    setAllInvoices(invoices);
  };

  const handleDownloadInvoice = async (taxReturn: TaxReturn) => {
    const userProfile = allUsers.find(user => user.id === taxReturn.userId);
    if (!userProfile) {
      toast.error('User profile not found');
      return;
    }

    try {
      const invoicePDF = pdfService.generateInvoice(taxReturn, userProfile);
      pdfService.downloadPDF(invoicePDF, `admin-invoice-${taxReturn.year}-${taxReturn.id.slice(-6)}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  // Transform data for display
  const recentReturns = allReturns.map(ret => {
    const user = allUsers.find(u => u.id === ret.userId);
    return {
      id: ret.id,
      taxpayer: user?.name || 'Unknown',
      tin: user?.tinNumber || 'N/A',
      type: ret.returnType.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      status: ret.status,
      amount: ret.taxLiability,
      date: ret.filedDate || ret.dueDate,
      originalReturn: ret
    };
  });

  const recentPayments = allPayments.map(pay => {
    const user = allUsers.find(u => u.id === pay.userId);
    return {
      id: pay.id,
      taxpayer: user?.name || 'Unknown',
      amount: pay.amount,
      status: pay.status,
      method: pay.paymentMethod?.replace('_', ' ') || 'N/A',
      date: pay.paidDate || pay.dueDate,
    };
  });

  const monthlyData = [
    { month: 'Jan', returns: 124, payments: 98, revenue: 245000 },
    { month: 'Feb', returns: 158, payments: 142, revenue: 289000 },
    { month: 'Mar', returns: 189, payments: 167, revenue: 334000 },
    { month: 'Apr', returns: 145, payments: 123, revenue: 267000 },
    { month: 'May', returns: 203, payments: 189, revenue: 412000 },
    { month: 'Jun', returns: 167, payments: 145, revenue: 298000 },
  ];

  const returnColumns: Column[] = [
    { key: 'taxpayer', label: 'Taxpayer', sortable: true },
    { key: 'tin', label: 'TIN', sortable: true },
    { key: 'type', label: 'Type', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const paymentColumns: Column[] = [
    { key: 'taxpayer', label: 'Taxpayer', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'method', label: 'Method', filterable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, any[]> = {
      overview: [{ label: 'Admin Dashboard' }],
      users: [{ label: 'Admin Dashboard' }, { label: 'Users' }],
      roles: [{ label: 'Admin Dashboard' }, { label: 'Roles & Permissions' }],
      taxpayers: [{ label: 'Admin Dashboard' }, { label: 'Taxpayers' }],
      returns: [{ label: 'Admin Dashboard' }, { label: 'Tax Returns' }],
      payments: [{ label: 'Admin Dashboard' }, { label: 'Payments & Invoices' }],
      audits: [{ label: 'Admin Dashboard' }, { label: 'Audits' }],
      penalties: [{ label: 'Admin Dashboard' }, { label: 'Penalties' }],
      appeals: [{ label: 'Admin Dashboard' }, { label: 'Appeals' }],
      notices: [{ label: 'Admin Dashboard' }, { label: 'Notices' }],
      reports: [{ label: 'Admin Dashboard' }, { label: 'Reports & Analytics' }],
      settings: [{ label: 'Admin Dashboard' }, { label: 'System Settings' }],
    };
    return breadcrumbMap[activeItem] || [{ label: 'Admin Dashboard' }];
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Taxpayers"
                value={allUsers.filter(u => u.role === 'taxpayer').length.toString()}
                change={{ value: `${allUsers.length} total users`, type: 'neutral' }}
                icon={Users}
              />
              <StatsCard
                title="Pending Returns"
                value={allReturns.filter(r => r.status === 'draft' || r.status === 'processing').length.toString()}
                change={{ value: `${allReturns.filter(r => r.status === 'filed').length} filed`, type: 'increase' }}
                icon={FileText}
                badge={{ text: 'Action Required', variant: 'destructive' }}
              />
              <StatsCard
                title="Total Revenue"
                value={`BDT ${allPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`}
                change={{ value: `${allPayments.filter(p => p.status === 'paid').length} payments`, type: 'increase' }}
                icon={DollarSign}
              />
              <StatsCard
                title="Total Returns"
                value={allReturns.length.toString()}
                change={{ value: `${allReturns.filter(r => r.status === 'filed').length} completed`, type: 'neutral' }}
                icon={AlertTriangle}
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Returns & Payments</CardTitle>
                  <CardDescription>Overview of filing and payment trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="returns" fill="#2563eb" name="Returns" />
                      <Bar dataKey="payments" fill="#10b981" name="Payments" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tax Returns</CardTitle>
                  <CardDescription>Latest filing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={recentReturns.slice(0, 5)}
                    columns={returnColumns}
                    searchable={false}
                    actions={{
                      view: (item) => console.log('View return:', item),
                      download: (item) => handleDownloadInvoice(item.originalReturn),
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={recentPayments.slice(0, 5)}
                    columns={paymentColumns}
                    searchable={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="System Users"
                  data={[
                    { id: '1', name: 'John Admin', email: 'admin@demo.com', role: 'admin', status: 'active', lastLogin: '2024-01-15' },
                    { id: '2', name: 'Jane Auditor', email: 'auditor@demo.com', role: 'auditor', status: 'active', lastLogin: '2024-01-14' },
                    { id: '3', name: 'Bob Accountant', email: 'accountant@demo.com', role: 'accountant', status: 'inactive', lastLogin: '2024-01-10' },
                  ]}
                  columns={[
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'email', label: 'Email', sortable: true },
                    { key: 'role', label: 'Role', filterable: true },
                    { key: 'status', label: 'Status', filterable: true },
                    { key: 'lastLogin', label: 'Last Login', sortable: true },
                  ]}
                  selectable
                  actions={{
                    edit: (item) => console.log('Edit user:', item),
                    delete: (item) => console.log('Delete user:', item),
                  }}
                  bulkActions={[
                    { label: 'Activate', action: (ids) => console.log('Activate users:', ids) },
                    { label: 'Deactivate', action: (ids) => console.log('Deactivate users:', ids), variant: 'destructive' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tax Returns</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="All Tax Returns"
                  data={recentReturns}
                  columns={returnColumns}
                  selectable
                  searchable
                  actions={{
                    view: (item) => console.log('View return:', item),
                    download: (item) => handleDownloadInvoice(item.originalReturn),
                  }}
                  bulkActions={[
                    { label: 'Approve', action: (ids) => console.log('Approve returns:', ids) },
                    { label: 'Download Invoices', action: (ids) => console.log('Download invoices:', ids) },
                  ]}
                  pagination={{
                    currentPage: 1,
                    totalPages: Math.ceil(recentReturns.length / 10),
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Payments & Invoices</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Collected"
                value={`BDT ${allPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`}
                change={{ value: `${allPayments.filter(p => p.status === 'paid').length} payments`, type: 'increase' }}
                icon={DollarSign}
              />
              <StatsCard
                title="Pending Payments"
                value={`BDT ${allPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`}
                change={{ value: `${allPayments.filter(p => p.status === 'pending').length} pending`, type: 'neutral' }}
                icon={Clock}
                badge={{ text: 'Action Required', variant: 'secondary' }}
              />
              <StatsCard
                title="Failed Payments"
                value={allPayments.filter(p => p.status === 'failed').length.toString()}
                change={{ value: 'Requires attention', type: 'neutral' }}
                icon={AlertTriangle}
                badge={{ text: 'Review', variant: 'destructive' }}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="All Payments"
                  data={recentPayments}
                  columns={paymentColumns}
                  selectable
                  searchable
                  actions={{
                    view: (item) => console.log('View payment:', item),
                  }}
                  pagination={{
                    currentPage: 1,
                    totalPages: Math.ceil(recentPayments.length / 10),
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {activeItem.charAt(0).toUpperCase() + activeItem.slice(1).replace('-', ' ')}
            </h2>
            <p className="text-muted-foreground">
              This section is under development. Content will be available soon.
            </p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      activeItem={activeItem}
      setActiveItem={setActiveItem}
      breadcrumbs={getBreadcrumbs()}
    >
      {renderContent()}
    </DashboardLayout>
  );
}