export function getOrgId(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.org_id || null;
  } catch {
    return null;
  }
}
