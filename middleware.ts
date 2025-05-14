import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;

      // Protect dashboard route for admins and editors
      if (pathname.startsWith("/dashboard")) {
        return !!token && ["ADMIN", "EDITOR"].includes(token.role as string);
      }

      // Allow access to public routes
      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/posts/new"],
};
