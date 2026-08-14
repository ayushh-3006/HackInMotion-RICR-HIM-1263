import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const isAuthRoute = (req: any) => {
  return authRoutes.some((route) => req.nextUrl.pathname.startsWith(route));
};

export default clerkMiddleware(async (auth, req) => {
  try {
    const authState = await auth();

    // If user is already logged in and tries to access an auth route,
    // redirect them to the dashboard.
    if (authState?.userId && isAuthRoute(req)) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  } catch (error) {
    // Catch Clerk secretKey authentication errors so local dev server does not crash
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
