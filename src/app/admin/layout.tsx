// Notion flow: Admin: Log in and Dashboard
// TODO: implement

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
