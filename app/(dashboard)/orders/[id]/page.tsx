'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Order {
  _id: string;
  orderNumber: string;
  restaurant: {
    _id: string;
    name: string;
    address: string;
  };
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: {
    type: string;
  };
  deliveryAddress: string;
  specialInstructions: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
}

interface PaymentMethod {
  _id: string;
  type: string;
  cardNumber?: string;
  upiId?: string;
  isDefault?: boolean;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Suppress exhaustive-deps: fetchOrderDetails and fetchPaymentMethods are intentionally
  // called when params.id changes; making them stable with useCallback is possible but
  // would add complexity. Keep minimal to satisfy build.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrderDetails();
    fetchPaymentMethods();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setOrder(data.data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.data);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleCheckout = async () => {
    if (!session?.user?.role?.permissions?.checkout) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to checkout orders',
        variant: 'destructive',
      });
      return;
    }

    const defaultPaymentMethod = paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0];

    if (!defaultPaymentMethod) {
      toast({
        title: 'Error',
        description: 'Please add a payment method first',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: defaultPaymentMethod._id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: 'Payment successful! Order confirmed',
      });

      fetchOrderDetails();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!session?.user?.role?.permissions?.cancelOrder) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to cancel orders',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/cancel`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });

      fetchOrderDetails();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link href="/orders">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <CardDescription className="mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge>{order.status}</Badge>
                  <Badge variant={order.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold">{order.restaurant.name}</p>
                <p className="text-sm text-muted-foreground">{order.restaurant.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p>{order.deliveryAddress}</p>
              </div>
              {order.estimatedDeliveryTime && order.status !== 'Cancelled' && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p>{formatDate(order.estimatedDeliveryTime)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.paymentStatus === 'Pending' && 
               order.status !== 'Cancelled' && 
               session?.user?.role?.permissions?.checkout && (
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              )}

              {order.status !== 'Cancelled' &&
                order.status !== 'Delivered' &&
                session?.user?.role?.permissions?.cancelOrder && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancel}
                    disabled={processing}
                  >
                    Cancel Order
                  </Button>
                )}

              {order.paymentMethod && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="font-medium">{order.paymentMethod.type}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
