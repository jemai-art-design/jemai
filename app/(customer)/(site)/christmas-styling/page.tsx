import type { Metadata } from "next";
import { ChristmasHero } from "@/components/christmas/christmas-hero";
import { FestiveProjects } from "@/components/christmas/festive-projects";
import { FestiveRail } from "@/components/christmas/festive-rail";
import { ProcessRow } from "@/components/christmas/process-row";
import { RequestForm } from "@/components/christmas/request-form";
import { SeasonClosed } from "@/components/christmas/season-closed";
import { SeasonIntro } from "@/components/christmas/season-intro";
import { christmasSlotsLeft, currentChristmasYear } from "@/lib/admin/christmas";
import { seasonCapacity } from "@/lib/christmas";

export const metadata: Metadata = {
  title: "Christmas Styling | JEMAI",
  description:
    "From intimate interiors to expressive outdoor settings, JEMAI creates festive environments shaped around your space and the way you gather.",
};

/**
 * Christmas 2026 — `/christmas-styling`.
 *
 * The page has two states and the frames draw both: while slots remain it opens
 * on a count and closes on the request form; at zero the hero drops its button,
 * the capacity plate reads "0 consultation spaces remaining" and the form band
 * becomes a single way onward.
 *
 * Section 03 is the proof — seasons already styled, drawn from the console. It
 * sits after the services and before the process and the ask, and it removes
 * itself entirely when there is nothing in it, so the numbering it carries is
 * the one case on this page where a section can be absent.
 *
 * The count is the season's allocation less the requests that have been
 * **paid**, not the ones that have been submitted: the form is an enquiry, and
 * a slot is only spent once the studio has agreed a price and taken payment
 * outside the system. A page of unanswered enquiries therefore cannot close the
 * season on everyone.
 */

const steps = [
  {
    title: "Share Your Spaces",
    copy: "Tell us where you would like Christmas to take shape and how many rooms are involved.",
  },
  {
    title: "We Review The Brief",
    copy: "A JEMAI consultant will contact you within 24 hours to confirm availability and understand the setting.",
  },
  {
    title: "Scope, Quotation & Payment",
    copy: "Your consultant will define the scope, prepare a quotation and arrange payment through JEMAI’s official channels.",
  },
];

const ChristmasStylingPage = async () => {
  const available = await christmasSlotsLeft(currentChristmasYear());
  const open = available > 0;

  return (
    <div className="flex w-full flex-col">
      <ChristmasHero
        eyebrow={
          open
            ? "Christmas with JEMAI · Limited slots available"
            : `Christmas with JEMAI · ${currentChristmasYear()} consultations closed`
        }
        heading="A Christmas Setting, Curated Around You."
        copy="From intimate interiors to expressive outdoor settings, JEMAI creates festive environments shaped around your space and the way you gather."
        cta={open ? { label: "Secure your slot", href: "#request" } : undefined}
      />

      <SeasonIntro
        eyebrow="01 / The Christmas setting"
        heading={["Christmas,", "Shaped To Feel", "At Home."]}
        paragraphs={
          open
            ? [
              "It all starts with how you live, the rooms where life happens, the spaces you share with family and friends, and the feeling you want your home to create. Tell us which spaces you’d like us to work on.",
              "Once you submit your request, our team will get in touch to understand your needs better and discuss the next steps.",
            ]
            : [
              "Each request begins with the way you live: the rooms you open to family, the entrance that welcomes guests and the atmosphere you want to remember. Select the spaces you would like us to consider.",
              "Our team will refine the brief with you after submission.",
            ]
        }
        capacity={{ available, total: seasonCapacity }}
        cardCopy={
          open
            ? "After submitting your request, our team will contact you within 24 hours to discuss your brief, quotation, and next steps. Your consultation slot is secured once payment is received."
            : `The Christmas ${currentChristmasYear()} request form is now closed. If you have already submitted a request, there is no need to submit again, our team will contact you directly.`
        }
        cardCta={
          open
            ? { label: "Request a Consultation", href: "#request" }
            : { label: "Explore JEMAI", href: "/furniture" }
        }
      />

      <FestiveRail
        eyebrow="02 / Decorate your spaces"
        heading={["A Festive Setting, Thoughtfully", "Composed."]}
        copy="We bring together festive styling, lighting, greenery and thoughtful details to create Christmas spaces that feel warm, beautiful and unique to their surroundings."
      />

      <FestiveProjects
        eyebrow="03 / Christmases we have styled"
        heading={["Christmases We Have", "Already Styled."]}
        copy={
          open
            ? "Every festive setting begins with a different home and a different way of gathering. These are Christmases JEMAI has already shaped — the rooms, the tables and the entrances where the season took its form."
            : "The request list for this season is closed, but the work is not going anywhere. These are Christmases JEMAI has already shaped, and the kind of setting next season begins from."
        }
      />

      <ProcessRow
        eyebrow="04 / From request to setting"
        heading="A Personal Process, From The First Conversation."
        steps={steps}
      />

      {open ? (
        <RequestForm
          eyebrow="05 / Your Christmas request"
          heading="Request A Christmas Consultation"
          copy="Submit your details and selected spaces. This is a consultation request, not a confirmed appointment or payment."
          footnote="Our team will contact you within 24 hours to discuss your brief, confirm the scope and arrange quotation and payment. No payment is collected on this page."
        />
      ) : (
        <SeasonClosed
          eyebrow="05 / Your Christmas request"
          heading="This Season’s Consultation List Is Full."
          copy={`All ${seasonCapacity} consultation spaces for Christmas ${currentChristmasYear()} have been booked, so we are no longer accepting new submissions.`}
          cta={{ label: "Explore Furniture & Art", href: "/furniture" }}
          footnote="Stay close to JEMAI for future seasonal services, exhibitions and ideas for the spaces you live and work in."
        />
      )}
    </div>
  );
};

export default ChristmasStylingPage;
