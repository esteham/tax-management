import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatsCard } from '../shared/StatsCard';
import { DataTable, Column } from '../shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  UserCheck,
  UserX,
  Users
} from 'lucide-react';
import { dataService, TinRequest } from '../../utils/dataService';
import { useAuth } from '../../App';
import { toast } from 'sonner@2.0.3';

export function AuditorDashboard() {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [tinRequests, setTinRequests] = useState<TinRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TinRequest | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTinRequests();
  }, []);

  const loadTinRequests = () => {
    const requests = dataService.getTinRequests();
    setTinRequests(requests);
  };

  // Mock data
  const assignedAudits = [
    { 
      id: '1', 
      taxpayer: 'ABC Corp', 
      tin: 'TIN123456', 
      type: 'Corporate Income Tax', 
      status: 'in_progress', 
      assignedDate: '2024-01-10',
      dueDate: '2024-02-10',
      riskLevel: 'high',
      progress: 65
    },
    { 
      id: '2', 
      taxpayer: 'John Smith', 
      tin: 'TIN789012', 
      type: 'Individual Income Tax', 
      status: 'pending', 
      assignedDate: '2024-01-15',
      dueDate: '2024-02-15',
      riskLevel: 'medium',
      progress: 0
    },
    { 
      id: '3', 
      taxpayer: 'XYZ Ltd', 
      tin: 'TIN345678', 
      type: 'VAT Audit', 
      status: 'completed', 
      assignedDate: '2023-12-20',
      dueDate: '2024-01-20',
      riskLevel: 'low',
      progress: 100
    },
  ];

  const recentFindings = [
    { 
      id: '1', 
      auditId: 'AUD-001',
      taxpayer: 'ABC Corp', 
      finding: 'Unreported income detected',
      amount: 25000,
      severity: 'high',
      status: 'open',
      date: '2024-01-12'
    },
    { 
      id: '2', 
      auditId: 'AUD-002',
      taxpayer: 'DEF Corp', 
      finding: 'Excessive deductions claimed',
      amount: 8500,
      severity: 'medium',
      status: 'resolved',
      date: '2024-01-08'
    },
  ];

  const auditColumns: Column[] = [
    { key: 'taxpayer', label: 'Taxpayer', sortable: true },
    { key: 'tin', label: 'TIN', sortable: true },
    { key: 'type', label: 'Audit Type', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'riskLevel', label: 'Risk Level', filterable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'progress', label: 'Progress', sortable: true },
  ];

  const findingsColumns: Column[] = [
    { key: 'auditId', label: 'Audit ID', sortable: true },
    { key: 'taxpayer', label: 'Taxpayer', sortable: true },
    { key: 'finding', label: 'Finding', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'severity', label: 'Severity', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const tinRequestColumns: Column[] = [
    { key: 'businessName', label: 'Business Name', sortable: true },
    { key: 'businessType', label: 'Type', filterable: true },
    { key: 'contactEmail', label: 'Email', sortable: true },
    { key: 'contactPhone', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'submittedDate', label: 'Submitted', sortable: true },
  ];

  const handleTinApproval = async (requestId: string, approved: boolean) => {
    if (!user) return;

    setIsProcessing(true);
    
    try {
      const updates: Partial<TinRequest> = {
        status: approved ? 'approved' : 'rejected',
        reviewedDate: new Date().toISOString(),
        reviewedBy: user.id,
        reviewComments: reviewComments || (approved ? 'Application approved' : 'Application rejected'),
      };

      if (approved) {
        updates.generatedTin = dataService.generateTinNumber();
      }

      dataService.updateTinRequest(requestId, updates);
      loadTinRequests();
      setSelectedRequest(null);
      setReviewComments('');
      
      toast.success(`TIN application ${approved ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      toast.error('Failed to process TIN application');
    } finally {
      setIsProcessing(false);
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, any[]> = {
      dashboard: [{ label: 'Auditor Dashboard' }],
      audits: [{ label: 'Auditor Dashboard' }, { label: 'Assigned Audits' }],
      'tin-requests': [{ label: 'Auditor Dashboard' }, { label: 'TIN Applications' }],
      findings: [{ label: 'Auditor Dashboard' }, { label: 'Findings & Reports' }],
      penalties: [{ label: 'Auditor Dashboard' }, { label: 'Penalties' }],
      appeals: [{ label: 'Auditor Dashboard' }, { label: 'Appeals' }],
    };
    return breadcrumbMap[activeItem] || [{ label: 'Auditor Dashboard' }];
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Active Audits"
                value="8"
                change={{ value: '+2 this week', type: 'increase' }}
                icon={Search}
                badge={{ text: 'In Progress', variant: 'secondary' }}
              />
              <StatsCard
                title="TIN Applications"
                value={tinRequests.filter(req => req.status === 'pending').length.toString()}
                change={{ value: `${tinRequests.filter(req => req.status === 'approved').length} approved this month`, type: 'increase' }}
                icon={Users}
                badge={{ text: 'Pending Review', variant: 'secondary' }}
              />
              <StatsCard
                title="Completed This Month"
                value="12"
                change={{ value: '+20% from last month', type: 'increase' }}
                icon={CheckCircle}
              />
              <StatsCard
                title="High Risk Cases"
                value="3"
                change={{ value: '1 escalated', type: 'neutral' }}
                icon={AlertTriangle}
                badge={{ text: 'Priority', variant: 'destructive' }}
              />
            </div>

            {/* Current Audit Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Current Audit Progress</CardTitle>
                <CardDescription>Track progress on your assigned audits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assignedAudits.filter(audit => audit.status === 'in_progress').map((audit) => (
                    <div key={audit.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{audit.taxpayer} ({audit.tin})</h4>
                          <p className="text-sm text-muted-foreground">{audit.type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getRiskLevelColor(audit.riskLevel)}>
                            {audit.riskLevel} risk
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Due: {audit.dueDate}
                          </span>
                        </div>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{audit.progress}% Complete</span>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveItem('tin-requests')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Review TIN Applications
                  </CardTitle>
                  <CardDescription>Approve or reject TIN registration requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Review Applications</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2 text-primary" />
                    Start New Audit
                  </CardTitle>
                  <CardDescription>Begin audit procedures for assigned case</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Start Audit</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Generate Report
                  </CardTitle>
                  <CardDescription>Create audit findings report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Create Report</Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Findings</CardTitle>
                  <CardDescription>Latest audit discoveries</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={recentFindings}
                    columns={findingsColumns}
                    searchable={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Audits requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedAudits.filter(audit => audit.status !== 'completed').map((audit) => (
                      <div key={audit.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{audit.taxpayer}</h4>
                          <p className="text-sm text-muted-foreground">{audit.type}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getRiskLevelColor(audit.riskLevel)}>
                            {audit.riskLevel}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Due: {audit.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'tin-requests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">TIN Applications</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <StatsCard
                title="Pending Applications"
                value={tinRequests.filter(req => req.status === 'pending').length.toString()}
                change={{ value: 'Awaiting review', type: 'neutral' }}
                icon={Clock}
                badge={{ text: 'Action Required', variant: 'destructive' }}
              />
              <StatsCard
                title="Approved This Month"
                value={tinRequests.filter(req => req.status === 'approved').length.toString()}
                change={{ value: '+50% from last month', type: 'increase' }}
                icon={UserCheck}
              />
              <StatsCard
                title="Rejected Applications"
                value={tinRequests.filter(req => req.status === 'rejected').length.toString()}
                change={{ value: 'Last 30 days', type: 'neutral' }}
                icon={UserX}
                badge={{ text: 'Rejected', variant: 'secondary' }}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="TIN Application Requests"
                  data={tinRequests.map(request => ({
                    ...request,
                    submittedDate: new Date(request.submittedDate).toLocaleDateString(),
                  }))}
                  columns={tinRequestColumns}
                  searchable={true}
                  actions={{
                    view: (item) => setSelectedRequest(item as TinRequest),
                  }}
                  pagination={{
                    currentPage: 1,
                    totalPages: Math.ceil(tinRequests.length / 10),
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>

            {/* TIN Request Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Review TIN Application</DialogTitle>
                  <DialogDescription>
                    Review and approve or reject this TIN registration request
                  </DialogDescription>
                </DialogHeader>

                {selectedRequest && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Business Name:</p>
                        <p className="text-muted-foreground">{selectedRequest.businessName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Business Type:</p>
                        <p className="text-muted-foreground capitalize">{selectedRequest.businessType}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-medium">Business Address:</p>
                        <p className="text-muted-foreground">{selectedRequest.businessAddress}</p>
                      </div>
                      <div>
                        <p className="font-medium">Contact Phone:</p>
                        <p className="text-muted-foreground">{selectedRequest.contactPhone}</p>
                      </div>
                      <div>
                        <p className="font-medium">Contact Email:</p>
                        <p className="text-muted-foreground">{selectedRequest.contactEmail}</p>
                      </div>
                      {selectedRequest.tradeLicense && (
                        <div>
                          <p className="font-medium">Trade License:</p>
                          <p className="text-muted-foreground">{selectedRequest.tradeLicense}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">NID Number:</p>
                        <p className="text-muted-foreground">{selectedRequest.nidNumber}</p>
                      </div>
                      <div>
                        <p className="font-medium">Submitted Date:</p>
                        <p className="text-muted-foreground">{new Date(selectedRequest.submittedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {selectedRequest.status === 'pending' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="reviewComments">Review Comments</Label>
                          <Textarea
                            id="reviewComments"
                            placeholder="Enter your review comments..."
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Please review all provided information carefully before making a decision. 
                            If approved, a TIN will be automatically generated for this applicant.
                          </AlertDescription>
                        </Alert>

                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => handleTinApproval(selectedRequest.id, false)}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Application
                          </Button>
                          <Button
                            onClick={() => handleTinApproval(selectedRequest.id, true)}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve & Generate TIN
                          </Button>
                        </div>
                      </>
                    )}

                    {selectedRequest.status !== 'pending' && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p>
                              <strong>Status:</strong> {selectedRequest.status.toUpperCase()}
                            </p>
                            {selectedRequest.generatedTin && (
                              <p>
                                <strong>Generated TIN:</strong> {selectedRequest.generatedTin}
                              </p>
                            )}
                            {selectedRequest.reviewComments && (
                              <p>
                                <strong>Comments:</strong> {selectedRequest.reviewComments}
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'audits':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Assigned Audits</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Request New Audit
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="All Assigned Audits"
                  data={assignedAudits}
                  columns={auditColumns}
                  actions={{
                    view: (item) => console.log('View audit:', item),
                    edit: (item) => console.log('Edit audit:', item),
                  }}
                  pagination={{
                    currentPage: 1,
                    totalPages: 5,
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'findings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Findings & Reports</h2>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Create New Report
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Findings"
                value="24"
                change={{ value: '+4 this month', type: 'increase' }}
                icon={AlertTriangle}
              />
              <StatsCard
                title="High Severity"
                value="6"
                change={{ value: '2 unresolved', type: 'neutral' }}
                icon={XCircle}
                badge={{ text: 'Critical', variant: 'destructive' }}
              />
              <StatsCard
                title="Potential Recovery"
                value="$156,000"
                change={{ value: '+15% this quarter', type: 'increase' }}
                icon={TrendingUp}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="All Findings"
                  data={recentFindings}
                  columns={findingsColumns}
                  selectable
                  actions={{
                    view: (item) => console.log('View finding:', item),
                    edit: (item) => console.log('Edit finding:', item),
                  }}
                  bulkActions={[
                    { label: 'Mark Resolved', action: (ids) => console.log('Resolve findings:', ids) },
                    { label: 'Escalate', action: (ids) => console.log('Escalate findings:', ids), variant: 'destructive' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
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