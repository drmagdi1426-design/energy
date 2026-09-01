'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { fillTemplate } from '@/lib/i18n/format';
import { BEHAVIORAL_ITEM_CODES, type BehavioralItemCodeKey } from '@/lib/scoring';

type Step = 'consent' | 'sectionA' | 'sectionB' | 'optional' | 'submitting';

// Interleaved presentation order (one item per quadrant per "round") so the
// S1/S2, P1/P2, B1/B2, R1/R2 pairing is not visually obvious to the
// respondent, without needing per-session randomization.
const ITEM_ORDER: BehavioralItemCodeKey[] = ['S1', 'P1', 'B1', 'R1', 'S2', 'P2', 'B2', 'R2'];

type AuditState = Record<'survivalPct' | 'performancePct' | 'burnoutPct' | 'renewalPct', number>;
type AnswerState = Partial<Record<BehavioralItemCodeKey, number>>;

const AUDIT_FIELD_TO_QUADRANT = {
  survivalPct: 'SURVIVAL',
  performancePct: 'PERFORMANCE',
  burnoutPct: 'BURNOUT',
  renewalPct: 'RENEWAL',
} as const;

export function SurveyWizard({
  locale,
  dict,
  csrfToken,
  retentionMonths,
}: {
  locale: Locale;
  dict: Dictionary;
  csrfToken: string;
  retentionMonths: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('consent');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [audit, setAudit] = useState<AuditState>({
    survivalPct: 25,
    performancePct: 25,
    burnoutPct: 25,
    renewalPct: 25,
  });
  const [answers, setAnswers] = useState<AnswerState>({});
  const [team, setTeam] = useState('');
  const [department, setDepartment] = useState('');
  const [cycleLabel, setCycleLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = useMemo(
    () => audit.survivalPct + audit.performancePct + audit.burnoutPct + audit.renewalPct,
    [audit],
  );
  const totalValid = total === 100;
  const allAnswered = BEHAVIORAL_ITEM_CODES.every((code) => typeof answers[code] === 'number');

  async function handleSubmit() {
    setStep('submitting');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          csrfToken,
          consentAccepted: true,
          team: team.trim() || undefined,
          department: department.trim() || undefined,
          cycleLabel: cycleLabel.trim() || undefined,
          quadrantAudit: audit,
          behavioralAnswers: answers,
        }),
      });

      if (res.status === 429) {
        setErrorMessage(dict.errors.rateLimited);
        setStep('optional');
        return;
      }
      if (res.status === 400) {
        setErrorMessage(dict.errors.validation);
        setStep('optional');
        return;
      }
      if (!res.ok) {
        setErrorMessage(dict.errors.generic);
        setStep('optional');
        return;
      }

      router.push(`/${locale}/thank-you`);
    } catch {
      setErrorMessage(dict.errors.generic);
      setStep('optional');
    }
  }

  return (
    <div className="brand-card">
      <StepIndicator step={step} />

      {step === 'consent' && (
        <ConsentStep
          dict={dict}
          consentAccepted={consentAccepted}
          retentionMonths={retentionMonths}
          onChangeConsent={setConsentAccepted}
          onContinue={() => setStep('sectionA')}
        />
      )}

      {step === 'sectionA' && (
        <SectionAStep
          dict={dict}
          audit={audit}
          total={total}
          totalValid={totalValid}
          onChange={setAudit}
          onBack={() => setStep('consent')}
          onNext={() => setStep('sectionB')}
        />
      )}

      {step === 'sectionB' && (
        <SectionBStep
          dict={dict}
          answers={answers}
          allAnswered={allAnswered}
          onChange={(code, value) => setAnswers((prev) => ({ ...prev, [code]: value }))}
          onBack={() => setStep('sectionA')}
          onNext={() => setStep('optional')}
        />
      )}

      {(step === 'optional' || step === 'submitting') && (
        <OptionalStep
          dict={dict}
          team={team}
          department={department}
          cycleLabel={cycleLabel}
          onChangeTeam={setTeam}
          onChangeDepartment={setDepartment}
          onChangeCycle={setCycleLabel}
          onBack={() => setStep('sectionB')}
          onSubmit={handleSubmit}
          submitting={step === 'submitting'}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ['consent', 'sectionA', 'sectionB', 'optional'];
  const index = order.indexOf(step === 'submitting' ? 'optional' : step);
  return (
    <div className="mb-6 flex gap-2" aria-hidden="true">
      {order.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-academy-blue' : 'bg-page-gray'}`}
        />
      ))}
    </div>
  );
}

function ConsentStep({
  dict,
  consentAccepted,
  retentionMonths,
  onChangeConsent,
  onContinue,
}: {
  dict: Dictionary;
  consentAccepted: boolean;
  retentionMonths: number;
  onChangeConsent: (v: boolean) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-navy">{dict.consent.title}</h2>
      <p className="mt-2 text-sm text-gray-dark">{dict.consent.intro}</p>

      <section className="mt-4">
        <h3 className="field-label text-sm">{dict.consent.collectTitle}</h3>
        <ul className="mt-1 list-disc space-y-1 ps-5 text-sm text-gray-dark">
          {dict.consent.collectItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="field-label text-sm">{dict.consent.purposeTitle}</h3>
        <p className="mt-1 text-sm text-gray-dark">{dict.consent.purposeText}</p>
      </section>

      <section className="mt-4">
        <h3 className="field-label text-sm">{dict.consent.retentionTitle}</h3>
        <p className="mt-1 text-sm text-gray-dark">
          {fillTemplate(dict.consent.retentionText, { months: retentionMonths })}
        </p>
      </section>

      <section className="mt-4">
        <h3 className="field-label text-sm">{dict.consent.accessTitle}</h3>
        <p className="mt-1 text-sm text-gray-dark">{dict.consent.accessText}</p>
      </section>

      <div className="brand-card brand-card--mint mt-4">
        <h3 className="field-label text-sm">{dict.consent.anonymityTitle}</h3>
        <p className="mt-1 text-sm text-gray-dark">{dict.consent.anonymityText}</p>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-navy">
        <input
          type="checkbox"
          checked={consentAccepted}
          onChange={(e) => onChangeConsent(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>{dict.consent.checkboxLabel}</span>
      </label>
      {!consentAccepted && <p className="field-help mt-1">{dict.consent.requiredNote}</p>}

      <div className="mt-6">
        <button
          type="button"
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          disabled={!consentAccepted}
          onClick={onContinue}
        >
          {dict.consent.continueButton}
        </button>
      </div>
    </div>
  );
}

function SectionAStep({
  dict,
  audit,
  total,
  totalValid,
  onChange,
  onBack,
  onNext,
}: {
  dict: Dictionary;
  audit: AuditState;
  total: number;
  totalValid: boolean;
  onChange: (audit: AuditState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const fields = Object.keys(AUDIT_FIELD_TO_QUADRANT) as (keyof AuditState)[];

  return (
    <div>
      <h2 className="text-xl font-bold text-navy">{dict.sectionA.title}</h2>
      <p className="mt-2 text-sm text-gray-dark">{dict.sectionA.instructions}</p>

      <div className="mt-5 space-y-5">
        {fields.map((field) => {
          const quadrant = dict.sectionA.quadrant[AUDIT_FIELD_TO_QUADRANT[field]];
          return (
            <div key={field}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={field} className="field-label">
                  {quadrant.label}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id={field}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    step={1}
                    value={audit[field]}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      onChange({ ...audit, [field]: v });
                    }}
                    className="w-20 rounded-md border border-gray-mid/40 px-2 py-1 text-end"
                  />
                  <span className="text-gray-mid">%</span>
                </div>
              </div>
              <p className="field-help mt-1">{quadrant.descriptor}</p>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-5 flex items-center justify-between rounded-lg px-4 py-3 ${
          totalValid ? 'bg-mint' : 'bg-amber-tint'
        }`}
      >
        <span className="font-semibold text-navy">
          {dict.sectionA.totalLabel}: <span className="bidi-isolate">{total}%</span>
        </span>
        <span className="text-sm text-gray-mid">{dict.sectionA.totalHint}</span>
      </div>
      {!totalValid && <p className="field-error mt-2">{dict.sectionA.errorSum}</p>}

      <div className="mt-6 flex justify-between">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {dict.common.back}
        </button>
        <button type="button" className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={!totalValid} onClick={onNext}>
          {dict.common.next}
        </button>
      </div>
    </div>
  );
}

function SectionBStep({
  dict,
  answers,
  allAnswered,
  onChange,
  onBack,
  onNext,
}: {
  dict: Dictionary;
  answers: AnswerState;
  allAnswered: boolean;
  onChange: (code: BehavioralItemCodeKey, value: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-navy">{dict.sectionB.title}</h2>
      <p className="mt-2 text-sm text-gray-dark">{dict.sectionB.instructions}</p>

      <div className="mt-5 space-y-6">
        {ITEM_ORDER.map((code) => (
          <fieldset key={code}>
            <legend className="field-label text-sm">{dict.sectionB.items[code]}</legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {(['1', '2', '3', '4', '5'] as const).map((n) => {
                const value = Number(n);
                const checked = answers[code] === value;
                return (
                  <label
                    key={n}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border px-1 py-2 text-center text-xs transition-colors ${
                      checked
                        ? 'border-academy-blue bg-academy-blue/10 text-navy'
                        : 'border-gray-mid/30 text-gray-mid hover:border-academy-blue/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={code}
                      value={n}
                      checked={checked}
                      onChange={() => onChange(code, value)}
                      className="sr-only"
                    />
                    <span className="font-semibold">{n}</span>
                    <span>{dict.sectionB.scale[n]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {dict.common.back}
        </button>
        <button
          type="button"
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!allAnswered}
          onClick={onNext}
        >
          {dict.common.next}
        </button>
      </div>
    </div>
  );
}

function OptionalStep({
  dict,
  team,
  department,
  cycleLabel,
  onChangeTeam,
  onChangeDepartment,
  onChangeCycle,
  onBack,
  onSubmit,
  submitting,
  errorMessage,
}: {
  dict: Dictionary;
  team: string;
  department: string;
  cycleLabel: string;
  onChangeTeam: (v: string) => void;
  onChangeDepartment: (v: string) => void;
  onChangeCycle: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  errorMessage: string | null;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-navy">{dict.optionalFields.title}</h2>
      <p className="mt-2 text-sm text-gray-dark">{dict.optionalFields.helper}</p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="team" className="field-label text-sm">
            {dict.optionalFields.teamLabel}{' '}
            <span className="font-normal text-gray-mid">({dict.common.optional})</span>
          </label>
          <input
            id="team"
            type="text"
            maxLength={120}
            value={team}
            onChange={(e) => onChangeTeam(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="department" className="field-label text-sm">
            {dict.optionalFields.departmentLabel}{' '}
            <span className="font-normal text-gray-mid">({dict.common.optional})</span>
          </label>
          <input
            id="department"
            type="text"
            maxLength={120}
            value={department}
            onChange={(e) => onChangeDepartment(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="cycle" className="field-label text-sm">
            {dict.optionalFields.cycleLabel}{' '}
            <span className="font-normal text-gray-mid">({dict.common.optional})</span>
          </label>
          <input
            id="cycle"
            type="text"
            maxLength={120}
            value={cycleLabel}
            onChange={(e) => onChangeCycle(e.target.value)}
            placeholder="2026-Q1"
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-3 py-2"
          />
          <p className="field-help mt-1">{dict.optionalFields.cycleHelper}</p>
        </div>
      </div>

      {errorMessage && <p className="field-error mt-4" role="alert">{errorMessage}</p>}

      <div className="mt-6 flex justify-between">
        <button type="button" className="btn-secondary" onClick={onBack} disabled={submitting}>
          {dict.common.back}
        </button>
        <button
          type="button"
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? dict.common.submitting : dict.common.submit}
        </button>
      </div>
    </div>
  );
}
