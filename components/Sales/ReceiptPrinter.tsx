"use client";

import React from 'react';

interface Sale {
  _id: string;
  billNo: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  sellerName: string;
  createdAt: string;
  customer?: {
    name?: string;
    phone?: string;
  };
}

interface ReceiptPrinterProps {
  sale: Sale;
}

export const printReceipt = (sale: Sale) => {
  // Get settings for receipt customization
  const getSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.settings;
      }
    } catch (error) {
      console.error('Failed to get settings:', error);
    }
    return null;
  };

  getSettings().then(settings => {
    const storeName = settings?.storeName || 'MENVY';
    const storeAddress = settings?.storeAddress || 'Magura, Bangladesh';
    const storePhone = settings?.storePhone || '01708-446607';
    const storeEmail = settings?.storeEmail || 'contact@menvy.store';
    const vatNumber = settings?.vatNumber || '0xxxxxxxxxxxx';
    const receiptFooter = settings?.receiptFooter || 'Thank you for shopping at Menvy!';
    const showVAT = settings?.showVAT !== false;
    const vatRate = settings?.vatRate || 15;
    const currency = getCurrencySymbol(settings?.currency || 'BDT');

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Menvy Sale Receipt - ${sale.billNo}</title>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
            
            body {
              font-family: 'Roboto Mono', monospace;
              width: 80mm;
              margin: 0 auto;
              font-size: 12px;
              line-height: 1.4;
              padding: 8px;
              background-color: white;
              color: #000;
            }
            
            .receipt { 
              border: 2px solid #000;
              padding: 15px;
              background: white;
            }
            
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px double #000;
            }
            
            .shop-name { 
              font-size: 24px; 
              font-weight: bold; 
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            
            .tagline {
              font-size: 10px;
              font-style: italic;
              margin-bottom: 8px;
            }
            
            .address, .contact {
              font-size: 10px;
              margin-bottom: 3px;
            }
            
            .vat-number {
              font-size: 9px;
              margin-top: 5px;
              font-weight: bold;
            }
            
            .divider { 
              border-top: 1px dashed #000; 
              margin: 10px 0; 
            }
            
            .double-divider {
              border-top: 2px double #000;
              margin: 12px 0;
            }
            
            .item { 
              display: flex; 
              justify-content: space-between;
              margin-bottom: 5px;
              align-items: center;
            }
            
            .item-details {
              margin: 10px 0;
              padding: 8px 0;
              border: 1px solid #ddd;
              padding: 8px;
              background: #f9f9f9;
            }
            
            .bold {
              font-weight: bold;
            }
            
            .large-text {
              font-size: 14px;
            }
            
            .center {
              text-align: center;
            }
            
            .right {
              text-align: right;
            }
            
            .footer { 
              margin-top: 15px; 
              font-size: 9px; 
              text-align: center; 
              border-top: 2px double #000;
              padding-top: 10px;
            }
            
            .terms { 
              margin-top: 12px; 
              font-size: 8px; 
              border-top: 1px dashed #000; 
              padding-top: 8px; 
              line-height: 1.3;
            }
            
            .qr-code {
              width: 60px;
              height: 60px;
              margin: 8px auto;
              display: block;
            }
            
            .thank-you {
              font-style: italic;
              margin: 10px 0;
              font-size: 11px;
              font-weight: bold;
            }
            
            .highlight {
              background: #ffffcc;
              padding: 2px;
              font-weight: bold;
            }
            
            .payment-summary {
              background: #f0f0f0;
              padding: 8px;
              border: 1px solid #ccc;
              margin: 8px 0;
            }
          </style>
        </head>
        <body onload="window.print(); window.onafterprint = function(){ window.close(); }">
          <div class="receipt">
            <!-- Header -->
            <div class="header">
              <div class="shop-name">${storeName}</div>
              <div class="tagline">Your Fashion Destination</div>
              <div class="address">${storeAddress}</div>
              <div class="contact">📞 ${storePhone}</div>
              <div class="contact">✉️ ${storeEmail}</div>
              <div class="vat-number">VAT Reg: ${vatNumber}</div>
            </div>
            
            <!-- Transaction Details -->
            <div class="item">
              <span class="bold">Bill No:</span>
              <span class="bold highlight">${sale.billNo}</span>
            </div>
            <div class="item">
              <span>Date:</span>
              <span>${new Date(sale.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="item">
              <span>Time:</span>
              <span>${new Date(sale.createdAt).toLocaleTimeString('en-GB')}</span>
            </div>
            <div class="item">
              <span>Served by:</span>
              <span>${sale.sellerName}</span>
            </div>
            ${sale.customer?.name ? `
            <div class="item">
              <span>Customer:</span>
              <span>${sale.customer.name}</span>
            </div>
            ` : ''}
            ${sale.customer?.phone ? `
            <div class="item">
              <span>Phone:</span>
              <span>${sale.customer.phone}</span>
            </div>
            ` : ''}
            
            <div class="double-divider"></div>
            
            <!-- Product Details -->
            <div class="item-details">
              <div class="item">
                <span class="bold">Item Description</span>
                <span class="bold">Amount</span>
              </div>
              <div class="divider" style="margin: 5px 0;"></div>
              <div class="item">
                <span class="bold">${sale.productName}</span>
                <span></span>
              </div>
              <div class="item">
                <span>Qty: ${sale.quantity} × ৳${sale.price.toFixed(2)}</span>
                <span class="bold">${currency}${sale.total.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="item">
                <span>Subtotal:</span>
                <span>${currency}${sale.total.toFixed(2)}</span>
              </div>
              ${showVAT ? `
              <div class="item">
                <span>VAT (${vatRate}%):</span>
                <span>${currency}${(sale.total * (vatRate / 100)).toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="divider" style="margin: 5px 0;"></div>
              <div class="item large-text">
                <span class="bold">TOTAL PAYABLE:</span>
                <span class="bold">${currency}${showVAT ? (sale.total * (1 + vatRate / 100)).toFixed(2) : sale.total.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Payment Method:</span>
                <span class="bold">CASH</span>
              </div>
            </div>
            
            <div class="double-divider"></div>
            
            <!-- Thank You Message -->
            <div class="thank-you center">
              🙏 ${receiptFooter} 🙏
            </div>
            
            <!-- QR Code and Social -->
            <div class="center">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://www.facebook.com/share/1GXzYW2ur7/?mibextid=wwXIfr" 
                   alt="QR Code" class="qr-code" />
              <div style="font-size: 9px;">Follow us on Facebook</div>
            </div>
            
            <!-- Terms & Conditions -->
            <div class="terms">
              <div class="bold center">TERMS & CONDITIONS</div>
              <div>• পণ্য ফেরত নয়, শুধুমাত্র পরিবর্তন</div>
              <div>• Product exchange only, no refund</div>
              <div>• Exchange within 7 days with receipt</div>
              <div>• Original condition required</div>
              <div>• Sale items are not exchangeable</div>
              <div>• Subject to Menvy store policies</div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div>Powered by ${storeName} POS System</div>
              <div>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</div>
              <div style="margin-top: 5px; font-size: 8px;">
                Receipt generated on ${new Date().toLocaleString('en-GB')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
  });
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

const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({ sale }) => {
  return (
    <button
      onClick={() => printReceipt(sale)}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
    >
      <span>Print Receipt</span>
    </button>
  );
};

export default ReceiptPrinter;