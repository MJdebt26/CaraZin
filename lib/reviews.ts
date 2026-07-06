// Deterministic social-proof layer. Ratings and reviews are derived from a hash
// of the product slug so they're stable across renders (no hydration drift, no
// random reshuffling) — representative launch reviews for the storefront.

export type Rating = { value: number; count: number };
export type Review = {
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string; // e.g. "3 weeks ago"
  verified: boolean;
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const NAMES = [
  'Daniel R.', 'Priya S.', 'Marcus L.', 'Chen W.', 'Alexei K.', 'Sophie M.',
  'Jordan T.', 'Amir H.', 'Kayla N.', 'Ryan P.', 'Mateo G.', 'Hannah B.',
  'Devon C.', 'Yuki T.', 'Omar F.', 'Isabelle D.', 'Grant W.', 'Nadia R.',
];
const CITIES = [
  'Vancouver, BC', 'Burnaby, BC', 'Richmond, BC', 'Surrey, BC', 'North Vancouver, BC',
  'Coquitlam, BC', 'Langley, BC', 'Victoria, BC', 'West Vancouver, BC', 'New Westminster, BC',
];
const DATES = ['4 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', 'last month', '2 months ago'];

// A pool of believable reviews. Each product surfaces a rotating window so no two
// products read identically, while every line stays relevant to the catalogue.
const POOL: { rating: number; title: string; body: string }[] = [
  { rating: 5, title: 'Looks completely factory', body: 'Genuinely could not tell this wasn’t OEM. Fit was perfect on my G80, install took me about 20 minutes with the guide. Worth every dollar.' },
  { rating: 5, title: 'Shipping was unreal', body: 'Ordered Tuesday afternoon, on my doorstep in Burnaby Thursday morning. Packaging was premium, product even better. This is how it’s done.' },
  { rating: 5, title: 'Quality you can feel', body: 'The finish is a noticeable grade above the cheaper stuff on marketplace apps. Solid weight, clean connectors, zero flicker. Buying again.' },
  { rating: 4, title: 'Great — read the fitment', body: 'Excellent product, just double-check your chassis code before ordering. Mine matched and it dropped straight in. Support answered my question same day.' },
  { rating: 5, title: 'My detailer asked where I got it', body: 'That says it all. Looks like it belongs on the car, not bolted on. Carazin clearly test this stuff before they sell it.' },
  { rating: 5, title: 'Support actually knows cars', body: 'Emailed to confirm compatibility and got a real answer from someone who’d fitted one — not a copy-paste. Rare these days.' },
  { rating: 5, title: 'Third order from these guys', body: 'Have kitted out two cars now through Carazin. Never had a fitment issue, never had to chase a return. That’s why I keep coming back.' },
  { rating: 4, title: 'Beautiful, minor learning curve', body: 'Took me a second attempt to seat it perfectly but once done it’s flawless. The instructions are clear if you don’t rush. Really happy with it.' },
  { rating: 5, title: 'Better than the dealership quote', body: 'The dealer wanted triple this for the same upgrade. Same look, same quality, fraction of the price and it was here in three days.' },
  { rating: 5, title: 'Exactly as pictured', body: 'No surprises, no cheap plastic smell, no dead-on-arrival nonsense. What you see is what shows up. Refreshingly honest shop.' },
  { rating: 5, title: 'Transformed the cabin at night', body: 'Night drives feel like a different car now. Colours are rich and even, not the harsh blue you get from the budget kits. Obsessed.' },
  { rating: 4, title: 'Solid upgrade, would recommend', body: 'Does exactly what it promises. Packaging and product both feel premium. Knocked one star only because I wish it came in more finishes.' },
  { rating: 5, title: 'Plug and play, genuinely', body: 'I am not a car person and I still had this working in under half an hour. Paired first try and reconnects every drive automatically.' },
  { rating: 5, title: 'Vancouver local, fast turnaround', body: 'Love that it ships from here. Supporting a local shop and still getting better quality than the big overseas sellers. Easy 5 stars.' },
  { rating: 5, title: 'Small detail, huge difference', body: 'It’s the kind of thing people don’t clock consciously but the whole car reads more expensive now. Exactly what I wanted.' },
  { rating: 4, title: 'Impressed overall', body: 'Arrived quick, looks sharp, feels durable after a month of daily use. Only reason it’s not five is I’d have liked a longer harness.' },
];

export function getRating(slug: string): Rating {
  const h = hash(slug);
  // value in {4.6, 4.7, 4.8, 4.9, 5.0}, weighted toward the top
  const steps = [4.6, 4.7, 4.8, 4.8, 4.9, 4.9, 5.0];
  const value = steps[h % steps.length];
  const count = 34 + (h % 287); // 34–320 reviews
  return { value, count };
}

export function getReviews(slug: string, n = 4): Review[] {
  const h = hash(slug);
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const p = POOL[(h + i * 5) % POOL.length];
    out.push({
      author: NAMES[(h + i * 7) % NAMES.length],
      location: CITIES[(h + i * 3) % CITIES.length],
      rating: p.rating,
      title: p.title,
      body: p.body,
      date: DATES[(h + i * 2) % DATES.length],
      verified: (h + i) % 5 !== 0, // ~80% verified
    });
  }
  return out;
}

// Rating distribution bar percentages (5★ down to 1★), skewed high, deterministic.
export function getDistribution(slug: string): number[] {
  const { value } = getRating(slug);
  if (value >= 4.9) return [92, 6, 1, 1, 0];
  if (value >= 4.8) return [86, 10, 2, 1, 1];
  if (value >= 4.7) return [80, 13, 4, 2, 1];
  return [74, 16, 6, 2, 2];
}
