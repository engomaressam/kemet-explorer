// Local catalogue of the ancient sites shown in the app.
// Facts are kept short and conservative; the detail screen adds a live summary
// from Wikipedia (see src/lib/api.js). Coordinates feed the Open-Meteo weather API.

export const CATEGORIES = ['All', 'Pyramids', 'Temples', 'Tombs'];

export const SITES = [
  {
    id: 'giza-pyramids',
    year: -2600, // approximate start date, used to sort sites from oldest
    name: 'Pyramids of Giza',
    city: 'Giza',
    region: 'Cairo & Giza',
    category: 'Pyramids',
    era: 'Old Kingdom, 4th Dynasty (c. 2600-2500 BC)',
    summary:
      'Three royal pyramids built for the pharaohs Khufu, Khafre and Menkaure. The Great Pyramid is the oldest of the Seven Wonders of the Ancient World and the only one still standing.',
    highlights: [
      'Great Pyramid of Khufu: about 139 m tall today, 146 m when built',
      'Pyramid of Khafre keeps some of its original casing near the top',
      'Panoramic viewpoint over all three pyramids on the plateau',
    ],
    wiki: 'Giza_pyramid_complex',
    lat: 29.9792,
    lon: 31.1342,
  },
  {
    id: 'great-sphinx',
    year: -2500, // approximate start date, used to sort sites from oldest
    name: 'Great Sphinx of Giza',
    city: 'Giza',
    region: 'Cairo & Giza',
    category: 'Pyramids',
    era: 'Old Kingdom, 4th Dynasty (c. 2500 BC)',
    summary:
      'A colossal limestone statue with a lion\'s body and a human head, carved from the bedrock of the Giza plateau and usually attributed to the pharaoh Khafre.',
    highlights: [
      'About 73 m long and 20 m high',
      'Carved directly from the plateau\'s limestone bedrock',
      'Sits beside the valley temple of Khafre',
    ],
    wiki: 'Great_Sphinx_of_Giza',
    lat: 29.9753,
    lon: 31.1376,
  },
  {
    id: 'djoser',
    year: -2670, // approximate start date, used to sort sites from oldest
    name: 'Step Pyramid of Djoser',
    city: 'Saqqara',
    region: 'Cairo & Giza',
    category: 'Pyramids',
    era: 'Old Kingdom, 3rd Dynasty (c. 2670 BC)',
    summary:
      'The earliest of Egypt\'s pyramids, designed by the architect Imhotep for King Djoser. Six stacked mastabas make it the first large monument built entirely of cut stone.',
    highlights: [
      'Designed by Imhotep, later revered as a god of wisdom',
      'Six steps rising to about 62 m',
      'Surrounded by a vast funerary complex and enclosure wall',
    ],
    wiki: 'Pyramid_of_Djoser',
    lat: 29.8713,
    lon: 31.2165,
  },
  {
    id: 'karnak',
    year: -2000, // approximate start date, used to sort sites from oldest
    name: 'Karnak Temple Complex',
    city: 'Luxor',
    region: 'Luxor',
    category: 'Temples',
    era: 'Middle Kingdom to Ptolemaic period (c. 2000-30 BC)',
    summary:
      'A vast complex of temples, chapels and pylons built and enlarged over some two thousand years, dedicated mainly to the god Amun-Ra.',
    highlights: [
      'Great Hypostyle Hall with 134 massive columns',
      'Sacred lake used by the temple priests',
      'One of the largest religious sites ever built',
    ],
    wiki: 'Karnak',
    lat: 25.7188,
    lon: 32.6573,
  },
  {
    id: 'luxor-temple',
    year: -1400, // approximate start date, used to sort sites from oldest
    name: 'Luxor Temple',
    city: 'Luxor',
    region: 'Luxor',
    category: 'Temples',
    era: 'New Kingdom (c. 1400-1200 BC)',
    summary:
      'A temple on the east bank of the Nile built mainly by Amenhotep III and Ramesses II, linked to Karnak by the Avenue of Sphinxes.',
    highlights: [
      'Colossal statues of Ramesses II at the entrance pylon',
      'Obelisk whose twin stands in Paris, at the Place de la Concorde',
      'Beautifully lit in the evening',
    ],
    wiki: 'Luxor_Temple',
    lat: 25.6995,
    lon: 32.6391,
  },
  {
    id: 'valley-kings',
    year: -1539, // approximate start date, used to sort sites from oldest
    name: 'Valley of the Kings',
    city: 'Luxor West Bank',
    region: 'Luxor',
    category: 'Tombs',
    era: 'New Kingdom (c. 1539-1075 BC)',
    summary:
      'The royal burial ground of the New Kingdom, with more than sixty rock-cut tombs, including the tomb of Tutankhamun found by Howard Carter in 1922.',
    highlights: [
      'Tomb of Tutankhamun (KV62)',
      'Painted corridors in the tombs of Ramesses VI and Seti I',
      'Standard ticket covers a selection of open tombs',
    ],
    wiki: 'Valley_of_the_Kings',
    lat: 25.7402,
    lon: 32.6014,
  },
  {
    id: 'hatshepsut',
    year: -1470, // approximate start date, used to sort sites from oldest
    name: 'Temple of Hatshepsut',
    city: 'Deir el-Bahari, Luxor',
    region: 'Luxor',
    category: 'Temples',
    era: 'New Kingdom, 18th Dynasty (c. 1470 BC)',
    summary:
      'The terraced mortuary temple of Queen Hatshepsut, set against the cliffs of Deir el-Bahari and attributed to her steward and architect Senenmut.',
    highlights: [
      'Three colonnaded terraces rising toward the cliffs',
      'Reliefs of the expedition to the land of Punt',
      'Best photographed in the early morning light',
    ],
    wiki: 'Mortuary_Temple_of_Hatshepsut',
    lat: 25.738,
    lon: 32.6065,
  },
  {
    id: 'abu-simbel',
    year: -1264, // approximate start date, used to sort sites from oldest
    name: 'Abu Simbel Temples',
    city: 'Abu Simbel, Aswan',
    region: 'Aswan & Nubia',
    category: 'Temples',
    era: 'New Kingdom, reign of Ramesses II (13th century BC)',
    summary:
      'Two rock-cut temples of Ramesses II and Queen Nefertari, moved block by block between 1964 and 1968 to save them from the rising waters of Lake Nasser.',
    highlights: [
      'Four 20 m statues of Ramesses II on the facade',
      'Sun festival: twice a year sunlight reaches the inner sanctuary',
      'A landmark of the UNESCO Nubia rescue campaign',
    ],
    wiki: 'Abu_Simbel',
    lat: 22.3372,
    lon: 31.6258,
  },
  {
    id: 'philae',
    year: -380, // approximate start date, used to sort sites from oldest
    name: 'Philae Temple',
    city: 'Aswan',
    region: 'Aswan & Nubia',
    category: 'Temples',
    era: 'Ptolemaic period (c. 380 BC onward)',
    summary:
      'The island temple of the goddess Isis, relocated to Agilkia Island in the 1970s after the building of the Aswan dams. It is reached by boat.',
    highlights: [
      'Kiosk of Trajan on the water\'s edge',
      'Among the last places where the old Egyptian religion was practised',
      'Sound and light show in the evening',
    ],
    wiki: 'Philae',
    lat: 24.0255,
    lon: 32.8844,
  },
  {
    id: 'edfu',
    year: -237, // approximate start date, used to sort sites from oldest
    name: 'Temple of Edfu',
    city: 'Edfu',
    region: 'Upper Egypt',
    category: 'Temples',
    era: 'Ptolemaic period (237-57 BC)',
    summary:
      'A temple dedicated to the falcon god Horus and one of the best preserved in Egypt, with its roof and pylon still standing.',
    highlights: [
      'Second-largest temple in Egypt after Karnak',
      'Granite statues of Horus at the entrance',
      'Wall texts describe the temple\'s own construction',
    ],
    wiki: 'Temple_of_Edfu',
    lat: 24.9777,
    lon: 32.8734,
  },
  {
    id: 'kom-ombo',
    year: -180, // approximate start date, used to sort sites from oldest
    name: 'Kom Ombo Temple',
    city: 'Kom Ombo',
    region: 'Upper Egypt',
    category: 'Temples',
    era: 'Ptolemaic period (c. 180-47 BC)',
    summary:
      'An unusual double temple with two identical halves, one for the crocodile god Sobek and one for the falcon god Haroeris.',
    highlights: [
      'Symmetrical twin sanctuaries and entrances',
      'Relief often described as a set of medical instruments',
      'Crocodile Museum next to the temple',
    ],
    wiki: 'Kom_Ombo_Temple',
    lat: 24.4521,
    lon: 32.9285,
  },
  {
    id: 'dendera',
    year: -54, // approximate start date, used to sort sites from oldest
    name: 'Dendera Temple Complex',
    city: 'Dendera, Qena',
    region: 'Upper Egypt',
    category: 'Temples',
    era: 'Ptolemaic and Roman periods (c. 50 BC-AD 100)',
    summary:
      'The Temple of Hathor at Dendera, one of the best preserved temple complexes in Egypt, known for its painted ceilings and astronomical reliefs.',
    highlights: [
      'Vivid blue ceilings in the hypostyle hall',
      'Copy of the Dendera zodiac (the original is in the Louvre)',
      'Rooftop chapels reached by stairways',
    ],
    wiki: 'Dendera_Temple_complex',
    lat: 26.1419,
    lon: 32.6703,
  },
];

export function getSite(id) {
  return SITES.find((s) => s.id === id);
}

export function relatedSites(site, limit = 4) {
  return SITES.filter((s) => s.id !== site.id && s.region === site.region).slice(0, limit);
}

// Site of the day: deterministic for a given date, so every user sees the same pick.
export function siteOfTheDay(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return SITES[dayIndex % SITES.length];
}
