/**
 * Aura Living — Journal
 * Two long-form articles with structured body blocks so the
 * JournalReader can render paragraphs, headings, pull quotes,
 * inline images, and lists without any markup in the data.
 */

const img = (id: string, w = 1600, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

export type JournalBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "list"; items: string[] };

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  /** Standfirst shown beneath the headline. */
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  /** Hero image used at the top of the reader. */
  heroImage: string;
  /** Author byline. */
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  body: JournalBodyBlock[];
  /** Slugs of products referenced in the closing CTA. */
  relatedProductSlugs: string[];
}

export const journalArticles: JournalArticle[] = [
  {
    id: "jr-01",
    slug: "lighting-a-room-without-overhead-light",
    title: "On Lighting a Room Without Overhead Light",
    excerpt:
      "Why the best rooms are lit from below — and how to layer three sources of light into a single corner that reads as warmth, not work.",
    category: "Lighting",
    date: "March 12, 2026",
    readTime: "6 min",
    heroImage: img("1517991104123-1d56a6e81ed9"),
    author: {
      name: "Anna Voss",
      role: "Studio Concierge",
      avatar: img("1494790108377-be9c29b29330", 200, 200),
    },
    body: [
      {
        type: "paragraph",
        text: "The first thing I tell anyone who asks about lighting is this: turn off the ceiling light. Whatever you've got up there — the central pendant, the recessed cans, the flush-mount that came with the apartment — leave it off for a week. Live in the room with only the lamps. You will not go back.",
      },
      {
        type: "paragraph",
        text: "Overhead light flattens everything. It strips the corners of their shadows, washes the colour out of every surface it touches, and reads to the eye as 'work' — the visual equivalent of a fluorescent office. Lower light, placed at the edges of the room, does the opposite. It models the space, gives it depth, and tells the people in it: this is the part of the day when you slow down.",
      },
      { type: "heading", text: "The rule of three" },
      {
        type: "paragraph",
        text: "A room reads as warm when it has at least three sources of light, placed at three different heights, on three different circuits. Not three lamps on one switch — three lamps you can turn on and off independently, so you can shape the room to the hour.",
      },
      {
        type: "list",
        items: [
          "One low light — a table lamp on a side table, around 50–60cm high.",
          "One mid-height light — a floor lamp or a tall plant uplight, around 150–170cm.",
          "One accent light — a wall sconce, a candle cluster, or a small lamp on a shelf.",
        ],
      },
      {
        type: "quote",
        text: "Light a room from below and it becomes a place to sit. Light it from above and it becomes a place to work. Most of us want the first, and most of us light our homes like the second.",
        attribution: "Anna Voss, studio notes",
      },
      { type: "heading", text: "Layering, not flooding" },
      {
        type: "paragraph",
        text: "The trick is to think of light the way a painter thinks of pigment — layered, with each layer doing one job. The table lamp on the console lights the wall behind it. The floor lamp in the corner lights the ceiling, softly. The candle on the coffee table lights the people. None of them, alone, is enough. All of them, together, make the room feel finished.",
      },
      {
        type: "image",
        src: img("1517991104123-1d56a6e81ed9", 1600, 900),
        alt: "A console table with a sculptural ceramic lamp casting a soft pool of light on the wall behind it.",
        caption:
          "Three sources, three heights, three switches — the corner of a living room lit for evening.",
      },
      { type: "heading", text: "Bulbs, finally" },
      {
        type: "paragraph",
        text: "Buy 2700K bulbs. Not 3000K, not 4000K — 2700K. Anything cooler will read as fluorescent no matter how good the lamp is. And dim them if you can; a dimmable LED on a wall switch is the single best investment you can make in a room's evening mood.",
      },
    ],
    relatedProductSlugs: [
      "ceramic-table-lamp",
      "brass-arc-floor-lamp",
      "sculptural-desk-lamp",
      "glass-globe-wall-sconce",
    ],
  },
  {
    id: "jr-02",
    slug: "choosing-a-mirror-that-opens-a-wall",
    title: "How to Choose a Mirror That Opens a Wall",
    excerpt:
      "A practical guide to arches, scales, and frames — and the three placements that consistently transform an awkward wall.",
    category: "Mirrors",
    date: "February 27, 2026",
    readTime: "5 min",
    heroImage: img("1618220179428-22790b461013"),
    author: {
      name: "Theo Lindqvist",
      role: "Design Lead",
      avatar: img("1500648767791-00dcc994a43e", 200, 200),
    },
    body: [
      {
        type: "paragraph",
        text: "A mirror is the cheapest piece of architecture you can buy. Hung well, it will lengthen a hallway, raise a low ceiling, double a window's light, and turn a dead wall into the room's best feature. Hung badly, it will reflect a doorway, a kitchen counter, or — worst of all — the ceiling light. The mirror isn't the problem. The placement is.",
      },
      { type: "heading", text: "Choose the shape before the frame" },
      {
        type: "paragraph",
        text: "Start with the shape, because the shape does the architectural work. Arches soften everything — they read as doorways, as windows, as the kind of detail you find in buildings that were made carefully. Round mirrors open up the wall without competing with rectilinear furniture. Squares and grids feel intentional and graphic; they suit modern rooms with strong lines.",
      },
      {
        type: "list",
        items: [
          "Arch mirror — leans or hangs; softens angular rooms.",
          "Round mirror — opens a wall without taking it over.",
          "Square or grid mirror — graphic, modern, anchors a wall.",
          "Irregular / organic mirror — the wildcard; reads as art as much as mirror.",
        ],
      },
      { type: "heading", text: "Scale up, not down" },
      {
        type: "paragraph",
        text: "The single most common mistake people make with mirrors is going too small. A mirror that's 60cm wide on a wall that's 4 metres wide will read as a tiny punctuation mark — it will make the wall feel larger by contrast, but it will also make itself feel lost. A mirror that's 90cm or 120cm wide will read as architecture.",
      },
      {
        type: "quote",
        text: "If you're choosing between two mirror sizes, choose the larger one. The room will tell you that you were right within an hour of hanging it.",
        attribution: "Theo Lindqvist",
      },
      { type: "heading", text: "Three placements that always work" },
      {
        type: "paragraph",
        text: "There are three placements that I return to again and again, because they consistently transform whatever wall they're on. None of them require a stud finder — they just require you to think about what the mirror will reflect.",
      },
      {
        type: "image",
        src: img("1618220179428-22790b461013", 1600, 900),
        alt: "An arched oak floor mirror leaning against a wall, doubling the perceived depth of the room.",
        caption:
          "An arched mirror, leaned against the wall — the lowest-risk, highest-reward placement.",
      },
      {
        type: "list",
        items: [
          "Leaning against a wall — works for any mirror 150cm or taller; no hanging hardware, no commitment.",
          "Opposite a window — doubles the natural light; check what the window frames before committing.",
          "Above a console or dresser — leave 10–15cm between the furniture and the mirror's lower edge.",
        ],
      },
      { type: "heading", text: "What to never reflect" },
      {
        type: "paragraph",
        text: "Before you hang a mirror, stand where it will go and look at what it will reflect. If it reflects a doorway, a kitchen counter, a cluttered bookshelf, or a ceiling light — pick a different wall. A mirror is only as good as what it shows.",
      },
    ],
    relatedProductSlugs: [
      "arched-floor-mirror",
      "round-vintage-mirror",
      "irregular-organic-mirror",
      "square-grid-mirror",
    ],
  },
];

export const articleBySlug = (slug: string) =>
  journalArticles.find((a) => a.slug === slug);
