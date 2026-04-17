"use client"

import { WORK_ITEM_VIEW_PRESETS } from "@/lib/work-item-view-presets"

type Props = {
  activeView: string
  onSelect: (viewId: string) => void
}

export function WorkItemViewPresets({ activeView, onSelect }: Props) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {WORK_ITEM_VIEW_PRESETS.map((view) => {
        const isActive = activeView === view.id

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelect(view.id)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              isActive ? "bg-slate-900 text-white" : ""
            }`}
          >
            {view.label}
          </button>
        )
      })}
    </div>
  )
}
