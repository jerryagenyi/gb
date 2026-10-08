import type { ButtonLink } from '@/components/Button';
import type { Rich } from '@/components/RichText';

type NavLink = { label: string; href: string };
type ExternalLink = NavLink & { external?: boolean };

export type SiteContent = {
  meta: { title: string };
  brand: { first: string; last: string };
  nav: NavLink[];
  hero: { eyebrow: string; title: Rich; lead: string; ctas: ButtonLink[] };
  roles: string[];
  about: {
    label: string;
    title: string;
    body: Rich[];
    side: { heading: string; text: string }[];
  };
  work: { label: string; title: Rich; pillars: { num: string; title: string; text: string }[] };
  research: { label: string; title: string; items: { tag: string; title: Rich; text: string }[] };
  speaking: { label: string; title: Rich; body: string[]; cta: ButtonLink; topics: string[] };
  connect: { title: Rich; text: string; ctas: ButtonLink[] };
  footer: {
    tagline: string;
    explore: NavLink[];
    connect: ExternalLink[];
    copyright: string;
  };
};

const EMAIL = 'hello@genevievebosah.com';

export const site: SiteContent = {
  meta: { title: 'Dr Genevieve Bosah — Communication Scholar, Strategist & Speaker' },
  brand: { first: 'Dr Genevieve', last: 'Bosah' },
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Research', href: '#research' },
    { label: 'Speaking', href: '#speaking' },
    { label: 'Connect', href: '#connect' },
  ],
  hero: {
    eyebrow: 'Communication Scholar · Strategist · Speaker',
    title: ['I study how stories ', { em: 'shape power' }, ' — and help leaders use that power well.'],
    lead: 'Associate Professor and communication researcher. I work at the intersection of media scholarship, strategic communication, and leadership — helping institutions and individuals communicate with clarity, authority, and strategy.',
    ctas: [
      { label: 'Explore the research', href: '#research', variant: 'primary' },
      { label: 'Invite me to speak', href: '#speaking', variant: 'ghost' },
    ],
  },
  roles: ['PhD, Media & Communication', 'Associate Professor', 'Strategic Communicator', 'Author', 'Speaker'],
  about: {
    label: 'About',
    title: 'A scholar of communication, a builder of leaders.',
    body: [
      ['I am an academic and strategic communicator with more than fifteen years of professional experience across Africa and Europe. My doctoral research examined the field of Nigerian journalism through the lens of Bourdieusian field theory — asking how stories are made, who controls them, and how communication shapes power.'],
      ["Today I lead postgraduate curriculum in a UK university, where I direct a Master's programme in journalism and media communications and hold responsibility for postgraduate quality across the school. My scholarship spans media sociology, strategic public relations in emerging economies, digital divides, and health communication in Sub-Saharan Africa."],
      [
        'Beyond the academy, I work with leaders — through coaching, consulting, and the communities I lead — to help them ',
        { strong: 'think clearly, communicate with authority, and lead with strategy.' },
        ' The academy teaches me the mechanics of communication. The work with leaders teaches me the stakes.',
      ],
      ["I also serve as a minister and lead a women's leadership community, where the same conviction holds: that purpose without clear communication rarely reaches the people it was meant for."],
    ],
    side: [
      { heading: 'Current Roles', text: 'Associate Professor & Head of Postgraduate Curriculum · Programme Leader, MA Journalism & Media Communications' },
      { heading: 'Networks Founded', text: 'African PhD Scholars Network · Blossoms Ladies Network · Auxano Consulting' },
      { heading: 'Research Fields', text: 'Media sociology · Strategic communication · Decolonial communication · Health & development communication' },
      { heading: 'Based In', text: 'United Kingdom · Working across Africa & Europe' },
    ],
  },
  work: {
    label: 'What I Do',
    title: ['Three bodies of work, ', { em: 'one through-line.' }],
    pillars: [
      { num: '01', title: 'Scholarship', text: 'Peer-reviewed research, monographs, and edited volumes on journalism, strategic communication, and the politics of media in emerging economies. Supervision and examination across multiple institutions.' },
      { num: '02', title: 'Strategy & Consulting', text: 'Through Auxano, I advise leaders, founders, and organisations on communication strategy and brand — translating expertise into a clear, compelling, and credible public voice.' },
      { num: '03', title: 'Leadership & Community', text: 'Founder of networks that develop emerging scholars and women leaders — building people, not just programmes, and equipping them to communicate their calling with confidence.' },
    ],
  },
  research: {
    label: 'Research & Writing',
    title: 'Selected work and current projects.',
    items: [
      { tag: 'Monograph', title: [{ em: 'When Passion is Insufficient' }], text: 'A field-theoretical study of Nigerian journalism — examining the structural conditions under which journalists work and the forces that shape what gets reported.' },
      { tag: 'Edited Volumes', title: ['Strategic Public Relations in Emerging Economies'], text: 'Lead editor of a two-volume scholarly collection examining communication practice and theory across developing markets.' },
      { tag: 'Ongoing Research', title: ['Digital Divides & Health Communication in Sub-Saharan Africa'], text: 'A co-authored portfolio investigating access, equity, and communication in digital and health contexts across the continent.' },
      { tag: 'Podcast', title: ['The African PhD Chronicles'], text: 'Conversations with African doctoral scholars on the realities of the research journey — building visibility and community for the next generation.' },
    ],
  },
  speaking: {
    label: 'Speaking',
    title: ['Bring rigour and ', { em: 'clarity' }, ' to your stage.'],
    body: [
      'I speak to academic, professional, and faith audiences on communication, leadership, and the discipline of telling a clear story. Whether a keynote, a workshop, or a panel, I bring the same thing: the rigour of a scholar and the directness of a practitioner.',
      'Recent engagements span universities, conferences, leadership summits, and recruitment events across the UK and Africa.',
    ],
    cta: { label: 'Check availability', href: '#connect', variant: 'primary' },
    topics: [
      'How stories shape power — and who gets to tell them',
      'Communicating with clarity, authority & strategy',
      'Decolonial perspectives on media & communication',
      'Building visibility as an emerging scholar or leader',
      'Strategic communication in emerging economies',
    ],
  },
  connect: {
    title: ["Let's ", { em: 'work together.' }],
    text: 'For research collaboration, speaking enquiries, or strategic communication advisory through Auxano — I would be glad to hear from you.',
    ctas: [
      { label: 'Book a discovery call', href: `mailto:${EMAIL}`, variant: 'primary' },
      { label: 'Read my work', href: '#research', variant: 'ghost' },
    ],
  },
  footer: {
    tagline: 'Communication scholar, strategist, and speaker. Helping leaders communicate with clarity, authority, and strategy.',
    explore: [
      { label: 'About', href: '#about' },
      { label: 'Research', href: '#research' },
      { label: 'Speaking', href: '#speaking' },
    ],
    connect: [
      { label: 'LinkedIn', href: 'https://uk.linkedin.com/in/genevievebosah', external: true },
      { label: 'Instagram', href: 'https://www.instagram.com/drgenebosah/', external: true },
      { label: 'Email', href: `mailto:${EMAIL}` },
    ],
    copyright: '© 2026 Dr Genevieve Bosah. All rights reserved.',
  },
};
