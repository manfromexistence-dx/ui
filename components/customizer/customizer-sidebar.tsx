"use client";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { FileSliders, LanguagesIcon, LetterText, Menu, PaintBucket, Palette, PanelLeftDashed, SlidersHorizontal, SwatchBook, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionButtons } from "@/components/customizer/action-buttons";
import { ColorTokens } from "@/components/customizer/color-tokens";
import { ComingSoon } from "@/components/customizer/coming-soon";
import {
  AllPresetsControl,
  ControlSection,
  ControlsSkeleton,
  RadiusSliderControl,
  ShadowsControl,
  SurfaceShadesControl,
} from "@/components/customizer/customizer-controls";


import { Typography } from "@/components/customizer/typography";
import Link from "next/link"
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  Calendar,
  CircleSlash2,
  // Command as CommandIcon,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Gift,
  Heart,
  Home,
  Info,
  LibraryBig,
  Map,
  MessageCircleQuestion,
  PanelRight,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { History } from "@/components/layout/sidebar/history"
import { TeamSwitcher } from "@/components/layout/sidebar/team-switcher"
import { useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Banner } from "@/components/layout/banner"
import { usePathname } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { useState } from "react";
import { i18n, type Locale } from "@/lib/i18n/i18n-config";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { lt } from "@/lib/utils";
import { NavDesktopActions, NavMobileActions } from "@/components/layout/nav-actions";

// Language names mapping for better UX
const languageNames: Record<string, string> = {
  af: "Afrikaans",
  ak: "Akan",
  am: "Amharic",
  ar: "العربية",
  as: "Assamese",
  ay: "Aymara",
  az: "Azərbaycan",
  be: "Беларуская",
  bg: "Български",
  bho: "Bhojpuri",
  bm: "Bamanankan",
  bn: "বাংলা",
  bs: "Bosanski",
  ca: "Català",
  ceb: "Cebuano",
  ckb: "کوردی",
  co: "Corsu",
  cs: "Čeština",
  cy: "Cymraeg",
  da: "Dansk",
  de: "Deutsch",
  dv: "Dhivehi",
  ee: "Eʋegbe",
  el: "Ελληνικά",
  en: "English",
  eo: "Esperanto",
  es: "Español",
  et: "Eesti",
  eu: "Euskera",
  fa: "فارسی",
  fi: "Suomi",
  fr: "Français",
  fy: "Frysk",
  ga: "Gaeilge",
  gd: "Gàidhlig",
  gl: "Galego",
  gn: "Guaraní",
  gu: "ગુજરાતી",
  ha: "Hausa",
  haw: "Hawaiian",
  he: "עברית",
  hi: "हिन्दी",
  hmn: "Hmong",
  hr: "Hrvatski",
  ht: "Kreyòl",
  hu: "Magyar",
  hy: "Հայերեն",
  id: "Indonesia",
  ig: "Igbo",
  is: "Íslenska",
  it: "Italiano",
  ja: "日本語",
  jw: "Basa Jawa",
  ka: "ქართული",
  kk: "Қазақша",
  km: "ខ្មែរ",
  kn: "ಕನ್ನಡ",
  ko: "한국어",
  kri: "Krio",
  ku: "Kurdî",
  ky: "Кыргызча",
  la: "Latina",
  lb: "Lëtzebuergesch",
  lg: "Luganda",
  ln: "Lingála",
  lo: "ລາວ",
  lt: "Lietuvių",
  lus: "Mizo",
  lv: "Latviešu",
  mai: "Maithili",
  mg: "Malagasy",
  mi: "Māori",
  mk: "Македонски",
  ml: "മലയാളം",
  mn: "Монгол",
  mr: "मराठी",
  ms: "Bahasa Melayu",
  mt: "Malti",
  my: "မြန်မာ",
  ne: "नेपाली",
  nl: "Nederlands",
  no: "Norsk",
  nso: "Sepedi",
  ny: "Chichewa",
  om: "Oromoo",
  or: "ଓଡ଼ିଆ",
  pa: "ਪੰਜਾਬੀ",
  pl: "Polski",
  ps: "پښتو",
  pt: "Português",
  qu: "Runasimi",
  ro: "Română",
  ru: "Русский",
  rw: "Kinyarwanda",
  sa: "संस्कृतम्",
  sd: "سنڌي",
  si: "සිංහල",
  sk: "Slovenčina",
  sl: "Slovenščina",
  sm: "Gagana Samoa",
  sn: "ChiShona",
  so: "Soomaali",
  sq: "Shqip",
  sr: "Српски",
  st: "Sesotho",
  su: "Basa Sunda",
  sv: "Svenska",
  sw: "Kiswahili",
  ta: "தமிழ்",
  te: "తెలుగు",
  tg: "Тоҷикӣ",
  th: "ไทย",
  ti: "ትግርኛ",
  tk: "Türkmen",
  tl: "Filipino",
  tr: "Türkçe",
  ts: "Xitsonga",
  tt: "Татарча",
  tw: "Twi",
  ug: "ئۇيغۇرچە",
  uk: "Українська",
  ur: "اردو",
  uz: "O'zbek",
  vi: "Tiếng Việt",
  xh: "isiXhosa",
  yi: "ייִדיש",
  yo: "Yorùbá",
  zh: "中文",
  zu: "isiZulu",
};

export function CustomizerSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // if (!mounted) {
  //   return (
  //     <div className="space-y-4 p-4 border rounded-lg">
  //       <h3 className="font-semibold">lt() Function Demo</h3>
  //       <div className="text-muted-foreground">Loading...</div>
  //     </div>
  //   );
  // }

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const getCurrentLocale = (): Locale => {
    if (!pathname) return i18n.defaultLocale;
    const segments = pathname.split("/");
    const localeFromPath = segments[1];
    return i18n.locales.includes(localeFromPath as Locale)
      ? (localeFromPath as Locale)
      : i18n.defaultLocale;
  };

  const currentLocale = getCurrentLocale();
  const currentLanguageName = languageNames[currentLocale] || currentLocale.toUpperCase();
  const router = useRouter()

  // const user = {
  //   uid: "test-user-uid",
  //   photoURL: "https://via.placeholder.com/150",
  //   displayName: "Test User",
  //   email: "test@example.com",
  // };

  // // Create a handler function for the Start New button
  // const handleStartNew = useCallback(async () => {
  //   try {
  //     if (!user) {
  //       toast.error("Authentication required", {
  //         description: "Please sign in to start a new chat",
  //         duration: 3000,
  //       });
  //       return;
  //     }

  //     // Generate a new UUID for the chat
  //     const chatId = uuidv4();

  //     // Create initial chat data with empty messages array
  //     const chatData = {
  //       id: chatId,
  //       title: "New Conversation",
  //       messages: [], // Start with empty messages array
  //       model: "simulated-model", // Default model // aiService.currentModel,
  //       visibility: "public",
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString(),
  //       creatorUid: user.uid,
  //       reactions: {
  //         likes: {},
  //         dislikes: {},
  //       },
  //       participants: [user.uid],
  //       views: 0,
  //       uniqueViewers: [],
  //       isPinned: false,
  //     };

  //     // Store chat data in Firestore
  //     // await setDoc(doc(db, "chats", chatId), chatData);
  //     console.log("Simulating storing chat data:", chatData);
  //     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation

  //     // Store information in sessionStorage
  //     sessionStorage.setItem("selectedAI", "simulated-model" /*aiService.currentModel*/);
  //     sessionStorage.setItem("chatId", chatId)
  //     sessionStorage.setItem("isNewChat", "true")

  //     // Navigate to the new chat
  //     router.push(`/chat/${chatId}`)
  //   } catch (error) {
  //     console.error("Error creating new chat:", error)
  //     toast.error("Failed to create new chat", {
  //       description: "Please try again",
  //     })
  //   }
  // }, [user, router])

  // if (!isMounted) {
  //   return (
  //     <Sidebar className="overflow-hidden" {...props}>
  //       <SidebarHeader className="px-2 max-md:pt-4">
  //         <Skeleton className="bg-muted h-9" />
  //       </SidebarHeader>

  //       <SidebarContent className="scrollbar-thin @container relative flex max-h-svh flex-col py-2 group-data-[collapsible=icon]:invisible [&>button]:hidden">
  //         <div className="flex grow flex-col space-y-4 overflow-hidden px-2">
  //           <ControlsSkeleton className="h-10" />

  //           <div className="grow overflow-hidden">
  //             <ControlsSkeleton className="h-200" />
  //           </div>
  //         </div>
  //       </SidebarContent>

  //       <SidebarFooter className="space-y-1 px-2">
  //         <Skeleton className="bg-muted h-8" />
  //         <Skeleton className="bg-muted h-8" />
  //       </SidebarFooter>
  //       <SidebarRail />
  //     </Sidebar>
  //   );
  // }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
      <Tabs
        defaultValue="sidebar"
        className="flex flex-1 flex-col gap-0 overflow-hidden"
      >
        <SidebarHeader>
          <TeamSwitcher />
          <NavDesktopActions />
        </SidebarHeader>

        <SidebarContent className="@container relative my-0 max-h-svh pt-2 pb-0 group-data-[collapsible=icon]:invisible [&>button]:hidden">
          <ScrollArea className="flex flex-col overflow-hidden">
            <TabsContent
              value="sidebar"
              className="mx-1 mb-2 flex flex-col space-y-4"
            >
              <NavMobileActions />

              {/* <div className="flex flex-col gap-1 w-full">
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
                <History />
              </div> */}
            </TabsContent>

            <TabsContent
              value="languages"
              className="mx-2.5 mb-2 gap-4"
            >
              <Command className="bg-background">
                <CommandInput className="!h-14" placeholder="Search languages..." />
                <CommandList className="min-h-[80vh] lg:min-h-[71.5vh]">
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup>
                    {i18n.locales.map((locale) => (
                      <Link
                        key={locale}
                        href={locale}>
                        <CommandItem
                          value={`${locale} ${languageNames[locale] || locale}`}
                        // onSelect={() => {
                        //   // Navigate to the new locale
                        //   window.location.href = redirectedPathname(locale);
                        // }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currentLocale === locale ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-1 items-center justify-between">
                            <span>{languageNames[locale] || locale}</span>
                            <span className="text-xs text-muted-foreground">
                              {locale.toUpperCase()}
                            </span>
                          </div>
                        </CommandItem>
                      </Link>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>

              {/* <LocalePanel /> */}

            </TabsContent>

            <TabsContent
              value="palette"
              className="mx-2.5 mb-2 flex flex-col space-y-4"
            >
              <section className="flex-1 space-y-1.5 max-sm:w-full max-sm:max-w-full">
                <ActionButtons />
                <Label className="flex items-center gap-1 pb-2">
                  <PaintBucket className="size-4" /> Theme presets
                </Label>
                <AllPresetsControl />
              </section>
              <ColorTokens />
            </TabsContent>

            <TabsContent value="tokens" className="mx-2.5 mb-2">
              <section className="space-y-1.5">
                <Label className="flex items-center gap-1 pb-2">
                  <SlidersHorizontal className="size-4" /> Other tokens
                </Label>

                <ControlSection title="Surface" expanded className="p-0">
                  <SurfaceShadesControl className="bg-transparent" />
                  <div className="text-muted-foreground mb-3 truncate px-3 text-xs">
                    For background, card, popover, muted, accent...
                  </div>
                </ControlSection>

                <ControlSection title="Radius" expanded>
                  <RadiusSliderControl />
                </ControlSection>

                <ControlSection title="Shadows">
                  <ShadowsControl />
                </ControlSection>

                <ControlSection title="Spacing">
                  <ComingSoon />
                </ControlSection>

              </section>
            </TabsContent>

            <TabsContent value="typography" className="mx-2.5 mb-2">
              <Typography />
            </TabsContent>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="px-2">
          {state === "expanded" ? (
            <>
              <Banner title="Info" message="Friday is still in beta so it can make mistakes." />
              <TabsList className="w-full p-1">
                <TabsTrigger value="sidebar">
                  <PanelLeftDashed />
                </TabsTrigger>
                <TabsTrigger value="languages">
                  <LanguagesIcon />
                </TabsTrigger>
                <TabsTrigger value="palette">
                  <SwatchBook />
                </TabsTrigger>
                <TabsTrigger value="tokens">
                  <FileSliders />
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <LetterText />
                </TabsTrigger>
              </TabsList>
            </>
          ) : (
            <>
              <div className="inline md:hidden">
                <TabsList className="w-full p-1">
                  <TabsTrigger value="sidebar">
                    <PanelLeftDashed />
                  </TabsTrigger>
                  <TabsTrigger value="languages">
                    <LanguagesIcon />
                  </TabsTrigger>
                  <TabsTrigger value="palette">
                    <SwatchBook />
                  </TabsTrigger>
                  <TabsTrigger value="tokens">
                    <FileSliders />
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <LetterText />
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="md:flex flex-col gap-2 hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => {
                          toggleSidebar()
                        }}
                        className="flex min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground items-center justify-center rounded-md"
                      >
                        <PanelRight className="size-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Expand Sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-8 min-w-8 items-center justify-center rounded-md">
                        <Info className="size-[18.5px]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Friday is still in beta so it can make mistakes.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
          {/* <ActionButtons /> */}
        </SidebarFooter>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}

export function CustomizerSidebarToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, toggleSidebar, openMobile } = useSidebar();
  return (
    <>
      <Button
        size={"sm"}
        variant="outline"
        className="size-8 md:hidden"
        onClick={toggleSidebar}

      >
        <Menu className="size-4" />
      </Button>
      {/* <Button
        variant={"ghost"}
        size={"icon"}
        onClick={toggleSidebar}
        className={cn("relative hidden md:inline-flex", className)}
        {...props}
      >
        <Palette
          className={cn(
            "transition duration-200",
            open ? "absolute scale-0" : "scale-100",
          )}
        />
        <X
          className={cn(
            "transition duration-200",
            !open ? "absolute scale-0" : "scale-100",
          )}
        />
        <div
          className={cn(
            "bg-primary absolute top-0 right-0 size-2 rounded-full transition-opacity duration-300 ease-in-out",
            open ? "opacity-0" : "animate-bounce opacity-100",
          )}
        />
      </Button>

      <Button
        variant={"ghost"}
        size={"icon"}
        onClick={toggleSidebar}
        className={cn("relative inline-flex md:hidden", className)}
        {...props}
      >
        <Palette
          className={cn(
            "transition duration-200",
            openMobile ? "absolute scale-0" : "scale-100",
          )}
        />
        <X
          className={cn(
            "transition duration-200",
            !openMobile ? "absolute scale-0" : "scale-100",
          )}
        />
        <div
          className={cn(
            "bg-primary absolute top-0 right-0 size-2 rounded-full transition-opacity duration-300 ease-in-out",
            openMobile ? "opacity-0" : "animate-bounce opacity-100",
          )}
        />
      </Button> */}
    </>
  );
}
