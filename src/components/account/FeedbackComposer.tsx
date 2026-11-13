"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/shared";
import { addFeedback } from "@/lib/account/store";
import type { AccountData } from "@/lib/account/use-account";
import { todayISO } from "@/lib/account/rules";
import type { Rating } from "@/types/account";
import { Modal, StarInput, SuccessDialog, TextArea } from "./ui";

const MAX = 500;

function FeedbackForm({ account, onCancel, onSubmitted }: { account: AccountData; onCancel: () => void; onSubmitted: () => void }) {
  const [rating, setRating] = useState<Rating | 0>(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!rating) next.rating = "Choose a star rating.";
    if (comment.trim().length < 10) next.comment = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (next.rating || next.comment || !rating) return;
    setSaving(true);
    // Short pause so the button shows it is working; nothing is sent anywhere.
    window.setTimeout(() => {
      addFeedback(account.customerId, { date: todayISO(), rating, comment, branchId: account.branchId });
      setSaving(false);
      onSubmitted();
    }, 400);
  };

  return (
    <form id="feedback-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
      <StarInput value={rating} onChange={(r) => { setRating(r); setErrors((x) => ({ ...x, rating: undefined })); }} error={errors.rating} />
      <TextArea
        label="Your comments"
        value={comment}
        onChange={(v) => { setComment(v); if (errors.comment) setErrors((x) => ({ ...x, comment: undefined })); }}
        error={errors.comment}
        maxLength={MAX}
        rows={5}
        placeholder="What went well, and what could we do better?"
        hint="Please don't include medical details you would not want staff to read."
      />
      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" icon="check" loading={saving}>Submit Feedback</Button>
      </div>
    </form>
  );
}

/** The Share Your Feedback dialog, then the thank-you confirmation. */
export function FeedbackComposer({ account, open, onClose, showViewLink }: { account: AccountData; open: boolean; onClose: () => void; showViewLink?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <Modal
        open={open && !done}
        onClose={onClose}
        title="Share Your Feedback"
        description="Tell us about your experience with Medizone Pharmacy."
        icon="star"
        tone="warning"
      >
        <FeedbackForm account={account} onCancel={onClose} onSubmitted={() => setDone(true)} />
      </Modal>
      <SuccessDialog
        open={done}
        title={`Thank you, ${account.firstName}!`}
        onClose={() => {
          setDone(false);
          onClose();
        }}
        action={showViewLink ? <ButtonLink href="/account/feedback" block onClick={() => { setDone(false); onClose(); }}>View my feedback</ButtonLink> : undefined}
      >
        Your feedback has been saved. It helps our pharmacists improve the service at every branch.
      </SuccessDialog>
    </>
  );
}
