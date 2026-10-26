import Head from 'next/head';
import { profile, Lang } from './profile';
import { ui } from './ui';

const ORIGIN = `https://${profile.domain}`;

// Shared <head> for the personal site: title, description, share previews, language
// alternates, icons and fonts. `path` is the page path after the language prefix,
// e.g. '' for the home page or 'privacy/'.
export default function SiteHead({ lang, title, description, path }: { lang: Lang; title: string; description: string; path: string }) {
    const url = (l: Lang) => `${ORIGIN}${ui[l].home}${path}`;
    const image = `${ORIGIN}/og-image${lang === 'pt' ? '-pt' : ''}.png`;
    const person = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        url: ORIGIN,
        image: `${ORIGIN}${profile.photo}`,
        jobTitle: 'Engagement Manager',
        worksFor: { '@type': 'Organization', name: 'WYcreative', url: 'https://wycreative.com/' },
        sameAs: [profile.links.linkedin]
    };
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#07070a" />
            <link rel="canonical" href={url(lang)} />
            <link rel="alternate" hrefLang="en" href={url('en')} />
            <link rel="alternate" hrefLang="pt" href={url('pt')} />
            <link rel="alternate" hrefLang="x-default" href={url('en')} />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={profile.name} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url(lang)} />
            <meta property="og:locale" content={lang === 'pt' ? 'pt_PT' : 'en_GB'} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={image} />

            <link rel="icon" href="/favicon-nuno.svg" type="image/svg+xml" />
            <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" />
            {path === '' && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />}
        </Head>
    );
}
