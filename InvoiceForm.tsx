import { useState, useEffect } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceHistory } from './components/InvoiceHistory';
import { Settings } from './components/Settings';
import { Button } from './components/ui/Button';
import type { Invoice, CompanySettings, ViewState } from './types';
import { getCompanySettings } from './lib/storage';
import { 
  History, 
  Settings as SettingsIcon, 
  Plus,
  Menu,
  X,
  Snowflake
} from 'lucide-react';

function App() {
  const [view, setView] = useState<ViewState>('form');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    const settings = await getCompanySettings();
    setCompany(settings);
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setView('preview');
  };

  const handleEdit = () => {
    if (previewInvoice) {
      setEditingInvoice(previewInvoice);
      setView('form');
      setPreviewInvoice(null);
    }
  };

  const handleSaved = () => {
    alert('Invoice saved successfully!');
    setView('history');
    setPreviewInvoice(null);
    setEditingInvoice(null);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setView('preview');
  };

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setPreviewInvoice(null);
    setView('form');
  };

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    setIsMenuOpen(false);
    if (newView === 'form') {
      setEditingInvoice(null);
      setPreviewInvoice(null);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'form':
        return (
          <InvoiceForm 
            onPreview={handlePreview} 
            initialInvoice={editingInvoice}
          />
        );
      case 'preview':
        if (!previewInvoice || !company) return null;
        return (
          <InvoicePreview
            invoice={previewInvoice}
            company={company}
            onBack={() => setView(editingInvoice ? 'history' : 'form')}
            onEdit={handleEdit}
            onSaved={handleSaved}
          />
        );
      case 'history':
        return (
          <InvoiceHistory
            onViewInvoice={handleViewInvoice}
            onCreateNew={handleCreateNew}
          />
        );
      case 'settings':
        return (
          <Settings 
            onClose={() => {
              loadCompanySettings();
              setView('form');
            }} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
              <Snowflake className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AC Invoice Pro</h1>
              <p className="text-xs text-slate-500">UAE Edition</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <Button
              variant={view === 'form' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigateTo('form')}
            >
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
            <Button
              variant={view === 'history' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigateTo('history')}
            >
              <History className="mr-1 h-4 w-4" />
              History
            </Button>
            <Button
              variant={view === 'settings' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigateTo('settings')}
            >
              <SettingsIcon className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-slate-200 bg-white p-4 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-2">
            <Button
              variant={view === 'form' ? 'primary' : 'outline'}
              onClick={() => navigateTo('form')}
              className="justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
            <Button
              variant={view === 'history' ? 'primary' : 'outline'}
              onClick={() => navigateTo('history')}
              className="justify-start"
            >
              <History className="mr-2 h-4 w-4" />
              Invoice History
            </Button>
            <Button
              variant={view === 'settings' ? 'primary' : 'outline'}
              onClick={() => navigateTo('settings')}
              className="justify-start"
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-3xl p-4 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 pb-safe lg:hidden">
        <div className="mx-auto flex max-w-3xl h-16 items-center justify-around">
          <button
            onClick={() => navigateTo('form')}
            className={`flex flex-col items-center gap-1 ${
              view === 'form' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">New</span>
          </button>
          <button
            onClick={() => navigateTo('history')}
            className={`flex flex-col items-center gap-1 ${
              view === 'history' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-xs font-medium">History</span>
          </button>
          <button
            onClick={() => navigateTo('settings')}
            className={`flex flex-col items-center gap-1 ${
              view === 'settings' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
