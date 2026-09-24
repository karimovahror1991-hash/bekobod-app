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
        transcription: "Alhamdulillahillazi at'amana va saqona va ja'alana minal muslimin",
        translation: "Bizni ovqatlantirgan, sug'organ va musulmonlardan qilgan Allohga hamd bo'lsin",
      },
    ],
  },
  {
    id: 'uxlash',
    title: 'Uxlash va uyg\'onish',
    icon: '🛏',
    gradient: 'from-indigo-500 to-purple-600',
    duas: [
      {
        id: 'uxlash-dua',
        title: 'Uxlashdan oldin',
        transcription: 'Bismika Allohumma amutu va ahya',
        translation: "Allohim, Sening noming bilan o'laman va tirilaman",
      },
      {
        id: 'uyg-onish',
        title: 'Uyg\'ongandan keyin',
        transcription: 'Alhamdulillahillazi ahyana ba\'da ma amatana va ilayhin-nushur',
        translation: "Bizni o'ldirgandan keyin tiriltirgan Allohga hamd bo'lsin. Qaytish faqat Unga",
      },
    ],
  },
  {
    id: 'uydan',
    title: 'Uydan chiqish/kirish',
    icon: '🏠',
    gradient: 'from-emerald-500 to-teal-600',
    duas: [
      {
        id: 'uydan-chiqish',
        title: 'Uydan chiqishda',
        transcription: 'Bismillahi, tavakkaltu alallahi, va la havla va la quvvata illa billah',
        translation: "Alloh nomi bilan chiqaman, Allohga tavakkul qildim. Allohdan boshqa kuch va quvvat yo'q",
      },
      {
        id: 'uyga-kirish',
        title: 'Uyga kirishda',
        transcription: 'Allohumma inni as\'aluka xayral-mavlaj va xayral-maxraj',
        translation: "Allohim, men Sendan yaxshi kirish va yaxshi chiqishni so'rayman",
      },
    ],
  },
  {
    id: 'safar',
    title: 'Safar va transport',
    icon: '🚗',
    gradient: 'from-blue-500 to-cyan-600',
    duas: [
      {
        id: 'safar-dua',
        title: 'Safarga chiqishda',
        transcription: 'Subhanallazi sahhara lana haza va ma kunna lahu muqrinin, va inna ila Rabbina lamunqalibun',
        translation: "Buni bizga bo'ysundirgan Zot pokdir. Biz bunga qodir emas edik. Va albatta, biz Rabbimizga qaytuvchimiz",
      },
      {
        id: 'transport-dua',
        title: 'Transportga chiqishda',
        transcription: 'Bismillahi, alhamdulillah. Subhanallazi sahhara lana haza',
        translation: "Alloh nomi bilan, Allohga hamd bo'lsin. Buni bizga bo'ysundirgan Zot pokdir",
      },
    ],
  },
  {
    id: 'masjid',
    title: 'Masjid',
    icon: '🕌',
    gradient: 'from-emerald-600 to-green-700',
    duas: [
      {
        id: 'masjid-kirish',
        title: 'Masjidga kirishda',
        transcription: 'Allohumma-ftah li abvaba rahmatik',
        translation: "Allohim, menga rahmat eshiklarini och",
      },
      {
        id: 'masjid-chiqish',
        title: 'Masjiddan chiqishda',
        transcription: 'Allohumma inni as\'aluka min fadlik',
        translation: "Allohim, men Sendan fazlingni so'rayman",
      },
    ],
  },
  {
    id: 'hojatxona',
    title: 'Hojatxona',
    icon: '🚽',
    gradient: 'from-stone-500 to-stone-700',
    duas: [
      {
        id: 'hojatxona-kirish',
        title: 'Hojatxonaga kirishda',
        transcription: 'Allohumma inni a\'uzu bika minal-xubsi val-xabais',
        translation: "Allohim, men Sendan yomon va nopok narsalardan panoh so'rayman",
      },
      {
        id: 'hojatxona-chiqish',
        title: 'Hojatxonadan chiqishda',
        transcription: 'Gufronak',
        translation: "Allohim, meni kechir",
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
        translation: "Rabbimiz, bizga dunyoda ham yaxshilik ber, oxiratda ham yaxshilik ber va bizni do'zax azobidan saqla",
      },
      {
        id: 'umumiy-2',
        title: 'Ilm so\'rash',
        transcription: 'Rabbim zidni ilma',
        translation: "Rabbim, ilmimni ziyoda qil",
      },
      {
        id: 'umumiy-3',
        title: 'Ota-ona uchun',
        transcription: 'Rabbirhamhuma kama rabbayani sagira',
        translation: "Rabbim, ularni (ota-onamni) kichikligimda tarbiyalaganlaridek rahm qil",
      },
      {
        id: 'umumiy-4',
        title: 'Qayg\'u paytida',
        transcription: 'La ilaha illallahul-azimul-halim, la ilaha illallahu Rabbul-arshil-azim',
        translation: "Buyuk va Halim Allohdan boshqa iloh yo'q. Ulug' arshning Rabbi Allohdan boshqa iloh yo'q",
      },
      {
        id: 'umumiy-5',
        title: 'Tavba va istig\'for',
        transcription: 'Rabbanag\'fir li va li validayya va lil-mu\'minina yavma yaqumul-hisab',
        translation: "Rabbim, meni, ota-onamni va mo'minlarni hisob kuni kechir",
      },
      {
        id: 'umumiy-6',
        title: 'Sog\'liq va shifo',
        transcription: 'Allohumma inni as\'alukal-afiyata fid-dunya val-axira',
        translation: "Allohim, men Sendan dunyo va oxiratda sog'liq so'rayman",
      },
      {
        id: 'umumiy-7',
        title: 'Rizq va baraka',
        transcription: 'Allohumma inni as\'aluka ilman nafi\'an va rizqan tayyiban va amalan mutaqabbalan',
        translation: "Allohim, men Sendan foydali ilm, halol rizq va qabul qilinadigan amal so'rayman",
      },
      {
        id: 'umumiy-8',
        title: 'QalbnING pokligi',
        transcription: 'Allohumma tahhir qalbi minan-nifaqi val-kibri val-hasad',
        translation: "Allohim, qalbimni munofiqlik, kibr va hasaddan pokla",
      },
      {
        id: 'umumiy-9',
        title: 'Jannat so\'rash',
        transcription: 'Allohumma inni as\'alukal-jannata va a\'uzu bika minan-nar',
        translation: "Allohim, men Sendan jannatni so'rayman va do'zaxdan panoh tilayman",
      },
      {
        id: 'umumiy-10',
        title: 'Yaxshi xulq',
        transcription: 'Allohumma hassin xuluqi kama hassanta xalqi',
        translation: "Allohim, xulqimni ham go'zallashtir, xuddi tashqi ko'rinishimni go'zallashtirganingdek",
      },
      {
        id: 'umumiy-11',
        title: 'Qarz va qiyinchilikdan panoh',
        transcription: 'Allohumma inni a\'uzu bika minal-hammi val-hazan, val-ajzi val-kasal, val-buxli val-jubn, va dala\'id-dayni va qahrir-rijal',
        translation: "Allohim, men Sendan g'am-g'ussa, ojizlik, dangasalik, baxillik, qo'rqoqlik, qarz og'irligi va odamlarning zo'ravonligidan panoh so'rayman",
      },
      {
        id: 'umumiy-12',
        title: 'Barcha yaxshiliklar uchun',
        transcription: 'Allohumma inni as\'alukal-huda vat-tuqa val-afafa val-g\'ina',
        translation: "Allohim, men Sendan hidoyat, taqvo, iffat va boylik so'rayman",
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
        translation: "Allohga hamd bo'lsin",
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
        translation: "Allohdan boshqa iloh yo'q",
      },
      {
        id: 'zikr-5',
        title: 'Astagfirullah',
        transcription: 'Astagfirullah',
        translation: "Allohdan kechirim so'rayman",
      },
      {
        id: 'zikr-6',
        title: 'La havla va la quvvata illa billah',
        transcription: 'La havla va la quvvata illa billah',
        translation: "Allohdan boshqa kuch va quvvat yo'q",
      },
    ],
  },
  {
    id: 'tabiat',
    title: 'Tabiat hodisalari',
    icon: '🌧',
    gradient: 'from-sky-500 to-blue-600',
    duas: [
      {
        id: 'yomgir',
        title: 'Yomg\'ir yog\'ganda',
        transcription: 'Allohumma sayyiban nafi\'a',
        translation: "Allohim, bu foydali yomg'ir bo'lsin",
      },
      {
        id: 'shamоl',
        title: 'Shamol esganda',
        transcription: 'Allohumma inni as\'aluka xayraha va xayra ma ursilat bihi',
        translation: "Allohim, men Sendan uning yaxshiligini va u bilan yuborilgan narsaning yaxshiligini so'rayman",
      },
    ],
  },
  {
    id: 'ilm',
    title: 'Ilm va ta\'lim',
    icon: '📖',
    gradient: 'from-amber-600 to-yellow-600',
    duas: [
      {
        id: 'ilm-oldin',
        title: 'Ilm o\'rganishdan oldin',
        transcription: 'Rabbishrah li sadri va yassir li amri',
        translation: "Rabbim, ko'ksimni keng qil va ishimni osonlashtir",
      },
      {
        id: 'imtihon',
        title: 'Imtihondan oldin',
        transcription: 'Rabbana la tuzig qulubana ba\'da iz hadayana',
        translation: "Rabbimiz, bizni hidoyat qilgandan keyin qalblarimizni og'dirmagin",
      },
    ],
  },
];