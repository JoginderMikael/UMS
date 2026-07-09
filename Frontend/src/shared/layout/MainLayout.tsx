import type { ReactNode } from 'react'

type MainLayoutProps = {
  children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return <div className="min-h-screen bg-slate-50 text-slate-800">{children}</div>
}

export default MainLayout