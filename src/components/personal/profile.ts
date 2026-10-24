// Conteúdo do site nuno-silva.com.
// Edita este ficheiro com os dados do perfil LinkedIn (linkedin.com/in/nunossilva).
// Os campos marcados com TODO são marcadores de posição: substitui-os pelos dados reais.

export type Experience = {
    role: string;
    company: string;
    period: string;
    description?: string;
};

export type Education = {
    school: string;
    degree: string;
    period?: string;
};

export const profile = {
    name: 'Nuno Silva',
    domain: 'nuno-silva.com',
    // TODO: título profissional tal como aparece no LinkedIn
    headline: 'Criatividade, tecnologia e experiências digitais',
    location: 'Portugal',
    // TODO: texto da secção "Acerca de" do LinkedIn
    about: [
        'Este é o espaço para o resumo do perfil — quem sou, o que faço e o que me move.',
        'Substitui estes parágrafos pelo texto da secção “Acerca de” do LinkedIn.'
    ],
    // TODO: experiência profissional, da mais recente para a mais antiga
    experience: [
        { role: 'Cargo atual', company: 'Empresa', period: '20XX — Presente', description: 'Breve descrição do papel e principais resultados.' },
        { role: 'Cargo anterior', company: 'Empresa', period: '20XX — 20XX', description: 'Breve descrição do papel e principais resultados.' },
        { role: 'Primeiro cargo', company: 'Empresa', period: '20XX — 20XX' }
    ] as Experience[],
    // TODO: formação académica
    education: [{ school: 'Universidade', degree: 'Curso', period: '20XX — 20XX' }] as Education[],
    // TODO: competências principais
    skills: ['Estratégia', 'Direção criativa', 'Produto digital', 'Inovação', 'Liderança de equipas', 'Tecnologias emergentes'],
    // TODO: prémios e distinções (deixa vazio para esconder a secção)
    awards: [] as string[],
    links: {
        linkedin: 'https://www.linkedin.com/in/nunossilva',
        // TODO: email de contacto público
        email: 'hello@nuno-silva.com'
    }
};
