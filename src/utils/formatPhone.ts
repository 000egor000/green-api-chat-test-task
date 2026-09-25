const RU_PHONE = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/;

export function formatPhone(digits: string): string {
  const [, code, first, second, third] = digits.match(RU_PHONE) ?? [];
  return code ? `+7 ${code} ${first}-${second}-${third}` : `+${digits}`;
}
