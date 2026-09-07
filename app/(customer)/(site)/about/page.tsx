import type { Metadata } from "next";
import Image from "next/image";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { Disciplines, type Discipline } from "@/components/about/disciplines";
import { FounderNote } from "@/components/about/founder-note";
import { ValuesMosaic, type Value } from "@/components/about/values-mosaic";

export const metadata: Metadata = {
  title: "About | JEMAI",
  description:
    "JEMAI brings together furniture, contemporary art, architecture and interior design to create spaces with character, purpose and a distinct sense of belonging.",
};

/** The four paragraphs of the "Who We Are" measure. The frame hides the label
 *  itself, so it is carried as a screen-reader heading only. */
const introParagraphs = [
  "JEMAI partners with people and businesses as they enter new phases—moving into a home, rethinking a room, opening a new space or creating an environment that better reflects who they have become.",
  "Our world brings together 3 connected disciplines: DESIGN, FURNITURE, and ART. Each can be experienced individually, but our most distinctive work happens when they are considered as parts of one complete environment.",
  "We select furniture for more than function alone. We present art for the perspective and presence it brings. Through architecture and interiors, we consider how light, material, movement and proportion shape everyday experience.",
  "This integrated approach allows JEMAI to look beyond isolated objects and consider the relationship between everything in a space: the chair beside the artwork, the light across a surface, the movement through a room and the feeling that remains after someone has left it.",
];

const values: Value[] = [
  {
    label: "01 / Considered",
    copy: "We personally vet every venue. No shortcuts — just spaces that matter: historic architecture, cutting-edge design, authentic character.",
  },
  {
    label: "02 / Expressive",
    copy: "We believe a space should reveal something about the people within it. Character, memory and individuality matter more than conformity.",
  },
  {
    label: "03 / Connected",
    copy: "Furniture, art and architecture are never experienced in isolation. We consider how every element contributes to the atmosphere of the whole.",
  },
];

/** Only the Furniture body is drawn in the frame; the other three are written
 *  in the same voice. Replace them with real copy when it exists. */
const disciplines: Discipline[] = [
  {
    id: "design",
    title: "Design",
    body: "Designs are where a project begins. We work through light, material, movement and proportion before a single object is chosen, so the space has a structure to hold everything that follows.",
  },
  {
    id: "furniture",
    title: "Furniture",
    body: "We select furniture for more than function alone. We present art for the perspective and presence it brings. Through architecture and interiors, we consider how light, material, movement and proportion shape everyday experience.",
  },
  {
    id: "art",
    title: "Art",
    body: "We present contemporary work for the perspective and presence it brings — pieces that hold a room rather than decorate it, chosen with the people who will live alongside them.",
  },
];

const AboutPage = () => (
  <div className="flex w-full flex-col gap-16 pt-16">
    <section className="w-full px-4 sm:px-6 lg:px-page-gutter">
      <div className="mx-auto grid w-full max-w-432 lg:grid-cols-[634fr_678fr]">
        <div className="relative aspect-square w-full">
          <Image
            src="/figma/home/about-header.png"
            alt="A furnished living space with layered textures and framed artwork"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="bg-surface-subtle flex items-center px-6 py-12 sm:px-10 lg:px-16 lg:py-0">
          <div className="max-w-137.5">
            <h1 className="font-heading text-text-primary text-4xl sm:text-5xl lg:text-[48px] lg:leading-14">
              Where Furniture, Art And Space Come Together
            </h1>
            <p className="text-body text-text-secondary mt-3">
              JEMAI brings together furniture, contemporary art, architecture
              and interior design to create spaces with character, purpose and a
              distinct sense of belonging.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Who We Are — an 800px centred measure. The frame hides its own label. */}
    <section className="w-full px-4 sm:px-6 lg:px-page-gutter">
      <h2 className="sr-only">Who We Are</h2>
      <div className="mx-auto flex w-full max-w-200 flex-col gap-stack-copy">
        {introParagraphs.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 32)}
            className={
              index === 0
                ? "text-body-lg text-text-primary"
                : "text-body text-text-secondary"
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>

    {/* Our Values + the photographic mosaic */}
    <section className="w-full px-4 sm:px-6 lg:px-page-gutter">
      <div className="mx-auto w-full max-w-432">
        <ValuesMosaic
          heading="The Principles Behind the Choices We Make"
          intro="JEMAI is guided by a belief that meaningful spaces are personal, culturally aware and thoughtfully assembled. These principles shape what we select, what we create and how we work with every client."
          values={values}
          closing="Whether selecting one piece or shaping a complete environment, we approach every decision with curiosity, clarity and respect for the people who will live with the result."
          images={[
            {
              src: "/figma/home/cat-furniture.jpg",
              alt: "A seating group arranged around a low table",
            },
            {
              src: "/figma/home/art-gallery.jpg",
              alt: "Framed works hung along a gallery wall",
            },
            {
              src: "/figma/home/sp-bathhouse.jpg",
              alt: "A stone-lined interior lit from above",
            },
            {
              src: "/figma/home/cat-architecture.jpg",
              alt: "An architectural interior with a sweeping staircase",
            },
          ]}
        />
      </div>
    </section>

    {/* A note from our founder — the one full-bleed band on the page */}
    <FounderNote
      heading="A Note From Our Founder"
      paragraphs={[
        "I have always believed that the spaces around us quietly influence how we feel, how we connect and how we imagine what comes next.",
        "JEMAI grew from a desire to make those spaces more beautiful\u2014to bring Design, Furniture and Art into one conversation, and to create an experience that feels personal rather than prescriptive. We are not here to impose a finished look. We are here to listen, to recognise what matters to you and to help shape an environment that feels honest, expressive and enduring.",
      ]}
      closing="With warmth,"
      signature="Esther Akin-Ajayi"
      photograph={{
        src: "/figma/home/art-gallery.jpg",
        alt: "A visitor standing before framed paintings in a gallery",
      }}
    />

    {/* The three disciplines */}
    <section className="w-full px-4 sm:px-6 lg:px-page-gutter">
      <div className="mx-auto flex w-full max-w-200 flex-col">
        <p className="text-body-lg text-text-primary">
          JEMAI works across three connected disciplines. Each can be experienced
          individually, or brought together to shape one complete environment.
        </p>
        <p className="text-body text-text-secondary mt-stack-copy">
          We select furniture for more than function alone. We present art for
          the perspective and presence it brings. Through architecture and
          interiors, we consider how light, material, movement and proportion
          shape everyday experience.
        </p>
        <div className="mt-stack-default">
          <Disciplines disciplines={disciplines} defaultOpen="furniture" />
        </div>
      </div>
    </section>

    <ConsultationCta panelClassName="lg:w-131.5" />
  </div>
);

export default AboutPage;
