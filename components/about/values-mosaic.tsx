import Image from "next/image";
import { objectFit, type SiteImage } from "@/lib/site-image-slots";

export type Value = {
  label: string;
  copy: string;
};

type ValuesMosaicProps = {
  heading: string;
  intro: string;
  values: Value[];
  closing: string;
  /** Four, in mosaic order: beside the values panel, the pair, then the last. */
  images: SiteImage[];
};

export const ValuesMosaic = ({
  heading,
  intro,
  values,
  closing,
  images,
}: ValuesMosaicProps) => (
  <div className="flex w-full flex-col gap-4">
    {/* Row A — values panel beside a photograph */}
    <div className="grid gap-4 lg:grid-cols-[648fr_648fr]">
      <div className="bg-surface-subtle flex flex-col p-6 sm:p-stack-loose">
        {/* No `leading-tight` here: the frame's heading is 568 x 92, i.e. two lines
            at the h2 token's own 46px, and `leading-tight` would resolve it to 50. */}
        <h2 className="font-heading text-text-primary pt-6 text-3xl font-bold sm:text-h2">
          {heading}
        </h2>
        <p className="text-body text-text-secondary mt-2 pb-6">{intro}</p>

        {values.map((value) => (
          <div
            key={value.label}
            className="border-border-default border-t px-4 pt-4.25 pb-4"
          >
            <p className="text-label text-text-primary uppercase leading-7 tracking-[0.08em]">
              {value.label}
            </p>
            <p className="text-body text-text-secondary mt-2">{value.copy}</p>
          </div>
        ))}
      </div>

      <div className="relative aspect-square w-full self-start">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={objectFit(images[0].fit)}
        />
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[648fr_648fr]">
      {images.slice(1, 3).map((image) => (
        <div key={image.key} className="relative aspect-square w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={objectFit(image.fit)}
          />
        </div>
      ))}
    </div>

    <div className="grid gap-4 lg:grid-cols-[648fr_648fr]">
      <div className="relative aspect-square w-full">
        <Image
          src={images[3].src}
          alt={images[3].alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={objectFit(images[3].fit)}
        />
      </div>
      <div className="bg-surface-subtle flex items-center p-6 sm:p-stack-loose lg:aspect-square">
        <p className="text-body-lg text-text-primary">{closing}</p>
      </div>
    </div>
  </div>
);
