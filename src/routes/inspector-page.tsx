import { useState } from 'react';
import { Menu, FileText } from 'lucide-react';
import { InspectorSidebar } from '@/components/layout/inspector-sidebar';
import { WasteReportingForm } from '@/features/waste/components/waste-reporting-form';

export const InspectorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/80">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <InspectorSidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-white/70 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: '1200px' }}>
            <div className="mb-6 hidden md:flex md:items-center md:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 shadow-sm">
                <FileText className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
                  Inspector
                </p>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Waste Reporting
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Submit waste collection records for inspection
                </p>
              </div>
            </div>

            <div className="animate-slide-up">
              <WasteReportingForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
