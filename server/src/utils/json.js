export function safeJsonParse(value, fallback = null) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return fallback;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export function parseJsonInput(value) {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return value;
}

export function toJsonString(value) {
  const parsed = parseJsonInput(value);
  if (parsed === null || parsed === undefined) {
    return null;
  }

  return JSON.stringify(parsed);
}
