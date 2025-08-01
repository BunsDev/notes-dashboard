// Type definitions for @stackframe/stack
declare module '@stackframe/stack' {
  import { ReactNode } from 'react';

  // User types
  export interface StackUser {
    id: string;
    displayName?: string;
    primaryEmail?: string;
    signOut: () => Promise<void>;
    update: (data: any) => Promise<void>;
  }

  // Provider props
  export interface StackProviderProps {
    app: StackServerApp;
    children: ReactNode;
  }

  export interface StackThemeProps {
    children: ReactNode;
  }

  // Server app
  export class StackServerApp {
    constructor(config: {
      publishableClientKey: string;
      tokenStore: string;
      urls?: {
        afterSignIn?: string;
        afterSignUp?: string;
        afterSignOut?: string;
        accountSettings?: string;
        signIn?: string;
        signUp?: string;
        handler?: string;
        signOut?: string;
        emailVerification?: string;
        passwordReset?: string;
        forgotPassword?: string;
        home?: string;
        oauthCallback?: string;
        magicLinkCallback?: string;
        teamInvitation?: string;
        error?: string;
      };
    });

    getUser(options?: { or?: 'throw' | 'redirect' }): Promise<StackUser | null>;
  }

  // Handler components
  export interface StackHandlerProps {
    app: StackServerApp;
    routeProps: any;
    fullPage?: boolean;
  }

  // Components
  export const StackProvider: React.FC<StackProviderProps>;
  export const StackTheme: React.FC<StackThemeProps>;
  export const StackHandler: React.FC<StackHandlerProps>;
  export const UserButton: React.FC;
  export const SignIn: React.FC;
  export const SignUp: React.FC;

  // Hooks
  export function useUser(options?: { or?: 'throw' | 'redirect' }): StackUser | null;
  export function useStackApp(): any;
}