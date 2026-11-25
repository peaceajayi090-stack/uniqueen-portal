export type Question = { key: string; label: string; type?: "text" | "textarea" | "select"; options?: string[] };

export const QUESTIONNAIRE: { title: string; questions: Question[] }[] = [
  {
    title: "1. Your details",
    questions: [
      { key: "full_name", label: "Full name" },
      { key: "phone", label: "Phone / WhatsApp" },
      { key: "property_type", label: "Type of property", type: "select", options: ["Apartment", "Duplex / house", "Office", "Shop", "Restaurant", "Other"] },
      { key: "ownership", label: "Do you own or rent the property?", type: "select", options: ["Own", "Rent"] },
      { key: "project_type", label: "New build, renovation or refresh?", type: "select", options: ["New build", "Renovation", "Refresh"] },
      { key: "referral", label: "How did you hear about us?" },
    ],
  },
  {
    title: "2. The space",
    questions: [
      { key: "rooms", label: "Which rooms are part of this project?", type: "textarea" },
      { key: "sizes", label: "Approximate size of each room (or say you will send a floor plan)", type: "textarea" },
      { key: "ceiling_height", label: "Ceiling height" },
      { key: "walls", label: "Do you want any walls removed or added?", type: "textarea" },
      { key: "keep", label: "What do you want to keep (furniture, art, fittings)?", type: "textarea" },
      { key: "problems", label: "Current problems with the space (heat, light, storage, layout, noise)", type: "textarea" },
      { key: "power", label: "Power situation: grid, inverter, solar, generator?" },
    ],
  },
  {
    title: "3. Lifestyle",
    questions: [
      { key: "users", label: "Who will use the space? (adults, children and ages, elderly, staff)", type: "textarea" },
      { key: "pets", label: "Any pets?" },
      { key: "hosting", label: "How often do you host guests, and how many?" },
      { key: "wfh", label: "Do you work from home?", type: "select", options: ["Yes", "No", "Sometimes"] },
      { key: "accessibility", label: "Any accessibility needs?" },
    ],
  },
  {
    title: "4. Style and colour",
    questions: [
      { key: "style", label: "Preferred style", type: "select", options: ["Modern minimalist", "Warm contemporary", "Japandi", "Luxury / glam", "Modern African / Afro-luxe", "Industrial", "Classic", "Not sure"] },
      { key: "feel", label: "Three words for how the space should feel" },
      { key: "colours_love", label: "Colours you love" },
      { key: "colours_avoid", label: "Colours you never want to see" },
      { key: "materials", label: "Materials you like (wood, marble, velvet, brass, rattan…)" },
      { key: "inspiration", label: "Links to Pinterest boards or Instagram posts you like", type: "textarea" },
    ],
  },
  {
    title: "5. Functional needs",
    questions: [
      { key: "storage", label: "Storage needs", type: "textarea" },
      { key: "tv", label: "TV size and where it should go" },
      { key: "ceiling", label: "Ceiling preference", type: "select", options: ["POP", "Gypsum", "Wood slats", "Plain", "Not sure"] },
      { key: "lighting", label: "Lighting mood (bright, warm, dimmable, chandelier)" },
      { key: "ac", label: "Air conditioning: units and positions" },
      { key: "flooring", label: "Flooring preference" },
      { key: "windows", label: "Window treatment: curtains, blinds, blackout?" },
      { key: "must_haves", label: "Must-have items", type: "textarea" },
    ],
  },
  {
    title: "6. Budget and timeline",
    questions: [
      { key: "budget", label: "Total budget range", type: "select", options: ["Under ₦20m", "₦20m – ₦50m", "₦50m – ₦100m", "₦100m – ₦200m", "Above ₦200m"] },
      { key: "service", label: "Service wanted", type: "select", options: ["Design consultation only", "Full design (I'll use my own contractor)", "Turnkey: design, sourcing and installation"] },
      { key: "deadline", label: "When should it be finished? Is the date fixed?" },
      { key: "decision_maker", label: "Who makes the final decisions?" },
      { key: "abroad", label: "Will you be in Nigeria during the project, or managing from abroad?" },
      { key: "other", label: "Anything else we should know?", type: "textarea" },
    ],
  },
];

export const QUESTION_KEYS = QUESTIONNAIRE.flatMap((s) => s.questions.map((q) => q.key));
