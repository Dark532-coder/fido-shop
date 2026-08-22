import {
  LayoutGrid,
  Shirt,
  Smartphone,
  Sparkles,
  Home,
  ShoppingBag,
  Footprints,
  Package,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutGrid,
  Shirt,
  Smartphone,
  Sparkles,
  Home,
  ShoppingBag,
  Footprints,
  Package,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Package;
}
