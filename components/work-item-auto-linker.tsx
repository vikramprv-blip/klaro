"use client"

import { useEffect, useMemo, useRef } from "react"
import { useParams } from "next/navigation"

export function WorkItemAutoLinker() {
  const params = useParams<{ id: string }>()
  const firedRef = useRef(false)

  const workItemId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  useEffect(() => {
    if (!workItemId || firedRef.current) return
    firedRef.current = true

    fetch(`/api/work-items/${workItemId}/auto-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {})
  }, [workItemId])

  return null
}
