"use client";

import { useActionState, useState } from "react";
import { createRound } from "@/actions/admin";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

const TYPES = ["Aptitude Test", "Online Coding Test", "Group Discussion", "Technical Interview", "HR Interview"];

export default function RoundForm({ driveId }: { driveId: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createRound, {});
  const [type, setType] = useState(TYPES[0]);
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [defaultStart] = useState(() => {
    const d = new Date(Date.now() + 7 * 864e5);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  return (
    <form action={formAction} className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <input type="hidden" name="driveId" value={driveId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="roundType">Round type</label>
          <select id="roundType" name="roundType" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
            <option value="custom">Custom…</option>
          </select>
          {type === "custom" && (
            <input name="customType" required placeholder="e.g. Case Study" className={`${inputCls} mt-2`} />
          )}
        </div>
        <div>
          <label className={labelCls} htmlFor="mode">Mode</label>
          <select id="mode" name="mode" value={mode} onChange={(e) => setMode(e.target.value as "ONLINE" | "OFFLINE")} className={inputCls}>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="startAt">Start</label>
          <input id="startAt" name="startAt" type="datetime-local" defaultValue={defaultStart} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="endAt">End</label>
          <input id="endAt" name="endAt" type="datetime-local" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="resultDate">Result publication date</label>
          <input id="resultDate" name="resultDate" type="date" className={inputCls} />
        </div>
      </div>

      {mode === "ONLINE" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="meetingLink">Assessment / meeting link</label>
            <input id="meetingLink" name="meetingLink" placeholder="https://meet.google.com/…" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="instructions">Instructions</label>
            <input id="instructions" name="instructions" placeholder="Webcam on, 60 minutes…" className={inputCls} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className={labelCls} htmlFor="venue">Venue</label>
            <input id="venue" name="venue" placeholder="Placement Cell" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="building">Building</label>
            <input id="building" name="building" placeholder="Block C" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="roomNumber">Room no</label>
            <input id="roomNumber" name="roomNumber" placeholder="C-204" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="reportingTime">Reporting time</label>
            <input id="reportingTime" name="reportingTime" placeholder="09:30 AM" className={inputCls} />
          </div>
        </div>
      )}

      {state.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>}
      <SubmitButton>+ Add round</SubmitButton>
    </form>
  );
}
