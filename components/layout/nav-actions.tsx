import * as React from "react";
import {useSidebar,
} from "@/components/ui/sidebar";

import Link from "next/link"
import {
    Blocks,
    CircleSlash2,
    Ellipsis,
    Frame,
    Home,
    Info,
    LibraryBig,
    Plus,
    Sparkles,
} from "lucide-react"
import {
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { lt } from "@/lib/utils";

export function NavMobileActions() {
    return (
        <div className="flex flex-col gap-1 w-full">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            // onClick={handleStartNew}
                            className="mx-1.5 flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            {lt("navigation.new")}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>
                            {lt("navigation.new")}
                        </p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <Home className="size-4 mr-2" />
                            {lt("navigation.home")}

                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>
                            {lt("navigation.home")}
                        </p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/automations" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <Sparkles className="size-4 mr-2" />
                            {lt("navigation.automations")}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{lt("navigation.automations")}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/variants" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <CircleSlash2 className="size-4 mr-2" />
                            {lt("navigation.varients")}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{lt("navigation.varients")}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/library" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <LibraryBig className="size-4 mr-2" />
                            {lt("navigation.library")}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{lt("navigation.library")}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/projects" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <Blocks className="size-4 mr-2" />
                            {lt("navigation.projects")}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{lt("navigation.projects")}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/spaces" className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <Frame className="size-4 mr-2" />
                            {lt("navigation.spaces")}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{lt("navigation.spaces")}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={{ pathname: "/more" }} className="text-sm mx-1.5 min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:border flex items-center px-2 py-1">
                            <Ellipsis className="size-4 mr-2" />
                            {lt("navigation.more")}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{lt("navigation.more")}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>


            <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
            {/* <History /> */}
        </div>
    );
}

export function NavDesktopActions() {
    const { state } = useSidebar()
    return (
        <div className="hidden md:inline">
            {
                state !== "expanded" && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    // onClick={handleStartNew}
                                    className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.new")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/">
                                    <SidebarMenuButton>
                                        <Home className="size-4 mr-2" />
                                        {lt("navigation.home")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>                          {lt("navigation.home")}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/automations">
                                    <SidebarMenuButton>
                                        <Sparkles className="size-4 mr-2" />
                                        {lt("navigation.automations")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.automations")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/variants">
                                    <SidebarMenuButton>
                                        <CircleSlash2 className="size-4 mr-2" />
                                        {lt("navigation.varients")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.varients")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/library">
                                    <SidebarMenuButton>
                                        <LibraryBig className="size-4 mr-2" />
                                        {lt("navigation.library")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.library")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/projects">
                                    <SidebarMenuButton>
                                        <Blocks className="size-4 mr-2" />
                                        {lt("navigation.projects")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.projects")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/spaces">
                                    <SidebarMenuButton>
                                        <Frame className="size-4 mr-2" />
                                        {lt("navigation.spaces")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.spaces")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={{ pathname: "/more" }}>
                                    <SidebarMenuButton>
                                        <Ellipsis className="size-4 mr-2" />
                                        {lt("navigation.more")}
                                    </SidebarMenuButton>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{lt("navigation.more")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        </div>
    );
}
