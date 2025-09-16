"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Settings, Store, Bell, Shield, Database, Globe, Clock, DatabaseBackup as Backup, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify';

interface SystemSettings {
  // Store Settings
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  vatNumber: string;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  dailyReports: boolean;
  
  // Security Settings
  sessionTimeout: number;
  passwordExpiry: number;
  twoFactorAuth: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  
  // System Settings
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  
  // Receipt Settings
  receiptFooter: string;
  showVAT: boolean;
  vatRate: number;
  autoprint: boolean;
  
  // WhatsApp Settings
  enableWhatsApp: boolean;
  whatsappApiKey: string;
  whatsappInstanceId: string;
  whatsappMessage: string;
  
  // Business Settings
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    // Store Settings
    storeName: 'Menvy',
    storeAddress: 'Magura, Bangladesh',
    storePhone: '01708-446607',
    storeEmail: 'contact@menvy.store',
    vatNumber: '0xxxxxxxxxxxx',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    dailyReports: true,
    
    // Security Settings
    sessionTimeout: 24,
    passwordExpiry: 90,
    twoFactorAuth: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    
    // System Settings
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    
    // Receipt Settings
    receiptFooter: 'Thank you for shopping at Menvy!',
    showVAT: true,
    vatRate: 15,
    autoprint: true,
    
    // WhatsApp Settings
    enableWhatsApp: false,
    whatsappApiKey: '',
    whatsappInstanceId: '',
    whatsappMessage: 'Thank you for your purchase! Here is your invoice from Menvy.',
    
    // Business Settings
    businessHours: {
      monday: { open: '09:00', close: '21:00', closed: false },
      tuesday: { open: '09:00', close: '21:00', closed: false },
      wednesday: { open: '09:00', close: '21:00', closed: false },
      thursday: { open: '09:00', close: '21:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '09:00', close: '21:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false },
    },
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully! Changes will take effect immediately.');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure your Shop management system</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-sky-300 hover:bg-sky-400 text-black">
            {isLoading ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="w-5 h-5" />
                  <span>Store Information</span>
                </CardTitle>
                <CardDescription>Basic information about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => handleChange('storeName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Phone</Label>
                    <Input
                      id="storePhone"
                      value={settings.storePhone}
                      onChange={(e) => handleChange('storePhone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => handleChange('storeEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Registration Number</Label>
                    <Input
                      id="vatNumber"
                      value={settings.vatNumber}
                      onChange={(e) => handleChange('vatNumber', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Textarea
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => handleChange('storeAddress', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Security and authentication configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Select 
                      value={settings.sessionTimeout.toString()} 
                      onValueChange={(value) => handleChange('sessionTimeout', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Select 
                      value={settings.passwordExpiry.toString()} 
                      onValueChange={(value) => handleChange('passwordExpiry', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Select 
                      value={settings.maxLoginAttempts.toString()} 
                      onValueChange={(value) => handleChange('maxLoginAttempts', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Select 
                      value={settings.lockoutDuration.toString()} 
                      onValueChange={(value) => handleChange('lockoutDuration', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all user logins</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleChange('twoFactorAuth', checked)}
                  />
                </div>
                
                {settings.twoFactorAuth && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Two-Factor Authentication Enabled</h4>
                    <p className="text-sm text-yellow-700">
                      All users will be required to set up 2FA on their next login. Make sure you have your 2FA app ready.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Alert when products are low in stock' },
                  { key: 'dailyReports', label: 'Daily Reports', desc: 'Receive daily sales reports' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={settings[item.key as keyof SystemSettings] as boolean}
                      onCheckedChange={(checked) => handleChange(item.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription>General system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleChange('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receipt Settings */}
          <TabsContent value="receipt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Receipt Settings</span>
                </CardTitle>
                <CardDescription>Configure receipt printing and format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                  <Textarea
                    id="receiptFooter"
                    value={settings.receiptFooter}
                    onChange={(e) => handleChange('receiptFooter', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatRate">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      min="0"
                      max="50"
                      value={settings.vatRate}
                      onChange={(e) => handleChange('vatRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="showVAT">Show VAT on Receipt</Label>
                      <p className="text-sm text-gray-500">Display VAT calculation on receipts</p>
                    </div>
                    <Switch
                      id="showVAT"
                      checked={settings.showVAT}
                      onCheckedChange={(checked) => handleChange('showVAT', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="autoprint">Auto Print Receipt</Label>
                      <p className="text-sm text-gray-500">Automatically print receipt after sale</p>
                    </div>
                    <Switch
                      id="autoprint"
                      checked={settings.autoprint}
                      onCheckedChange={(checked) => handleChange('autoprint', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Settings */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>WhatsApp Integration</span>
                </CardTitle>
                <CardDescription>Send invoices to customers via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableWhatsApp">Enable WhatsApp</Label>
                    <p className="text-sm text-gray-500">Send invoices via WhatsApp after sales</p>
                  </div>
                  <Switch
                    id="enableWhatsApp"
                    checked={settings.enableWhatsApp}
                    onCheckedChange={(checked) => handleChange('enableWhatsApp', checked)}
                  />
                </div>
                
                {settings.enableWhatsApp && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
                        <Input
                          id="whatsappApiKey"
                          type="password"
                          value={settings.whatsappApiKey}
                          onChange={(e) => handleChange('whatsappApiKey', e.target.value)}
                          placeholder="Enter your WhatsApp API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="whatsappInstanceId">WhatsApp Instance ID</Label>
                        <Input
                          id="whatsappInstanceId"
                          value={settings.whatsappInstanceId}
                          onChange={(e) => handleChange('whatsappInstanceId', e.target.value)}
                          placeholder="Enter your WhatsApp instance ID"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsappMessage">Default Message</Label>
                      <Textarea
                        id="whatsappMessage"
                        value={settings.whatsappMessage}
                        onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                        rows={3}
                        placeholder="Message to send with invoice"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>1. Sign up for a WhatsApp Business API provider</li>
                        <li>2. Get your API key and instance ID</li>
                        <li>3. Configure webhook URL in your provider dashboard</li>
                        <li>4. Test the integration with a sample message</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours */}
          <TabsContent value="business">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Business Hours</span>
                  </CardTitle>
                  <CardDescription>Set your store operating hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-20 font-medium capitalize">{day}</div>
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) => handleBusinessHoursChange(day, 'closed', !checked)}
                      />
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="w-32"
                          />
                        </>
                      )}
                      {hours.closed && <span className="text-gray-500">Closed</span>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Backup className="w-5 h-5" />
                    <span>Backup Settings</span>
                  </CardTitle>
                  <CardDescription>Configure automatic backups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="autoBackup">Automatic Backup</Label>
                      <p className="text-sm text-gray-500">Enable automatic database backups</p>
                    </div>
                    <Switch
                      id="autoBackup"
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleChange('autoBackup', checked)}
                    />
                  </div>
                  
                  {settings.autoBackup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select 
                          value={settings.backupFrequency} 
                          onValueChange={(value) => handleChange('backupFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backupRetention">Retention Period (days)</Label>
                        <Input
                          id="backupRetention"
                          type="number"
                          min="7"
                          max="365"
                          value={settings.backupRetention}
                          onChange={(e) => handleChange('backupRetention', parseInt(e.target.value) || 30)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}