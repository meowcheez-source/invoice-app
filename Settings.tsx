import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { 
  Search, 
  FileText, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Phone,
  Receipt
} from 'lucide-react';
import type { Invoice } from '../types';
import { getAllInvoices, deleteInvoice } from '../lib/storage';
import { format } from 'date-fns';

interface InvoiceHistoryProps {
  onViewInvoice: (invoice: Invoice) => void;
  onCreateNew: () => void;
}

export function InvoiceHistory({ onViewInvoice, onCreateNew }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    const data = await getAllInvoices();
    setInvoices(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
      await loadInvoices();
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.phone.includes(searchTerm)
  );

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const unpaidAmount = totalAmount - paidAmount;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-blue-600 uppercase">Total Invoices</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">{filteredInvoices.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-green-600 uppercase">Paid</p>
            <p className="mt-1 text-2xl font-bold text-green-900">AED {paidAmount.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-red-600 uppercase">Unpaid</p>
            <p className="mt-1 text-2xl font-bold text-red-900">AED {unpaidAmount.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew}>
          <Receipt className="mr-1 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {searchTerm ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p className="mt-1 text-slate-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first invoice to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateNew} className="mt-4">
                Create First Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => onViewInvoice(invoice)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{invoice.invoiceNumber}</h3>
                      <Badge variant={invoice.status === 'paid' ? 'success' : 'error'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="h-3.5 w-3.5" />
                        {invoice.customer.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5" />
                        {invoice.customer.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(invoice.date), 'dd MMM yyyy')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">{invoice.items.length} item(s)</span>
                      {invoice.includeVat && (
                        <span className="text-slate-500">VAT included</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      AED {invoice.total.toFixed(2)}
                    </p>
                    <div className="mt-2 flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewInvoice(invoice);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleDelete(invoice.id, e)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
