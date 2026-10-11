import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Assurance = {
  icon: ReactNode;
  title: string;
  copy: string;
  cta?: { label: string; href: string; };
};

const defaultAssurances: Assurance[] = [
  {
    icon: <Image src="/figma/icons/delivery.svg" alt="" width={48} height={48} unoptimized />,
    title: "Free Shipping",
    copy: "All orders over ₦7,500,000 are delivered to your doorstep at no extra charge.",
    cta: { label: "Shipping Details", href: "/terms" },
  },
  {
    icon: <Image src="/figma/icons/guidance.svg" alt="" width={48} height={48} unoptimized />,
    title: "30-Days Free Returns",
    copy: "Enjoy the freedom of stress-free shopping with our hassle-free and return policy.",
    cta: { label: "Return Policy", href: "/terms" },
  },
  {
    icon: <Image src="/figma/icons/secure.svg" alt="" width={48} height={48} unoptimized />,
    title: "Secure Payment",
    copy: "Shop with confidence knowing your information is safeguarded.",
    cta: { label: "More About Payment", href: "/terms" },
  },
];

type AssuranceRowProps = {
  /** Defaults to the standard trio; pass a set to override it. */
  items?: Assurance[];
  className?: string;
};

export const AssuranceRow = ({ items = defaultAssurances, className }: AssuranceRowProps) => (
  <div
    className={cn(
      "border-border-default flex w-full flex-col border-t border-b px-0 py-stack-loose lg:px-page-gutter",
      className,
    )}
  >
    <div className="flex flex-col justify-center gap-10 md:grid md:grid-cols-2 md:gap-12 lg:flex lg:flex-row lg:gap-section-gap-editorial">
      {items.map(({ icon, title, copy, cta }, index) => (
        <Fragment key={title}>
          {index > 0 && (
            <div
              aria-hidden
              className="border-border-default hidden w-px self-stretch border-l lg:block"
            />
          )}
          <div
            className={cn(
              "flex flex-col items-start gap-stack-heading lg:flex-1",
              index === items.length - 1 &&
              "md:col-span-2 md:max-w-[calc(50%-1.5rem)] md:justify-self-center lg:col-span-1 lg:max-w-none lg:justify-self-stretch",
            )}
          >
            <span className="flex size-12 items-center justify-center">
              {icon}
            </span>
            <div className="flex w-full flex-col gap-stack-compact pt-stack-loose">
              <h3 className="text-h4 text-text-primary">{title}</h3>
              <p className="text-body text-text-secondary">{copy}</p>
            </div>
            {cta ? (
              <Link
                href={cta.href}
                className="border-border-default text-label text-text-secondary hover:border-border-strong flex min-h-10 min-w-12.5 items-center justify-center rounded-lg border px-5 py-3 transition-colors"
              >
                {cta.label}
              </Link>
            ) : null}
          </div>
        </Fragment>
      ))}
    </div>
  </div>
);
