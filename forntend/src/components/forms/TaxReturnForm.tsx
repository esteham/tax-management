import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  FileText, 
  Calculator, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Calendar
} from 'lucide-react';
import { dataService, TaxReturn } from '../../utils/dataService';
import { pdfService } from '../../utils/pdfService';
import { useAuth } from '../../App';
import api from '../../utils/api';

interface TaxReturnFormProps {
  onSuccess?: (taxReturn: TaxReturn) => void;
  onCancel?: () => void;
}

export function TaxReturnForm({ onSuccess, onCancel }: TaxReturnFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    year: '2024',
    quarter: '',
    returnType: 'annual_income' as const,
    income: '',
    deductions: '',
    taxableIncome: 0,
    taxLiability: 0,
    dueDate: '',
    documents: [] as string[],
  });

  const returnTypes = [
    { value: 'annual_income', label: 'Annual Income Tax', description: 'Personal annual income tax return' },
    { value: 'vat_quarterly', label: 'VAT Quarterly', description: 'Quarterly VAT return' },
    { value: 'corporate', label: 'Corporate Tax', description: 'Corporate income tax return' },
    { value: 'amended', label: 'Amended Return', description: 'Amendment to previously filed return' },
  ];

  const deductionCategories = [
    { name: 'Basic Exemption', amount: 300000, description: 'Standard personal exemption' },
    { name: 'Investment Allowance', amount: 0, description: 'Approved investment deductions' },
    { name: 'Life Insurance Premium', amount: 0, description: 'Premium payments (max 10% of income)' },
    { name: 'Provident Fund', amount: 0, description: 'Recognized provident fund contributions' },
    { name: 'Donation', amount: 0, description: 'Charitable donations (max 20% of income)' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTax = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const income = parseFloat(formData.income) || 0;
      const deductions = parseFloat(formData.deductions) || 0;
      
      const { taxableIncome, taxLiability } = dataService.calculateTaxLiability(income, deductions);
      
      setFormData(prev => ({
        ...prev,
        taxableIncome,
        taxLiability
      }));
      
      setIsCalculating(false);
      toast.success('Tax calculation completed!');
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!user) return;
  
    setIsSubmitting(true);
    
    try {
      // Map frontend returnType -> backend enum
      const mapReturnType = (t: string) => {
        switch (t) {
          case 'annual_income':
            return 'individual';
          case 'vat_quarterly':
            return 'vat';
          case 'corporate':
            return 'corporate';
          case 'amended':
            return 'amended';
          default:
            return 'individual';
        }
      };
  
      // Create tax return in backend
      const payload = {
        tax_year: parseInt(formData.year, 10),
        return_type: mapReturnType(formData.returnType),
        income_amount: parseFloat(formData.income) || 0,
        tax_due: formData.taxLiability || 0,
      };
  
      const created = await api.post('/tax-returns', payload);
      const serverReturn = created?.data?.data || created?.data;
  
      // Optionally mark as filed (backend submit endpoint)
      try {
        await api.post(`/tax-returns/${serverReturn.id}/submit`, {});
      } catch {
        // non-blocking
      }
  
      // Generate and download client-side invoice PDF (preserve UX)
      const userProfile = dataService.getUserProfile(user.id);
      if (userProfile) {
        const taxReturnLike: any = {
          id: serverReturn.id.toString(),
          userId: user.id,
          year: formData.year,
          returnType: formData.returnType,
          status: 'filed',
          income: parseFloat(formData.income) || 0,
          deductions: parseFloat(formData.deductions) || 0,
          taxableIncome: formData.taxableIncome,
          taxLiability: formData.taxLiability,
          filedDate: new Date().toISOString(),
          dueDate: formData.dueDate,
          documents: formData.documents,
          invoiceGenerated: true,
        };
        const invoicePDF = pdfService.generateInvoice(taxReturnLike, userProfile);
        pdfService.downloadPDF(invoicePDF, `tax-invoice-${formData.year}-${serverReturn.id}.pdf`);
      }
  
      toast.success('Tax return filed successfully!');
      if (onSuccess) {
        onSuccess(serverReturn);
      }
    } catch (error) {
      toast.error('Error filing tax return. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (step / 4) * 100;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Return Information</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Tax Year</Label>
            <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tax year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="returnType">Return Type</Label>
            <Select value={formData.returnType} onValueChange={(value: any) => handleInputChange('returnType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select return type" />
              </SelectTrigger>
              <SelectContent>
                {returnTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.returnType === 'vat_quarterly' && (
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Select value={formData.quarter} onValueChange={(value) => handleInputChange('quarter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>
        </div>

        {formData.returnType && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {returnTypes.find(t => t.value === formData.returnType)?.description}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Income Information</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="income">Total Income (BDT)</Label>
            <Input
              id="income"
              type="number"
              placeholder="Enter your total income"
              value={formData.income}
              onChange={(e) => handleInputChange('income', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Include all sources of income including salary, business income, investments, etc.
            </p>
          </div>

          <div>
            <Label htmlFor="deductions">Total Deductions (BDT)</Label>
            <Input
              id="deductions"
              type="number"
              placeholder="Enter your total deductions"
              value={formData.deductions}
              onChange={(e) => handleInputChange('deductions', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Include all allowable deductions as per tax law.
            </p>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Common Deduction Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deductionCategories.map((category, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <p className="text-muted-foreground text-xs">{category.description}</p>
                  </div>
                  <Badge variant="outline">BDT {category.amount.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tax Calculation</h3>
        
        {formData.income && formData.deductions ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Calculate Your Tax Liability</h4>
                  <Button 
                    onClick={calculateTax} 
                    disabled={isCalculating}
                    className="flex items-center"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {isCalculating ? 'Calculating...' : 'Calculate Tax'}
                  </Button>
                </div>

                {isCalculating && <Progress value={60} className="h-2 mb-4" />}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span>BDT {parseFloat(formData.income || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span>BDT {parseFloat(formData.deductions || '0').toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Taxable Income:</span>
                    <span>BDT {formData.taxableIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tax Liability:</span>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        BDT {formData.taxLiability.toLocaleString()}
                      </div>
                      {formData.taxLiability > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {((formData.taxLiability / formData.taxableIncome) * 100).toFixed(2)}% effective rate
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {formData.taxLiability > 0 && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  You have a tax liability of BDT {formData.taxLiability.toLocaleString()}. 
                  An invoice will be generated after filing your return.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please enter your income and deduction amounts in the previous step to calculate tax.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Return Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Return Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tax Year:</span>
                    <span>{formData.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Type:</span>
                    <span>{returnTypes.find(t => t.value === formData.returnType)?.label}</span>
                  </div>
                  {formData.quarter && (
                    <div className="flex justify-between">
                      <span>Quarter:</span>
                      <span>{formData.quarter}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span>{new Date(formData.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span>BDT {parseFloat(formData.income || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span>BDT {parseFloat(formData.deductions || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxable Income:</span>
                    <span>BDT {formData.taxableIncome.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Tax Liability:</span>
                    <span>BDT {formData.taxLiability.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                By submitting this return, you confirm that all information provided is accurate and complete.
                An invoice will be automatically generated and available for download.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            File Tax Return
          </CardTitle>
          <CardDescription>
            Complete your tax return filing process
          </CardDescription>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <div className="flex justify-between pt-6 border-t">
            <div>
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={step === 3 && !formData.taxLiability}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.taxLiability}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Filing Return...' : 'File Return'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}