"use client"

import * as React from "react"
import useSWR, { mutate } from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Todo } from "./types"
import { listTodos, updateTodo, deleteTodo } from "./service"
import { Checkbox } from "@/components/ui/checkbox"
import { TodoSkeleton } from "./todo-skeleton"

const fetcher = async () => listTodos()

export function TodoList() {
  const { data, error, isLoading } = useSWR<Todo[]>("/todos", fetcher)
  const [query, setQuery] = React.useState("")
  const { toast } = useToast()

  const filtered = (data || []).filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
  const all = filtered
  const pending = filtered.filter((t) => !t.completed)
  const completed = filtered.filter((t) => t.completed)

  async function rename(todo: Todo, newTitle: string) {
    const trimmed = newTitle.trim()
    if (!trimmed || trimmed === todo.title) return
    if (trimmed.split(/\s+/).length > 50) {
      toast({ title: "Title too long", description: "Max 50 words allowed", variant: "destructive" as any })
      return
    }
    const next = { ...todo, title: trimmed }
    mutate("/todos", (curr: any) => (curr || []).map((t: Todo) => (t.id === todo.id ? next : t)), false)
    try {
      await updateTodo(next)
      toast({ title: "Todo updated" })
    } catch {
      mutate("/todos") // rollback
      toast({ title: "Failed to update", variant: "destructive" as any })
    }
  }

  async function toggle(todo: Todo) {
    const next = { ...todo, completed: !todo.completed }
    mutate("/todos", (curr: any) => (curr || []).map((t: Todo) => (t.id === todo.id ? next : t)), false)
    try {
      await updateTodo(next)
      toast({ title: next.completed ? "Marked complete" : "Marked pending" })
    } catch {
      mutate("/todos") // rollback to revalidate
      toast({ title: "Failed to update", variant: "destructive" as any })
    }
  }

  async function remove(todo: Todo) {
    const prev = (data || []).slice()
    mutate("/todos", (curr: any) => (curr || []).filter((t: Todo) => t.id !== todo.id), false)
    const undoId = setTimeout(async () => {
      try {
        await deleteTodo(todo.id)
        toast({ title: "Todo deleted" })
      } catch {
        mutate("/todos", prev, false)
        toast({ title: "Failed to delete", variant: "destructive" as any })
      } finally {
        mutate("/todos")
      }
    }, 5000)

    toast({
      title: "Todo removed",
      description: "Undo within 5s",
      action: (
        <button
          className="text-primary underline"
          onClick={() => {
            clearTimeout(undoId as any)
            mutate("/todos", prev, false)
          }}
        >
          Undo
        </button>
      ) as any,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
          aria-label="Search todos"
        />
      </div>

      {error && <p className="text-sm text-destructive">Failed to load todos</p>}
      {isLoading ? (
        <TodoSkeleton />
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TodoSection items={all} onToggle={toggle} onDelete={remove} onRename={rename} />
          </TabsContent>
          <TabsContent value="pending">
            <TodoSection items={pending} onToggle={toggle} onDelete={remove} onRename={rename} />
          </TabsContent>
          <TabsContent value="completed">
            <TodoSection items={completed} onToggle={toggle} onDelete={remove} onRename={rename} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function TodoSection({
  items,
  onToggle,
  onDelete,
  onRename,
}: {
  items: { id: string; title: string; completed: boolean }[]
  onToggle: (t: any) => void
  onDelete: (t: any) => void
  onRename: (t: any, newTitle: string) => void
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [value, setValue] = React.useState<string>("")

  return (
    <motion.ul
      className="space-y-2"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((t) => {
          const isEditing = editingId === t.id
          return (
            <motion.li
              layout
              key={t.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--card-foreground), 0.02)" }}
              className="group flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm transition-colors"
            >
              <Checkbox
                checked={t.completed}
                onCheckedChange={() => onToggle(t as any)}
                aria-label={t.completed ? "Mark pending" : "Mark complete"}
                className="transition-transform active:scale-95 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              {!isEditing ? (
                <span className={`transition-all duration-300 ${t.completed ? "text-muted-foreground line-through decoration-muted-foreground/50" : ""}`}>
                  {t.title}
                </span>
              ) : (
                <form
                  className="flex items-center gap-2 flex-1"
                  onSubmit={(e) => {
                    e.preventDefault()
                    onRename(t as any, value)
                    setEditingId(null)
                  }}
                >
                  <Input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setEditingId(null)
                      }
                      if (e.key === "Enter") {
                        // handled by form submit
                      }
                    }}
                    aria-label="Edit todo title"
                    className="h-8"
                  />
                  <Button type="submit" size="icon" variant="ghost" aria-label="Save" className="h-8 w-8">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Cancel"
                    onClick={() => setEditingId(null)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              )}

              <div className="ml-auto flex items-center gap-1 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => {
                      setEditingId(t.id)
                      setValue(t.title)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(t as any)}
                  aria-label="Delete"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </motion.ul>
  )
}
