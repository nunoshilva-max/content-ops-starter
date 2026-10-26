import * as React from 'react';
import type { Lang } from './profile';
import { ui } from './ui';
import styles from './personal.module.css';

// Asks for consent before Google Analytics may use cookies. The Google tag itself is loaded in
// _document with analytics_storage denied by default; this banner records the visitor's choice
// and updates the tag. "Cookie settings" in the footer reopens it.

const KEY = 'analytics-consent';
const OPEN_EVENT = 'open-consent';

type Choice = 'granted' | 'denied';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

function readChoice(): Choice | null {
    try {
        const value = window.localStorage.getItem(KEY);
        return value === 'granted' || value === 'denied' ? value : null;
    } catch {
        return null;
    }
}

function saveChoice(choice: Choice) {
    try {
        window.localStorage.setItem(KEY, choice);
    } catch {
        // Storage can be blocked; the choice then lasts for this page view only.
    }
    window.gtag?.('consent', 'update', { analytics_storage: choice });
}

export function openConsent() {
    window.dispatchEvent(new Event(OPEN_EVENT));
}

export default function ConsentBanner({ lang }: { lang: Lang }) {
    const [open, setOpen] = React.useState(false);
    const t = ui[lang].consent;

    React.useEffect(() => {
        setOpen(readChoice() === null);
        const reopen = () => setOpen(true);
        window.addEventListener(OPEN_EVENT, reopen);
        return () => window.removeEventListener(OPEN_EVENT, reopen);
    }, []);

    if (!open) return null;
    const choose = (choice: Choice) => {
        saveChoice(choice);
        setOpen(false);
    };
    return (
        <div className={styles.consent} role="dialog" aria-live="polite" aria-label={t.manage}>
            <p>
                {t.text} <a href={ui[lang].privacyPath}>{t.more}</a>
            </p>
            <div className={styles.consentActions}>
                <button type="button" className={styles.consentAccept} onClick={() => choose('granted')}>
                    {t.accept}
                </button>
                <button type="button" className={styles.consentDecline} onClick={() => choose('denied')}>
                    {t.decline}
                </button>
            </div>
        </div>
    );
}
