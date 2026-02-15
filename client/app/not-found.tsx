import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link className="underline underline-offset-4 text-primary" href="/">
        Go Home
      </Link>
    </main>
  )
}
