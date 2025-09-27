import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

import {
  User,
  Download,
  Edit,
  Save,
  X,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  TrendingUp,
  FileText,
  CheckCircle,
} from 'lucide-react';

import { dataService, UserProfile as UserProfileType } from '../utils/dataService';
import { pdfService } from '../utils/pdfService';
import { useAuth } from '../App';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
  });

  useEffect(() => {
    // Initialize data service and load profile
    dataService.initializeData();
    if (user) {
      const fetchProfile = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // Fallback to mock if no token
          fallbackToMock();
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.success && data?.data) {
              const backendUser = data.data;
              // Calculate totals
              const totalTaxPaid = backendUser.payments?.reduce((sum: number, p: any) => p.status === 'paid' ? sum + p.amount : sum, 0) || 0;
              const pendingPayments = backendUser.payments?.reduce((sum: number, p: any) => ['pending', 'processing'].includes(p.status) ? sum + p.amount : sum, 0) || 0;
              const totalReturns = backendUser.taxReturns?.length || 0;
              const filedReturns = backendUser.taxReturns?.filter((r: any) => ['filed', 'approved'].includes(r.status)).length || 0;
              const complianceScore = totalReturns > 0 ? Math.round((filedReturns / totalReturns) * 100) : 95;

              // Map backend user to frontend UserProfileType
              const userProfile: UserProfileType = {
                id: String(backendUser.id),
                email: backendUser.email,
                name: backendUser.name,
                role: backendUser.role,
                tinNumber: backendUser.tin,
                phone: backendUser.phone,
                address: backendUser.address,
                businessName: backendUser.business_name,
                registrationDate: backendUser.created_at || new Date().toISOString(),
                complianceScore,
                totalTaxPaid,
                pendingPayments,
                tinStatus: backendUser.tin ? 'approved' : 'none',
              };
              setProfile(userProfile);
              setEditForm({
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone || '',
                address: userProfile.address || '',
                businessName: userProfile.businessName || '',
              });
              return;
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }

        // Fallback to mock data if API fails
        fallbackToMock();
      };

      const fallbackToMock = () => {
        const uid = String(user.id);
        let userProfile = dataService.getUserProfile(uid);
        if (!userProfile) {
          userProfile = dataService.createUserProfile({
            id: uid,
            email: user.email || `user-${uid}@example.com`,
            name: user.name || 'Taxpayer',
            role: user.role || 'taxpayer',
          });
        }
        setProfile(userProfile);
        setEditForm({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          businessName: userProfile.businessName || '',
        });
      };

      fetchProfile();
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || '',
        businessName: profile.businessName || '',
      });
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      const updatedProfile = dataService.updateUserProfile(String(user.id), editForm);

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadTIN = () => {
    if (!profile) return;

    if (!profile.tinNumber) {
      toast.error('TIN number not available. Please apply for TIN first.');
      return;
    }

    try {
      const tinCertificate = pdfService.generateTINCertificate(profile);
      pdfService.downloadPDF(tinCertificate, `TIN-Certificate-${profile.tinNumber}.pdf`);
      toast.success('TIN Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate TIN certificate. Please try again.');
    }
  };

  const handleApplyTIN = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) {
          const backendUser = data.data;
          // Recalculate and update profile
          const totalTaxPaid = backendUser.payments?.reduce((sum: number, p: any) => p.status === 'paid' ? sum + p.amount : sum, 0) || 0;
          const pendingPayments = backendUser.payments?.reduce((sum: number, p: any) => ['pending', 'processing'].includes(p.status) ? sum + p.amount : sum, 0) || 0;
          const totalReturns = backendUser.taxReturns?.length || 0;
          const filedReturns = backendUser.taxReturns?.filter((r: any) => ['filed', 'approved'].includes(r.status)).length || 0;
          const complianceScore = totalReturns > 0 ? Math.round((filedReturns / totalReturns) * 100) : 95;

          const userProfile: UserProfileType = {
            id: String(backendUser.id),
            email: backendUser.email,
            name: backendUser.name,
            role: backendUser.role,
            tinNumber: backendUser.tin,
            phone: backendUser.phone,
            address: backendUser.address,
            businessName: backendUser.business_name,
            registrationDate: backendUser.created_at || new Date().toISOString(),
            complianceScore,
            totalTaxPaid,
            pendingPayments,
            tinStatus: backendUser.tin ? 'approved' : 'none',
          };
          setProfile(userProfile);
          toast.success('TIN applied successfully!');
        }
      }
    } catch (error) {
      toast.error('Failed to apply for TIN. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500', variant: 'default' as const };
    if (score >= 75) return { level: 'Good', color: 'bg-blue-500', variant: 'secondary' as const };
    if (score >= 60) return { level: 'Average', color: 'bg-yellow-500', variant: 'outline' as const };
    return { level: 'Needs Improvement', color: 'bg-red-500', variant: 'destructive' as const };
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const complianceInfo = getComplianceLevel(profile.complianceScore);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {profile.role.replace('_', ' ')}
                  </Badge>
                  <span>•</span>
                  <span>TIN: {profile.tinNumber || 'Not assigned'}</span>
                </CardDescription>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {profile.tinNumber ? (
                <Button onClick={handleDownloadTIN} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download TIN Certificate
                </Button>
              ) : (
                <Button onClick={handleApplyTIN} variant="outline">
                  Apply for TIN
                </Button>
              )}
              {!isEditing ? (
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing ? 'Update your personal details' : 'Your personal details on file'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+880-1XXX-XXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name (Optional)</Label>
                    <Input
                      id="businessName"
                      value={editForm.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={editForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your full address"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email:</span>
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Phone:</span>
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.businessName && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Business:</span>
                          <span>{profile.businessName}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Registered:</span>
                        <span>{new Date(profile.registrationDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">TIN:</span>
                        <span className="font-mono">{profile.tinNumber || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {profile.address && (
                    <>
                      <Separator />
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Address:</span>
                          <p className="text-sm text-muted-foreground mt-1">{profile.address}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TIN Certificate Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                TIN Certificate
              </CardTitle>
              <CardDescription>
                {profile.tinNumber ? 'Download your official Tax Identification Number certificate' : 'Apply for your TIN to access certificate download'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.tinNumber ? (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">TIN Certificate</h4>
                        <p className="text-sm text-muted-foreground">
                          Official certificate for TIN: {profile.tinNumber}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleDownloadTIN}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This certificate is digitally generated and is valid for all official purposes.
                      You can download it anytime from your profile.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No TIN Assigned</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You need to apply for a TIN before you can download the certificate.
                  </p>
                  <Button onClick={handleApplyTIN}>
                    Apply for TIN
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {profile.complianceScore}%
                </div>
                <Badge variant={complianceInfo.variant} className="px-3 py-1">
                  {complianceInfo.level}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Your compliance score is based on timely filing, payment history, and accuracy of returns.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Tax Paid:</span>
                  <span className="font-mono">BDT {profile.totalTaxPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Payments:</span>
                  <span className="font-mono">BDT {profile.pendingPayments.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span>Net Position:</span>
                  <span className={`font-mono ${profile.pendingPayments > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    BDT {(profile.totalTaxPaid - profile.pendingPayments).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tax Account:</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">TIN Status:</span>
                  <Badge variant={profile.tinNumber ? 'default' : 'secondary'}>
                    {profile.tinNumber ? 'Valid' : 'Not Assigned'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance:</span>
                  <Badge variant={complianceInfo.variant}>
                    {complianceInfo.level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}