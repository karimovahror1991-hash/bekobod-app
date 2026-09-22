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
      { name: "O'zbektelekom", phone: '71-1005111', address: 'Bekobod uchastkasi' },
    ],
  },
  {
    title: 'Banklar',
    icon: '🏦',
    contacts: [
      { name: 'MI B (Ipoteka Bank)', phone: '78 1501122', address: 'Salomatlik ko\'chasi, 1-uy' },
      { name: 'Xalq banki', phone: '+998 71 210 20 02', address: "Buyuk Ipak Yo'li, 1-A" },
    ],
  },
  {
    title: 'Soliq va boshqa xizmatlar',
    icon: '🏢',
    contacts: [
      { name: 'Soliq inspeksiyasi', phone: '', address: "Istiqlol ko'chasi, 40-uy" },
    ],
  },
];