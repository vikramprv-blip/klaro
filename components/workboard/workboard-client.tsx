"use client"

import { useState } from "react"

export default function WorkboardClient({ initialItems }: any) {
  const [items] = useState(initialItems)

  return (
    <div className="p-6 space-y-4">
      {items.map((item: any) => (
        <div key={item.id} className="p-4 border rounded-xl">
          <div className="font-semibold">{item.title}</div>
          <div className="text-sm text-gray-500">
            {item.client?.name} • {item.status} • {item.priority}
          </div>
        </div>
      ))}
    </div>
  )
}
