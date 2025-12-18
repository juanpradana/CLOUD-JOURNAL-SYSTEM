import { lucia } from "./auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    // CSRF Protection
    if (context.request.method !== "GET" && context.request.method !== "HEAD") {
        const originHeader = context.request.headers.get("Origin");
        const refererHeader = context.request.headers.get("Referer");
        const hostHeader = context.request.headers.get("Host");
        
        if (originHeader) {
             if (!hostHeader || !verifyOrigin(originHeader, [hostHeader])) {
                return new Response("Forbidden (Invalid Origin)", { status: 403 });
             }
        } else if (refererHeader) {
             if (!hostHeader || !verifyOrigin(refererHeader, [hostHeader])) {
                return new Response("Forbidden (Invalid Referer)", { status: 403 });
             }
        } else {
            // Block requests without Origin or Referer (Strict mode)
            return new Response("Forbidden (Missing Origin/Referer)", { status: 403 });
        }
    }

	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}

	context.locals.session = session;
	context.locals.user = user;
	return next();
});

function verifyOrigin(origin: string, allowedHosts: string[]): boolean {
    if (!origin || !allowedHosts) return false;
    try {
        const url = new URL(origin);
        return allowedHosts.some(host => {
            // Remove port from host if present to match generic host check if needed,
            // but usually Origin has scheme://host:port and Host header is host:port
            // We want to check if origin's host matches the Host header
            return url.host === host; 
        });
    } catch {
        return false;
    }
}
