type StepIndicatorProps = {
  currentStep: number;
  labels: string[];
};

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  return (
    <div className="card soft-grid">
      <ol className="grid gap-4 md:grid-cols-3">
        {labels.map((label, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const completed = step < currentStep;

          return (
            <li
              key={label}
              className={`rounded-xl border p-4 transition ${
                active
                  ? "border-teal-500 bg-teal-50"
                  : completed
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step {step}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
