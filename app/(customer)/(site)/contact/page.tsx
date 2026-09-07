import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { LocationMap } from "@/components/contact/location-map";
import { socials } from "@/lib/contact";
import { externalLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact | JEMAI",
  description:
    "Tell us the occasion and we’ll take it from there — one conversation, one point of contact, from brief to event day.",
};

type DirectoryRow = {
  label: string;
  links?: { label: string; href: string; }[];
  text?: string;
};

const directory: DirectoryRow[] = [
  {
    label: "General",
    links: [{ label: "admin@jemai.co", href: "mailto:admin@jemai.co" }],
  },
  { label: "Visit", text: "Plot 1194, Hamza Sakwa Close, Guzape, Abuja" },
  {
    label: "Follow",
    links: [
      { label: socials.instagram.label, href: socials.instagram.href },
      { label: socials.whatsapp.label, href: socials.whatsapp.href },
    ],
  },
];

const ContactPage = () => (
  <div className="w-full px-4 pt-16 sm:px-6 lg:px-page-gutter">
    <div className="mx-auto w-full max-w-432">
      <div className="grid gap-x-49 gap-y-12 lg:grid-cols-[384fr_732fr]">
        <div className="pt-4.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link
              href="/"
              className="text-body-xs text-text-secondary underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <span aria-hidden className="text-body-xs text-text-secondary">
              /
            </span>
            <span
              className="text-body-xs text-text-primary"
              aria-current="page"
            >
              Contact
            </span>
          </nav>

          <h1 className="font-heading text-text-primary mt-4 text-3xl font-bold sm:text-h2">
            Planning something?
          </h1>

          {/* max-w-80 (320px), not the column's 384: the frame wraps this to
              three lines, whose longest is 311. At 384 "day." rides up onto
              line two and the block loses a line. */}
          <p className="text-body-sm text-text-secondary mt-4.5 max-w-80">
            Tell us the occasion and we&rsquo;ll take it from there &mdash; one
            conversation, one point of contact, from brief to event day.
          </p>

          {/* Rules run 53px apart (y=214 … 426 in the frame) and are lighter
              than `border-default` — black at 10%, which composites 11 levels
              lighter than the token, so it is literal rather than an invented
              token. */}
          <dl className="mt-9.5 border-t border-black/10">
            {directory.map((row) => (
              <div
                key={row.label}
                className="flex min-h-13.25 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-black/10 py-1"
              >
                <dt className="text-body-sm text-text-primary">{row.label}</dt>
                <dd className="text-body-sm text-text-primary flex items-center gap-4">
                  {row.text}
                  {row.links?.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      {...externalLink(link.href)}
                      className="hover:text-action-link inline-flex items-center gap-1 transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden className="size-3" />
                    </a>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The frame top-aligns the form's eyebrow with the H1's ink, not with
            the breadcrumb above it — 53px below the top of the column. */}
        <div className="lg:pt-13.25">
          <ContactForm />
        </div>
      </div>

      {/* Where to find us — tracks 380fr / 932fr, no gutter, summing to 1312. */}
      <div className="mt-34.5 grid gap-y-10 lg:grid-cols-[380fr_932fr]">
        <div className="lg:pt-0.75">
          <p className="text-eyebrow text-text-secondary uppercase">Location</p>
          <h2 className="font-heading text-text-primary text-2xl font-bold sm:text-h3">
            Where to find us
          </h2>

          <p className="text-eyebrow text-text-secondary mt-7 uppercase">
            Neighborhood
          </p>
          <p className="text-body-lg text-text-primary">Hamza Sakwa Close</p>

          <p className="text-eyebrow text-text-secondary mt-4.75 uppercase">
            City
          </p>
          <p className="text-body-lg text-text-primary">Guzape,Abuja</p>

          <a
            href="https://maps.google.com/?q=Plot+1194,+Hamza+Sakwa+Close,+Guzape,+Abuja"
            target="_blank"
            rel="noreferrer"
            className="text-eyebrow text-text-primary hover:text-action-link border-border-default mt-5.75 inline-flex items-center gap-2.5 border-b pb-1 uppercase transition-colors"
          >
            <ExternalLink aria-hidden className="size-2.5" />
            Get Directions
          </a>
        </div>

        <LocationMap />
      </div>
    </div>
  </div>
);

export default ContactPage;
