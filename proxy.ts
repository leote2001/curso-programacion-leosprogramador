import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
    const {pathname} = req.nextUrl;
    const isLogged = req.cookies.get("admin_session");
    if (!isLogged && pathname.startsWith("/admin/dashboard")) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isLogged && pathname.startsWith("/admin/login")) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (!isLogged && pathname.startsWith("/api/admin/login")) {
        return NextResponse.next();
    }
    return NextResponse.next();
} 
export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"]
}