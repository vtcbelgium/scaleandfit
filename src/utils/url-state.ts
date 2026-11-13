// src/utils/url-state.ts
export type StudioStateValue = string | number | boolean;
export type StudioStateMap = Record<string, StudioStateValue>;

export function encodeStudioState(state: StudioStateMap): string {
  const sortedKeys = Object.keys(state).sort();
  const params = new URLSearchParams();
  for (const key of sortedKeys) {
    const value = state[key];
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  }
  return params.toString();
}

export function decodeStudioState(search: string, hash = ""): Record<string, string> {
  const searchParams = new URLSearchParams(search.replace(/^\?/, ''));
  const hashParams = new URLSearchParams(hash.replace(/^[#?]/, ''));
  const result: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    result[key] = value;
  }
  for (const [key, value] of hashParams.entries()) {
    result[key] = value;
  }
  return result;
}

export function buildShareUrl(originAndPath: string, state: StudioStateMap): string {
  const encodedState = encodeStudioState(state);
  if (encodedState) {
    const url = new URL(originAndPath);
    url.search = encodedState;
    return url.toString();
  }
  return originAndPath;
}
