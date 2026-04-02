import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { 
  FileDown, 
  Share2, 
  MessageCircle, 
  ArrowLeft, 
  Edit2,
  CheckCircle,
  Building2,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Receipt
} from 'lucide-react';
import type { Invoice, CompanySettings } from '../types';
import { generateInvoicePDF, downloadPDF, sharePDF, shareViaWhatsApp } from '../lib/pdfGenerator';
import { saveInvoice, updateInvoiceStatus } from '../lib/storage';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
  company: CompanySettings;
  onBack: () => void;
  onEdit: () => void;
  onSaved: () => void;
}

export function InvoicePreview({ invoice, company, onBack, onEdit, onSaved }: InvoicePreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(invoice.status);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateInvoicePDF(invoice, company);
      downloadPDF(doc, `Invoice-${invoice.invoiceNumber}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateInvoicePDF(invoice, company);
      await sharePDF(doc, `Invoice-${invoice.invoiceNumber}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsApp = async () => {
    // First save the invoice
    await saveInvoice(invoice);
    // Then open WhatsApp
    shareViaWhatsApp(invoice);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveInvoice(invoice);
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'paid' | 'unpaid') => {
    setCurrentStatus(newStatus);
    await updateInvoiceStatus(invoice.id, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={onEdit}>
          <Edit2 className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button 
          variant={currentStatus === 'paid' ? 'secondary' : 'primary'}
          onClick={() => handleStatusChange(currentStatus === 'paid' ? 'unpaid' : 'paid')}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          {currentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
        </Button>
      </div>

      {/* Invoice Preview Card */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {company.logo ? (
                  <img src={company.logo} alt="Logo" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                <h1 className="text-2xl font-bold">{company.name}</h1>
              </div>
              <div className="mt-3 space-y-1 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.address}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {company.phone}
                </div>
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {company.email}
                  </div>
                )}
                {company.vatNumber && (
                  <div className="text-xs">VAT: {company.vatNumber}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold opacity-90">INVOICE</h2>
              <p className="mt-1 text-lg font-medium">{invoice.invoiceNumber}</p>
              <div className="mt-2 flex items-center justify-end gap-2 text-sm text-blue-100">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(invoice.date), 'dd MMM yyyy')}
              </div>
              <Badge 
                variant={currentStatus === 'paid' ? 'success' : 'error'}
                className="mt-3"
              >
                {currentStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Bill To</h3>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{invoice.customer.name}</p>
              <p className="text-slate-600">{invoice.customer.phone}</p>
              <p className="text-slate-600">{invoice.customer.address}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="pb-3 text-sm font-semibold text-slate-700">Service</th>
                  <th className="pb-3 text-sm font-semibold text-slate-700">Description</th>
                  <th className="pb-3 text-center text-sm font-semibold text-slate-700">Qty</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-700">Price</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm font-medium text-slate-900">{item.serviceType}</td>
                    <td className="py-3 text-sm text-slate-600">{item.description}</td>
                    <td className="py-3 text-center text-sm text-slate-900">{item.quantity}</td>
                    <td className="py-3 text-right text-sm text-slate-900">AED {item.price.toFixed(2)}</td>
                    <td className="py-3 text-right text-sm font-medium text-slate-900">
                      AED {(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">AED {invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.includeVat && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">VAT (5%)</span>
                  <span className="font-medium text-slate-900">AED {invoice.vatAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-slate-200 pt-2">
                <span className="text-base font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold text-slate-900">AED {invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h4 className="mb-1 text-sm font-semibold text-slate-700">Notes</h4>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* Signature */}
          {invoice.signature && (
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-slate-700">Authorized Signature</h4>
              <img src={invoice.signature} alt="Signature" className="h-20 rounded-lg border border-slate-200 bg-white" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button onClick={handleDownload} isLoading={isGenerating} variant="outline">
          <FileDown className="mr-1 h-4 w-4" />
          Download
        </Button>
        <Button onClick={handleShare} isLoading={isGenerating} variant="outline">
          <Share2 className="mr-1 h-4 w-4" />
          Share
        </Button>
        <Button onClick={handleWhatsApp} variant="outline">
          <MessageCircle className="mr-1 h-4 w-4" />
          WhatsApp
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Receipt className="mr-1 h-4 w-4" />
          Save Invoice
        </Button>
      </div>
    </div>
  );
}
