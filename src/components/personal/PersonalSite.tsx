import * as React from 'react';
import ConsentBanner, { openConsent } from './ConsentBanner';
import ContactForm from './ContactForm';
import FluidHero from './FluidHero';
import SiteHead from './SiteHead';
import { profile, tr, Lang } from './profile';
import { ui } from './ui';
import styles from './personal.module.css';

// Dot cursor that trails the pointer and grows over links. Only on devices with a fine pointer.
function Cursor() {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const el = ref.current;
        document.documentElement.classList.add(styles.hasCursor);
        const pos = { x: -100, y: -100 };
        const target = { x: -100, y: -100 };
        let raf = 0;
        const onMove = (e: PointerEvent) => {
            target.x = e.clientX;
            target.y = e.clientY;
            const hot = (e.target as Element).closest?.('a, button');
            el.classList.toggle(styles.cursorHot, !!hot);
            el.dataset.label = hot?.getAttribute('data-cursor') || '';
        };
        const tick = () => {
            pos.x += (target.x - pos.x) * 0.2;
            pos.y += (target.y - pos.y) * 0.2;
            el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
            raf = requestAnimationFrame(tick);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            document.documentElement.classList.remove(styles.hasCursor);
        };
    }, []);
    return <div ref={ref} className={styles.cursor} aria-hidden="true" />;
}

// Fades sections in as they scroll into view.
function useReveal() {
    React.useEffect(() => {
        const items = document.querySelectorAll(`.${styles.reveal}`);
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.revealed);
                        observer.unobserve(entry.target);
                    }
                }),
            { rootMargin: '0px 0px -10% 0px' }
        );
        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, []);
}

// Project image loaded from the web: tries the fallback URL once, then hides itself so the gradient shows.
// YouTube answers a missing maxresdefault with a 120×90 grey placeholder (not an error), so treat tiny images as failures too.
function WorkImage({ src, fallback, alt }: { src: string; fallback?: string; alt: string }) {
    const [current, setCurrent] = React.useState(src);
    const [failed, setFailed] = React.useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);
    const fail = React.useCallback(() => {
        if (fallback && current !== fallback) setCurrent(fallback);
        else setFailed(true);
    }, [current, fallback]);
    const check = React.useCallback(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth <= 120) fail();
    }, [fail]);
    // The image may finish loading before React hydrates, when onLoad/onError never fire.
    React.useEffect(check, [check]);
    if (failed) return null;
    return (
        <img
            ref={imgRef}
            src={current}
            alt={alt}
            loading="lazy"
            // YouTube's always-available hqdefault is 4:3 with black bars; zoom in to crop them.
            className={current.includes('/hqdefault') ? `${styles.workImage} ${styles.workImageLetterbox}` : styles.workImage}
            onLoad={check}
            onError={fail}
        />
    );
}

// Lightweight YouTube embed: shows the thumbnail with a play button and only loads the player on click.
function YouTubeEmbed({ id, title, lang, children }: { id: string; title: string; lang: Lang; children: React.ReactNode }) {
    const [playing, setPlaying] = React.useState(false);
    if (playing) {
        return (
            <div className={`${styles.workArt} ${styles.workArtPlaying}`}>
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
                    title={title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                />
            </div>
        );
    }
    return (
        <button type="button" className={styles.workArt} onClick={() => setPlaying(true)} aria-label={`${ui[lang].play} ${title}`} data-cursor={ui[lang].playCursor}>
            {children}
            <span className={styles.playIcon} aria-hidden="true" />
        </button>
    );
}

// Round portrait with the name and role circling it.
function Portrait({ lang }: { lang: Lang }) {
    const [failed, setFailed] = React.useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);
    // The image can fail before React hydrates, when onError never fires; check on mount too.
    React.useEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth === 0) setFailed(true);
    }, []);
    if (failed) return null;
    const ring = `${profile.name} · ${profile.role} · ${tr(profile.location, lang)} · `;
    return (
        <figure className={`${styles.portrait} ${styles.reveal}`}>
            <svg className={styles.portraitRing} viewBox="0 0 200 200" aria-hidden="true">
                <defs>
                    <path id="portrait-ring" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
                </defs>
                <text>
                    <textPath href="#portrait-ring" textLength="548">
                        {ring}
                    </textPath>
                </text>
            </svg>
            <img ref={imgRef} src={profile.photo} alt={profile.name} className={styles.portraitPhoto} onError={() => setFailed(true)} />
        </figure>
    );
}

// "2026-10-20" → "20 Oct 2026". Formatted by hand so server and browser always render the same text.
function formatDate(iso: string, lang: Lang) {
    const [year, month, day] = iso.split('-').map(Number);
    return `${day} ${ui[lang].months[month - 1]} ${year}`;
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
    return (
        <p className={styles.label}>
            <span>{index}</span>
            {children}
        </p>
    );
}

export default function PersonalSite({ lang }: { lang: Lang }) {
    useReveal();
    const t = ui[lang];
    const other: Lang = lang === 'en' ? 'pt' : 'en';
    const [lead, ...rest] = tr(profile.tagline, lang).split(', ');
    const sections = [
        { id: 'about', label: t.sections.about },
        { id: 'writing', label: t.sections.writing },
        { id: 'speaking', label: t.sections.speaking },
        { id: 'work', label: t.sections.work },
        { id: 'bring', label: t.sections.bring },
        { id: 'path', label: t.sections.path },
        { id: 'recognition', label: t.sections.recognition },
        ...(profile.testimonials.length > 0 ? [{ id: 'testimonials', label: t.sections.testimonials }] : []),
        { id: 'contact', label: t.sections.contact }
    ];
    // Section numbers follow the order above, so hiding a section never leaves a gap.
    const number = (id: string) => String(sections.findIndex((section) => section.id === id) + 1).padStart(2, '0');

    return (
        <div className={styles.site}>
            <SiteHead lang={lang} title={`${profile.name} — ${tr(profile.tagline, lang)}`} description={`${profile.name} — ${tr(profile.eyebrow, lang)}. ${tr(profile.statement, lang)}`} path="" />
            <Cursor />

            <header className={styles.nav}>
                <a href="#top" className={styles.logo} aria-label={profile.name}>
                    nuno<span>·</span>silva
                </a>
                <nav className={styles.navLinks}>
                    <a href="#about">{t.nav.about}</a>
                    <a href="#writing">{t.nav.writing}</a>
                    <a href="#speaking">{t.nav.speaking}</a>
                    <a href="#work">{t.nav.work}</a>
                    <a href={ui[other].home} className={styles.langSwitch} hrefLang={other} lang={other} title={t.switchTitle}>
                        {t.switchLabel}
                    </a>
                    <a href="#contact" className={styles.navCta} data-cursor={t.nav.talkCursor}>
                        {t.nav.talk}
                    </a>
                </nav>
            </header>

            <main id="top">
                <section className={styles.hero}>
                    <FluidHero />
                    <div className={styles.heroInner}>
                        <p className={styles.heroEyebrow}>
                            {tr(profile.eyebrow, lang)} — {tr(profile.location, lang)}
                        </p>
                        <h1 className={styles.heroTitle}>
                            <span className={styles.line}>{lead},</span>
                            <span className={styles.line}>
                                <em>{rest.join(', ')}</em>
                            </span>
                        </h1>
                        <div className={styles.heroFoot}>
                            <p>{tr(profile.statement, lang)}</p>
                            <span className={styles.scrollHint}>{t.hint}</span>
                        </div>
                    </div>
                </section>

                <div className={styles.marquee} aria-label={t.clients}>
                    <div className={styles.marqueeTrack}>
                        {[0, 1].map((copy) => (
                            <ul key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
                                {profile.clients.map((client) => (
                                    <li key={client}>{client}</li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>

                <section id="about" className={styles.section}>
                    <SectionLabel index={number('about')}>{t.sections.about}</SectionLabel>
                    <div className={styles.aboutHead}>
                        <h2 className={`${styles.statement} ${styles.reveal}`}>
                            {t.statement[0]}
                            <em>{t.statement[1]}</em>
                            {t.statement[2]}
                            <em>{t.statement[3]}</em>
                        </h2>
                        <Portrait lang={lang} />
                    </div>
                    <div className={`${styles.aboutGrid} ${styles.reveal}`}>
                        {profile.about.map((paragraph) => (
                            <p key={paragraph.en.slice(0, 24)}>{tr(paragraph, lang)}</p>
                        ))}
                    </div>
                    <dl className={styles.numbers}>
                        {profile.numbers.map((item) => (
                            <div key={item.label.en} className={styles.reveal}>
                                <dt>{tr(item.label, lang)}</dt>
                                <dd>{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section id="writing" className={`${styles.section} ${styles.writing}`}>
                    <SectionLabel index={number('writing')}>{t.sections.writing}</SectionLabel>
                    <div className={`${styles.writingHead} ${styles.reveal}`}>
                        <div>
                            <h2>{profile.newsletter.name}</h2>
                            <p>
                                {tr(profile.newsletter.text, lang)} {t.writtenIn}
                            </p>
                        </div>
                        <a href={profile.newsletter.url} target="_blank" rel="noreferrer" className={styles.subscribe} data-cursor={t.subscribeCursor}>
                            {t.subscribe} <span aria-hidden="true">↗</span>
                        </a>
                    </div>
                    {profile.newsletter.issues.length > 0 && (
                        <ul className={styles.issues}>
                            {profile.newsletter.issues.map((issue) => (
                                <li key={issue.date + issue.title} className={styles.reveal}>
                                    <a href={issue.url} target="_blank" rel="noreferrer" lang="pt" data-cursor={t.readCursor}>
                                        <time dateTime={issue.date}>{formatDate(issue.date, lang)}</time>
                                        <span className={styles.issueMain}>
                                            <strong>{issue.title}</strong>
                                            {issue.summary && <span>{issue.summary}</span>}
                                        </span>
                                        <span className={styles.issueArrow} aria-hidden="true">
                                            ↗
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    <blockquote className={styles.reveal}>“{tr(profile.quote, lang)}”</blockquote>
                </section>

                <section id="speaking" className={styles.section}>
                    <SectionLabel index={number('speaking')}>{t.sections.speaking}</SectionLabel>
                    <div className={`${styles.speakingHead} ${styles.reveal}`}>
                        <p className={styles.speakingIntro}>{tr(profile.speaking.intro, lang)}</p>
                        <a href="#contact" className={styles.subscribe} data-cursor={t.nav.talkCursor}>
                            {t.invite} <span aria-hidden="true">→</span>
                        </a>
                    </div>
                    <h3 className={styles.subLabel}>{t.speakingTopics}</h3>
                    <ol className={styles.bring}>
                        {profile.speaking.topics.map((item) => (
                            <li key={item.title.en} className={styles.reveal}>
                                <h3>{tr(item.title, lang)}</h3>
                                <p>{tr(item.text, lang)}</p>
                            </li>
                        ))}
                    </ol>
                    <h3 className={styles.subLabel}>{t.speakingStages}</h3>
                    <div className={styles.recognition}>
                        <ul className={styles.reveal}>
                            {profile.speaking.stages.map((item) => (
                                <li key={item.title.en + item.year}>
                                    <span>{item.year}</span>
                                    <strong>{tr(item.title, lang)}</strong>
                                    <em>{tr(item.by, lang)}</em>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section id="work" className={styles.section}>
                    <SectionLabel index={number('work')}>{t.sections.work}</SectionLabel>
                    <div className={styles.work}>
                        {profile.work.map((item, i) => {
                            const index = (
                                <span className={styles.workIndex} aria-hidden="true">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            );
                            const image = item.image && <WorkImage src={item.image} fallback={item.imageFallback} alt={`${item.client} — ${item.title}`} />;
                            return (
                                <article
                                    key={item.title}
                                    className={`${styles.workCard} ${styles.reveal}`}
                                    style={{ '--hue': item.hue } as React.CSSProperties}
                                >
                                    {item.youtube ? (
                                        <YouTubeEmbed id={item.youtube} title={`${item.client} — ${item.title}`} lang={lang}>
                                            {image}
                                            {index}
                                        </YouTubeEmbed>
                                    ) : (
                                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.workArt} data-cursor={t.visitCursor}>
                                            {image}
                                            {index}
                                        </a>
                                    )}
                                    <div className={styles.workMeta}>
                                        <p className={styles.workClient}>
                                            {item.client} <span>{item.year}</span>
                                        </p>
                                        <h3>{item.title}</h3>
                                        <ul>
                                            {item.stats.map((stat) => (
                                                <li key={stat.en}>{tr(stat, lang)}</li>
                                            ))}
                                        </ul>
                                        {item.award && <p className={styles.award}>{tr(item.award, lang)}</p>}
                                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.workLink}>
                                            {item.url.includes('youtu') ? t.watch : t.visit} ↗
                                        </a>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section id="bring" className={styles.section}>
                    <SectionLabel index={number('bring')}>{t.sections.bring}</SectionLabel>
                    <ol className={styles.bring}>
                        {profile.bring.map((item) => (
                            <li key={item.title.en} className={styles.reveal}>
                                <h3>{tr(item.title, lang)}</h3>
                                <p>{tr(item.text, lang)}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="path" className={styles.section}>
                    <SectionLabel index={number('path')}>{t.sections.path}</SectionLabel>
                    <ul className={styles.path}>
                        {profile.experience.map((item) => (
                            <li key={item.company + item.role.en} className={styles.reveal}>
                                <span className={styles.pathPeriod}>{tr(item.period, lang)}</span>
                                <div className={styles.pathMain}>
                                    <h3>
                                        {item.url ? (
                                            <a href={item.url} target="_blank" rel="noreferrer" className={styles.pathLink} data-cursor={t.visitCursor}>
                                                {item.company} <span aria-hidden="true">↗</span>
                                            </a>
                                        ) : (
                                            item.company
                                        )}
                                    </h3>
                                    <p className={styles.pathRole}>
                                        {tr(item.role, lang)} · {item.place}
                                    </p>
                                </div>
                                <p className={styles.pathText}>{tr(item.description, lang)}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section id="recognition" className={styles.section}>
                    <SectionLabel index={number('recognition')}>{t.sections.recognition}</SectionLabel>
                    <div className={styles.recognition}>
                        <ul className={styles.reveal}>
                            {profile.recognition.map((item) => (
                                <li key={item.title.en + item.year}>
                                    <span>{item.year}</span>
                                    <strong>{tr(item.title, lang)}</strong>
                                    <em>{item.by}</em>
                                </li>
                            ))}
                        </ul>
                        <div className={`${styles.side} ${styles.reveal}`}>
                            <h3>{t.education}</h3>
                            {profile.education.map((item) => (
                                <p key={item.school}>
                                    <strong>{tr(item.degree, lang)}</strong>
                                    <br />
                                    {item.school}
                                </p>
                            ))}
                            <h3>{t.languages}</h3>
                            <p>{tr(profile.languages, lang)}</p>
                        </div>
                    </div>
                </section>

                {profile.testimonials.length > 0 && (
                    <section id="testimonials" className={styles.section}>
                        <SectionLabel index={number('testimonials')}>{t.sections.testimonials}</SectionLabel>
                    </section>
                )}
                {profile.testimonials.length > 0 && (
                    // A slow loop of LinkedIn recommendations; it pauses on hover and can also be scrolled.
                    <div className={styles.quotes}>
                        <div className={styles.quotesTrack}>
                            {[0, 1].map((copy) =>
                                profile.testimonials.map((item) => (
                                    <figure key={`${copy}-${item.name}`} aria-hidden={copy === 1 ? 'true' : undefined}>
                                        <blockquote lang="en">“{item.quote}”</blockquote>
                                        <figcaption>
                                            <strong>{item.name}</strong>
                                            <span>{item.role}</span>
                                            <span>
                                                {tr(item.relation, lang)} · {item.year}
                                            </span>
                                        </figcaption>
                                    </figure>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {profile.testimonials.length > 0 && (
                    <p className={styles.quotesMore}>
                        <a href={profile.recommendationsUrl} target="_blank" rel="noreferrer">
                            {t.allRecommendations} ↗
                        </a>
                    </p>
                )}
            </main>

            <footer id="contact" className={styles.contact}>
                <SectionLabel index={number('contact')}>{t.sections.contact}</SectionLabel>
                <h2 className={styles.contactBig}>
                    {t.contactTitle[0]}
                    <em>{t.contactTitle[1]}</em>
                </h2>
                <ContactForm lang={lang} />
                <div className={styles.contactRow}>
                    <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn ↗
                    </a>
                    <a href={t.privacyPath}>{t.footerPrivacy}</a>
                    <button type="button" className={styles.footerButton} onClick={openConsent}>
                        {t.consent.manage}
                    </button>
                    <span>
                        © {new Date().getFullYear()} {profile.name} · {tr(profile.location, lang)}
                    </span>
                </div>
            </footer>
            <ConsentBanner lang={lang} />
        </div>
    );
}
