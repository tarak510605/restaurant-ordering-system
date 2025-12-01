'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, Plus } from 'lucide-react';

interface PaymentMethod {
  _id: string;
  type: string;
  cardNumber?: string;
  cardHolderName?: string;
  upiId?: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Credit Card',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    upiId: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setPaymentMethods(data.data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        type: formData.type,
        isDefault: formData.isDefault,
      };

      if (formData.type === 'Credit Card' || formData.type === 'Debit Card') {
        payload.cardNumber = formData.cardNumber;
        payload.cardHolderName = formData.cardHolderName;
        payload.expiryMonth = parseInt(formData.expiryMonth);
        payload.expiryYear = parseInt(formData.expiryYear);
      } else if (formData.type === 'UPI') {
        payload.upiId = formData.upiId;
      }

      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: 'Payment method added successfully',
      });

      setShowAddForm(false);
      setFormData({
        type: 'Credit Card',
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        upiId: '',
        isDefault: false,
      });
      fetchPaymentMethods();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'Credit Card':
      case 'Debit Card':
        return '💳';
      case 'UPI':
        return '📱';
      case 'Cash on Delivery':
        return '💵';
      case 'Net Banking':
        return '🏦';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">
            Manage your payment methods for faster checkout
          </p>
        </div>
        {session?.user?.role?.permissions?.updatePaymentMethod && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
            <CardDescription>Enter your payment details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPaymentMethod} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              {(formData.type === 'Credit Card' || formData.type === 'Debit Card') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardHolderName">Card Holder Name</Label>
                    <Input
                      id="cardHolderName"
                      value={formData.cardHolderName}
                      onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number (last 4 digits)</Label>
                    <Input
                      id="cardNumber"
                      placeholder="****1234"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Expiry Month</Label>
                      <Input
                        id="expiryMonth"
                        type="number"
                        min="1"
                        max="12"
                        placeholder="MM"
                        value={formData.expiryMonth}
                        onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Expiry Year</Label>
                      <Input
                        id="expiryYear"
                        type="number"
                        min="2025"
                        placeholder="YYYY"
                        value={formData.expiryYear}
                        onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'UPI' && (
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="username@paytm"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Set as default payment method
                </Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Payment Method'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">No payment methods</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a payment method to make checkout easier
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <Card key={method._id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPaymentIcon(method.type)}</span>
                    <CardTitle className="text-lg">{method.type}</CardTitle>
                  </div>
                  {method.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {method.cardNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Card Number</p>
                    <p className="font-mono">{method.cardNumber}</p>
                  </div>
                )}
                {method.cardHolderName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Card Holder</p>
                    <p>{method.cardHolderName}</p>
                  </div>
                )}
                {method.upiId && (
                  <div>
                    <p className="text-sm text-muted-foreground">UPI ID</p>
                    <p>{method.upiId}</p>
                  </div>
                )}
                {method.type === 'Cash on Delivery' && (
                  <p className="text-sm text-muted-foreground">
                    Pay with cash when your order arrives
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
