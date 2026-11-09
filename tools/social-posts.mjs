/* ============================================================================
   tools/social-posts.mjs · this month's Facebook and Instagram posts for
   tools/print.mjs, which renders each image (1080 x 1350) and Posts.md
   into ../Social Media/<batch>/. The services agreement covers up to 4
   posts a month on Robyn's own accounts. Facts come from js/config.js;
   keep them in step (no claims about plowing, prices or pets).
   ========================================================================== */
const EMAIL = 'info@wildernessescaperentals.com';
const SITE = 'wildernessescaperentals.com';
const LONG = `Message us or email ${EMAIL} for long-term rates and details.`;

export const SOCIAL = {
  /* Robyn, 6 Nov 2026: posts to get the cabins renting, and to say she will
     rent long-term from January to April ("contact me for details") */
  batch: '2026-11 Winter long-term',
  hashtags: '#IslandPark #IslandParkIdaho #Yellowstone #WestYellowstone #IdahoCabin #CabinRental #WinterInIdaho #Snowmobiling #RemoteWork #MonthlyRental',
  posts: [
    {
      file: '1 Winter long-term stays', when: 'Monday 9 November',
      photo: '989be321dd9c4d59918a35fc1eb18bc6', pos: '50% 60%',
      sign: 'Long-term stays', title: 'Spend the winter in Island Park',
      lede: 'Both cabins are open January to April 2027, fully furnished, with fast Wi-Fi, a stocked kitchen and a washer and dryer.',
      facts: ['January to April', 'Two cabins', 'Fast Wi-Fi'],
      foot: `Details: ${EMAIL}`,
      facebook: `Spend the winter in Island Park! Both of our cabins are open for long-term stays from January to April 2027.

Pine Shadows sleeps 12, and Wilderness Escape Retreat, right next door, sleeps 9. Each is fully furnished, with a stocked kitchen, a washer and dryer, and fast Wi-Fi that's great for working from the cabin. Snowmobile trails are close by, and Yellowstone's West Entrance is about 30 minutes away for snowcoach and guided snowmobile tours.

${LONG}

${SITE}`,
      instagram: `Spend the winter in Island Park! Both of our cabins are open for long-term stays from January to April 2027.

Pine Shadows sleeps 12, and Wilderness Escape Retreat, right next door, sleeps 9. Each is fully furnished, with a stocked kitchen, a washer and dryer, and fast Wi-Fi that's great for working from the cabin. Snowmobile trails are close by, and Yellowstone's West Entrance is about 30 minutes away for snowcoach and guided snowmobile tours.

Send us a message or email ${EMAIL} for long-term rates and details.`,
    },
    {
      file: '2 Pine Shadows', when: 'Wednesday 11 November',
      photo: 'de8aa8c91cc148279cf09acb216324ad',
      sign: 'Pine Shadows', title: 'Room for the whole family',
      lede: 'Two king bedrooms, a loft with bunks, a stone fireplace and a big stocked kitchen, backed by national forest.',
      facts: ['Sleeps 12', '3 bedrooms', '2.5 baths'],
      foot: `Book at ${SITE}`,
      facebook: `Meet Pine Shadows, our bigger cabin: two king bedrooms, a family loft with bunk beds, a stone fireplace and a fully stocked kitchen, on a wooded acre that backs onto national forest. It sleeps 12, and Wilderness Escape Retreat is right next door when the group gets bigger.

Book on our website, with no Airbnb or VRBO service fees: ${SITE}/book

Staying a while? Pine Shadows is open for long-term stays from January to April. ${LONG}`,
      instagram: `Meet Pine Shadows, our bigger cabin: two king bedrooms, a family loft with bunk beds, a stone fireplace and a fully stocked kitchen, on a wooded acre that backs onto national forest. It sleeps 12, and Wilderness Escape Retreat is right next door when the group gets bigger.

Book on our website with no Airbnb or VRBO service fees (link in bio).

Staying a while? Pine Shadows is open for long-term stays from January to April. Send us a message or email ${EMAIL}.`,
    },
    {
      file: '3 Wilderness Escape Retreat', when: 'Monday 16 November',
      photo: '7cfab41187af4ef6b412abc84016003d',
      sign: 'Wilderness Escape Retreat', title: 'Remodeled and single-level',
      lede: 'Three bedrooms, two baths, a new range and fridge in the kitchen and a fire pit out back, right next door to Pine Shadows.',
      facts: ['Sleeps 9', '3 bedrooms', '2 baths'],
      foot: `Book at ${SITE}`,
      facebook: `Wilderness Escape Retreat is our remodeled, single-level cabin: three bedrooms, two baths, a kitchen with a new range and fridge, and a back deck and fire pit in the pines. It sleeps 9, with fast Wi-Fi, board games and a 55-inch smart TV for the evenings.

Book on our website, with no Airbnb or VRBO service fees: ${SITE}/book

Looking for a winter rental? It's open for long-term stays from January to April. ${LONG}`,
      instagram: `Wilderness Escape Retreat is our remodeled, single-level cabin: three bedrooms, two baths, a kitchen with a new range and fridge, and a back deck and fire pit in the pines. It sleeps 9, with fast Wi-Fi, board games and a 55-inch smart TV for the evenings.

Book on our website with no Airbnb or VRBO service fees (link in bio).

Looking for a winter rental? It's open for long-term stays from January to April. Send us a message or email ${EMAIL}.`,
    },
    {
      file: '4 Work from the cabin', when: 'Thursday 19 November',
      photo: '36971c3feab0494994a186262cc627e2',
      sign: 'January to April 2027', title: 'Work from the cabin this winter',
      lede: 'Fast, free Wi-Fi for video calls and big files. Take a meeting at the kitchen table, then head out on the snow.',
      facts: ['Long-term stays', 'Fully furnished', 'Fast Wi-Fi'],
      foot: `Details: ${EMAIL}`,
      facebook: `Working remotely this winter? Both of our cabins have fast, free Wi-Fi that handles video calls, big files and streaming, so you can take a meeting at the kitchen table in the morning and be out on the snow by afternoon.

We're renting both cabins long-term from January to April 2027, fully furnished with a stocked kitchen and a washer and dryer. ${LONG}`,
      instagram: `Working remotely this winter? Both of our cabins have fast, free Wi-Fi that handles video calls, big files and streaming, so you can take a meeting at the kitchen table in the morning and be out on the snow by afternoon.

We're renting both cabins long-term from January to April 2027, fully furnished with a stocked kitchen and a washer and dryer. Send us a message or email ${EMAIL} for rates and details.`,
    },
  ],
};
