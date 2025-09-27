import React, { useState } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { StatsCard } from '../shared/StatsCard';
import { DataTable, Column } from '../shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  Database, 
  Activity, 
  Users, 
  Server,
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  Lock,
  Globe,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function SuperAdminDashboard() {
  const [activeItem, setActiveItem] = useState('overview');

  // Mock data
  const systemStats = [
    { metric: 'Total Users', value: 12457, change: '+5.2%', period: 'vs last month' },
    { metric: 'Active Sessions', value: 1834, change: '+12%', period: 'vs yesterday' },
    { metric: 'System Uptime', value: '99.9%', change: '+0.1%', period: 'this month' },
    { metric: 'Storage Used', value: '78%', change: '+2%', period: 'vs last week' },
  ];

  const adminUsers = [
    { 
      id: '1', 
      name: 'John Admin', 
      email: 'john.admin@taxpro.com', 
      role: 'System Admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30',
      permissions: 'Full Access'
    },
    { 
      id: '2', 
      name: 'Sarah Manager', 
      email: 'sarah.manager@taxpro.com', 
      role: 'Regional Admin',
      status: 'active',
      lastLogin: '2024-01-15 09:15',
      permissions: 'Regional Access'
    },
    { 
      id: '3', 
      name: 'Mike Support', 
      email: 'mike.support@taxpro.com', 
      role: 'Support Admin',
      status: 'inactive',
      lastLogin: '2024-01-10 16:45',
      permissions: 'Limited Access'
    },
  ];

  const securityLogs = [
    { 
      id: '1', 
      event: 'Failed Login Attempt', 
      user: 'unknown@attacker.com',
      ip: '192.168.1.100',
      severity: 'high',
      timestamp: '2024-01-15 14:30:25',
      status: 'blocked'
    },
    { 
      id: '2', 
      event: 'Admin Role Changed', 
      user: 'john.admin@taxpro.com',
      ip: '10.0.0.15',
      severity: 'medium',
      timestamp: '2024-01-15 11:15:10',
      status: 'approved'
    },
    { 
      id: '3', 
      event: 'System Configuration Updated', 
      user: 'system@taxpro.com',
      ip: '127.0.0.1',
      severity: 'low',
      timestamp: '2024-01-15 08:00:00',
      status: 'completed'
    },
  ];

  const usageData = [
    { month: 'Jul', users: 8420, transactions: 15240, revenue: 124000 },
    { month: 'Aug', users: 9180, transactions: 16800, revenue: 135000 },
    { month: 'Sep', users: 10250, transactions: 18900, revenue: 148000 },
    { month: 'Oct', users: 11100, transactions: 20400, revenue: 162000 },
    { month: 'Nov', users: 11850, transactions: 22100, revenue: 178000 },
    { month: 'Dec', users: 12457, transactions: 23750, revenue: 195000 },
  ];

  const systemHealth = [
    { name: 'Database', value: 95, color: '#10b981' },
    { name: 'API', value: 98, color: '#3b82f6' },
    { name: 'Storage', value: 88, color: '#f59e0b' },
    { name: 'Network', value: 92, color: '#8b5cf6' },
  ];

  const adminColumns: Column[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', filterable: true },
    { key: 'status', label: 'Status', filterable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { key: 'permissions', label: 'Permissions', filterable: true },
  ];

  const securityColumns: Column[] = [
    { key: 'event', label: 'Event', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'ip', label: 'IP Address', sortable: true },
    { key: 'severity', label: 'Severity', filterable: true },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'status', label: 'Status', filterable: true },
  ];

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, any[]> = {
      overview: [{ label: 'Super Admin Dashboard' }],
      admins: [{ label: 'Super Admin Dashboard' }, { label: 'Manage Admins' }],
      'system-config': [{ label: 'Super Admin Dashboard' }, { label: 'System Configuration' }],
      'global-reports': [{ label: 'Super Admin Dashboard' }, { label: 'Global Reports' }],
      'security-logs': [{ label: 'Super Admin Dashboard' }, { label: 'Security & Logs' }],
      database: [{ label: 'Super Admin Dashboard' }, { label: 'Database Management' }],
    };
    return breadcrumbMap[activeItem] || [{ label: 'Super Admin Dashboard' }];
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
      case 'overview':
        return (
          <div className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Users"
                value="12,457"
                change={{ value: '+5.2% from last month', type: 'increase' }}
                icon={Users}
              />
              <StatsCard
                title="System Uptime"
                value="99.9%"
                change={{ value: '+0.1% this month', type: 'increase' }}
                icon={Server}
                badge={{ text: 'Excellent', variant: 'default' }}
              />
              <StatsCard
                title="Active Sessions"
                value="1,834"
                change={{ value: '+12% vs yesterday', type: 'increase' }}
                icon={Activity}
              />
              <StatsCard
                title="Security Alerts"
                value="3"
                change={{ value: '2 high priority', type: 'neutral' }}
                icon={AlertTriangle}
                badge={{ text: 'Monitor', variant: 'destructive' }}
              />
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>Real-time monitoring of system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {systemHealth.map((component) => (
                      <div key={component.name} className="flex items-center justify-between">
                        <span className="font-medium">{component.name}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${component.value}%`,
                                backgroundColor: component.color,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{component.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={systemHealth}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {systemHealth.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Analytics */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Platform user growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Volume</CardTitle>
                  <CardDescription>Monthly transaction processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security monitoring alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={securityLogs.slice(0, 5)}
                  columns={securityColumns}
                  searchable={false}
                />
                <Button variant="outline" className="w-full mt-4" onClick={() => setActiveItem('security-logs')}>
                  View All Security Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'admins':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Administrators</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Admins"
                value="12"
                change={{ value: '+2 this month', type: 'increase' }}
                icon={Shield}
              />
              <StatsCard
                title="Active Today"
                value="8"
                change={{ value: '67% engagement', type: 'increase' }}
                icon={Activity}
              />
              <StatsCard
                title="Pending Approvals"
                value="3"
                change={{ value: '2 critical', type: 'neutral' }}
                icon={Lock}
                badge={{ text: 'Review', variant: 'secondary' }}
              />
              <StatsCard
                title="Global Access"
                value="4"
                change={{ value: 'Super admins', type: 'neutral' }}
                icon={Globe}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="Administrator Accounts"
                  data={adminUsers}
                  columns={adminColumns}
                  selectable
                  actions={{
                    view: (item) => console.log('View admin:', item),
                    edit: (item) => console.log('Edit admin:', item),
                  }}
                  bulkActions={[
                    { label: 'Activate', action: (ids) => console.log('Activate admins:', ids) },
                    { label: 'Suspend', action: (ids) => console.log('Suspend admins:', ids), variant: 'destructive' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'security-logs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Security & Audit Logs</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">Export Logs</Button>
                <Button>Real-time Monitor</Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              <StatsCard
                title="Security Events Today"
                value="247"
                change={{ value: '-15% vs yesterday', type: 'decrease' }}
                icon={Shield}
              />
              <StatsCard
                title="Failed Logins"
                value="12"
                change={{ value: '3 blocked IPs', type: 'neutral' }}
                icon={Lock}
                badge={{ text: 'Monitored', variant: 'secondary' }}
              />
              <StatsCard
                title="High Severity"
                value="3"
                change={{ value: '1 unresolved', type: 'neutral' }}
                icon={AlertTriangle}
                badge={{ text: 'Critical', variant: 'destructive' }}
              />
              <StatsCard
                title="System Changes"
                value="8"
                change={{ value: '5 config updates', type: 'neutral' }}
                icon={Settings}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <DataTable
                  title="Security Event Log"
                  data={securityLogs}
                  columns={securityColumns}
                  selectable
                  actions={{
                    view: (item) => console.log('View log:', item),
                  }}
                  bulkActions={[
                    { label: 'Mark Reviewed', action: (ids) => console.log('Mark reviewed:', ids) },
                    { label: 'Export Selected', action: (ids) => console.log('Export logs:', ids) },
                  ]}
                  pagination={{
                    currentPage: 1,
                    totalPages: 25,
                    onPageChange: (page) => console.log('Page change:', page),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'global-reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Global Reports & Analytics</h2>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Revenue"
                value="$1.95M"
                change={{ value: '+23% this quarter', type: 'increase' }}
                icon={TrendingUp}
              />
              <StatsCard
                title="Platform Usage"
                value="95.4%"
                change={{ value: 'Satisfaction rate', type: 'increase' }}
                icon={Activity}
              />
              <StatsCard
                title="Global Compliance"
                value="98.7%"
                change={{ value: '+1.2% improvement', type: 'increase' }}
                icon={Shield}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Platform revenue trends and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
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