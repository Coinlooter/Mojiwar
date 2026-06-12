export const LOAD_ERROR_MESSAGE =
  "Die Daten konnten gerade nicht geladen werden. Versuche es in einem Moment erneut.";

export const GENERIC_ERROR_MESSAGE =
  "Etwas ist schiefgelaufen. Versuche es erneut.";

export type LoadResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export function loadOk<T>(data: T): LoadResult<T> {
  return { ok: true, data };
}

export function loadError<T>(message = LOAD_ERROR_MESSAGE): LoadResult<T> {
  return { ok: false, message };
}
