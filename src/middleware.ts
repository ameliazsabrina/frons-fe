import { NextRequest, NextResponse } from "next/server";

const UNAUTHENTICATED_PAGES = ["/", "/refresh"];
const CARD_UNAUTHENTICATED_PAGES = ["/", "/waiting-list", "/card"];

function isPublicUserProfile(pathname: string): boolean {
  const usernamePattern = /^\/[a-zA-Z0-9_-]+$/;
  return usernamePattern.test(pathname);
}


export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const pathname = req.nextUrl.pathname;
  
  const isCardSubdomain =
    hostname.startsWith("card.") ||
    hostname === "card.fronsciers.com" ||
    hostname.includes("card.localhost") ||
    hostname === "card.fronsciers.local";

  // Handle card subdomain routing
  if (isCardSubdomain) {
    const url = req.nextUrl.clone();
    if (url.pathname === "/") {
      url.pathname = "/(card)";
    } else if (!url.pathname.startsWith("/(card)")) {
      url.pathname = `/(card)${url.pathname}`;
    }
    // Card subdomain is public, no auth required
    return NextResponse.rewrite(url);
  }

  // Handle main domain auth
  const cookieAuthToken = req.cookies.get("privy-token");
  const cookieSession = req.cookies.get("privy-session");

  if (req.nextUrl.searchParams.get("privy_oauth_code")) {
    return NextResponse.next();
  }

  if (pathname === "/refresh") {
    return NextResponse.next();
  }

  // Public pages on main domain
  if (
    UNAUTHENTICATED_PAGES.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`)
    ) ||
    isPublicUserProfile(pathname)
  ) {
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
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}
