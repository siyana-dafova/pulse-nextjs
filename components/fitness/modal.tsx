"use client";

import { useEffect, useRef } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  // The click that opens the dialog would otherwise hit the backdrop and close it immediately.
  const ready = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      ready.current = true;
    }, 0);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/10"
        aria-label="Close"
        onClick={() => {
          if (ready.current) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-md"
      >
        <div className="flex flex-col gap-2 pr-8">
          <h2 id="modal-title" className="font-heading text-base leading-none font-medium">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <XIcon />
        </Button>
        {children}
      </div>
    </div>
  );
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
      {children}
    </div>
  );
}
