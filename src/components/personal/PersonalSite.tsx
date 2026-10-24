import * as React from 'react';
import Head from 'next/head';
import ContactForm from './ContactForm';
import FluidHero from './FluidHero';
import { profile } from './profile';
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
function YouTubeEmbed({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
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
        <button type="button" className={styles.workArt} onClick={() => setPlaying(true)} aria-label={`Play ${title}`} data-cursor="Play">
            {children}
            <span className={styles.playIcon} aria-hidden="true" />
        </button>
    );
}

// Round portrait with the name and role circling it.
function Portrait() {
    const [failed, setFailed] = React.useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);
    // The image can fail before React hydrates, when onError never fires; check on mount too.
    React.useEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth === 0) setFailed(true);
    }, []);
    if (failed) return null;
    const ring = `${profile.name} · ${profile.role} · ${profile.location} · `;
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

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
    return (
        <p className={styles.label}>
            <span>{index}</span>
            {children}
        </p>
    );
}

export default function PersonalSite() {
    useReveal();
    const [lead, ...rest] = profile.tagline.split(', ');
    const description = `${profile.name} — ${profile.role}. ${profile.statement}`;

    return (
        <div className={styles.site}>
            <Head>
                <title>{`${profile.name} — ${profile.tagline}`}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={profile.name} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={`https://${profile.domain}`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#07070a" />
                <link rel="icon" href="/favicon-nuno.svg" type="image/svg+xml" />
                <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
                />
            </Head>
            <Cursor />

            <header className={styles.nav}>
                <a href="#top" className={styles.logo} aria-label={profile.name}>
                    nuno<span>·</span>silva
                </a>
                <nav className={styles.navLinks}>
                    <a href="#about">About</a>
                    <a href="#work">Work</a>
                    <a href="#path">Path</a>
                    <a href="#contact" className={styles.navCta} data-cursor="Say hi">
                        Let’s talk
                    </a>
                </nav>
            </header>

            <main id="top">
                <section className={styles.hero}>
                    <FluidHero />
                    <div className={styles.heroInner}>
                        <p className={styles.heroEyebrow}>
                            {profile.role} — {profile.location}
                        </p>
                        <h1 className={styles.heroTitle}>
                            <span className={styles.line}>{lead},</span>
                            <span className={styles.line}>
                                <em>{rest.join(', ')}</em>
                            </span>
                        </h1>
                        <div className={styles.heroFoot}>
                            <p>{profile.statement}</p>
                            <span className={styles.scrollHint}>Move. Click. Scroll.</span>
                        </div>
                    </div>
                </section>

                <div className={styles.marquee} aria-label="Selected clients">
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
                    <SectionLabel index="01">About</SectionLabel>
                    <div className={styles.aboutHead}>
                        <h2 className={`${styles.statement} ${styles.reveal}`}>
                            I make sure what agencies <em>promise</em> is what clients <em>get.</em>
                        </h2>
                        <Portrait />
                    </div>
                    <div className={`${styles.aboutGrid} ${styles.reveal}`}>
                        {profile.about.map((paragraph) => (
                            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                        ))}
                    </div>
                    <dl className={styles.numbers}>
                        {profile.numbers.map((item) => (
                            <div key={item.label} className={styles.reveal}>
                                <dt>{item.label}</dt>
                                <dd>{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section id="work" className={styles.section}>
                    <SectionLabel index="02">Work I’m proud of</SectionLabel>
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
                                        <YouTubeEmbed id={item.youtube} title={`${item.client} — ${item.title}`}>
                                            {image}
                                            {index}
                                        </YouTubeEmbed>
                                    ) : (
                                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.workArt} data-cursor="View">
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
                                                <li key={stat}>{stat}</li>
                                            ))}
                                        </ul>
                                        {item.award && <p className={styles.award}>{item.award}</p>}
                                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.workLink}>
                                            {item.url.includes('youtu') ? 'Watch on YouTube' : 'Visit the project'} ↗
                                        </a>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className={styles.section}>
                    <SectionLabel index="03">What I bring</SectionLabel>
                    <ol className={styles.bring}>
                        {profile.bring.map((item) => (
                            <li key={item.title} className={styles.reveal}>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="path" className={styles.section}>
                    <SectionLabel index="04">Path</SectionLabel>
                    <ul className={styles.path}>
                        {profile.experience.map((item) => (
                            <li key={item.company + item.role} className={styles.reveal}>
                                <span className={styles.pathPeriod}>{item.period}</span>
                                <div className={styles.pathMain}>
                                    <h3>{item.company}</h3>
                                    <p className={styles.pathRole}>
                                        {item.role} · {item.place}
                                    </p>
                                </div>
                                <p className={styles.pathText}>{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <SectionLabel index="05">Recognition</SectionLabel>
                    <div className={styles.recognition}>
                        <ul className={styles.reveal}>
                            {profile.recognition.map((item) => (
                                <li key={item.title + item.year}>
                                    <span>{item.year}</span>
                                    <strong>{item.title}</strong>
                                    <em>{item.by}</em>
                                </li>
                            ))}
                        </ul>
                        <div className={`${styles.side} ${styles.reveal}`}>
                            <h3>Education</h3>
                            {profile.education.map((item) => (
                                <p key={item.school}>
                                    <strong>{item.degree}</strong>
                                    <br />
                                    {item.school}
                                </p>
                            ))}
                            <h3>Languages</h3>
                            <p>{profile.languages.join(' · ')}</p>
                        </div>
                    </div>
                </section>

                <section className={`${styles.section} ${styles.writing}`}>
                    <SectionLabel index="06">Writing</SectionLabel>
                    <div className={styles.reveal}>
                        <h2>{profile.newsletter.name}</h2>
                        <p>{profile.newsletter.text}</p>
                    </div>
                    <blockquote className={styles.reveal}>“{profile.quote}”</blockquote>
                </section>
            </main>

            <footer id="contact" className={styles.contact}>
                <SectionLabel index="07">Contact</SectionLabel>
                <h2 className={styles.contactBig}>
                    Let’s <em>talk.</em>
                </h2>
                <ContactForm />
                <div className={styles.contactRow}>
                    <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn ↗
                    </a>
                    <span>
                        © {new Date().getFullYear()} {profile.name} · {profile.location}
                    </span>
                </div>
            </footer>
        </div>
    );
}
