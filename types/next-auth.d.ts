import 'next-auth';
import { RoleName } from '@/lib/models/Role';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: RoleName;
      permissions: {
        viewRestaurants: boolean;
        createOrder: boolean;
        checkout: boolean;
        cancelOrder: boolean;
        updatePaymentMethod: boolean;
      };
    };
    country: {
      id: string;
      name: string;
      code: string;
    };
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: {
      id: string;
      name: RoleName;
      permissions: {
        viewRestaurants: boolean;
        createOrder: boolean;
        checkout: boolean;
        cancelOrder: boolean;
        updatePaymentMethod: boolean;
      };
    };
    country: {
      id: string;
      name: string;
      code: string;
    };
  }
}
