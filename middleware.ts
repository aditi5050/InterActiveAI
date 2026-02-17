import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", 
  "/signin(.*)", 
  "/signup(.*)", 
  "/sso-callback(.*)",
  "/assets(.*)",
  "/api/upload(.*)",
]);

// API routes handle their own auth - don't redirect from middleware
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Skip protection for public routes
  if (isPublicRoute(req)) {
    return;
  }
  
  // API routes handle their own auth - don't call protect() which throws NEXT_NOT_FOUND
  if (isApiRoute(req)) {
    return;
  }
  
  // Protect page routes (non-API)
  auth.protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

