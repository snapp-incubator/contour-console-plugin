/** Normalize thrown values for display (SDK/K8s errors are not always Error instances). */
export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
