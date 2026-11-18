import { NextResponse, type NextRequest } from "next/server"

// Cheap gate: no cookie, no admin page. The signature is checked server-side in the admin layout.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !req.cookies.has("sdlv_session")) {
    const url = new URL("/admin/login", req.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*"] }
