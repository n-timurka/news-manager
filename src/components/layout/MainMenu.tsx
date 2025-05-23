import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import usePermissions, { Permission } from "@/hooks/usePermissions";

export default function MainMenu() {
    const { can } = usePermissions();

    return (
        <NavigationMenu className="text-sm">
            <NavigationMenuList className="gap-6">
                {can(Permission.CREATE_POSTS) && (
                    <NavigationMenuItem asChild className="cursor-pointer">
                        <Button variant="secondary">
                            <Link href="/posts/create" className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Create Post</span>
                            </Link>
                        </Button>
                    </NavigationMenuItem>
                )}
            </NavigationMenuList>
        </NavigationMenu>
    )
}