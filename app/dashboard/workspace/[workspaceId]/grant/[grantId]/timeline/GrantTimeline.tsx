"use client";

import { useEffect, useState } from "react";

export default function GrantTimeline({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [saving, setSaving] = useState(false);

  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grants/timeline?grantId=${grantId}`);
      const json = await res.json();
      if (json.timeline?.milestones) {
        setMilestones(json.timeline.milestones);
      }
      setTimeline(json.timeline);
      setLoading(false);
    }
    load();
  }, [grantId]);

  function updateMilestone(index: number, field: string, value: any) {
    setMilestones((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    );
  }

  function updateTask(mIndex: number, tIndex: number, value: string) {
    setMilestones((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? {
              ...m,
              tasks: m.tasks.map((t: string, ti: number) =>
                ti === tIndex ? value : t
              )
            }
          : m
      )
    );
  }

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        dueDate: "",
        tasks: []
      }
    ]);
  }

  function addTask(mIndex: number) {
    setMilestones((prev) =>
      prev.map((m, i) =>
        i === mIndex
          ? { ...m, tasks: [...m.tasks, ""] }
          : m
      )
    );
  }

  async function save() {
    setSaving(true);

    const res = await fetch("/api/grants/timeline", {
      method: "POST",
      body: JSON.stringify({
        grantId,
        milestones,
        useAI
      }),
    });

    const json = await res.json();
    if (json.timeline?.milestones) {
      setMilestones(json.timeline.milestones);
    }

    setSaving(false);
  }

  if (loading) {
    return <p>Loading timeline...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Milestones</h2>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={useAI}
            onChange={() => setUseAI(!useAI)}
          />
          <span>Use AI to generate timeline</span>
        </label>
      </div>

      <div className="space-y-6">
        {milestones.map((m, i) => (
          <div key={i} className="p-4 border rounded-md bg-gray-50 space-y-4">
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Milestone Title"
              value={m.title}
              onChange={(e) =>
                updateMilestone(i, "title", e.target.value)
              }
            />

            <textarea
              className="w-full p-2 border rounded-md"
              placeholder="Description"
              value={m.description}
              onChange={(e) =>
                updateMilestone(i, "description", e.target.value)
              }
            />

            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={m.dueDate}
              onChange={(e) =>
                updateMilestone(i, "dueDate", e.target.value)
              }
            />

            <div className="space-y-2">
              <h3 className="font-semibold">Tasks</h3>

              {m.tasks.map((t: string, ti: number) => (
                <input
                  key={ti}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Task"
                  value={t}
                  onChange={(e) =>
                    updateTask(i, ti, e.target.value)
                  }
                />
              ))}

              <button
                onClick={() => addTask(i)}
                className="px-3 py-1 bg-gray-300 rounded-md text-sm"
              >
                + Add Task
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addMilestone}
        className="px-4 py-2 bg-gray-200 rounded-md text-sm"
      >
        + Add Milestone
      </button>

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {saving ? "Saving..." : "Save Timeline"}
      </button>
    </div>
  );
}
