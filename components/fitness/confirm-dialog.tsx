"use client";

import { Modal, ModalFooter } from "@/components/fitness/modal";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) return null;

  return (
    <Modal title={title} description={description} onClose={() => onOpenChange(false)}>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}
