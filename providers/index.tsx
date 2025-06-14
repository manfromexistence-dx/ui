// "use client"

// import { Toaster as DefaultToaster, Toaster as NewYorkToaster } from "@/components/ui/toaster"
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { ThemeProvider } from "@/providers/theme-provider";
// import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
// import { ThemeProvider as NextThemesProvider } from "next-themes"
// import { ThemeSync } from "@/providers/theme-sync";
// import { SiteHeader } from "@/components/layout/site-header"
// import { NuqsAdapter } from "nuqs/adapters/next/app";
// import { Provider as JotaiProvider } from "jotai"
// import * as React from "react"
// import { Suspense } from "react"
// import { TooltipProvider } from "@/components/ui/tooltip";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// })

// export function Providers({
//   children,
//   ...props
// }: React.ComponentProps<typeof NextThemesProvider>) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Suspense fallback={<div>Loading...</div>}>
//         <NuqsAdapter>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             <JotaiProvider>
//               <NextThemesProvider {...props}>
//                 <TooltipProvider>
//                   <SiteHeader />

//                   {children}
//                   <ThemeSync />
//                   <NewYorkToaster />
//                   <DefaultToaster />
//                   <NewYorkSonner />
//                 </TooltipProvider>
//               </NextThemesProvider>
//             </JotaiProvider>
//           </ThemeProvider>
//         </NuqsAdapter>
//       </Suspense>
//     </QueryClientProvider>
//   )
// }

"use client"

import { Toaster as DefaultToaster, Toaster as NewYorkToaster } from "@/components/ui/toaster"
import { SubCategorySidebarProvider } from "@/components/layout/sidebar/subcategory-sidebar"
import { CategorySidebarProvider } from "@/components/layout/sidebar/category-sidebar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LeftSidebar } from "@/components/layout/sidebar/left-sidebar"
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// import { FontLoader } from "@/components/common/font-loader";
import { ThemeSync } from "@/providers/theme-sync";
import { SiteHeader } from "@/components/layout/site-header"
// import { BottomBar } from "@/components/layout/bottom-bar"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Main } from "@/providers/main"
import { Provider as JotaiProvider } from "jotai"
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import * as React from "react"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContainerWrapper } from "@/components/common/container-and-section-wrapper";
// import { MainNavigation, MobileNavigation } from "@/app/themes/navigation";
import {
  CustomizerSidebar,
  CustomizerSidebarToggle,
} from "@/components/customizer/customizer-sidebar";

const SIDEBAR_WIDTH = "21rem";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <JotaiProvider>
            <NextThemesProvider {...props}>
              <TooltipProvider>
                <SidebarProvider
                  defaultOpen={false}
                  // style={{
                  //   "--sidebar-width": SIDEBAR_WIDTH,
                  // }}
                >

                  {/* <CustomizerSidebar /> */}
                  <CategorySidebarProvider>
                    <SubCategorySidebarProvider>
                      <div
                        vaul-drawer-wrapper=""
                        className="relative h-screen w-full overflow-hidden"
                      >
                        <SiteHeader />
                        {/* <BottomBar /> */}
                        <Main>
                          {/* <Suspense></Suspense> */}
                          {children}
                          <ThemeSync />
                        </Main>
                        <NewYorkToaster />
                        <DefaultToaster />
                        <NewYorkSonner />
                      </div>
                    </SubCategorySidebarProvider>
                  </CategorySidebarProvider>
                </SidebarProvider>
              </TooltipProvider>
            </NextThemesProvider>
          </JotaiProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  )
}
