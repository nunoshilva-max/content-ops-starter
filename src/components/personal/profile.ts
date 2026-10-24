// Conteúdo do site nuno-silva.com, retirado do perfil LinkedIn (linkedin.com/in/nunossilva).

export type Experience = {
    role: string;
    company: string;
    period: string;
    place: string;
    description: string;
};

export type Issue = {
    title: string;
    // ISO date (YYYY-MM-DD)
    date: string;
    summary?: string;
    url: string;
};

export type Work = {
    client: string;
    title: string;
    year: string;
    url?: string;
    stats: string[];
    award?: string;
    // Loaded by the visitor's browser; the gradient shows if an image fails.
    image?: string;
    imageFallback?: string;
    // YouTube video id: the card plays the film inline instead of linking out.
    youtube?: string;
    hue: number;
};

export const profile = {
    name: 'Nuno Silva',
    domain: 'nuno-silva.com',
    role: 'Engagement Manager @ WYcreative',
    location: 'Lisbon, Portugal',
    photo: '/images/nuno-silva.jpg',
    tagline: 'Technology in service of people, not the other way around.',
    statement: 'I make sure what agencies promise is what clients get.',
    about: [
        'I’m the bridge between clients and the teams that deliver for them: aligning scope, priorities and expectations, and growing relationships that last.',
        'I’ve been building digital since 1996. I co-founded Wiz Interactive in 1998 and ran it for 22 years. Then, as Head of Digital at BUS, I grew digital revenue, cut external vendor costs and brought AI into creative and research workflows.',
        'I combine a technical background (M.Sc. in Computer Science, specialised in Virtual Reality and UX) with professional acting training — invaluable in presentations, negotiations and building trust. I lead with strategy and execute with words: as a hands-on copywriter, I bridge data and human emotion.'
    ],
    numbers: [
        { value: '1996', label: 'Building digital since' },
        { value: '22', label: 'Years running Wiz Interactive' },
        { value: '100+', label: 'Clients served' },
        { value: '80+', label: 'National & international awards' },
        { value: '2×', label: 'Digital Agency of the Year' }
    ],
    clients: [
        'RTP',
        'Mateus Rosé',
        'Amnesty International',
        'EY',
        'Roche',
        'Mosqueteiros',
        'Roady',
        'Castel',
        'nBanks',
        'LUNES',
        'TV Cabo',
        'Portugal Telecom',
        'Expo’98'
    ],
    work: [
        {
            client: 'Mateus Rosé',
            title: 'Taste Is',
            year: '2009 — 2014',
            url: 'https://youtu.be/CpUrjkKmero',
            youtube: 'CpUrjkKmero',
            image: 'https://i.ytimg.com/vi/CpUrjkKmero/maxresdefault.jpg',
            imageFallback: 'https://i.ytimg.com/vi/CpUrjkKmero/hqdefault.jpg',
            stats: ['First digital presence, from zero to global', '24k visitors from 27 countries in 3 months', '10k+ user-generated images'],
            hue: 340
        },
        {
            client: 'RTP',
            title: 'Virtual Museum',
            year: '2015',
            url: 'https://museu.rtp.pt',
            youtube: 'eyG7A_yrC1A',
            image: 'https://i.ytimg.com/vi/eyG7A_yrC1A/maxresdefault.jpg',
            imageFallback: 'https://i.ytimg.com/vi/eyG7A_yrC1A/hqdefault.jpg',
            stats: ['150k unique visitors in year one', '12-minute average engagement — 3× benchmark'],
            award: 'Best Editorial Website · Best UX/UI — CCP',
            hue: 210
        },
        {
            client: 'Amnesty International',
            title: 'Freedom Dictionary',
            year: '2012',
            url: 'https://youtu.be/7N0ZwgdgnoU',
            youtube: '7N0ZwgdgnoU',
            image: 'https://i.ytimg.com/vi/7N0ZwgdgnoU/maxresdefault.jpg',
            imageFallback: 'https://i.ytimg.com/vi/7N0ZwgdgnoU/hqdefault.jpg',
            stats: ['2nd Finalist — Best Local Agency, El Ojo de Iberoamérica'],
            award: 'Gold — El Ojo de Iberoamérica',
            hue: 45
        }
    ] as Work[],
    bring: [
        { title: 'Client & stakeholder management', text: 'From day-to-day delivery to C-level conversations.' },
        { title: 'Digital strategy & transformation', text: 'From roadmap to execution.' },
        { title: 'Operational leadership', text: 'P&L, team building, process.' },
        { title: 'Technology that serves the business', text: 'Analytics, martech and AI — chosen for ROI, not hype.' }
    ],
    experience: [
        {
            role: 'Engagement Manager',
            company: 'WYcreative',
            period: '2026 — Now',
            place: 'Oeiras',
            description: 'Client & Partnership team at WYgroup. Making sure projects deliver what was agreed — on time, scope and quality — and spotting opportunities to grow each relationship.'
        },
        {
            role: 'Head of Digital',
            company: 'BUS Creative Agency',
            period: '2020 — 2026',
            place: 'Lisbon',
            description: '+40% digital revenue, −68% external vendor costs, −60% weekly planning time. Operations across Portugal and Angola, 25+ concurrent client projects, AI integrated across creative and strategy.'
        },
        {
            role: 'Guest Lecturer, Digital Marketing',
            company: 'Iscte',
            period: '2026',
            place: 'Lisbon',
            description: 'Master’s in Human Resource Management: digital strategy applied to talent, employer branding and organisational communication.'
        },
        {
            role: 'Co-Founder & Partner',
            company: 'Wiz Interactive',
            period: '1998 — 2020',
            place: 'Bairro Alto',
            description: 'Scaled from startup to market leader: 700% revenue growth, team of 3 to 26, 100+ clients and an average client retention of 10 years.'
        },
        {
            role: 'Co-Founder',
            company: 'Affinità',
            period: '2017 — 2020',
            place: 'Lisbon',
            description: 'A collective of independent professionals and agencies united by creativity, collaboration and strategic brand storytelling.'
        },
        {
            role: 'Senior Web Designer & UX/UI Developer',
            company: 'Portugal Telecom',
            period: '1996 — 1998',
            place: 'Miraflores',
            description: 'Start-to-end web projects for TV Cabo, PT + Telepac, the Portuguese Golf Association and the Expo’98 information kiosks.'
        },
        {
            role: 'IT Manager & Developer',
            company: 'Promática — Grupo Banco Fonsecas & Burnay',
            period: '1991 — 1995',
            place: 'Lisbon',
            description: 'IT infrastructure and in-house applications: billing, document management and more.'
        }
    ] as Experience[],
    recognition: [
        { year: '2010 · 2014', title: 'Digital Agency of the Year', by: 'Meios & Publicidade' },
        { year: '2016', title: 'Technical Agency of the Year', by: 'CCP' },
        { year: '2012', title: 'Gold — Bien Público', by: 'El Ojo de Iberoamérica' },
        { year: '2017', title: 'Digital Jury', by: 'CCP Festival' },
        { year: '2014', title: 'Internet/Cyber Jury', by: 'Young Lions' },
        { year: '2012', title: 'Interactive Jury', by: 'El Ojo de Iberoamérica' }
    ],
    education: [
        { school: 'Faculdade de Ciências da Universidade de Lisboa', degree: 'M.Sc. Computer Science' },
        { school: 'IN IMPETUS — Escola de Actores', degree: 'Acting' },
        { school: 'Evoé — School of Actors', degree: 'Acting' }
    ],
    languages: ['Portuguese', 'English', 'Spanish'],
    newsletter: {
        name: 'MPGA — Make People Great Again',
        text: 'A weekly newsletter on leadership, culture and the place of people in an increasingly automated world.',
        url: 'https://www.linkedin.com/newsletters/make-people-great-again-7392191024183296001/',
        // Editions shown on the site, newest first. To add one, copy a block and change its fields:
        // { title: '…', date: '2026-10-20', summary: 'One sentence.', url: 'https://www.linkedin.com/pulse/…' },
        issues: [
            {
                title: 'Não tenho carro há seis anos. Não é virtude, é código postal.',
                date: '2026-10-13',
                url: 'https://www.linkedin.com/pulse/n%C3%A3o-tenho-carro-h%C3%A1-seis-anos-%C3%A9-virtude-c%C3%B3digo-postal-nuno-silva-zmfpe/'
            },
            {
                title: 'Portugal é o oitavo melhor país para viver. E o último para trabalhar.',
                date: '2026-09-01',
                url: 'https://www.linkedin.com/pulse/portugal-%C3%A9-o-oitavo-melhor-pa%C3%ADs-para-viver-e-%C3%BAltimo-trabalhar-silva-mnwue/'
            },
            {
                title: 'Ninguém te ensinou a fazer o luto de uma profissão',
                date: '2026-05-25',
                url: 'https://www.linkedin.com/pulse/ningu%C3%A9m-te-ensinou-fazer-o-luto-de-uma-profiss%C3%A3o-nuno-silva-xmmqe/'
            }
        ] as Issue[]
    },
    quote: 'There is no wave separated from the ocean. The wave IS the ocean.',
    // Contact form options. The chosen option sets the subject of the email sent by /api/contact.
    contactTopics: [
        { value: 'project', label: 'A project', subject: 'New project enquiry', prompt: 'What are you building, and where do you need help?' },
        { value: 'partnership', label: 'Client partnership', subject: 'Client partnership', prompt: 'Tell me about the relationship you want to grow.' },
        { value: 'talk', label: 'Talk or keynote', subject: 'Talk / keynote invitation', prompt: 'Event, audience, date and the topic you have in mind.', event: true },
        { value: 'lecture', label: 'Lecture or workshop', subject: 'Lecture / workshop invitation', prompt: 'School or organisation, audience, date and topic.', event: true },
        { value: 'jury', label: 'Jury', subject: 'Jury invitation', prompt: 'Which festival or award, category and dates?', event: true },
        { value: 'press', label: 'Press or podcast', subject: 'Press / podcast request', prompt: 'Publication or show, format and deadline.', event: true },
        { value: 'mpga', label: 'MPGA newsletter', subject: 'MPGA newsletter', prompt: 'An idea, a story or a collaboration for MPGA.' },
        { value: 'hello', label: 'Just saying hi', subject: 'Hello', prompt: 'Say hi.' }
    ],
    links: {
        linkedin: 'https://www.linkedin.com/in/nunossilva'
    }
};
