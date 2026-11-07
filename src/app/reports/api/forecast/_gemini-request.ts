const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

/** Give alternatives a chance when an individual model stalls. */
export async function requestGemini(
  models: string[],
  createRequest: (model: string, attemptSignal: AbortSignal) => Promise<Response>,
  signal: AbortSignal,
) {
  // Two primary attempts, followed by at most two configured alternatives.
  const attempts = [models[0], models[0], ...models.slice(1, 3)];
  const deadline = Date.now() + 90000;
  let response: Response | undefined;
  let usedModel = models[0];
  for (let index = 0; index < attempts.length; index++) {
    signal.throwIfAborted();
    usedModel = attempts[index];
    const attemptSignal = AbortSignal.any([
      signal,
      AbortSignal.timeout(Math.max(1, Math.min(30000, deadline - Date.now()))),
    ]);
    try {
      response = await createRequest(usedModel, attemptSignal);
    } catch (error) {
      // A global deadline or browser cancellation must stop all work.
      signal.throwIfAborted();
      if (!attemptSignal.aborted) throw error;
      // Skip retrying a stalled model; move directly to a different one.
      while (index + 1 < attempts.length && attempts[index + 1] === usedModel) index++;
      if (index + 1 < attempts.length) continue;
      throw error;
    }
    if (response.ok || (!TRANSIENT_STATUSES.has(response.status) && response.status !== 404)) break;
    if (response.status === 404) {
      // An unavailable model cannot recover by retrying the same name.
      while (index + 1 < attempts.length && attempts[index + 1] === usedModel) index++;
    }
    if (index + 1 >= attempts.length) break;

    const retryAfter = response.headers.get('retry-after');
    const seconds = retryAfter ? Number(retryAfter) : NaN;
    const serverDelay = retryAfter
      ? Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now()
      : 0;
    const backoff = 1000 * 2 ** index + Math.floor(Math.random() * 250);
    const delay = Math.max(backoff, Number.isFinite(serverDelay) ? serverDelay : 0);
    // Respect Retry-After without waiting beyond the shared request deadline.
    if (Date.now() + delay + 1000 >= deadline) break;
    await response.body?.cancel();
    await new Promise<void>((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(signal.reason); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, delay);
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
    });
  }
  return { response: response!, model: usedModel };
}
