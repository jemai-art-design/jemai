export type Space = {
  name: string;
  meta: string;
  summary?: string;
  description?: string;
  images: { src: string; alt: string; }[];
};

export const spaces: Space[] = [
  {
    name: "Crescendo",
    meta: "Residential · Lagos",
    summary: "",
    description: "CRESENDO Residence is a contemporary home conceived around modern living and effortless leisure. Sitting on a 636.29 SQM site, the 275.43 SQM residence features a private pool, salon, gym, landscaped spaces, and parking for four vehicles. A considered balance of architecture, comfort, and lifestyle.",
    images: [
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688399/jemai/crescendo/ante-room.jpg", alt: "Ante room at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688401/jemai/crescendo/dining-v2.jpg", alt: "Dining at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688403/jemai/crescendo/dining-v4.jpg", alt: "Dining at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688404/jemai/crescendo/family-lounge-v1.jpg", alt: "Family lounge at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688405/jemai/crescendo/family-lounge-v2.jpg", alt: "Family lounge at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688406/jemai/crescendo/family-lounge-v3.jpg", alt: "Family lounge at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688408/jemai/crescendo/home-office-v1.jpg", alt: "Home office at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688409/jemai/crescendo/home-office-v2.jpg", alt: "Home office at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688410/jemai/crescendo/kitchen-v1.jpg", alt: "Kitchen at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688412/jemai/crescendo/kitchen-v2.jpg", alt: "Kitchen at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688413/jemai/crescendo/kitchen-v3.jpg", alt: "Kitchen at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688414/jemai/crescendo/living-area-v1.jpg", alt: "Living area at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688415/jemai/crescendo/living-area-v2.jpg", alt: "Living area at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688417/jemai/crescendo/living-area-v3.jpg", alt: "Living area at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688418/jemai/crescendo/living-area-v4.jpg", alt: "Living area at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688419/jemai/crescendo/living-area-v5.jpg", alt: "Living area at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688420/jemai/crescendo/madam-s-toilet-v1.jpg", alt: "Madam's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688421/jemai/crescendo/madam-s-toilet-v2.jpg", alt: "Madam's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688422/jemai/crescendo/madam-s-toilet-v3.jpg", alt: "Madam's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688423/jemai/crescendo/madam-s-toilet-v4.jpg", alt: "Madam's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688424/jemai/crescendo/masters-toilet-v1.jpg", alt: "Master's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688425/jemai/crescendo/masters-toilet-v2.jpg", alt: "Master's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688426/jemai/crescendo/masters-toilet-v3.jpg", alt: "Master's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688427/jemai/crescendo/masters-toilet-v4.jpg", alt: "Master's toilet at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688428/jemai/crescendo/scene-1.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688432/jemai/crescendo/scene-1-1.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688432/jemai/crescendo/scene-2.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688433/jemai/crescendo/scene-3.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688434/jemai/crescendo/scene-4.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688435/jemai/crescendo/scene-5.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688436/jemai/crescendo/scene-8-1.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688429/jemai/crescendo/scene-10.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688430/jemai/crescendo/scene-11.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688431/jemai/crescendo/scene-12.jpg", alt: "Interior view at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688437/jemai/crescendo/typical-guest-bedroom-v1.jpg", alt: "Typical guest bedroom at Crescendo" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688439/jemai/crescendo/typical-guest-bedroom-v2.jpg", alt: "Typical guest bedroom at Crescendo" },
    ],
  },
  {
    name: "Shore",
    meta: "Residential · Lagos",
    summary: "",
    description:
      "We transformed SHORE Residence from an unfinished carcass into a complete, comfortable home. The design brought together the finishes, colours, lighting, furniture, and details needed to give the space a warm and cohesive feel. Every room was thoughtfully put together to create a home that is both practical and beautiful.",
    images: [
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688443/jemai/shore/bathroom-1-1.jpg", alt: "Bathroom at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688445/jemai/shore/bathroom-2-1.jpg", alt: "Bathroom at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688446/jemai/shore/bedroom-1-4.jpg", alt: "Bedroom at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688447/jemai/shore/bedroom-2-4.jpg", alt: "Bedroom at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688448/jemai/shore/entry-hallway-1-4.jpg", alt: "Entry hallway at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688450/jemai/shore/entry-hallway-2-3.jpg", alt: "Entry hallway at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688451/jemai/shore/kitchen-1-4.jpg", alt: "Kitchen at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688452/jemai/shore/kitchen-2-3.jpg", alt: "Kitchen at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688453/jemai/shore/living-room-1-4.jpg", alt: "Living room at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688453/jemai/shore/living-room-2-3.jpg", alt: "Living room at Shore" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688455/jemai/shore/living-room-3-4.jpg", alt: "Living room at Shore" },
    ],
  },
  {
    name: "VHRM Consulting Office",
    meta: "Workplace · Abuja",
    summary: "",
    description:
      "We transformed a compact office space for VHRM Consulting in Abuja into a functional and comfortable workplace. With limited space to work with, the design focused on making every corner count while still creating a professional and welcoming atmosphere. The result is a simple, well-organised office that feels open, practical, and thoughtfully designed.",
    images: [
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688455/jemai/vhrm-consulting-office/cv1.jpg", alt: "Office interior at VHRM Consulting Office" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688457/jemai/vhrm-consulting-office/cv2.jpg", alt: "Office interior at VHRM Consulting Office" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688458/jemai/vhrm-consulting-office/ov1.jpg", alt: "Office interior at VHRM Consulting Office" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688460/jemai/vhrm-consulting-office/ov2.jpg", alt: "Office interior at VHRM Consulting Office" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688462/jemai/vhrm-consulting-office/rv1.jpg", alt: "Office interior at VHRM Consulting Office" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688463/jemai/vhrm-consulting-office/rv2.jpg", alt: "Office interior at VHRM Consulting Office" },
    ],
  },
  {
    name: "TVK",
    meta: "Retail · Lagos",
    summary: "",
    description:
      "TVK & RL FASHION HOUSE - We transformed a rented space into a welcoming showroom that reflects the personality of the fashion brands. From the layout and finishes to the lighting and finer details, every element was carefully thought of to create a space that feels stylish, functional, and inviting for both the brand and its customers.",
    images: [
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688467/jemai/tvk/img-8464.jpg", alt: "Showroom at TVK" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688469/jemai/tvk/img-8465.jpg", alt: "Showroom at TVK" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688469/jemai/tvk/img-8466.jpg", alt: "Showroom at TVK" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688471/jemai/tvk/img-8467.jpg", alt: "Showroom at TVK" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688472/jemai/tvk/img-8468.jpg", alt: "Showroom at TVK" },
    ],
  },
  {
    name: "Lenido",
    meta: "Hospitality · Lagos",
    summary: "",
    description:
      "A thoughtfully designed reception for LENIDO APARTMENTS, created to give guests a strong first impression from the moment they arrive. The space combines comfortable seating, warm finishes, and simple yet refined details to create a welcoming entrance that feels both stylish and homely.",
    images: [
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688464/jemai/lendo/img-3198.jpg", alt: "Reception at Lenido" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688465/jemai/lendo/img-3199.jpg", alt: "Reception at Lenido" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688466/jemai/lendo/img-3200.jpg", alt: "Reception at Lenido" },
    ],
  },
  {
    name: "Gudu",
    meta: "Residential · Lagos",
    summary: "",
    images: [
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688440/jemai/gudu/gudu-bedroom-1-v1.jpg", alt: "Bedroom at Gudu" },
      { src: "https://res.cloudinary.com/iwhhzsrd/image/upload/v1789688441/jemai/gudu/gudu-bedroom-1-v2.jpg", alt: "Bedroom at Gudu" },
    ],
  },
];
