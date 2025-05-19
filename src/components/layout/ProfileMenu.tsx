import { ChevronDown, User, LogOut, Users, Newspaper, LockKeyhole } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User as UserType } from '@/types';
import { useState } from "react";
import UserUpdateForm from "@/components/UserUpdateForm";
import Link from "next/link";
import usePermissions, { Permission } from "@/hooks/usePermissions";

export default function ProfileMenu() {
    const { data: session } = useSession();
    const [editUser, setEditUser] = useState<UserType | null>(null);
    const { can } = usePermissions();

    const handleChangePassword = () => {}
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user.avatar || undefined} alt="User avatar" />
                        <AvatarFallback>
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span>{session?.user?.name || session?.user?.email}</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem className="cursor-pointer">
                    <Link href="/posts" className="flex items-center space-x-2 gap-2">
                        <Newspaper className="h-4 w-4" /> 
                        <span>Posts</span>
                    </Link>
                </DropdownMenuItem>
                {can(Permission.VIEW_USERS) && (
                    <DropdownMenuItem className="cursor-pointer">
                        <Link href="/users" className="flex items-center space-x-2 gap-2">
                            <Users className="h-4 w-4" /> 
                            <span>Users</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer flex items-center space-x-2"
                  onClick={() => setEditUser({ ...session?.user as UserType })}
                >
                    <User className="h-4 w-4" />
                    <span>My Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer flex items-center space-x-2"
                    onClick={handleChangePassword}
                >
                    <LockKeyhole className="h-4 w-4" />
                    <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer flex items-center space-x-2"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            {editUser && (
                <UserUpdateForm
                    user={editUser}
                    isOpen={!!editUser}
                    onClose={() => setEditUser(null)}
                    isAdmin={session?.user.role === 'ADMIN'}
                />
            )}
        </DropdownMenu>
    )
}