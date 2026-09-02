"use client";

import { useActionState } from "react";
import { issueOffer } from "@/actions/admin";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export default function OfferButton({
  applicationId,
  status,
  hasOffer,
}: {
  applicationId: number;
  status: string;
  hasOffer: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(issueOffer, {});
  if (hasOffer) return <span className="text-xs text-slate-400">Offer issued</span>;
  if (status !== "SELECTED") return null;
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="applicationId" value={applicationId} />
      <SubmitButton className="!px-3 !py-1.5 !text-xs">Issue offer</SubmitButton>
      {state.error && <span className="ml-2 text-xs text-rose-600">{state.error}</span>}
    </form>
  );
}
