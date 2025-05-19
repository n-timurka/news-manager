import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";

export enum Permission {
  // User permissions
  VIEW_USERS = "VIEW_USERS",
  MANAGE_USERS = "MANAGE_USERS",
  // Post permissions
  CREATE_POSTS = "CREATE_POSTS",
  EDIT_OWN_POSTS = "EDIT_OWN_POSTS",
  EDIT_ALL_POSTS = "EDIT_ALL_POSTS",
  DELETE_OWN_POSTS = "DELETE_OWN_POSTS",
  DELETE_ALL_POSTS = "DELETE_ALL_POSTS",
  // Comment permissions
  CREATE_COMMENTS = "CREATE_COMMENTS",
  EDIT_OWN_COMMENTS = "EDIT_OWN_COMMENTS",
  DELETE_OWN_COMMENTS = "DELETE_OWN_COMMENTS",
  DELETE_ALL_COMMENTS = "DELETE_ALL_COMMENTS",
}
export const RolePermissions = {
  [UserRole.USER]: [
    Permission.CREATE_POSTS,
    Permission.CREATE_COMMENTS,
    Permission.EDIT_OWN_COMMENTS,
    Permission.DELETE_OWN_COMMENTS,
  ],
  [UserRole.EDITOR]: [
    Permission.CREATE_POSTS,
    Permission.EDIT_OWN_POSTS,
    Permission.DELETE_OWN_POSTS,
    Permission.CREATE_COMMENTS,
    Permission.EDIT_OWN_COMMENTS,
    Permission.DELETE_OWN_COMMENTS,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};

export default function usePermissions() {
  const { data: session, status } = useSession();

  // Function to check if user has a permission
  const can = (permission: Permission): boolean => {
    if (status !== "authenticated" || !session?.user?.role) {
      return false;
    }

    const userRole = session.user.role as UserRole;
    return RolePermissions[userRole]?.includes(permission) || false;
  };

  return { can };
}
