// Central brand config — edit here, not in components.
// Source: client requirement form + WhatsApp message, 2026-08-14.

export const BRAND = {
  name: "Aalaya Vastra",
  tagline: "Tradition for Every Generation",
  subTagline: "Timeless. Tradition. Modern You.",
  motto: "Wear the tradition. Own the style. Celebrate YOU.",

  ownerName: "Harini",
  ownerFullName: "Jupudy Harini",

  phone: "7989222233",
  // wa.me requires country code, no + or spaces
  whatsappNumber: "917989222233",
  email: "aalayavastra2026@gmail.com",

  address: {
    line1: "Vidyuth Colony, 3rd Street",
    line2: "Venkateshwara Nagar, Beside BJP Office",
    line3: "Turtle Wax (Upstairs)",
    city: "Rajahmundry",
    full: "Vidyuth Colony, 3rd Street, Venkateshwara Nagar, Beside BJP Office, Turtle Wax (Upstairs), Rajahmundry",
  },

  // TODO: client hasn't shared social handles yet — replace when available
  instagramHandle: "@aalayavastra",

  about: `Aalaya Vastra is a destination for women's fashion where timeless tradition meets modern elegance. From graceful sarees and beautiful ethnic wear to stylish contemporary outfits, our collection is thoughtfully chosen to suit every generation and every occasion.

Whether it's a festival, wedding, celebration, or an everyday look, Aalaya Vastra brings you style, quality, comfort, and elegance — all under one roof.`,

  // From the client's "Our Collection" graphic
  collectionHighlights: [
    "Handloom Sarees",
    "Handpicked Collection",
    "Premium Cotton Sarees",
    "Two Cut Piece Sarees",
    "Blouse Pieces",
    "Dress Collections",
    "Petticoats",
    "Towels",
  ],

  freeShippingThreshold: 2000,
};

export function waLink(message) {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
