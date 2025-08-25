import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pizza, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Ingredient {
  id: string;
  name: string;
  price: number;
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

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(defaultIngredients);

  useEffect(() => {
    // Note: In Claude artifacts, localStorage is not available
    // In a real Next.js app, this would work:
    // const saved = localStorage.getItem('pizza-ingredients');
    // if (saved) {
    //   setIngredients(JSON.parse(saved));
    // }
    
    // For demonstration purposes, we'll use a state that persists during the session
    const savedData = sessionStorage.getItem('pizza-ingredients');
    if (savedData) {
      try {
        setIngredients(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved ingredients:', error);
      }
    }
  }, []);

  const updatePrice = (id: string, price: number) => {
    const updated = ingredients.map(ing => 
      ing.id === id ? { ...ing, price } : ing
    );
    setIngredients(updated);
    
    // Note: In Claude artifacts, localStorage is not available
    // In a real Next.js app, this would be:
    // localStorage.setItem('pizza-ingredients', JSON.stringify(updated));
    
    // For demonstration purposes, we'll use sessionStorage
    sessionStorage.setItem('pizza-ingredients', JSON.stringify(updated));
    
    // Also store in a global variable for the invoice page to access
    if (typeof window !== 'undefined') {
      (window as any).pizzaIngredients = updated;
    }
    
    toast.success('Price updated successfully!');
  };

  const resetToDefaults = () => {
    setIngredients(defaultIngredients);
    
    // Note: In Claude artifacts, localStorage is not available
    // In a real Next.js app, this would be:
    // localStorage.setItem('pizza-ingredients', JSON.stringify(defaultIngredients));
    
    // For demonstration purposes, we'll use sessionStorage
    sessionStorage.setItem('pizza-ingredients', JSON.stringify(defaultIngredients));
    
    // Also update the global variable
    if (typeof window !== 'undefined') {
      (window as any).pizzaIngredients = defaultIngredients;
    }
    
    toast.success('Prices reset to defaults!');
  };

  return (
    <>
      <Head>
        <title>Pizza Invoice Manager</title>
        <meta name="description" content="Manage pizza ingredients and generate invoices" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full mb-3 sm:mb-4">
              <Pizza className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Pizza Invoice Manager</h1>            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
              <Link href="/invoice">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Invoice
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={resetToDefaults}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Reset Prices
              </Button>
            </div>
          </div>

          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                Pizza Ingredients Price Settings
              </CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="space-y-2 p-3 sm:p-4 border rounded-lg bg-white shadow-sm">
                    <Label htmlFor={`price-${ingredient.id}`} className="text-xs sm:text-sm font-medium block">
                      {ingredient.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-semibold text-gray-600">៛</span>
                      <Input
                        id={`price-${ingredient.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.price}
                        onChange={(e) => updatePrice(ingredient.id, parseFloat(e.target.value) || 0)}
                        className="flex-1 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}