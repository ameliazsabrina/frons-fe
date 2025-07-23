import { NextRequest, NextResponse } from "next/server";

const UNAUTHENTICATED_PAGES = ["/", "/refresh"];

// Function to check if a path should be publicly accessible
function isPublicUserProfile(pathname: string): boolean {
  // Match pattern: /[username] where username contains only letters, numbers, underscores, hyphens
  const usernamePattern = /^\/[a-zA-Z0-9_-]+$/;
  return usernamePattern.test(pathname);
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)"
  ],
};

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get("privy-token");
  const cookieSession = req.cookies.get("privy-session");
  const pathname = req.nextUrl.pathname;

  if (req.nextUrl.searchParams.get("privy_oauth_code")) {
    return NextResponse.next();
  }

  if (pathname === "/refresh") {
    return NextResponse.next();
  }

  if (UNAUTHENTICATED_PAGES.includes(pathname) || isPublicUserProfile(pathname)) {
    return NextResponse.next();
  }

  const definitelyAuthenticated = Boolean(cookieAuthToken);
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    const refreshUrl = new URL("/refresh", req.url);
    refreshUrl.searchParams.set(
      "redirect_uri",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(refreshUrl);
  }

  if (!definitelyAuthenticated && !maybeAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
