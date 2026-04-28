"use client"
import { useState, useRef, useEffect } from "react"

interface Option { value: string; label: string; sub?: string }
interface Props {
  options: Option[]
  value: string
  onChange: (value: string, option?: Option) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Search or select...", required, disabled, className }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sub || "").toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleOpen() {
    if (disabled) return
    setOpen(true)
    setSearch("")
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSelect(opt: Option) {
    onChange(opt.value, opt)
    setOpen(false)
    setSearch("")
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange("", undefined)
    setSearch("")
  }

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {/* Trigger */}
      <div
        onClick={handleOpen}
        className={`w-full border rounded-lg px-3 py-2 text-sm flex items-center justify-between cursor-pointer bg-white ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"} ${open ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200"}`}>
        {selected ? (
          <div className="flex-1 min-w-0">
            <span className="text-gray-900">{selected.label}</span>
            {selected.sub && <span className="text-gray-400 text-xs ml-2">{selected.sub}</span>}
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {value && !disabled && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
          )}
          <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="px-3 py-2 border-b">
            <input
              ref={inputRef}
              type="text"
              className="w-full text-sm outline-none placeholder-gray-400"
              placeholder="Type to search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Escape") { setOpen(false); setSearch("") }
                if (e.key === "Enter" && filtered.length === 1) handleSelect(filtered[0])
              }}
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No results found</div>
            ) : (
              filtered.map(opt => (
                <div key={opt.value} onClick={() => handleSelect(opt)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-blue-50 ${opt.value === value ? "bg-blue-50 text-blue-700" : "text-gray-900"}`}>
                  <p className="text-sm font-medium">{opt.label}</p>
                  {opt.sub && <p className="text-xs text-gray-400">{opt.sub}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && <input type="text" required value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />}
    </div>
  )
}
