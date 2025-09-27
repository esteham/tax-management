import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Loader2,
  Receipt,
  Download
} from 'lucide-react';
import { dataService, Payment, Invoice, PaymentInvoice } from '../../utils/dataService';
import { pdfService } from '../../utils/pdfService';
import { useAuth } from '../../App';

import api from '../../utils/api';

interface PaymentFormProps {
  invoice: Invoice;
  onSuccess?: (payment: Payment) => void;
  onCancel?: () => void;
}

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  fee: number;
  feeType: 'percentage' | 'fixed';
  icon: string;
  enabled: boolean;
}

export function PaymentForm({ invoice, onSuccess, onCancel }: PaymentFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<Payment | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<PaymentInvoice | null>(null);
  
  const [formData, setFormData] = useState({
    gateway: '',
    email: user?.email || '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bkashNumber: '',
    pin: '',
  });

  const paymentGateways: PaymentGateway[] = [
    {
      id: 'sslcommerz',
      name: 'SSLCommerz',
      description: 'Pay with credit/debit card, mobile banking',
      fee: 2.5,
      feeType: 'percentage',
      icon: '💳',
      enabled: true,
    },
    {
      id: 'bkash',
      name: 'bKash',
      description: 'Mobile financial service',
      fee: 15,
      feeType: 'fixed',
      icon: '📱',
      enabled: true,
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'International credit/debit cards',
      fee: 3.0,
      feeType: 'percentage',
      icon: '🌐',
      enabled: false,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      fee: 0,
      feeType: 'fixed',
      icon: '🏦',
      enabled: true,
    },
  ];

  const selectedGateway = paymentGateways.find(g => g.id === formData.gateway);
  const processingFee = selectedGateway ? 
    (selectedGateway.feeType === 'percentage' ? 
      (invoice.amount * selectedGateway.fee / 100) : 
      selectedGateway.fee) : 0;
  const totalAmount = invoice.amount + processingFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const simulatePaymentProcessing = async (): Promise<{ payment: Payment; paymentInvoice: PaymentInvoice }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (!isSuccess) {
      throw new Error('Payment failed. Please try again.');
    }

    // Create payment record
    const payment = dataService.createPayment({
      userId: String(user!.id),
      invoiceId: invoice.id,
      taxReturnId: invoice.taxReturnId,
      description: `Payment for Tax Invoice ${invoice.id}`,
      amount: totalAmount,
      status: 'paid',
      dueDate: invoice.dueDate,
      paidDate: new Date().toISOString(),
      paymentMethod: formData.gateway as any,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    {
      const store = JSON.parse(localStorage.getItem('taxpro_data') || '{}');
      store.invoices = store.invoices || [];
      let idx = store.invoices.findIndex((inv: Invoice) => inv.id === invoice.id);
      if (idx === -1) {
        // Create the invoice if missing
        const created = dataService.createInvoice({
          userId: String(user!.id),
          taxReturnId: invoice.taxReturnId,
          amount: invoice.amount,
          taxYear: invoice.taxYear,
          issueDate: invoice.issueDate || new Date().toISOString(),
          dueDate: invoice.dueDate,
          status: 'paid',
        });
        // Refresh and set to paid
        const fresh = JSON.parse(localStorage.getItem('taxpro_data') || '{}');
        const freshIdx = fresh.invoices?.findIndex((inv: Invoice) => inv.id === created.id) ?? -1;
        if (freshIdx !== -1) {
          fresh.invoices[freshIdx].status = 'paid';
          localStorage.setItem('taxpro_data', JSON.stringify(fresh));
        }
      } else {
        store.invoices[idx].status = 'paid';
        localStorage.setItem('taxpro_data', JSON.stringify(store));
      }
    }

    // If a pending payment exists for this invoice, convert it to paid
    {
      const store = JSON.parse(localStorage.getItem('taxpro_data') || '{}');
      const pending = (store.payments || []).find((p: Payment) => p.invoiceId === invoice.id && p.userId === String(user!.id) && p.status === 'pending');
      if (pending && pending.id) {
        dataService.updatePaymentStatus(pending.id, 'paid', payment.transactionId!);
      }
    }

    // Create payment invoice (receipt)
    const paymentInvoice = dataService.createPaymentInvoice({
      paymentId: payment.id,
      userId: String(user!.id),
      invoiceNumber: `INV-PAY-${Date.now()}`,
      amount: totalAmount,
      paymentDate: new Date().toISOString(),
      paymentMethod: formData.gateway as any,
      transactionId: payment.transactionId!,
      taxYear: invoice.taxYear,
      description: `Payment Invoice for ${invoice.id}`,
    });

    return { payment, paymentInvoice };
  };

  const handlePayment = async () => {
    if (!user) return;
  
    setIsProcessing(true);
    
    try {
      const result = await simulatePaymentProcessing();
      setPaymentResult(result.payment);
      setPaymentInvoice(result.paymentInvoice);
  
      // Persist to backend payments table
      const mapGatewayToEnum = (g: string) => {
        const key = (g || '').toLowerCase();
        if (key === 'sslcommerz' || key === 'stripe' || key === 'credit_card') return 'credit_card';
        if (key === 'bkash' || key === 'bank_transfer') return 'bank_transfer';
        if (key === 'debit_card') return 'debit_card';
        if (key === 'cash') return 'cash';
        if (key === 'check') return 'check';
        return 'bank_transfer';
      };
  
      // If invoice.taxReturnId is not a valid server ID, omit it
      const normalizedTaxReturnId = Number.isFinite(Number(invoice.taxReturnId))
        ? Number(invoice.taxReturnId)
        : undefined;
  
      const backendPayload = {
        tax_return_id: normalizedTaxReturnId,
        payment_number: `PMT-${Date.now()}`,
        amount: totalAmount,
        payment_type: 'tax_payment',
        payment_method: mapGatewayToEnum(formData.gateway),
        status: 'completed',
        transaction_id: result.payment.transactionId,
        reference_number: invoice.id,
        due_date: invoice.dueDate,
        paid_at: new Date().toISOString(),
        notes: `Payment for invoice ${invoice.id}`,
        payment_details: { gateway: formData.gateway },
      };
  
      try {
        await api.post('/payments', backendPayload);
      } catch (e: any) {
        // Warn but do not block UI since local state is already updated
        toast.error(e?.message || 'Failed to persist payment to server');
      }
  
      setStep(3);
      toast.success('Payment completed successfully!');
  
      if (onSuccess) {
        onSuccess(result.payment); // correct variable
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        
        <div className="grid gap-4">
          {paymentGateways.filter(g => g.enabled).map((gateway) => (
            <div
              key={gateway.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                formData.gateway === gateway.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleInputChange('gateway', gateway.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{gateway.icon}</span>
                  <div>
                    <h4 className="font-medium">{gateway.name}</h4>
                    <p className="text-sm text-muted-foreground">{gateway.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    Fee: {gateway.feeType === 'percentage' 
                      ? `${gateway.fee}%` 
                      : `BDT ${gateway.fee}`
                    }
                  </Badge>
                  {formData.gateway === gateway.id && (
                    <CheckCircle className="h-5 w-5 text-primary mt-1 ml-auto" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedGateway && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Invoice Amount:</span>
                  <span>BDT {invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>BDT {processingFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>BDT {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        
        {formData.gateway === 'sslcommerz' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+880-1XXX-XXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="Enter name as on card"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              />
            </div>
          </div>
        )}

        {formData.gateway === 'bkash' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bkashNumber">bKash Account Number</Label>
              <Input
                id="bkashNumber"
                placeholder="01XXXXXXXXX"
                value={formData.bkashNumber}
                onChange={(e) => handleInputChange('bkashNumber', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pin">bKash PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your PIN"
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', e.target.value)}
                maxLength={5}
              />
            </div>
          </div>
        )}

        {formData.gateway === 'bank_transfer' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Please transfer the amount to the following account:</p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  <p>Account Name: National Revenue Board</p>
                  <p>Account Number: 1234567890</p>
                  <p>Bank: Central Bank of Bangladesh</p>
                  <p>Routing Number: 123456789</p>
                  <p>Reference: {invoice.id}</p>
                </div>
                <p>Please upload the transfer receipt after completing the payment.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Your payment has been processed successfully.
        </p>

        {paymentResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-left">Payment Receipt</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-3">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Transaction ID:</strong></p>
                  <p className="font-mono">{paymentResult.transactionId}</p>
                </div>
                <div>
                  <p><strong>Payment Date:</strong></p>
                  <p>{new Date(paymentResult.paidDate!).toLocaleString()}</p>
                </div>
                <div>
                  <p><strong>Amount Paid:</strong></p>
                  <p>BDT {paymentResult.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p><strong>Payment Method:</strong></p>
                  <p className="capitalize">{paymentResult.paymentMethod?.replace('_', ' ')}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              </div>

              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => {
                  if (paymentInvoice && user) {
                    let userProfile = dataService.getUserProfile(String(user.id));
                    if (!userProfile) {
                      userProfile = dataService.createUserProfile({
                        id: String(user.id),
                        email: (user as any)?.email || `user-${String(user.id)}@example.com`,
                        name: (user as any)?.name || 'Taxpayer',
                        role: 'taxpayer',
                        tinStatus: 'none',
                      });
                    }
                    if (userProfile) {
                      const pdfDataUri = pdfService.generatePaymentInvoice(paymentInvoice, userProfile);
                      pdfService.downloadPDF(pdfDataUri, `payment-invoice-${paymentInvoice.invoiceNumber}.pdf`);
                      toast.success('Payment invoice downloaded successfully!');
                    }
                  }
                }
              }
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const canProceedToStep2 = formData.gateway !== '';
  const canProceedToPayment = () => {
    if (formData.gateway === 'sslcommerz') {
      return formData.email && formData.phone && formData.cardNumber && 
             formData.expiryDate && formData.cvv && formData.cardholderName;
    }
    if (formData.gateway === 'bkash') {
      return formData.bkashNumber && formData.pin;
    }
    if (formData.gateway === 'bank_transfer') {
      return true; // No additional validation needed
    }
    return false;
  };

  if (isProcessing) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
          <p className="text-muted-foreground mb-4">
            Please wait while we process your payment. Do not close this window.
          </p>
          <Progress value={60} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment - Invoice #{invoice.id}
          </CardTitle>
          <CardDescription>
            Complete your tax payment securely
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {step < 3 && (
            <div className="flex justify-between pt-6 border-t">
              <div>
                {step > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {onCancel && step < 3 && (
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}

                {step === 1 && (
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                  >
                    Continue
                  </Button>
                )}

                {step === 2 && (
                  <Button 
                    onClick={handlePayment}
                    disabled={!canProceedToPayment()}
                    className="flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay BDT {totalAmount.toLocaleString()}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex justify-center pt-6 border-t">
              <Button onClick={onCancel || (() => {})}>
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}