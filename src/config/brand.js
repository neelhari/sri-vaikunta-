// Central brand config for Sri Vaikunta Premium Sarees
// All store info, address, contact, and highlights configured here.

export const BRAND = {
  name: "Sri Vaikunta",
  fullName: "Sri Vaikunta Premium Sarees",
  tagline: "Sacred Weaves, Royal Elegance",
  subTagline: "Authentic Handloom & Heritage Pattu Sarees",
  motto: "Wear the legacy of timeless Indian craftsmanship.",

  phone: "+91 99899 99999",
  // wa.me requires country code, no + or spaces
  whatsappNumber: "919989999999",
  email: "srivaikuntasarees@gmail.com",

  address: {
    line1: "25-32/10/4/1, Mallikarjuna Nagar",
    line2: "Near Beeramguda Main Road",
    line3: "Ramachandrapuram",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "502032",
    full: "25-32/10/4/1, Mallikarjuna Nagar, near Beeramguda Main Road, Ramachandrapuram, Hyderabad, Telangana 502032",
  },

  instagramHandle: "@srivaikuntasarees",

  about: `Sri Vaikunta Premium Sarees is Hyderabad's premier destination for authentic, handcrafted traditional sarees. Sourced directly from renowned artisan weaving clusters across India, our collections honor the rich heritage of Indian handlooms.

From the opulent silk lustre of Dharmavaram Pure Pattu and Pochampally Ikkat to the delicate grace of Mangalgiri prints, Banarasi weaves, and Kota cottons, every drape at Sri Vaikunta is a celebration of purity, quality, and timeless royal splendor.`,

  collectionHighlights: [
    "Dharmavaram Pure Pattu",
    "Dharmavaram Semi Pattu",
    "Pochampally Pattu",
    "Banarasi Sarees",
    "Semi Gadwal Sarees",
    "Mangalgiri Digital Print",
    "Kalamkari Cotton",
    "Pure Cotton Sarees",
    "Kota Sarees",
    "Mysore Silk Sarees",
    "Ikkat Sarees",
    "Chinnon Sarees",
    "Fancy Sarees",
    "HO Sarees",
  ],

  freeShippingThreshold: 2500,
};

export function waLink(message) {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
