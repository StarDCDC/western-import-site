// src/lib/data.ts — All mock data for Western Import

export type Condition = 'nou' | 'refurbished';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: Condition;
  price: number;
  oldPrice?: number;
  specs: {
    procesor: string;
    display: string;
    ram: string;
    stocare: string;
    gpu?: string;
    os?: string;
    tip?: string;
    producator?: string;
    extra?: string;
  };
  description: string;
  images: string[];
  reviews: Review[];
  rating: number;
  inStock: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Brand {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: 'laptopuri', name: 'Laptopuri', icon: 'laptop', count: 8 },
  { id: 'telefoane', name: 'Telefoane', icon: 'smartphone', count: 2 },
  { id: 'pc-monitoare', name: 'PC & Monitoare', icon: 'monitor', count: 0 },
  { id: 'tablete', name: 'Tablete', icon: 'tablet', count: 0 },
  { id: 'componente', name: 'Componente', icon: 'cpu', count: 0 },
  { id: 'accesorii', name: 'Accesorii', icon: 'plug', count: 0 },
];

export const brands: Brand[] = [
  { id: 'samsung', name: 'Samsung' },
  { id: 'apple', name: 'Apple' },
  { id: 'lenovo', name: 'Lenovo' },
  { id: 'hp', name: 'HP' },
  { id: 'dell', name: 'Dell' },
  { id: 'razer', name: 'Razer' },
  { id: 'msi', name: 'MSI' },
  { id: 'gigabyte', name: 'Gigabyte' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'motorola', name: 'Motorola' },
  { id: 'panasonic', name: 'Panasonic' },
  { id: 'acer', name: 'Acer' },
];

export const subcategories: Record<string, string[]> = {
  laptopuri: ['Gaming', 'Business', 'Ultrabook', 'Refurbished'],
  telefoane: ['iPhone', 'Samsung', 'Refurbished'],
  'pc-monitoare': ['Desktop', 'All-in-One', 'Monitoare', 'Monitoare Gaming'],
  tablete: ['iPad', 'Android', 'Accesorii'],
  componente: ['Procesoare', 'Plăci Video', 'RAM', 'SSD/HDD', 'Surse'],
  accesorii: ['Tastaturi', 'Mouse', 'Genți', 'Încărcătoare', 'Căști'],
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Acer Nitro V',
    brand: 'Acer',
    category: 'laptopuri',
    condition: 'nou',
    price: 29500,
    oldPrice: 32700,
    specs: {
      producator: 'Acer',
      tip: 'Gaming Laptop',
      procesor: 'Ryzen 7 260',
      display: '16.0" 180Hz',
      ram: '16GB',
      stocare: '1TB SSD',
      gpu: 'RTX 5070',
      os: 'Windows 11',
    },
    description: 'Laptop gaming performant cu procesor AMD Ryzen 7 260 și placa video NVIDIA RTX 5070. Display de 16" cu 180Hz pentru o experiență de gaming fluidă.',
    images: [],
    rating: 4.8,
    inStock: true,
    reviews: [
      { id: 'r1', author: 'Alex M.', rating: 5, date: '2025-05-10', text: 'Laptop excelent pentru gaming! Merge totul pe ultra.' },
      { id: 'r2', author: 'Ion C.', rating: 4, date: '2025-05-08', text: 'Foarte bun, dar se încălzește puțin la gaming intensiv.' },
    ],
  },
  {
    id: '2',
    name: 'Lenovo ThinkPad X1 Yoga Gen 5',
    brand: 'Lenovo',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 6200,
    oldPrice: 6990,
    specs: {
      producator: 'Lenovo',
      tip: 'Business 2-in-1',
      procesor: 'i5-10210U',
      display: '14" Touch',
      ram: '8GB',
      stocare: '128GB SSD',
      gpu: 'Intel UHD',
      os: 'Windows 10 Pro',
      extra: 'LTE',
    },
    description: 'ThinkPad X1 Yoga Gen 5 — laptop business premium cu ecran tactil și conectivitate LTE. Ideal pentru profesioniști mobili.',
    images: [],
    rating: 4.5,
    inStock: true,
    reviews: [
      { id: 'r3', author: 'Maria P.', rating: 5, date: '2025-04-20', text: 'Perfect pentru lucru! Ecranul tactil e foarte util.' },
      { id: 'r4', author: 'Dumitru S.', rating: 4, date: '2025-04-15', text: 'Starea refurbished e foarte bună, arată ca nou.' },
    ],
  },
  {
    id: '3',
    name: 'Lenovo IdeaPad 3 15ITL05',
    brand: 'Lenovo',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 2990,
    oldPrice: 3699,
    specs: {
      producator: 'Lenovo',
      tip: 'Laptop Everyday',
      procesor: 'i3-1115G4',
      display: '15.6" FHD',
      ram: '4GB',
      stocare: '128GB SSD',
      gpu: 'Intel UHD',
      os: 'Windows 11',
    },
    description: 'Laptop accesibil pentru uz zilnic — navigare, documente, streaming. Procesor Intel Gen 11 cu SSD rapid.',
    images: [],
    rating: 4.2,
    inStock: true,
    reviews: [
      { id: 'r5', author: 'Ana K.', rating: 4, date: '2025-05-01', text: 'Bun pentru prețul ăsta. Merge perfect pentru Netflix și documente.' },
    ],
  },
  {
    id: '4',
    name: 'Lenovo ThinkPad P15',
    brand: 'Lenovo',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 10990,
    oldPrice: 13500,
    specs: {
      producator: 'Lenovo',
      tip: 'Workstation',
      procesor: 'i7-10750H',
      display: '15.6" FHD',
      ram: '16GB',
      stocare: '512GB SSD',
      gpu: 'Quadro T1000',
      os: 'Windows 10 Pro',
    },
    description: 'Workstation profesional cu NVIDIA Quadro T1000 — ideal pentru CAD, 3D modeling și aplicații inginerești.',
    images: [],
    rating: 4.7,
    inStock: true,
    reviews: [
      { id: 'r6', author: 'Victor T.', rating: 5, date: '2025-04-28', text: 'Rulează AutoCAD și SolidWorks fără probleme.' },
      { id: 'r7', author: 'George L.', rating: 4, date: '2025-04-22', text: 'Mașină de lucru serioasă. Recomand!' },
    ],
  },
  {
    id: '5',
    name: 'ThinkPad X1 Yoga Gen 4',
    brand: 'Lenovo',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 6800,
    oldPrice: 8000,
    specs: {
      producator: 'Lenovo',
      tip: 'Business 2-in-1',
      procesor: 'i7-8665U',
      display: '14" 2K Touch',
      ram: '16GB',
      stocare: '256GB SSD',
      gpu: 'Intel UHD 620',
      os: 'Windows 10 Pro',
    },
    description: 'ThinkPad premium cu ecran 2K tactil. Procesor i7 Gen 8, 16GB RAM — laptop de business de top.',
    images: [],
    rating: 4.6,
    inStock: true,
    reviews: [
      { id: 'r8', author: 'Radu M.', rating: 5, date: '2025-05-05', text: 'Ecranul 2K e superb. Tastatura ThinkPad e incomparabilă.' },
    ],
  },
  {
    id: '6',
    name: 'Dell Latitude 5421',
    brand: 'Dell',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 6900,
    oldPrice: 7200,
    specs: {
      producator: 'Dell',
      tip: 'Business Laptop',
      procesor: 'i7-11850H',
      display: '14" FHD',
      ram: '16GB',
      stocare: '256GB SSD',
      gpu: 'Intel UHD',
      os: 'Windows 11 Pro',
    },
    description: 'Dell Latitude robust și performant. i7 Gen 11 cu 16GB RAM — ideal pentru mediul corporate.',
    images: [],
    rating: 4.4,
    inStock: true,
    reviews: [
      { id: 'r9', author: 'Sergiu B.', rating: 4, date: '2025-05-02', text: 'Laptop solid de business. Se simte calitatea Dell.' },
    ],
  },
  {
    id: '7',
    name: 'MSI Thin GF63 12VF',
    brand: 'MSI',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 14500,
    oldPrice: 14990,
    specs: {
      producator: 'MSI',
      tip: 'Gaming Laptop',
      procesor: 'i5-12450H',
      display: '15.6" FHD 144Hz',
      ram: '16GB',
      stocare: '512GB SSD',
      gpu: 'RTX 4060',
      os: 'Windows 11',
    },
    description: 'Laptop gaming cu RTX 4060 și ecran 144Hz. Performanță excelentă pentru jocurile moderne.',
    images: [],
    rating: 4.6,
    inStock: true,
    reviews: [
      { id: 'r10', author: 'Andrei V.', rating: 5, date: '2025-05-12', text: 'RTX 4060 la prețul ăsta e o ofertă! Merge totul smooth.' },
      { id: 'r11', author: 'Cristi D.', rating: 4, date: '2025-05-09', text: 'Gaming beast! Puțin zgomotos dar performance e top.' },
    ],
  },
  {
    id: '8',
    name: 'iPhone 13 Pro',
    brand: 'Apple',
    category: 'telefoane',
    condition: 'refurbished',
    price: 8990,
    oldPrice: 10500,
    specs: {
      producator: 'Apple',
      tip: 'Smartphone Premium',
      procesor: 'A15 Bionic',
      display: '6.1" Super Retina XDR',
      ram: '6GB',
      stocare: '128GB',
      os: 'iOS 17',
      extra: 'Graphite',
    },
    description: 'iPhone 13 Pro refurbished în stare excelentă. Camera pro cu 3 lentile, ecran ProMotion 120Hz.',
    images: [],
    rating: 4.7,
    inStock: true,
    reviews: [
      { id: 'r12', author: 'Elena R.', rating: 5, date: '2025-05-14', text: 'Telefonul arată impecabil! Nu se vede că e refurbished.' },
      { id: 'r13', author: 'Mihai F.', rating: 4, date: '2025-05-11', text: 'Camera e fantastică, bateria ține toată ziua.' },
    ],
  },
  {
    id: '9',
    name: 'MacBook Pro 16" 2019',
    brand: 'Apple',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 9500,
    oldPrice: 11900,
    specs: {
      producator: 'Apple',
      tip: 'MacBook Pro',
      procesor: 'i7-9750H',
      display: '16" Retina',
      ram: '16GB',
      stocare: '512GB SSD',
      gpu: 'Radeon Pro 5300M',
      os: 'macOS Sonoma',
    },
    description: 'MacBook Pro 16" cu ecran Retina spectaculos. Ideal pentru design, video editing și muzică.',
    images: [],
    rating: 4.5,
    inStock: true,
    reviews: [
      { id: 'r14', author: 'Tudor A.', rating: 5, date: '2025-04-30', text: 'Ecranul 16" e superb pentru Premiere Pro. Recomand!' },
    ],
  },
  {
    id: '10',
    name: 'iPhone 16e',
    brand: 'Apple',
    category: 'telefoane',
    condition: 'refurbished',
    price: 9500,
    oldPrice: 11505,
    specs: {
      producator: 'Apple',
      tip: 'Smartphone',
      procesor: 'A18',
      display: '6.1" Super Retina XDR',
      ram: '8GB',
      stocare: '128GB',
      os: 'iOS 18',
      extra: 'Black',
    },
    description: 'iPhone 16e cu chip A18 — performanță de top la un preț accesibil. Camera avansată cu modul nocturn.',
    images: [],
    rating: 4.8,
    inStock: true,
    reviews: [
      { id: 'r15', author: 'Larisa N.', rating: 5, date: '2025-05-15', text: 'A18 zboară! Cel mai rapid iPhone la prețul ăsta.' },
      { id: 'r16', author: 'Dan P.', rating: 4, date: '2025-05-13', text: 'Camera face poze excelente noaptea.' },
    ],
  },
  {
    id: '11',
    name: 'Acer Aspire 3 A317',
    brand: 'Acer',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 7200,
    specs: {
      producator: 'Acer',
      tip: 'Laptop Everyday',
      procesor: 'i5-1235U',
      display: '17.3" FHD',
      ram: '16GB',
      stocare: '512GB SSD',
      gpu: 'Intel Iris Xe',
      os: 'Windows 11',
    },
    description: 'Acer Aspire 3 cu ecran mare de 17.3" — ideal pentru entertainment și lucru. 16GB RAM și 512GB SSD.',
    images: [],
    rating: 4.3,
    inStock: true,
    reviews: [
      { id: 'r17', author: 'Natalia G.', rating: 4, date: '2025-05-06', text: 'Ecranul mare e perfect pentru filme și Excel.' },
    ],
  },
  {
    id: '12',
    name: 'Acer Aspire Go 15',
    brand: 'Acer',
    category: 'laptopuri',
    condition: 'refurbished',
    price: 6500,
    specs: {
      producator: 'Acer',
      tip: 'Laptop Everyday',
      procesor: 'Ryzen 7 5800U',
      display: '15.6" FHD',
      ram: '16GB',
      stocare: '256GB SSD',
      gpu: 'AMD Radeon',
      os: 'Windows 11',
    },
    description: 'Acer Aspire Go cu Ryzen 7 5800U — performanță excelentă la preț accesibil. 16GB RAM pentru multitasking.',
    images: [],
    rating: 4.4,
    inStock: true,
    reviews: [
      { id: 'r18', author: 'Florin I.', rating: 5, date: '2025-05-03', text: 'Ryzen 7 e bestia! Merge totul rapid.' },
      { id: 'r19', author: 'Irina C.', rating: 4, date: '2025-04-29', text: 'Raport calitate-preț excelent.' },
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getSimilarProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ro-MD') + ' MDL';
}

export function getDiscount(oldPrice: number, price: number): number {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
