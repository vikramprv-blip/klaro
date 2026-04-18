"use client"

import { useEffect } from "react"

export function useKeyboardNavigation({
  items,
  onOpen,
}: {
  items: { id: string }[]
  onOpen: (id: string) => void
}) {
  useEffect(() => {
    let index = 0

    function handler(e: KeyboardEvent) {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return

      if (e.key === "j") {
        index = Math.min(index + 1, items.length - 1)
        highlight()
      }

      if (e.key === "k") {
        index = Math.max(index - 1, 0)
        highlight()
      }

      if (e.key === "Enter" && items[index]) {
        onOpen(items[index].id)
      }
    }

    function highlight() {
      const els = document.querySelectorAll("[data-work-item]")
      els.forEach((el) => el.classList.remove("ring-2", "ring-blue-500"))

      const el = els[index] as HTMLElement
      if (el) {
        el.classList.add("ring-2", "ring-blue-500")
        el.scrollIntoView({ block: "center", behavior: "smooth" })
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [items, onOpen])
}
