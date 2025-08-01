import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  tokenStore: "nextjs-cookie",
  urls: {
    afterSignIn: "/notes",
    afterSignUp: "/notes",
    afterSignOut: "/",
    // accountSettings: "/settings",
    // signIn: "/sign-in",
    // signUp: "/sign-up",
    // handler: "/handler",
    // signOut: "/sign-out",
    // emailVerification: "/email-verification",
    // passwordReset: "/password-reset",
    // forgotPassword: "/forgot-password",
    // home: "/",
    // oauthCallback: "/oauth-callback",
    // magicLinkCallback: "/magic-link-callback",
    // teamInvitation: "/team-invitation",
    // error: "/error",
  },
  
});
