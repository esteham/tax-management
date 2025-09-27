import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../App';
import { Shield, FileText, DollarSign, BarChart3, Clock, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export function LandingPage() {
  const { setCurrentPage } = useAuth();

  const features = [
    {
      icon: FileText,
      title: "Easy Tax Filing",
      description: "Simplified tax return filing process with guided steps and automatic calculations."
    },
    {
      icon: DollarSign,
      title: "Payment Management",
      description: "Secure payment processing with multiple payment options and automatic invoice generation."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive reporting and analytics to track tax compliance and financial insights."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level security with full compliance to tax regulations and data protection laws."
    },
    {
      icon: Clock,
      title: "Real-time Processing",
      description: "Instant processing of tax returns with real-time status updates and notifications."
    },
    {
      icon: Users,
      title: "Multi-role Support",
      description: "Support for taxpayers, auditors, accountants, and administrators with role-based access."
    }
  ];

  const benefits = [
    "Automated tax calculations and validations",
    "Electronic filing with government systems",
    "Secure document storage and management",
    "Audit trail and compliance reporting",
    "24/7 customer support and assistance",
    "Mobile-responsive design for anywhere access"
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-foreground">TaxPro</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage('faq')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tax Guidelines
              </button>
              <button
                onClick={() => setCurrentPage('login')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <Button onClick={() => setCurrentPage('register')}>
                Get Started
              </Button>
            </nav>
            <div className="md:hidden">
              <Button variant="outline" onClick={() => setCurrentPage('login')}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Automated Tax Management
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your tax compliance with our comprehensive platform. File returns, manage payments, and stay compliant with automated workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setCurrentPage('register')} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setCurrentPage('login')} className="text-lg px-8">
              Login to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Tax Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools for individuals, businesses, and tax professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose TaxPro?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of individuals and businesses who trust TaxPro for their tax management needs.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:text-center">
              <Card className="p-8 bg-primary text-primary-foreground">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6 opacity-90">
                    Join our platform today and experience seamless tax management.
                  </p>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setCurrentPage('register')}
                  >
                    Create Free Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="text-lg font-semibold">TaxPro</span>
              </div>
              <p className="text-background/80">
                Professional tax management platform for modern businesses and individuals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-background/80">
                <li><button onClick={() => setCurrentPage('faq')}>Tax Guidelines</button></li>
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-background/80">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>API Documentation</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-background/80">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Compliance</li>
                <li>Certifications</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2024 TaxPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}