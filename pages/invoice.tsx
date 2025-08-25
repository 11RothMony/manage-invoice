'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Share2, Printer, Plus, Minus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Ingredient {
  id: string;
  name: string;
  price: number;
}

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const defaultIngredients: Ingredient[] = [
  { id: '1', name: ' នំធំ ', price: 3500 },
  { id: '2', name: 'នំកណ្ដាល', price: 2500 },
  { id: '3', name: 'នំតូច', price: 1800 },
  { id: '4', name: 'ប្រអប់ធំ', price: 1000 },
  { id: '5', name: 'ប្រអប់តួច', price: 700 },
  { id: '6', name: 'ប្រអប់កណ្ដាល', price: 900 },
  { id: '7', name: 'ឈីស', price: 86000 },
  { id: '8', name: 'ម៉ាញ់យ៉ានេស', price: 7500 },
  { id: '9', name: 'ហរដក់', price: 14000 },
  { id: '10', name: 'ប្រហិតមឹក', price: 10000 },
  { id: '11', name: 'ប្រហិតក្ដាម', price: 10000 },
  { id: '12', name: 'ពោត', price: 4000 },
  { id: '13', name: 'ទឹកជ្រលក់ម្ទេស', price: 13500 },
  { id: '15', name: 'ទឹកជ្រលក់ប៉េងប៉ោះ', price: 13500 },
  { id: '16', name: 'ថង់តូច', price: 7000 },
  { id: '17', name: 'ថង់ធំ', price: 7000 },
  { id: '18', name: 'បង្គារ', price: 30000 },
  { id: '19', name: 'ទឹកលាបនំ', price: 10000 },
];

export default function Invoice() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(defaultIngredients);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    setInvoiceDate(getFormattedDate());
  }, []);

  useEffect(() => {
    // Load updated ingredients from storage or global variable
    let updatedIngredients = defaultIngredients;
    
    try {
      // First try to get from sessionStorage (for Claude artifacts)
      const savedData = sessionStorage.getItem('pizza-ingredients');
      if (savedData) {
        updatedIngredients = JSON.parse(savedData);
      }
      // If not in sessionStorage, try global variable
      else if (typeof window !== 'undefined' && (window as any).pizzaIngredients) {
        updatedIngredients = (window as any).pizzaIngredients;
      }
      // In a real Next.js app, you would also try localStorage:
      // const localStorageData = localStorage.getItem('pizza-ingredients');
      // if (localStorageData) {
      //   updatedIngredients = JSON.parse(localStorageData);
      // }
    } catch (error) {
      console.error('Error loading ingredient prices:', error);
      toast.error('Error loading updated prices, using defaults');
    }

    setIngredients(updatedIngredients);
    setInvoiceNumber(`PZ${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`);

    const items = updatedIngredients.map((ing: Ingredient) => ({
      id: ing.id,
      name: ing.name,
      quantity: 0,
      unitPrice: ing.price,
      amount: 0,
    }));
    setInvoiceItems(items);
  }, []);

  const updateQuantity = (id: string, quantity: number) => {
    setInvoiceItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity, amount: quantity * item.unitPrice } : item
      )
    );
  };

  const incrementQuantity = (id: string) => {
    const currentQty = invoiceItems.find((item) => item.id === id)?.quantity || 0;
    updateQuantity(id, currentQty + 1);
  };

  const decrementQuantity = (id: string) => {
    const currentQty = invoiceItems.find((item) => item.id === id)?.quantity || 0;
    if (currentQty > 0) {
      updateQuantity(id, currentQty - 1);
    }
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handlePrint = () => {
    try {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
      }, 100);
      toast.success('Print dialog opened!');
    } catch (error) {
      toast.error('Unable to open print dialog');
      console.error('Print error:', error);
    }
  };

  const handleShare = async () => {
    const activeItems = invoiceItems.filter((item) => item.quantity > 0);
    const invoiceText = `
KH ផ្គត់ផ្គង់ភីហ្សា
Invoice: ${invoiceNumber}
Date: ${invoiceDate}
Customer: ${customerName || 'N/A'}
Address: ${customerAddress || 'N/A'}

Items:
${activeItems
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} - Qty: ${item.quantity} - Unit Price: ${item.unitPrice.toFixed(0)}៛ - Total: ${item.amount.toFixed(0)}៛`
  )
  .join('\n')}

Total: ${calculateTotal().toFixed(0)}៛
Contact: 098 828 128 | 086 828 128 | 071 828 128
Note: Purchased items are non-refundable
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pizza Invoice ${invoiceNumber}`,
          text: invoiceText,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        await navigator.clipboard.writeText(invoiceText);
        toast.success('Invoice details copied to clipboard! Paste them in Messenger.');
      }
    } else {
      await navigator.clipboard.writeText(invoiceText);
      toast.success('Invoice details copied to clipboard! Paste them in Messenger.');
    }
  };

  const activeItems = invoiceItems.filter((item) => item.quantity > 0);

  return (
    <>
      <Head>
        <title>Pizza Invoice #{invoiceNumber}</title>
        <meta name="description" content="Pizza ingredients invoice" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="print:hidden bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Link href="/">
                  <Button variant="outline" size="sm" className="p-2 sm:px-3">
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                </Link>
                <h1 className="text-sm sm:text-xl font-semibold truncate">Invoice #{invoiceNumber}</h1>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  onClick={() => setShowPreview(!showPreview)} 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden p-2"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button onClick={handleShare} variant="outline" size="sm" className="p-2 sm:px-3">
                  <Share2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button onClick={handlePrint} size="sm" className="p-2 sm:px-3">
                  <Printer className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Total Bar */}
        <div className="print:hidden lg:hidden bg-blue-600 text-white px-4 py-2 sticky top-[73px] z-10">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Items: {activeItems.length}</span>
            <span className="font-bold text-lg">{calculateTotal().toFixed(0)}៛</span>
          </div>
        </div>

        <div className="px-3 sm:px-4 py-4 lg:py-8 max-w-[1200px] mx-auto print:max-w-none print:px-0 print:py-0 print:mx-0">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {!showPreview ? (
              <div className="space-y-4 print:hidden">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="customer-name" className="text-sm">Customer Name</Label>
                      <Input
                        id="customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-address" className="text-sm">Customer Address</Label>
                      <Input
                        id="customer-address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter customer address"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Pizza Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="font-medium text-sm sm:text-base truncate">{ingredient.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{ingredient.price.toFixed(0)}៛ each</div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decrementQuantity(ingredient.id)}
                            disabled={invoiceItems.find((item) => item.id === ingredient.id)?.quantity === 0}
                            className="h-8 w-8 p-0 touch-manipulation"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <div className="w-16 sm:w-18 text-center">
                            <Input
                              min="0"
                              step="1"
                              value={invoiceItems.find((item) => item.id === ingredient.id)?.quantity || 0}
                              onChange={(e) => updateQuantity(ingredient.id, parseInt(e.target.value) || 0)}
                              className="text-center"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => incrementQuantity(ingredient.id)}
                            className="h-8 w-8 p-0 touch-manipulation"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="invoice-preview bg-white border rounded-lg print-invoice">
                <InvoicePreview 
                  invoiceNumber={invoiceNumber}
                  invoiceDate={invoiceDate}
                  customerName={customerName}
                  customerAddress={customerAddress}
                  activeItems={activeItems}
                  calculateTotal={calculateTotal}
                />
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 print:block">
            <div className="print:hidden">
              <Card>
                <CardHeader>
                  <CardTitle>Pizza Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="customer-name">Customer Name</Label>
                      <Input
                        id="customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-address">Customer Address</Label>
                      <Input
                        id="customer-address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter customer address"
                      />
                    </div>
                  </div>
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{ingredient.name}</div>
                        <div className="text-sm text-gray-500">{ingredient.price.toFixed(0)}៛ each</div>
                      </div>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => decrementQuantity(ingredient.id)}
                          disabled={invoiceItems.find((item) => item.id === ingredient.id)?.quantity === 0}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          min="0"
                          step="1"
                          value={invoiceItems.find((item) => item.id === ingredient.id)?.quantity || 0}
                          onChange={(e) => updateQuantity(ingredient.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => incrementQuantity(ingredient.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="invoice-preview print:block">
              <div className="bg-white border rounded-lg print-invoice">
                <InvoicePreview 
                  invoiceNumber={invoiceNumber}
                  invoiceDate={invoiceDate}
                  customerName={customerName}
                  customerAddress={customerAddress}
                  activeItems={activeItems}
                  calculateTotal={calculateTotal}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Print-only invoice */}
        <div className="hidden print-invoice" style={{display: 'none'}}>
          <InvoicePreview 
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            customerName={customerName}
            customerAddress={customerAddress}
            activeItems={activeItems}
            calculateTotal={calculateTotal}
          />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
          }
          
          /* Show only the invoice preview and its children */
          .print-invoice,
          .print-invoice * {
            visibility: visible !important;
          }
          
          /* Position the print invoice to fill the page */
          .print-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Page setup - A4 with minimal margins */
          @page {
            margin: 0.3in;
            size: A4;
          }
          
          /* Color adjustments */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ensure content fits on one page */
          .print-invoice {
            page-break-inside: avoid !important;
            overflow: hidden !important;
            font-size: 12px !important;
            line-height: 1.2 !important;
          }
          
          /* Compact table styling */
          .print-invoice table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
          }
          
          .print-invoice th,
          .print-invoice td {
            padding: 5px 2px !important;
            border: 1px solid gray !important;
            font-size: 20px !important;
            line-height: 1.1 !important;
          }
          
          .print-invoice th {
            background-color: #f0f0f0 !important;
            font-weight: bold !important;
            padding: 10px 2px !important;
          }
          
          /* Compact spacing */
          .print-invoice h1 {
            font-size: 35px !important;
            margin: 20px 0 !important;
            color: black !important;  
          }
          
          .print-invoice p {
            margin: 10px 0 !important;
            font-size: 18px !important;
            color: black !important;
          }
          
          /* Logo sizing */
          .print-invoice .logo-container {
            margin-bottom: 2px !important;
          }
          
          /* Total section */
          .print-invoice .total-section {
            background-color: #f0f0f0 !important;
            padding: 4px !important;
            font-size: 22px !important;
            font-weight: bold !important;
          }
          
          /* Customer info boxes */
          .print-invoice .customer-box {
            border: 1px solid #666 !important;
            padding: 4px !important;
            font-size: 10px !important;
          }
        }

        @media (max-width: 640px) {
          .touch-manipulation {
            touch-action: manipulation;
          }
          button {
            min-height: 44px;
            min-width: 44px;
          }
          input[type="text"], input[type="number"] {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}

function InvoicePreview({ invoiceNumber, invoiceDate, customerName, customerAddress, activeItems, calculateTotal }) {
  return (
    <div className="p-3 print:p-2 print:h-screen print:flex print:flex-col">
      {/* Header - Compact */}
      <div className="text-center relative mt-28 print:mt-0 font-bold print:mb-1">
        <div className="absolute -top-24 left-1/2 print:left-20 print:top-3 transform -translate-x-1/2 w-20 rounded-full h-20 border border-gray-300 rounded-full flex print:w-[120px] print:h-[120px] items-center justify-center mb-2 print:mb-1">   
            <img className="w-full h-full rounded-full " src="/images/logo.png" alt="logo" />
        </div>
        <h1 className="text-base sm:text-xl font-bold text-blue-900 mt-14 sm:mt-20 print:mt-16 print:text-black print:text-lg">
          KH ផ្គត់ផ្គង់ភីហ្សា
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 print:text-xs print:text-black mt-1">
          មានលក់សាច់នំភីហ្សា គ្រឿងផ្សំ និងសម្ភារគ្រប់មុខ
        </p>
        <p className="text-xs sm:text-sm text-gray-600 print:text-xs print:text-black">និងមានទទួលបង្រៀនធ្វេីភីហ្សា</p>

        <div className="mt-2 text-xs text-gray-500 print:text-xs print:text-black">
          <p>📞 Phone: 098 828 128 | 086 828 128 | 071 828 128</p>
        </div>
      </div>

      <Separator className="my-2 print:my-1 print:border-gray-400" />

      {/* Invoice Info - Compact */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2 print:mb-1 space-y-1 sm:space-y-0">
        <p className="text-md sm:text-md text-gray-600 print:text-black">
          <b>Number:</b> {invoiceNumber}
        </p>
        <h2 className="font-semibold text-sm print:text-xl print:text-black">INVOICE</h2>
        <p className="text-md sm:text-md text-gray-600 print:text-black">
          <b>Date:</b> {invoiceDate}
        </p>
      </div>

      {/* Table - Flexible height */}
      <div className="rounded-lg overflow-x-auto print:overflow-visible  print:rounded-none print:flex-1 print:flex print:flex-col">
        <table className="w-full min-w-[500px] border print:border-none print:min-w-0 print:h-full print:flex print:flex-col">
          <thead className="bg-blue-50 print:bg-gray-100 print:flex-shrink-0">
            <tr className="text-left text-xs sm:text-sm print:text-xs print:flex">
              <th className="p-1 sm:p-2 print:p-1 font-semibold border-r print:border-gray-400 print:flex-none  print:w-14">No.</th>
              <th className="p-1 sm:p-2 print:p-1 font-semibold border-r print:border-gray-400 print:flex-1">Name of Goods</th>
              <th className="p-1 sm:p-2 print:p-1 font-semibold text-center border-r print:border-gray-400 print:flex-none print:w-20">Qty</th>
              <th className="p-1 sm:p-2 print:p-1 font-semibold text-center border-r print:border-gray-400 print:flex-none print:w-32">Unit Price</th>
              <th className="p-1 sm:p-2 print:p-1 font-semibold text-right print:flex-none print:w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="print:flex-1 print:flex print:flex-col">
            {activeItems.length > 0 ? (
              activeItems.map((item, index) => (
                <tr key={item.id} className="border-t border-1 text-xs sm:text-sm print:text-xs print:border-gray-400 print:flex">
                  <td className="p-1 sm:p-1 print:p-0.5 text-center border-r print:border-gray-400 print:flex-none print:w-14">{index + 1}</td>
                  <td className="p-1 sm:p-1 print:p-0.5 font-medium border-r print:border-gray-400 print:flex-1 print:truncate">{item.name}</td>
                  <td className="p-1 sm:p-1 print:p-0.5 text-center border-r print:border-gray-400 print:flex-none print:w-20">{item.quantity}</td>
                  <td className="p-1 sm:p-1 print:p-0.5 text-center border-r print:border-gray-400 print:flex-none print:w-32">{item.unitPrice.toFixed(0)}៛</td>
                  <td className="p-1 sm:p-1 print:p-0.5 text-right font-semibold print:flex-none print:w-32">
                    {item.amount.toFixed(0)}៛
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t print:border-gray-400 print:flex print:flex-1 print:justify-center">
              <td colSpan={5} className="p-4 sm:p-8 flex items-center justify-center text-center text-gray-500 text-xs sm:text-sm print:p-2 print:text-xs print:text-black print:w-full">
                No items added to invoice yet.
              </td>
            </tr>
            )}
            {/* Fill remaining space with empty rows for print only */}
            {Array.from({ length: Math.max(0, 17 - activeItems.length) }).map((_, index) => (
              <tr key={`empty-${index}`} className="border-t print:flex print:border-gray-400">
                <td className="p-0.5 border-r print:border-gray-400 print:flex-none print:w-14 print:text-xs">&nbsp;</td>
                <td className="p-0.5 border-r print:border-gray-400 print:flex-1">&nbsp;</td>
                <td className="p-0.5 border-r print:border-gray-400 print:flex-none print:w-20">&nbsp;</td>
                <td className="p-0.5 border-r print:border-gray-400 print:flex-none print:w-32">&nbsp;</td>
                <td className="p-0.5 border-r print:border-gray-400 print:flex-none print:w-32">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer - Compact and fixed at bottom */}
      <div className="mt-2 print:flex-shrink-0">
        {/* Total section */}
        <div className="flex print:mb-10 flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 mb-2 print:mb-1">
          <div className="text-center text-xs text-gray-800 print:text-black print:text-sm">
            <b>បញ្ជាក់: </b>ទំនិញទិញហេីយមិនអាចដូរយកលុយវិញបានទេ
          </div>
          <div className="bg-blue-50 p-2 rounded-lg print:bg-gray-100 print:p-2 order-1 sm:order-2">
            <div className="flex items-center justify-between sm:gap-4 text-sm font-bold print:text-2xl print:text-black">
              <span>សរុប/TOTAL:</span>
              <span className="text-blue-600 print:text-black">{calculateTotal().toFixed(0)}៛</span>
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs space-y-2 sm:space-y-0 gap-4 print:gap-52  print:text-xs">
          <div className="flex-1">
            <div className="border  print:margins-left rounded p-2 print:p-1 print:border-gray-400 print:rounded-none">
              <p className="text-gray-600 print:text-black">អតិថិជន: {customerName || '........................'}</p>
              <p className="text-gray-600 print:text-black">ទីតាំង: {customerAddress || '............................'}</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="border  rounded p-2 print:p-1 print:border-gray-400 print:rounded-none">
              <p className="text-gray-500 print:text-black">អ្នកលក់: KH PIZZA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}