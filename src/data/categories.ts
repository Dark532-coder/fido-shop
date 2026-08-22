export interface Category {
  id: string;
  name: string;
  iconName: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'tous',
    name: 'Tous les rayons',
    iconName: 'LayoutGrid',
    description: 'Voir tous les articles disponibles',
  },
  {
    id: 'mode',
    name: 'Mode & Habillement',
    iconName: 'Shirt',
    description: 'Vêtements, tissus de qualité, pagnes et accessoires',
  },
  {
    id: 'electronique',
    name: 'Électronique & High-Tech',
    iconName: 'Smartphone',
    description: 'Smartphones, ordinateurs, écouteurs et gadgets',
  },
  {
    id: 'beaute',
    name: 'Beauté & Cosmétiques',
    iconName: 'Sparkles',
    description: 'Soins corporels, parfums, maquillage et bien-être',
  },
  {
    id: 'maison',
    name: 'Maison & Électroménager',
    iconName: 'Home',
    description: 'Décoration, cuisine, électroménager et mobilier',
  },
  {
    id: 'alimentation',
    name: 'Alimentation & Produits Locaux',
    iconName: 'ShoppingBag',
    description: 'Épicerie fine, produits du terroir et boissons',
  },
  {
    id: 'chaussures',
    name: 'Chaussures & Maroquinerie',
    iconName: 'Footprints',
    description: 'Chaussures homme, femme, sacs et ceintures',
  },
  {
    id: 'autre',
    name: 'Autres Catégories',
    iconName: 'Package',
    description: 'Articles divers et nouveautés',
  },
];
