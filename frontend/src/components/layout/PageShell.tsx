import type { ReactNode } from 'react'

export function PageShell({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl p-6">
      <h1 className="text-xl font-medium tracking-tight">{title}</h1>
      <div className="mt-6">{children}</div>
    </section>
  )
}
