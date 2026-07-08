import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Badge } from "@/components/atoms/Badge";
import { useTestStore } from "@/store/testStore";
import { checkCountryAnswer } from "@/utils/testAnswer";
import type { TestAnswer } from "@/types/test";
import styles from "./TestQuizPanel.module.css";

interface TestQuizPanelProps {
  countryNames: Map<string, string>;
  elapsedMs: number;
}

export function TestQuizPanel({ countryNames, elapsedMs }: TestQuizPanelProps) {
  const selectedCountryId = useTestStore((s) => s.selectedCountryId);
  const submitAnswer = useTestStore((s) => s.submitAnswer);
  const selectCountry = useTestStore((s) => s.selectCountry);
  const getAnswerForCountry = useTestStore((s) => s.getAnswerForCountry);
  const isCountryAnswered = useTestStore((s) => s.isCountryAnswered);
  const answers = useTestStore((s) => s.answers);
  const countryPool = useTestStore((s) => s.countryPool);

  const [input, setInput] = useState("");

  const answered = selectedCountryId
    ? getAnswerForCountry(selectedCountryId)
    : undefined;
  const countryName = selectedCountryId
    ? countryNames.get(selectedCountryId) ?? selectedCountryId
    : null;

  useEffect(() => {
    setInput("");
  }, [selectedCountryId]);

  const handleSubmit = () => {
    if (
      !selectedCountryId ||
      !countryName ||
      isCountryAnswered(selectedCountryId)
    )
      return;
    const correct = checkCountryAnswer(input, selectedCountryId, countryNames);
    const answer: TestAnswer = {
      countryId: selectedCountryId,
      userAnswer: input.trim(),
      correctName: countryName,
      isCorrect: correct,
      answeredAtMs: elapsedMs,
    };
    submitAnswer(answer);
    setInput("");
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;

  if (!selectedCountryId || !countryName) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <h3 className={styles.emptyTitle}>Kliknij kraj</h3>
          <p className={styles.emptyText}>
            Zaznacz kraj na mapie i wpisz jego nazwę. Postęp zapisuje się
            automatycznie.
          </p>
          <div className={styles.progress}>
            <div className={styles.progressItem}>
              <span className={styles.progressLabel}>Odpowiedzi</span>
              <span className={styles.progressValue}>
                {answers.length} / {countryPool.length}
              </span>
            </div>
            <div className={styles.progressItem}>
              <span className={styles.progressLabel}>Poprawne</span>
              <span className={`${styles.progressValue} ${styles.correct}`}>
                {correctCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (answered) {
    return (
      <div className={styles.panel}>
        <div className={styles.result}>
          <Badge variant={answered.isCorrect ? "success" : "default"}>
            {answered.isCorrect ? "Poprawnie" : "Błędnie"}
          </Badge>
          <h3 className={styles.countryName}>{countryName}</h3>
          {!answered.isCorrect && (
            <p className={styles.wrongAnswer}>
              Twoja odpowiedź: <strong>{answered.userAnswer || "-"}</strong>
            </p>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => selectCountry(null)}
          >
            Wybierz inny kraj
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.prompt}>Jak nazywa się ten kraj?</h3>
        <button
          type="button"
          className={styles.close}
          onClick={() => selectCountry(null)}
          aria-label="Zamknij"
        >
          ✕
        </button>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Input
          label="Nazwa kraju"
          placeholder="np. Polska, Germany…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!input.trim()}
        >
          Zatwierdź odpowiedź
        </Button>
      </form>

      <div className={styles.progress}>
        <div className={styles.progressItem}>
          <span className={styles.progressLabel}>Odpowiedzi</span>
          <span className={styles.progressValue}>
            {answers.length} / {countryPool.length}
          </span>
        </div>
        <div className={styles.progressItem}>
          <span className={styles.progressLabel}>Poprawne</span>
          <span className={`${styles.progressValue} ${styles.correct}`}>
            {correctCount}
          </span>
        </div>
      </div>
    </div>
  );
}
