'use client';

import { cn } from '@/lib/site';
import {
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Plug,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Image: ImageIcon,
  Images,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Plug,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
};

export type AdminShellProps = {
  user: { name: string; email: string; role: string };
  groups: {
    label: string;
    icon: string;
    items: { label: string; href: string; icon: string }[];
  }[];
  children: React.ReactNode;
  signOutAction: () => Promise<void>;
};

export function AdminShell({ user, groups, children, signOutAction }: AdminShellProps) {
  const currentPath = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['Dashboard']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (paletteOpen) window.setTimeout(() => searchRef.current?.focus(), 60);
  }, [paletteOpen]);

  const toggleGroup = (label: string) => {
    setOpenGroups((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  const allItems = groups.flatMap((group) => group.items);
  const filtered = query.trim()
    ? allItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  const isActive = (href: string) =>
    href === currentPath ? true : currentPath.startsWith(`${href}/`);

  const sidebar = (
    <aside className="flex h-full w-[268px] shrink-0 flex-col border-r border-[#16233d] bg-[#080f1d]">
      <div className="flex items-center gap-3 border-b border-[#16233d] px-5 py-5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0054ae] text-sm font-bold text-white">
          C
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">CTS</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8494b0]">
            Consultoria Empresarial
          </p>
        </div>
      </div>

      <nav aria-label="Menu do painel" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          const GroupIcon = ICONS[group.icon] ?? LayoutDashboard;
          const expanded = openGroups.includes(group.label);
          const groupActive = group.items.some((item) => isActive(item.href));

          if (group.items.length === 1) {
            const item = group.items[0];
            const ItemIcon = ICONS[item.icon] ?? LayoutDashboard;
            return (
              <a
                key={group.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-[#0054ae] text-white'
                    : 'text-[#a8b6cf] hover:bg-[#111e35] hover:text-white',
                )}
              >
                <ItemIcon size={17} />
                {group.label}
              </a>
            );
          }

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={expanded}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  groupActive ? 'text-white' : 'text-[#a8b6cf] hover:bg-[#111e35] hover:text-white',
                )}
              >
                <GroupIcon size={17} />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', expanded && 'rotate-180')}
                />
              </button>
              {expanded && (
                <ul className="mt-0.5 space-y-0.5 pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = ICONS[item.icon] ?? FileText;
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors',
                            isActive(item.href)
                              ? 'bg-[#111e35] font-semibold text-white'
                              : 'text-[#8494b0] hover:bg-[#111e35] hover:text-white',
                          )}
                        >
                          <ItemIcon size={14} />
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#16233d] p-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#0d1729] px-3 py-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a63] text-xs font-bold text-white">
            {user.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-[#8494b0]">
              {user.role === 'SUPER_ADMIN' ? 'Superadministrador' : user.role}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Terminar sessão"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8494b0] transition-colors hover:bg-[#1e3a63] hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#070e1c] text-[#e8eef9]">
      <div className="hidden lg:flex">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative">{sidebar}</div>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#111e35] text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#16233d] bg-[#070e1c]/95 px-4 backdrop-blur lg:px-7">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1c2c49] text-[#a8b6cf] lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="relative max-w-md flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8494b0]"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onFocus={() => setPaletteOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setPaletteOpen(true);
              }}
              placeholder="Pesquisar no painel..."
              aria-label="Pesquisar no painel"
              className="h-10 w-full rounded-lg border border-[#1c2c49] bg-[#0d1729] pl-9 pr-14 text-sm text-white placeholder:text-[#6b7d99] focus:border-[#2e7be8] focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-[#1c2c49] px-1.5 py-0.5 text-[10px] text-[#8494b0] sm:block">
              Ctrl + K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Notificações"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1c2c49] text-[#a8b6cf] transition-colors hover:text-white"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e41620]" />
            </button>
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a63] text-xs font-bold text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-white">{user.name}</p>
                <p className="text-[11px] text-[#8494b0]">
                  {user.role === 'SUPER_ADMIN' ? 'Superadministrador' : user.role}
                </p>
              </div>
              <ChevronDown size={14} className="text-[#8494b0]" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-7 lg:py-7">{children}</main>
      </div>

      {paletteOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 px-4 pt-[12vh]">
          <button
            type="button"
            aria-label="Fechar pesquisa"
            onClick={() => setPaletteOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#1c2c49] bg-[#0d1729] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#1c2c49] px-4">
              <Search size={17} className="text-[#8494b0]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar páginas, serviços, cursos..."
                aria-label="Pesquisar"
                className="h-12 flex-1 bg-transparent text-sm text-white placeholder:text-[#6b7d99] focus:outline-none"
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-[#8494b0]">
                  Nenhum resultado para “{query}”
                </li>
              )}
              {filtered.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setPaletteOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#a8b6cf] transition-colors hover:bg-[#111e35] hover:text-white"
                  >
                    {(() => {
                      const Icon = ICONS[item.icon] ?? FileText;
                      return <Icon size={15} />;
                    })()}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
