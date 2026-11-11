import { BackButton, Button } from './Controls';
import styles from './ResponsiveActionFooter.module.css';

export function ResponsiveActionFooter({
  backLabel,
  onBack,
  onContinue,
  continueDisabled = false,
  testId,
}: {
  backLabel: string;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  testId: string;
}) {
  return <div className={styles.footer} data-testid={testId}>
    <BackButton label={backLabel} onClick={onBack} />
    <Button onClick={onContinue} disabled={continueDisabled}>Continue</Button>
  </div>;
}
