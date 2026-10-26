// Conteúdo do site nuno-silva.com, em inglês (en) e português (pt).
// Os textos traduzidos são objetos { en: '…', pt: '…' }; o resto é igual nas duas línguas.

export type Lang = 'en' | 'pt';
export type Text = Record<Lang, string>;

export const tr = (text: Text, lang: Lang) => text[lang];

export type Experience = {
    role: Text;
    company: string;
    period: Text;
    place: string;
    description: Text;
    url?: string;
};

export type Issue = {
    // Editions are written in Portuguese, so titles are not translated.
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
    stats: Text[];
    award?: Text;
    // Loaded by the visitor's browser; the gradient shows if an image fails.
    image?: string;
    imageFallback?: string;
    // YouTube video id: the card plays the film inline instead of linking out.
    youtube?: string;
    hue: number;
};

export type Testimonial = {
    // Kept in the language it was written in.
    quote: string;
    name: string;
    role: string;
};

export const profile = {
    name: 'Nuno Silva',
    domain: 'nuno-silva.com',
    role: 'Engagement Manager @ WYcreative',
    location: { en: 'Lisbon, Portugal', pt: 'Lisboa, Portugal' },
    photo: '/images/nuno-silva.jpg',
    eyebrow: { en: 'Speaker · Jury member · Author of MPGA', pt: 'Orador · Membro de júri · Autor da MPGA' },
    tagline: {
        en: 'Technology in service of people, not the other way around.',
        pt: 'A tecnologia ao serviço das pessoas, e não o contrário.'
    },
    statement: {
        en: 'I make sure what agencies promise is what clients get.',
        pt: 'Garanto que o que as agências prometem é o que os clientes recebem.'
    },
    about: [
        {
            en: 'I’m the bridge between clients and the teams that deliver for them: aligning scope, priorities and expectations, and growing relationships that last.',
            pt: 'Sou a ponte entre os clientes e as equipas que trabalham para eles: alinho âmbito, prioridades e expectativas, e construo relações que duram.'
        },
        {
            en: 'I’ve been building digital since 1996. I co-founded Wiz Interactive in 1998 and ran it for 22 years. Then, as Head of Digital at BUS, I grew digital revenue, cut external vendor costs and brought AI into creative and research workflows.',
            pt: 'Construo digital desde 1996. Cofundei a Wiz Interactive em 1998 e geri-a durante 22 anos. Depois, como Head of Digital na BUS, fiz crescer a receita digital, cortei custos com fornecedores externos e levei a IA para os processos criativos e de pesquisa.'
        },
        {
            en: 'I combine a technical background (M.Sc. in Computer Science, specialised in Virtual Reality and UX) with acting training, which shaped how I speak in public, present and negotiate. And I love to write: it’s how I connect data and human emotion.',
            pt: 'Junto uma formação técnica (Mestrado em Informática, com especialização em Realidade Virtual e UX) a formação em teatro, que moldou a forma como falo em público, apresento e negoceio. E gosto muito de escrever: é assim que ligo os dados à emoção humana.'
        }
    ],
    numbers: [
        { value: '1996', label: { en: 'Building digital since', pt: 'A construir digital desde' } },
        { value: '22', label: { en: 'Years running Wiz Interactive', pt: 'Anos à frente da Wiz Interactive' } },
        { value: '100+', label: { en: 'Clients served', pt: 'Clientes' } },
        { value: '80+', label: { en: 'National & international awards', pt: 'Prémios nacionais e internacionais' } },
        { value: '2×', label: { en: 'Digital Agency of the Year', pt: 'Agência Digital do Ano' } }
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
    newsletter: {
        name: 'MPGA — Make People Great Again',
        text: {
            en: 'A weekly newsletter on leadership, culture and the place of people in an increasingly automated world.',
            pt: 'Uma newsletter semanal sobre liderança, cultura e o lugar das pessoas num mundo cada vez mais automatizado.'
        },
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
    speaking: {
        intro: {
            en: 'I talk about what happens to people when technology moves faster than organisations, with thirty years of building digital behind every example.',
            pt: 'Falo sobre o que acontece às pessoas quando a tecnologia anda mais depressa do que as organizações, com trinta anos a construir digital por trás de cada exemplo.'
        },
        // Topics for talks, workshops and panels.
        topics: [
            {
                title: { en: 'Technology in service of people', pt: 'A tecnologia ao serviço das pessoas' },
                text: {
                    en: 'AI in agencies and organisations: what to adopt, what to ignore, and how to keep people at the centre.',
                    pt: 'IA nas agências e nas organizações: o que adotar, o que ignorar e como manter as pessoas no centro.'
                }
            },
            {
                title: { en: 'Leading in an automated world', pt: 'Liderar num mundo automatizado' },
                text: {
                    en: 'Lonely leaders, flattened hierarchies and promotions nobody prepared for.',
                    pt: 'Líderes isolados, hierarquias achatadas e promoções para as quais ninguém se preparou.'
                }
            },
            {
                title: { en: 'From promise to delivery', pt: 'Da promessa à entrega' },
                text: {
                    en: 'Why what agencies sell and what clients receive drift apart, and how to close the gap.',
                    pt: 'Porque é que o que as agências vendem e o que os clientes recebem se afastam, e como voltar a aproximá-los.'
                }
            },
            {
                title: { en: 'Work, place and meaning', pt: 'Trabalho, lugar e sentido' },
                text: {
                    en: 'Mourning a profession, choosing where to live, and what work owes us back.',
                    pt: 'Fazer o luto de uma profissão, escolher onde viver e o que o trabalho nos deve.'
                }
            }
        ],
        // Juries and lectures, newest first.
        stages: [
            {
                year: '2026',
                title: { en: 'Guest lecturer — Digital Marketing', pt: 'Professor convidado — Marketing Digital' },
                by: { en: 'Iscte, Master’s in Human Resource Management', pt: 'Iscte, Mestrado em Gestão de Recursos Humanos' }
            },
            {
                year: '2017',
                title: { en: 'Jury member — Digital', pt: 'Membro do júri — Digital' },
                by: { en: 'CCP Festival', pt: 'Festival CCP' }
            },
            {
                year: '2014',
                title: { en: 'Jury member — Internet/Cyber', pt: 'Membro do júri — Internet/Cyber' },
                by: { en: 'Young Lions', pt: 'Young Lions' }
            },
            {
                year: '2012',
                title: { en: 'Jury member — Interactive', pt: 'Membro do júri — Interativo' },
                by: { en: 'El Ojo de Iberoamérica', pt: 'El Ojo de Iberoamérica' }
            }
        ]
    },
    work: [
        {
            client: 'Mateus Rosé',
            title: 'Taste Is',
            year: '2009 — 2014',
            url: 'https://youtu.be/CpUrjkKmero',
            youtube: 'CpUrjkKmero',
            image: 'https://i.ytimg.com/vi/CpUrjkKmero/maxresdefault.jpg',
            imageFallback: 'https://i.ytimg.com/vi/CpUrjkKmero/hqdefault.jpg',
            stats: [
                { en: 'First digital presence, from zero to global', pt: 'Primeira presença digital, do zero ao mundo' },
                { en: '24k visitors from 27 countries in 3 months', pt: '24 mil visitantes de 27 países em 3 meses' },
                { en: '10k+ user-generated images', pt: 'Mais de 10 mil imagens criadas pelos utilizadores' }
            ],
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
            stats: [
                { en: '150k unique visitors in year one', pt: '150 mil visitantes únicos no primeiro ano' },
                { en: '12-minute average engagement — 3× benchmark', pt: '12 minutos de visita média — 3× a referência do setor' }
            ],
            award: { en: 'Best Editorial Website · Best UX/UI — CCP', pt: 'Melhor Website Editorial · Melhor UX/UI — CCP' },
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
            stats: [
                {
                    en: '2nd Finalist — Best Local Agency, El Ojo de Iberoamérica',
                    pt: '2.º finalista — Melhor Agência Local, El Ojo de Iberoamérica'
                }
            ],
            award: { en: 'Gold — El Ojo de Iberoamérica', pt: 'Ouro — El Ojo de Iberoamérica' },
            hue: 45
        }
    ] as Work[],
    bring: [
        {
            title: { en: 'Client & stakeholder management', pt: 'Gestão de clientes e stakeholders' },
            text: { en: 'From day-to-day delivery to C-level conversations.', pt: 'Da entrega do dia a dia às conversas com a administração.' }
        },
        {
            title: { en: 'Digital strategy & transformation', pt: 'Estratégia e transformação digital' },
            text: { en: 'From roadmap to execution.', pt: 'Do roadmap à execução.' }
        },
        {
            title: { en: 'Operational leadership', pt: 'Liderança operacional' },
            text: { en: 'P&L, team building, process.', pt: 'P&L, construção de equipas, processos.' }
        },
        {
            title: { en: 'Technology that serves the business', pt: 'Tecnologia ao serviço do negócio' },
            text: {
                en: 'Analytics, martech and AI — chosen for ROI, not hype.',
                pt: 'Analytics, martech e IA — escolhidos pelo retorno, não pela moda.'
            }
        }
    ],
    experience: [
        {
            role: { en: 'Engagement Manager', pt: 'Engagement Manager' },
            company: 'WYcreative',
            url: 'https://wycreative.com/',
            period: { en: '2026 — Now', pt: '2026 — Hoje' },
            place: 'Oeiras',
            description: {
                en: 'Client & Partnership team at WYgroup. Making sure projects deliver what was agreed — on time, scope and quality — and spotting opportunities to grow each relationship.',
                pt: 'Equipa de Client & Partnership do WYgroup. Garanto que os projetos entregam o que foi acordado — no prazo, no âmbito e na qualidade — e procuro oportunidades para fazer crescer cada relação.'
            }
        },
        {
            role: { en: 'Head of Digital', pt: 'Head of Digital' },
            company: 'BUS Creative Agency',
            period: { en: '2020 — 2026', pt: '2020 — 2026' },
            place: 'Lisboa',
            description: {
                en: '+40% digital revenue, −68% external vendor costs, −60% weekly planning time. Operations across Portugal and Angola, 25+ concurrent client projects, AI integrated across creative and strategy.',
                pt: '+40% de receita digital, −68% em custos com fornecedores externos, −60% de tempo de planeamento semanal. Operações em Portugal e Angola, mais de 25 projetos em simultâneo, IA integrada na criatividade e na estratégia.'
            }
        },
        {
            role: { en: 'Co-Founder & Partner', pt: 'Cofundador e sócio' },
            company: 'Wiz Interactive',
            period: { en: '1998 — 2020', pt: '1998 — 2020' },
            place: 'Bairro Alto',
            description: {
                en: 'Scaled from startup to market leader: 700% revenue growth, team of 3 to 26, 100+ clients and an average client retention of 10 years.',
                pt: 'De startup a líder de mercado: receita a crescer 700%, equipa de 3 para 26 pessoas, mais de 100 clientes e uma retenção média de 10 anos.'
            }
        },
        {
            role: { en: 'Co-Founder', pt: 'Cofundador' },
            company: 'Affinità',
            period: { en: '2017 — 2020', pt: '2017 — 2020' },
            place: 'Lisboa',
            description: {
                en: 'A collective of independent professionals and agencies united by creativity, collaboration and strategic brand storytelling.',
                pt: 'Um coletivo de profissionais e agências independentes, unidos pela criatividade, pela colaboração e pelo storytelling estratégico de marca.'
            }
        },
        {
            role: { en: 'Senior Web Designer & UX/UI Developer', pt: 'Senior Web Designer e UX/UI Developer' },
            company: 'Portugal Telecom',
            period: { en: '1996 — 1998', pt: '1996 — 1998' },
            place: 'Miraflores',
            description: {
                en: 'Start-to-end web projects for TV Cabo, PT + Telepac, the Portuguese Golf Association and the Expo’98 information kiosks.',
                pt: 'Projetos web de ponta a ponta para a TV Cabo, a PT + Telepac, a Federação Portuguesa de Golfe e os quiosques de informação da Expo’98.'
            }
        },
        {
            role: { en: 'IT Manager & Developer', pt: 'Responsável de Informática e Programador' },
            company: 'Promática — Grupo Banco Fonsecas & Burnay',
            period: { en: '1991 — 1995', pt: '1991 — 1995' },
            place: 'Lisboa',
            description: {
                en: 'IT infrastructure and in-house applications: billing, document management and more.',
                pt: 'Infraestrutura informática e aplicações internas: faturação, gestão documental e outras.'
            }
        }
    ] as Experience[],
    recognition: [
        { year: '2010 · 2014', title: { en: 'Digital Agency of the Year', pt: 'Agência Digital do Ano' }, by: 'Meios & Publicidade' },
        { year: '2016', title: { en: 'Technical Agency of the Year', pt: 'Agência Técnica do Ano' }, by: 'CCP' },
        { year: '2012', title: { en: 'Gold — Bien Público', pt: 'Ouro — Bien Público' }, by: 'El Ojo de Iberoamérica' },
        { year: '2003 — 2012', title: { en: '7 international awards', pt: '7 prémios internacionais' }, by: 'Wiz Interactive' },
        { year: '2000 — 2018', title: { en: '70+ digital awards', pt: 'Mais de 70 prémios digitais' }, by: 'Wiz Interactive' }
    ],
    education: [
        {
            school: 'Faculdade de Ciências da Universidade de Lisboa',
            degree: { en: 'M.Sc. Computer Science', pt: 'Mestrado em Informática' }
        },
        { school: 'IN IMPETUS — Escola de Actores', degree: { en: 'Acting course', pt: 'Curso de teatro' } },
        { school: 'Evoé — School of Actors', degree: { en: 'Acting course', pt: 'Curso de teatro' } }
    ],
    languages: { en: 'Portuguese · English · Spanish', pt: 'Português · Inglês · Espanhol' },
    // Recommendations shown on the site; the section is hidden while this is empty.
    // { quote: '…', name: 'Name Surname', role: 'Role, Company' },
    testimonials: [] as Testimonial[],
    quote: {
        en: 'There is no wave separated from the ocean. The wave IS the ocean.',
        pt: 'Não há onda separada do oceano. A onda É o oceano.'
    },
    // Contact form options. The chosen option sets the subject of the email sent by /api/contact.
    contactTopics: [
        {
            value: 'talk',
            label: { en: 'Talk or keynote', pt: 'Palestra ou keynote' },
            subject: 'Talk / keynote invitation',
            prompt: { en: 'Event, audience, date and the topic you have in mind.', pt: 'Evento, público, data e o tema que tem em mente.' },
            event: true
        },
        {
            value: 'lecture',
            label: { en: 'Lecture or workshop', pt: 'Aula ou workshop' },
            subject: 'Lecture / workshop invitation',
            prompt: { en: 'School or organisation, audience, date and topic.', pt: 'Escola ou organização, público, data e tema.' },
            event: true
        },
        {
            value: 'jury',
            label: { en: 'Jury', pt: 'Júri' },
            subject: 'Jury invitation',
            prompt: { en: 'Which festival or award, category and dates?', pt: 'Que festival ou prémio, categoria e datas?' },
            event: true
        },
        {
            value: 'press',
            label: { en: 'Press or podcast', pt: 'Imprensa ou podcast' },
            subject: 'Press / podcast request',
            prompt: { en: 'Publication or show, format and deadline.', pt: 'Publicação ou programa, formato e prazo.' },
            event: true
        },
        {
            value: 'mpga',
            label: { en: 'MPGA newsletter', pt: 'Newsletter MPGA' },
            subject: 'MPGA newsletter',
            prompt: { en: 'An idea, a story or a collaboration for MPGA.', pt: 'Uma ideia, uma história ou uma colaboração para a MPGA.' }
        },
        {
            value: 'project',
            label: { en: 'A project with WYcreative', pt: 'Um projeto com a WYcreative' },
            subject: 'Project with WYcreative',
            prompt: { en: 'What are you building, and where do you need help?', pt: 'O que está a construir e onde precisa de ajuda?' }
        },
        {
            value: 'hello',
            label: { en: 'Just saying hi', pt: 'Só dizer olá' },
            subject: 'Hello',
            prompt: { en: 'Say hi.', pt: 'Diga olá.' }
        }
    ],
    links: {
        linkedin: 'https://www.linkedin.com/in/nunossilva'
    }
};
