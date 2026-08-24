import { DEFAULT_LOCALE, type Locale } from "./locales";

/**
 * Site chrome and the three translated pages (home, disclaimer, privacy).
 * `/config`, `/config/machine` and `/docs` stay English-only for now (#144)
 * — their strings live in their own components, untouched by this file.
 */
export interface Ui {
  "skip.toContent": string;
  "ribbon.forkMe": string;
  "nav.home": string;
  "nav.washingLoads": string;
  "nav.washerIron": string;
  "nav.docs": string;
  "switcher.label": string;
  "footer.github": string;
  "footer.disclaimer": string;
  "footer.privacy": string;
  "footer.copyrightBefore": string;
  "footer.copyrightAfter": string;
  "home.title": string;
  "home.description": string;
  "home.h1": string;
  /** Rich text: see i18n/richText.ts for the `[label](url)` / `` `code` `` / `*em*` markup. */
  "home.intro": string;
  "disclaimer.title": string;
  "disclaimer.description": string;
  "disclaimer.h1": string;
  "disclaimer.p1": string;
  "disclaimer.p2": string;
  "disclaimer.p3": string;
  "disclaimer.p4": string;
  "privacy.title": string;
  "privacy.h1": string;
  "privacy.descriptionUmami": string;
  "privacy.descriptionNoUmami": string;
  /** Rich text. */
  "privacy.pUmami": string;
  "privacy.pNoUmami": string;
  /** Rich text. */
  "privacy.pStorage": string;
  /** Rich text. */
  "privacy.pHosting": string;
  /** Shown for 10s (or until dismissed) at the top of every page in this locale. */
  "banner.message": string;
  "banner.dismiss": string;
}

const en: Ui = {
  "skip.toContent": "Skip to content",
  "ribbon.forkMe": "Fork me on GitHub",
  "nav.home": "Home",
  "nav.washingLoads": "Washing loads",
  "nav.washerIron": "Washer & iron",
  "nav.docs": "Docs",
  "switcher.label": "Language",
  "footer.github": "Washy washy on GitHub",
  "footer.disclaimer": "Disclaimer",
  "footer.privacy": "Privacy policy",
  "footer.copyrightBefore": "© 2026 Ryan Kes. Licensed under the ",
  "footer.copyrightAfter":
    " — provided as-is, with no warranty of any kind (see the licence, sections 15–16). Always check a garment's own care label; this chart reflects one household's settings, not a manufacturer's guarantee.",
  "home.title": "Washy washy",
  "home.description":
    "A phone-friendly laundry chart: programme, temperature and spin for every pile, what can share a drum, and where the iron's thermostat goes.",
  "home.h1": "Your laundry chart",
  "home.intro":
    "Turns a laundry chart into a phone-friendly sheet: which programme, temperature and spin for each pile, what can share a drum, and where the iron's thermostat goes. Add this page to your phone's home screen — Safari's Share menu or Chrome's *⋮* menu both have an \"Add to Home Screen\" option — and it opens like an app, no address bar, right by the machine.",
  "disclaimer.title": "Washy washy — disclaimer",
  "disclaimer.description":
    "This chart is unofficial and community-run, reflecting one household's own settings — not a manufacturer's guarantee.",
  "disclaimer.h1": "Disclaimer",
  "disclaimer.p1":
    "Washy washy is an unofficial, community-run project. It is not affiliated with, endorsed by, or produced in cooperation with any washing machine or appliance manufacturer.",
  "disclaimer.p2":
    "The bundled chart reflects one household's own washing and ironing settings — a set of choices that worked for one washer, one iron and one person's clothes. It is not a manufacturer's guarantee, a care-labelling standard, or professional advice. Loads, fabrics and machines vary, and a setting that's safe on one machine can damage another.",
  "disclaimer.p3":
    "A garment's own care label always takes precedence over anything shown here. When the two disagree, follow the label.",
  "disclaimer.p4":
    "As stated in the project's licence (GPL-3.0-or-later, sections 15–16): the software is provided \"as is,\" without warranty of any kind, express or implied. Washy washy's maintainers are not liable for any damage — to clothes, machines, or anything else — arising from its use.",
  "privacy.title": "Washy washy — privacy policy",
  "privacy.h1": "Privacy policy",
  "privacy.descriptionUmami":
    "No account, no cookies. Page-view analytics via Umami, a privacy-respecting tool with nothing that identifies you. An uploaded config or chart edit stays in your own browser and is never sent anywhere.",
  "privacy.descriptionNoUmami":
    "No account, cookies, analytics or tracking. An uploaded config or chart edit stays in your own browser and is never sent anywhere.",
  "privacy.pUmami":
    "Washy washy has no account and sets no cookies. It does use [Umami](https://umami.is/), a privacy-respecting analytics tool, to see how the site gets used — which pages, how many visits. Umami doesn't use cookies, doesn't track you across other sites, and doesn't collect anything that identifies you personally.",
  "privacy.pNoUmami":
    "Washy washy has no account, no cookies, no analytics and no tracking scripts of any kind. There is nothing here watching what you do on the site.",
  "privacy.pStorage":
    "Uploading your own config, or editing the chart or machine settings, saves that data only in your own browser's storage (`localStorage`). It never leaves your device — not to a server, not to us, not to anyone. Clearing your browser's site data for washy washy removes it completely.",
  "privacy.pHosting":
    "The site itself is static — plain files with no backend — served by [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/). Like any web host, Cloudflare's own infrastructure sees the ordinary HTTP request metadata involved in serving a page — your IP address, browser, the page requested — the same as any site you visit. Washy washy itself has no access to that, and doesn't ask Cloudflare or anyone else for it.",
  "banner.message":
    "You're already reading this in English — no AI translator was harmed (or needed) here.",
  "banner.dismiss": "Dismiss",
};

const ja: Ui = {
  "skip.toContent": "コンテンツへスキップ",
  "ribbon.forkMe": "GitHubでフォークしよう",
  "nav.home": "ホーム",
  "nav.washingLoads": "洗濯物",
  "nav.washerIron": "洗濯機とアイロン",
  "nav.docs": "ドキュメント",
  "switcher.label": "言語",
  "footer.github": "GitHubのwashy washy",
  "footer.disclaimer": "免責事項",
  "footer.privacy": "プライバシーポリシー",
  "footer.copyrightBefore": "© 2026 Ryan Kes。本ソフトウェアは",
  "footer.copyrightAfter":
    "のもとで提供されており、いかなる保証もありません(ライセンス第15条・第16条を参照)。表示内容は必ず衣類本体のケアラベルで確認してください。このチャートは一世帯の設定を反映したものであり、メーカーによる保証ではありません。",
  "home.title": "Washy washy",
  "home.description":
    "スマホで見やすい洗濯チャート。洗濯物の山ごとにコース・水温・脱水を、どれとどれを一緒に洗えるか、アイロンの温度設定まで一目でわかります。",
  "home.h1": "あなたの洗濯チャート",
  "home.intro":
    "洗濯表をスマホで使いやすい一枚のシートにまとめました。洗濯物の山ごとのコース・水温・脱水、一緒に洗えるかどうか、アイロンの温度設定まで確認できます。このページをスマホのホーム画面に追加すれば(Safariの共有メニューやChromeの*⋮*メニューに「ホーム画面に追加」があります)、アドレスバーのないアプリのように開き、洗濯機のそばですぐ使えます。",
  "disclaimer.title": "Washy washy — 免責事項",
  "disclaimer.description":
    "このチャートは非公式のコミュニティ運営によるもので、ある一世帯の設定を反映したものです。メーカーによる保証ではありません。",
  "disclaimer.h1": "免責事項",
  "disclaimer.p1":
    "Washy washyは非公式のコミュニティ運営プロジェクトです。いかなる洗濯機・家電メーカーとも提携、承認、協力関係にありません。",
  "disclaimer.p2":
    "同梱のチャートは、ある一世帯の洗濯・アイロンがけの設定を反映したものです。ひとつの洗濯機、ひとつのアイロン、ひとりの持ち物に合わせてうまくいった設定にすぎません。メーカーの保証でも、ケアラベルの規格でも、専門家の助言でもありません。洗濯物や生地、洗濯機はそれぞれ異なり、ある機種では安全な設定でも別の機種では傷めてしまうことがあります。",
  "disclaimer.p3":
    "衣類本体のケアラベルは、常にここに表示される内容より優先されます。内容が食い違う場合は、ケアラベルの指示に従ってください。",
  "disclaimer.p4":
    "本プロジェクトのライセンス(GPL-3.0-or-later、第15条・第16条)に定められているとおり、本ソフトウェアは明示・黙示を問わずいかなる保証もなく「現状のまま」提供されます。Washy washyのメンテナは、その利用によって生じた衣類・機械その他への損害について、いかなる責任も負いません。",
  "privacy.title": "Washy washy — プライバシーポリシー",
  "privacy.h1": "プライバシーポリシー",
  "privacy.descriptionUmami":
    "アカウントもCookieもありません。ページビュー解析にはプライバシーに配慮したUmamiを使用しており、個人を特定する情報は一切含まれません。アップロードした設定やチャートの編集内容はご自身のブラウザ内に留まり、どこにも送信されません。",
  "privacy.descriptionNoUmami":
    "アカウントもCookieも解析もトラッキングもありません。アップロードした設定やチャートの編集内容はご自身のブラウザ内に留まり、どこにも送信されません。",
  "privacy.pUmami":
    "Washy washyにはアカウントがなく、Cookieも使用していません。サイトの利用状況(どのページがどれくらい閲覧されているか)を把握するために、プライバシーに配慮した解析ツールの[Umami](https://umami.is/)を使用しています。UmamiはCookieを使わず、他サイトをまたいだ追跡もせず、個人を特定できる情報も収集しません。",
  "privacy.pNoUmami":
    "Washy washyにはアカウントもCookieも解析ツールも、いかなる追跡スクリプトもありません。このサイト上であなたの行動を監視するものは何もありません。",
  "privacy.pStorage":
    "自分の設定をアップロードしたり、チャートや洗濯機の設定を編集したりすると、そのデータはご自身のブラウザのストレージ(`localStorage`)にのみ保存されます。サーバーにも、開発者にも、他の誰にも送られることはなく、デバイスの外に出ることはありません。ブラウザでwashy washyのサイトデータを削除すれば、完全に消去されます。",
  "privacy.pHosting":
    "このサイト自体は静的なファイルのみで構成された、バックエンドのない仕組みで、[Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/)によって配信されています。どのようなWebホスティングでも同様ですが、Cloudflare側のインフラは、ページ配信に伴う通常のHTTPリクエストのメタ情報(IPアドレス、ブラウザ、リクエストされたページなど)を、あなたが訪れる他のどのサイトとも同じように把握します。Washy washy自体はその情報にアクセスできず、Cloudflareや他の誰かに求めることもありません。",
  "banner.message":
    "開発者は日本語がまったく話せないので、誤訳やそれによる不具合の責任は負いかねます。このサイトの翻訳はAI任せです。ご不満はすべてskynet宛てにお送りください。",
  "banner.dismiss": "閉じる",
};
const es: Ui = {
  "skip.toContent": "Saltar al contenido",
  "ribbon.forkMe": "Haz un fork en GitHub",
  "nav.home": "Inicio",
  "nav.washingLoads": "Cargas de lavado",
  "nav.washerIron": "Lavadora y plancha",
  "nav.docs": "Documentación",
  "switcher.label": "Idioma",
  "footer.github": "Washy washy en GitHub",
  "footer.disclaimer": "Aviso legal",
  "footer.privacy": "Política de privacidad",
  "footer.copyrightBefore": "© 2026 Ryan Kes. Publicado bajo la licencia ",
  "footer.copyrightAfter":
    " — se ofrece tal cual, sin garantía de ningún tipo (consulta las secciones 15 a 16 de la licencia). Revisa siempre la etiqueta de cuidado de cada prenda; esta tabla refleja los ajustes de una sola casa, no una garantía del fabricante.",
  "home.title": "Washy washy",
  "home.description":
    "Una tabla de lavado pensada para el móvil: programa, temperatura y centrifugado para cada montón de ropa, qué se puede lavar junto y dónde poner el termostato de la plancha.",
  "home.h1": "Tu tabla de lavado",
  "home.intro":
    'Convierte una tabla de lavado en una hoja pensada para el móvil: qué programa, temperatura y centrifugado usar para cada montón de ropa, qué se puede lavar junto y dónde poner el termostato de la plancha. Añade esta página a la pantalla de inicio de tu teléfono — tanto el menú Compartir de Safari como el menú *⋮* de Chrome tienen una opción "Añadir a pantalla de inicio" — y se abrirá como una app, sin barra de direcciones, justo al lado de la lavadora.',
  "disclaimer.title": "Washy washy — aviso legal",
  "disclaimer.description":
    "Esta tabla es extraoficial y la mantiene la comunidad; refleja los ajustes de una sola casa, no una garantía del fabricante.",
  "disclaimer.h1": "Aviso legal",
  "disclaimer.p1":
    "Washy washy es un proyecto extraoficial, mantenido por la comunidad. No está afiliado, respaldado ni producido en colaboración con ningún fabricante de lavadoras o electrodomésticos.",
  "disclaimer.p2":
    "La tabla incluida refleja los ajustes de lavado y planchado de una sola casa: un conjunto de decisiones que funcionaron para una lavadora, una plancha y la ropa de una persona. No es una garantía del fabricante, ni un estándar de etiquetado de cuidado, ni un consejo profesional. Las cargas, los tejidos y las máquinas varían, y un ajuste seguro en una máquina puede dañar otra.",
  "disclaimer.p3":
    "La etiqueta de cuidado de cada prenda siempre tiene prioridad sobre lo que se muestra aquí. Si no coinciden, sigue la etiqueta.",
  "disclaimer.p4":
    'Tal como establece la licencia del proyecto (GPL-3.0-or-later, secciones 15 a 16): el software se ofrece "tal cual", sin garantía de ningún tipo, ni expresa ni implícita. Los mantenedores de washy washy no se hacen responsables de ningún daño — a la ropa, a las máquinas o a cualquier otra cosa — derivado de su uso.',
  "privacy.title": "Washy washy — política de privacidad",
  "privacy.h1": "Política de privacidad",
  "privacy.descriptionUmami":
    "Sin cuenta, sin cookies. Las estadísticas de visitas se recogen con Umami, una herramienta respetuosa con la privacidad que no recopila nada que te identifique. Si subes una configuración o editas la tabla, esos datos se quedan en tu propio navegador y nunca se envían a ningún sitio.",
  "privacy.descriptionNoUmami":
    "Sin cuenta, sin cookies, sin estadísticas ni rastreo. Si subes una configuración o editas la tabla, esos datos se quedan en tu propio navegador y nunca se envían a ningún sitio.",
  "privacy.pUmami":
    "Washy washy no tiene cuentas de usuario ni utiliza cookies. Sí usa [Umami](https://umami.is/), una herramienta de estadísticas respetuosa con la privacidad, para ver cómo se usa el sitio: qué páginas se visitan y cuántas veces. Umami no usa cookies, no te rastrea en otros sitios y no recopila nada que te identifique personalmente.",
  "privacy.pNoUmami":
    "Washy washy no tiene cuentas de usuario, ni cookies, ni estadísticas, ni ningún tipo de script de rastreo. Aquí no hay nada vigilando lo que haces en el sitio.",
  "privacy.pStorage":
    "Si subes tu propia configuración o editas la tabla o los ajustes de las máquinas, esos datos se guardan únicamente en el almacenamiento de tu propio navegador (`localStorage`). Nunca salen de tu dispositivo: ni a un servidor, ni a nosotros, ni a nadie. Si borras los datos del sitio washy washy en tu navegador, desaparecen por completo.",
  "privacy.pHosting":
    "El sitio en sí es estático — archivos planos sin backend — servido por [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/). Como cualquier alojamiento web, la infraestructura de Cloudflare ve los metadatos habituales de una petición HTTP al servir una página — tu dirección IP, tu navegador, la página solicitada — igual que en cualquier otro sitio que visites. Washy washy no tiene acceso a esos datos, ni se los pide a Cloudflare ni a nadie más.",
  "banner.message":
    "El desarrollador no habla español y no se hace responsable de traducciones desastrosas ni de líos varios. Esta página la tradujo una IA; para quejas, escribe a skynet.",
  "banner.dismiss": "Cerrar",
};
const de: Ui = {
  "skip.toContent": "Zum Inhalt springen",
  "ribbon.forkMe": "Fork mich auf GitHub",
  "nav.home": "Start",
  "nav.washingLoads": "Waschladungen",
  "nav.washerIron": "Waschmaschine & Bügeleisen",
  "nav.docs": "Dokumentation",
  "switcher.label": "Sprache",
  "footer.github": "Washy washy auf GitHub",
  "footer.disclaimer": "Haftungsausschluss",
  "footer.privacy": "Datenschutz",
  "footer.copyrightBefore": "© 2026 Ryan Kes. Veröffentlicht unter der Lizenz ",
  "footer.copyrightAfter":
    " — bereitgestellt wie besehen, ohne jegliche Gewährleistung (siehe Lizenztext, Abschnitte 15–16). Prüfe immer das Pflegeetikett des jeweiligen Kleidungsstücks; diese Tabelle gibt die Einstellungen eines einzelnen Haushalts wieder, keine Herstellergarantie.",
  "home.title": "Washy washy",
  "home.description":
    "Eine handyfreundliche Waschtabelle: Programm, Temperatur und Schleuderzahl für jede Ladung, was zusammen in die Trommel darf und auf welche Stufe der Bügeleisen-Thermostat gehört.",
  "home.h1": "Deine Waschtabelle",
  "home.intro":
    "Verwandelt eine Waschtabelle in ein handyfreundliches Blatt: welches Programm, welche Temperatur und Schleuderzahl für welche Ladung, was zusammen in die Trommel darf und auf welche Stufe der Bügeleisen-Thermostat gehört. Füge diese Seite zum Homescreen deines Handys hinzu — im Teilen-Menü von Safari oder im *⋮*-Menü von Chrome findest du die Option „Zum Home-Bildschirm“ — dann öffnet sie sich wie eine App, ohne Adressleiste, direkt neben der Maschine.",
  "disclaimer.title": "Washy washy — Haftungsausschluss",
  "disclaimer.description":
    "Diese Tabelle ist inoffiziell und wird von der Community betrieben; sie gibt die Einstellungen eines einzelnen Haushalts wieder — keine Herstellergarantie.",
  "disclaimer.h1": "Haftungsausschluss",
  "disclaimer.p1":
    "Washy washy ist ein inoffizielles Community-Projekt. Es steht in keiner Verbindung zu, wird nicht unterstützt von und ist nicht in Zusammenarbeit mit einem Hersteller von Waschmaschinen oder Haushaltsgeräten entstanden.",
  "disclaimer.p2":
    "Die mitgelieferte Tabelle gibt die eigenen Wasch- und Bügeleinstellungen eines Haushalts wieder — Entscheidungen, die für eine bestimmte Waschmaschine, ein bestimmtes Bügeleisen und die Kleidung einer Person funktioniert haben. Sie ist keine Herstellergarantie, kein Pflegekennzeichnungsstandard und keine fachliche Beratung. Wäscheladungen, Stoffe und Maschinen unterscheiden sich, und eine Einstellung, die auf einer Maschine unbedenklich ist, kann eine andere beschädigen.",
  "disclaimer.p3":
    "Das Pflegeetikett eines Kleidungsstücks hat immer Vorrang vor allem, was hier gezeigt wird. Widersprechen sich beide, gilt das Etikett.",
  "disclaimer.p4":
    "Wie in der Lizenz des Projekts (GPL-3.0-or-later, Abschnitte 15–16) festgelegt: Die Software wird „wie besehen“ bereitgestellt, ohne jegliche ausdrückliche oder stillschweigende Gewährleistung. Die Maintainer von Washy washy haften nicht für Schäden — an Kleidung, Maschinen oder sonst etwas —, die aus der Nutzung entstehen.",
  "privacy.title": "Washy washy — Datenschutzerklärung",
  "privacy.h1": "Datenschutzerklärung",
  "privacy.descriptionUmami":
    "Kein Konto, keine Cookies. Seitenaufrufe werden mit Umami erfasst, einem datenschutzfreundlichen Tool, das nichts sammelt, das dich identifizieren könnte. Eine hochgeladene Konfiguration oder eine Änderung an der Tabelle bleibt in deinem eigenen Browser und wird niemals irgendwohin gesendet.",
  "privacy.descriptionNoUmami":
    "Kein Konto, keine Cookies, keine Analyse und kein Tracking. Eine hochgeladene Konfiguration oder eine Änderung an der Tabelle bleibt in deinem eigenen Browser und wird niemals irgendwohin gesendet.",
  "privacy.pUmami":
    "Washy washy hat kein Konto und setzt keine Cookies. Es nutzt jedoch [Umami](https://umami.is/), ein datenschutzfreundliches Analyse-Tool, um zu sehen, wie die Seite genutzt wird — welche Seiten aufgerufen werden, wie viele Besuche es gibt. Umami verwendet keine Cookies, verfolgt dich nicht über andere Websites hinweg und sammelt nichts, das dich persönlich identifiziert.",
  "privacy.pNoUmami":
    "Washy washy hat kein Konto, keine Cookies, keine Analyse und keinerlei Tracking-Skripte. Hier beobachtet nichts, was du auf der Seite tust.",
  "privacy.pStorage":
    "Wenn du deine eigene Konfiguration hochlädst oder die Tabelle bzw. die Maschineneinstellungen bearbeitest, werden diese Daten nur im Speicher deines eigenen Browsers (`localStorage`) abgelegt. Sie verlassen niemals dein Gerät — nicht an einen Server, nicht an uns, nicht an sonst jemanden. Wenn du die Website-Daten für washy washy in deinem Browser löschst, sind sie vollständig entfernt.",
  "privacy.pHosting":
    "Die Seite selbst ist statisch — reine Dateien ohne Backend —, ausgeliefert über [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/). Wie bei jedem Webhoster sieht auch Cloudflares eigene Infrastruktur die üblichen HTTP-Anfragedaten, die beim Ausliefern einer Seite anfallen — deine IP-Adresse, deinen Browser, die angeforderte Seite —, genau wie bei jeder anderen Website, die du besuchst. Washy washy selbst hat darauf keinen Zugriff und fragt weder bei Cloudflare noch bei sonst jemandem danach.",
  "banner.message":
    "Der Entwickler spricht kein Deutsch und übernimmt keine Verantwortung für Übersetzungsfehler & andere Katastrophen. Diese Seite wurde von einer KI übersetzt — alle Beschwerden bitte per E-Mail an skynet.",
  "banner.dismiss": "Schließen",
};

const fr: Ui = {
  "skip.toContent": "Aller au contenu",
  "ribbon.forkMe": "Forke-moi sur GitHub",
  "nav.home": "Accueil",
  "nav.washingLoads": "Charges de lavage",
  "nav.washerIron": "Lave-linge & fer",
  "nav.docs": "Docs",
  "switcher.label": "Langue",
  "footer.github": "Washy washy sur GitHub",
  "footer.disclaimer": "Avertissement",
  "footer.privacy": "Politique de confidentialité",
  "footer.copyrightBefore": "© 2026 Ryan Kes. Distribué sous licence ",
  "footer.copyrightAfter":
    " — fourni tel quel, sans garantie d'aucune sorte (voir la licence, sections 15 à 16). Vérifie toujours l'étiquette d'entretien du vêtement : ce tableau reflète les réglages d'un seul foyer, pas une garantie du fabricant.",
  "home.title": "Washy washy",
  "home.description":
    "Un tableau de lavage pensé pour le téléphone : programme, température et essorage pour chaque pile de linge, ce qui peut partager un tambour, et le thermostat du fer à repasser.",
  "home.h1": "Ton tableau de lavage",
  "home.intro":
    "Transforme un tableau de lavage en fiche pensée pour le téléphone : quel programme, quelle température et quel essorage pour chaque pile de linge, ce qui peut partager un tambour, et le thermostat du fer à repasser. Ajoute cette page à l'écran d'accueil de ton téléphone — le menu Partager de Safari et le menu *⋮* de Chrome ont tous les deux une option « Ajouter à l'écran d'accueil » — et elle s'ouvre comme une appli, sans barre d'adresse, juste à côté de la machine.",
  "disclaimer.title": "Washy washy — avertissement",
  "disclaimer.description":
    "Ce tableau est non officiel et géré par la communauté ; il reflète les réglages d'un seul foyer, pas une garantie du fabricant.",
  "disclaimer.h1": "Avertissement",
  "disclaimer.p1":
    "Washy washy est un projet non officiel, géré par la communauté. Il n'est affilié à aucun fabricant de lave-linge ou d'électroménager, n'est approuvé par aucun d'entre eux, et n'est produit en coopération avec aucun.",
  "disclaimer.p2":
    "Le tableau fourni reflète les réglages de lavage et de repassage d'un seul foyer — un ensemble de choix qui ont fonctionné pour un lave-linge, un fer à repasser et les vêtements d'une seule personne. Ce n'est ni une garantie du fabricant, ni une norme d'étiquetage d'entretien, ni un conseil professionnel. Les charges, les tissus et les machines varient, et un réglage sans risque sur une machine peut en abîmer une autre.",
  "disclaimer.p3":
    "L'étiquette d'entretien d'un vêtement prime toujours sur ce qui est indiqué ici. En cas de désaccord entre les deux, suis l'étiquette.",
  "disclaimer.p4":
    "Comme l'indique la licence du projet (GPL-3.0-or-later, sections 15 à 16) : le logiciel est fourni « tel quel », sans garantie d'aucune sorte, explicite ou implicite. Les mainteneurs de Washy washy ne sont responsables d'aucun dommage — aux vêtements, aux machines ou à quoi que ce soit d'autre — résultant de son utilisation.",
  "privacy.title": "Washy washy — politique de confidentialité",
  "privacy.h1": "Politique de confidentialité",
  "privacy.descriptionUmami":
    "Pas de compte, pas de cookies. Statistiques de pages via Umami, un outil respectueux de la vie privée qui ne collecte rien qui puisse t'identifier. Un fichier de configuration importé ou une modification du tableau reste dans ton propre navigateur et n'est jamais envoyé nulle part.",
  "privacy.descriptionNoUmami":
    "Pas de compte, pas de cookies, pas de statistiques, pas de pistage. Un fichier de configuration importé ou une modification du tableau reste dans ton propre navigateur et n'est jamais envoyé nulle part.",
  "privacy.pUmami":
    "Washy washy n'a pas de compte et ne pose pas de cookies. Le site utilise [Umami](https://umami.is/), un outil de statistiques respectueux de la vie privée, pour voir comment il est utilisé — quelles pages, combien de visites. Umami n'utilise pas de cookies, ne te suit pas sur d'autres sites, et ne collecte rien qui puisse t'identifier personnellement.",
  "privacy.pNoUmami":
    "Washy washy n'a pas de compte, pas de cookies, pas de statistiques et aucun script de pistage, quel qu'il soit. Rien ici ne surveille ce que tu fais sur le site.",
  "privacy.pStorage":
    "Importer ta propre configuration, ou modifier le tableau ou les réglages des machines, enregistre ces données uniquement dans le stockage de ton navigateur (`localStorage`). Elles ne quittent jamais ton appareil — ni vers un serveur, ni vers nous, ni vers personne. Effacer les données du site washy washy dans ton navigateur les supprime complètement.",
  "privacy.pHosting":
    "Le site lui-même est statique — de simples fichiers, sans backend — servi par [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/). Comme n'importe quel hébergeur web, l'infrastructure de Cloudflare voit les métadonnées HTTP habituelles liées au chargement d'une page — ton adresse IP, ton navigateur, la page demandée — comme sur n'importe quel site que tu visites. Washy washy lui-même n'y a pas accès, et ne les demande ni à Cloudflare ni à personne d'autre.",
  "banner.message":
    "Le développeur ne parle pas français et n'est responsable d'aucune mauvaise traduction ni d'aucun impair. Ce site a été traduit par une IA : envoie toutes tes réclamations à skynet.",
  "banner.dismiss": "Fermer",
};
const jive: Ui = {
  "skip.toContent": "Jump straight past the jibber-jabber to the good stuff",
  "ribbon.forkMe": "Fork me on GitHub, chump!",
  "nav.home": "Home Base",
  "nav.washingLoads": "Wash Piles",
  "nav.washerIron": "Washer & Iron, Jack",
  "nav.docs": "The Docs, Jack",
  "switcher.label": "Jibber-Jabber",
  "footer.github": "Washy washy, straight outta sight on GitHub",
  "footer.disclaimer": "The Fine Print",
  "footer.privacy": "Privacy Jibber-Jabber",
  "footer.copyrightBefore": "© 2026 Ryan Kes. This here jam's licensed up solid under the ",
  "footer.copyrightAfter":
    " — served up as-is, with no warranty of any kind, you dig (peep sections 15–16 of the licence for the skinny). Always check your glad rags' own care label, chump — this chart's just reflectin' one crib's settings, not no manufacturer's guarantee.",
  "home.title": "Washy washy",
  "home.description":
    "A phone-friendly laundry chart, solid: which programme, temperature and spin for every pile o' clothes, what can boogie together in one drum, and where that iron's thermostat oughta go.",
  "home.h1": "Your Laundry Chart, Jack",
  "home.intro":
    "Turns your laundry chart into one phone-friendly sheet, dig: which programme, temperature and spin for each pile, what can boogie together in one drum, and where that iron's thermostat oughta land. Slap this page on your phone's home screen — Safari's Share menu or Chrome's *⋮* menu both got themselves an \"Add to Home Screen\" option — and it pops open like a real app, no address bar jibber-jabber, right there by the machine, solid.",
  "disclaimer.title": "Washy washy — the fine print, jack",
  "disclaimer.description":
    "This here chart ain't official, no sir — just some solid folks doin' their own thang, reflectin' one crib's own settings. Ain't no manufacturer's guarantee, you dig?",
  "disclaimer.h1": "The Fine Print",
  "disclaimer.p1":
    "Washy washy is one unofficial, community-run jam, solid. Ain't hooked up with, backed by, or made together with no washing machine or appliance manufacturer, no way, no how.",
  "disclaimer.p2":
    "The threads bundled up in here reflect one crib's own washin' and ironin' settings — a bunch o' choices that worked out solid for one washer, one iron, and one cat's glad rags. Ain't no manufacturer's guarantee, ain't no care-label standard, and ain't no professional advice neither, you dig? Loads, fabrics and machines all be different, jack, and a setting that's smooth sailin' on one machine could jack up another something fierce.",
  "disclaimer.p3":
    "Your glad rags' own care label always calls the shots over whatever's shown up in here. When the two don't see eye to eye, dig, you follow the label, fo' sho'.",
  "disclaimer.p4":
    "Like it says right there in the project's licence (GPL-3.0-or-later, sections 15–16): this software's served up \"as is,\" no warranty of any kind, express or implied, straight up, you dig. Washy washy's maintainers ain't liable for no damage — to your threads, your machines, or nothin' else — that comes from usin' this jam.",
  "privacy.title": "Washy washy — the privacy jibber-jabber",
  "privacy.h1": "Privacy Jibber-Jabber",
  "privacy.descriptionUmami":
    "Ain't no account, ain't no cookies, no way. Page-view analytics runnin' through Umami, a privacy-respectin' rig that don't know jack about who you are. Any config you upload or chart you edit stays locked up in your own browser, solid — never gets sent nowhere, you dig?",
  "privacy.descriptionNoUmami":
    "Ain't no account, no cookies, no analytics, no trackin', nothin'. Any config you upload or chart you edit stays locked up in your own browser, solid — never gets sent nowhere, you dig?",
  "privacy.pUmami":
    "Washy washy ain't got no account and don't set no cookies, jack. It do use [Umami](https://umami.is/), a privacy-respectin' analytics rig, just to peep how the site gets used — which pages, how many folks droppin' by. Umami don't use no cookies, don't track you 'cross other sites, and don't collect nothin' that IDs you personal-like.",
  "privacy.pNoUmami":
    "Washy washy's got no account, no cookies, no analytics, and no trackin' scripts, period. Ain't nothin' up in here watchin' what you be doin' on the site, you dig?",
  "privacy.pStorage":
    "Upload your own config, or go edit the chart or the machine settings, and that data only gets saved in your own browser's storage (`localStorage`), solid. It never leaves your device — not to no server, not to us, not to nobody. Clear out your browser's site data for washy washy, and it's gone, clean outta sight.",
  "privacy.pHosting":
    "The site itself's static, jack — just plain files, no backend jibber-jabber — served up by [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/). Like any web host, Cloudflare's own rig sees the regular ol' HTTP request info that comes with servin' up a page — your IP address, your browser, the page you asked for — same as any site you roll up on. Washy washy itself don't get none o' that, and don't ask Cloudflare or nobody else for it neither, you dig?",
  "banner.message":
    "Now dig this, jack: the cat who built this crib don't speak a lick o' Jive, so he ain't on the hook for whatever jibber-jabber got lost in translation. Some slick AI cooked up this whole rap, so if you got beef, take it up with skynet, you dig?",
  "banner.dismiss": "Scram",
};

/** Exported for test/ui.test.ts, which checks every locale carries the same keys. */
export const dictionaries: Record<Locale, Ui> = { en, ja, de, es, fr, jive };

export function translator(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  return function t(key: keyof Ui): string {
    return dict[key] ?? dictionaries[DEFAULT_LOCALE][key];
  };
}
