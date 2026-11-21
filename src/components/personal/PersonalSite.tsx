import * as React from 'react';
import ConsentBanner, { openConsent } from './ConsentBanner';
import ContactForm from './ContactForm';
import FluidHero, { HeroPhrase } from './FluidHero';
import SiteHead from './SiteHead';
import { profile, tr, Lang, Experience } from './profile';
import { ui } from './ui';
import styles from './personal.module.css';

// Dot cursor that trails the pointer and grows over links. Only on devices that can hover with a
// fine pointer, and only over the hero and the work cards: everywhere else the native cursor
// stays. The native cursor is hidden by a class added here, so if this script fails nothing is lost.
function Cursor() {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const el = ref.current;
        document.documentElement.classList.add(styles.hasCursor);
        const zones = `.${styles.hero}, .${styles.workCard}`;
        const pos = { x: -100, y: -100 };
        const target = { x: -100, y: -100 };
        let raf = 0;
        const update = (element: Element | null) => {
            el.classList.toggle(styles.cursorActive, !!element?.closest?.(zones));
            const hot = element?.closest?.('a, button');
            el.classList.toggle(styles.cursorHot, !!hot);
            el.dataset.label = hot?.getAttribute('data-cursor') || '';
        };
        const onMove = (e: PointerEvent) => {
            target.x = e.clientX;
            target.y = e.clientY;
            update(e.target as Element);
        };
        // Scrolling moves the page under a still pointer: check again what it is over.
        const onScroll = () => update(document.elementFromPoint(target.x, target.y));
        const tick = () => {
            pos.x += (target.x - pos.x) * 0.2;
            pos.y += (target.y - pos.y) * 0.2;
            el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
            raf = requestAnimationFrame(tick);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('scroll', onScroll);
            document.documentElement.classList.remove(styles.hasCursor);
        };
    }, []);
    return <div ref={ref} className={styles.cursor} aria-hidden="true" />;
}

// The header gets a solid, blurred background once the page has scrolled past 80px, so it stays
// readable over the content, and slides away while scrolling down (back on scrolling up).
export function useNavState() {
    const [state, setState] = React.useState({ scrolled: false, hidden: false });
    React.useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const hidden = y > 200 && y > last;
            last = y;
            setState((prev) => (prev.scrolled === y > 80 && prev.hidden === hidden ? prev : { scrolled: y > 80, hidden }));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return [styles.nav, state.scrolled && styles.navScrolled, state.hidden && styles.navHidden].filter(Boolean).join(' ');
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
        <button type="button" className={styles.workArt} onClick={() => setPlaying(true)} data-cursor={ui[lang].playCursor}>
            <span className={styles.srOnly}>{ui[lang].play}: </span>
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
            <img
                ref={imgRef}
                src={profile.photo}
                srcSet="/images/nuno-silva-300.jpg 300w, /images/nuno-silva-480.jpg 480w, /images/nuno-silva.jpg 720w"
                sizes="(min-width: 1500px) 222px, max(134px, 14.8vw)"
                width={720}
                height={720}
                decoding="async"
                alt={profile.name} className={styles.portraitPhoto} onError={() => setFailed(true)} />
        </figure>
    );
}

// Endless strip of recommendation cards. It drifts slowly on its own, can be dragged with the
// mouse or a finger (and keeps some momentum when released) or swiped on a trackpad, and slows
// to a stop while the mouse is over it. The children hold two copies of the cards, so moving by
// half the track's width brings it back to the same picture.
function QuoteLoop({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        const drift = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 28; // px per second
        let offset = 0;
        let velocity = 0;
        let speed = drift;
        let dragging = false;
        let hovering = false;
        let focused = false;
        // On touch screens a tap (a touch that barely moves) pauses or resumes the strip.
        let tapPaused = false;
        let downX = 0;
        let downType = '';
        let lastX = 0;
        let lastTime = 0;
        let raf = 0;
        let previous = performance.now();

        const frame = (now: number) => {
            const dt = Math.min(Math.max((now - previous) / 1000, 0), 0.05);
            previous = now;
            if (!dragging) {
                speed += ((hovering || focused || tapPaused ? 0 : drift) - speed) * Math.min(dt * 3, 1);
                offset += (speed + velocity) * dt;
                velocity *= Math.pow(0.03, dt);
            }
            const half = track.scrollWidth / 2;
            if (half > 0) offset = ((offset % half) + half) % half;
            track.style.transform = `translate3d(${-offset}px, 0, 0)`;
            raf = requestAnimationFrame(frame);
        };

        const onDown = (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            dragging = true;
            velocity = 0;
            downX = e.clientX;
            downType = e.pointerType;
            lastX = e.clientX;
            lastTime = e.timeStamp;
            viewport.setPointerCapture(e.pointerId);
            viewport.classList.add(styles.quotesDragging);
        };
        const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const elapsed = Math.max((e.timeStamp - lastTime) / 1000, 0.001);
            offset -= dx;
            velocity = velocity * 0.7 + (-dx / elapsed) * 0.3;
            lastX = e.clientX;
            lastTime = e.timeStamp;
        };
        const onUp = (e: PointerEvent) => {
            if (downType === 'touch' && e.type === 'pointerup' && Math.abs(e.clientX - downX) < 8) tapPaused = !tapPaused;
            dragging = false;
            velocity = Math.max(-3000, Math.min(3000, velocity));
            viewport.classList.remove(styles.quotesDragging);
        };
        const onEnter = (e: PointerEvent) => {
            if (e.pointerType === 'mouse') hovering = true;
        };
        const onLeave = () => {
            hovering = false;
        };
        const onFocusIn = () => {
            focused = true;
        };
        const onFocusOut = (e: FocusEvent) => {
            focused = viewport.contains(e.relatedTarget as Node);
        };
        // Horizontal trackpad swipes move the strip; vertical scrolling still scrolls the page.
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
            e.preventDefault();
            offset += e.deltaX;
        };

        viewport.addEventListener('pointerdown', onDown);
        viewport.addEventListener('pointermove', onMove);
        viewport.addEventListener('pointerup', onUp);
        viewport.addEventListener('pointercancel', onUp);
        viewport.addEventListener('pointerenter', onEnter);
        viewport.addEventListener('pointerleave', onLeave);
        viewport.addEventListener('wheel', onWheel, { passive: false });
        viewport.addEventListener('focusin', onFocusIn);
        viewport.addEventListener('focusout', onFocusOut);

        // Only animate while the strip is on screen.
        const observer = new IntersectionObserver(([entry]) => {
            cancelAnimationFrame(raf);
            if (entry.isIntersecting) {
                previous = performance.now();
                raf = requestAnimationFrame(frame);
            }
        });
        observer.observe(viewport);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            viewport.removeEventListener('pointerdown', onDown);
            viewport.removeEventListener('pointermove', onMove);
            viewport.removeEventListener('pointerup', onUp);
            viewport.removeEventListener('pointercancel', onUp);
            viewport.removeEventListener('pointerenter', onEnter);
            viewport.removeEventListener('pointerleave', onLeave);
            viewport.removeEventListener('wheel', onWheel);
            viewport.removeEventListener('focusin', onFocusIn);
            viewport.removeEventListener('focusout', onFocusOut);
        };
    }, []);

    return (
        // Focusable, so keyboard users can stop the strip by tabbing to it.
        <div ref={viewportRef} className={styles.quotes} data-cursor={label} tabIndex={0} role="region" aria-label={name}>
            <div ref={trackRef} className={styles.quotesTrack}>
                {children}
            </div>
        </div>
    );
}

// "2026-10-20" → "20 Oct 2026". Formatted by hand so server and browser always render the same text.
function formatDate(iso: string, lang: Lang) {
    const [year, month, day] = iso.split('-').map(Number);
    return `${day} ${ui[lang].months[month - 1]} ${year}`;
}

// Each numbered section's heading: the small label with its number, as the section's <h2>. In
// About the big statement is the heading, so there the label is plain text.
function SectionLabel({ index, heading = true, children }: { index: string; heading?: boolean; children: React.ReactNode }) {
    const Tag = heading ? 'h2' : 'p';
    return (
        <Tag className={`${styles.label} ${styles.reveal}`}>
            <span>{index}</span>
            {children}
        </Tag>
    );
}

export default function PersonalSite({ lang }: { lang: Lang }) {
    useReveal();
    const navClass = useNavState();
    const t = ui[lang];
    const other: Lang = lang === 'en' ? 'pt' : 'en';
    const [lead, ...rest] = tr(profile.tagline, lang).split(', ');
    // Phrases a click on the drops shows, in order: the site's own lines, then MPGA titles with a
    // link to their edition. Memoised so the hero is not set up again on every re-render.
    const heroPhrases = React.useMemo<HeroPhrase[]>(
        () => [
            ...t.heroPhrases.map((text) => ({ text })),
            ...profile.newsletter.heroTitles.map((title) => ({ text: title, href: profile.newsletter.issues.find((issue) => issue.title === title)?.url }))
        ],
        [t]
    );
    const sections = [
        { id: 'writing', label: t.sections.writing },
        { id: 'about', label: t.sections.about },
        { id: 'work', label: t.sections.work },
        { id: 'speaking', label: t.sections.speaking },
        { id: 'bring', label: t.sections.bring },
        { id: 'path', label: t.sections.path },
        { id: 'recognition', label: t.sections.recognition },
        ...(profile.testimonials.length > 0 ? [{ id: 'testimonials', label: t.sections.testimonials }] : []),
        { id: 'contact', label: t.sections.contact }
    ];
    // Section numbers follow the order above, so hiding a section never leaves a gap.
    const number = (id: string) => String(sections.findIndex((section) => section.id === id) + 1).padStart(2, '0');

    const pathRow = (item: Experience) => (
        <li key={item.company + item.role.en}>
            <span className={styles.pathPeriod}>{tr(item.period, lang)}</span>
            <div className={styles.pathMain}>
                {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className={styles.pathLink}>
                        <h3>{item.company}</h3>
                        <span aria-hidden="true">↗</span>
                    </a>
                ) : (
                    <h3>{item.company}</h3>
                )}
                <p className={styles.pathRole}>
                    {tr(item.role, lang)} · {item.place}
                </p>
            </div>
            <p className={styles.pathText}>{tr(item.description, lang)}</p>
        </li>
    );
    const earlierRoles = profile.experience.filter((item) => item.more);

    return (
        <div className={styles.site}>
            <SiteHead
                lang={lang}
                title={`${profile.name} · ${tr(profile.tagline, lang)}`}
                description={`${profile.name} · ${tr(profile.eyebrow, lang)}. ${tr(profile.heroLine, lang)}`}
                path=""
            />
            <Cursor />

            <header className={navClass}>
                <a href="#top" className={styles.logo}>
                    nuno<span>·</span>silva
                </a>
                <nav className={styles.navLinks}>
                    <a href="#writing">{t.nav.writing}</a>
                    <a href="#about">{t.nav.about}</a>
                    <a href="#work">{t.nav.work}</a>
                    <a href="#speaking">{t.nav.speaking}</a>
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
                    <FluidHero phrases={heroPhrases} hint={t.hint} readLabel={t.readEdition} readHref={profile.newsletter.url} />
                    <div className={styles.heroInner}>
                        <p className={styles.heroEyebrow}>{tr(profile.eyebrow, lang)}</p>
                        <h1 className={styles.heroTitle}>
                            <span className={styles.line}>{lead},</span>
                            <span className={styles.line}>
                                <em>{rest.join(', ')}</em>
                            </span>
                        </h1>
                        <div className={styles.heroFoot}>
                            <p>{tr(profile.heroLine, lang)}</p>
                            <div className={styles.heroActions}>
                                <a href="#writing" className={styles.subscribe} data-cursor={t.readCursor}>
                                    {t.readMpga} <span aria-hidden="true">↓</span>
                                </a>
                                <a href="#contact" className={styles.heroLink}>
                                    {t.nav.talk}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className={styles.marquee} aria-label={t.clients}>
                    <div className={styles.marqueeTrack}>
                        {[0, 1].map((copy) => (
                            <ul key={copy} aria-hidden={copy === 1 ? 'true' : undefined} inert={copy === 1 ? true : undefined}>
                                {profile.clients.map((client) => (
                                    <li key={client}>{client}</li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>

                <section id="writing" className={`${styles.section} ${styles.writing}`}>
                    <SectionLabel index={number('writing')}>{t.sections.writing}</SectionLabel>
                    <div className={`${styles.writingHead} ${styles.reveal}`}>
                        <div>
                            <h3>{profile.newsletter.name}</h3>
                            <p className={styles.writingProof}>{tr(profile.newsletter.proof, lang)}</p>
                            <p>{tr(profile.newsletter.text, lang)}</p>
                        </div>
                        <a href={profile.newsletter.url} target="_blank" rel="noreferrer" className={styles.subscribe} data-cursor={t.subscribeCursor}>
                            {t.subscribe} <span aria-hidden="true">↗</span>
                        </a>
                    </div>
                    {profile.newsletter.issues.length > 0 && (
                        <ul className={styles.issues}>
                            {profile.newsletter.issues.map((issue) => (
                                <li key={issue.title}>
                                    <a href={issue.url} target="_blank" rel="noreferrer" lang="pt" data-cursor={t.readCursor}>
                                        {issue.date ? <time dateTime={issue.date}>{formatDate(issue.date, lang)}</time> : <span aria-hidden="true" />}
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
                    <blockquote>“{tr(profile.quote, lang)}”</blockquote>
                </section>

                <section id="about" className={styles.section}>
                    <SectionLabel index={number('about')} heading={false}>
                        {t.sections.about}
                    </SectionLabel>
                    <div className={styles.aboutHead}>
                        <h2 className={`${styles.statement} ${styles.reveal}`}>
                            {t.statement[0]}
                            <em>{t.statement[1]}</em>
                            {t.statement[2]}
                            <em>{t.statement[3]}</em>
                        </h2>
                        <Portrait lang={lang} />
                    </div>
                    <p className={styles.scene}>{tr(profile.scene, lang)}</p>
                    <div className={styles.aboutGrid}>
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

                <section id="work" className={styles.section}>
                    <SectionLabel index={number('work')}>{t.sections.work}</SectionLabel>
                    <div className={styles.work}>
                        {profile.work.map((item, i) => {
                            // A typographic card: the project name and its key number. The film's
                            // still shows on hover or focus at its natural size, in black and white
                            // (RTP's is sharp enough to fill the card).
                            const face = (
                                <>
                                    {item.image && (
                                        <span className={item.cover ? styles.workCover : styles.workThumb}>
                                            <WorkImage src={item.image} fallback={item.imageFallback} alt={`${item.client}, ${item.title}`} />
                                        </span>
                                    )}
                                    <span className={styles.workType} aria-hidden="true">
                                        <span className={styles.workTypeTitle}>{item.title}</span>
                                        <span className={styles.workTypeKey}>{tr(item.key, lang)}</span>
                                    </span>
                                </>
                            );
                            return (
                                <article
                                    key={item.title}
                                    className={i === 0 ? `${styles.workCard} ${styles.reveal}` : styles.workCard}
                                    style={{ '--hue': item.hue } as React.CSSProperties}
                                >
                                    {item.youtube ? (
                                        <YouTubeEmbed id={item.youtube} title={`${item.client}, ${item.title}`} lang={lang}>
                                            {face}
                                        </YouTubeEmbed>
                                    ) : (
                                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.workArt} data-cursor={t.visitCursor}>
                                            {face}
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
                            <li key={item.title.en}>
                                <h3>{tr(item.title, lang)}</h3>
                                <p>{tr(item.text, lang)}</p>
                            </li>
                        ))}
                    </ol>
                    <h3 className={styles.subLabel}>{t.speakingStages}</h3>
                    <div className={styles.recognition}>
                        <ul>
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

                <section id="bring" className={styles.section}>
                    <SectionLabel index={number('bring')}>{t.sections.bring}</SectionLabel>
                    <ol className={`${styles.bring} ${styles.reveal}`}>
                        {profile.bring.map((item) => (
                            <li key={item.title.en}>
                                <h3>{tr(item.title, lang)}</h3>
                                <p>{tr(item.text, lang)}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="path" className={styles.section}>
                    <SectionLabel index={number('path')}>{t.sections.path}</SectionLabel>
                    <ul className={`${styles.path} ${styles.reveal}`}>{profile.experience.filter((item) => !item.more).map(pathRow)}</ul>
                    {earlierRoles.length > 0 && (
                        <details className={styles.pathMore}>
                            <summary>{t.fullPath}</summary>
                            <ul className={styles.path}>{earlierRoles.map(pathRow)}</ul>
                        </details>
                    )}
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
                        <div className={styles.side}>
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
                    <QuoteLoop label={t.dragCursor} name={t.sections.testimonials}>
                            {[0, 1].map((copy) =>
                                profile.testimonials.map((item) => (
                                    <figure key={`${copy}-${item.name}`} aria-hidden={copy === 1 ? 'true' : undefined} inert={copy === 1 ? true : undefined}>
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
                    </QuoteLoop>
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
                <p className={styles.contactBig}>
                    {t.contactTitle[0]}
                    <em>{t.contactTitle[1]}</em>
                </p>
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
