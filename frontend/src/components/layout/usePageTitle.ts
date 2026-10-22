import { useMatches, type Params } from 'react-router-dom'

export interface RouteHandle {
  title: string | ((params: Params) => string)
}

/** Title of the deepest matched route that declares `handle.title`. */
export function usePageTitle(): string {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined
    if (handle?.title) return typeof handle.title === 'function' ? handle.title(matches[i].params) : handle.title
  }
  return 'Drishti'
}
