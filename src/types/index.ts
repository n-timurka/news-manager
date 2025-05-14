// Extend the built-in session types from next-auth
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       name: string;
//       email: string;
//       role: string;
//     };
//   }
// }

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
