// A template is re-created on every navigation (a layout is not), so each page in this
// section gently fades in when you move between pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
