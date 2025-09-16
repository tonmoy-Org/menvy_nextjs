"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { printReceipt } from './ReceiptPrinter';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface SaleFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function SaleForm({ onSave, onCancel }: SaleFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'mobile_banking',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p._id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products.filter((p: Product) => p.stock > 0));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * parseInt(formData.quantity || '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} units available in stock`);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: formData.productId,
          quantity,
          customerName: formData.customerName || undefined,
          customerPhone: formData.customerPhone || undefined,
          paymentMethod: formData.paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Sale recorded successfully!');
        
        // Get settings to check auto-print
        try {
          const settingsResponse = await fetch('/api/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            
            // Auto-print receipt if enabled
            if (settingsData.settings?.autoprint) {
              setTimeout(() => {
                printReceipt(data.sale);
              }, 500);
            }
            
            // Send WhatsApp invoice if enabled and customer phone is provided
            if (formData.customerPhone && settingsData.settings?.enableWhatsApp) {
              await sendWhatsAppInvoice(data.sale, formData.customerPhone, settingsData.settings);
            }
          }
        } catch (error) {
          console.error('Settings fetch failed:', error);
          // Fallback to auto-print
          setTimeout(() => {
            printReceipt(data.sale);
          }, 500);
        }
        
        onSave();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to record sale');
      }
    } catch (error) {
      toast.error('Error recording sale');
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppInvoice = async (sale: any, phoneNumber: string, settings: any) => {
    try {
      if (!settings.whatsappApiKey || !settings.whatsappInstanceId) {
        toast.warning('WhatsApp API credentials not configured');
        return;
      }
      
      const message = `${settings.whatsappMessage}\n\n` +
        `📋 Invoice Details:\n` +
        `Bill No: ${sale.billNo}\n` +
        `Product: ${sale.productName}\n` +
        `Quantity: ${sale.quantity}\n` +
        `Amount: ${getCurrencySymbol(settings.currency)}${sale.total.toLocaleString()}\n` +
        `Date: ${new Date(sale.createdAt).toLocaleDateString()}\n\n` +
        `Thank you for shopping at Menvy! 🛍️`;

      // This is a placeholder for WhatsApp API integration
      // You would replace this with actual WhatsApp API call
      console.log('Sending WhatsApp message to:', phoneNumber);
      console.log('Message:', message);
      
      // Example API call (replace with your WhatsApp provider's API)
      /*
      const whatsappResponse = await fetch('https://api.whatsapp-provider.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.whatsappApiKey}`
        },
        body: JSON.stringify({
          instance_id: settings.whatsappInstanceId,
          number: phoneNumber,
          message: message
        })
      });
      
      if (whatsappResponse.ok) {
        toast.success('Invoice sent via WhatsApp!');
      }
      */
      
      toast.info('WhatsApp integration configured - invoice would be sent');
    } catch (error) {
      console.error('WhatsApp API error:', error);
      toast.error('Failed to send WhatsApp invoice');
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'BDT': '৳',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || '৳';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product *</Label>
          <Select value={formData.productId} onValueChange={(value) => handleChange('productId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product._id} value={product._id}>
                  {product.name} - ৳{product.price} (Stock: {product.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={selectedProduct?.stock || 1}
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            required
          />
          {selectedProduct && (
            <p className="text-xs text-gray-500">
              Available: {selectedProduct.stock} units
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Customer Phone</Label>
          <Input
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select 
            value={formData.paymentMethod} 
            onValueChange={(value: 'cash' | 'card' | 'mobile_banking') => handleChange('paymentMethod', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sale Summary */}
      {selectedProduct && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Sale Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Product:</span>
              <span>{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Unit Price:</span>
              <span>৳{selectedProduct.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span>{formData.quantity}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-1">
              <span>Total:</span>
              <span>৳{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !selectedProduct}>
          {isLoading ? 'Processing...' : 'Complete Sale'}
        </Button>
      </div>
    </form>
  );
}