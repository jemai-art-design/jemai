import type { ConsultationStatus } from "@/lib/admin/consultation-record";
import type { EnquiryStatus } from "@/lib/admin/enquiry-record";
import type { ExhibitionStatus } from "@/lib/admin/exhibitions";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/admin/order-record";
import type { ProjectStatus } from "@/lib/admin/projects";
import type { RegistrationStatus } from "@/lib/admin/registration-record";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminStatus =
  | FulfillmentStatus
  | PaymentStatus
  | ExhibitionStatus
  | EnquiryStatus
  | ConsultationStatus
  | RegistrationStatus
  | ProjectStatus;

/**
 * Dot colour per state — the badge chrome itself is the same hairline pill.
 * The fulfillment four are sampled off the orders frame; none of them has a
 * published variable, so they sit here as literal hex.
 */
const dot: Record<AdminStatus, string> = {
  New: "bg-text-primary",
  Processing: "bg-[#ff8d28]",
  "Ready for dispatch": "bg-[#ffcc00]",
  Delivered: "bg-[#34c759]",
  Upcoming: "bg-[#2f8f4e]",
  // A show that is on right now, which only the derived status can tell you.
  "Open now": "bg-[#ffcc00]",
  Archived: "bg-text-primary",
  // The request queues have no frames of their own, so they borrow the
  // fulfillment palette: in-progress amber, settled green.
  "In conversation": "bg-[#ff8d28]",
  Reviewing: "bg-[#ff8d28]",
  Scheduled: "bg-[#ffcc00]",
  Closed: "bg-[#34c759]",
  // Registrations and orders borrow the same palette: settled green, in-flight
  // amber, and the one state on the console that is genuinely bad in red.
  Confirmed: "bg-[#34c759]",
  Paid: "bg-[#34c759]",
  "Pending payment": "bg-[#ff8d28]",
  Failed: "bg-[#e11d48]",
  // A design project is only ever on the site or held back, so it borrows the
  // settled green and the same grey the secondary copy is set in.
  Visible: "bg-[#34c759]",
  Hidden: "bg-text-secondary",
};

/** The status pill the order and exhibition tables share: a 6px dot, the label, a hairline border. */
export const StatusBadge = ({ status }: { status: AdminStatus; }) => (
  <Badge
    variant="outline"
    className="border-border-default text-text-primary h-7 gap-1.5 rounded-md px-2 text-xs font-medium"
  >
    <span aria-hidden className={cn("size-1.5 rounded-full", dot[status])} />
    {status}
  </Badge>
);
