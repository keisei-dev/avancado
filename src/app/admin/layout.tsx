// Notion flow: Admin: Log in and Dashboard

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
