/* ═══════════════════════════════════════════════════════════════
   Wilderness Escape Rentals · THE GUIDE
   ───────────────────────────────────────────────────────────────
   Every stop in the things-to-do guide, the map pins, day plans,
   wildlife, food, supplies, events and practical notes.
   Research and sources: ../Docs/research/*.md (checked Sept 2026).

   drive = estimated minutes from the cabins, from the OSRM road
   router (free-flowing traffic), rounded to 5 min. Real trips take
   longer, and much longer in Yellowstone traffic or snow. null
   means we could not estimate it honestly, so none is shown.

   Rules: nothing goes in here that we could not confirm. Words are
   ours, not copied. After editing:   node tools/build.mjs
   ═══════════════════════════════════════════════════════════════ */

const SEASONS = [
  { id: 'summer', label: 'Summer', note: 'Mid-June to August. Everything is open, Yellowstone is busy, and nights still drop into the 40s. Bring layers.' },
  { id: 'fall',   label: 'Fall',   note: 'September and October. Fewer people, rutting elk, golden aspens and great fishing. Campgrounds and some businesses start closing after Labor Day.' },
  { id: 'winter', label: 'Winter', note: 'December to March. Deep snow (over 200 inches a year) and hundreds of miles of groomed snowmobile trail. Yellowstone\'s roads close to cars; snowcoach and snowmobile tours run instead.' },
  { id: 'spring', label: 'Spring', note: 'April to early June. The quiet season: the snow melts, Yellowstone\'s roads open in stages from mid-April, and seasonal businesses reopen around Memorial Day.' },
];

/* map pin colours sit on the dusk ground; every one is ≥3:1 there */
const CATEGORIES = {
  'cabins':      { label: 'The cabins',        color: '#E08A2E' },
  'yellowstone': { label: 'Yellowstone sights', color: '#7FD3D1' },
  'wildlife':    { label: 'Wildlife valleys',   color: '#E6C36A' },
  'island-park': { label: 'Island Park',        color: '#C9D98C' },
  'town':        { label: 'Towns and entrances', color: '#EDEAE0' },
  'shows':       { label: 'Shows and museums',  color: '#D9A7C9' },
};

const PLACES = [

  /* ── the cabins (map anchor) ─────────────────────────────── */
  { id: 'cabins', name: 'Wilderness Escape cabins', short: 'The cabins', chapter: null, cat: 'cabins',
    seasons: ['summer', 'fall', 'winter', 'spring'], drive: null, label: 1,
    blurb: 'Pine Shadows and Wilderness Escape Retreat, next door to each other in the pines on the northeast side of Island Park Reservoir. Every drive time on this map is measured from here.',
    lat: 44.4448, lng: -111.3945 },   // Pine Shadows pin on the OwnerRez site (old-site audit §3)

  /* ── ISLAND PARK ─────────────────────────────────────────── */
  { id: 'island-park-reservoir', name: 'Island Park Reservoir', short: 'Island Park Reservoir', chapter: 'island-park', cat: 'island-park',
    kind: 'Lake and boating', area: 'Next to the cabins', seasons: ['summer', 'fall', 'winter'], drive: 5,
    blurb: 'The big reservoir on the Henry\'s Fork is minutes from the cabins, with boat ramps at McCrea Bridge and Buttermilk. Boat, paddle and fish for trout and kokanee in summer, or ice fish near the dam in winter.',
    tip: 'The water drops through late summer. By August the McCrea Bridge ramp no longer reaches it, so use Buttermilk.',
    time: 'Any length', fee: 'Free', kids: true, pick: true, photo: 'reservoir-island',
    url: 'https://www.fs.usda.gov/r04/caribou-targhee/recreation/island-park-reservoir', lat: 44.4238, lng: -111.4054 },

  { id: 'big-springs', name: 'Big Springs and Johnny Sack Cabin', short: 'Big Springs', chapter: 'island-park', cat: 'island-park',
    kind: 'Springs and history', area: 'Mack\'s Inn area', seasons: ['summer', 'fall'], drive: 25,
    blurb: 'One of the largest springs in the country pours out a steady 52°F river: the start of the Henry\'s Fork. Watch huge protected trout from the footbridge, walk the flat riverside trail, and look inside a hand-built 1930s log cabin.',
    tip: 'Johnny Sack Cabin is open mid-June to Labor Day. No fishing at the spring.',
    time: '30 to 90 min', fee: 'Free', kids: true, pick: true, label: 2,
    url: 'https://visitidaho.org/things-to-do/natural-attractions/big-springs/', lat: 44.5003, lng: -111.2553 },

  { id: 'big-springs-float', name: 'Big Springs Water Trail float', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Float trip', area: 'Big Springs to Mack\'s Inn', seasons: ['summer'], drive: 15,
    blurb: 'A calm, clear float of about 5 miles down the spring-fed upper Henry\'s Fork, ending just above Mack\'s Inn. Moose, eagles and sandhill cranes are common along the way.',
    tip: 'Mack\'s Inn River Adventures rents boats with the shuttle, Memorial Day to Labor Day. Life jackets on everyone.',
    time: '2 to 4 hr', fee: 'Rentals from $95 (2026)', kids: true, pick: true,
    url: 'https://www.macksinn.com/River-Adventures' },

  { id: 'harriman', name: 'Harriman State Park', short: 'Harriman State Park', chapter: 'island-park', cat: 'island-park',
    kind: 'State park and wildlife', seasons: ['summer', 'fall', 'spring'], drive: 30, label: 2,
    blurb: 'A historic ranch turned 11,000-acre park inside a wildlife refuge, with moose, elk, eagles and trumpeter swans along 8 miles of the Henry\'s Fork. Summer brings ranch tours on weekends and 22 miles of trails.',
    tip: 'Dogs are allowed only in the parking lots.',
    time: '2 hr to a full day', fee: '$7 per vehicle', kids: true,
    url: 'https://parksandrecreation.idaho.gov/state-park/harriman-state-park/', lat: 44.3226, lng: -111.4604 },

  { id: 'harriman-winter', name: 'Harriman in winter: swans and ski trails', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Skiing and swans', area: 'Harriman State Park', seasons: ['winter'], drive: 30,
    blurb: 'When the park\'s lakes freeze, trumpeter swans gather on the open river, sometimes by the hundreds. Ski or snowshoe more than 20 miles of groomed trail, or rent a rustic yurt.',
    time: 'Half day or more', fee: '$6 per person per day, plus $7 per vehicle', kids: true, pick: true,
    url: 'https://parksandrecreation.idaho.gov/state-park/harriman-state-park/' },

  { id: 'mesa-falls', name: 'Upper and Lower Mesa Falls', short: 'Mesa Falls', chapter: 'island-park', cat: 'island-park',
    kind: 'Waterfalls', area: 'Mesa Falls Scenic Byway', seasons: ['summer', 'fall'], drive: 50, label: 2,
    blurb: 'The Henry\'s Fork drops about 110 feet at Upper Mesa Falls, one of the few big Western waterfalls never dammed. Boardwalks run to the brink, and Lower Mesa Falls is a mile downstream from the Grandview overlook.',
    tip: 'Make it a loop: US-20 south, the Mesa Falls Scenic Byway, Ashton, then back north. Closed to cars in winter.',
    time: '45 to 90 min', fee: '$5 per vehicle at Upper Falls', kids: true, pick: true,
    url: 'https://www.fs.usda.gov/r04/caribou-targhee/recreation/mesa-falls-scenic-highway', lat: 44.188, lng: -111.33 },

  { id: 'box-canyon', name: 'Henry\'s Fork: Box Canyon', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Fly fishing', area: 'Below Island Park Dam', seasons: ['summer', 'fall'], drive: 20,
    blurb: 'Three miles of fast water in a basalt canyon below Island Park Dam, holding big wild rainbows and a famous early-June salmonfly hatch. Wading is rough, so float it with a guide if you are new to it.',
    fee: 'Idaho fishing license', kids: false,
    url: 'https://henrysforkanglers.com/pages/box-canyon' },

  { id: 'railroad-ranch', name: 'Henry\'s Fork: the Ranch', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Fly fishing', area: 'Harriman State Park', seasons: ['summer', 'fall'], drive: 30,
    blurb: 'Inside Harriman State Park the river slows into glassy, wadeable water with large, picky rainbows: one of the most famous dry-fly stretches in the country.',
    tip: 'Local fly shops give June 15 as the opener. Confirm it in the current Idaho fishing rules.',
    fee: 'Idaho fishing license plus park fee',
    url: 'https://trouthunt.com/fishing/map-sections/' },

  { id: 'coffee-pot', name: 'Coffee Pot Rapids Trail', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Hike', area: 'Upper Coffeepot campground', seasons: ['summer', 'fall'], drive: 20,
    blurb: 'An easy riverside trail of about 2.5 miles, out to where the calm Henry\'s Fork turns into whitewater. Wildflowers early in summer, huckleberries later.',
    tip: 'Keep kids well back from the rapids.',
    time: '1.5 to 3 hr', fee: 'Free', kids: true,
    url: 'https://www.fs.usda.gov/r04/caribou-targhee/recreation/upper-coffeepot-campground' },

  { id: 'sawtell', name: 'Sawtell Peak drive', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Scenic drive', area: 'North of Mack\'s Inn', seasons: ['summer', 'fall'], drive: 60,
    blurb: 'A 13-mile gravel road climbs to nearly 9,900 feet. On a clear day you can see Island Park\'s ancient caldera, the reservoir and Henrys Lake, and into Yellowstone and the Tetons. Wildflowers peak in July and August.',
    tip: 'The road is open to the public June 1 to October 31. Bring a warm layer for the top.',
    time: '2 to 3 hr round trip', fee: 'Free', kids: true,
    url: 'https://www.fs.usda.gov/wildflowers/regions/intermountain/SawtellPeak/index.shtml' },

  { id: 'henrys-lake', name: 'Henrys Lake State Park', short: 'Henrys Lake', chapter: 'island-park', cat: 'island-park',
    kind: 'Lake and fishing', seasons: ['summer', 'fall'], drive: 30, label: 2, labelSide: 'left',
    blurb: 'A big mountain lake ringed on three sides by the Continental Divide, famous for trophy cutthroat, brook and hybrid trout. The park has a boat ramp, loaner fishing rods and easy nature trails.',
    tip: 'Trout are catch-and-release from Feb 15 until Memorial Day weekend. Check the current rules.',
    time: '1 hr to a full day', fee: '$7 per vehicle', kids: true,
    url: 'https://parksandrecreation.idaho.gov/state-park/henrys-lake-state-park/', lat: 44.6164, lng: -111.3677 },

  { id: 'warm-river', name: 'Warm River', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Tubing and biking', area: 'Near Ashton', seasons: ['summer'], drive: 60,
    blurb: 'A small, spring-fed river made for lazy tubing, with an old railroad grade alongside for easy biking and walking.',
    kids: true,
    url: 'https://www.fs.usda.gov/r04/caribou-targhee/recreation/warm-river-campground' },

  { id: 'cave-falls', name: 'Cave Falls', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Waterfall', area: 'Yellowstone\'s southwest corner, via Ashton', seasons: ['summer', 'fall'], drive: 100,
    blurb: 'Only about 20 feet tall but some 250 feet wide, it is often called Yellowstone\'s widest waterfall. It sits in the park\'s quiet Bechler corner, and the last 12 miles of road are gravel.',
    tip: 'It is inside the national park, so park and bear rules apply.',
    time: 'Half day with the drive', kids: true,
    url: 'https://www.nps.gov/places/000/cave-falls-picnic-area.htm' },

  { id: 'quake-lake', name: 'Earthquake Lake Visitor Center', short: 'Quake Lake', chapter: 'island-park', cat: 'island-park',
    kind: 'Visitor center', area: 'Montana, below Hebgen Lake', seasons: ['summer'], drive: 55, label: 2, labelSide: 'left',
    blurb: 'Just before midnight on August 17, 1959, a magnitude 7.3 earthquake brought down a mountainside, dammed the Madison River and made a new lake. The visitor center tells the story beside the slide.',
    tip: 'Open Memorial Day to September 15, 10 am to 5 pm.',
    time: '1 hr', fee: 'Free', kids: true,
    url: 'https://www.fs.usda.gov/r01/custergallatin/recreation/earthquake-lake-visitor-center', lat: 44.8308, lng: -111.4256 },

  { id: 'snowmobiling', name: 'Snowmobiling', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Winter', seasons: ['winter'], drive: null,
    blurb: 'Island Park is one of the best-known snowmobile areas in the West, with more than 500 miles of groomed trail that connect to hundreds more around West Yellowstone. Local shops rent sleds and run guided tours.',
    tip: 'Trails are groomed roughly December to March. Out-of-state sleds need an Idaho nonresident certificate ($59.50).',
    pick: true,
    url: 'https://www.fremontcountyid.gov/193/Snowmobiling' },

  { id: 'two-top', name: 'Two Top', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Snowmobile ride', area: 'Idaho and Montana line', seasons: ['winter'], drive: null,
    blurb: 'A high ride on the Idaho and Montana line known for “snow ghosts”, trees frosted solid with rime, and big views over Henrys Lake. Best for experienced riders or with a guide.',
    url: 'https://www.fremontcountyid.gov/193/Snowmobiling' },

  { id: 'atv', name: 'ATV and UTV trails', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Off-road', seasons: ['summer', 'fall'], drive: null,
    blurb: 'The local ranger district has about 615 miles of roads open to motorized travel, from forest two-tracks to the Henrys Lake Flat trails. Several Island Park shops rent machines.',
    tip: 'Riders under 16 need a safety course and a licensed adult close by. Ask the rental shop about permits.',
    url: 'https://www.fs.usda.gov/r04/caribou-targhee/recreation/ashtonisland-park-rd' },

  { id: 'horseback', name: 'Horseback riding', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Trail rides', seasons: ['summer'], drive: null,
    blurb: 'Guided one- and two-hour rides and wagon rides at Harriman State Park with Haviland\'s Old West Adventures, or rides and cowboy cookouts with Yellowstone Horses.',
    tip: 'Riders usually need to be 8 or older; wagon rides suit younger kids.',
    kids: true,
    url: 'https://islandparkchamber.org/play/horseback-riding' },

  { id: 'huckleberries', name: 'Huckleberry picking', chapter: 'island-park', cat: 'island-park', map: false,
    kind: 'Foraging', seasons: ['summer'], drive: null,
    blurb: 'Wild huckleberries ripen in the forest around Island Park in late summer; the Coffee Pot Rapids trail is one known spot. Pick for your own use.',
    tip: 'Bears love them too. Carry bear spray and make noise.',
    kids: true,
    url: 'https://islandparkidaho.com/attractions/coffee-pot-rapids' },

  /* ── YELLOWSTONE ─────────────────────────────────────────
     Coordinates and facts: ../Docs/research/yellowstone-map-points.json
     and yellowstone-guide.md (nps.gov). Drive times: OSRM, rounded. */
  { id: 'west-yellowstone', name: 'West Yellowstone and the West Entrance', short: 'West Yellowstone', chapter: null, cat: 'town',
    seasons: ['summer', 'fall', 'winter', 'spring'], drive: 40, label: 1,
    blurb: 'The gateway town at the West Entrance, the closest way into the park from the cabins: food, gas, the Grizzly and Wolf Discovery Center and the Museum of the Yellowstone.',
    lat: 44.6622, lng: -111.1041 },
  { id: 'macks-inn', name: 'Mack\'s Inn', short: 'Mack\'s Inn', chapter: null, cat: 'town',
    seasons: ['summer', 'fall', 'winter', 'spring'], drive: 15, label: 2, labelSide: 'left',
    blurb: 'The riverside stretch of US-20 on the Henry\'s Fork: float rentals, food, fuel, and since 2026 the Playmill Theatre.',
    lat: 44.5006, lng: -111.3364 },
  { id: 'entrance-north', name: 'North Entrance (Gardiner)', chapter: null, cat: 'town', seasons: ['summer', 'fall', 'winter', 'spring'], drive: 145,
    blurb: 'The Gardiner, Montana gate by the Roosevelt Arch. The road from here through Mammoth to Cooke City stays open to cars all year.',
    lat: 45.0258, lng: -110.7018 },
  { id: 'entrance-northeast', name: 'Northeast Entrance (Cooke City)', chapter: null, cat: 'town', seasons: ['summer', 'fall', 'winter', 'spring'], drive: 200,
    blurb: 'The remote gate past Lamar Valley, near Silver Gate and Cooke City, Montana.',
    lat: 45.0045, lng: -110.0104 },
  { id: 'entrance-east', name: 'East Entrance (toward Cody)', chapter: null, cat: 'town', seasons: ['summer', 'fall'], drive: 190,
    blurb: 'The gate on the road from Cody, Wyoming, over Sylvan Pass to the lake.',
    lat: 44.4886, lng: -110.0039 },
  { id: 'entrance-south', name: 'South Entrance (toward Grand Teton)', chapter: null, cat: 'town', seasons: ['summer', 'fall'], drive: 165,
    blurb: 'The gate on the road from Grand Teton and Jackson. Grand Teton charges its own entrance fee.',
    lat: 44.1357, lng: -110.6668 },

  { id: 'old-faithful', name: 'Old Faithful and the Upper Geyser Basin', short: 'Old Faithful', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Geysers', seasons: ['summer', 'fall', 'spring'], drive: 100, label: 1,
    blurb: 'The park\'s most famous geyser shoots about 130 feet, roughly every 100 minutes. Around it, boardwalks wind past at least 150 more geysers in about a square mile, out to Morning Glory Pool.',
    tip: 'Check eruption predictions at the visitor center or in the NPS app. Go before 10 am or after 4 pm.',
    time: 'Half day', kids: true, pick: true,
    url: 'https://www.nps.gov/yell/planyourvisit/exploreoldfaithful.htm', lat: 44.4605, lng: -110.8283 },

  { id: 'grand-prismatic', name: 'Grand Prismatic Spring', short: 'Grand Prismatic', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Hot spring', area: 'Midway Geyser Basin', seasons: ['summer', 'fall', 'spring'], drive: 85, label: 2,
    blurb: 'Yellowstone\'s largest hot spring, 200 to 330 feet across and ringed in orange. For the famous view from above, climb the short, steep trail to the Grand Prismatic Overlook (1.2 miles round trip).',
    tip: 'Parking is tight from 10 am to 6 pm. Go early or late.',
    time: '1 to 2 hr', kids: true, pick: true,
    url: 'https://www.nps.gov/places/000/grand-prismatic-spring.htm', lat: 44.5252, lng: -110.8383 },

  { id: 'fairy-falls', name: 'Fairy Falls', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Waterfall hike', seasons: ['summer', 'fall'], drive: 85,
    blurb: 'A 200-foot waterfall at the end of a 5.4-mile round trip from the Fairy Falls trailhead, which also passes the Grand Prismatic Overlook.',
    tip: 'The trailhead lot is small and fills early. Bear country: carry bear spray.',
    time: '3 hr', url: 'https://www.nps.gov/thingstodo/yell-trail-fairy-falls.htm', lat: 44.5244, lng: -110.8711 },

  { id: 'fountain-paint-pot', name: 'Fountain Paint Pot', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Boardwalk', seasons: ['summer', 'fall', 'spring'], drive: 80,
    blurb: 'A short boardwalk with all four kinds of thermal feature in one stop: geysers, hot springs, steam vents and bubbling mudpots.',
    time: '30 to 45 min', kids: true,
    url: 'https://www.nps.gov/thingstodo/yell-fountain-paint-pot-trail.htm', lat: 44.5505, lng: -110.8061 },

  { id: 'firehole-canyon', name: 'Firehole Canyon Drive', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Scenic drive', seasons: ['summer', 'fall', 'spring'], drive: 70,
    blurb: 'A one-way side road through a canyon cut into lava flows 800 feet thick, past 40-foot Firehole Falls.',
    tip: 'The swim area was closed in 2026. Check its status before you pack swimsuits.',
    time: '20 to 40 min', kids: true,
    url: 'https://www.nps.gov/yell/planyourvisit/madisonplan.htm', lat: 44.6281, lng: -110.8608 },

  { id: 'madison-river', name: 'Madison River', chapter: 'yellowstone', cat: 'wildlife',
    kind: 'Wildlife and fishing', seasons: ['summer', 'fall', 'spring'], drive: 70,
    blurb: 'The road in from West Yellowstone follows the Madison, a classic fly-fishing river. Watch for bison along the banks and, in fall, bugling bull elk.',
    tip: 'Fishing in the park needs a Yellowstone permit, not a state license.',
    url: 'https://www.nps.gov/yell/planyourvisit/madisonplan.htm', lat: 44.6422, lng: -110.8656 },

  { id: 'norris', name: 'Norris Geyser Basin', short: 'Norris', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Geysers', seasons: ['summer', 'fall', 'spring'], drive: 90, label: 2,
    blurb: 'The hottest and most changeable thermal area in the park, and home of Steamboat, the world\'s tallest active geyser.',
    time: '1 to 2 hr', kids: true,
    url: 'https://www.nps.gov/yell/planyourvisit/norrisplan.htm', lat: 44.7285, lng: -110.7044 },

  { id: 'canyon', name: 'Grand Canyon of the Yellowstone', short: 'Grand Canyon', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Canyon and waterfalls', seasons: ['summer', 'fall', 'spring'], drive: 115, label: 1,
    blurb: 'A yellow-walled canyon with the 308-foot Lower Falls. See it from Artist Point on the South Rim, or take the switchbacks 600 feet down to the Brink of the Lower Falls.',
    tip: 'Sunny days put rainbows in the spray. The climb back up from the brink is steep.',
    time: 'Half day', kids: true, pick: true,
    url: 'https://www.nps.gov/thingstodo/yell-grand-canyon-of-the-yellowstone.htm', lat: 44.7180, lng: -110.4964 },

  { id: 'hayden-valley', name: 'Hayden Valley', chapter: 'yellowstone', cat: 'wildlife',
    kind: 'Wildlife valley', seasons: ['summer', 'fall', 'spring'], drive: 120, label: 2,
    blurb: 'Open valley along the Yellowstone River between Canyon and the lake: bison herds, elk and birds, and sometimes bears and wolves.',
    tip: 'Best at dawn and dusk. This road is open to cars May 1 to October 31.',
    kids: true,
    url: 'https://www.nps.gov/yell/planyourvisit/canyonplan.htm', lat: 44.6791, lng: -110.4821 },

  { id: 'lamar-valley', name: 'Lamar Valley', chapter: 'yellowstone', cat: 'wildlife',
    kind: 'Wildlife valley', seasons: ['summer', 'fall', 'spring'], drive: 165, label: 1,
    blurb: 'The wide valley on the northeast road is known for huge bison and elk herds and some of the best wolf watching in the world.',
    tip: 'A long day from Island Park: leave before dawn and bring binoculars or a spotting scope.',
    kids: true,
    url: 'https://www.nps.gov/yell/planyourvisit/towerrplan.htm', lat: 44.9129, lng: -110.2809 },

  { id: 'mammoth', name: 'Mammoth Hot Springs Terraces', short: 'Mammoth', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Hot springs', seasons: ['summer', 'fall', 'spring'], drive: 130, label: 1,
    blurb: 'Stepped travertine terraces that change from year to year, on boardwalks and the one-way Upper Terrace Drive, beside historic Fort Yellowstone.',
    tip: 'Elk often graze the lawns here, especially during the fall rut.',
    time: '1 to 2 hr', kids: true,
    url: 'https://www.nps.gov/yell/planyourvisit/explore-mammoth.htm', lat: 44.9679, lng: -110.7088 },

  { id: 'west-thumb', name: 'West Thumb Geyser Basin', short: 'West Thumb', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Lakeshore geysers', seasons: ['summer', 'fall'], drive: 125, label: 2,
    blurb: 'Hot springs right on the shore of Yellowstone Lake, some of them underwater, on an easy 0.6-mile boardwalk loop.',
    time: '45 min', kids: true,
    url: 'https://www.nps.gov/thingstodo/yell-trail-west-thumb-geyser-basin.htm', lat: 44.4186, lng: -110.5730 },

  { id: 'mount-washburn', name: 'Mount Washburn', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Summit hike', seasons: ['summer', 'fall'], drive: 125,
    blurb: 'A fire lookout on the summit with some of the biggest views in the park, about 6 miles round trip from Dunraven Pass.',
    tip: 'The Dunraven Pass road is open late May to mid-October.',
    time: '4 to 5 hr',
    url: 'https://www.nps.gov/places/000/mount-washburn.htm', lat: 44.7976, lng: -110.4339 },

  { id: 'tower-fall', name: 'Tower Fall', chapter: 'yellowstone', cat: 'yellowstone',
    kind: 'Waterfall', seasons: ['summer', 'fall'], drive: 150, label: 2, labelSide: 'left',
    blurb: 'A 132-foot waterfall a short walk from the Tower general store.',
    tip: 'The trail to the base is closed.',
    time: '30 min', kids: true,
    url: 'https://www.nps.gov/yell/planyourvisit/towerrplan.htm', lat: 44.8937, lng: -110.3872 },

  { id: 'yellowstone-winter', name: 'Yellowstone in winter', chapter: 'yellowstone', cat: 'yellowstone', map: false,
    kind: 'Snowcoach and snowmobile tours', area: 'From West Yellowstone', seasons: ['winter'], drive: 40,
    blurb: 'From mid-December to mid-March the West Entrance is open only to snowcoaches and guided snowmobiles. Tours leave from West Yellowstone for Old Faithful and the geyser basins in the snow.',
    tip: 'Winter 2026-27 over-snow season: Dec 15 to Mar 15.',
    pick: true,
    url: 'https://www.nps.gov/yell/planyourvisit/parkroads.htm' },

  { id: 'grand-teton', name: 'Grand Teton and Jackson', chapter: 'yellowstone', cat: 'yellowstone', map: false,
    kind: 'Big day trip', area: 'Wyoming', seasons: ['summer', 'fall'], drive: 160,
    blurb: 'The Tetons rise to 13,775 feet just south of Yellowstone. The quickest way from the cabins is through Idaho and over Teton Pass. The best day is a loop: through Yellowstone one way and over the pass the other, or stay a night.',
    tip: 'Grand Teton charges its own $35 fee. Check wyoroad.info before crossing Teton Pass.',
    url: 'https://www.nps.gov/grte/planyourvisit/fees.htm' },

  { id: 'yellowstone-lake', name: 'Yellowstone Lake', short: 'Yellowstone Lake', chapter: null, cat: 'yellowstone', label: 1,
    seasons: ['summer', 'fall'], drive: null,
    blurb: 'North America\'s largest lake above 7,000 feet: 132 square miles, 141 miles of shoreline, and cold all year.',
    lat: 44.4667, lng: -110.3667 },

  { id: 'hebgen-lake', name: 'Hebgen Lake', short: 'Hebgen Lake', chapter: null, cat: 'island-park', label: 2,
    seasons: ['summer', 'fall', 'winter'], drive: null,
    blurb: 'A big reservoir on the Madison River north of West Yellowstone, with boating, fishing and Forest Service campgrounds.',
    lat: 44.7822, lng: -111.2336 },

  /* ── SHOWS, MUSEUMS, RAINY DAYS ─────────────────────────── */
  { id: 'playmill', name: 'The Playmill Theatre', chapter: 'shows', cat: 'shows', map: false,
    kind: 'Family musicals', area: 'Island Park, Mack\'s Inn area', seasons: ['summer', 'fall', 'winter'], drive: null,
    blurb: 'The family musical theatre that played West Yellowstone since 1964 moved into a new, much bigger theatre in Island Park for 2026, with a steakhouse inside. Summer musicals, a fall play and a Christmas show.',
    tip: 'Check the schedule before you come; the new building plans to run year-round.',
    fee: 'About $40 a seat (fall 2026)', kids: true, pick: true,
    url: 'https://www.playmill.com/' },

  { id: 'playhouse', name: 'Yellowstone Playhouse', chapter: 'shows', cat: 'shows', map: false,
    kind: 'Dinner theatre', area: 'Island Park, above Henrys Lake', seasons: ['summer'], drive: null,
    blurb: 'Family-friendly musical spoofs and variety shows with an optional dinner, nightly except Sundays from Memorial Day to Labor Day.',
    kids: true,
    url: 'https://www.yellowstoneplayhouse.com/' },

  { id: 'grizzly-wolf', name: 'Grizzly and Wolf Discovery Center', short: 'Grizzly and Wolf Center', chapter: 'shows', cat: 'shows',
    kind: 'Wildlife center', area: 'West Yellowstone', seasons: ['summer', 'fall', 'winter', 'spring'], drive: 40,
    blurb: 'A nonprofit, accredited wildlife center with grizzlies, wolves, otters and birds of prey that could not survive in the wild. The bears do not hibernate here, so it is just as good in winter.',
    tip: 'Open every day of the year. Your ticket is good for two days in a row.',
    time: '1.5 to 2 hr', fee: 'Adults $17.50, ages 5 to 12 $12.50', kids: true, pick: true,
    url: 'https://www.grizzlydiscoveryctr.org/hours-rates', map: false },

  { id: 'museum-yellowstone', name: 'Museum of the Yellowstone', chapter: 'shows', cat: 'shows', map: false,
    kind: 'History museum', area: 'West Yellowstone', seasons: ['summer', 'fall'], drive: 40,
    blurb: 'Park history in the old Union Pacific depot: early travel, bears, the 1959 earthquake and the 1988 fires.',
    tip: 'Open mid-May to mid-October.',
    time: '1 to 2 hr', fee: 'Adults $10, under 18 free (2026)', kids: true,
    url: 'https://museumoftheyellowstone.org/tickets-hours' },

  { id: 'rodeo', name: 'Wild West Yellowstone Rodeo', chapter: 'shows', cat: 'shows', map: false,
    kind: 'Rodeo', area: 'US-20, west of West Yellowstone', seasons: ['summer'], drive: null,
    blurb: 'Summer-evening rodeo with bronc and bull riding, roping and a kids\' calf scramble.',
    tip: 'Mid-June through August. Gates open at 6 pm, rodeo at 7.',
    time: '2 to 3 hr', fee: 'Adults $25, ages 3 to 11 $15 (2026)', kids: true,
    url: 'https://westyellowstonerodeo.com/' },
];

/* Yellowstone day plans from the cabins (research: yellowstone-guide.md §2) */
const DAYS = [
  { title: 'Geyser day', driveNote: 'About 1 hr 35 min each way to Old Faithful', seasons: ['summer', 'fall', 'spring'],
    summary: 'The classic first day. In through the West Entrance, then south along the Firehole River to Old Faithful, and home the same way.',
    stops: ['Firehole Canyon Drive and Firehole Falls', 'Fountain Paint Pot', 'Grand Prismatic Spring, plus the overlook or Fairy Falls if your legs are fresh', 'Old Faithful and the Upper Geyser Basin boardwalks'],
    note: 'Be at the entrance before 7 am, or come in after noon, and skip the big stops between 10 and 4. Biscuit Basin and Firehole Lake Drive are closed in 2026.' },
  { title: 'Canyon and Hayden Valley', driveNote: 'About 1 hr 50 min each way to Canyon', seasons: ['summer', 'fall', 'spring'],
    summary: 'Waterfalls and wildlife. For a very long day, keep going around the Lower Loop past the lake and home through Old Faithful.',
    stops: ['Norris Geyser Basin (walk Porcelain Basin)', 'Grand Canyon of the Yellowstone: Artist Point, Lookout Point and the Brink of the Lower Falls', 'Hayden Valley late in the day for bison, and maybe bears'],
    note: 'Canyon\'s overlooks change with the light. Try more than one.' },
  { title: 'Lamar Valley wildlife day', driveNote: 'About 2 hr 45 min each way', seasons: ['summer', 'fall', 'spring'],
    summary: 'The wolf watcher\'s day. Wolves are most active at dawn and dusk, which means leaving the cabins well before sunrise.',
    stops: ['Norris, Canyon, then over Dunraven Pass to Tower-Roosevelt (after October 12, go through Mammoth instead)', 'Lamar Valley pullouts with binoculars or a spotting scope', 'Mammoth Hot Springs on the way home'],
    note: 'Bridge work east of Tower Junction can add 30 minutes through November 2026.' },
  { title: 'Mammoth day', driveNote: 'About 2 hr 10 min each way', seasons: ['summer', 'fall', 'spring'],
    summary: 'The north side of the park: travertine terraces, history, and in September and October, bugling elk on the lawns.',
    stops: ['Norris Geyser Basin', 'Roaring Mountain and Obsidian Cliff on the drive north', 'Mammoth terraces, Upper Terrace Drive and Fort Yellowstone'] },
  { title: 'Easy half day', driveNote: 'About 1 hr 10 min to the first stop', seasons: ['summer', 'fall', 'spring'],
    summary: 'For arrival day or tired kids: the closest park sights, back at the cabins by afternoon.',
    stops: ['The Madison River, watching for elk and bison', 'Firehole Canyon Drive and Firehole Falls', 'Fountain Paint Pot'],
    note: 'Or skip the park: Big Springs and the Mesa Falls loop are closer to home.' },
];

const SIGHTS_NOTE = 'Drive times assume no stops and no traffic. Summer days in the park run slower, so add at least a third.';

const PARK_FACTS = [
  { label: 'Entrance fee', value: '$35 per vehicle for 7 days. Yellowstone annual pass $70; America the Beautiful pass $80 for US residents.', url: 'https://www.nps.gov/yell/planyourvisit/fees.htm' },
  { label: 'From outside the US', value: 'New in 2026: $100 per person aged 16 and over on top of the entrance fee, waived with an annual pass. The nonresident annual pass is $250.', url: 'https://www.nps.gov/yell/planyourvisit/fees.htm' },
  { label: 'Reservations', value: 'None needed to get in. There is no timed entry or vehicle reservation in 2026; just buy a pass.', url: 'https://www.nps.gov/yell/planyourvisit/parkroads.htm' },
  { label: 'West Entrance', value: 'Open to cars April 17 to October 31, 2026. From December 15 to March 15 it is open only to snowcoaches and guided snowmobiles.', url: 'https://www.nps.gov/yell/planyourvisit/parkroads.htm' },
  { label: 'Road work', value: 'Delays in 2026 at the Firehole River Bridge south of Old Faithful (October), near Mammoth, and up to 30 minutes east of Tower Junction through November. Road status: go.nps.gov/yellroads or 307-344-2117.', url: 'https://www.nps.gov/yell/planyourvisit/parkroads.htm' },
  { label: 'Closed in 2026', value: 'Biscuit Basin, Firehole Lake Drive (to cars) and the Firehole swim area, as of September 2026.', url: 'https://www.nps.gov/yell/planyourvisit/conditions.htm' },
  { label: 'Gas and food', value: 'There is no gas at Madison or Norris, so fill up in West Yellowstone. Most park food service closes by late October; pack a lunch.', url: 'https://www.nps.gov/yell/planyourvisit/hours.htm' },
  { label: 'Cell service', value: 'Very limited. Download the NPS app and its offline content before you leave the cabins.', url: 'https://www.nps.gov/yell/planyourvisit/goods.htm' },
  { label: 'Fishing', value: 'A Yellowstone permit is required, and state licenses do not count: $40 for 3 days, $55 for 7 days.', url: 'https://www.nps.gov/yell/planyourvisit/fishing.htm' },
];

const PARK_RULES = [
  'Stay at least 100 yards from bears and wolves, and 25 yards from every other animal, including bison and elk. If an animal moves because of you, you are too close.',
  'Bison have injured more people in Yellowstone than any other animal, and they run three times faster than you.',
  'Carry bear spray where you can reach it fast, hike in groups of three or more, and make noise. Never leave the can in a hot car.',
  'Stay on boardwalks and marked trails in thermal areas and keep children close. The water can kill, and soaking in hot springs is illegal.',
  'Never feed wildlife, including birds and squirrels.',
  'Drones are banned in the park.',
  'Pull fully off the road to watch animals. Never stop in a travel lane.',
  'Pets stay in developed areas, never on boardwalks or trails.',
];

/* Wildlife (research: yellowstone-guide.md §4, nps.gov). Dawn and dusk are best for almost everything. */
const WILDLIFE = [
  { name: 'Bison', where: 'Hayden and Lamar valleys all year; along the Madison River and thermal areas in winter; some live around Old Faithful', when: 'All year. Rut late July to August', fact: 'About 5,300 in 2025. Bulls weigh up to 2,000 pounds and can run 35 mph.' },
  { name: 'Elk', where: 'Summer: Madison Canyon and Lamar. Fall: Mammoth and the Madison River', when: 'Rut early September to mid-October, with bugling bulls', fact: '10,000 to 20,000 use the park in summer; fewer than 2,000 stay for winter.' },
  { name: 'Grizzly bear', where: 'Hayden and Lamar valleys, the north slopes of Mount Washburn, and from Fishing Bridge to the East Entrance', when: 'Mostly dawn, dusk and night; very active in fall', fact: 'About 150 to 200 have home ranges in the park. In fall a bear can gain over 3 pounds a day.' },
  { name: 'Black bear', where: 'Around Tower and Mammoth, and toward the Northeast Entrance', when: 'Dawn and dusk, sometimes midday', fact: 'Only about half are actually black; others are brown, blond or cinnamon.' },
  { name: 'Gray wolf', where: 'The northern range, especially Lamar Valley; also Hayden Valley', when: 'Dawn and dusk', fact: '41 wolves were brought back in 1995 to 1997. At least 84 in 8 packs as of January 2026.' },
  { name: 'Moose', where: 'The park\'s southwest corner and river bottoms. Near the cabins: Harriman State Park and the Big Springs float', when: 'Rut late September to early October', fact: 'Fewer than 200 in the park. Cows with calves are unpredictable, so give them room.' },
  { name: 'Pronghorn', where: 'Lamar Valley and near Gardiner', when: 'Breeding mid-September to early October', fact: 'They can hold sprints of 45 to 50 mph.' },
  { name: 'Bighorn sheep', where: 'Mount Washburn along Dunraven Pass in summer; the canyon near Gardiner all year', when: 'Rut begins in November', fact: 'A ram\'s horns can weigh 40 pounds.' },
  { name: 'Bald eagle', where: 'Big rivers and lakes; about half of known nests are around Yellowstone Lake', when: 'Some stay all year', fact: 'Eggs are in the nest from February to mid-April.' },
  { name: 'Trumpeter swan', where: 'Slow rivers and quiet lakes. The best spot near the cabins is Harriman State Park', when: 'Biggest numbers at Harriman in winter', fact: 'North America\'s largest wild waterfowl, with a wingspan up to about 8 feet.' },
];

/* Only places with dated 2025-2026 evidence they are operating
   (research §3). Nearest first. Hours conflict between listings,
   so the chapter tells guests to call ahead. */
const FOOD = [
  { name: 'Lakeside Lodge Restaurant and Bar', kind: 'Steaks, burgers, seafood; bar with reservoir views', town: 'Island Park Reservoir', drive: 10, note: 'Lunch and dinner daily.', url: 'https://www.lakesidelodgeandresort.com/restaurant' },
  { name: 'Boondocks Roadhouse', kind: 'Homemade comfort food: ribs, calzones, cinnamon rolls', town: 'Shotgun Valley', drive: 10, note: 'Reopened December 2025 under new owners. Evenings; days vary.', url: 'https://www.eastidahonews.com/2026/01/beloved-island-park-restaurant-reopens-under-new-management/' },
  { name: 'Shotgun Bar', kind: 'Bar and grill: breakfast, burgers, tamales; live music', town: 'Shotgun Valley', drive: null, note: 'Kitchen days vary by season.', url: 'https://islandparkchamber.org/eat/bar/shotgun-bar' },
  { name: 'Lodgepole Grill', kind: 'American, full bar', town: 'The Pines at Phillips Lodge', drive: 10, note: 'Hours differ between listings.', url: 'https://islandparkchamber.org/stay/lodging/pines' },
  { name: 'Pond\'s Lodge', kind: 'Restaurant, sports bar and pizza', town: 'Ponds Lodge, US-20', drive: 10, note: 'Open all year. Main kitchen closed Tuesdays.', url: 'https://www.pondslodge.com/menus/' },
  { name: 'Cafe Sabor', kind: 'Mexican, full bar, deck on the Henry\'s Fork', town: 'Mack\'s Inn', drive: 15, note: 'Year-round; Wednesday to Sunday in winter.', url: 'https://cafesabor.com/locations' },
  { name: 'The Parlor at Mack\'s Inn', kind: 'Wood-fired pizza and ice cream', town: 'Mack\'s Inn', drive: 15, note: 'Call for hours.', url: 'https://islandparkchamber.org/eat/restaurants/parlor-macks-inn' },
  { name: 'Subway', kind: 'Sandwiches to go', town: 'Mack\'s Inn area', drive: 15, note: 'Handy for packing a park lunch.', url: 'https://islandparkchamber.org/eat/restaurants/subway' },
  { name: 'Steakhouse 64', kind: 'Steakhouse inside the new Playmill Theatre', town: 'Mack\'s Inn area', drive: null, note: 'Opened 2026. Call for hours.', url: 'https://localnews8.com/home/2026/09/03/playmill-theatre-island-park/' },
  { name: 'Last Chance Bar and Grill', kind: 'Scratch breakfast, lunch and dinner on the river', town: 'Last Chance (TroutHunter)', drive: 20, note: 'Seasonal, during fishing season.', url: 'https://trouthunt.com/bar-grill/' },
  { name: 'Angler\'s Riverfront Restaurant', kind: 'Farm-to-table dinners, Henry\'s Fork views', town: 'Last Chance', drive: null, note: 'Dinner mid-May to mid-October. Reserve ahead.', url: 'https://www.anglerslodge.net/restaurant' },
  { name: 'Running Bear Pancake House', kind: 'Breakfast and lunch', town: 'West Yellowstone', drive: 40, note: 'Early start before the park.', url: 'https://www.restaurantji.com/mt/west-yellowstone/running-bear-pancake-house-/' },
  { name: 'Ernie\'s Bakery and Deli', kind: 'Bakery, breakfast, deli to go', town: 'West Yellowstone', drive: 40, note: 'Sandwiches to take into the park.', url: 'https://www.restaurantji.com/mt/west-yellowstone/ernies-/' },
  { name: 'Firehole Bar-B-Que Co.', kind: 'Smoked brisket, pork, ribs', town: 'West Yellowstone', drive: 40, note: 'Seasonal; closes in late September.', url: 'https://fireholebbqco.com/' },
  { name: 'Wild West Pizzeria and Saloon', kind: 'Pizza', town: 'West Yellowstone', drive: 40, note: 'Year-round, with a short spring closure.', url: 'https://www.wildwestpizza.com/' },
  { name: 'Bullwinkle\'s Saloon and Eatery', kind: 'Italian, steaks, game', town: 'West Yellowstone', drive: 40, note: '', url: 'https://www.restaurantji.com/mt/west-yellowstone/bullwinkles-saloon-and-eatery-/' },
  { name: 'Espresso West', kind: 'Coffee, house-made ice cream', town: 'West Yellowstone', drive: 40, note: '', url: 'https://www.restaurantji.com/mt/west-yellowstone/espresso-west-/' },
  { name: 'Frostop Drive In', kind: 'Classic drive-in: burgers, root beer, huckleberry shakes', town: 'Ashton', drive: 45, note: 'On the Mesa Falls loop.', url: 'https://restaurantguru.com/Frostop-Drive-In-Ashton' },
];

/* Groceries, gas, liquor, fly shops, pharmacies, rentals (research §4). */
const SUPPLIES = [
  { name: 'Elk Creek Station', kind: 'Groceries, snacks, bait, propane, gas, ATM', town: 'US-20 at Yale-Kilgore Rd', drive: 10, note: 'The closest store. Liquor store and post office next door.', url: 'https://islandparkidaho.com/groceries-gasoline' },
  { name: 'Island Park Liquor and Sports', kind: 'Idaho liquor store (spirits)', town: 'Next to Elk Creek Station', drive: 10, note: 'Short hours, Wednesday to Saturday. Beer and wine are sold at the grocery stores.', url: 'https://idaholiquor.com/wp-content/uploads/2025/02/locations-directory-2-3.pdf' },
  { name: 'Island Park Post Office', kind: 'Post office', town: 'Next to Elk Creek Station', drive: 10, note: 'Closed Sundays.', url: 'https://www.postallocations.com/id/island-park/island-park' },
  { name: 'Pond\'s Lodge store', kind: 'Convenience store, 24-hour fuel', town: 'Ponds Lodge, US-20', drive: 10, note: '', url: 'https://www.pondslodge.com/amenities/' },
  { name: 'Stage Stop', kind: 'Fuel, propane, groceries', town: 'Mack\'s Inn', drive: 15, note: 'Open daily.', url: 'https://islandparkchamber.org/services/automotive/stage-stop' },
  { name: 'Sam Patch Co. Grocer and Sundries', kind: 'Island Park\'s biggest grocery: produce, meat, deli, fuel, firewood, fishing licenses', town: 'Big Springs Loop Rd', drive: 15, note: 'Formerly Robin\'s Roost.', url: 'https://islandparkchamber.org/eat/groceries/sam-patch-co-grocery-and-sundries' },
  { name: 'Island Park Builders Supply', kind: 'Hardware, propane', town: 'Mack\'s Inn area', drive: 15, note: 'Closed Sundays.', url: 'https://islandparkgeneralstore.com/our-favorite-hardware-stores-in-and-around-island-park-idaho/' },
  { name: 'Island Park General Store', kind: 'Groceries, beer and wine, camping gear, licenses, 24-hour gas', town: 'Last Chance', drive: 20, note: '', url: 'https://islandparkgeneralstore.com/' },
  { name: 'Henry\'s Fork Anglers', kind: 'Fly shop and guides', town: 'Last Chance', drive: 20, note: 'Open year-round.', url: 'https://henrysforkanglers.com/pages/contact' },
  { name: 'TroutHunter', kind: 'Fly shop and guides', town: 'Last Chance', drive: 20, note: '', url: 'https://trouthunt.com/contact/' },
  { name: 'Mack\'s Inn River Adventures', kind: 'Float rentals with shuttle', town: 'Mack\'s Inn', drive: 15, note: 'Memorial Day to Labor Day.', url: 'https://www.macksinn.com/River-Adventures' },
  { name: 'Island Park Rentals', kind: 'ATVs, UTVs, boats, paddleboards, snowmobiles', town: 'Island Park', drive: null, note: '', url: 'https://islandparkrentals.com' },
  { name: 'Island Park Backcountry Rentals', kind: 'Snowmobiles and gear', town: 'Yale-Kilgore Rd', drive: null, note: 'Winter.', url: 'https://islandparkchamber.org/play/snowmobiling/island-park-back-country-rentals' },
  { name: 'Market Place', kind: 'Full supermarket, deli, bakery; Montana liquor store inside', town: 'West Yellowstone', drive: 40, note: 'Open all year.', url: 'https://destinationyellowstone.com/places/market-place/' },
  { name: 'Food Roundup Supermarket', kind: 'Supermarket with bakery and deli', town: 'West Yellowstone', drive: 40, note: '', url: 'https://www.foodroundupsupermarket.com/about-us' },
  { name: 'Silvertip Pharmacy', kind: 'Pharmacy (there is none in Island Park)', town: 'West Yellowstone', drive: 40, note: 'Weekdays only.', url: 'https://www.healthgrades.com/pharmacy/silvertip-pharmacy-pa00011755' },
  { name: 'Dave\'s Jubilee Market', kind: 'Supermarket with deli', town: 'Ashton', drive: 45, note: '', url: 'https://www.davesjubilee.com/' },
  { name: 'Walmart Supercenter', kind: 'Big-box store', town: 'Rexburg', drive: 70, note: '', url: 'https://nominatim.openstreetmap.org/search?q=Walmart,+Rexburg,+Idaho&format=json' },
  { name: 'Costco', kind: 'Warehouse store', town: 'Idaho Falls', drive: 100, note: 'Worth a stop on the drive in from Idaho Falls airport.', url: 'https://nominatim.openstreetmap.org/search?q=Costco,+Idaho+Falls&format=json' },
];

/* Month order. Only events with an official listing. */
const EVENTS = [
  { when: 'Early to mid January', name: 'Fat Pursuit', town: 'Sawtelle Mountain Resort, Island Park', note: 'Fat bike, ski and running races on the groomed snowmobile trails. Spectators can watch at checkpoints.', url: 'https://www.fatpursuit.com/racedetails' },
  { when: 'Jan 23, 2027', name: 'Hebgen Lake Ice Fishing Tournament', town: 'Hebgen Lake, Montana', note: 'Two-person team ice-fishing contest.', url: 'https://westyellowstonemticefishing.com/' },
  { when: 'One weekend a month, Dec to Mar', name: 'Kids\'N\'Snow', town: 'West Yellowstone', note: 'Free or low-cost family winter days: skiing and snowshoe basics, ice fishing, sledding, dog-sled rides.', url: 'https://kidsnsnow.org/' },
  { when: 'February', name: 'SPAM Cup', town: 'Rendezvous Ski Trails, West Yellowstone', note: 'A casual citizens\' cross-country ski race.', url: 'https://www.skirunbikemt.com/ski/spam-cup' },
  { when: 'Third weekend of February', name: 'American Dog Derby', town: 'Ashton', note: 'Historic sled-dog race dating to 1917, with family events. Snow permitting; the 2026 race was cancelled.', url: 'https://americandogderby.com/' },
  { when: 'March 6, 2027', name: 'Yellowstone Rendezvous Race', town: 'Rendezvous Ski Trails, West Yellowstone', note: 'Big citizens\' ski race from 2K to 50K, with youth age groups.', url: 'https://www.skirunbikemt.com/yellowstone-rendezvous-race/home' },
  { when: 'Early March', name: 'Octane Snowmobile Expo', town: 'West Yellowstone', note: 'Vintage sled racing, kids\' racing, a freestyle show and vendors.', url: 'https://bozemanmagazine.com/events/2026/03/06/194800-2026-octane-expo' },
  { when: 'Mid-June', name: 'Yellowstone Half Marathon and 5K', town: 'West Yellowstone', note: 'Road half marathon and 5K.', url: 'https://www.runguides.com/event/29077/yellowstone-half-marathon-5k' },
  { when: 'Late June, late July, Labor Day weekend', name: 'Island Park Festival', town: 'Island Park', note: 'Free weekend fair with vendors, artisans and food, three times a summer.', url: 'https://islandparkfestival.com/' },
  { when: 'July 4', name: 'West Yellowstone Fourth of July', town: 'West Yellowstone', note: 'Barbecue, a 6 pm parade, music in the park and fireworks after dark.', url: 'https://destinationyellowstone.com/july-4th/' },
  { when: 'July 4', name: 'Ashton Fourth of July', town: 'Ashton', note: 'Breakfast, a 10 am Main Street parade, a car show and fireworks at 10 pm.', url: 'https://islandparkchamber.org/events/ashtons-4th-july-celebration' },
  { when: 'July to mid-August', name: 'Music in the Park', town: 'Pioneer Park, West Yellowstone', note: 'Free outdoor concerts.', url: 'https://destinationyellowstone.com/music-in-the-park/' },
  { when: 'Late July or early August', name: 'West Yellowstone Festival', town: 'West Yellowstone', note: 'Free weekend vendor and food festival.', url: 'https://westyellowstonefestival.com/' },
  { when: 'Fridays, June to September', name: 'Henry\'s Fork Farmers Market', town: 'Ashton', note: '4 to 7 pm at the trail visitor center.', url: 'https://ashtonidaho.com/membership/shopping/henrys-fork-farmers-market' },
  { when: 'Late September', name: 'Sasquatch Search', town: 'Around Island Park', note: 'Family scavenger hunt for 21 hand-carved wooden Sasquatches.', url: 'https://islandparkchamber.org/events/sasquatch-search' },
  { when: 'Late October', name: 'Haunts of Harriman', town: 'Harriman State Park', note: 'Halloween family evenings in the old ranch buildings (Oct 23 and 24, 2026).', url: 'https://parksandrecreation.idaho.gov/state-park/harriman-state-park/' },
  { when: 'Thanksgiving week', name: 'Yellowstone Ski Festival', town: 'Rendezvous Ski Trails, West Yellowstone', note: 'Cross-country ski clinics, races, a ski swap and an expo (Nov 21 to 28, 2026). Cancelled if there is no snow.', url: 'https://www.skirunbikemt.com/yellowstone-ski-festival/home' },
];

const PRACTICAL = [
  { label: 'Emergencies', value: 'Call 911. Island Park has no hospital or 24-hour emergency room.' },
  { label: 'Nearest ER', value: 'Madison Memorial Hospital, 450 E Main St, Rexburg: about 1 hr 15 min. (208) 359-6900.', url: 'https://madisonhealth.org/locations/emergency-room/' },
  { label: 'Clinic', value: 'Island Park Medical Clinic, by Pond\'s Lodge on US-20, about 10 min: weekdays 8 to 5, walk-ins welcome, X-ray and stitches. (208) 558-7766.', url: 'https://ashtonmemorial.com/services/island-park-medical-clinic' },
  { label: 'Pharmacy', value: 'There is none in Island Park. The nearest are in West Yellowstone and Ashton, both weekdays only.', url: 'https://ashtonmemorial.com/services/ashton-community-pharmacy' },
  { label: 'Cell service', value: 'Patchy in the forest. Download offline maps and your booking details before you arrive.', url: 'https://coveragemap.com/coverage/us/idaho/fremont/island-park' },
  { label: 'Altitude', value: 'The cabins sit at about 6,300 feet. Headache, nausea or dizziness can be altitude sickness: rest, drink water, and get help if it gets worse.', url: 'https://www.nps.gov/yell/planyourvisit/safety.htm' },
  { label: 'Weather', value: 'July averages 77°F by day and 43°F at night; frost is possible in any month. January averages 27°F by day and 6°F at night, with over 200 inches of snow a year. Pack layers and rain gear in every season.', url: 'https://en.wikipedia.org/wiki/Island_Park,_Idaho' },
  { label: 'Fishing licenses', value: 'Idaho: everyone 14 and older needs a license; a nonresident day license is $22.75 for the first day and $7 for each extra day. Yellowstone needs its own permit ($40 for 3 days), and state licenses do not count there. The Henry\'s Fork from the Henrys Lake Outlet up to Big Springs is closed to fishing.', url: 'https://idfg.idaho.gov/licenses/fees-nonresident' },
  { label: 'Boats and paddleboards', value: 'Out-of-state boats, kayaks, canoes, rafts and paddleboards need an Idaho invasive species sticker ($7 non-motorized, $30 motorized), and must stop at any open inspection station.', url: 'https://invasivespecies.idaho.gov/invasive-species-sticker-faqs' },
  { label: 'Roads', value: 'Idaho road conditions: 511.idaho.gov or dial 511. Yellowstone road recording: (307) 344-2117.', url: 'https://itd.idaho.gov/travel/' },
  { label: 'Bears and moose', value: 'Grizzlies live around Island Park. On the National Forest, food and trash must be stored in a vehicle, a building or a bear-proof container from March 1 to December 1. Carry bear spray, bring in bird feeders, and give moose plenty of room, especially cows with calves.', url: 'https://www.fs.usda.gov/r04/caribou-targhee/alerts/04-15-23-217-food-storage-order' },
  { label: 'Fire', value: 'Fireworks are banned on the National Forest. Check current fire restrictions before any campfire.', url: 'https://gacc.nifc.gov/gbcc/dispatch/id-eic/restrictions.php' },
  { label: 'Useful numbers', value: 'Island Park Ranger Station (208) 558-7301. Island Park Chamber of Commerce 208-558-7755. Fremont County Sheriff (208) 624-4482.', url: 'https://www.fs.usda.gov/r04/caribou-targhee/offices' },
];
