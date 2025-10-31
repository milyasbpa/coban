import { Button } from '@/pwa/core/components/button';

interface SubmitButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
  canSubmit?: boolean;
}

export function SubmitButton({ onSubmit, disabled = false, canSubmit = false }: SubmitButtonProps) {
  return (
    <Button
      onClick={onSubmit}
      disabled={disabled || !canSubmit}
      className="w-full"
    >
      Submit Jawaban
    </Button>
  );
}