import * as React from 'react';
import ConsentBanner, { openConsent } from './ConsentBanner';
import SiteHead from './SiteHead';
import { profile, Lang } from './profile';
import { ui } from './ui';
import styles from './personal.module.css';

// Privacy policy for nuno-silva.com, in English and Portuguese.
const content = {
    en: {
        title: 'Privacy policy',
        updated: 'Last updated: 26 October 2026',
        back: '← Back to the site',
        sections: [
            {
                heading: 'Who is responsible',
                body: [
                    'This site is run by Nuno Silva, in Lisbon, Portugal, who is responsible for the personal data described here. For any question or request about your data, use the contact form on this site or write to me on LinkedIn.'
                ]
            },
            {
                heading: 'The contact form',
                body: [
                    'When you send a message, I receive your name, email, company (if given), date and place (for event invitations) and your message. I use them only to read and answer your message, and I keep them only for as long as our conversation needs. The legal basis is your request to be contacted.',
                    'The message is delivered to my inbox by email through Resend (Resend, Inc., United States), which acts as a processor under the EU Standard Contractual Clauses.'
                ]
            },
            {
                heading: 'Analytics and cookies',
                body: [
                    'With your consent, this site uses Google Analytics (Google Ireland Ltd.) to understand how it is visited: pages viewed, approximate location, device and how you arrived. Google may process this data in the United States. Without your consent, no analytics cookies are set.',
                    'You can change your choice at any time with “Cookie settings” at the bottom of the page.'
                ]
            },
            {
                heading: 'Other services',
                body: [
                    'The site is hosted by Netlify (United States), which keeps technical logs such as IP addresses for security. Fonts are loaded from Google Fonts. Videos come from YouTube in privacy-enhanced mode and only load when you press play; from then on, YouTube’s own policy applies.'
                ]
            },
            {
                heading: 'Your rights',
                body: [
                    'You can ask to access, correct or delete your data, to restrict or object to its use, and to receive it in a portable format. You can also complain to the Portuguese data protection authority, the Comissão Nacional de Proteção de Dados (cnpd.pt).'
                ]
            }
        ]
    },
    pt: {
        title: 'Política de privacidade',
        updated: 'Última atualização: 26 de outubro de 2026',
        back: '← Voltar ao site',
        sections: [
            {
                heading: 'Quem é o responsável',
                body: [
                    'Este site é gerido por Nuno Silva, em Lisboa, Portugal, responsável pelos dados pessoais aqui descritos. Para qualquer pergunta ou pedido sobre os seus dados, use o formulário de contacto deste site ou escreva-me no LinkedIn.'
                ]
            },
            {
                heading: 'O formulário de contacto',
                body: [
                    'Quando envia uma mensagem, recebo o seu nome, email, empresa (se a indicar), data e local (nos convites para eventos) e a mensagem. Uso estes dados apenas para ler e responder à sua mensagem, e guardo-os só durante o tempo que a conversa exigir. A base legal é o seu pedido de contacto.',
                    'A mensagem chega à minha caixa de correio por email através do Resend (Resend, Inc., Estados Unidos), que atua como subcontratante ao abrigo das Cláusulas Contratuais-Tipo da UE.'
                ]
            },
            {
                heading: 'Estatísticas e cookies',
                body: [
                    'Com o seu consentimento, este site usa o Google Analytics (Google Ireland Ltd.) para perceber como é visitado: páginas vistas, localização aproximada, dispositivo e como chegou. A Google pode tratar estes dados nos Estados Unidos. Sem o seu consentimento, não são usados cookies de estatística.',
                    'Pode mudar a sua escolha a qualquer momento em “Definições de cookies”, no fundo da página.'
                ]
            },
            {
                heading: 'Outros serviços',
                body: [
                    'O site está alojado na Netlify (Estados Unidos), que guarda registos técnicos, como endereços IP, por razões de segurança. Os tipos de letra vêm do Google Fonts. Os vídeos vêm do YouTube em modo de privacidade melhorada e só carregam quando carrega em play; a partir daí aplica-se a política do YouTube.'
                ]
            },
            {
                heading: 'Os seus direitos',
                body: [
                    'Pode pedir acesso aos seus dados, a sua correção ou eliminação, limitar ou opor-se ao seu tratamento e recebê-los num formato portável. Pode também apresentar queixa à Comissão Nacional de Proteção de Dados (cnpd.pt).'
                ]
            }
        ]
    }
};

export default function PrivacyPage({ lang }: { lang: Lang }) {
    const c = content[lang];
    const t = ui[lang];
    return (
        <div className={styles.site}>
            <SiteHead lang={lang} title={`${c.title} — ${profile.name}`} description={c.title} path="privacy/" />
            <header className={styles.nav}>
                <a href={t.home} className={styles.logo} aria-label={profile.name}>
                    nuno<span>·</span>silva
                </a>
                <nav className={styles.navLinks}>
                    <a href={ui[lang === 'en' ? 'pt' : 'en'].privacyPath} className={styles.langSwitch} title={t.switchTitle}>
                        {t.switchLabel}
                    </a>
                </nav>
            </header>
            <main className={styles.privacy}>
                <a href={t.home} className={styles.privacyBack}>
                    {c.back}
                </a>
                <h1>{c.title}</h1>
                <p className={styles.privacyUpdated}>{c.updated}</p>
                {c.sections.map((section) => (
                    <section key={section.heading}>
                        <h2>{section.heading}</h2>
                        {section.body.map((paragraph) => (
                            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                        ))}
                    </section>
                ))}
                <button type="button" className={styles.footerButton} onClick={openConsent}>
                    {t.consent.manage}
                </button>
            </main>
            <ConsentBanner lang={lang} />
        </div>
    );
}
