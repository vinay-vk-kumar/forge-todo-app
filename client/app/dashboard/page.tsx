"use client"

import * as React from "react"
import { GlassCard } from "@/components/surfaces/glass-card"
import { TodoList } from "@/components/todos/todo-list"
import { Button } from "@/components/ui/button"
import { useAuth, AuthProvider } from "@/components/auth/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createTodo } from "@/components/todos/service"
import { mutate } from "swr"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearAuth } from "@/lib/auth-storage"

function DashboardInner() {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingLogout, setLoadingLogout] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const email = localStorage.getItem("email")
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      await createTodo({ title })
      await mutate("/todos")
      toast({ title: "Todo added" })
      setTitle("")
      setOpen(false)
    } catch (e) {
      toast({ title: "Failed to add todo", variant: "destructive" as any })
    } finally {
      setCreating(false)
    }
  }

  React.useEffect(() => {
    function onOffline() {
      toast({ title: "You are offline", description: "Changes may be queued", variant: "destructive" as any })
    }
    window.addEventListener("offline", onOffline)
    return () => window.removeEventListener("offline", onOffline)
  }, [toast])

  async function handleLogout() {
    setLoadingLogout(true);
    clearAuth()
    router.push("/")
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {email !== undefined && <p className="text-sm text-muted-foreground">Signed in as {email}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          <Button variant="outline" disabled={loadingLogout} onClick={() => handleLogout()}>
            {loadingLogout ? <Loader2 className="h-4 w-4 animate-spin" /> : "Logout"}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              aria-label="New todo title"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <GlassCard className="p-6">
        <TodoList />
      </GlassCard>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <AuthGuard>
        <DashboardInner />
      </AuthGuard>
    </AuthProvider>
  )
}
