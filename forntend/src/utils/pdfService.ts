// PDF generation service for invoices and TIN certificates
import { jsPDF } from 'jspdf@2.5.1';
import { TaxReturn, Invoice, UserProfile, PaymentInvoice } from './dataService';

export class PDFService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  generateInvoice(taxReturn: TaxReturn, userProfile: UserProfile): string {
    this.doc = new jsPDF();
    
    // Header
    this.addHeader('TAX INVOICE');
    
    // Invoice details
    this.doc.setFontSize(12);
    this.doc.text(`Invoice ID: INV-${taxReturn.year}-${taxReturn.id.slice(-6)}`, 20, 60);
    this.doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 70);
    this.doc.text(`Due Date: ${new Date(taxReturn.dueDate).toLocaleDateString()}`, 20, 80);
    this.doc.text(`Tax Year: ${taxReturn.year}`, 20, 90);

    // Taxpayer information
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Taxpayer Information:', 20, 110);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Name: ${userProfile.name}`, 20, 125);
    this.doc.text(`TIN: ${userProfile.tinNumber}`, 20, 135);
    this.doc.text(`Email: ${userProfile.email}`, 20, 145);
    if (userProfile.address) {
      this.doc.text(`Address: ${userProfile.address}`, 20, 155);
    }

    // Tax calculation details
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Tax Calculation:', 20, 175);

    // Create table for tax details
    const tableData = [
      ['Total Income', `BDT ${taxReturn.income.toLocaleString()}`],
      ['Total Deductions', `BDT ${taxReturn.deductions.toLocaleString()}`],
      ['Taxable Income', `BDT ${taxReturn.taxableIncome.toLocaleString()}`],
      ['Tax Liability', `BDT ${taxReturn.taxLiability.toLocaleString()}`]
    ];

    let yPosition = 190;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    tableData.forEach(([label, value]) => {
      this.doc.text(label + ':', 20, yPosition);
      this.doc.text(value, 120, yPosition);
      yPosition += 10;
    });

    // Total amount box
    this.doc.setDrawColor(0);
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(20, yPosition + 10, 170, 20, 'FD');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Total Amount Due:', 25, yPosition + 22);
    this.doc.text(`BDT ${taxReturn.taxLiability.toLocaleString()}`, 120, yPosition + 22);

    // Payment instructions
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Payment Instructions:', 20, yPosition + 45);
    this.doc.text('• Pay online through TaxPro portal', 20, yPosition + 55);
    this.doc.text('• Use bank transfer to National Revenue Board', 20, yPosition + 65);
    this.doc.text('• Payment must be made before the due date', 20, yPosition + 75);

    // Footer
    this.addFooter();

    // Return as base64 string
    return this.doc.output('datauristring');
  }

  generateTINCertificate(userProfile: UserProfile): string {
    this.doc = new jsPDF();
    
    // Header
    this.addHeader('TAX IDENTIFICATION NUMBER (TIN) CERTIFICATE');
    
    // Certificate body
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('This is to certify that:', 20, 80);

    // Taxpayer details in certificate format
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(userProfile.name.toUpperCase(), 20, 100);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    if (userProfile.address) {
      this.doc.text(`Address: ${userProfile.address}`, 20, 115);
    }
    if (userProfile.phone) {
      this.doc.text(`Phone: ${userProfile.phone}`, 20, 125);
    }
    this.doc.text(`Email: ${userProfile.email}`, 20, 135);

    // TIN number highlight
    this.doc.setDrawColor(0);
    this.doc.setFillColor(230, 230, 255);
    this.doc.rect(20, 150, 170, 25, 'FD');
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TIN NUMBER:', 25, 165);
    this.doc.text(userProfile.tinNumber, 25, 175);

    // Certificate statement
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('has been assigned the above Tax Identification Number (TIN) and is', 20, 195);
    this.doc.text('authorized to conduct tax-related activities in Bangladesh.', 20, 205);

    // Registration details
    this.doc.text(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`, 20, 225);
    this.doc.text(`Certificate Issue Date: ${new Date().toLocaleDateString()}`, 20, 235);

    // Validity statement
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('This certificate is valid until further notice from the National Revenue Board.', 20, 255);
    this.doc.text('For verification, please visit www.taxpro.gov.bd or call +880-2-9999999', 20, 265);

    // Authority signature area
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('_________________________', 120, 250);
    this.doc.text('Authorized Signature', 120, 260);
    this.doc.text('National Revenue Board', 120, 270);

    // Footer
    this.addFooter();

    return this.doc.output('datauristring');
  }

  generatePaymentInvoice(paymentInvoice: PaymentInvoice, userProfile: UserProfile): string {
    this.doc = new jsPDF();
    
    // Header
    this.addHeader('PAYMENT INVOICE');
    
    // Invoice details
    this.doc.setFontSize(12);
    this.doc.text(`Invoice Number: ${paymentInvoice.invoiceNumber}`, 20, 60);
    this.doc.text(`Payment Date: ${new Date(paymentInvoice.paymentDate).toLocaleDateString()}`, 20, 70);
    this.doc.text(`Transaction ID: ${paymentInvoice.transactionId}`, 20, 80);
    if (paymentInvoice.taxYear) {
      this.doc.text(`Tax Year: ${paymentInvoice.taxYear}`, 20, 90);
    }

    // Taxpayer information
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Bill To:', 20, 110);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Name: ${userProfile.name}`, 20, 125);
    this.doc.text(`TIN: ${userProfile.tinNumber || 'N/A'}`, 20, 135);
    this.doc.text(`Email: ${userProfile.email}`, 20, 145);
    if (userProfile.address) {
      this.doc.text(`Address: ${userProfile.address}`, 20, 155);
    }

    // Payment details
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Payment Details:', 20, 175);

    // Create table for payment details
    const tableData = [
      ['Description', paymentInvoice.description],
      ['Payment Method', paymentInvoice.paymentMethod.toUpperCase().replace('_', ' ')],
      ['Transaction ID', paymentInvoice.transactionId],
      ['Payment Status', 'PAID']
    ];

    let yPosition = 190;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    tableData.forEach(([label, value]) => {
      this.doc.text(label + ':', 20, yPosition);
      this.doc.text(value, 120, yPosition);
      yPosition += 10;
    });

    // Total amount box
    this.doc.setDrawColor(0);
    this.doc.setFillColor(230, 255, 230);
    this.doc.rect(20, yPosition + 10, 170, 20, 'FD');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Total Amount Paid:', 25, yPosition + 22);
    this.doc.text(`BDT ${paymentInvoice.amount.toLocaleString()}`, 120, yPosition + 22);

    // Payment confirmation
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Payment Confirmation:', 20, yPosition + 45);
    this.doc.text('✓ Payment has been successfully processed', 20, yPosition + 55);
    this.doc.text('✓ This invoice serves as proof of payment', 20, yPosition + 65);
    this.doc.text('✓ Keep this invoice for your tax records', 20, yPosition + 75);

    // Important notice
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('IMPORTANT: This is a computer-generated invoice and does not require a signature.', 20, yPosition + 95);
    this.doc.text('For any queries, please contact TaxPro support at support@taxpro.gov.bd', 20, yPosition + 105);

    // Footer
    this.addFooter();

    return this.doc.output('datauristring');
  }

  private addHeader(title: string) {
    // Government logo area (placeholder)
    this.doc.setDrawColor(0);
    this.doc.rect(20, 10, 30, 30);
    this.doc.setFontSize(8);
    this.doc.text('GOVT', 32, 28);
    this.doc.text('LOGO', 32, 35);

    // Header text
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GOVERNMENT OF BANGLADESH', 60, 20);
    
    this.doc.setFontSize(14);
    this.doc.text('NATIONAL REVENUE BOARD', 60, 30);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('TAX ADMINISTRATION SYSTEM', 60, 40);

    // Title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, 55);

    // Line separator
    this.doc.setDrawColor(0);
    this.doc.line(20, 58, 190, 58);
  }

  private addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Line separator
    this.doc.setDrawColor(0);
    this.doc.line(20, pageHeight - 30, 190, pageHeight - 30);
    
    // Footer text
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('TaxPro - Automated Tax Management System', 20, pageHeight - 20);
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
    
    // Page number
    this.doc.text('Page 1 of 1', 160, pageHeight - 10);
  }

  downloadPDF(dataUri: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const pdfService = new PDFService();