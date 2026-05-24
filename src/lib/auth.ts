import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { verifyCaptcha } from './captcha';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        captchaToken: { label: 'Captcha', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email și parolă sunt obligatorii');
        }

        // reCAPTCHA v3 verification
        const captchaToken = (credentials as Record<string, string | undefined>).captchaToken;
        if (captchaToken) {
          const result = await verifyCaptcha(captchaToken);
          if (!result.success) {
            throw new Error('Verificarea CAPTCHA a eșuat. Te rugăm să reîncerci.');
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error('Email sau parolă incorectă');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Email sau parolă incorectă');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Helper to get session on server side
export async function getAuthUser(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  return {
    id: (session.user as { id: string }).id,
    email: session.user.email!,
    name: session.user.name,
    role: (session.user as { role: string }).role,
  };
}

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return { user: null, error: 'unauthorized' as const };
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    return { user: null, error: 'forbidden' as const };
  }
  return { user, error: null };
}
