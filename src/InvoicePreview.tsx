import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader } from './ui/Card';
import { SignaturePad } from './SignaturePad';
import { Plus, Trash2, FileSignature, Calculator } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Invoice, ServiceItem, Customer, ServiceType } from '../types';
import { getNextInvoiceNumber } from '../lib/storage';

interface InvoiceFormProps {
  onPreview: (invoice: Invoice) => void;
  initialInvoice?: Invoice | null;
}

const SERVICE_TYPES: ServiceType[] = [
  'AC Installation',
  'AC Repair',
  'Gas Filling',
  'AC Maintenance',
  'General Service',
];

export function InvoiceForm({ onPreview, initialInvoice }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phone: '',
    address: '',
  });

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [includeVat, setIncludeVat] = useState(true);
  const [status, setStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [signature, setSignature] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialInvoice) {
      setInvoiceNumber(initialInvoice.invoiceNumber);
      setCustomer(initialInvoice.customer);
      setItems(initialInvoice.items);
      setIncludeVat(initialInvoice.includeVat);
      setStatus(initialInvoice.status);
      setSignature(initialInvoice.signature || '');
      setNotes(initialInvoice.notes || '');
    } else {
      loadInvoiceNumber();
    }
  }, [initialInvoice]);

  const loadInvoiceNumber = async () => {
    const number = await getNextInvoiceNumber();
    setInvoiceNumber(number);
  };

  const addItem = () => {
    const newItem: ServiceItem = {
      id: uuidv4(),
      description: '',
      serviceType: 'AC Repair',
      quantity: 1,
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ServiceItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const vatAmount = includeVat ? subtotal * 0.05 : 0;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  }, [items, includeVat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { subtotal, vatAmount, total } = calculateTotals();

    const invoice: Invoice = {
      id: initialInvoice?.id || uuidv4(),
      invoiceNumber,
      date: initialInvoice?.date || new Date().toISOString(),
      customer,
      items,
      subtotal,
      vatAmount,
      total,
      includeVat,
      status,
      signature: signature || undefined,
      notes: notes || undefined,
    };

    onPreview(invoice);
    setIsLoading(false);
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  const serviceTypeOptions = SERVICE_TYPES.map(type => ({
    value: type,
    label: type,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Invoice Details</h2>
              <p className="text-sm text-slate-500">Invoice #: {invoiceNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Customer Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Customer Name *"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            placeholder="Enter customer name"
            required
          />
          <Input
            label="Phone Number *"
            type="tel"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            placeholder="+971 XX XXX XXXX"
            required
          />
          <Input
            label="Address *"
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            placeholder="Enter customer address"
            required
          />
        </CardContent>
      </Card>

      {/* Service Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Service Items</h2>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
              <p className="text-slate-500">No items added yet</p>
              <Button type="button" onClick={addItem} variant="outline" className="mt-4">
                Add First Item
              </Button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Item #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Select
                  label="Service Type"
                  value={item.serviceType}
                  onChange={(e) => updateItem(item.id, { serviceType: e.target.value as ServiceType })}
                  options={serviceTypeOptions}
                />
                <Input
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Describe the service..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                  />
                  <Input
                    label="Price (AED)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="text-right text-sm font-medium text-slate-700">
                  Line Total: AED {(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">
            <Calculator className="inline-block mr-2 h-5 w-5" />
            Summary
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Include VAT (5%)</span>
            </label>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium text-slate-900">AED {subtotal.toFixed(2)}</span>
            </div>
            {includeVat && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">VAT (5%):</span>
                <span className="font-medium text-slate-900">AED {vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
              <span>Total:</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
          </div>

          <Input
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
          />

          {/* Signature */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Signature</label>
            {signature ? (
              <div className="space-y-2">
                <img src={signature} alt="Signature" className="h-24 rounded-xl border border-slate-200 bg-white" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSignature(true)}>
                    Change Signature
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSignature('')}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setShowSignature(true)}>
                <FileSignature className="mr-2 h-4 w-4" />
                Add Signature
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        disabled={items.length === 0 || !customer.name}
        className="w-full"
      >
        Preview Invoice
      </Button>

      {showSignature && (
        <SignaturePad
          onSave={(sig) => {
            setSignature(sig);
            setShowSignature(false);
          }}
          onCancel={() => setShowSignature(false)}
        />
      )}
    </form>
  );
}
