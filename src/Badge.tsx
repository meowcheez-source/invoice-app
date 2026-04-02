import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader } from './ui/Card';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Image, 
  Save,
  Trash2,
  Receipt
} from 'lucide-react';
import type { CompanySettings } from '../types';
import { getCompanySettings, saveCompanySettings } from '../lib/storage';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<CompanySettings>({
    name: '',
    phone: '',
    email: '',
    address: '',
    logo: '',
    vatNumber: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getCompanySettings();
    setSettings(data);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSettings({ ...settings, logo: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveCompanySettings(settings);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
          </div>
          <p className="text-sm text-slate-500">
            This information will appear on your invoices
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {settings.logo ? (
                <div className="relative">
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                  <Image className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <span className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">
                    {settings.logo ? 'Change Logo' : 'Upload Logo'}
                  </span>
                </label>
                <p className="mt-1 text-xs text-slate-500">Max 2MB, PNG or JPG</p>
              </div>
            </div>
          </div>

          <Input
            label="Company Name *"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            placeholder="Your AC Company Name"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone Number *"
              icon={<Phone className="h-4 w-4" />}
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+971 XX XXX XXXX"
              required
            />
            <Input
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@yourcompany.com"
            />
          </div>

          <Input
            label="Address *"
            icon={<MapPin className="h-4 w-4" />}
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="Dubai, UAE"
            required
          />

          <Input
            label="VAT Registration Number (Optional)"
            value={settings.vatNumber || ''}
            onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
            placeholder="e.g., 123456789"
            helperText="Your UAE VAT registration number"
          />
        </CardContent>
      </Card>

      {/* Currency Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Currency Settings</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Default Currency</p>
                <p className="text-sm text-slate-600">UAE Dirham (AED)</p>
              </div>
              <div className="text-2xl font-bold text-slate-400">AED</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSaving} className="flex-1">
          <Save className="mr-1 h-4 w-4" />
          Save Settings
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
