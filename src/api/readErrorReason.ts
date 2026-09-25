export async function readErrorReason(response: Response): Promise<string | undefined> {
  const text = await response.text().catch(() => '');
  if (!text) return undefined;
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      const { reason, message, description } = parsed as Record<string, unknown>;
      const value = reason ?? message ?? description;
      if (typeof value === 'string') return value;
    }
  } catch {
    return text;
  }
  return text;
}
