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

      {error && <p className="text-sm text-destructive">Failed to load todos</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
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
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((t) => {
          const isEditing = editingId === t.id
          return (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="group flex items-center gap-3 rounded-md border bg-card p-3"
            >
              <Checkbox
                checked={t.completed}
                onCheckedChange={() => onToggle(t as any)}
                aria-label={t.completed ? "Mark pending" : "Mark complete"}
              />
              {!isEditing ? (
                <span className={t.completed ? "text-muted-foreground line-through" : ""}>{t.title}</span>
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
                  />
                  <Button type="submit" size="icon" variant="ghost" aria-label="Save">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Cancel"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              )}

              <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditingId(t.id)
                      setValue(t.title)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onDelete(t as any)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
