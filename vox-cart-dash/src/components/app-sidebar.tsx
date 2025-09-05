import { Home, Store, History, ShoppingBag } from "lucide-react"
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
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { title: "Home", url: "/", icon: Home },
  { title: "Store", url: "/store", icon: Store },
  { title: "History", url: "/history", icon: History },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const collapsed = state === "collapsed"

  const isActive = (path: string) => location.pathname === path

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 ease-smooth border-r border-sidebar-border bg-sidebar backdrop-blur-glass`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-design-sm">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold text-sidebar-foreground">Voice Assistant</h1>
              <p className="text-xs text-muted-foreground">Shopping Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-design-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Theme Toggle at Bottom */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </Sidebar>
  )
}