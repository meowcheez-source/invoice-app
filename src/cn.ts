import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CompanySettings } from '../types';
import { format } from 'date-fns';

export async function generateInvoicePDF(
  invoice: Invoice,
  company: CompanySettings
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor = [41, 128, 185] as [number, number, number]; // Blue
  const textColor = [44, 62, 80] as [number, number, number];
  const lightGray = [236, 240, 241] as [number, number, number];
  
  // Header Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 14, 25);
  
  // Company Details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, 14, 35);
  doc.text(`Phone: ${company.phone}`, 14, 40);
  if (company.email) {
    doc.text(`Email: ${company.email}`, 14, 45);
  }
  if (company.vatNumber) {
    doc.text(`VAT: ${company.vatNumber}`, 14, 50);
  }
  
  // Invoice Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 14, 25, { align: 'right' });
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 14, 35, { align: 'right' });
  doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, pageWidth - 14, 40, { align: 'right' });
  
  // Status Badge
  const statusColor = invoice.status === 'paid' ? [39, 174, 96] : [231, 76, 60];
  doc.setFillColor(...statusColor as [number, number, number]);
  doc.roundedRect(pageWidth - 50, 44, 36, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.status.toUpperCase(), pageWidth - 32, 49, { align: 'center' });
  
  // Bill To Section
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 14, 70);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer.name, 14, 78);
  doc.text(invoice.customer.phone, 14, 84);
  doc.text(invoice.customer.address, 14, 90);
  
  // Items Table
  const tableData = invoice.items.map(item => [
    item.serviceType,
    item.description,
    item.quantity.toString(),
    `AED ${item.price.toFixed(2)}`,
    `AED ${(item.quantity * item.price).toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Service Type', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });
  
  // Calculate Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals Section
  const totalsX = pageWidth - 80;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, finalY);
  doc.text(`AED ${invoice.subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
  
  if (invoice.includeVat) {
    doc.text('VAT (5%):', totalsX, finalY + 7);
    doc.text(`AED ${invoice.vatAmount.toFixed(2)}`, pageWidth - 14, finalY + 7, { align: 'right' });
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, finalY + 18);
  doc.text(`AED ${invoice.total.toFixed(2)}`, pageWidth - 14, finalY + 18, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Notes:', 14, finalY + 30);
    doc.text(invoice.notes, 14, finalY + 36);
  }
  
  // Signature
  if (invoice.signature) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signature:', 14, finalY + 55);
    
    // Add signature image
    try {
      doc.addImage(invoice.signature, 'PNG', 14, finalY + 58, 50, 25);
    } catch (e) {
      // If signature fails to load, skip it
    }
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(...lightGray);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

export async function sharePDF(doc: jsPDF, filename: string): Promise<void> {
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to download
      downloadPDF(doc, filename);
    }
  } else {
    // Fallback to download
    downloadPDF(doc, filename);
  }
}

export function shareViaWhatsApp(invoice: Invoice): void {
  const message = `Hi ${invoice.customer.name},\n\nThank you for choosing our services.\n\nInvoice #: ${invoice.invoiceNumber}\nTotal Amount: AED ${invoice.total.toFixed(2)}\nStatus: ${invoice.status.toUpperCase()}\n\nPlease find the attached invoice PDF.\n\nBest regards`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${invoice.customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}
