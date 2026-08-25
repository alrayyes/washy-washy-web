/**
 * Mirrors the character limits `@washy-washy/core` 1.4.0 enforces at
 * runtime (`instructionsFromRows`/`parseMachine`), so a value typed here
 * is rejected by the form instead of surviving until Save. Not imported
 * from core itself — it documents these via JSDoc `@maxLength` and the
 * generated `schema/config.schema.json`, neither of which is an
 * importable JS value or an exported package.json subpath — so keep this
 * in sync by hand if core's limits change.
 */
export const CHART_FIELD_LIMITS = {
  clothingType: 60,
  detergent: 200,
  /** The stored value, including the leading "~" `DurationField` always adds back. */
  duration: 12,
  ironingNotes: 400,
  drying: 150,
  notes: 500,
} as const;

export const MACHINE_FIELD_LIMITS = {
  washerName: 60,
  washerCapacity: 20,
  program: 32,
  temperature: 12,
  spin: 10,
  option: 20,
  ironName: 60,
  settingLabel: 20,
  settingDetail: 60,
  settingDots: 5,
} as const;
