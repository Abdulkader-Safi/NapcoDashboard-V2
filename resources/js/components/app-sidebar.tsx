"use client";

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import campaign from '@/routes/campaign';
import product from '@/routes/product';
import keyword from '@/routes/keywords';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Megaphone, BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Campaign', href: campaign.index.url(), icon: Megaphone },
    { title: 'Products', href: product.index.url(), icon: BookOpen },
    { title: 'Keywords', href: keyword.index.url(), icon: Folder },
];

const footerNavItems: NavItem[] = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* TODO: only admin can access this tab */}
                <NavFooter items={footerNavItems} className="mt-auto" />

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
