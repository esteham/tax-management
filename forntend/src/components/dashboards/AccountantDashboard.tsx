import React, { useState } from 'react';
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
  Calendar, 
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export function AccountantDashboard() {
  const [activeItem, setActiveItem] = useState('dashboard');

  // Mock data
  const clients = [
    { 
      id: '1', 
      name: 'John Smith', 
      tin: 'TIN123456', 
      type: 'Individual', 
      status: 'active',
      lastReturn: '2023-12-15',
      nextDeadline: '2024-09-30',
      outstandingTasks: 2
    },
    { 
      id: '2', 
      name: 'ABC Corp', 
      tin: 'TIN789012', 
      type: 'Corporate', 
      status: 'active',
      lastReturn: '2024-01-10',
      nextDeadline: '2024-07-31',
      outstandingTasks: 1
    },
    { 
      id: '3', 
      name: 'Jane Doe', 
      tin: 'TIN345678', 
      type: 'Individual', 
      status: 'inactive',
      lastReturn: '2023-09-15',
      nextDeadline: '2024-09-30',
      outstandingTasks: 0
    },
  ];

  const recentReturns = [
    { 
      id: '1', 
      client: 'ABC Corp', 
      type: 'Corporate Income Tax', 
      status: 'filed', 
      amount: 15000,
      filedDate: '2024-01-10',
      dueDate: '2024-01-31'
    },
    { 
      id: '2', 
      client: 'John Smith', 
      type: 'Individual Income Tax', 
      status: 'in_progress', 
      amount: 2500,
      filedDate: null,
      dueDate: '2024-09-30'
    },
    { 
      id: '3', 
      client: 'XYZ Ltd', 
      type: 'VAT Return', 
      status: 'draft', 
      amount: 800,
      filedDate: null,
      dueDate: '2024-04-20'
    },
  ];

  const clientColumns: Column[] = [
    { key: 'name', label: 'Client Name', sortable: true },
    { key: 'tin', label: 'TIN', sortable: true },
    { key: 'type', label: 'Type', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'lastReturn', label: 'Last Return', sortable: true },
    { key: 'nextDeadline', label: 'Next Deadline', sortable: true },
    { key: 'outstandingTasks', label: 'Tasks', sortable: true },
  ];

  const returnsColumns: Column[] = [
    { key: 'client', label: 'Client', sortable: true },
    { key: 'type', label: 'Return Type', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'filedDate', label: 'Filed Date', sortable: true },
  ];

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, any[]> = {
      dashboard: [{ label: 'Accountant Dashboard' }],
      clients: [{ label: 'Accountant Dashboard' }, { label: 'My Clients' }],
      'file-returns': [{ label: 'Accountant Dashboard' }, { label: 'File Returns for Clients' }],
      payments: [{ label: 'Accountant Dashboard' }, { label: 'Payments' }],
      messages: [{ label: 'Accountant Dashboard' }, { label: 'Messages' }],
    };
    return breadcrumbMap[activeItem] || [{ label: 'Accountant Dashboard' }];
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Active Clients"
                value="24"
                change={{ value: '+3 new this month', type: 'increase' }}
                icon={Users}
              />
              <StatsCard
                title="Pending Returns"
                value="8"
                change={{ value: '5 due this month', type: 'neutral' }}
                icon={FileText}
                badge={{ text: 'Action Required', variant: 'destructive' }}
              />
              <StatsCard
                title="Revenue This Month"
                value="$8,500"
                change={{ value: '+18% from last month', type: 'increase' }}
                icon={DollarSign}
              />
              <StatsCard
                title="Completed Returns"
                value="156"
                change={{ value: 'This year', type: 'neutral' }}
                icon={CheckCircle}
              />
            </div>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Client returns and payments due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-medium">XYZ Ltd - VAT Return</h4>
                        <p className="text-sm text-muted-foreground">Due: April 20, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="destructive">5 days left</Badge>
                      <Button size="sm">Complete Now</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium">DEF Corp - Quarterly Payment</h4>
                        <p className="text-sm text-muted-foreground">Due: April 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">15 days left</Badge>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Individual Returns</h4>
                        <p className="text-sm text-muted-foreground">Due: September 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">158 days left</Badge>
                      <Button size="sm" variant="outline">Plan Ahead</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-primary" />
                    Add New Client
                  </CardTitle>
                  <CardDescription>Onboard a new client</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Add Client</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    File Return
                  </CardTitle>
                  <CardDescription>File a tax return for client</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Start Filing</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    Process Payment
                  </CardTitle>
                  <CardDescription>Handle client payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Process</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Client Messages
                  </CardTitle>
                  <CardDescription>Review client communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Messages
                    <Badge className="ml-2">3</Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Client Activity</CardTitle>
                  <CardDescription>Latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={clients.slice(0, 3)}
                    columns={clientColumns}
                    searchable={false}
                  />
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveItem('clients')}>
                    View All Clients
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Returns</CardTitle>
                  <CardDescription>Latest filing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={recentReturns.slice(0, 3)}
                    columns={returnsColumns}
                    searchable={false}
                  />
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveItem('file-returns')}>
                    File New Return
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Clients</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Clients"
                value="24"
                change={{ value: '+3 this month', type: 'increase' }}
                icon={Users}
              />
              <StatsCard
                title="Active This Month"
                value="18"
                change={{ value: '75% engagement', type: 'increase' }}
                icon={TrendingUp}
              />
              <StatsCard
                title="Overdue Tasks"
                value="5"
                change={{ value: '2 critical', type: 'neutral' }}
                icon={Clock}
                badge={{ text: 'Attention', variant: 'destructive' }}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="All Clients"
                  data={clients}
                  columns={clientColumns}
                  selectable
                  actions={{
                    view: (item) => console.log('View client:', item),
                    edit: (item) => console.log('Edit client:', item),
                  }}
                  bulkActions={[
                    { label: 'Send Reminder', action: (ids) => console.log('Send reminder to:', ids) },
                    { label: 'Archive', action: (ids) => console.log('Archive clients:', ids), variant: 'destructive' },
                  ]}
                  pagination={{
                    currentPage: 1,
                    totalPages: 3,
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'file-returns':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">File Returns for Clients</h2>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Start New Return
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="Client Returns"
                  data={recentReturns}
                  columns={returnsColumns}
                  actions={{
                    view: (item) => console.log('View return:', item),
                    edit: (item) => console.log('Edit return:', item),
                  }}
                  pagination={{
                    currentPage: 1,
                    totalPages: 4,
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