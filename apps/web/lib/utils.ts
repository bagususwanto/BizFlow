export function buildSearchParams(
  params: Record<string, any>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}
