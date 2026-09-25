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
    title: 'Shaharlararo taksi',
    icon: '🚕',
    items: [], // Заполним позже
  },
    {
    title: 'Shahar taksi',
    icon: '🚕',
    items: [],
  },
   {
    title: 'Avtobus',
    icon: '🚌',
    items: [
      {
        name: 'Avtobus №1222 (Bekobod → Toshkent)',
        route: 'Bekobod — Toshkent (Kuylyuk bozori)',
        price: '25 000 so\'mgacha',
        schedule: '05:55 dan 18:00 gacha, har 60 daqiqada',
        note: 'Yo\'nalish: Sirdaryo ko\'chasi, Buyuk Ipak Yo\'li, Buka, Qorasuv, Bektemir shossesi',
      },
      {
        name: 'Avtobus №1222 (Toshkent → Bekobod)',
        route: 'Toshkent (Kuylyuk bozori) — Bekobod',
        price: '25 000 so\'mgacha',
        schedule: '05:55 dan 18:00 gacha, har 60 daqiqada',
        note: 'Qaytish reysi. Xuddi shu yo\'nalish orqali harakatlanadi',
             },
    ],
  },
  {
    title: 'Elektropoyezd',
    icon: '🚆',
    items: [
      {
        name: 'Elektropoyezd №7050 (Toshkent → Bekobod)',
        route: 'Toshkent (Markaziy vokzal) — Bekobod',
        price: '15 000 so\'m (kattalar), 9 000 so\'m (bolalar)',
        schedule: 'Toshkentdan: 18:34 da jo\'naydi, Bekobodga: 21:38 da yetib keladi',
        note: 'Konditsioner, USB-portlar, Wi-Fi, velosiped va nogironlar uchun joylar mavjud',
      },
      {
        name: 'Elektropoyezd №7049 (Bekobod → Toshkent)',
        route: 'Bekobod — Toshkent (Markaziy vokzal)',
        price: '15 000 so\'m (kattalar), 9 000 so\'m (bolalar)',
        schedule: 'Bekoboddan: 06:00 da jo\'naydi, Toshkentga: 09:16 da yetib keladi',
        note: 'Qaytish reysi. Xuddi shu qulayliklar mavjud',
      },
    ],
  },
 
];