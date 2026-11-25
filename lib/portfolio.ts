import { SUPABASE_URL } from "./env";

export const portfolioImage = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/portfolio/${path}`;

export const PORTFOLIO_PLACEHOLDERS = [
  { title: "A refined dining space", location: "Victoria Island, Lagos" },
  { title: "A signature living room", location: "Lekki, Lagos" },
  { title: "A serene master suite", location: "Ikoyi, Lagos" },
];
