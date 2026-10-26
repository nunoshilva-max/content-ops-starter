import * as React from 'react';
import { profile, tr, Lang } from './profile';
import { ui } from './ui';
import styles from './personal.module.css';

// Posts to /api/contact, which emails the message through Resend. The chosen topic sets the email subject.

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm({ lang }: { lang: Lang }) {
    const t = ui[lang].form;
    const topics = profile.contactTopics;
    const [topic, setTopic] = React.useState(topics[0]);
    const [status, setStatus] = React.useState<Status>('idle');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = { ...Object.fromEntries(new FormData(form)), lang };
        setStatus('sending');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(String(response.status));
            form.reset();
            setTopic(topics[0]);
            setStatus('sent');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'sent') {
        return (
            <div className={styles.formDone} role="status">
                <p className={styles.formDoneTitle}>
                    {t.doneTitle[0]}
                    <em>{t.doneTitle[1]}</em>
                </p>
                <p>{t.doneText}</p>
                <button type="button" className={styles.formLink} onClick={() => setStatus('idle')}>
                    {t.again}
                </button>
            </div>
        );
    }

    return (
        <form name="contact" method="POST" className={styles.form} onSubmit={onSubmit}>
            <p className={styles.honeypot}>
                <label>
                    {t.honeypot} <input name="bot-field" tabIndex={-1} autoComplete="off" />
                </label>
            </p>

            <fieldset className={styles.topics}>
                <legend>{t.topic}</legend>
                {topics.map((item) => (
                    <label key={item.value} className={styles.topic}>
                        <input type="radio" name="topic" value={item.value} checked={topic.value === item.value} onChange={() => setTopic(item)} />
                        <span>{tr(item.label, lang)}</span>
                    </label>
                ))}
            </fieldset>

            <div className={styles.fields}>
                <label className={styles.field}>
                    <span>{t.name}</span>
                    <input name="name" required autoComplete="name" />
                </label>
                <label className={styles.field}>
                    <span>{t.email}</span>
                    <input name="email" type="email" required autoComplete="email" />
                </label>
                <label className={styles.field}>
                    <span>{t.company}</span>
                    <input name="company" autoComplete="organization" />
                </label>
                {topic.event && (
                    <label className={styles.field}>
                        <span>{t.when}</span>
                        <input name="when" placeholder={t.whenPlaceholder} />
                    </label>
                )}
                <label className={`${styles.field} ${styles.fieldWide}`}>
                    <span>{t.message}</span>
                    <textarea name="message" required rows={4} placeholder={tr(topic.prompt, lang)} />
                </label>
            </div>

            <div className={styles.formFoot}>
                <button type="submit" className={styles.submit} disabled={status === 'sending'} data-cursor={t.sendCursor}>
                    {status === 'sending' ? t.sending : t.send}
                    <span aria-hidden="true">→</span>
                </button>
                {status === 'error' && (
                    <p className={styles.formError} role="alert">
                        {t.error}{' '}
                        <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                            LinkedIn
                        </a>
                        .
                    </p>
                )}
            </div>
            <p className={styles.formPrivacy}>
                {t.privacy} <a href={ui[lang].privacyPath}>{t.privacyLink}</a>
            </p>
        </form>
    );
}
