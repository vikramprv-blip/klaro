"use client";

import { useEffect, useMemo, useState } from "react";

type ComplianceTask = {
  id: string;
  client_id: string;
  client_name: string;
  task_type: string;
  title: string;
  description: string | null;
  period: string;
  due_date: string;
  status: string;
  priority: string;
  last_followed_up_at: string | null;
};

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function dueLabel(date: string) {
  const days = daysUntil(date);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
}

export default function CACompliancePage() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [followupMessage, setFollowupMessage] = useState("");

  async function loadTasks() {
    const res = await fetch("/api/ca/compliance/tasks", { cache: "no-store" });
    const data = await res.json();
    setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks().catch(() => setLoading(false));
  }, []);

  async function generateTasks() {
    setGenerating(true);
    await fetch("/api/ca/compliance/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: new Date().getFullYear() }),
    });
    await loadTasks();
    setGenerating(false);
  }

  async function generateFollowup(task: ComplianceTask, openWhatsapp = false) {
    const res = await fetch("/api/ca/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complianceTaskId: task.id,
        clientId: task.client_id,
        clientName: task.client_name,
        taskType: task.task_type,
        period: task.period,
      }),
    });

    const data = await res.json();

    if (data?.message) {
      setFollowupMessage(data.message);
      await navigator.clipboard?.writeText(data.message);

      if (openWhatsapp) {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(data.message)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      await loadTasks();
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/ca/compliance/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  const visible = useMemo(() => {
    if (filter === "all") return tasks;
    if (filter === "overdue") {
      return tasks.filter((task) => task.status === "pending" && daysUntil(task.due_date) < 0);
    }
    if (filter === "next7") {
      return tasks.filter((task) => task.status === "pending" && daysUntil(task.due_date) >= 0 && daysUntil(task.due_date) <= 7);
    }
    return tasks.filter((task) => task.task_type === filter);
  }, [tasks, filter]);

  const overdue = tasks.filter((task) => task.status === "pending" && daysUntil(task.due_date) < 0).length;
  const next7 = tasks.filter((task) => task.status === "pending" && daysUntil(task.due_date) >= 0 && daysUntil(task.due_date) <= 7).length;
  const done = tasks.filter((task) => task.status === "done").length;

  if (loading) return <div className="p-8">Loading compliance tasks...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Recurring compliance</h1>
          <p className="text-sm text-gray-400 mt-0.5">GST, TDS and ITR tasks generated from client master</p>
        </div>

        <button
          onClick={generateTasks}
          disabled={generating}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate yearly tasks"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: tasks.length },
          { label: "Overdue", value: overdue },
          { label: "Due in 7d", value: next7 },
          { label: "Done", value: done },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-2xl font-medium text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          ["all", "All"],
          ["overdue", "Overdue"],
          ["next7", "Next 7 days"],
          ["gst", "GST"],
          ["tds", "TDS"],
          ["itr", "ITR"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`text-sm px-3 py-1.5 rounded-lg border ${
              filter === value ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {followupMessage ? (
        <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Follow-up copied</p>
              <p className="text-sm text-gray-700">{followupMessage}</p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(followupMessage)}
              className="text-xs border px-3 py-1.5 rounded-lg hover:bg-white"
            >
              Copy again
            </button>
          </div>
        </div>
      ) : null}

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Client", "Type", "Period", "Due date", "Status", "Last Follow-up", ""].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-12">
                  No compliance tasks found
                </td>
              </tr>
            ) : (
              visible.map((task) => {
                const days = daysUntil(task.due_date);
                return (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{task.client_name}</div>
                      <div className="text-xs text-gray-400">{task.title}</div>
                    </td>
                    <td className="px-4 py-3 uppercase text-xs font-medium text-gray-500">{task.task_type}</td>
                    <td className="px-4 py-3 text-gray-600">{task.period}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">
                        {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div className={`text-xs ${days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}>
                        {dueLabel(task.due_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {task.last_followed_up_at
                        ? new Date(task.last_followed_up_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => generateFollowup(task)}
                          className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => generateFollowup(task, true)}
                          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
