/* ═══════════════════════════════════════════════════════════════
   Wilderness Escape Rentals · THE FACTS
   ───────────────────────────────────────────────────────────────
   Every fact about the business lives here: contact, cabins,
   policies, booking widgets, reviews, checkout steps, photo alt
   text, headlines. The guide lives in js/places.js; map geometry in
   js/map-data.js. After editing, run:   node tools/build.mjs

   Source for cabin facts: ../Docs/research/old-site-audit.md (the
   OwnerRez site, Airbnb and VRBO listings, read 25 Sept 2026), then
   Robyn's review notes of 7 Oct 2026 (sleeps 9, office address, no
   phone, A/C in the master, 30 min to Yellowstone, FAQ details).
   Anything marked TODO(client) is a gap or a conflict Robyn needs to
   settle. SAMPLE stays true until every TODO is gone; the pages carry
   a "Draft for review" flag while it is.
   ═══════════════════════════════════════════════════════════════ */

const SAMPLE = true;   /* → false only when every TODO(client) below is resolved */

const CONFIG = {

  launched: null,       // 'October 2026' at launch: removes noindex, fills legal dates

  /* Until launch, the real domain still serves the old OwnerRez site, so
     link previews (og:image, og:url) point at the Vercel share link
     instead. Canonical tags always use business.domain.               */
  previewOrigin: null,  // e.g. 'https://robineastin.vercel.app'

  business: {
    name:   'Wilderness Escape Rentals',
    short:  'Wilderness Escape',
    owner:  'Robyn Eastin',
    domain: 'www.wildernessescaperentals.com',
    /* The office, per Robyn (7 Oct 2026). The cabins themselves are at
       3808 and 3810 Mortensen Ln; each cabin page shows its own. */
    street: '3645 Moose Track Ln',
    city:   'Island Park',
    state:  'Idaho',
    region: 'ID',
    zip:    '83440',                       // TODO(client) Robyn wrote 83440, which is Rexburg's ZIP; Island Park is 83429
    lat:    44.4448,                       // Pine Shadows pin on the OwnerRez site (the map's "you are here")
    lng:    -111.3945,
    toYellowstone: '30 min',               // Robyn's figure: 29.5 road miles to the West Entrance
  },

  /* Each channel turns itself on the moment it has a real value.
     Leave one null and the site stops offering it.
     phone: Robyn asked for it off the site entirely (7 Oct 2026).  */
  contact: {
    phone: null,
    email: 'info@wildernessescaperentals.com',
  },

  /* Wi-Fi: Robyn wants this said loudly (7 Oct 2026): fast, great to work
     from. TODO(client) a speed-test number (Mbps) from each cabin would
     make it concrete; until then no number is claimed. */
  wifi: {
    head: 'Fast Wi-Fi, made for working from the cabin',
    body: 'Both cabins have free high-speed Wi-Fi that is great for getting work done. Video calls, sending big files and streaming all run smoothly, so you can take a meeting at the kitchen table in the morning, head out to Yellowstone after lunch, and stream a movie on the smart TV that night.',
    short: 'Fast, free Wi-Fi that is great for work: video calls, big files and streaming.',
  },

  /* Her logo, pulled from the old OwnerRez site (500 px JPEG); the
     white ground was made transparent. Print needs her original file. */
  logo: {
    src:    '/assets/logo/logo-160.webp',
    srcset: '/assets/logo/logo-160.webp 160w, /assets/logo/logo-320.webp 320w',
    png:    '/assets/logo/logo.png',
    w: 411, h: 343,
  },

  seo: {
    homeTitle: 'Cabins in Island Park, Idaho near Yellowstone | Wilderness Escape',
    homeDesc:  'Two family cabins next door to each other in the Island Park lodgepole forest, 30 minutes from Yellowstone. Book online, plus a seasonal Island Park and Yellowstone guide.',
    guideDesc: 'Things to do near Island Park, Idaho and Yellowstone by season, with drive times from our cabins: geysers, wildlife, waterfalls, fishing, theatre, restaurants and groceries.',
    llms:      'Wilderness Escape Rentals is two family vacation cabins, Pine Shadows (sleeps 12) and Wilderness Escape Retreat (sleeps 9), next door to each other in the lodgepole pines of Island Park, Idaho, about 30 minutes from the West Entrance of Yellowstone National Park. Both have fast, free Wi-Fi that is good for remote work and video calls. Owners Robyn and Eric Eastin host them, and guests book online on this website. The site also has a free seasonal guide to Island Park and Yellowstone with drive times from the cabins.',
  },

  home: {
    welcome: 'Welcome to our website',
    h1:    'Escape to the forest in Island Park, ID.',
    lede:  'Two family cabins surrounded by lodgepole forest and nature\'s adventures.',
    facts: [
      '<b>30 min</b> to Yellowstone',
      '<b>Fast Wi-Fi</b> to work from',
      '<b>2</b> cabins next door to each other',
      '<b>Sleep up to 21</b> together',
      '<b>5 min</b> to Island Park Reservoir',
    ],
    /* Hero photo: DJI_0099 (brightest colours of the shoot). Its roofs sit
       mid-frame, so each layout frames them clear of the copy:
       desktop anchors the photo's bottom edge (roofs in the upper half);
       phones put the headline on top and the buttons at the bottom. */
    heroPhoto:           'canopy-three-roofs-low',
    heroPos:             '30% 100%',      // object-position, desktop
    descentOrigin:       '30% 40%',       // where the drone sinks to: Pine Shadows and the garage
    heroPosMobile:       '16% 50%',
    descentOriginMobile: '48% 56%',
    bookCard: {
      head: 'Your forest escape starts here',
      note: 'Book on our website: no Airbnb or VRBO service fees.',
    },
    cabinsHead:  'Two cabins next door, with a game garage between',
    cabinsLede:  'Pine Shadows sleeps 12 and Wilderness Escape Retreat sleeps 9. Book one for your family, or both for a reunion.',
    insideHead:  'A look inside',
    /* [cabin slug, OwnerRez photo id] for the home photo strip */
    inside: [
      ['pine-shadows', 'de8aa8c91cc148279cf09acb216324ad'],
      ['wilderness-escape-retreat', '7cfab41187af4ef6b412abc84016003d'],
      ['pine-shadows', '452c0b5a50ce4bd5b71792655cdf07d2'],
      ['wilderness-escape-retreat', '0e03f55afa08478d9250cb168c1121e9'],
      ['pine-shadows', 'd65dd44bb9104f04ad9444769f3f8cb7'],
      ['wilderness-escape-retreat', '5b7c48e9f12941d98470733f000a96b2'],
    ],
    whereHead:   'Minutes from the water, 30 minutes from the park',
    whereLede:   'The cabins sit in the pines on the northeast side of Island Park Reservoir, off US-20 between Ponds Lodge and Mack\'s Inn. Here is how far the big things are.',
    wherePhoto:  'peninsula-wide',
    drives:      ['island-park-reservoir', 'macks-inn', 'big-springs', 'harriman', 'west-yellowstone', 'mesa-falls', 'old-faithful', 'canyon'],
    nearbyHead:  'Groceries, restaurants and a show',
    nearbyLede:  'Everything you need for the week is close by. These are the ones guests ask about most.',
    /* names from FOOD and SUPPLIES, ids from PLACES (js/places.js) */
    nearby: {
      groceries: ['Sam Patch Co. Grocer and Sundries', 'Dave\'s Jubilee Market', 'Broulim\'s Fresh Foods'],
      food:      ['Lakeside Lodge Restaurant and Bar', 'Pond\'s Lodge', 'Boondocks Roadhouse', 'Cafe Sabor', 'The Parlor at Mack\'s Inn'],
      shows:     ['playmill', 'playhouse', 'westgate'],
    },
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
    bookHead:    'Ready for the forest?',
    bookLede:    'Pick your cabin and your dates, see your total, and book right here on our website. No Airbnb or VRBO service fees.',
    hosts:       'Robyn and Eric Eastin live in Rexburg and look after both cabins themselves. Robyn is a retired Family and Consumer Sciences teacher; Eric is happiest floating the Snake River in his fishing boat. They host their own family reunions here too.',
  },

  guide: {
    lede:            'Everything within a day\'s drive of the cabins, sorted by season, with the drive time from our door on every stop.',
    yellowstoneLede: 'The West Entrance at West Yellowstone is about 30 minutes from the cabins and the closest way into the park. No reservation is needed in 2026, just a pass.',
    islandParkLede:  'You do not have to enter Yellowstone to have a full week. Springs, waterfalls, famous fly fishing and hundreds of miles of trails start close to the cabins.',
    wildlifeLede:    'You will almost certainly see bison and elk. With patience and an early start, maybe wolves and bears. Here is where to look, and how close is too close.',
    showsLede:       'Live theatre is a big part of summer here: the Playmill, the Yellowstone Playhouse and the Westgate Theatre. Good for evenings, rainy afternoons and kids who need a break from the car.',
    foodLede:        'Places we could confirm are operating. Many close or cut hours in the off season, so check ahead from October to May.',
    suppliesLede:    'Sam Patch Co. in Island Park is the closest grocery store. For a bigger shop, Dave\'s Jubilee in Ashton is about 45 minutes away and Broulim\'s in St. Anthony about an hour.',
    eventsLede:      'Dates change year to year. Check the organizer\'s site before you plan around one.',
    checkedNote:     'Guide facts checked September and October 2026 against official and local sources linked on each item. Hours, fees and road openings change; check before you go.',
  },

  /* ── BOOKING: OwnerRez stays the engine ─────────────────────
     Widget codes copied from the live OwnerRez site (research §4.2).
     widget.js injects an iframe; without JS the page links out.   */
  booking: {
    script:   'https://app.ownerrez.com/widget.js',
    /* OwnerRez serves these widgets to any real domain (tested 26 Sept
       2026: the live domain and a *.vercel.app preview both get 200) but
       refuses localhost with 403, so local dev shows a note instead. */
    blockedHosts: ['localhost', '127.0.0.1', '[::1]', ''],
    all: {
      calendar: '5165c6bf71b742fc9d8b532d619c4fe4',   // Ribbon Calendar, every listing
      booking:  '49db33f0e0d14eb3a5efda0c3dfe7d37',   // Booking/Inquiry with a listing dropdown
    },
    perCabin: {
      booking:  '531d1ebf1e4344cda61aa2ec5c9b82b6',   // + data-propertyId per cabin
      calendar: '067f30290c8f4565aa580e6abdd0c685',
    },
  },

  /* Reviews: real guests, their own words, from Robyn's OwnerRez reviews
     widget (read 7 Oct 2026: 26 reviews, every one 5.0 stars). Robyn
     wants only five-star reviews shown and no overall grade, so there is
     no Airbnb/VRBO average anywhere. Names as OwnerRez shows them.
     Left out: reviews about road work or a 40-minute drive, two with
     suggestions that have since been fixed (A/C, sponge), one garbled.
     One em dash in James C's review became a colon (polish rule).     */
  reviews: {
    asOf:   'October 2026',
    source: 'Guest reviews from our booking system, shown as written.',
    items: [
      { name: 'James C.',  cabin: 'pine-shadows', when: 'August 2026', home: true,
        text: 'PERFECTION!!! This is a fabulous home. Very clean. Wonderful layout: downstairs has a great open layout with kitchen, dining room and living room. Upstairs has super bedrooms, TV room and bathroom layout. Our daughter was in heaven with her upstairs world of her own. All furnishings and amenities in the home were great. Wonderful, relaxing, peaceful setting. We loved it and are trying to figure out a way to take it with us to future vacation locations. A total winner.' },
      { name: 'Eddie and Jacqueline T.', cabin: 'pine-shadows', when: 'July 2026', home: true,
        text: 'We had a great stay at this cabin in the woods. We planned a multi family trip to Yellowstone and it was a success! We utilized the game room and rv hookups and everything worked out as planned. The house was exactly as expected and the location was perfect for us. Around 30 minutes to the west Yellowstone entrance. Robyn was very attentive, you can tell she cares a lot for her guests satisfaction. We highly recommend her cabin if you are planning a trip to Yellowstone!' },
      { name: 'Sabrina T.', cabin: 'wilderness-escape-retreat', when: 'July 2026', home: true,
        text: 'The cabin was very homie. Very clean and was everything we needed for our vacation. Beds were very comfortable. The area was beautiful and the back deck was perfect to enjoy our morning coffee and to relax in and enjoy each other\'s company.' },
      { name: 'Sarah L.',  cabin: 'pine-shadows', when: 'September 2026',
        text: 'Loved our stay. Beautiful spot and private.' },
      { name: 'Chris F.',  cabin: 'wilderness-escape-retreat', when: 'September 2026',
        text: 'Robyn\'s place had everything I needed.' },
      { name: 'Apurv A.',  cabin: 'wilderness-escape-retreat', when: 'August 2026',
        text: 'We had a wonderful stay, it\'s perfectly located in the woods and not far from Yellowstone national park. The home has ample amount of seating and beds to have all 8 of us sleep and enjoy together. Would highly recommend the stay.' },
      { name: 'Wayne S.',  cabin: 'wilderness-escape-retreat', when: 'July 2026',
        text: 'Great place to stay for a family of seven. Clean and peaceful! Easy commute to Yellowstone.' },
      { name: 'Megan A.',  cabin: 'pine-shadows', when: 'July 2026',
        text: 'Such a cute secluded cabin in the woods. Such a beautiful place to host my entire family on vacation.' },
      { name: 'Sharonda J.', cabin: 'pine-shadows', when: 'July 2026',
        text: 'Very nice and private setting. We loved the getaway and the cabin was perfect.' },
      { name: 'Shruthi M.', cabin: 'wilderness-escape-retreat', when: 'June 2026',
        text: 'It was a beautiful stay! My parents had their first BnB experience and loved it. The home is in a convenient location from the park and west Yellowstone.' },
      { name: 'Alli H.',   cabin: 'pine-shadows', when: 'June 2026',
        text: 'Our stay at Robyn\'s place was just what we needed. We came to see Yellowstone and the location was perfect! We have a large family and the accommodations were just as described and worked very well for us. It was easy to get to from Yellowstone. Thank you!!' },
      { name: 'Adriana R.', cabin: 'pine-shadows', when: 'June 2026',
        text: 'This cabin was absolutely perfect for our family while we visited Yellowstone with three adults and three kids. Robyn provided everything we needed and had great recommendations. Her response time was quick and she was always very helpful. The house was clean and had a good amount of space for our kids. The road getting in was easy to find and we also loved how private it felt. Nighttime was quiet and the firepit was a huge plus. I would love to stay here again if we come back to Yellowstone.' },
      { name: 'Sai Kiran B.', cabin: 'wilderness-escape-retreat', when: 'June 2026',
        text: 'This stay had everything Robyn mentioned, and we really loved all aspects of it, the wilderness, the amenities, and Robyn\'s communication. I would definitely visit again in the future. There were plenty of board games as well, but we only noticed them toward the end of our trip, so we didn\'t get a chance to play them. Overall, I\'d recommend this stay to anyone looking for a secluded getaway with family or friends.' },
      { name: 'Jeffrey D.', cabin: 'pine-shadows', when: 'June 2026',
        text: 'Very nice and peaceful environment. House cabin is awesome the heater was perfect. We\'ll go back in the future.' },
      { name: 'Heather D.', cabin: 'wilderness-escape-retreat', when: 'June 2026',
        text: 'House is super clean. We enjoyed our stay.' },
      { name: 'Tejas H.',  cabin: 'wilderness-escape-retreat', when: 'May 2026',
        text: 'We had a wonderful stay at this cabin! It perfectly balances feeling private with being easily accessible from the main road. The space had great decor and was stocked with everything we could possibly need. We would definitely book here again.' },
      { name: 'Mara H.',   cabin: 'pine-shadows', when: 'May 2026',
        text: 'We loved the location. It provided privacy, but was also an easy drive to Yellowstone. The host, Robyn, was fantastic. She communicated clearly, and answered my questions promptly. Would definitely recommend this property!' },
      { name: 'Nathaniel F.', cabin: 'pine-shadows', when: 'May 2026',
        text: 'We loved the cabin! Quiet and away from the main road while still providing easy access to Island Park destinations and Yellowstone Park. Beautiful kitchen with all we needed. The kids loved ping-pong and pop-a-shot in the garage. Robyn was very responsive and great to work with as we had a couple of details (not anything wrong with the property or amenities) to coordinate before and during the stay. It\'s obvious this property is well taken care of like someone\'s own family cabin yet was completely welcoming to us as guests. Would stay again!' },
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
        'Pine Shadows sits on a secluded one-acre wooded lot that backs onto Forest Service land, so there are no neighbors behind you. It is the aqua-roofed cabin in our drone photos, about 30 minutes from Yellowstone\'s West Entrance.',
        'Downstairs is a master bedroom with a king bed and a Jack and Jill bathroom. Upstairs is a second master with a king and its own bath, and a big family loft with two bunk beds, a queen and a floor mattress. The laundry mudroom has a half bath and a sink for muddy boots or cleaning fish.',
        'Gather by the fireplace, cook in the fully stocked kitchen, grill on the front deck, and finish the day at the fire pit by the circular drive.',
        'Need to work while you are here? The Wi-Fi is fast and free, good for video calls and big uploads, and the upstairs master is a quiet spot for calls.',
        'Bringing the toys? The circular driveway has room for trucks, trailers and RVs, with water and electric hookups for one camping trailer ($75 per stay). The activity garage next door, with ping pong, foosball, an electronic basketball game and cornhole, can be added for $150 per stay.',
        'Planning a reunion? Wilderness Escape Retreat is right next door, so two families can stay close with a cabin each.',
      ],
      amenities: [
        'Fast, free Wi-Fi, great for remote work', 'Fireplace, firewood provided', 'Air conditioning and central heat', 'Fully stocked kitchen with dishwasher',
        'Crockpot, Instant Pot, electric grill and waffle iron', 'Shampoo, conditioner, body wash and hand soap',
        'Washer and dryer', 'Smart TV, satellite and sound system', 'Front deck with grill', 'Fire pit',
        'Crib and highchair', 'Keypad self check-in', 'Circular drive with room for RVs and trailers',
        'Trailer hookup, $75 per stay', 'Activity garage add-on, $150 per stay',
      ],
      /* lead: a key in photos below (our shoot) or an OwnerRez photo id */
      lead: 'teal-cabin-golden',
      /* Robyn's own photos, shown from her OwnerRez photo host, in the
         order they appear: the first four sit beside the lead photo.
         TODO(client) self-host optimised copies at launch (originals from Robyn). */
      gallery: [
        { id: '396c8d8ac2f94d9b90128b4eae326b66', alt: 'Pine Shadows with its front deck, circular drive and game garage' },
        { id: '3afeb11684574eeb922915bd5c863234', alt: 'Living room with the fireplace and the stairs to the loft' },
        { id: 'fc5c8b3b90384da7bceb13b30756c10d', alt: 'Kitchen and dining table, with room for the whole family' },
        { id: 'e7c82f42d01d4c40b89d5abbaa1d9ad2', alt: 'Downstairs master bedroom with a handcrafted log bed' },
        { id: 'de8aa8c91cc148279cf09acb216324ad', alt: 'Living room with the stone fireplace and a big sectional' },
        { id: '635e186481044695a232181637b9d529', alt: 'Sectional couch and coffee table for games or unwinding' },
        { id: '00d7b54750f14e84ae526f11fa79c137', alt: 'Dining table overlooking the open living area' },
        { id: '068e35a2f1c0466f88e14c17a4495ac2', alt: 'Dining, kitchen and living space' },
        { id: '8f982f8282ab4962b0cde59ac127d507', alt: 'Dining table looking across the living room to the fireplace' },
        { id: '8865712c486f4c1fbdf8dcf4da915839', alt: 'The kitchen, stocked for home-cooked meals' },
        { id: '3a5241e2424d41a58392e86b3aa1cea5', alt: 'Coffee corner on the kitchen counter' },
        { id: '454766bf234f4074aaa545c3e4f3d4fe', alt: 'Coffee maker ready for the morning' },
        { id: 'dc39d9e10561476c9b553c2de7c3185f', alt: 'Downstairs master bedroom' },
        { id: '3663b1cc604a4d93acbe85f7553870a2', alt: 'Downstairs master, with the door to the Jack and Jill bathroom' },
        { id: '4f37a8fd74b143b49c93d737faeace1a', alt: 'Jack and Jill bathroom off the downstairs master' },
        { id: 'eee91d24256d4cd39150b05d04844c32', alt: 'Hallway to the Jack and Jill bathroom and master bedroom' },
        { id: '9f056962a0f941a297a8ac8ae2f45040', alt: 'Bathroom with lodge-style moose decor' },
        { id: 'd65dd44bb9104f04ad9444769f3f8cb7', alt: 'Upstairs master bedroom with a king bed' },
        { id: '3e3397c20b4a4c48ba945c7a6d85eb9c', alt: 'Upstairs master bedroom, with the doorway to the loft' },
        { id: '06bd056da11c43d49added1870d49b71', alt: 'Upstairs master bathroom' },
        { id: '1a59ccbd38ac4294b6447c57d00d0f27', alt: 'Upstairs master bathroom shower' },
        { id: '28453888e5b44c7db4ec8cfcafed95c5', alt: 'Loft bedroom with bunks, a pull-out couch and a TV' },
        { id: 'f7db124d0c2d4d73b386ac0d653df327', alt: 'Loft with two bunk beds and a TV' },
        { id: 'f5923a507e3e411c924f49d1a14188b0', alt: 'Loft with the queen pull-out and the TV' },
        { id: '9e93e7351a274fc1b7d45dd4710e041e', alt: 'Laundry and mudroom with a half bath and a sink for muddy boots or cleaning fish' },
        { id: 'ed9a9e6359be421f995cab88226e1c98', alt: 'Doorway from the living area to the laundry' },
        { id: 'c7023aa3044b4546bcb3b8dd3e3ba928', alt: 'Front deck with the grill and the front entrance' },
        { id: '8c9a69305f654e058adb1bcdacab99eb', alt: 'The grill on the front deck' },
        { id: 'a2eded25f2594c49b74a40aa89438cf1', alt: 'Front deck and picnic area' },
        { id: 'a9a5e546d2314918a9c0b72335005154', alt: 'Front deck and big windows facing the forest' },
        { id: '263aaaac8cc941c0a024e811afa163e8', alt: 'Front entrance and deck' },
        { id: '4ce2624c15f14f00b720e4bf6650fe4b', alt: 'The game garage and the cabin entrance' },
        { id: 'cf9b8e54cb8a46a7b5ab3ffcf5fc565f', alt: 'The activity garage, an add-on with Pine Shadows' },
        { id: 'fd406ade795a412e81077de554a0141c', alt: 'Foosball and ping pong in the activity garage' },
        { id: '452c0b5a50ce4bd5b71792655cdf07d2', alt: 'Cornhole, ping pong, foosball, a serving table, an extra fridge and picnic tables in the garage' },
        { id: 'ffdbe250137148418eaa79c8b2e72153', alt: 'Electronic basketball game in the garage' },
        { id: '94afc7b8814447ceab931f077e3955c9', alt: 'Room for the whole family in the activity garage' },
        { id: 'ef266db89e5a438fa80e17a6434c443b', alt: 'Garage, outdoor basketball hoop and the path to the cabin next door' },
        { id: '07c1525c9ff84e95acbbbcbd2432a5fe', alt: 'Fire pit beside the circular drive' },
        { id: '31f4215c48cc470c91e8e8e9221fdb6e', alt: 'Fire pit and chairs for stargazing' },
        { id: '2d8c11927d604800b598ae71815ee22d', alt: 'The entry to the circular drive at 3810' },
        { id: '5d76723f018b447a80a37f801816e085', alt: 'The cabin and garage tucked into the lodgepole pines, from above' },
        { id: 'f0ff2c11f3194bb9a71deea411021820', alt: 'Pine Shadows and the garage among the pines, from above' },
        { id: '12c6930f406a41dd966dc3a8dbea6002', alt: 'Pine Shadows, the garage and Wilderness Escape Retreat next door, from above' },
        { id: '78bbd40ca2084233a372712f989a76da', alt: 'Drone view from the cabin toward Island Park Reservoir' },
        { id: '989be321dd9c4d59918a35fc1eb18bc6', alt: 'Pine Shadows and the garage in deep snow, with the circular drive cleared' },
        { id: 'af18583bd94b40eda435db771f2e6e97', alt: 'Pine Shadows in winter snow' },
        { id: '8b23941fb93b4e8d964fb5e534b3b2f2', alt: 'Snow piled beside the cabin in winter' },
        { id: '36971c3feab0494994a186262cc627e2', alt: 'Snowy pine forest around the cabin' },
        { id: 'ad2c53f248514213a1a3c8212163b7e2', alt: 'Floor plan of both levels' },
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
      sleeps: 9, bedrooms: 3, baths: 2, sqft: 1100,
      beds: 'a king, 2 queens, a twin and a queen pull-out',
      summary: 'A remodeled single-level cabin with three bedrooms, an air conditioner in the master, a back deck into the pines and a fire pit with the firewood provided.',
      headline: 'Remodeled, single-level and made for slow mornings',
      description: [
        'Wilderness Escape Retreat is the cabin next door to Pine Shadows: a remodeled, single-level cabin on its own one-acre lot in the pines, about 30 minutes from Yellowstone\'s West Entrance.',
        'There are three bedrooms: a master with a king bed, an air conditioner and its own bathroom, a queen room, and a room with a queen and a twin. The second full bathroom has a tub and shower, and the living room has a queen pull-out. The kitchen has a new range and is stocked to cook for the whole group.',
        'The Wi-Fi is fast and free, so working from the cabin is easy: take your calls at the kitchen table, then take your coffee out to the back deck. In the evening, play the board games and puzzles or stream a movie on the 55-inch smart TV. Out back is a fire pit with firewood and roasting sticks, and propane for the grill is included.',
        'ATV and snowmobile trails are close by, and Island Park Reservoir is about 5 minutes away.',
      ],
      amenities: [
        'Fast, free Wi-Fi, great for remote work', 'Air conditioner in the master bedroom', 'Central heat, ceiling and portable fans', 'Bathroom with a tub and shower',
        'Stocked kitchen with a new range', 'Crockpot, Instant Pot, electric grill and waffle iron', 'Shampoo, conditioner, body wash and hand soap',
        'Washer and dryer, soap included', '55-inch smart TV with streaming', 'Board games and puzzles', 'Back deck', 'Grill, propane included',
        'Fire pit with firewood and roasting sticks', 'Crib and highchair', 'Keypad self check-in', 'Single-level home',
      ],
      /* Robyn did not like the old lead photos (7 Oct 2026), so this
         cabin now leads with the back deck, front porch, kitchen, master
         and fire pit. */
      lead: '0e03f55afa08478d9250cb168c1121e9',
      gallery: [
        { id: '0e03f55afa08478d9250cb168c1121e9', alt: 'The back deck, with red chairs and a picnic table under the pines' },
        { id: 'bf706f7444cf4011907fb01fe1b89644', alt: 'The front porch and entrance, with red chairs' },
        { id: '7cfab41187af4ef6b412abc84016003d', alt: 'Open kitchen and living room' },
        { id: '1cb99fcd7da146b5a6fc4860438ef8bf', alt: 'Master bedroom with a king bed' },
        { id: 'a0766f51f15f4c199663ba2774f8d8f2', alt: 'Fire pit with red chairs in the pines' },
        { id: 'e02c18149b8d463f8d7398733fa16d55', alt: 'Open living room and kitchen, with doors to the back deck' },
        { id: '7ff8784d8ca44e9796eb830ef7bfe90e', alt: 'Living room with the TV and a queen pull-out couch' },
        { id: '92517245d15d4a18a7eb33976a90a5fa', alt: 'Living room with leather couches and a bookshelf of games' },
        { id: '48098b16068049aabf34dc5190794da8', alt: 'Living room, with doors to the guest bedrooms and main bathroom' },
        { id: 'd36e27405db4439c9d4429ab5e62e555', alt: 'Living room by the front door' },
        { id: 'f27ce3003ab448f681b017755cb2e054', alt: 'Front door and living room' },
        { id: '1010f12e70ed45b2b7f182b60a32ac8c', alt: 'Living area with the queen pull-out' },
        { id: 'b6e2ef20599746f8a8f96e49df33fad3', alt: 'Living room and the door to the master bedroom' },
        { id: '69fdc3b4f6ee43dbad4582b64ff794e9', alt: 'Remodeled kitchen with new appliances and a dining table' },
        { id: '090a9060309445b6be8f02cc5b147e14', alt: 'Kitchen with a breakfast bar' },
        { id: '4d3983e21ad04a039a2a160eecee8b02', alt: 'Kitchen with new stainless appliances' },
        { id: '576da4a8a0db4acb817a2dd013c0f564', alt: 'Dining table beside the kitchen' },
        { id: 'd3f524b3b51541c4898d0280c94b0f15', alt: 'Kitchen sink looking into the living room' },
        { id: '04b834b8002a4db1b85857420d64e1ec', alt: 'Kitchen cabinets and the dining bench' },
        { id: '7f56d407eef3448490914bd3aec35548', alt: 'New king bed in the master bedroom' },
        { id: '9b2afd76284547fc97d79a089a5324be', alt: 'Master bathroom' },
        { id: '210e198c1418488483b6600195862711', alt: 'Master bathroom with a glass shower' },
        { id: '8a38fff641d1410f8837e118f88ec399', alt: 'Buffalo guest bedroom with a queen bed' },
        { id: '5b7c48e9f12941d98470733f000a96b2', alt: 'Buffalo guest bedroom' },
        { id: 'd9ef9aabfb9c478f99493d06cea73bc1', alt: 'Buffalo guest bedroom and closet' },
        { id: '159e9f0a22324136a1f4e2659b104d98', alt: 'Guest bedroom with a queen bed and red plaid quilt' },
        { id: 'cffdbb5c5fcc4794a4f15ebac9ae8182', alt: 'Wildlife guest bedroom with a queen and a twin bunk' },
        { id: '8ae5bacc3a2c410e86449b1c7ae1204b', alt: 'Wildlife guest bedroom' },
        { id: 'fc1f010763c94657bb4057d4bd8b3b01', alt: 'Wildlife guest bedroom and the bunk bed' },
        { id: 'd145752c5ec94f8aaf7dffe8d5936a4b', alt: 'Main bathroom with a tub and shower' },
        { id: 'cfd1c0bb16ae496bab0b4d0da2591e01', alt: 'Shared guest bathroom' },
        { id: '8e50298b885242eba4d56a983e3aaaf0', alt: 'Laundry with a washer and dryer' },
        { id: 'eac62484f6d14da88af3e914a09f55e8', alt: 'Red chairs on the back deck' },
        { id: '878fe0465ce045b4959db007d219d908', alt: 'Back deck chairs under the pines' },
        { id: 'aabb9e5680474f968ea79e076860a817', alt: 'Back deck with seating for a crowd' },
        { id: '3284d043e87146c0a1baf03ccf0f1773', alt: 'The cabin from the circular drive, with its new front deck' },
        { id: '56c454b1d7bb49ffac9231d84c7d586f', alt: 'Driveway entrance with the cabin sign' },
        { id: 'c1fa343966f14b50bd49e97755517065', alt: 'The drive to the cabin and its wooden sign' },
        { id: 'edc35cc941884ac7844efc9ebaaefca9', alt: 'The cabin in the thick of the pines, from above' },
        { id: '3d5b7b621f334c77b2860ff2b37cbe18', alt: 'The cabin nestled in the pines, from above' },
        { id: 'f9785861d45d4971b781422466e8623a', alt: 'The cabin among the pines, from above' },
        { id: 'd8421e21922b477f94950cd8f8dba35e', alt: 'Private forest on the one-acre lot' },
        { id: 'ece1cc0e0a494b8e8e9217d931d93049', alt: 'Lodgepole forest around the cabin' },
        { id: '4350364df639421199d667bf627d558e', alt: 'The one-acre lot in the trees' },
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

  /* The FAQ page shows every group; home shows the ones marked home. */
  faqGroups: [
    { id: 'booking', label: 'Booking' },
    { id: 'cabins',  label: 'In the cabins' },
    { id: 'area',    label: 'Getting here and the area' },
  ],
  faq: [
    { group: 'booking', home: true, q: 'How do we book?', a: 'Right here on our website. Pick a cabin and your dates on the booking page, see your total, and pay securely online. Your rental agreement follows by email.' },
    { group: 'booking', q: 'Will we see the price before we book?', a: 'Yes. Choose your dates in the booking box and it shows the nightly rate, taxes and fees, and your total before you pay.' },
    { group: 'booking', home: true, q: 'Can we book both cabins for a reunion?', a: 'Yes. Pine Shadows (sleeps 12) and Wilderness Escape Retreat (sleeps 9) are next door to each other with the activity garage between them, so up to 21 people can stay together. Book each cabin for the same dates, or email us and we will help you set it up.' },
    { group: 'booking', q: 'What is the cancellation policy?', a: 'Full refund more than 30 days before arrival, half refund more than 14 days before, and no refund within 14 days.' },
    { group: 'booking', q: 'Do you allow pets or smoking?', a: 'No pets, and no smoking or vaping, inside or out. Guests must be 21 or older to rent.' },
    { group: 'cabins', home: true, open: true, q: 'Is the Wi-Fi good enough to work from the cabin?', a: 'Yes, it is fast and it is great for work. Both cabins have free high-speed Wi-Fi that handles video calls, big uploads and streaming with no trouble. Answer email on the deck in the morning, spend the afternoon in Yellowstone, and stream a movie on the smart TV at night.' },
    { group: 'cabins', home: true, q: 'What toiletries are provided?', a: 'Shampoo, conditioner, body wash and hand soap are in both cabins, along with all the linens and towels.' },
    { group: 'cabins', home: true, q: 'What is in the kitchen?', a: 'Both kitchens are stocked for real cooking: pots, pans, dishes, coffee and spices, plus a Crockpot, an Instant Pot, an electric grill, a waffle iron, food storage containers and Ziploc bags for packing a park lunch. Pine Shadows also has a dishwasher.' },
    { group: 'cabins', q: 'Is there air conditioning?', a: 'Pine Shadows has air conditioning. Wilderness Escape Retreat has an air conditioner in the master bedroom, plus ceiling and portable fans, and summer nights here are cool, usually in the 40s.' },
    { group: 'cabins', q: 'What else is provided?', a: 'Firewood for the fire pit, a crib and a highchair at both cabins, and board games and puzzles at Wilderness Escape Retreat. Bring bear spray if you plan to hike.' },
    { group: 'cabins', q: 'What is the activity garage?', a: 'A garage between the cabins with ping pong, foosball, an electronic basketball game, cornhole, picnic tables and an extra fridge. It can be added to a Pine Shadows stay for $150.' },
    { group: 'cabins', q: 'Can we bring a trailer or RV?', a: 'Yes. Pine Shadows has a circular drive with room for trailers and RVs, and water and electric hookups for one camping trailer for $75 per stay.' },
    { group: 'cabins', q: 'What time are check-in and checkout?', a: 'Check-in is from 4:00 pm with a keypad, so you can arrive whenever suits you after that. Checkout is 10:00 am.' },
    { group: 'area', home: true, q: 'How far is Yellowstone?', a: 'About 30 minutes to the West Entrance at West Yellowstone, roughly 30 miles. In summer, get to the gate early: lines and road work can add time.' },
    { group: 'area', home: true, q: 'Where do we buy groceries?', a: 'Sam Patch Co. in Island Park is the closest grocery store, about 15 minutes away. For a big shop, Dave\'s Jubilee in Ashton is about 45 minutes and Broulim\'s in St. Anthony about an hour. Elk Creek Station, 10 minutes away, has gas and the basics.' },
    { group: 'area', q: 'Is there anything to do in the evening?', a: 'Live theatre: the Playmill Theatre near Mack\'s Inn, the Yellowstone Playhouse dinner theatre above Henrys Lake, and the Westgate Theatre in West Yellowstone. Or stay in for the fire pit and the stars.' },
    { group: 'area', q: 'Where are the nearest restaurants?', a: 'Lakeside Lodge, Pond\'s Lodge and Boondocks Roadhouse are about 10 minutes away, and Cafe Sabor and The Parlor at Mack\'s Inn about 15. West Yellowstone has dozens more. Our guide lists them all with drive times.' },
  ],

  checkout: {
    lede: 'Thanks for staying with us. A few quick things before you head out.',
    returnHead: 'Come back in another season',
    returnLede: 'Island Park is a different place in winter, spring and fall. Book your next stay on our website anytime.',
  },

  /* Every photo on the site, with its alt text and shape (w:h).
     Files live in assets/photos/<key>-{640,1200,2400}.webp + -1200.jpg */
  photos: {
    'canopy-three-roofs':     { w: 4, h: 3, alt: 'The two cabins and the game garage from above, with the gravel drives between the pines' },
    'canopy-three-roofs-low': { w: 4, h: 3, alt: 'Looking straight down on the property: Pine Shadows and the game garage under aqua roofs, and Wilderness Escape Retreat under a mauve roof, in the lodgepole pines' },
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
    'morning-glory-pool':     { w: 3, h: 4, focus: '50% 60%', alt: 'Morning Glory Pool, a deep turquoise hot spring ringed in orange at the far end of the Upper Geyser Basin boardwalk' },
    'grand-prismatic':        { w: 4, h: 3, focus: '50% 55%', alt: 'Steam rising off Grand Prismatic Spring over its orange runoff channels, with a forested hill behind' },
    'upper-mesa-falls':       { w: 3, h: 4, focus: '30% 62%', alt: 'Upper Mesa Falls pouring into the Henry\'s Fork, seen from the boardwalk railing, with pine forest on the far rim' },
  },
};
