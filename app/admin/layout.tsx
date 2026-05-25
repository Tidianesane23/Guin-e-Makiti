'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/src/hooks/useAuth';
import AdminSidebar from '@/src/components/admin/AdminSidebar';
import AdminHeader from '@/src/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname           = usePathname();
  const router             = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (loading) return;
    if (!user && !isLoginPage) router.replace('/admin/login');
    if (user  &&  isLoginPage) router.replace('/admin/dashboard');
  }, [user, loading, isLoginPage, router]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rouge border-t-transparent" />
      </div>
    );
  }

  // Login page — no sidebar
  if (isLoginPage) return <>{children}</>;

  // Protected pages — no user yet (redirect in flight)
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0">
        <div className="fixed top-0 left-0 h-full w-60">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <AdminSidebar onClose={() => setDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
