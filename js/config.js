/* ═══════════════════════════════════════════════════════════════
   Wilderness Escape Rentals · THE FACTS
   ───────────────────────────────────────────────────────────────
   Every fact about the business lives here: contact, cabins,
   policies, reviews, checkout steps, photo alt text, headlines.
   The guide lives in js/places.js; map geometry in js/map-data.js.
   After editing, run:   node tools/build.mjs

   Anything marked TODO(client) is a guess or a gap that needs
   Robyn's confirmation. SAMPLE stays true until every TODO is gone;
   the pages carry a "Draft for review" flag while it is.
   ═══════════════════════════════════════════════════════════════ */

const SAMPLE = true;   /* → false only when every TODO(client) below is resolved */

const CONFIG = {

  launched: null,       // 'October 2026' at launch: removes noindex, fills legal dates

  business: {
    name:   'Wilderness Escape Rentals',
    short:  'Wilderness Escape',
    owner:  'Robyn Eastin',               // TODO(client) confirm spelling: Robyn or Robin
    domain: 'www.wildernessescaperentals.com',
    street: '3810 Mortensen Ln',
    city:   'Island Park',
    state:  'Idaho',
    region: 'ID',
    zip:    '83445',
    lat:    44.4446,                      // approximate (public parcel point), research §1
    lng:    -111.3945,
  },

  /* Each channel turns itself on the moment it has a real value.
     Leave one null and the site stops offering it rather than
     printing a number that rings nowhere.                         */
  contact: {
    phone: null,                          // TODO(client)
    email: null,                          // TODO(client) info@wildernessescape.com needs that domain; see questions
  },

  seo: {
    homeTitle: 'Cabins in Island Park, Idaho near Yellowstone | Wilderness Escape',
    homeDesc:  'Three private cabins in the Island Park pines on the Idaho side of Yellowstone. Book direct with the owner, plus a local guide to Yellowstone and Island Park.',
    guideDesc: 'Things to do near Island Park, Idaho and Yellowstone by season, with drive times from our cabins: geysers, wildlife, waterfalls, fishing, shows, food and groceries.',
    llms:      'Wilderness Escape Rentals is three privately owned vacation rental cabins in the lodgepole pines of Island Park, Idaho, near the West Entrance of Yellowstone National Park. Guests book directly with the owner. The site also has a free seasonal guide to Island Park and Yellowstone with drive times from the cabins.',
  },

  home: {
    h1:    'Three cabins in the Island Park pines, under an hour from Yellowstone.',
    lede:  'Book directly with Robyn, the owner. Spend the day in Yellowstone or on the Henry\'s Fork, then come back to a quiet cabin in the lodgepole forest.',
    facts: [                              // TODO(client) add total sleeps once cabin details are in
      '<b>3</b> cabins on one wooded property',
      '<b>5 min</b> to Island Park Reservoir',
      '<b>45 min</b> to Yellowstone\'s West Entrance',
    ],
    descentOrigin: '38% 46%',             // where the drone sinks to: the aqua roofs
    cabinsHead:  'Two aqua roofs and a mauve one',
    cabinsLede:  'Three cabins on one wooded property, each with its own space. Pick one for your family or book more than one for a group.',
    whereHead:   'Minutes from the water, under an hour from the park',
    whereLede:   'The cabins sit in the pines on the northeast side of Island Park Reservoir, off US-20 between Ponds Lodge and Mack\'s Inn. Here is how far the big things are.',
    wherePhoto:  'peninsula-wide',
    drives:      ['island-park-reservoir', 'macks-inn', 'big-springs', 'harriman', 'west-yellowstone', 'mesa-falls', 'old-faithful', 'canyon'],
    seasonHead:  'Four different places, one address',
    seasonLede:  'Island Park changes completely with the seasons. Pick yours.',
    defaultSeason: 'summer',
    /* the home page's short list per season (ids from js/places.js) */
    picks: {
      summer: ['island-park-reservoir', 'big-springs-float', 'old-faithful', 'grand-prismatic', 'mesa-falls', 'playmill'],
      fall:   ['canyon', 'mammoth', 'lamar-valley', 'mesa-falls', 'box-canyon', 'harriman'],
      winter: ['snowmobiling', 'yellowstone-winter', 'harriman-winter', 'grizzly-wolf', 'island-park-reservoir', 'playmill'],
      spring: ['old-faithful', 'lamar-valley', 'grizzly-wolf', 'big-springs'],
    },
    bookLede:    'Booking direct means no platform service fees and you deal with the owner, not a call center.',
  },

  guide: {
    lede:            'Everything within a day\'s drive of the cabins, sorted by season, with the drive time from our door on every stop.',
    yellowstoneLede: 'The West Entrance at West Yellowstone is about 45 minutes from the cabins and the closest way into the park. No reservation is needed in 2026, just a pass.',
    islandParkLede:  'You do not have to enter Yellowstone to have a full week. Springs, waterfalls, famous fly fishing and hundreds of miles of trails start close to the cabins.',
    wildlifeLede:    'You will almost certainly see bison and elk. With patience and an early start, maybe wolves and bears. Here is where to look, and how close is too close.',
    showsLede:       'For evenings, rainy afternoons and kids who need a break from the car. (The IMAX theatre in West Yellowstone closed for good in January 2026.)',
    foodLede:        'Places we could confirm are operating. Many close or cut hours in the off season, so call ahead from October to May.',
    suppliesLede:    'Stock up before you arrive if you can. Island Park has the basics; the big stores are an hour or more away.',
    eventsLede:      'Dates change year to year. Check the organizer\'s site before you plan around one.',
    checkedNote:     'Guide facts checked September 2026 against official and local sources linked on each item. Hours, fees and road openings change; check before you go.',
  },

  cabins: [],                             // filled from the old-site audit

  policies: [],                           // { label, value }: check-in, checkout, pets...

  faq: [],                                // { q, a }

  /* Real reviews only: guest's name as shown, date, where it came from.
     Never invent or edit one. Empty list = the section is not shown. */
  reviews: [],

  checkout: {
    time: null,                           // TODO(client)
    lede: 'Thanks for staying with us. A few quick things before you head out.',
    steps: [],                            // TODO(client) Robyn's real checkout list
    returnHead: 'Come back in another season',
    returnLede: 'Island Park is a different place in winter, spring and fall. Returning guests can book direct anytime.',
  },

  /* Every photo on the site, with its alt text and shape (w:h).
     Files live in assets/photos/<key>-{640,1200,2400}.webp + -1200.jpg */
  photos: {
    'canopy-three-roofs':     { w: 4, h: 3, alt: 'Looking straight down on the three cabins, two with aqua roofs and one with a mauve roof, in a clearing of lodgepole pine' },
    'canopy-three-roofs-low': { w: 4, h: 3, alt: 'The three cabin roofs from lower down, with the gravel drives between the pines' },
    'canopy-mauve-roof':      { w: 4, h: 3, alt: 'The mauve-roof cabin from above, with its own gravel drive through the pines' },
    'teal-cabins-drive':      { w: 3, h: 4, alt: 'The two aqua-roof cabins from above at the end of a gravel drive' },
    'teal-cabin-golden':      { w: 3, h: 4, alt: 'An aqua-roof cabin in evening light, with the trees beside it lit gold' },
    'teal-cabins-yard':       { w: 4, h: 3, alt: 'Both aqua-roof cabins and the gravel yard between them, seen from above in evening light' },
    'twin-pines-sunset':      { w: 4, h: 3, alt: 'Two tall pines against the sunset over the forest' },
    'sunrise-forest':         { w: 4, h: 3, alt: 'Sunrise over miles of lodgepole forest' },
    'shore-cabins':           { w: 4, h: 3, alt: 'Cabins among the pines along a reservoir shore, seen from above' },
    'marina-docks':           { w: 4, h: 3, alt: 'Boat docks on the reservoir below a shoreline of cabins and pines' },
    'peninsula':              { w: 4, h: 3, alt: 'A forested peninsula dotted with cabins, with water on both sides' },
    'peninsula-wide':         { w: 4, h: 3, alt: 'A forested peninsula of cabins between two arms of the reservoir, with open country beyond' },
    'reservoir-island':       { w: 4, h: 3, alt: 'The reservoir winding through the forest at dusk, with a sandbar island' },
    'reservoir-channel':      { w: 4, h: 3, alt: 'A channel of the reservoir running out toward open country at sunset' },
    'mountains-clouds':       { w: 4, h: 3, alt: 'Evening clouds over the mountains beyond the reservoir' },
    'reservoir-sunset':       { w: 4, h: 3, alt: 'Sunset colors over the water and the far tree line' },
    'dock-dusk':              { w: 4, h: 3, alt: 'A dock on the reservoir at dusk, with dark pines on the shore' },
  },
};
