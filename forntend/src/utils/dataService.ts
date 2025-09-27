// Data service for managing application data with localStorage persistence

export interface TaxReturn {
  id: string;
  userId: string;
  year: string;
  quarter?: string;
  returnType: 'annual_income' | 'vat_quarterly' | 'corporate' | 'amended';
  status: 'draft' | 'filed' | 'processing' | 'approved' | 'rejected';
  income: number;
  deductions: number;
  taxableIncome: number;
  taxLiability: number;
  filedDate?: string;
  dueDate: string;
  documents: string[];
  invoiceGenerated: boolean;
  invoiceId?: string;
}

export interface Payment {
  id: string;
  userId: string;
  taxReturnId?: string;
  invoiceId?: string;
  description: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'sslcommerz' | 'bkash' | 'stripe' | 'bank_transfer';
  transactionId?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  taxReturnId: string;
  amount: number;
  taxYear: string;
  issueDate: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
  pdfUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  tinNumber?: string; // Made optional
  phone?: string;
  address?: string;
  businessName?: string;
  registrationDate: string;
  complianceScore: number;
  totalTaxPaid: number;
  pendingPayments: number;
  tinStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface TinRequest {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'individual' | 'partnership' | 'company' | 'other';
  businessAddress: string;
  contactPhone: string;
  contactEmail: string;
  tradeLicense?: string;
  nidNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  reviewComments?: string;
  generatedTin?: string;
}

export interface PaymentInvoice {
  id: string;
  paymentId: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  taxYear?: string;
  description: string;
  pdfUrl?: string;
}

export interface Audit {
  id: string;
  taxpayerId: string;
  auditorId: string;
  taxReturnId: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'appeal_filed';
  findings: string;
  recommendations: string;
  startDate: string;
  completionDate?: string;
}

export interface Notice {
  id: string;
  userId: string;
  type: 'reminder' | 'penalty' | 'audit' | 'refund' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  dueDate?: string;
}

class DataService {
  private storageKey = 'taxpro_data';

  // Initialize default data
  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      const defaultData = {
        users: this.getDefaultUsers(),
        taxReturns: this.getDefaultTaxReturns(),
        payments: this.getDefaultPayments(),
        invoices: this.getDefaultInvoices(),
        audits: this.getDefaultAudits(),
        notices: this.getDefaultNotices(),
        tinRequests: this.getDefaultTinRequests(),
        paymentInvoices: this.getDefaultPaymentInvoices(),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
    }
  }

  // Get data from localStorage
  private getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  private saveData(data: any) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // User Profile Methods
  getUserProfile(userId: string): UserProfile | null {
    const data = this.getData();
    return data?.users?.find((user: UserProfile) => user.id === userId) || null;
  }

  createUserProfile(
    profile: Omit<UserProfile, 'registrationDate' | 'complianceScore' | 'totalTaxPaid' | 'pendingPayments'> &
      Partial<Pick<UserProfile, 'registrationDate' | 'complianceScore' | 'totalTaxPaid' | 'pendingPayments'>>
  ): UserProfile {
    let data = this.getData();
    if (!data) {
      this.initializeData();
      data = this.getData();
    }
    data.users = data.users || [];
    const existing = data.users.find((u: UserProfile) => u.id === profile.id);
    if (existing) {
      return existing;
    }
    const newProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role || 'taxpayer',
      tinNumber: profile.tinNumber,
      phone: profile.phone,
      address: profile.address,
      businessName: profile.businessName,
      registrationDate: profile.registrationDate || new Date().toISOString(),
      complianceScore: profile.complianceScore ?? 95,
      totalTaxPaid: profile.totalTaxPaid ?? 0,
      pendingPayments: profile.pendingPayments ?? 0,
      tinStatus: profile.tinStatus || 'none',
    };
    data.users.push(newProfile);
    this.saveData(data);
    return newProfile;
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const data = this.getData();
    if (!data) return null;
    const userIndex = data.users.findIndex((user: UserProfile) => user.id === userId);
    if (userIndex === -1) return null;
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    this.saveData(data);
    return data.users[userIndex];
  }

  // Tax Return Methods
  getTaxReturns(userId: string): TaxReturn[] {
    const data = this.getData();
    return data?.taxReturns?.filter((returnItem: TaxReturn) => returnItem.userId === userId) || [];
  }

  createTaxReturn(taxReturn: Omit<TaxReturn, 'id'>): TaxReturn {
    const data = this.getData();
    const newReturn: TaxReturn = {
      ...taxReturn,
      id: this.generateId(),
    };

    data.taxReturns = data.taxReturns || [];
    data.taxReturns.push(newReturn);
    this.saveData(data);
    return newReturn;
  }

  updateTaxReturn(returnId: string, updates: Partial<TaxReturn>): TaxReturn | null {
    const data = this.getData();
    if (!data) return null;

    const returnIndex = data.taxReturns.findIndex((returnItem: TaxReturn) => returnItem.id === returnId);
    if (returnIndex === -1) return null;

    data.taxReturns[returnIndex] = { ...data.taxReturns[returnIndex], ...updates };
    this.saveData(data);
    return data.taxReturns[returnIndex];
  }

  // Payment Methods
  getPayments(userId: string): Payment[] {
    const data = this.getData();
    return data?.payments?.filter((payment: Payment) => payment.userId === userId) || [];
  }

  createPayment(payment: Omit<Payment, 'id'>): Payment {
    const data = this.getData();
    const newPayment: Payment = {
      ...payment,
      id: this.generateId(),
    };

    data.payments = data.payments || [];
    data.payments.push(newPayment);
    this.saveData(data);
    return newPayment;
  }

  updatePaymentStatus(paymentId: string, status: Payment['status'], transactionId?: string): Payment | null {
    const data = this.getData();
    if (!data) return null;

    const paymentIndex = data.payments.findIndex((payment: Payment) => payment.id === paymentId);
    if (paymentIndex === -1) return null;

    data.payments[paymentIndex].status = status;
    if (status === 'paid') {
      data.payments[paymentIndex].paidDate = new Date().toISOString();
    }
    if (transactionId) {
      data.payments[paymentIndex].transactionId = transactionId;
    }

    this.saveData(data);
    return data.payments[paymentIndex];
  }

  // Invoice Methods
  getInvoices(userId: string): Invoice[] {
    const data = this.getData();
    return data?.invoices?.filter((invoice: Invoice) => invoice.userId === userId) || [];
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): Invoice {
    const data = this.getData();
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId(),
    };

    data.invoices = data.invoices || [];
    data.invoices.push(newInvoice);
    this.saveData(data);
    return newInvoice;
  }

  // Notice Methods
  getNotices(userId: string): Notice[] {
    const data = this.getData();
    return data?.notices?.filter((notice: Notice) => notice.userId === userId) || [];
  }

  markNoticeAsRead(noticeId: string): boolean {
    const data = this.getData();
    if (!data) return false;

    const noticeIndex = data.notices.findIndex((notice: Notice) => notice.id === noticeId);
    if (noticeIndex === -1) return false;

    data.notices[noticeIndex].isRead = true;
    this.saveData(data);
    return true;
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  calculateTaxLiability(income: number, deductions: number): { taxableIncome: number; taxLiability: number } {
    const taxableIncome = Math.max(0, income - deductions);
    let taxLiability = 0;

    // Progressive tax calculation (simplified Bangladesh tax structure)
    if (taxableIncome <= 300000) {
      taxLiability = 0;
    } else if (taxableIncome <= 400000) {
      taxLiability = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 700000) {
      taxLiability = 5000 + (taxableIncome - 400000) * 0.10;
    } else if (taxableIncome <= 1100000) {
      taxLiability = 35000 + (taxableIncome - 700000) * 0.15;
    } else if (taxableIncome <= 1600000) {
      taxLiability = 95000 + (taxableIncome - 1100000) * 0.20;
    } else {
      taxLiability = 195000 + (taxableIncome - 1600000) * 0.25;
    }

    return {
      taxableIncome: Math.round(taxableIncome),
      taxLiability: Math.round(taxLiability)
    };
  }

  // Default data generators
  private getDefaultUsers(): UserProfile[] {
    return [
      {
        id: '1',
        email: 'admin@taxpro.bd',
        name: 'System Administrator',
        role: 'admin',
        tinNumber: 'TIN-ADMIN-001',
        phone: '+880-1711-000001',
        address: 'Tax Administration Office, Dhaka',
        registrationDate: '2023-01-01',
        complianceScore: 100,
        totalTaxPaid: 0,
        pendingPayments: 0,
      },
      {
        id: '2',
        email: 'taxpayer@example.com',
        name: 'John Doe',
        role: 'taxpayer',
        tinNumber: undefined,
        tinStatus: 'none',
        phone: '+880-1711-123456',
        address: '123 Dhanmondi, Dhaka-1205',
        businessName: 'Doe Enterprises',
        registrationDate: '2022-03-15',
        complianceScore: 95,
        totalTaxPaid: 125000,
        pendingPayments: 15000,
      },
      {
        id: '3',
        email: 'taxpayer2@example.com',
        name: 'Jane Smith',
        role: 'taxpayer',
        tinNumber: 'TIN-001234567890',
        tinStatus: 'approved',
        phone: '+880-1711-654321',
        address: '456 Gulshan, Dhaka-1212',
        businessName: 'Smith Consulting',
        registrationDate: '2021-06-10',
        complianceScore: 98,
        totalTaxPaid: 180000,
        pendingPayments: 0,
      }
    ];
  }

  private getDefaultTaxReturns(): TaxReturn[] {
    return [
      {
        id: 'TR-2024-001',
        userId: '2',
        year: '2023',
        returnType: 'annual_income',
        status: 'filed',
        income: 800000,
        deductions: 100000,
        taxableIncome: 700000,
        taxLiability: 35000,
        filedDate: '2024-01-15',
        dueDate: '2024-09-30',
        documents: ['salary_certificate.pdf', 'bank_statement.pdf'],
        invoiceGenerated: true,
        invoiceId: 'INV-2024-001',
      }
    ];
  }

  private getDefaultPayments(): Payment[] {
    return [
      {
        id: 'PAY-2024-001',
        userId: '2',
        taxReturnId: 'TR-2024-001',
        invoiceId: 'INV-2024-001',
        description: 'Income Tax 2023',
        amount: 35000,
        status: 'paid',
        dueDate: '2024-01-31',
        paidDate: '2024-01-20',
        paymentMethod: 'sslcommerz',
        transactionId: 'SSL-TXN-001234',
      }
    ];
  }

  private getDefaultInvoices(): Invoice[] {
    return [
      {
        id: 'INV-2024-001',
        userId: '2',
        taxReturnId: 'TR-2024-001',
        amount: 35000,
        taxYear: '2023',
        issueDate: '2024-01-15',
        dueDate: '2024-01-31',
        status: 'paid',
      }
    ];
  }

  private getDefaultAudits(): Audit[] {
    return [];
  }

  private getDefaultNotices(): Notice[] {
    return [
      {
        id: 'NOT-001',
        userId: '2',
        type: 'reminder',
        title: '2024 Tax Filing Reminder',
        message: 'This is a reminder that your 2024 tax filing deadline is approaching. Please file your return by September 30, 2024.',
        isRead: false,
        priority: 'medium',
        createdDate: '2024-01-01',
        dueDate: '2024-09-30',
      }
    ];
  }

  private getDefaultTinRequests(): TinRequest[] {
    return [];
  }

  private getDefaultPaymentInvoices(): PaymentInvoice[] {
    return [];
  }

  // Admin-specific methods
  getAllTaxReturns(): TaxReturn[] {
    const data = this.getData();
    return data?.taxReturns || [];
  }

  getAllPayments(): Payment[] {
    const data = this.getData();
    return data?.payments || [];
  }

  getAllUsers(): UserProfile[] {
    const data = this.getData();
    return data?.users || [];
  }

  // TIN Request Methods
  getTinRequests(userId?: string): TinRequest[] {
    const data = this.getData();
    const requests = data?.tinRequests || [];
    return userId ? requests.filter((req: TinRequest) => req.userId === userId) : requests;
  }

  createTinRequest(tinRequest: Omit<TinRequest, 'id'>): TinRequest {
    const data = this.getData();
    const newRequest: TinRequest = {
      ...tinRequest,
      id: this.generateId(),
    };

    data.tinRequests = data.tinRequests || [];
    data.tinRequests.push(newRequest);
    
    // Update user profile TIN status
    const userIndex = data.users.findIndex((user: UserProfile) => user.id === tinRequest.userId);
    if (userIndex !== -1) {
      data.users[userIndex].tinStatus = 'pending';
    }
    
    this.saveData(data);
    return newRequest;
  }

  updateTinRequest(requestId: string, updates: Partial<TinRequest>): TinRequest | null {
    const data = this.getData();
    if (!data) return null;

    const requestIndex = data.tinRequests.findIndex((req: TinRequest) => req.id === requestId);
    if (requestIndex === -1) return null;

    data.tinRequests[requestIndex] = { ...data.tinRequests[requestIndex], ...updates };
    
    // If approved, update user profile with TIN number
    if (updates.status === 'approved' && updates.generatedTin) {
      const userIndex = data.users.findIndex((user: UserProfile) => user.id === data.tinRequests[requestIndex].userId);
      if (userIndex !== -1) {
        data.users[userIndex].tinNumber = updates.generatedTin;
        data.users[userIndex].tinStatus = 'approved';
      }
    } else if (updates.status === 'rejected') {
      const userIndex = data.users.findIndex((user: UserProfile) => user.id === data.tinRequests[requestIndex].userId);
      if (userIndex !== -1) {
        data.users[userIndex].tinStatus = 'rejected';
      }
    }
    
    this.saveData(data);
    return data.tinRequests[requestIndex];
  }

  // Payment Invoice Methods
  getPaymentInvoices(userId: string): PaymentInvoice[] {
    const data = this.getData();
    return data?.paymentInvoices?.filter((invoice: PaymentInvoice) => invoice.userId === userId) || [];
  }

  createPaymentInvoice(invoice: Omit<PaymentInvoice, 'id'>): PaymentInvoice {
    const data = this.getData();
    const newInvoice: PaymentInvoice = {
      ...invoice,
      id: this.generateId(),
    };

    data.paymentInvoices = data.paymentInvoices || [];
    data.paymentInvoices.push(newInvoice);
    this.saveData(data);
    return newInvoice;
  }

  generateTinNumber(): string {
    const prefix = 'TIN';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp.slice(-6)}${random}`;
  }

  // Clear all data (for testing)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
  }
}

export const dataService = new DataService();