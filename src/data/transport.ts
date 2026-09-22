export interface TransportItem {
  name: string;
  route: string;
  price: string;
  schedule: string;
  note?: string;
}

export interface TransportCategory {
  title: string;
  icon: string;
  items: TransportItem[];
}

export const transport: TransportCategory[] = [
  {
    title: 'Avtobus',
    icon: '🚌',
    items: [
      {
        name: 'Avtobus №1222',
        route: 'Bekobod — Toshkent (Kuylyuk bozori)',
        price: '25 000 so\'mgacha',
        schedule: '05:55 dan 18:00 gacha, har 60 daqiqada',
        note: 'Yo\'nalish: Sirdaryo ko\'chasi, Buyuk Ipak Yo\'li, Buka, Qorasuv, Bektemir shossesi',
      },
    ],
  },
  {
    title: 'Elektropoyezd',
    icon: '🚆',
    items: [
      {
        name: 'Elektropoyezd №7050/7049',
        route: 'Bekobod — Toshkent (Markaziy vokzal)',
        price: '15 000 so\'m (kattalar), 9 000 so\'m (bolalar)',
        schedule: 'Bekoboddan: 06:00 da jo\'naydi, Toshkentga: 09:16 da yetib keladi',
        note: 'Konditsioner, USB-portlar, Wi-Fi, velosiped va nogironlar uchun joylar mavjud',
      },
    ],
  },
  {
    title: 'Taksi Bekobod — Toshkent',
    icon: '🚕',
    items: [], // Заполним позже
  },
];