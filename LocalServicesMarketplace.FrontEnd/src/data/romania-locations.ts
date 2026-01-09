// Romania Locations Data - 42 Județe with Cities and Coordinates

export interface City {
  name: string;
  lat: number;
  lng: number;
  population?: number;
}

export interface County {
  name: string;
  code: string;
  cities: City[];
}

export const countries: County[] = [
  {
    name: "Alba",
    code: "AB",
    cities: [
      { name: "Alba Iulia", lat: 46.0677, lng: 23.58, population: 63536 },
      { name: "Aiud", lat: 46.3086, lng: 23.7225, population: 22876 },
      { name: "Blaj", lat: 46.1753, lng: 23.9147, population: 17265 },
      { name: "Sebeș", lat: 45.9597, lng: 23.5697, population: 28228 },
      { name: "Cugir", lat: 45.8333, lng: 23.3667, population: 21376 },
    ],
  },
  {
    name: "Arad",
    code: "AR",
    cities: [
      { name: "Arad", lat: 46.1866, lng: 21.3123, population: 159074 },
      { name: "Lipova", lat: 46.0917, lng: 21.6942, population: 10126 },
      { name: "Ineu", lat: 46.4258, lng: 21.8372, population: 9369 },
      { name: "Pecica", lat: 46.1667, lng: 21.0667, population: 12560 },
      { name: "Curtici", lat: 46.35, lng: 21.3, population: 8325 },
    ],
  },
  {
    name: "Argeș",
    code: "AG",
    cities: [
      { name: "Pitești", lat: 44.8565, lng: 24.8692, population: 155383 },
      { name: "Câmpulung", lat: 45.2692, lng: 25.0461, population: 32425 },
      {
        name: "Curtea de Argeș",
        lat: 45.1397,
        lng: 24.6797,
        population: 27823,
      },
      { name: "Mioveni", lat: 44.95, lng: 24.9333, population: 31998 },
      { name: "Costești", lat: 44.6667, lng: 24.8833, population: 10556 },
    ],
  },
  {
    name: "Bacău",
    code: "BC",
    cities: [
      { name: "Bacău", lat: 46.567, lng: 26.9146, population: 144307 },
      { name: "Onești", lat: 46.25, lng: 26.75, population: 40686 },
      { name: "Moinești", lat: 46.4667, lng: 26.4833, population: 21978 },
      { name: "Comănești", lat: 46.4167, lng: 26.45, population: 20276 },
      { name: "Buhuși", lat: 46.7167, lng: 26.7, population: 17123 },
    ],
  },
  {
    name: "Bihor",
    code: "BH",
    cities: [
      { name: "Oradea", lat: 47.0458, lng: 21.9183, population: 196367 },
      { name: "Salonta", lat: 46.8, lng: 21.65, population: 17735 },
      { name: "Marghita", lat: 47.35, lng: 22.3333, population: 15770 },
      { name: "Beiuș", lat: 46.6667, lng: 22.35, population: 10667 },
      { name: "Aleșd", lat: 47.0667, lng: 22.4, population: 9536 },
    ],
  },
  {
    name: "Bistrița-Năsăud",
    code: "BN",
    cities: [
      { name: "Bistrița", lat: 47.1333, lng: 24.5, population: 70493 },
      { name: "Năsăud", lat: 47.2833, lng: 24.4, population: 10621 },
      { name: "Beclean", lat: 47.1833, lng: 24.1833, population: 11341 },
      { name: "Sângeorz-Băi", lat: 47.3667, lng: 24.6667, population: 9530 },
    ],
  },
  {
    name: "Botoșani",
    code: "BT",
    cities: [
      { name: "Botoșani", lat: 47.7486, lng: 26.6694, population: 106847 },
      { name: "Dorohoi", lat: 47.95, lng: 26.4, population: 28158 },
      { name: "Darabani", lat: 48.1833, lng: 26.6, population: 10578 },
      { name: "Săveni", lat: 47.95, lng: 26.85, population: 7894 },
    ],
  },
  {
    name: "Brașov",
    code: "BV",
    cities: [
      { name: "Brașov", lat: 45.6427, lng: 25.5887, population: 253200 },
      { name: "Făgăraș", lat: 45.85, lng: 24.9667, population: 30714 },
      { name: "Săcele", lat: 45.6167, lng: 25.7, population: 28035 },
      { name: "Codlea", lat: 45.7, lng: 25.45, population: 21708 },
      { name: "Zărnești", lat: 45.5667, lng: 25.3333, population: 22477 },
      { name: "Râșnov", lat: 45.5833, lng: 25.4667, population: 15022 },
    ],
  },
  {
    name: "Brăila",
    code: "BR",
    cities: [
      { name: "Brăila", lat: 45.2692, lng: 27.9575, population: 180302 },
      { name: "Ianca", lat: 45.1333, lng: 27.4667, population: 11290 },
      { name: "Însurăței", lat: 45.0167, lng: 27.6, population: 6652 },
      { name: "Făurei", lat: 45.0833, lng: 27.2667, population: 5034 },
    ],
  },
  {
    name: "București",
    code: "B",
    cities: [
      { name: "București", lat: 44.4268, lng: 26.1025, population: 1883425 },
      { name: "Sector 1", lat: 44.4667, lng: 26.0667, population: 227116 },
      { name: "Sector 2", lat: 44.45, lng: 26.1333, population: 357338 },
      { name: "Sector 3", lat: 44.4167, lng: 26.15, population: 432156 },
      { name: "Sector 4", lat: 44.4, lng: 26.1, population: 304165 },
      { name: "Sector 5", lat: 44.4, lng: 26.0667, population: 288325 },
      { name: "Sector 6", lat: 44.4333, lng: 26.0333, population: 374335 },
    ],
  },
  {
    name: "Buzău",
    code: "BZ",
    cities: [
      { name: "Buzău", lat: 45.15, lng: 26.8167, population: 115494 },
      { name: "Râmnicu Sărat", lat: 45.3833, lng: 27.05, population: 33843 },
      { name: "Nehoiu", lat: 45.4167, lng: 26.3, population: 10764 },
      { name: "Pogoanele", lat: 45.0, lng: 27.05, population: 6756 },
    ],
  },
  {
    name: "Caraș-Severin",
    code: "CS",
    cities: [
      { name: "Reșița", lat: 45.3, lng: 21.8833, population: 73282 },
      { name: "Caransebeș", lat: 45.4167, lng: 22.2167, population: 25456 },
      { name: "Bocșa", lat: 45.3667, lng: 21.7167, population: 14785 },
      { name: "Oravița", lat: 45.0333, lng: 21.6833, population: 12015 },
      { name: "Moldova Nouă", lat: 44.7333, lng: 21.6667, population: 12350 },
    ],
  },
  {
    name: "Călărași",
    code: "CL",
    cities: [
      { name: "Călărași", lat: 44.2, lng: 27.3333, population: 65181 },
      { name: "Oltenița", lat: 44.0833, lng: 26.6333, population: 24822 },
      { name: "Budești", lat: 44.0833, lng: 26.5333, population: 9885 },
      { name: "Fundulea", lat: 44.45, lng: 26.5167, population: 6320 },
    ],
  },
  {
    name: "Cluj",
    code: "CJ",
    cities: [
      { name: "Cluj-Napoca", lat: 46.7712, lng: 23.6236, population: 324576 },
      { name: "Turda", lat: 46.5667, lng: 23.7833, population: 47744 },
      { name: "Dej", lat: 47.15, lng: 23.8833, population: 33497 },
      { name: "Câmpia Turzii", lat: 46.55, lng: 23.8833, population: 25078 },
      { name: "Gherla", lat: 47.0333, lng: 23.9167, population: 18566 },
      { name: "Huedin", lat: 46.8667, lng: 23.05, population: 9346 },
    ],
  },
  {
    name: "Constanța",
    code: "CT",
    cities: [
      { name: "Constanța", lat: 44.1598, lng: 28.6348, population: 283872 },
      { name: "Mangalia", lat: 43.8, lng: 28.5833, population: 36364 },
      { name: "Medgidia", lat: 44.25, lng: 28.2667, population: 39727 },
      { name: "Năvodari", lat: 44.3167, lng: 28.6167, population: 34669 },
      { name: "Cernavodă", lat: 44.35, lng: 28.0333, population: 17127 },
      { name: "Eforie", lat: 44.05, lng: 28.6333, population: 10247 },
    ],
  },
  {
    name: "Covasna",
    code: "CV",
    cities: [
      {
        name: "Sfântu Gheorghe",
        lat: 45.8667,
        lng: 25.7833,
        population: 56006,
      },
      { name: "Târgu Secuiesc", lat: 46.0, lng: 26.1333, population: 18491 },
      { name: "Covasna", lat: 45.85, lng: 26.1833, population: 10476 },
      {
        name: "Întorsura Buzăului",
        lat: 45.6667,
        lng: 26.0333,
        population: 8813,
      },
    ],
  },
  {
    name: "Dâmbovița",
    code: "DB",
    cities: [
      { name: "Târgoviște", lat: 44.9333, lng: 25.45, population: 73724 },
      { name: "Moreni", lat: 44.9833, lng: 25.65, population: 19033 },
      { name: "Pucioasa", lat: 45.0667, lng: 25.4333, population: 14233 },
      { name: "Găești", lat: 44.7167, lng: 25.3167, population: 13904 },
      { name: "Titu", lat: 44.65, lng: 25.5667, population: 9479 },
    ],
  },
  {
    name: "Dolj",
    code: "DJ",
    cities: [
      { name: "Craiova", lat: 44.3302, lng: 23.7949, population: 269506 },
      { name: "Băilești", lat: 44.0333, lng: 23.35, population: 18633 },
      { name: "Calafat", lat: 43.9833, lng: 22.9333, population: 16792 },
      { name: "Filiași", lat: 44.5667, lng: 23.5167, population: 16922 },
      { name: "Segarcea", lat: 44.0833, lng: 23.75, population: 7543 },
    ],
  },
  {
    name: "Galați",
    code: "GL",
    cities: [
      { name: "Galați", lat: 45.4353, lng: 28.008, population: 249432 },
      { name: "Tecuci", lat: 45.85, lng: 27.4333, population: 34871 },
      { name: "Târgu Bujor", lat: 45.8667, lng: 27.9167, population: 6834 },
      { name: "Berești", lat: 45.8667, lng: 27.5333, population: 5071 },
    ],
  },
  {
    name: "Giurgiu",
    code: "GR",
    cities: [
      { name: "Giurgiu", lat: 43.9037, lng: 25.9699, population: 61353 },
      { name: "Bolintin-Vale", lat: 44.4333, lng: 25.7667, population: 11259 },
      { name: "Mihăilești", lat: 44.3167, lng: 25.9333, population: 6578 },
    ],
  },
  {
    name: "Gorj",
    code: "GJ",
    cities: [
      { name: "Târgu Jiu", lat: 45.05, lng: 23.2833, population: 82504 },
      { name: "Motru", lat: 44.8, lng: 22.9667, population: 20600 },
      { name: "Rovinari", lat: 44.9167, lng: 23.1667, population: 11816 },
      { name: "Bumbești-Jiu", lat: 45.1667, lng: 23.3833, population: 9451 },
      { name: "Țicleni", lat: 44.8167, lng: 23.0667, population: 4693 },
    ],
  },
  {
    name: "Harghita",
    code: "HR",
    cities: [
      { name: "Miercurea Ciuc", lat: 46.35, lng: 25.8, population: 37980 },
      { name: "Odorheiu Secuiesc", lat: 46.3, lng: 25.3, population: 34257 },
      { name: "Gheorgheni", lat: 46.7167, lng: 25.5833, population: 17634 },
      { name: "Toplița", lat: 46.9167, lng: 25.3333, population: 13379 },
      { name: "Cristuru Secuiesc", lat: 46.2833, lng: 25.05, population: 9672 },
    ],
  },
  {
    name: "Hunedoara",
    code: "HD",
    cities: [
      { name: "Deva", lat: 45.8833, lng: 22.9, population: 61123 },
      { name: "Hunedoara", lat: 45.75, lng: 22.9167, population: 60525 },
      { name: "Petroșani", lat: 45.4167, lng: 23.3667, population: 37160 },
      { name: "Lupeni", lat: 45.35, lng: 23.2333, population: 23390 },
      { name: "Vulcan", lat: 45.3833, lng: 23.2667, population: 24160 },
      { name: "Orăștie", lat: 45.8333, lng: 23.2, population: 19940 },
      { name: "Brad", lat: 46.1333, lng: 22.7833, population: 14495 },
    ],
  },
  {
    name: "Ialomița",
    code: "IL",
    cities: [
      { name: "Slobozia", lat: 44.5667, lng: 27.3667, population: 45891 },
      { name: "Fetești", lat: 44.3833, lng: 27.8333, population: 30376 },
      { name: "Urziceni", lat: 44.7167, lng: 26.6333, population: 14350 },
      { name: "Țăndărei", lat: 44.6333, lng: 27.65, population: 12295 },
      { name: "Amara", lat: 44.6167, lng: 27.3167, population: 7424 },
    ],
  },
  {
    name: "Iași",
    code: "IS",
    cities: [
      { name: "Iași", lat: 47.1585, lng: 27.6014, population: 290422 },
      { name: "Pașcani", lat: 47.25, lng: 26.7167, population: 32304 },
      { name: "Târgu Frumos", lat: 47.2167, lng: 27.0, population: 11002 },
      { name: "Hârlău", lat: 47.4333, lng: 26.9167, population: 10211 },
      { name: "Podu Iloaiei", lat: 47.2167, lng: 27.2667, population: 9991 },
    ],
  },
  {
    name: "Ilfov",
    code: "IF",
    cities: [
      { name: "Buftea", lat: 44.5667, lng: 25.95, population: 22178 },
      { name: "Voluntari", lat: 44.4833, lng: 26.1833, population: 42944 },
      { name: "Pantelimon", lat: 44.45, lng: 26.2, population: 25596 },
      {
        name: "Popești-Leordeni",
        lat: 44.3833,
        lng: 26.1667,
        population: 28585,
      },
      { name: "Bragadiru", lat: 44.3833, lng: 26.0, population: 18363 },
      { name: "Chitila", lat: 44.5, lng: 26.0, population: 13499 },
      { name: "Otopeni", lat: 44.55, lng: 26.0667, population: 14215 },
    ],
  },
  {
    name: "Maramureș",
    code: "MM",
    cities: [
      { name: "Baia Mare", lat: 47.6567, lng: 23.585, population: 123738 },
      {
        name: "Sighetu Marmației",
        lat: 47.9333,
        lng: 23.8833,
        population: 37640,
      },
      { name: "Borșa", lat: 47.65, lng: 24.6667, population: 26360 },
      { name: "Vișeu de Sus", lat: 47.7167, lng: 24.4333, population: 15544 },
      { name: "Târgu Lăpuș", lat: 47.45, lng: 23.8667, population: 12297 },
      { name: "Seini", lat: 47.75, lng: 23.2833, population: 9578 },
    ],
  },
  {
    name: "Mehedinți",
    code: "MH",
    cities: [
      {
        name: "Drobeta-Turnu Severin",
        lat: 44.6333,
        lng: 22.6667,
        population: 92617,
      },
      { name: "Orșova", lat: 44.7167, lng: 22.4, population: 10441 },
      { name: "Strehaia", lat: 44.6167, lng: 23.1833, population: 10088 },
      { name: "Vânju Mare", lat: 44.4167, lng: 22.8667, population: 5321 },
    ],
  },
  {
    name: "Mureș",
    code: "MS",
    cities: [
      { name: "Târgu Mureș", lat: 46.5456, lng: 24.5625, population: 134290 },
      { name: "Reghin", lat: 46.7833, lng: 24.7167, population: 33281 },
      { name: "Sighișoara", lat: 46.2167, lng: 24.7833, population: 28102 },
      { name: "Târnăveni", lat: 46.3333, lng: 24.2833, population: 22075 },
      { name: "Luduș", lat: 46.4667, lng: 24.0833, population: 14585 },
      { name: "Sovata", lat: 46.6, lng: 25.0667, population: 10385 },
    ],
  },
  {
    name: "Neamț",
    code: "NT",
    cities: [
      { name: "Piatra Neamț", lat: 46.9333, lng: 26.3667, population: 85055 },
      { name: "Roman", lat: 46.9167, lng: 26.9333, population: 50713 },
      { name: "Târgu Neamț", lat: 47.2, lng: 26.3667, population: 18695 },
      { name: "Bicaz", lat: 46.8, lng: 25.8, population: 7661 },
      { name: "Roznov", lat: 46.8333, lng: 26.5, population: 8848 },
    ],
  },
  {
    name: "Olt",
    code: "OT",
    cities: [
      { name: "Slatina", lat: 44.4333, lng: 24.3667, population: 70293 },
      { name: "Caracal", lat: 44.1167, lng: 24.35, population: 30954 },
      { name: "Balș", lat: 44.35, lng: 24.1, population: 18822 },
      { name: "Corabia", lat: 43.7667, lng: 24.5, population: 16631 },
      { name: "Scornicești", lat: 44.5667, lng: 24.55, population: 11355 },
    ],
  },
  {
    name: "Prahova",
    code: "PH",
    cities: [
      { name: "Ploiești", lat: 44.95, lng: 26.0333, population: 197542 },
      { name: "Câmpina", lat: 45.1333, lng: 25.7333, population: 32901 },
      { name: "Băicoi", lat: 45.0333, lng: 25.8833, population: 18032 },
      { name: "Breaza", lat: 45.1833, lng: 25.6667, population: 16075 },
      { name: "Sinaia", lat: 45.35, lng: 25.55, population: 11117 },
      { name: "Bușteni", lat: 45.4167, lng: 25.5333, population: 9781 },
      { name: "Azuga", lat: 45.45, lng: 25.5833, population: 4686 },
      { name: "Comarnic", lat: 45.25, lng: 25.6333, population: 12110 },
      {
        name: "Vălenii de Munte",
        lat: 45.1833,
        lng: 26.0333,
        population: 11340,
      },
    ],
  },
  {
    name: "Satu Mare",
    code: "SM",
    cities: [
      { name: "Satu Mare", lat: 47.7833, lng: 22.8833, population: 102411 },
      { name: "Carei", lat: 47.6833, lng: 22.4667, population: 21112 },
      { name: "Negrești-Oaș", lat: 47.8667, lng: 23.4167, population: 13469 },
      { name: "Tășnad", lat: 47.4667, lng: 22.5833, population: 7998 },
      { name: "Livada", lat: 47.85, lng: 23.1333, population: 7324 },
    ],
  },
  {
    name: "Sălaj",
    code: "SJ",
    cities: [
      { name: "Zalău", lat: 47.1833, lng: 23.05, population: 56202 },
      { name: "Șimleu Silvaniei", lat: 47.2333, lng: 22.8, population: 13974 },
      { name: "Jibou", lat: 47.25, lng: 23.25, population: 10407 },
      { name: "Cehu Silvaniei", lat: 47.4167, lng: 23.1833, population: 7412 },
    ],
  },
  {
    name: "Sibiu",
    code: "SB",
    cities: [
      { name: "Sibiu", lat: 45.7928, lng: 24.1519, population: 147245 },
      { name: "Mediaș", lat: 46.1667, lng: 24.35, population: 44196 },
      { name: "Cisnădie", lat: 45.7167, lng: 24.15, population: 15232 },
      { name: "Avrig", lat: 45.7, lng: 24.3833, population: 14019 },
      { name: "Dumbrăveni", lat: 46.2333, lng: 24.5667, population: 7821 },
      { name: "Agnita", lat: 45.9833, lng: 24.6167, population: 9563 },
      { name: "Tălmaciu", lat: 45.6667, lng: 24.2667, population: 8076 },
    ],
  },
  {
    name: "Suceava",
    code: "SV",
    cities: [
      { name: "Suceava", lat: 47.6514, lng: 26.2556, population: 92121 },
      { name: "Fălticeni", lat: 47.4667, lng: 26.3, population: 26533 },
      { name: "Rădăuți", lat: 47.85, lng: 25.9167, population: 23822 },
      {
        name: "Câmpulung Moldovenesc",
        lat: 47.5333,
        lng: 25.55,
        population: 17329,
      },
      { name: "Vatra Dornei", lat: 47.35, lng: 25.3667, population: 14518 },
      { name: "Gura Humorului", lat: 47.55, lng: 25.8833, population: 12677 },
      { name: "Siret", lat: 47.95, lng: 26.0667, population: 7976 },
    ],
  },
  {
    name: "Teleorman",
    code: "TR",
    cities: [
      { name: "Alexandria", lat: 43.9833, lng: 25.3333, population: 45434 },
      { name: "Roșiorii de Vede", lat: 44.1, lng: 24.9833, population: 27416 },
      { name: "Turnu Măgurele", lat: 43.75, lng: 24.8667, population: 24772 },
      { name: "Zimnicea", lat: 43.65, lng: 25.3667, population: 13742 },
      { name: "Videle", lat: 44.2833, lng: 25.5333, population: 11395 },
    ],
  },
  {
    name: "Timiș",
    code: "TM",
    cities: [
      { name: "Timișoara", lat: 45.7489, lng: 21.2087, population: 319279 },
      { name: "Lugoj", lat: 45.6833, lng: 21.9, population: 40361 },
      {
        name: "Sânnicolau Mare",
        lat: 46.0667,
        lng: 20.6333,
        population: 12312,
      },
      { name: "Jimbolia", lat: 45.7833, lng: 20.7167, population: 10686 },
      { name: "Deta", lat: 45.4, lng: 21.2167, population: 5729 },
      { name: "Făget", lat: 45.85, lng: 22.1667, population: 6935 },
      { name: "Buziaș", lat: 45.65, lng: 21.6, population: 7463 },
      { name: "Recaș", lat: 45.8, lng: 21.5333, population: 9238 },
    ],
  },
  {
    name: "Tulcea",
    code: "TL",
    cities: [
      { name: "Tulcea", lat: 45.1667, lng: 28.8, population: 73707 },
      { name: "Babadag", lat: 44.9, lng: 28.7167, population: 9587 },
      { name: "Măcin", lat: 45.25, lng: 28.1333, population: 9281 },
      { name: "Isaccea", lat: 45.2667, lng: 28.4667, population: 5069 },
      { name: "Sulina", lat: 45.15, lng: 29.6667, population: 3663 },
    ],
  },
  {
    name: "Vaslui",
    code: "VS",
    cities: [
      { name: "Vaslui", lat: 46.6333, lng: 27.7333, population: 55407 },
      { name: "Bârlad", lat: 46.2333, lng: 27.6667, population: 55837 },
      { name: "Huși", lat: 46.6667, lng: 28.05, population: 26266 },
      { name: "Negrești", lat: 46.8333, lng: 27.4667, population: 9115 },
      { name: "Murgeni", lat: 46.2167, lng: 28.0167, population: 7081 },
    ],
  },
  {
    name: "Vâlcea",
    code: "VL",
    cities: [
      { name: "Râmnicu Vâlcea", lat: 45.1, lng: 24.3833, population: 98776 },
      { name: "Drăgășani", lat: 44.6667, lng: 24.25, population: 19171 },
      { name: "Băbeni", lat: 44.9333, lng: 24.2333, population: 9551 },
      { name: "Brezoi", lat: 45.3333, lng: 24.25, population: 6233 },
      { name: "Călimănești", lat: 45.2333, lng: 24.3333, population: 8127 },
      { name: "Horezu", lat: 45.15, lng: 24.0, population: 6519 },
    ],
  },
  {
    name: "Vrancea",
    code: "VN",
    cities: [
      { name: "Focșani", lat: 45.6972, lng: 27.1833, population: 79315 },
      { name: "Adjud", lat: 46.1, lng: 27.1667, population: 17862 },
      { name: "Mărășești", lat: 45.8833, lng: 27.2333, population: 10630 },
      { name: "Panciu", lat: 45.9167, lng: 27.1, population: 7866 },
      { name: "Odobești", lat: 45.7667, lng: 27.05, population: 7830 },
    ],
  },
];

// Helper functions
export const getAllCities = (): City[] => {
  return countries.flatMap((county) => county.cities);
};

export const getCitiesByCounty = (countyName: string): City[] => {
  const county = countries.find((c) => c.name === countyName);
  return county?.cities || [];
};

export const findCity = (
  cityName: string
): { city: City; county: County } | null => {
  for (const county of countries) {
    const city = county.cities.find((c) => c.name === cityName);
    if (city) {
      return { city, county };
    }
  }
  return null;
};

export const countyNames = countries.map((c) => c.name);

export const countyCodeMap = Object.fromEntries(
  countries.map((c) => [c.name, c.code])
);
