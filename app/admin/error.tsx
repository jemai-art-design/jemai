"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

/**
 * The console's own boundary, so a failure inside the admin tree stays on the
 * admin surface — white ground, 8px radii — rather than falling through to the
 * storefront frame and pointing the reader at the shop.
 */
const AdminError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      className="admin-surface bg-white"
      code="500"
      title="Something went wrong"
      description={
        error.digest
          ? "This screen failed to load. Trying again often clears it — if it does not, quote the reference below."
          : "This screen failed to load. Trying again often clears it."
      }
      onRetry={retry}
      homeHref="/admin"
      homeLabel="Back to overview"
      digest={error.digest}
    />
  );
};

export default AdminError;
