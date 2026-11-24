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
