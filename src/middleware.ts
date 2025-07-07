import { NextRequest, NextResponse } from "next/server";

const UNAUTHENTICATED_PAGES = ["/", "/refresh"];

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
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

  if (UNAUTHENTICATED_PAGES.includes(pathname)) {
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
