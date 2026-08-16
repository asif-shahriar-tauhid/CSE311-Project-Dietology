'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import {
  Activity,
  LayoutDashboard,
  Apple,
  Dumbbell,
  Moon,
  Globe,
  Settings,
  Bell,
  Plus,
  Menu,
  LogOut,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/useAuthStore';
import { PageTransition } from '@/components/ui/page-transition';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'nutrition' | 'glucose' | 'sleep' | 'env';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Glucose Logged',
    message: 'Fasting glucose level recorded at 92 mg/dL (Normal Range).',
    time: '10m ago',
    type: 'glucose',
    read: false,
  },
  {
    id: '2',
    title: 'Meal Hydration & Macro Reminder',
    message: 'Remember to log your lunch to reach your protein target of 120g.',
    time: '1h ago',
    type: 'nutrition',
    read: false,
  },
  {
    id: '3',
    title: 'Regional Market Updated',
    message: 'Fresh blueberries and oats availability updated for your region.',
    time: '3h ago',
    type: 'env',
    read: false,
  },
  {
    id: '4',
    title: 'Sleep Sync Complete',
    message: 'Optimal recovery score of 88% detected after 8.0 hrs of sleep.',
    time: '8h ago',
    type: 'sleep',
    read: true,
  },
];

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Biometrics', href: '/dashboard/biometrics', icon: Activity },
  { name: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
  { name: 'Fitness', href: '/dashboard/fitness', icon: Dumbbell },
  { name: 'Sleep', href: '/dashboard/sleep', icon: Moon },
  { name: 'Environment', href: '/dashboard/environment', icon: Globe },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handlePush = (e: any) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('push_notification', handlePush);
    return () => window.removeEventListener('push_notification', handlePush);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
    retry: false,
  });

  useEffect(() => {
    if (meData && typeof meData === 'object' && !('error' in meData)) {
      updateUser(meData);
    }
  }, [meData, updateUser]);

  const currentUser = user || meData;

  const getPageTitle = () => {
    const current = navigation.find(item => item.href === pathname);
    return current ? current.name : 'Dashboard';
  };

  const NavLinks = () => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}

          >
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              {item.name}
            </motion.div>
          </Link>
        )
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center cursor-pointer"
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-bold text-lg tracking-tight">Dietology</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-emerald-500/30">
              <AvatarFallback className="bg-emerald-950 text-emerald-400 font-bold">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.email || ''}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-rose-400 hover:bg-accent border border-sidebar-border transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 text-foreground">
          <div className="flex items-center gap-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden cursor-pointer" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border text-sidebar-foreground">
                <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
                  <span className="font-bold text-lg tracking-tight">Dietology</span>
                </div>
                <div className="p-3">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-semibold hidden sm:block">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex text-sm text-muted-foreground mr-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" />}>
                <Plus className="h-4 w-4 mr-1" /> Log Item
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border-border">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Quick Log</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/nutrition?log=true')} className="cursor-pointer hover:bg-accent focus:bg-accent">
                    <Apple className="h-4 w-4 mr-2 text-emerald-400" /> Meal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/fitness?log=true')} className="cursor-pointer hover:bg-accent focus:bg-accent">
                    <Dumbbell className="h-4 w-4 mr-2 text-teal-400" /> Workout
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/biometrics?log=true')} className="cursor-pointer hover:bg-accent focus:bg-accent">
                    <Activity className="h-4 w-4 mr-2 text-rose-400" /> Biometrics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/sleep?log=true')} className="cursor-pointer hover:bg-accent focus:bg-accent">
                    <Moon className="h-4 w-4 mr-2 text-indigo-400" /> Sleep
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative cursor-pointer" />}>
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-popover text-popover-foreground border-border p-0 shadow-2xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Read all
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-muted-foreground hover:text-rose-400 p-1 cursor-pointer"
                        title="Clear all notifications"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                          n.read ? 'opacity-70 hover:bg-accent/50' : 'bg-accent/30 hover:bg-accent/70'
                        }`}
                      >
                        <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border flex-shrink-0">
                          {n.type === 'glucose' && <Activity className="h-4 w-4 text-rose-400" />}
                          {n.type === 'nutrition' && <Apple className="h-4 w-4 text-emerald-400" />}
                          {n.type === 'sleep' && <Moon className="h-4 w-4 text-indigo-400" />}
                          {n.type === 'env' && <Globe className="h-4 w-4 text-teal-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-foreground truncate">{n.title}</span>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full md:hidden cursor-pointer" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-emerald-950 text-emerald-400">{currentUser?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent focus:bg-accent" onClick={() => router.push('/dashboard/settings')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-rose-400 hover:bg-accent focus:bg-accent flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content with smooth route transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <PageTransition key={pathname}>
                {children}
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
