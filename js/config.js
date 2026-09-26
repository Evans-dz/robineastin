/* ═══════════════════════════════════════════════════════════════
   Wilderness Escape Rentals · THE FACTS
   ───────────────────────────────────────────────────────────────
   Every fact about the business lives here: contact, cabins,
   policies, booking widgets, reviews, checkout steps, photo alt
   text, headlines. The guide lives in js/places.js; map geometry in
   js/map-data.js. After editing, run:   node tools/build.mjs

   Source for cabin facts: ../Docs/research/old-site-audit.md (the
   OwnerRez site, Airbnb and VRBO listings, read 25 Sept 2026).
   Anything marked TODO(client) is a gap or a conflict Robyn needs to
   settle. SAMPLE stays true until every TODO is gone; the pages carry
   a "Draft for review" flag while it is.
   ═══════════════════════════════════════════════════════════════ */

const SAMPLE = true;   /* → false only when every TODO(client) below is resolved */

const CONFIG = {

  launched: null,       // 'October 2026' at launch: removes noindex, fills legal dates

  business: {
    name:   'Wilderness Escape Rentals',
    short:  'Wilderness Escape',
    owner:  'Robyn Eastin',
    domain: 'www.wildernessescaperentals.com',
    street: '3810 Mortensen Ln',           // TODO(client) old site header says 3645 Moose Track Ln; which is the business address?
    city:   'Island Park',
    state:  'Idaho',
    region: 'ID',
    zip:    '83429',                       // TODO(client) listings + Google use 83429; the brief said 83445
    lat:    44.4448,                       // Pine Shadows pin on the OwnerRez site
    lng:    -111.3945,
  },

  /* Each channel turns itself on the moment it has a real value.
     Leave one null and the site stops offering it.                */
  contact: {
    phone: '(208) 351-1033',              // from the old site footer
    email: 'info@wildernessescaperentals.com',
  },

  seo: {
    homeTitle: 'Cabins in Island Park, Idaho near Yellowstone | Wilderness Escape',
    homeDesc:  'Two family cabins next door to each other in the Island Park pines, 45 minutes from Yellowstone. Book direct with the owner, plus a seasonal Island Park and Yellowstone guide.',
    guideDesc: 'Things to do near Island Park, Idaho and Yellowstone by season, with drive times from our cabins: geysers, wildlife, waterfalls, fishing, shows, food and groceries.',
    llms:      'Wilderness Escape Rentals is two family vacation cabins, Pine Shadows (sleeps 12) and Wilderness Escape Retreat (sleeps 10), next door to each other in the lodgepole pines of Island Park, Idaho, about 45 minutes from the West Entrance of Yellowstone National Park. Owners Robyn and Eric Eastin host them directly. The site also has a free seasonal guide to Island Park and Yellowstone with drive times from the cabins.',
  },

  home: {
    h1:    'Two family cabins in the Island Park pines, under an hour from Yellowstone.',
    lede:  'Book directly with Robyn, the owner. Spend the day in Yellowstone or on the Henry\'s Fork, then come back to a quiet cabin in the lodgepole forest.',
    facts: [
      '<b>2</b> cabins next door to each other',
      '<b>Sleep up to 22</b> together',        // TODO(client) old site says 21 in one place; 12 + 10 = 22
      '<b>5 min</b> to Island Park Reservoir',
      '<b>45 min</b> to Yellowstone\'s West Entrance',
    ],
    descentOrigin: '38% 46%',             // where the drone sinks to: Pine Shadows' aqua roof
    cabinsHead:  'Two cabins next door, with a game garage between',
    cabinsLede:  'Pine Shadows sleeps 12 and Wilderness Escape Retreat sleeps 10. Book one for your family, or both for a reunion.',
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
    bookLede:    'Booking direct means no platform service fees, and you deal with the owner, not a call center.',
    hosts:       'Robyn and Eric Eastin live in Rexburg and look after both cabins themselves. Robyn is a retired Family and Consumer Sciences teacher; Eric is happiest floating the Snake River in his fishing boat. They host their own family reunions here too.',
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

  /* ── BOOKING: OwnerRez stays the engine ─────────────────────
     Widget codes copied from the live OwnerRez site (research §4.2).
     widget.js injects an iframe; without JS the page links out.   */
  booking: {
    script:   'https://app.ownerrez.com/widget.js',
    /* OwnerRez only serves these widgets to approved sites (a localhost
       request gets 403). Anywhere else the page shows a note instead.
       TODO(client) add any preview domain in OwnerRez widget settings. */
    hosts:    ['www.wildernessescaperentals.com', 'wildernessescaperentals.com'],
    all: {
      calendar: '5165c6bf71b742fc9d8b532d619c4fe4',   // Ribbon Calendar, every listing
      booking:  '49db33f0e0d14eb3a5efda0c3dfe7d37',   // Booking/Inquiry with a listing dropdown
      reviews:  '37a94eb283a548f8ba97a37976509e77',   // Reviews, every listing
    },
    perCabin: {
      booking:  '531d1ebf1e4344cda61aa2ec5c9b82b6',   // + data-propertyId per cabin
      calendar: '067f30290c8f4565aa580e6abdd0c685',
      reviews:  'f9758a54a73c49519a2f5d337f0a6815',
    },
  },

  /* Ratings as displayed on each platform. Dated, because they move. */
  ratings: {
    asOf: 'September 2026',
    items: [
      { where: 'Airbnb', what: 'Pine Shadows', score: '4.89 out of 5', count: 18, url: 'https://www.airbnb.com/rooms/783248560719883922' },
      { where: 'Airbnb', what: 'Wilderness Escape Retreat', score: '4.87 out of 5', count: 55, url: 'https://www.airbnb.com/rooms/43855219' },
      { where: 'VRBO', what: 'Pine Shadows', score: '10 out of 10', count: 33, url: 'https://www.vrbo.com/2216216' },
      { where: 'VRBO', what: 'Wilderness Escape Retreat', score: '10 out of 10', count: 30, url: 'https://www.vrbo.com/1935077' },
    ],
  },

  cabins: [
    {
      slug: 'pine-shadows',
      name: 'Pine Shadows',
      address: '3810 Mortensen Ln',
      roof: 'aqua',
      ownerrez: { propertyId: 474460, key: '2a1ab7b60cfa428ca0975819dfbdabad' },
      sleeps: 12, bedrooms: 3, baths: 2.5, sqft: 1800,
      beds: '2 kings, a queen, 2 bunk beds',
      summary: 'The bigger cabin: two king bedrooms, a family loft with bunks, a fireplace and a big stocked kitchen, backing onto Forest Service land.',
      headline: 'Room for the whole family, backed by national forest',
      description: [
        'Pine Shadows sits on a secluded one-acre wooded lot that backs onto Forest Service land, so there are no neighbors behind you. It is the aqua-roofed cabin in our drone photos, about 45 minutes from Yellowstone\'s West Entrance.',
        'Downstairs is a master bedroom with a king bed and a Jack and Jill bathroom. Upstairs is a second master with a king and its own bath, and a big family loft with two bunk beds, a queen and a floor mattress. The laundry mudroom has a half bath and a sink for muddy boots or cleaning fish.',
        'Gather by the fireplace, cook in the fully stocked kitchen, grill on the front deck, and finish the day at the fire pit by the circular drive.',
        'Bringing the toys? The circular driveway has room for trucks, trailers and RVs, with water and electric hookups for one camping trailer ($75 per stay). The activity garage next door, with ping pong, foosball, an electronic basketball game and cornhole, can be added for $150 per stay.',
        'Planning a reunion? Wilderness Escape Retreat is right next door, so two families can stay close with a cabin each.',
      ],
      amenities: [
        'Free Wi-Fi', 'Fireplace, firewood provided', 'Air conditioning and central heat', 'Fully stocked kitchen with dishwasher',
        'Washer and dryer', 'Smart TV, satellite and sound system', 'Front deck with grill', 'Fire pit',
        'Crib and highchair', 'Keypad self check-in', 'Circular drive with room for RVs and trailers',
        'Trailer hookup, $75 per stay', 'Activity garage add-on, $150 per stay',
      ],
      photos: ['teal-cabin-golden', 'teal-cabins-yard', 'canopy-three-roofs-low'],
      /* Robyn's own photos, shown from her OwnerRez photo host for the draft.
         TODO(client) self-host optimised copies at launch (originals from Robyn). */
      gallery: [
        { id: '396c8d8ac2f94d9b90128b4eae326b66', alt: 'Pine Shadows with its front deck, circular drive and game garage' },
        { id: '3afeb11684574eeb922915bd5c863234', alt: 'Living room with the fireplace and stairs to the loft' },
        { id: 'fc5c8b3b90384da7bceb13b30756c10d', alt: 'Kitchen and dining area' },
        { id: 'e7c82f42d01d4c40b89d5abbaa1d9ad2', alt: 'Master bedroom with a handcrafted log bed' },
        { id: '28453888e5b44c7db4ec8cfcafed95c5', alt: 'Loft bedroom with bunks, a pull-out couch and a TV' },
        { id: 'cf9b8e54cb8a46a7b5ab3ffcf5fc565f', alt: 'The activity garage, an add-on with Pine Shadows' },
        { id: '07c1525c9ff84e95acbbbcbd2432a5fe', alt: 'Fire pit beside the circular drive' },
        { id: 'af18583bd94b40eda435db771f2e6e97', alt: 'Pine Shadows in winter snow' },
      ],
      listings: { airbnb: 'https://www.airbnb.com/rooms/783248560719883922', vrbo: 'https://www.vrbo.com/2216216' },
      checkout: [
        { title: 'Check out by 10:00 am', detail: '' },
        { title: 'Leave all the beds unmade', detail: '' },
        { title: 'Start a load of towels', detail: 'Gather the towels in the laundry room and start a wash. If you have time, move them to the dryer. It helps our cleaner get ready for the next guests.' },
        { title: 'Run the dishwasher and clear the food', detail: 'Load and start the dishwasher; the cleaner will put the dishes away. Take your food out of the fridge, freezer and cupboards.' },
        { title: 'Take out the garbage', detail: 'All garbage goes in the designated can outside. Pickup is on Tuesday.' },
        { title: 'Lock up', detail: 'Shut and lock the windows and doors. Press the lock button on the keypad as you leave.' },
        { title: 'Sign the guest book', detail: 'We love reading about your stay.' },
      ],
    },
    {
      slug: 'wilderness-escape-retreat',
      name: 'Wilderness Escape Retreat',     // TODO(client) four names in use: Retreat, Wilderness Escape, Wilderness Pines, Wilderness Pines Retreat
      address: '3808 Mortensen Ln',
      roof: 'mauve',
      ownerrez: { propertyId: 474459, key: 'a8800880b6f74e2fa5ec37989fe553ff' },
      sleeps: 10, bedrooms: 3, baths: 2, sqft: 1100,
      beds: 'a king, 2 queens, a twin and a queen pull-out',
      summary: 'A remodeled single-level cabin with three bedrooms, a back deck into the pines and a fire pit with the firewood provided.',
      headline: 'Remodeled, single-level and made for slow mornings',
      description: [
        'Wilderness Escape Retreat is the mauve-roofed cabin next door to Pine Shadows: a remodeled, single-level cabin on its own one-acre lot in the pines.',
        'There are three bedrooms: a master with a king bed and its own bathroom, a queen room, and a room with a queen and a twin. A second full bathroom has a tub, and the living room has a queen pull-out. The kitchen has a new range and is stocked to cook for ten.',
        'Take your morning coffee to the back deck, play the board games and puzzles, or stream a movie on the 55-inch smart TV. Out back is a fire pit with firewood and roasting sticks, and propane for the grill is included.',
        'ATV and snowmobile trails are close by, and Island Park Reservoir is about 5 minutes away.',
      ],
      amenities: [
        'Free Wi-Fi', 'Central heat, ceiling and portable fans', 'Stocked kitchen with a new range', 'Washer and dryer, soap included',
        '55-inch smart TV with streaming', 'Board games and puzzles', 'Back deck', 'Grill, propane included',
        'Fire pit with firewood and roasting sticks', 'Crib and highchair', 'Keypad self check-in', 'Single-level home',
      ],
      photos: ['canopy-mauve-roof', 'canopy-three-roofs', 'twin-pines-sunset'],
      gallery: [
        { id: '56c454b1d7bb49ffac9231d84c7d586f', alt: 'The entrance to Wilderness Escape Retreat' },
        { id: 'e02c18149b8d463f8d7398733fa16d55', alt: 'Open living room and kitchen with doors to the back deck' },
        { id: 'd3f524b3b51541c4898d0280c94b0f15', alt: 'Kitchen looking into the living room' },
        { id: '7f56d407eef3448490914bd3aec35548', alt: 'Master bedroom with a king bed' },
        { id: '5b7c48e9f12941d98470733f000a96b2', alt: 'Guest bedroom with buffalo decor' },
        { id: '0e03f55afa08478d9250cb168c1121e9', alt: 'The back deck for gathering' },
        { id: 'a0766f51f15f4c199663ba2774f8d8f2', alt: 'The rustic fire pit' },
        { id: 'f9785861d45d4971b781422466e8623a', alt: 'The cabin among the pines' },
      ],
      listings: { airbnb: 'https://www.airbnb.com/rooms/43855219', vrbo: 'https://www.vrbo.com/1935077' },
      checkout: [
        { title: 'Check out by 10:00 am', detail: '' },
        { title: 'Leave all the beds unmade', detail: '' },
        { title: 'Start a load of towels', detail: 'Gather the towels in the laundry room and start a wash. If you have time, move them to the dryer. It helps our cleaner get ready for the next guests.' },
        { title: 'Wash the dishes and clear the food', detail: 'Wash the dishes; the cleaner will put them away. Take your food out of the fridge, freezer and cupboards.' },
        { title: 'Take out the garbage', detail: 'All garbage goes in the cans outside next to the cabin. Pickup is Monday and Thursday.' },
        { title: 'Lock up', detail: 'Shut and lock the windows and doors. Press the lock button on the keypad as you leave.' },
        { title: 'Sign the guest book', detail: 'We love reading about your stay.' },
      ],
    },
  ],

  policies: [
    { label: 'Check-in', value: '4:00 pm, self check-in with a keypad' },
    { label: 'Checkout', value: '10:00 am' },
    { label: 'Minimum stay', value: null },                    // TODO(client) not published anywhere
    { label: 'Pets', value: 'Not allowed' },
    { label: 'Smoking', value: 'Not allowed, including vaping' },
    { label: 'Age to rent', value: '21 or older' },
    { label: 'Agreement', value: 'A signed rental agreement is due within 48 hours of booking' },
    { label: 'Cancellation', value: 'Full refund more than 30 days before arrival, half refund more than 14 days before, no refund within 14 days' },
  ],

  faq: [
    { q: 'Can we book both cabins for a reunion?', a: 'Yes. Pine Shadows (sleeps 12) and Wilderness Escape Retreat (sleeps 10) are next door to each other on wooded lots, with the activity garage between them. Call or email Robyn to book both together.' },
    { q: 'What is the activity garage?', a: 'A garage between the cabins with ping pong, foosball, an electronic basketball game, cornhole, picnic tables and an extra fridge. It can be added to a Pine Shadows stay for $150.' },
    { q: 'Can we bring a trailer or RV?', a: 'Yes. Pine Shadows has a circular drive with room for trailers and RVs, and water and electric hookups for one camping trailer for $75 per stay.' },
    { q: 'How far is Yellowstone?', a: 'The West Entrance is about 30 miles away, roughly 45 minutes in normal traffic. In summer, leave early: lines at the gate and road work can add time.' },
    { q: 'Is there Wi-Fi and cell service?', a: 'Both cabins have free Wi-Fi. Cell service in the forest is patchy, so download offline maps before you head out.' },
    { q: 'Is there air conditioning?', a: 'Pine Shadows has air conditioning. Wilderness Escape Retreat has ceiling and portable fans, and summer nights here are cool, usually in the 40s.' },
    { q: 'What is provided?', a: 'Linens, towels, basic toiletries, coffee, spices and a fully stocked kitchen at both cabins, plus firewood for the fire pit. Bring bear spray if you plan to hike.' },
  ],

  checkout: {
    lede: 'Thanks for staying with us. A few quick things before you head out.',
    returnHead: 'Come back in another season',
    returnLede: 'Island Park is a different place in winter, spring and fall. Returning guests can book direct anytime.',
  },

  /* Every photo on the site, with its alt text and shape (w:h).
     Files live in assets/photos/<key>-{640,1200,2400}.webp + -1200.jpg */
  photos: {
    'canopy-three-roofs':     { w: 4, h: 3, alt: 'Looking straight down on the property: Pine Shadows and the game garage under aqua roofs, and Wilderness Escape Retreat under a mauve roof, in the lodgepole pines' },
    'canopy-three-roofs-low': { w: 4, h: 3, alt: 'The two cabins and the game garage from lower down, with the gravel drives between the pines' },
    'canopy-mauve-roof':      { w: 4, h: 3, alt: 'Wilderness Escape Retreat from above, with its own gravel drive through the pines' },
    'teal-cabins-drive':      { w: 3, h: 4, alt: 'Pine Shadows and the game garage from above, at the end of the circular drive' },
    'teal-cabin-golden':      { w: 3, h: 4, alt: 'Pine Shadows in evening light, with the trees beside it lit gold' },
    'teal-cabins-yard':       { w: 4, h: 3, alt: 'Pine Shadows, the game garage and the gravel yard between them, seen from above' },
    'twin-pines-sunset':      { w: 4, h: 3, alt: 'Two tall pines against the sunset over the forest' },
    'sunrise-forest':         { w: 4, h: 3, alt: 'Sunrise over miles of lodgepole forest' },
    'shore-cabins':           { w: 4, h: 3, alt: 'Cabins among the pines along the Island Park Reservoir shore, seen from above' },
    'marina-docks':           { w: 4, h: 3, alt: 'Boat docks on Island Park Reservoir below a shoreline of cabins and pines' },
    'peninsula':              { w: 4, h: 3, alt: 'A forested peninsula dotted with cabins on Island Park Reservoir' },
    'peninsula-wide':         { w: 4, h: 3, alt: 'A forested peninsula of cabins between two arms of Island Park Reservoir, with open country beyond' },
    'reservoir-island':       { w: 4, h: 3, alt: 'Island Park Reservoir winding through the forest at dusk, with a sandbar island' },
    'reservoir-channel':      { w: 4, h: 3, alt: 'A channel of Island Park Reservoir running out toward open country at sunset' },
    'mountains-clouds':       { w: 4, h: 3, alt: 'Evening clouds over the mountains beyond the reservoir' },
    'reservoir-sunset':       { w: 4, h: 3, alt: 'Sunset colors over the water and the far tree line' },
    'dock-dusk':              { w: 4, h: 3, alt: 'A dock on Island Park Reservoir at dusk, with dark pines on the shore' },
    'grand-prismatic':        { w: 4, h: 3, focus: '50% 55%', alt: 'Steam rising off Grand Prismatic Spring over its orange runoff channels, with a forested hill behind' },
    'upper-mesa-falls':       { w: 3, h: 4, focus: '30% 62%', alt: 'Upper Mesa Falls pouring into the Henry\'s Fork, seen from the boardwalk railing, with pine forest on the far rim' },
  },
};
