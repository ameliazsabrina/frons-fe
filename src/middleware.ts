import { NextRequest, NextResponse } from "next/server";

// Pages that don't require authentication
const UNAUTHENTICATED_PAGES = ["/", "/refresh"];

export const config = {
  // necessary to ensure that you are redirected to the refresh page
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get("privy-token");
  const cookieSession = req.cookies.get("privy-session");
  const pathname = req.nextUrl.pathname;

  // Bypass middleware when `privy_oauth_code` is a query parameter, as
  // we are in the middle of an authentication flow
  if (req.nextUrl.searchParams.get("privy_oauth_code")) {
    return NextResponse.next();
  }

  // Bypass middleware when the /refresh page is fetched, otherwise
  // we will enter an infinite loop
  if (pathname === "/refresh") {
    return NextResponse.next();
  }

  // Allow unauthenticated pages
  if (UNAUTHENTICATED_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  // If the user has `privy-token`, they are definitely authenticated
  const definitelyAuthenticated = Boolean(cookieAuthToken);
  // If user has `privy-session`, they also have `privy-refresh-token` and
  // may be authenticated once their session is refreshed in the client
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    // If user is not authenticated, but is maybe authenticated
    // redirect them to the `/refresh` page to trigger client-side refresh flow
    const refreshUrl = new URL("/refresh", req.url);
    refreshUrl.searchParams.set(
      "redirect_uri",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(refreshUrl);
  }

  // If user is not authenticated and doesn't have a session, redirect to home
  if (!definitelyAuthenticated && !maybeAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
