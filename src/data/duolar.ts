export interface Dua {
  id: string;
  title: string;
  transcription: string;
  translation: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  duas: Dua[];
}

export const duolar: DuaCategory[] = [
  {
    id: 'ovqat',
    title: 'Ovqatdan oldin/keyin',
    icon: '🍽',
    gradient: 'from-amber-500 to-orange-600',
    duas: [
      {
        id: 'ovqat-oldin',
        title: 'Ovqatdan oldin',
        transcription: 'Bismillahi va ala barakatillah',
        translation: 'Alloh nomi bilan va Allohning barakasi bilan boshlayman',
      },
      {
        id: 'ovqat-keyin',
        title: 'Ovqatdan keyin',
        transcription: 'Alhamdulillahillazi at\'amana va saqona va ja\'alana minal muslimin',
        translation: 'Bizni ovqatlantirgan, sug\'organ va musulmonlardan qilgan Allohga hamd bo\'lsin',
      },
    ],
  },
  {
    id: 'uxlash',
    title: 'Uxlashdan oldin',
    icon: '🛏',
    gradient: 'from-indigo-500 to-purple-600',
    duas: [
      {
        id: 'uxlash-dua',
        title: 'Uxlashdan oldin',
        transcription: 'Bismika Allohumma amutu va ahya',
        translation: 'Allohim, Sening noming bilan o\'laman va tirilaman',
      },
    ],
  },
  {
    id: 'safar',
    title: 'Safarda',
    icon: '🚗',
    gradient: 'from-blue-500 to-cyan-600',
    duas: [
      {
        id: 'safar-dua',
        title: 'Safarga chiqishda',
        transcription: 'Subhanallazi sahhara lana haza va ma kunna lahu muqrinin, va inna ila Rabbina lamunqalibun',
        translation: 'Buni bizga bo\'ysundirgan Zot pokdir. Biz bunga qodir emas edik. Va albatta, biz Rabbimizga qaytuvchimiz',
      },
    ],
  },
  {
    id: 'uydan',
    title: 'Uydan chiqishda',
    icon: '🏠',
    gradient: 'from-emerald-500 to-teal-600',
    duas: [
      {
        id: 'uydan-dua',
        title: 'Uydan chiqishda',
        transcription: 'Bismillahi, tavakkaltu alallahi, va la havla va la quvvata illa billah',
        translation: 'Alloh nomi bilan chiqaman, Allohga tavakkul qildim. Allohdan boshqa kuch va quvvat yo\'q',
      },
    ],
  },
  {
    id: 'umumiy',
    title: 'Umumiy duolar',
    icon: '🤲',
    gradient: 'from-rose-500 to-pink-600',
    duas: [
      {
        id: 'umumiy-1',
        title: 'Yaxshilik so\'rash',
        transcription: 'Rabbana atina fid-dunya hasanatan va fil-axirati hasanatan va qina azaban-nar',
        translation: 'Rabbimiz, bizga dunyoda ham yaxshilik ber, oxiratda ham yaxshilik ber va bizni do\'zax azobidan saqla',
      },
      {
        id: 'umumiy-2',
        title: 'Ilm so\'rash',
        transcription: 'Rabbim zidni ilma',
        translation: 'Rabbim, ilmimni ziyoda qil',
      },
    ],
  },
  {
    id: 'zikrlar',
    title: 'Zikrlar',
    icon: '📿',
    gradient: 'from-violet-500 to-indigo-600',
    duas: [
      {
        id: 'zikr-1',
        title: 'Subhanallah',
        transcription: 'Subhanallah',
        translation: 'Alloh pokdir',
      },
      {
        id: 'zikr-2',
        title: 'Alhamdulillah',
        transcription: 'Alhamdulillah',
        translation: 'Allohga hamd bo\'lsin',
      },
      {
        id: 'zikr-3',
        title: 'Allahu Akbar',
        transcription: 'Allahu Akbar',
        translation: 'Alloh eng buyukdir',
      },
      {
        id: 'zikr-4',
        title: 'La ilaha illallah',
        transcription: 'La ilaha illallah',
        translation: 'Allohdan boshqa iloh yo\'q',
      },
    ],
  },
];