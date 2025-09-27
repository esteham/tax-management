import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatsCard } from '../shared/StatsCard';
import { DataTable, Column } from '../shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { TaxReturnForm } from '../forms/TaxReturnForm';
import { PaymentForm } from '../forms/PaymentForm';
import { TinApplicationForm } from '../forms/TinApplicationForm';
import { UserProfile } from '../UserProfile';
import { 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Upload,
  Download,
  Clock,
  TrendingUp,
  CreditCard,
  Receipt,
  ArrowLeft
} from 'lucide-react';
import { dataService, TaxReturn, Payment, Invoice, TinRequest } from '../../utils/dataService';
import { pdfService } from '../../utils/pdfService';
import { useAuth } from '../../App';
import { toast } from 'sonner';

export function TaxpayerDashboard() {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showTaxReturnForm, setShowTaxReturnForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showTinApplication, setShowTinApplication] = useState(false);

  // Real data from dataService
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [myReturns, setMyReturns] = useState<TaxReturn[]>([]);
  const [myInvoices, setMyInvoices] = useState<Invoice[]>([]);
  const [userProfile, setUserProfile] = useState(null);
  const [tinRequest, setTinRequest] = useState<TinRequest | null>(null);

  useEffect(() => {
    // Initialize data service
    dataService.initializeData();
    
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    if (!user) return;
    const uid = String(user.id);
    
    const payments = dataService.getPayments(uid);
    const returns = dataService.getTaxReturns(uid);
    const invoices = dataService.getInvoices(uid);
    let profile = dataService.getUserProfile(uid);
    if (!profile) {
      // Create a minimal profile so downstream features (PDF, dashboard) always work
      profile = dataService.createUserProfile({
        id: uid,
        email: (user as any)?.email || `user-${uid}@example.com`,
        name: (user as any)?.name || 'Taxpayer',
        role: 'taxpayer',
        tinStatus: 'none',
      });
    }
    const tinRequests = dataService.getTinRequests(uid);
    
    setMyPayments(payments);
    setMyReturns(returns);
    setMyInvoices(invoices);
    setUserProfile(profile);
    setTinRequest(tinRequests.length > 0 ? tinRequests[0] : null);
  };

  const handleTinApplicationSuccess = (request: TinRequest) => {
    setShowTinApplication(false);
    loadUserData();
    toast.success('TIN application submitted successfully!');
  };

  const upcomingDeadlines = [
    { task: 'Q1 VAT Return', dueDate: '2024-04-20', daysLeft: 15, priority: 'high' },
    { task: 'Quarterly Payment Q1', dueDate: '2024-04-15', daysLeft: 10, priority: 'medium' },
    { task: 'Update Business License', dueDate: '2024-05-01', daysLeft: 26, priority: 'low' },
  ];

  const paymentColumns: Column[] = [
    { key: 'description', label: 'Description', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'paidDate', label: 'Paid Date', sortable: true },
  ];

  const returnColumns: Column[] = [
    { key: 'year', label: 'Year', sortable: true },
    { key: 'type', label: 'Type', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'filedDate', label: 'Filed Date', sortable: true },
  ];

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, any[]> = {
      dashboard: [{ label: 'Taxpayer Dashboard' }],
      profile: [{ label: 'Taxpayer Dashboard' }, { label: 'My Profile' }],
      'file-return': [{ label: 'Taxpayer Dashboard' }, { label: 'File Return' }],
      'tin-application': [{ label: 'Taxpayer Dashboard' }, { label: 'TIN Application' }],
      payments: [{ label: 'Taxpayer Dashboard' }, { label: 'Payments' }],
      invoices: [{ label: 'Taxpayer Dashboard' }, { label: 'Invoices' }],
      refunds: [{ label: 'Taxpayer Dashboard' }, { label: 'Refund Requests' }],
      notices: [{ label: 'Taxpayer Dashboard' }, { label: 'Notices' }],
      messages: [{ label: 'Taxpayer Dashboard' }, { label: 'Messages' }],
    };
    return breadcrumbMap[activeItem] || [{ label: 'Taxpayer Dashboard' }];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleTaxReturnSuccess = (taxReturn: TaxReturn | any) => {
    setShowTaxReturnForm(false);
    loadUserData(); // Refresh data
    toast.success('Tax return filed successfully!');

    try {
      if (!user) return;
      const amount = Number(
        (taxReturn && (taxReturn.taxLiability || taxReturn.tax_due)) ?? 0
      );
      const taxYear = String((taxReturn && (taxReturn.year || taxReturn.tax_year)) ?? new Date().getFullYear());
      const taxReturnId = String(taxReturn?.id ?? '');

      if (amount > 0 && taxReturnId) {
        const invoice = dataService.createInvoice({
          userId: String(user.id),
          taxReturnId,
          amount,
          taxYear,
          issueDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'unpaid',
        });

        // Also create a pending payment so it shows up in Payment History
        dataService.createPayment({
          userId: String(user.id),
          taxReturnId,
          invoiceId: invoice.id,
          description: `Payment for Tax Invoice ${invoice.id}`,
          amount,
          status: 'pending',
          dueDate: invoice.dueDate,
        });
        setSelectedInvoice(invoice);
        setShowPaymentForm(true);
      } else {
        setActiveItem('invoices');
      }
    } catch (e) {
      setActiveItem('invoices');
    }
  };

  const handlePaymentSuccess = (payment: Payment) => {
    // Ensure invoice exists and is marked as paid in local storage for Invoices tab
    try {
      if (user && selectedInvoice) {
        const data = JSON.parse(localStorage.getItem('taxpro_data') || '{}');
        data.invoices = data.invoices || [];
        const idx = data.invoices.findIndex((inv: any) => inv.id === selectedInvoice.id);
        if (idx !== -1) {
          data.invoices[idx].status = 'paid';
          localStorage.setItem('taxpro_data', JSON.stringify(data));
        } else {
          // Create a minimal invoice record if missing
          const created = {
            id: selectedInvoice.id,
            userId: String(user.id),
            taxReturnId: selectedInvoice.taxReturnId,
            amount: selectedInvoice.amount,
            taxYear: selectedInvoice.taxYear,
            issueDate: selectedInvoice.issueDate || new Date().toISOString(),
            dueDate: selectedInvoice.dueDate,
            status: 'paid',
          };
          data.invoices.push(created);
          localStorage.setItem('taxpro_data', JSON.stringify(data));
        }
      }
    } catch {}

    setShowPaymentForm(false);
    setSelectedInvoice(null);
    loadUserData(); // Refresh data
    toast.success('Payment completed successfully!');
    setActiveItem('invoices');
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      if (!userProfile) {
        toast.error('User profile not loaded');
        return;
      }
      let taxReturn = myReturns.find(r => r.id === invoice.taxReturnId);
      if (!taxReturn) {
        // Synthesize a minimal return for PDF if not found in local store
        taxReturn = {
          id: invoice.taxReturnId,
          userId: String(user?.id || ''),
          year: invoice.taxYear,
          returnType: 'annual_income',
          status: 'filed',
          income: invoice.amount,
          deductions: 0,
          taxableIncome: invoice.amount,
          taxLiability: invoice.amount,
          filedDate: new Date().toISOString(),
          dueDate: invoice.dueDate,
          documents: [],
          invoiceGenerated: true,
          invoiceId: invoice.id,
        } as any;
      }
      const dataUri = pdfService.generateInvoice(taxReturn as any, userProfile as any);
      pdfService.downloadPDF(dataUri, `invoice-${invoice.id}.pdf`);
      toast.success('Invoice downloaded');
    } catch (e) {
      toast.error('Failed to generate invoice PDF');
    }
  };

  const totalPaid = myPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = myPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const filedReturns = myReturns.filter(r => r.status === 'filed').length;

  const renderContent = () => {
    // Show tax return form
    if (showTaxReturnForm) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowTaxReturnForm(false)}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h2 className="text-xl font-semibold">File New Tax Return</h2>
          </div>
          <TaxReturnForm 
            onSuccess={handleTaxReturnSuccess}
            onCancel={() => setShowTaxReturnForm(false)}
          />
        </div>
      );
    }

    // Show TIN application form
    if (showTinApplication) {
      return (
        <div className="space-y-4">
          <TinApplicationForm 
            onSuccess={handleTinApplicationSuccess}
            onCancel={() => setShowTinApplication(false)}
            existingRequest={tinRequest || undefined}
          />
        </div>
      );
    }

    // Show payment form
    if (showPaymentForm && selectedInvoice) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedInvoice(null);
              }}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <h2 className="text-xl font-semibold">Pay Invoice #{selectedInvoice.id}</h2>
          </div>
          <PaymentForm 
            invoice={selectedInvoice}
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setShowPaymentForm(false);
              setSelectedInvoice(null);
            }}
          />
        </div>
      );
    }

    switch (activeItem) {
      case 'profile':
        return <UserProfile />;

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* TIN Status Alert */}
            {(!userProfile?.tinNumber || userProfile?.tinStatus === 'none' || userProfile?.tinStatus === 'rejected') && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">TIN Registration Required</p>
                      <p className="text-sm">
                        {userProfile?.tinStatus === 'rejected' 
                          ? 'Your TIN application was rejected. Please reapply with correct information.'
                          : 'You need a Tax Identification Number (TIN) to file returns and make payments.'
                        }
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setShowTinApplication(true)}>
                      {userProfile?.tinStatus === 'rejected' ? 'Reapply for TIN' : 'Apply for TIN'}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {userProfile?.tinStatus === 'pending' && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">TIN Application Under Review</p>
                      <p className="text-sm">Your TIN application is being reviewed by our auditors. You will be notified once approved.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowTinApplication(true)}>
                      View Status
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {userProfile?.tinStatus === 'approved' && userProfile?.tinNumber && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">TIN: {userProfile.tinNumber}</p>
                      <p className="text-sm">Your TIN is active and you can now file returns and make payments.</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (userProfile) {
                          const pdfDataUri = pdfService.generateTINCertificate(userProfile);
                          pdfService.downloadPDF(pdfDataUri, `tin-certificate-${userProfile.tinNumber}.pdf`);
                          toast.success('TIN certificate downloaded successfully!');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Certificate
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Tax Paid"
                value={`BDT ${totalPaid.toLocaleString()}`}
                change={{ value: `${myPayments.filter(p => p.status === 'paid').length} payments`, type: 'neutral' }}
                icon={DollarSign}
                badge={{ text: 'Paid', variant: 'default' }}
              />
              <StatsCard
                title="Pending Payments"
                value={`BDT ${pendingPayments.toLocaleString()}`}
                change={{ value: pendingPayments > 0 ? 'Payment due' : 'All clear', type: pendingPayments > 0 ? 'neutral' : 'increase' }}
                icon={Clock}
                badge={{ text: pendingPayments > 0 ? 'Due Soon' : 'Current', variant: pendingPayments > 0 ? 'destructive' : 'default' }}
              />
              <StatsCard
                title="Filed Returns"
                value={filedReturns.toString()}
                change={{ value: 'This year', type: 'increase' }}
                icon={FileText}
              />
              <StatsCard
                title="Compliance Score"
                value={userProfile ? `${userProfile.complianceScore}%` : '95%'}
                change={{ value: '+5% this year', type: 'increase' }}
                icon={TrendingUp}
              />
            </div>

            {/* Current Year Progress */}
            <Card>
              <CardHeader>
                <CardTitle>2024 Tax Year Progress</CardTitle>
                <CardDescription>Track your compliance progress for the current tax year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Annual Income Tax Return</span>
                    <Badge variant="outline">Not Due Yet</Badge>
                  </div>
                  <Progress value={25} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Q1 Complete</span>
                    <span>Due: Sep 30, 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Important dates you need to remember</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{deadline.task}</h4>
                          <p className="text-sm text-muted-foreground">Due: {deadline.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getPriorityColor(deadline.priority)}>
                          {deadline.daysLeft} days left
                        </Badge>
                        <Button size="sm">Take Action</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your latest payment activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={myPayments.slice(0, 3)}
                    columns={paymentColumns}
                    searchable={false}
                  />
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveItem('payments')}>
                    View All Payments
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Returns</CardTitle>
                  <CardDescription>Your filing history</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={myReturns.slice(0, 3)}
                    columns={returnColumns}
                    searchable={false}
                  />
                  <Button variant="outline" className="w-full mt-4" onClick={() => setShowTaxReturnForm(true)}>
                    File New Return
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'file-return':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">File Tax Return</h2>
              <Button onClick={() => setShowTaxReturnForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Start New Filing
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTaxReturnForm(true)}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Annual Income Tax
                  </CardTitle>
                  <CardDescription>File your annual personal income tax return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>Due: September 30, 2024</p>
                      <p>Status: Ready to File</p>
                    </div>
                    <Button className="w-full">Start Filing</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTaxReturnForm(true)}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    VAT Return
                  </CardTitle>
                  <CardDescription>File quarterly VAT return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>Due: April 20, 2024</p>
                      <p>Status: Ready to File</p>
                    </div>
                    <Button variant="outline" className="w-full">File VAT Return</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTaxReturnForm(true)}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Amended Return
                  </CardTitle>
                  <CardDescription>File an amended return for corrections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>For previous tax years</p>
                      <p>Status: Available</p>
                    </div>
                    <Button variant="outline" className="w-full">File Amendment</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Returns */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Returns</CardTitle>
                <CardDescription>Track your recently filed tax returns</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={myReturns}
                  columns={returnColumns}
                  searchable={true}
                  actions={{
                    view: (item) => console.log('View return:', item),
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
              <h2 className="text-2xl font-bold">Payment Management</h2>
              <Button onClick={() => setActiveItem('invoices')}>
                <CreditCard className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Paid This Year"
                value={`BDT ${totalPaid.toLocaleString()}`}
                change={{ value: `${myPayments.filter(p => p.status === 'paid').length} payments`, type: 'neutral' }}
                icon={DollarSign}
              />
              <StatsCard
                title="Outstanding Balance"
                value={`BDT ${pendingPayments.toLocaleString()}`}
                change={{ value: pendingPayments > 0 ? 'Payment due' : 'All clear', type: 'neutral' }}
                icon={Clock}
                badge={{ text: 'Pending', variant: 'secondary' }}
              />
              <StatsCard
                title="Next Payment"
                value={pendingPayments > 0 ? `BDT ${pendingPayments.toLocaleString()}` : 'None'}
                change={{ value: pendingPayments > 0 ? 'Due soon' : 'Current', type: 'neutral' }}
                icon={Calendar}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="Payment History"
                  data={myPayments}
                  columns={paymentColumns}
                  searchable={true}
                  actions={{
                    view: (item) => {
                      // If payment is pending and has an invoice, open PaymentForm
                      if (item.status === 'pending' && item.invoiceId) {
                        const inv = myInvoices.find(i => i.id === item.invoiceId);
                        if (inv) {
                          setSelectedInvoice(inv);
                          setShowPaymentForm(true);
                          return;
                        }
                      }
                      // Otherwise, just show a small toast/info
                      toast.info('Payment details opened');
                    },
                  }}
                  pagination={{
                    currentPage: 1,
                    totalPages: Math.ceil(myPayments.length / 10),
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tax Invoices</h2>
              <Button onClick={() => setActiveItem('payments')}>
                <Receipt className="h-4 w-4 mr-2" />
                Payment History
              </Button>
            </div>

            <div className="grid gap-6">
              {myInvoices.length > 0 ? myInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded">
                          <Receipt className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Invoice #{invoice.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Tax Year {invoice.taxYear} • Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">BDT {invoice.amount.toLocaleString()}</div>
                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
  <Download className="h-4 w-4 mr-1" />
  Download
</Button>
                        {invoice.status === 'unpaid' && (
                          <Button size="sm" onClick={() => handlePayInvoice(invoice)}>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any tax invoices yet. File a tax return to generate invoices.
                    </p>
                    <Button onClick={() => setShowTaxReturnForm(true)}>
                      File Tax Return
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
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