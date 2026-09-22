export interface Contact {
  name: string;
  phone: string;
  address?: string;
}

export interface ContactCategory {
  title: string;
  icon: string;
  contacts: Contact[];
}

export const contacts: ContactCategory[] = [
  {
    title: 'Favqulodda xizmatlar',
    icon: '🚨',
    contacts: [
      { name: "Yong'in xavfsizligi", phone: '101' },
      { name: 'Politsiya', phone: '102' },
      { name: 'Tez tibbiy yordam', phone: '103' },
      { name: 'Gaz avariya xizmati', phone: '104' },
      { name: 'Qutqaruv xizmati', phone: '1050' },
    ],
  },
  {
    title: 'Hokimiyat',
    icon: '🏛️',
    contacts: [
      { name: 'Bekobod shahar hokimi', phone: '+998 71 514 77 71' },
      { name: "Birinchi o'rinbosar", phone: '+998 90 127 40 05' },
      { name: 'Qurilish va kommunal masalalar', phone: '+998 93 933 25 70' },
      { name: 'Yoshlar siyosati', phone: '+998 90 330 05 93' },
      { name: 'Investitsiyalar', phone: '+998 90 934 32 03' },
      { name: 'Oila va xotin-qizlar', phone: '+998 90 973 90 73' },
    ],
  },
  {
    title: 'Aloqa va Internet',
    icon: '📡',
    contacts: [
      { name: 'Turon Telecom', phone: '1132', address: '11-mikrotuman, 8/26' },
      { name: "O'zbektelekom", phone: '1084', address: 'Bekobod uchastkasi' },
    ],
  },
   {
    title: 'Banklar',
    icon: '🏦',
    contacts: [
      { name: 'Xalq banki', phone: '+998 71 210 20 02', address: "Buyuk Ipak Yo'li, 1-A" },
      { name: 'Uznatsbank (Tashqi iqtisodiy faoliyat milliy banki)', phone: '', address: "Peshakov ko'chasi, 22. Bank kodi: 00912" },
      { name: 'BRB (Biznesni rivojlantirish banki)', phone: '+998 71 202 66 61', address: "Birlik ko'chasi, 2. Bank kodi: 00924" },
      { name: 'Ipoteka-bank (OTP Group)', phone: '+998 78 150 11 22', address: "Salomatlik ko'chasi, 1" },
      { name: 'Ipoteka-bank (Minibank)', phone: '+998 70 913 45 96', address: "R-20, 14-mikrorayon" },
      { name: 'Xalq banki (Agrobank)', phone: '', address: "Buyuk Ipak Yo'li ko'chasi, 1A" },
      { name: 'Aloqabank', phone: '', address: '14-mikrorayon' },
      { name: 'Mikrokreditbank (Bank xizmatlari markazi)', phone: '', address: "Buyuk Ipak Yo'li ko'chasi" },
      { name: 'O\'zsanoatqurilishbank (SQB)', phone: '', address: 'Bekobod filiali' },
      { name: 'Renesans Mikromoliya Tashkiloti', phone: '', address: "Buyuk Ipak Yo'li, 337 (Nurliyo'l mahallasi)" },
      { name: 'Moment-Kredit Lombard', phone: '+998 90 962 56 02', address: "Salomatlik ko'chasi, 19-uy, 7-xonadon" },
      { name: 'Shahar lombardi', phone: '+998 70 913 47 40', address: "Buyuk Ipak Yo'li ko'chasi, 1A" },
    ],
  },
   {
    title: 'Soliq va boshqa xizmatlar',
    icon: '🏢',
    contacts: [
      { name: 'MI B (Ipoteka Bank)', phone: '+998 71 514 01 60', address: "Ibrohimov ko'chasi, 19 (3-maktab yonida, Milliy bank filiali binosi)" },
      { name: 'Soliq inspeksiyasi', phone: '+998 70 214 19 16', address: "Istiqlol ko'chasi, 40-uy (Markaziy poliklinika yonida)" },
    ],
  },
];