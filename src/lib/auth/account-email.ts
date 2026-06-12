const INTERNAL_RECOVERY_EMAIL_DOMAIN = "recovery.emojitsu.app";

export function isInternalRecoveryEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return email.endsWith(`@${INTERNAL_RECOVERY_EMAIL_DOMAIN}`);
}

export function getDisplayEmail(email: string | null | undefined) {
  if (!email || isInternalRecoveryEmail(email)) {
    return null;
  }

  return email;
}

export function usesLoginCodeAccount({
  isAnonymous,
  email,
}: {
  isAnonymous: boolean;
  email?: string | null;
}) {
  return isAnonymous || isInternalRecoveryEmail(email);
}

export function hasSecuredEmailAccount({
  isAnonymous,
  email,
}: {
  isAnonymous: boolean;
  email?: string | null;
}) {
  return !isAnonymous && !!getDisplayEmail(email);
}

export function canRecoverAccountProgress({
  hasRecoveryCode,
  isAnonymous,
  email,
}: {
  hasRecoveryCode: boolean;
  isAnonymous: boolean;
  email?: string | null;
}) {
  return hasRecoveryCode || hasSecuredEmailAccount({ isAnonymous, email });
}
