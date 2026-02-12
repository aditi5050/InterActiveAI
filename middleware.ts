import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", 
  "/signin(.*)", 
  "/signup(.*)", 
  "/sso-callback(.*)", // This is crucial for OAuth redirects
  "/assets(.*)"
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

