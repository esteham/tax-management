import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useAuth } from '../App';
import { Shield, ArrowLeft, HelpCircle, FileText, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

export function FAQPage() {
  const { setCurrentPage } = useAuth();

  const faqSections = [
    {
      title: 'Tax Filing',
      icon: FileText,
      items: [
        {
          question: 'What documents do I need to file my tax return?',
          answer: 'You will need your TIN (Tax Identification Number), National ID, income statements, expense receipts, bank statements, and any other relevant financial documents. For businesses, you\'ll also need your trade license and audited financial statements.'
        },
        {
          question: 'When is the tax filing deadline?',
          answer: 'Individual tax returns are due by September 30th of each year. Corporate tax returns are due within 6 months of the end of their fiscal year. Extensions may be available upon request.'
        },
        {
          question: 'Can I file my return electronically?',
          answer: 'Yes! Our platform allows you to file your tax return electronically. Simply upload your documents, complete the online forms, and submit. You\'ll receive a confirmation once your return is processed.'
        },
        {
          question: 'What happens if I file my return late?',
          answer: 'Late filing may result in penalties and interest charges. The penalty is typically 5% of the unpaid tax for each month or part of a month that your return is late, up to a maximum of 25%.'
        }
      ]
    },
    {
      title: 'Payments',
      icon: DollarSign,
      items: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept bank transfers, online banking, credit/debit cards, and certified checks. All payments are processed securely through our encrypted payment gateway.'
        },
        {
          question: 'When do I need to pay my taxes?',
          answer: 'Tax payments are generally due at the same time as your return filing deadline. However, quarterly estimated payments may be required for certain taxpayers. You can set up automatic payments through our platform.'
        },
        {
          question: 'Can I pay my taxes in installments?',
          answer: 'Yes, installment payment plans may be available for qualifying taxpayers. Contact our support team or apply through your dashboard to set up a payment plan.'
        },
        {
          question: 'How do I get a receipt for my payment?',
          answer: 'Electronic receipts are automatically generated and sent to your email after each successful payment. You can also download receipts from your payment history in your dashboard.'
        }
      ]
    },
    {
      title: 'Audits & Compliance',
      icon: AlertTriangle,
      items: [
        {
          question: 'What triggers a tax audit?',
          answer: 'Audits can be triggered by various factors including unusual deductions, significant changes in income, random selection, or discrepancies in your tax return. Our system flags returns that may require review.'
        },
        {
          question: 'How long do I have to respond to an audit notice?',
          answer: 'You typically have 30 days to respond to an audit notice. The exact timeframe will be specified in your notice. It\'s important to respond promptly to avoid additional penalties.'
        },
        {
          question: 'What records should I keep for tax purposes?',
          answer: 'Keep all tax-related documents for at least 7 years, including receipts, bank statements, invoices, and tax returns. Digital copies stored securely are acceptable.'
        },
        {
          question: 'Can I appeal an audit decision?',
          answer: 'Yes, you have the right to appeal audit decisions. You can file an appeal through our platform or contact our support team for assistance with the appeals process.'
        }
      ]
    },
    {
      title: 'Account & Technical',
      icon: HelpCircle,
      items: [
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.'
        },
        {
          question: 'Is my data secure on this platform?',
          answer: 'Yes, we use bank-level security with SSL encryption, secure data centers, and regular security audits. Your personal and financial information is protected with the highest security standards.'
        },
        {
          question: 'Can I authorize someone else to access my account?',
          answer: 'Yes, you can grant limited access to tax professionals or accountants through our delegation feature. This allows them to file returns and view information on your behalf while maintaining security.'
        },
        {
          question: 'How do I update my contact information?',
          answer: 'Log into your account and go to "My Profile" section where you can update your email, phone number, address, and other contact details.'
        }
      ]
    }
  ];

  const taxGuidelines = [
    {
      title: 'Tax Rates for Current Year',
      content: 'Income tax rates range from 5% to 25% based on income brackets. Corporate tax rate is 25% for most companies, with special rates for specific sectors.'
    },
    {
      title: 'Deductible Expenses',
      content: 'Business expenses, charitable donations, education expenses, and medical expenses may be deductible. Keep proper documentation for all claimed deductions.'
    },
    {
      title: 'Important Deadlines',
      content: 'Individual returns: September 30th. Corporate returns: 6 months after fiscal year end. Quarterly payments: Due 15th of each quarter.'
    },
    {
      title: 'Required Documentation',
      content: 'TIN certificate, National ID, income statements, bank statements, expense receipts, and for businesses: trade license and audited financials.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('landing')}
              className="inline-flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">TaxPro</span>
            </div>
            <Button onClick={() => setCurrentPage('login')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Tax Guidelines & FAQ
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn about tax requirements, deadlines, and best practices.
          </p>
        </div>

        {/* Tax Guidelines */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-3 text-primary" />
            Current Tax Guidelines
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {taxGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{guideline.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{guideline.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <HelpCircle className="h-6 w-6 mr-3 text-primary" />
            Frequently Asked Questions
          </h2>

          {faqSections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <section.icon className="h-5 w-5 mr-3 text-primary" />
                  {section.title}
                </CardTitle>
                <CardDescription>
                  Common questions about {section.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`item-${sectionIndex}-${itemIndex}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12">
          <CardHeader className="text-center">
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Can't find the answer you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-muted-foreground">support@taxpro.com</p>
                <p className="text-muted-foreground">Response within 24 hours</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Phone Support</h4>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
                <p className="text-muted-foreground">Mon-Fri, 9AM-6PM</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Live Chat</h4>
                <p className="text-muted-foreground">Available in dashboard</p>
                <p className="text-muted-foreground">Real-time assistance</p>
              </div>
            </div>
            <Button onClick={() => setCurrentPage('login')} className="mt-6">
              Access Support Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}