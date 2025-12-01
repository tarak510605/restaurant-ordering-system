'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ChefHat, Loader2 } from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: string;
  cuisine: string[];
  rating: number;
  image: string;
  country: {
    name: string;
    code: string;
  };
}

export default function RestaurantsPage() {
  const { data: session } = useSession();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch restaurants');
      }

      setRestaurants(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <p className="text-muted-foreground mt-1">
          Browse restaurants available in {session?.user?.country?.name}
        </p>
      </div>

      {restaurants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No restaurants available in your region.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 relative">
                {restaurant.image ? (
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{restaurant.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {restaurant.description || 'Delicious food awaits you'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{restaurant.address}</span>
                </div>

                {restaurant.cuisine.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                )}

                <Link href={`/restaurants/${restaurant._id}`} className="block">
                  <Button className="w-full">View Menu</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
