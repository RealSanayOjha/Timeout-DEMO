import { useState } from "react"
import { 
  Home, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  Leaf, 
  Brain, 
  Settings,
  TreePine,
  Target,
  Clock,
  Heart
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Study Sessions", url: "/study", icon: BookOpen },
  { title: "Study Rooms", url: "/rooms", icon: Users },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
]

const wellnessItems = [
  { title: "Digital Detox", url: "/detox", icon: Leaf },
  { title: "Wellness Dashboard", url: "/wellness", icon: Heart },
  { title: "Focus Timer", url: "/focus", icon: Clock },
]

const otherItems = [
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function ForestSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavClasses = (active: boolean) =>
    cn(
      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-normal",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
    )

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border transition-all duration-normal",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="px-3 py-4">
        {/* Brand Header */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-4 mb-2",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-nature text-white shadow-nature">
            <TreePine className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold font-display text-sidebar-foreground">
                TimeOut
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Smart Focus App</p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavClasses(active)}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          active ? "text-primary" : "text-sidebar-foreground/60"
                        )} />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                        {active && !collapsed && (
                          <div className="absolute left-0 h-6 w-1 rounded-r-lg bg-primary" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Wellness & Focus */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Wellness & Focus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {wellnessItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavClasses(active)}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          active ? "text-success" : "text-sidebar-foreground/60"
                        )} />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                        {active && !collapsed && (
                          <div className="absolute left-0 h-6 w-1 rounded-r-lg bg-success" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Other
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {otherItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavClasses(active)}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          active ? "text-secondary" : "text-sidebar-foreground/60"
                        )} />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                        {active && !collapsed && (
                          <div className="absolute left-0 h-6 w-1 rounded-r-lg bg-secondary" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
