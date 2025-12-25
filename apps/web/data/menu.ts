export type MenuItem = {
  id: string | number;
  name: string;
  description?: string | null;
  price: number;
  tags?: string[];
  badge?: string;
  imageUrl?: string | null;
};

export type MenuCategory = {
  id: string | number;
  name: string;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: "coffee",
    name: "Кофе-бар",
    items: [
      {
        id: "flat-white",
        name: "Флэт уайт",
        description: "Двойной эспрессо с нежной молочной пеной.",
        price: 2400,
        tags: ["популярное", "фирменное"],
      },
      {
        id: "raf",
        name: "Раф ванильный",
        description: "Нежный эспрессо с ванилью и легкой пеной.",
        price: 2600,
        tags: ["сладкое"],
      },
      {
        id: "filter",
        name: "Фильтр-кофе",
        description: "Односортный кофе, ручная заварка, яркая кислотность.",
        price: 1800,
      },
    ],
  },
  {
    id: "brunch",
    name: "Бранч",
    items: [
      {
        id: "avo-toast",
        name: "Тост с авокадо",
        description: "Сордо, томаты черри, чили-масло, фета.",
        price: 4200,
        tags: ["вегетарианское"],
      },
      {
        id: "eggs-benny",
        name: "Яйца Бенедикт",
        description: "Яйца пашот, индейка, соус голландез, бриошь.",
        price: 4600,
        tags: ["любимое"],
      },
      {
        id: "shakshuka",
        name: "Шакшука",
        description: "Томатное рагу, запеченные яйца, зелень, теплая пита.",
        price: 4400,
      },
    ],
  },
  {
    id: "dessert",
    name: "Десерты",
    items: [
      {
        id: "cheesecake",
        name: "Запеченный чизкейк",
        description: "Нежный сливочный, ваниль, ягодный соус.",
        price: 3200,
      },
      {
        id: "tiramisu",
        name: "Тирамису",
        description: "Савоярди в эспрессо, маскарпоне, какао.",
        price: 3400,
        tags: ["для любителей кофе"],
      },
      {
        id: "gelato",
        name: "Аффогато-джелато",
        description: "Ванильное джелато с горячим эспрессо.",
        price: 2500,
        badge: "Новинка",
      },
    ],
  },
];
