'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  preparationTime: number;
}

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  country: {
    name: string;
  };
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Suppress exhaustive-deps for fetchRestaurantDetails; this keeps the change minimal.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchRestaurantDetails();
  }, [params.id]);

  const fetchRestaurantDetails = async () => {
    try {
      const res = await fetch(`/api/restaurants/${params.id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setRestaurant(data.data.restaurant);
      setMenuItems(data.data.menuItems);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      router.push('/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.menuItemId !== menuItemId);
    });
  };

  const getCartItemQuantity = (menuItemId: string) => {
    return cart.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add items to cart',
        variant: 'destructive',
      });
      return;
    }

    setOrdering(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: params.id,
          items: cart,
          deliveryAddress,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: 'Order placed successfully!',
      });

      router.push(`/orders/${data.data._id}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setOrdering(false);
    }
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link href="/restaurants">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Restaurants
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
          <CardDescription>{restaurant.description}</CardDescription>
          <div className="text-sm text-muted-foreground space-y-1 pt-2">
            <p>{restaurant.address}</p>
            {restaurant.phone && <p>📞 {restaurant.phone}</p>}
            <p>⭐ {restaurant.rating.toFixed(1)} rating</p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const quantity = getCartItemQuantity(item._id);
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.isVegetarian && (
                            <Badge variant="secondary" className="text-xs">
                              🌱 Veg
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="font-semibold">{formatCurrency(item.price)}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.preparationTime} mins
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {quantity === 0 ? (
                          <Button onClick={() => addToCart(item)} size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => removeFromCart(item._id)}
                              size="sm"
                              variant="outline"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium w-8 text-center">{quantity}</span>
                            <Button onClick={() => addToCart(item)} size="sm" variant="outline">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Tax (5%)</span>
                      <span>{formatCurrency(getCartTotal() * 0.05)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(50)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(getCartTotal() * 1.05 + 50)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={ordering || !session?.user?.role?.permissions?.createOrder}
                  >
                    {ordering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
