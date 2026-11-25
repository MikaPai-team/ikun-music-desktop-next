export const desktopLyricColorInterval = {
  min: 500,
  max: 30_000,
  step: 100,
  default: 1500,
}

export const normalizeDesktopLyricColorInterval = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return desktopLyricColorInterval.default
  }

  const steppedValue =
    Math.round(value / desktopLyricColorInterval.step) * desktopLyricColorInterval.step
  return Math.min(
    desktopLyricColorInterval.max,
    Math.max(desktopLyricColorInterval.min, steppedValue)
  )
}
