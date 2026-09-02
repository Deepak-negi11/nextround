"use client";

import { useActionState } from "react";
import { addSlot } from "@/actions/admin";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

export default function SlotForm({ roundId }: { roundId: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(addSlot, {});
  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
      <input type="hidden" name="roundId" value={roundId} />
      <div>
        <label className={labelCls} htmlFor="startAt">Start</label>
        <input id="startAt" name="startAt" type="datetime-local" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="durationMin">Duration (min)</label>
        <input id="durationMin" name="durationMin" type="number" defaultValue={60} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="venue">Venue (optional)</label>
        <input id="venue" name="venue" placeholder="C-204" className={inputCls} />
      </div>
      <SubmitButton>+ Add slot</SubmitButton>
      {state.error && <p className="w-full rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
    </form>
  );
}
