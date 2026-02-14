import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/signin(.*)",
  "/signup(.*)",
  "/sso-callback(.*)",
  "/assets(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

  if (!isPublicRoute(req)) {
    const { protect } = await auth();  
    protect();
  }

});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
