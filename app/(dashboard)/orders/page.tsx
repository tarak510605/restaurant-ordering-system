'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag, Clock, DollarSign, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Order {
  _id: string;
  orderNumber: string;
  restaurant?: {
    name: string;
    address: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setOrders(data.data);
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

  const handleCancelOrder = async (orderId: string) => {
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

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
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

      fetchOrders();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      Pending: 'secondary',
      Confirmed: 'default',
      Preparing: 'default',
      Ready: 'default',
      Delivered: 'default',
      Cancelled: 'destructive',
    };
    return variants[status] || 'default';
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
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage your orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by browsing restaurants and placing an order
              </p>
            </div>
            <Link href="/restaurants">
              <Button>Browse Restaurants</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <CardDescription className="mt-1">{order.restaurant?.name || 'Restaurant not found'}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    <Badge variant={order.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">{formatCurrency(order.total)}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Ordered: {formatDate(order.createdAt)}</span>
                  </div>
                  {order.estimatedDeliveryTime && order.status !== 'Cancelled' && (
                    <div className="flex items-center space-x-2">
                      <span>Est. Delivery: {formatDate(order.estimatedDeliveryTime)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Link href={`/orders/${order._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {session?.user?.role?.permissions?.cancelOrder &&
                    order.status !== 'Cancelled' &&
                    order.status !== 'Delivered' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                      >
                        {cancellingId === order._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
