import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';

const GA_ID = 'G-MCJ2FE2JC0';

// Google tag with Consent Mode: analytics cookies stay off until the visitor accepts them in
// the consent banner (src/components/personal/ConsentBanner.tsx), which stores the choice.
const GA_SETUP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var consent = 'denied';
try { if (localStorage.getItem('analytics-consent') === 'granted') consent = 'granted'; } catch (e) {}
gtag('consent', 'default', { analytics_storage: consent, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('js', new Date());
gtag('config', '${GA_ID}');
`;

type Props = DocumentInitialProps & { lang: string };

export default class MyDocument extends Document<Props> {
    static async getInitialProps(ctx: DocumentContext): Promise<Props> {
        const initialProps = await Document.getInitialProps(ctx);
        // Pages under /pt are the Portuguese version of the site.
        const lang = ctx.pathname === '/pt' || ctx.pathname.startsWith('/pt/') ? 'pt' : 'en';
        return { ...initialProps, lang };
    }

    render() {
        return (
            <Html lang={this.props.lang}>
                <Head>
                    <script dangerouslySetInnerHTML={{ __html: GA_SETUP }} />
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
