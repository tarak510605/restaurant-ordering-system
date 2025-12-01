import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import Country from '@/lib/models/Country';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email })
            .select('+password')
            .populate('role')
            .populate('country');

          if (!user) {
            throw new Error('Invalid email or password');
          }

          if (!user.isActive) {
            throw new Error('Your account has been deactivated');
          }

          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Type assertion for populated fields
          const role = user.role as any;
          const country = user.country as any;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: {
              id: role._id.toString(),
              name: role.name,
              permissions: role.permissions,
            },
            country: {
              id: country._id.toString(),
              name: country.name,
              code: country.code,
            },
          };
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.country = user.country;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.country = token.country as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
