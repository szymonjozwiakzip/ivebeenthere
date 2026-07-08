import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { useTestStore } from "@/store/testStore";
import { getScopeLabel } from "@/utils/testScope";
import { getTestModeLabel, usesQuestionQueue } from "@/utils/testModes";
import styles from "./TestSummary.module.css";

interface TestSummaryProps {
  onNewTest: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TestSummary({ onNewTest }: TestSummaryProps) {
  const config = useTestStore((s) => s.config);
  const answers = useTestStore((s) => s.answers);
  const questionQueue = useTestStore((s) => s.questionQueue);
  const countryPool = useTestStore((s) => s.countryPool);
  const startedAt = useTestStore((s) => s.startedAt);
  const endedAt = useTestStore((s) => s.endedAt);

  if (!config) return null;

  const totalQuestions = usesQuestionQueue(config.mode)
    ? questionQueue.length
    : countryPool.length;

  const correct = answers.filter((a) => a.isCorrect);
  const incorrect = answers.filter((a) => !a.isCorrect);
  const durationMs = startedAt && endedAt ? endedAt - startedAt : 0;
  const accuracy =
    answers.length > 0
      ? Math.round((correct.length / answers.length) * 100)
      : 0;
  const coverage =
    totalQuestions > 0
      ? Math.round((answers.length / totalQuestions) * 100)
      : 0;

  const modeLabel = getTestModeLabel(config.mode);

  return (
    <div className={styles.summary}>
      <h2 className={styles.heading}>Podsumowanie testu</h2>

      <div className={styles.scoreCard}>
        <div className={styles.bigScore}>
          {correct.length}
          <span className={styles.scoreDivider}>/</span>
          {answers.length}
        </div>
        <p className={styles.scoreLabel}>poprawnych odpowiedzi</p>
        <div className={styles.badges}>
          <Badge variant="accent">{`${accuracy}% trafność`}</Badge>
          <Badge variant="default">{`${coverage}% ukończone`}</Badge>
        </div>
      </div>

      <dl className={styles.meta}>
        <div>
          <dt>Tryb</dt>
          <dd>{modeLabel}</dd>
        </div>
        <div>
          <dt>Zakres</dt>
          <dd>{getScopeLabel(config.scope)}</dd>
        </div>
        <div>
          <dt>Czas</dt>
          <dd>{formatDuration(durationMs)}</dd>
        </div>
        <div>
          <dt>Odpowiedzi</dt>
          <dd>
            {answers.length} z {totalQuestions}
          </dd>
        </div>
        <div>
          <dt>Błędy</dt>
          <dd>{incorrect.length}</dd>
        </div>
      </dl>

      {incorrect.length > 0 && (
        <div className={styles.mistakes}>
          <h3 className={styles.mistakesTitle}>Błędne odpowiedzi</h3>
          <ul className={styles.mistakesList}>
            {incorrect.map((a) => (
              <li key={a.countryId}>
                <strong>{a.correctName}</strong>
                <span>- napisałeś: „{a.userAnswer || "-"}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="primary" fullWidth onClick={onNewTest}>
        Nowy test
      </Button>
    </div>
  );
}
