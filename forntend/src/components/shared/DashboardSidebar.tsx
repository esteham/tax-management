import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useAuth, UserRole } from '../../App';
import { 
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Receipt,
  Search,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  User,
  Calendar,
  Clock,
  Building,
  Database,
  Activity,
  LogOut
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  section?: string;
}

interface DashboardSidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  isCollapsed?: boolean;
}

export function DashboardSidebar({ activeItem, setActiveItem, isCollapsed = false }: DashboardSidebarProps) {
  const { user, logout } = useAuth();

  const getMenuItems = (role: UserRole): MenuItem[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: 'Users', icon: Users, section: 'Management' },
          { id: 'roles', label: 'Roles & Permissions', icon: Shield },
          { id: 'taxpayers', label: 'Taxpayers', icon: User },
          { id: 'returns', label: 'Tax Returns', icon: FileText, badge: '12' },
          { id: 'payments', label: 'Payments & Invoices', icon: DollarSign, section: 'Finance' },
          { id: 'audits', label: 'Audits', icon: Search },
          { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
          { id: 'appeals', label: 'Appeals', icon: MessageSquare },
          { id: 'notices', label: 'Notices', icon: Receipt },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Analytics' },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ];

      case 'taxpayer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User, section: 'Account' },
          { id: 'file-return', label: 'File Return', icon: FileText },
          { id: 'payments', label: 'Payments', icon: DollarSign, section: 'Finance' },
          { id: 'invoices', label: 'Invoices', icon: Receipt },
          { id: 'refunds', label: 'Refund Requests', icon: DollarSign, badge: '2' },
          { id: 'notices', label: 'Notices', icon: MessageSquare, section: 'Communication' },
          { id: 'messages', label: 'Messages', icon: MessageSquare }
        ];

      case 'auditor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'audits', label: 'Assigned Audits', icon: Search, badge: '8' },
          { id: 'findings', label: 'Findings & Reports', icon: FileText },
          { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
          { id: 'appeals', label: 'Appeals', icon: MessageSquare }
        ];

      case 'accountant':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'clients', label: 'My Clients', icon: Users, badge: '24' },
          { id: 'file-returns', label: 'File Returns for Clients', icon: FileText },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'messages', label: 'Messages', icon: MessageSquare }
        ];

      case 'super_admin':
        return [
          { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
          { id: 'admins', label: 'Manage Admins', icon: Shield, section: 'Administration' },
          { id: 'system-config', label: 'System Configuration', icon: Settings },
          { id: 'global-reports', label: 'Global Reports', icon: BarChart3, section: 'Analytics' },
          { id: 'security-logs', label: 'Security & Logs', icon: Activity },
          { id: 'database', label: 'Database Management', icon: Database }
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems(user?.role || 'taxpayer');
  let currentSection = '';

  return (
    <div className="bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-4">
        <h3 className="text-sidebar-foreground font-semibold text-sm uppercase tracking-wide">
          {user?.role === 'super_admin' ? 'Super Admin' : 
           user?.role === 'taxpayer' ? 'Taxpayer Portal' :
           user?.role === 'admin' ? 'Admin Panel' :
           user?.role === 'auditor' ? 'Auditor Tools' :
           'Accountant Hub'}
        </h3>
      </div>

      <nav className="flex-1 px-2 pb-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isNewSection = item.section && item.section !== currentSection;
            if (isNewSection) {
              currentSection = item.section;
            }

            return (
              <React.Fragment key={item.id}>
                {isNewSection && (
                  <>
                    <Separator className="my-3 bg-sidebar-border" />
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide">
                        {item.section}
                      </h4>
                    </div>
                  </>
                )}
                <Button
                  variant={activeItem === item.id ? "default" : "ghost"}
                  className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    activeItem === item.id 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : ''
                  }`}
                  onClick={() => setActiveItem(item.id)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-3"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
        <div className="text-xs text-sidebar-foreground/60">
          TaxPro v2.1.0
        </div>
      </div>
    </div>
  );
}