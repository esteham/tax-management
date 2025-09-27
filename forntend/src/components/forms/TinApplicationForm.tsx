import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { dataService, TinRequest } from '../../utils/dataService';
import { pdfService } from '../../utils/pdfService';
import { useAuth } from '../../App';

interface TinApplicationFormProps {
  onSuccess?: (request: TinRequest) => void;
  onCancel?: () => void;
  existingRequest?: TinRequest;
}

export function TinApplicationForm({ onSuccess, onCancel, existingRequest }: TinApplicationFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: existingRequest?.businessName || '',
    businessType: existingRequest?.businessType || 'individual',
    businessAddress: existingRequest?.businessAddress || '',
    contactPhone: existingRequest?.contactPhone || '',
    contactEmail: existingRequest?.contactEmail || user?.email || '',
    tradeLicense: existingRequest?.tradeLicense || '',
    nidNumber: existingRequest?.nidNumber || '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [field]: file }));
    toast.success(`${file.name} uploaded successfully`);
  };

  const validateForm = () => {
    const required = ['businessName', 'businessType', 'businessAddress', 'contactPhone', 'contactEmail', 'nidNumber'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.businessType !== 'individual' && !formData.tradeLicense) {
      toast.error('Trade license number is required for business entities');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const tinRequest = dataService.createTinRequest({
        ...formData,
        userId: user.id,
        status: 'pending',
        submittedDate: new Date().toISOString(),
      });

      toast.success('TIN application submitted successfully!');
      
      if (onSuccess) {
        onSuccess(tinRequest);
      }
    } catch (error) {
      toast.error('Failed to submit TIN application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If showing existing request details
  if (existingRequest && existingRequest.status !== 'rejected') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            TIN Application Status
          </CardTitle>
          <CardDescription>
            Your TIN application details and current status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Application ID: {existingRequest.id}</h3>
              <p className="text-sm text-muted-foreground">
                Submitted: {new Date(existingRequest.submittedDate).toLocaleDateString()}
              </p>
            </div>
            <Badge 
              variant={
                existingRequest.status === 'approved' ? 'default' : 
                existingRequest.status === 'pending' ? 'secondary' : 'destructive'
              }
            >
              {existingRequest.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
              {existingRequest.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {existingRequest.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
              {existingRequest.status.toUpperCase()}
            </Badge>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Business Name:</p>
              <p className="text-muted-foreground">{existingRequest.businessName}</p>
            </div>
            <div>
              <p className="font-medium">Business Type:</p>
              <p className="text-muted-foreground capitalize">{existingRequest.businessType}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium">Business Address:</p>
              <p className="text-muted-foreground">{existingRequest.businessAddress}</p>
            </div>
            <div>
              <p className="font-medium">Contact Phone:</p>
              <p className="text-muted-foreground">{existingRequest.contactPhone}</p>
            </div>
            <div>
              <p className="font-medium">Contact Email:</p>
              <p className="text-muted-foreground">{existingRequest.contactEmail}</p>
            </div>
            {existingRequest.tradeLicense && (
              <div>
                <p className="font-medium">Trade License:</p>
                <p className="text-muted-foreground">{existingRequest.tradeLicense}</p>
              </div>
            )}
            <div>
              <p className="font-medium">NID Number:</p>
              <p className="text-muted-foreground">{existingRequest.nidNumber}</p>
            </div>
          </div>

          {existingRequest.status === 'approved' && existingRequest.generatedTin && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Your TIN has been approved!</strong></p>
                  <div className="bg-primary/10 p-3 rounded font-mono text-lg">
                    TIN: {existingRequest.generatedTin}
                  </div>
                  <p className="text-sm">You can now download your TIN certificate from your dashboard.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {existingRequest.status === 'pending' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your TIN application is currently under review by our auditors. 
                You will be notified once the review is complete. 
                Typical processing time is 3-5 business days.
              </AlertDescription>
            </Alert>
          )}

          {existingRequest.reviewComments && (
            <div>
              <p className="font-medium mb-2">Review Comments:</p>
              <div className="bg-muted p-3 rounded text-sm">
                {existingRequest.reviewComments}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {existingRequest.status === 'approved' && (
              <Button
                onClick={() => {
                  const userProfile = dataService.getUserProfile(user!.id);
                  if (userProfile && userProfile.tinNumber) {
                    const pdfDataUri = pdfService.generateTINCertificate(userProfile);
                    pdfService.downloadPDF(pdfDataUri, `tin-certificate-${userProfile.tinNumber}.pdf`);
                    toast.success('TIN certificate downloaded successfully!');
                  }
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Download TIN Certificate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Apply for TIN
        </CardTitle>
        <CardDescription>
          Submit your Tax Identification Number application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please ensure all information is accurate. Your application will be reviewed by our auditors 
              and you will be notified of the status within 3-5 business days.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business/Individual Name *</Label>
              <Input
                id="businessName"
                placeholder="Enter business or individual name"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="company">Private Limited Company</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address *</Label>
            <Textarea
              id="businessAddress"
              placeholder="Enter complete business address"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+880-1XXX-XXXXXX"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@business.com"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                required
              />
            </div>
          </div>

          {formData.businessType !== 'individual' && (
            <div className="space-y-2">
              <Label htmlFor="tradeLicense">Trade License Number *</Label>
              <Input
                id="tradeLicense"
                placeholder="Enter trade license number"
                value={formData.tradeLicense}
                onChange={(e) => handleInputChange('tradeLicense', e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nidNumber">National ID Number *</Label>
            <Input
              id="nidNumber"
              placeholder="Enter NID number"
              value={formData.nidNumber}
              onChange={(e) => handleInputChange('nidNumber', e.target.value)}
              required
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Required Documents</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>National ID Copy *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload NID copy</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('nid', file);
                    }}
                  />
                </div>
              </div>

              {formData.businessType !== 'individual' && (
                <div className="space-y-2">
                  <Label>Trade License Copy *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload trade license</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('tradeLicense', file);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}