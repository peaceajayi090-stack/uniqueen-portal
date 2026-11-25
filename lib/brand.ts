export const STUDIO = {
  name: "Uniqueen Interiors",
  tagline: "Modern, functional and personal interiors across Nigeria",
  phone: process.env.NEXT_PUBLIC_STUDIO_PHONE || "",
  email: process.env.NEXT_PUBLIC_STUDIO_EMAIL || "",
  bank: {
    name: process.env.NEXT_PUBLIC_BANK_NAME || "",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "Uniqueen Interiors",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "",
  },
};

export const STAGES = [
  "Discovery",
  "Site survey",
  "Concept",
  "Design development",
  "Procurement",
  "Installation",
  "Handover",
] as const;

export const PROJECT_STATUSES = ["Active", "On hold", "Completed"] as const;

export const ORDER_STATUSES = [
  "Awaiting approval",
  "Ordered",
  "In production",
  "Delivered",
  "Installed",
  "Delayed",
] as const;

export const BOQ_SECTIONS = [
  "Contractor labour",
  "Base materials",
  "Finishing materials",
  "Loose furniture and décor",
  "Miscellaneous services",
  "Designer's professional fee",
] as const;

export const PROCESS = [
  ["Discovery and brief", "You complete the questionnaire on this portal and we hold a kick-off meeting to agree goals, style, budget and timeline."],
  ["Site survey", "We measure every wall, door, window and ceiling height, and photograph existing conditions."],
  ["Concept design", "Moodboard, colour and material palette, and a proposed furniture layout. One round of revisions is included."],
  ["Design development", "The full drawing set: demolition, furniture, flooring, ceiling (RCP), electrical, switch board elevations, wall elevations, furniture details, plus 3D visuals."],
  ["Costing and procurement", "Bill of Quantities and FF&E schedule; on turnkey projects we order, track and receive every item."],
  ["Installation and handover", "We supervise contractors, style the space, walk through it with you and hand over care instructions."],
] as const;

export const PAYMENT_SCHEDULE = [
  ["Booking and kick-off", "50% of design fee", "Before the site survey"],
  ["Concept approval", "30% of design fee", "When you approve the concept"],
  ["Final drawings", "20% of design fee", "Before the full drawing set is released"],
  ["Procurement (turnkey)", "70% of BOQ value", "Before items are ordered"],
  ["Installation (turnkey)", "30% of BOQ value", "Before installation starts"],
] as const;

export const DELIVERABLES = [
  "Wall and demolition plan",
  "Proposed furniture plan",
  "Flooring plan",
  "Reflected ceiling plan (RCP)",
  "Electrical plan",
  "Switch board elevations + legend",
  "Wall elevations",
  "Furniture details",
  "Moodboard presentation",
  "Material list",
  "3D visuals",
  "Bill of Quantities (BOQ)",
] as const;

export const PACKAGES = [
  {
    id: "clarity",
    name: "Clarity Session",
    price: "₦250,000 virtual · ₦400,000 on site in Lagos",
    bestFor: "Expert direction before you invest",
    includes: ["60-minute consultation", "Space assessment", "Written recommendations within 48 hours", "Fee credited if you book a package within 30 days"],
  },
  {
    id: "refresh",
    name: "Room Refresh (e-design)",
    price: "₦800,000 per room",
    bestFor: "One room, done by you",
    includes: ["Moodboard and colour palette", "Furniture layout", "Shopping list with prices", "2 3D views", "1 revision"],
  },
  {
    id: "signature",
    name: "Signature Design",
    price: "₦1,500,000 per room · ₦25,000 per m² for whole homes (min. ₦5,000,000)",
    bestFor: "Clients with their own contractor",
    includes: ["Full 12-document drawing set", "3D renders", "Material list and BOQ", "2 revisions", "Your own client portal"],
    featured: true,
  },
  {
    id: "turnkey",
    name: "Turnkey Complete",
    price: "Design fee + 20% of BOQ (min. ₦10,000,000)",
    bestFor: "Busy executives and Nigerians abroad",
    includes: ["Everything in Signature Design", "Procurement and order tracking", "Contractor supervision", "Styling and handover", "Weekly portal updates"],
  },
  {
    id: "shortlet",
    name: "Short-let Ready",
    price: "From ₦6,000,000 per apartment + furnishing",
    bestFor: "Luxury short-let and Airbnb investors",
    includes: ["Guest-proof design", "Furnishing and styling", "Listing photos", "Inventory list"],
  },
] as const;

export const ADD_ONS = [
  ["Extra 3D render", "₦150,000"],
  ["Extra revision round", "₦250,000"],
  ["Extra site visit (Lagos)", "₦150,000"],
  ["Rush delivery", "+30%"],
  ["6-month refresh plan (2 styling visits)", "₦750,000"],
] as const;

export const LEAD_STATUSES = ["New", "Contacted", "Booked", "Won", "Lost"] as const;
export const FILE_CATEGORIES = ["Drawings", "3D renders", "Moodboard", "Site photos", "Receipts", "Contracts", "Other"] as const;
