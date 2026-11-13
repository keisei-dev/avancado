import {
  Coffee,
  Hotel,
  MapPin,
  Mountain,
  Scissors,
  Stethoscope,
  Store,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  parks: Trees,
  cafes: Coffee,
  'food-drink': UtensilsCrossed,
  vets: Stethoscope,
  services: Scissors,
  shops: Store,
  stays: Hotel,
  trails: Mountain,
};

// Short names for chips and cards.
const LABELS: Record<string, string> = {
  cafes: 'Cafés',
  'food-drink': 'Food & drink',
  services: 'Pet services',
};

export function categoryLabel(category: { name: string; slug: string }) {
  return LABELS[category.slug] ?? category.name;
}

export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? MapPin;
}
