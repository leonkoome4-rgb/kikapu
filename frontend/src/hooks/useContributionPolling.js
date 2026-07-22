import { useCallback, useRef, useState } from "react";
import { checkContributionStatus } from "../api/contributions";

// Daraja sandbox enforces a shared 5-requests-per-60s spike-arrest limit, so
// polling stays conservative: a 15s interval times 4 attempts uses at most 4
// of that budget, leaving room for the initial STK push call itself.
const POLL_INTERVAL_MS = 15000;
const MAX_ATTEMPTS = 4;

export function useContributionPolling() {
  const [polling, setPolling] = useState(false);
  const [statusDetail, setStatusDetail] = useState("");
  const cancelledRef = useRef(false);

  const checkOnce = useCallback(async (contributionId) => {
    const result = await checkContributionStatus(contributionId);
    setStatusDetail(result.detail || "");
    return result;
  }, []);

  const start = useCallback(
    async (contributionId, { onResolved } = {}) => {
      cancelledRef.current = false;
      setPolling(true);
      setStatusDetail("Waiting for you to enter your M-Pesa PIN…");

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (cancelledRef.current) return;
        try {
          const result = await checkOnce(contributionId);
          if (cancelledRef.current) return;
          if (result.state !== "pending") {
            setPolling(false);
            onResolved?.(result);
            return;
          }
        } catch {
          // Transient network error — keep polling.
        }
      }
      setPolling(false);
      setStatusDetail("Still pending — you can check again in a moment.");
    },
    [checkOnce]
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    setPolling(false);
  }, []);

  return { polling, statusDetail, start, stop, checkOnce };
}
