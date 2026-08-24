import { DEFAULT_LOCALE, type Locale } from "./locales";

/**
 * Site chrome, the three static pages (home, disclaimer, privacy), and the
 * interactive chart/config/machine UI. `/docs` prose stays in its own
 * per-locale content collection (src/content/docs/), not here.
 *
 * Values with a `{token}` placeholder are interpolated by `translator()`'s
 * returned `t(key, params)` — plain string replacement (`"{token}"` ->
 * `String(params.token)`), not ICU MessageFormat. Keep every placeholder
 * name in a translation identical to the English source's.
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

  // --- Shared across the interactive chart/config/machine UI ---
  "common.pile": string;
  "common.detergent": string;
  "common.notes": string;
  "common.temp": string;
  "common.spinRpm": string;
  "common.buttons": string;
  "common.programme": string;
  "common.source": string;
  "common.doNotIron": string;
  "common.noSpin": string;
  "common.softenerOk": string;
  "common.noSoftener": string;
  "common.copied": string;
  "common.remove": string;
  "common.name": string;
  "common.iron": string;
  "common.washingLoadsPageLink": string;
  /** "{position} clockwise from {off}" — the caption under a programme dial. */
  "common.clockwiseFrom": string;
  "common.insideSteamZone": string;
  "common.belowSteamZone": string;
  /** "Could not use that file: {error}" */
  "common.couldNotUseFile": string;
  /** "Could not save: {error}" */
  "common.couldNotSave": string;
  "common.downloadCurrentConfig": string;
  "common.uploadConfigJson": string;
  "common.saveChanges": string;
  "common.showingOwnConfig": string;
  /** aria-label on every HelpBubble ("?") button. */
  "common.whatDoesThisDo": string;

  // --- SheetViewer.tsx (home page's filter bar and status/error text) ---
  "sheetViewer.cutEverything": string;
  "sheetViewer.cutWashOnly": string;
  "sheetViewer.cutIronOnly": string;
  "sheetViewer.filterChart": string;
  "sheetViewer.cutLabel": string;
  "sheetViewer.cutHelp": string;
  "sheetViewer.pileHelp": string;
  "sheetViewer.pileSearchPlaceholder": string;
  "sheetViewer.advanced": string;
  "sheetViewer.programmeHelp": string;
  "sheetViewer.anyProgramme": string;
  "sheetViewer.temperatureLabel": string;
  "sheetViewer.temperatureHelp": string;
  "sheetViewer.anyTemperature": string;
  "sheetViewer.spinLabel": string;
  "sheetViewer.spinHelp": string;
  "sheetViewer.anySpin": string;
  "sheetViewer.detergentHelp": string;
  "sheetViewer.detergentSearchPlaceholder": string;
  /** "Could not open the shared config: {error}. Showing what was already active instead." */
  "sheetViewer.sharedConfigError": string;
  "sheetViewer.showingBundledChart": string;
  "sheetViewer.uploadEditPrefix": string;
  /** 'No pile matches "{query}" with those advanced filters. Try loosening one.' */
  "sheetViewer.noPileMatchAdvanced": string;
  /** 'No pile matches "{query}". Try a different search.' */
  "sheetViewer.noPileMatchQuery": string;
  "sheetViewer.noPileMatchAdvancedOnly": string;
  "sheetViewer.preparingPdf": string;
  "sheetViewer.downloadForPhone": string;
  "sheetViewer.downloadToPrint": string;
  "sheetViewer.shareThisView": string;
  /** "Could not share this view: {error}" */
  "sheetViewer.couldNotShare": string;
  /** "Could not generate the phone PDF: {error}" */
  "sheetViewer.couldNotGeneratePhonePdf": string;
  /** "Could not generate the print PDF: {error}" */
  "sheetViewer.couldNotGeneratePrintPdf": string;
  /** "Couldn't render in the phone PDF: {chars}" */
  "sheetViewer.couldntRenderPhone": string;
  /** "Couldn't render in the print PDF: {chars}" */
  "sheetViewer.couldntRenderPrint": string;

  // --- Sheet.tsx (the read-only rendered sheet, and each card) ---
  "sheet.subtitleFull": string;
  "sheet.subtitleWash": string;
  "sheet.subtitleIron": string;
  "sheet.washingInstructions": string;
  "sheet.loadsHeading": string;
  "sheet.loadsExplain": string;
  "sheet.together": string;
  "sheet.legendThermostatCaption": string;
  "sheet.legendProgrammeCaption": string;
  "sheet.legendIronExplain": string;
  /** "The dials are drawn as they sit on the machine: twelve o'clock is {off}, ..." */
  "sheet.legendWashExplain": string;
  /** Appended only for the "full" variant. */
  "sheet.legendWashExplainFullSuffix": string;
  "sheet.washHeading": string;
  "sheet.washTogetherWithLabel": string;
  "sheet.washTogetherEachOther": string;
  /** "each other, and {names}" */
  "sheet.washTogetherEachOtherAnd": string;
  "sheet.washSeparately": string;
  "sheet.washAlone": string;
  "sheet.dryingLabel": string;
  /** "{count} pile" */
  "sheet.pileCountOne": string;
  /** "{count} piles" */
  "sheet.pileCountOther": string;
  "sheet.thermostatOn": string;
  "sheet.leaveIronOff": string;
  "sheet.neverNearBoard": string;
  "sheet.howHeading": string;
  "sheet.neverTheseHeading": string;
  "sheet.durationsDisclaimer": string;
  "sheet.copyLink": string;
  "sheet.preparing": string;
  "sheet.download": string;
  /** "Could not copy the link: {error}" */
  "sheet.couldNotCopyLink": string;
  /** "Could not generate the PDF: {error}" */
  "sheet.couldNotGeneratePdf": string;
  /** "Couldn't render in the PDF: {chars}" */
  "sheet.couldntRenderInPdf": string;

  // --- ConfigViewer.tsx (/config, the washing-loads editor) ---
  "config.editMachine": string;
  "config.programmes": string;
  "config.temperatures": string;
  "config.spinSpeeds": string;
  "config.ironSettings": string;
  "config.durationInvalidHint": string;
  "config.durationValidHint": string;
  "config.durationAriaLabel": string;
  "config.showingBundledConfig": string;
  "config.uploadEditHelp": string;
  "config.yourConfigHeading": string;
  "config.useBundledInstead": string;
  "config.machineHeading": string;
  "config.chartHeading": string;
  "config.chartEditHelp": string;
  "config.sortBy": string;
  "config.chartOrder": string;
  "config.ironedLabel": string;
  "config.ironingNotesAriaLabel": string;
  "config.colourGroupHeading": string;
  "config.mixTagsHeading": string;

  // --- MachineEditor.tsx (/config/machine) ---
  /** "Move {value} up" */
  "machine.moveUp": string;
  /** "Move {value} down" */
  "machine.moveDown": string;
  /** "Remove {value}" */
  "machine.removeItem": string;
  "machine.addButton": string;
  "machine.capacityLabel": string;
  "machine.programmesHint": string;
  "machine.temperaturesLabel": string;
  "machine.addPlaceholderProgramme": string;
  "machine.addPlaceholderTemperature": string;
  "machine.addPlaceholderSpin": string;
  "machine.addPlaceholderButton": string;
  "machine.addAriaProgramme": string;
  "machine.addAriaTemperature": string;
  "machine.addAriaSpin": string;
  "machine.addAriaButton": string;
  "machine.settingsHeading": string;
  "machine.settingColumnHeader": string;
  "machine.dotsColumnHeader": string;
  "machine.detailColumnHeader": string;
  "machine.steamColumnHeader": string;
  /** "Setting {n} label" */
  "machine.settingLabelAria": string;
  /** "Setting {n} dots" */
  "machine.settingDotsAria": string;
  /** "Setting {n} detail" */
  "machine.settingDetailAria": string;
  /** "Setting {n} makes steam" */
  "machine.settingSteamAria": string;
  /** "Remove setting {n}" */
  "machine.removeSettingAria": string;
  "machine.addSetting": string;
  "machine.newSettingDefaultLabel": string;
  "machine.showingOwnMachine": string;
  "machine.showingBundledMachine": string;
  "machine.changesApplyPrefix": string;
  "machine.changesApplySuffix": string;
  "machine.useBundledMachineInstead": string;
  "machine.washerHeading": string;

  // --- HeaderUpload.tsx ---
  "upload.uploadConfig": string;

  // --- KeyboardNav.tsx + lib/keyboardNav.ts ---
  "keyboardNav.title": string;
  "keyboardNav.close": string;
  "keyboardNav.scrollDown": string;
  "keyboardNav.scrollUp": string;
  "keyboardNav.jumpTop": string;
  "keyboardNav.jumpBottom": string;
  "keyboardNav.focusSearch": string;
  "keyboardNav.toggleHelp": string;
  "keyboardNav.closeHelp": string;

  // --- ThemeToggle.tsx ---
  "theme.switchToLight": string;
  "theme.switchToDark": string;

  // --- src/pages/config.astro ---
  "page.config.title": string;
  "page.config.description": string;
  "page.config.h1": string;

  // --- src/pages/config/machine.astro ---
  "page.machine.title": string;
  "page.machine.description": string;
  "page.machine.h1": string;
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

  "common.pile": "Pile",
  "common.detergent": "Detergent",
  "common.notes": "Notes",
  "common.temp": "Temp",
  "common.spinRpm": "Spin rpm",
  "common.buttons": "Buttons",
  "common.programme": "Programme",
  "common.source": "SOURCE",
  "common.doNotIron": "Do not iron",
  "common.noSpin": "no spin",
  "common.softenerOk": "SOFTENER OK",
  "common.noSoftener": "NO SOFTENER",
  "common.copied": "Copied!",
  "common.remove": "Remove",
  "common.name": "Name",
  "common.iron": "Iron",
  "common.washingLoadsPageLink": "washing loads page",
  "common.clockwiseFrom": "{position} clockwise from {off}",
  "common.insideSteamZone": "inside the steam zone",
  "common.belowSteamZone": "below the steam zone — dry iron only",
  "common.couldNotUseFile": "Could not use that file: {error}",
  "common.couldNotSave": "Could not save: {error}",
  "common.downloadCurrentConfig": "Download current config",
  "common.uploadConfigJson": "Upload a config (JSON)",
  "common.saveChanges": "Save changes",
  "common.showingOwnConfig": "Showing your own config.",
  "common.whatDoesThisDo": "What does this do?",

  "sheetViewer.cutEverything": "Everything",
  "sheetViewer.cutWashOnly": "Washing only",
  "sheetViewer.cutIronOnly": "Ironing only",
  "sheetViewer.filterChart": "Filter the chart",
  "sheetViewer.cutLabel": "Cut",
  "sheetViewer.cutHelp":
    "Which parts of the chart to show: everything, washing only, or ironing only.",
  "sheetViewer.pileHelp": 'Type part of a pile’s name, like "towels", to show just that card.',
  "sheetViewer.pileSearchPlaceholder": "Search by pile name…",
  "sheetViewer.advanced": "Advanced",
  "sheetViewer.programmeHelp": "Show only piles using this programme.",
  "sheetViewer.anyProgramme": "Any programme",
  "sheetViewer.temperatureLabel": "Temperature",
  "sheetViewer.temperatureHelp": "Show only piles washed at this temperature.",
  "sheetViewer.anyTemperature": "Any temperature",
  "sheetViewer.spinLabel": "Spin",
  "sheetViewer.spinHelp": "Show only piles spun at this speed.",
  "sheetViewer.anySpin": "Any spin",
  "sheetViewer.detergentHelp":
    'Type part of a detergent note, like "powder", to show only piles that mention it.',
  "sheetViewer.detergentSearchPlaceholder": "Search by detergent…",
  "sheetViewer.sharedConfigError":
    "Could not open the shared config: {error}. Showing what was already active instead.",
  "sheetViewer.showingBundledChart":
    "Showing the bundled example chart. It's a generic laundry chart, not your own.",
  "sheetViewer.uploadEditPrefix": "Upload, download or edit your own on the",
  "sheetViewer.noPileMatchAdvanced":
    'No pile matches "{query}" with those advanced filters. Try loosening one.',
  "sheetViewer.noPileMatchQuery": 'No pile matches "{query}". Try a different search.',
  "sheetViewer.noPileMatchAdvancedOnly":
    "No pile matches those advanced filters. Try loosening one.",
  "sheetViewer.preparingPdf": "Preparing PDF…",
  "sheetViewer.downloadForPhone": "Download for phone",
  "sheetViewer.downloadToPrint": "Download to print",
  "sheetViewer.shareThisView": "Share this view",
  "sheetViewer.couldNotShare": "Could not share this view: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "Could not generate the phone PDF: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "Could not generate the print PDF: {error}",
  "sheetViewer.couldntRenderPhone": "Couldn't render in the phone PDF: {chars}",
  "sheetViewer.couldntRenderPrint": "Couldn't render in the print PDF: {chars}",

  "sheet.subtitleFull": "Scroll for the pile you are holding.",
  "sheet.subtitleWash": "Getting it into the machine. Ironing is on the other sheet.",
  "sheet.subtitleIron": "At the board. Washing is on the other sheet.",
  "sheet.washingInstructions": "Washing instructions",
  "sheet.loadsHeading": "Loads — one line, one wash",
  "sheet.loadsExplain":
    "A TOGETHER badge means every pile on that line shares one wash — put them in the machine at once.",
  "sheet.together": "TOGETHER",
  "sheet.legendThermostatCaption": "thermostat",
  "sheet.legendProgrammeCaption": "programme",
  "sheet.legendIronExplain":
    "The ring is the iron's thermostat as it sits on the dial, and the red pointer is where to turn it. The blue band is the zone where it makes steam; a setting below it is a dry iron. A crossed-out ring means leave the iron in the cupboard.",
  "sheet.legendWashExplain":
    "The dials are drawn as they sit on the machine: twelve o'clock is {off}, and the red pointer is where to turn it. Chips show every value the display steps through, filled in on the one you want.",
  "sheet.legendWashExplainFullSuffix":
    " On the iron, the blue band is the zone where it makes steam.",
  "sheet.washHeading": "Wash",
  "sheet.washTogetherWithLabel": "Wash together with",
  "sheet.washTogetherEachOther": "each other",
  "sheet.washTogetherEachOtherAnd": "each other, and {names}",
  "sheet.washSeparately": "same settings, but wash these separately — see the matrix",
  "sheet.washAlone": "nothing else — wash alone",
  "sheet.dryingLabel": "Drying",
  "sheet.pileCountOne": "{count} pile",
  "sheet.pileCountOther": "{count} piles",
  "sheet.thermostatOn": "Thermostat on {label}",
  "sheet.leaveIronOff": "Leave the iron off",
  "sheet.neverNearBoard": "nothing on this card ever goes near the board",
  "sheet.howHeading": "How",
  "sheet.neverTheseHeading": "Never these",
  "sheet.durationsDisclaimer": "Durations are the machine's own estimates and vary with load.",
  "sheet.copyLink": "Copy link",
  "sheet.preparing": "Preparing…",
  "sheet.download": "Download",
  "sheet.couldNotCopyLink": "Could not copy the link: {error}",
  "sheet.couldNotGeneratePdf": "Could not generate the PDF: {error}",
  "sheet.couldntRenderInPdf": "Couldn't render in the PDF: {chars}",

  "config.editMachine": "Edit machine →",
  "config.programmes": "Programmes",
  "config.temperatures": "Temperatures",
  "config.spinSpeeds": "Spin speeds",
  "config.ironSettings": "Iron settings",
  "config.durationInvalidHint": "Use H:MM, like 2:30",
  "config.durationValidHint": "Format: H:MM, like 2:30",
  "config.durationAriaLabel": "Duration",
  "config.showingBundledConfig":
    "Showing the bundled example config. It's a generic laundry chart and washing machine, not your own.",
  "config.uploadEditHelp":
    "Upload, download or edit below — changes apply across the whole site once saved, and persist in this browser until you clear them.",
  "config.yourConfigHeading": "Your config",
  "config.useBundledInstead": "Use the bundled example instead",
  "config.machineHeading": "Machine",
  "config.chartHeading": "Chart — every pile",
  "config.chartEditHelp":
    "Every field is editable. Save checks each row against the machine above, the same way an upload does — an unknown value is called out by row and column, not silently accepted.",
  "config.sortBy": "Sort by",
  "config.chartOrder": "Chart order",
  "config.ironedLabel": "IRONED",
  "config.ironingNotesAriaLabel": "Ironing notes",
  "config.colourGroupHeading": "Colour group",
  "config.mixTagsHeading": "Mix tags",

  "machine.moveUp": "Move {value} up",
  "machine.moveDown": "Move {value} down",
  "machine.removeItem": "Remove {value}",
  "machine.addButton": "+ Add",
  "machine.capacityLabel": "Capacity",
  "machine.programmesHint": "In dial order, starting from twelve o'clock.",
  "machine.temperaturesLabel": "Temperatures (°C)",
  "machine.addPlaceholderProgramme": "Add a programme…",
  "machine.addPlaceholderTemperature": "Add a temperature…",
  "machine.addPlaceholderSpin": "Add a spin…",
  "machine.addPlaceholderButton": "Add a button…",
  "machine.addAriaProgramme": "Add to Programmes",
  "machine.addAriaTemperature": "Add to Temperatures (°C)",
  "machine.addAriaSpin": "Add to Spin speeds",
  "machine.addAriaButton": "Add to Buttons",
  "machine.settingsHeading": "Settings",
  "machine.settingColumnHeader": "Setting",
  "machine.dotsColumnHeader": "Dots",
  "machine.detailColumnHeader": "Detail",
  "machine.steamColumnHeader": "Steam",
  "machine.settingLabelAria": "Setting {n} label",
  "machine.settingDotsAria": "Setting {n} dots",
  "machine.settingDetailAria": "Setting {n} detail",
  "machine.settingSteamAria": "Setting {n} makes steam",
  "machine.removeSettingAria": "Remove setting {n}",
  "machine.addSetting": "+ Add setting",
  "machine.newSettingDefaultLabel": "New setting",
  "machine.showingOwnMachine": "Showing your own machine.",
  "machine.showingBundledMachine":
    "Showing the bundled example machine. It's a generic washer and iron, not your own.",
  "machine.changesApplyPrefix": "Changes apply across the whole site once saved — the same config",
  "machine.changesApplySuffix": " reads.",
  "machine.useBundledMachineInstead": "Use the bundled machine instead",
  "machine.washerHeading": "Washer",

  "upload.uploadConfig": "Upload config",

  "keyboardNav.title": "Keyboard shortcuts",
  "keyboardNav.close": "Close",
  "keyboardNav.scrollDown": "Scroll down",
  "keyboardNav.scrollUp": "Scroll up",
  "keyboardNav.jumpTop": "Jump to the top",
  "keyboardNav.jumpBottom": "Jump to the bottom",
  "keyboardNav.focusSearch": "Focus the page's search field",
  "keyboardNav.toggleHelp": "Toggle this help",
  "keyboardNav.closeHelp": "Close this help",

  "theme.switchToLight": "Switch to light mode",
  "theme.switchToDark": "Switch to dark mode",

  "page.config.title": "Washy washy — washing loads",
  "page.config.description":
    "The full loaded config: the washing machine and iron's settings, and every pile in the chart, in one structured place.",
  "page.config.h1": "Washing loads",

  "page.machine.title": "Washy washy — washer & iron settings",
  "page.machine.description":
    "The washing machine and iron's settings — programmes, temperatures, spins, and the iron's thermostat.",
  "page.machine.h1": "Washer & iron settings",
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

  "common.pile": "山",
  "common.detergent": "洗剤",
  "common.notes": "メモ",
  "common.temp": "温度",
  "common.spinRpm": "脱水rpm",
  "common.buttons": "ボタン",
  "common.programme": "プログラム",
  "common.source": "ソース",
  "common.doNotIron": "アイロン不可",
  "common.noSpin": "脱水なし",
  "common.softenerOk": "柔軟剤OK",
  "common.noSoftener": "柔軟剤NG",
  "common.copied": "コピーしました!",
  "common.remove": "削除",
  "common.name": "名前",
  "common.iron": "アイロン",
  "common.washingLoadsPageLink": "洗濯物一覧ページ",
  "common.clockwiseFrom": "{off}から時計回りに{position}",
  "common.insideSteamZone": "スチームゾーン内",
  "common.belowSteamZone": "スチームゾーンより下 — ドライアイロンのみ",
  "common.couldNotUseFile": "そのファイルを使用できませんでした: {error}",
  "common.couldNotSave": "保存できませんでした: {error}",
  "common.downloadCurrentConfig": "現在の設定をダウンロード",
  "common.uploadConfigJson": "設定（JSON）をアップロード",
  "common.saveChanges": "変更を保存",
  "common.showingOwnConfig": "あなた自身の設定を表示しています。",
  "common.whatDoesThisDo": "これは何をするもの?",

  "sheetViewer.cutEverything": "すべて",
  "sheetViewer.cutWashOnly": "洗濯のみ",
  "sheetViewer.cutIronOnly": "アイロンのみ",
  "sheetViewer.filterChart": "チャートを絞り込む",
  "sheetViewer.cutLabel": "表示範囲",
  "sheetViewer.cutHelp":
    "チャートのどの部分を表示するか: すべて、洗濯のみ、アイロンのみから選べます。",
  "sheetViewer.pileHelp":
    "「タオル」のように山の名前の一部を入力すると、そのカードだけを表示します。",
  "sheetViewer.pileSearchPlaceholder": "山の名前で検索…",
  "sheetViewer.advanced": "詳細設定",
  "sheetViewer.programmeHelp": "このプログラムを使用する山だけを表示します。",
  "sheetViewer.anyProgramme": "すべてのプログラム",
  "sheetViewer.temperatureLabel": "温度",
  "sheetViewer.temperatureHelp": "この温度で洗う山だけを表示します。",
  "sheetViewer.anyTemperature": "すべての温度",
  "sheetViewer.spinLabel": "脱水",
  "sheetViewer.spinHelp": "この速度で脱水する山だけを表示します。",
  "sheetViewer.anySpin": "すべての脱水",
  "sheetViewer.detergentHelp":
    "「粉末」のように洗剤メモの一部を入力すると、それに言及する山だけを表示します。",
  "sheetViewer.detergentSearchPlaceholder": "洗剤で検索…",
  "sheetViewer.sharedConfigError":
    "共有された設定を開けませんでした: {error}。代わりに、すでに有効だった設定を表示しています。",
  "sheetViewer.showingBundledChart":
    "同梱のサンプルチャートを表示しています。これは一般的な洗濯チャートであり、あなた自身のものではありません。",
  "sheetViewer.uploadEditPrefix": "自分のものをアップロード・ダウンロード・編集できるのは",
  "sheetViewer.noPileMatchAdvanced":
    "詳細フィルターの条件では「{query}」に一致する山がありません。条件を緩めてみてください。",
  "sheetViewer.noPileMatchQuery":
    "「{query}」に一致する山がありません。別のキーワードで検索してみてください。",
  "sheetViewer.noPileMatchAdvancedOnly":
    "その詳細フィルターの条件に一致する山がありません。条件を緩めてみてください。",
  "sheetViewer.preparingPdf": "PDFを準備中…",
  "sheetViewer.downloadForPhone": "スマホ用にダウンロード",
  "sheetViewer.downloadToPrint": "印刷用にダウンロード",
  "sheetViewer.shareThisView": "この表示を共有",
  "sheetViewer.couldNotShare": "この表示を共有できませんでした: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "スマホ用PDFを生成できませんでした: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "印刷用PDFを生成できませんでした: {error}",
  "sheetViewer.couldntRenderPhone": "スマホ用PDFで描画できませんでした: {chars}",
  "sheetViewer.couldntRenderPrint": "印刷用PDFで描画できませんでした: {chars}",

  "sheet.subtitleFull": "手に持っている山までスクロールしてください。",
  "sheet.subtitleWash": "洗濯機に入れる作業です。アイロンはもう一方のシートにあります。",
  "sheet.subtitleIron": "アイロン台での作業です。洗濯はもう一方のシートにあります。",
  "sheet.washingInstructions": "洗濯方法",
  "sheet.loadsHeading": "洗濯単位 — 1行 = 1回の洗濯",
  "sheet.loadsExplain":
    "「同時洗い」バッジは、その行のすべての山が同じ洗濯を共有することを意味します — まとめて洗濯機に入れてください。",
  "sheet.together": "同時洗い",
  "sheet.legendThermostatCaption": "サーモスタット",
  "sheet.legendProgrammeCaption": "プログラム",
  "sheet.legendIronExplain":
    "この輪はダイヤル上のアイロンのサーモスタットを表し、赤い矢印は合わせるべき位置です。青い帯はスチームが出る範囲で、それより低い設定はドライアイロンになります。輪に斜線が入っている場合は、アイロンを戸棚にしまったままにしてください。",
  "sheet.legendWashExplain":
    "ダイヤルは洗濯機についているとおりに描かれています: 12時の位置が{off}で、赤い矢印は合わせるべき位置です。チップは表示が切り替わるすべての値を示し、目的の値が塗りつぶされています。",
  "sheet.legendWashExplainFullSuffix": " アイロンでは、青い帯がスチームの出る範囲です。",
  "sheet.washHeading": "洗濯",
  "sheet.washTogetherWithLabel": "一緒に洗う相手",
  "sheet.washTogetherEachOther": "お互い",
  "sheet.washTogetherEachOtherAnd": "お互い、そして{names}",
  "sheet.washSeparately": "設定は同じですが、これらは別々に洗ってください — 表を参照",
  "sheet.washAlone": "他には何もありません — 単独で洗う",
  "sheet.dryingLabel": "乾燥",
  "sheet.pileCountOne": "{count}枚",
  "sheet.pileCountOther": "{count}枚",
  "sheet.thermostatOn": "サーモスタットを{label}に設定",
  "sheet.leaveIronOff": "アイロンの電源は入れない",
  "sheet.neverNearBoard": "このカードのものはアイロン台に一切近づけません",
  "sheet.howHeading": "方法",
  "sheet.neverTheseHeading": "厳禁",
  "sheet.durationsDisclaimer": "所要時間は洗濯機による目安であり、洗濯物の量によって変わります。",
  "sheet.copyLink": "リンクをコピー",
  "sheet.preparing": "準備中…",
  "sheet.download": "ダウンロード",
  "sheet.couldNotCopyLink": "リンクをコピーできませんでした: {error}",
  "sheet.couldNotGeneratePdf": "PDFを生成できませんでした: {error}",
  "sheet.couldntRenderInPdf": "PDFで描画できませんでした: {chars}",

  "config.editMachine": "洗濯機を編集 →",
  "config.programmes": "プログラム",
  "config.temperatures": "温度",
  "config.spinSpeeds": "脱水速度",
  "config.ironSettings": "アイロン設定",
  "config.durationInvalidHint": "H:MM形式で入力してください（例: 2:30）",
  "config.durationValidHint": "形式: H:MM（例: 2:30）",
  "config.durationAriaLabel": "所要時間",
  "config.showingBundledConfig":
    "同梱のサンプル設定を表示しています。これは一般的な洗濯チャートと洗濯機であり、あなた自身のものではありません。",
  "config.uploadEditHelp":
    "以下でアップロード、ダウンロード、編集ができます — 保存すると変更はサイト全体に適用され、消去するまでこのブラウザに保存されます。",
  "config.yourConfigHeading": "あなたの設定",
  "config.useBundledInstead": "代わりに同梱のサンプルを使用",
  "config.machineHeading": "洗濯機",
  "config.chartHeading": "チャート — すべての山",
  "config.chartEditHelp":
    "すべての項目を編集できます。保存時には、アップロード時と同様に各行を上の洗濯機の設定と照合します — 不明な値は黙って受け入れられず、行と列で指摘されます。",
  "config.sortBy": "並べ替え",
  "config.chartOrder": "チャート順",
  "config.ironedLabel": "アイロン済み",
  "config.ironingNotesAriaLabel": "アイロンメモ",
  "config.colourGroupHeading": "色グループ",
  "config.mixTagsHeading": "混用タグ",

  "machine.moveUp": "{value}を上に移動",
  "machine.moveDown": "{value}を下に移動",
  "machine.removeItem": "{value}を削除",
  "machine.addButton": "+ 追加",
  "machine.capacityLabel": "容量",
  "machine.programmesHint": "12時の位置から始まる、ダイヤルの並び順どおりに。",
  "machine.temperaturesLabel": "温度（°C）",
  "machine.addPlaceholderProgramme": "プログラムを追加…",
  "machine.addPlaceholderTemperature": "温度を追加…",
  "machine.addPlaceholderSpin": "脱水を追加…",
  "machine.addPlaceholderButton": "ボタンを追加…",
  "machine.addAriaProgramme": "プログラムに追加",
  "machine.addAriaTemperature": "温度（°C）に追加",
  "machine.addAriaSpin": "脱水速度に追加",
  "machine.addAriaButton": "ボタンに追加",
  "machine.settingsHeading": "設定",
  "machine.settingColumnHeader": "設定",
  "machine.dotsColumnHeader": "ドット",
  "machine.detailColumnHeader": "詳細",
  "machine.steamColumnHeader": "スチーム",
  "machine.settingLabelAria": "設定{n}のラベル",
  "machine.settingDotsAria": "設定{n}のドット",
  "machine.settingDetailAria": "設定{n}の詳細",
  "machine.settingSteamAria": "設定{n}はスチームが出る",
  "machine.removeSettingAria": "設定{n}を削除",
  "machine.addSetting": "+ 設定を追加",
  "machine.newSettingDefaultLabel": "新しい設定",
  "machine.showingOwnMachine": "あなた自身の洗濯機を表示しています。",
  "machine.showingBundledMachine":
    "同梱のサンプル洗濯機を表示しています。これは一般的な洗濯機とアイロンであり、あなた自身のものではありません。",
  "machine.changesApplyPrefix": "変更は保存するとサイト全体に適用されます — これは",
  "machine.changesApplySuffix": "が読み込むのと同じ設定です。",
  "machine.useBundledMachineInstead": "代わりに同梱の洗濯機を使用",
  "machine.washerHeading": "洗濯機",

  "upload.uploadConfig": "設定をアップロード",

  "keyboardNav.title": "キーボードショートカット",
  "keyboardNav.close": "閉じる",
  "keyboardNav.scrollDown": "下にスクロール",
  "keyboardNav.scrollUp": "上にスクロール",
  "keyboardNav.jumpTop": "先頭に移動",
  "keyboardNav.jumpBottom": "末尾に移動",
  "keyboardNav.focusSearch": "ページの検索欄にフォーカス",
  "keyboardNav.toggleHelp": "このヘルプを切り替え",
  "keyboardNav.closeHelp": "このヘルプを閉じる",

  "theme.switchToLight": "ライトモードに切り替え",
  "theme.switchToDark": "ダークモードに切り替え",

  "page.config.title": "washy washy — 洗濯物一覧",
  "page.config.description":
    "読み込まれた設定のすべて: 洗濯機とアイロンの設定、そしてチャート内のすべての山を、ひとつの構造化された場所にまとめています。",
  "page.config.h1": "洗濯物一覧",

  "page.machine.title": "washy washy — 洗濯機とアイロンの設定",
  "page.machine.description":
    "洗濯機とアイロンの設定 — プログラム、温度、脱水、そしてアイロンのサーモスタット。",
  "page.machine.h1": "洗濯機とアイロンの設定",
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

  "common.pile": "Montón",
  "common.detergent": "Detergente",
  "common.notes": "Notas",
  "common.temp": "Temp.",
  "common.spinRpm": "Centrifugado (rpm)",
  "common.buttons": "Botones",
  "common.programme": "Programa",
  "common.source": "FUENTE",
  "common.doNotIron": "No planchar",
  "common.noSpin": "sin centrifugado",
  "common.softenerOk": "SUAVIZANTE OK",
  "common.noSoftener": "SIN SUAVIZANTE",
  "common.copied": "¡Copiado!",
  "common.remove": "Quitar",
  "common.name": "Nombre",
  "common.iron": "Plancha",
  "common.washingLoadsPageLink": "página de cargas de lavado",
  "common.clockwiseFrom": "{position} en sentido horario desde {off}",
  "common.insideSteamZone": "dentro de la zona de vapor",
  "common.belowSteamZone": "por debajo de la zona de vapor — solo planchado en seco",
  "common.couldNotUseFile": "No se pudo usar ese archivo: {error}",
  "common.couldNotSave": "No se pudo guardar: {error}",
  "common.downloadCurrentConfig": "Descargar la configuración actual",
  "common.uploadConfigJson": "Subir una configuración (JSON)",
  "common.saveChanges": "Guardar cambios",
  "common.showingOwnConfig": "Mostrando tu propia configuración.",
  "common.whatDoesThisDo": "¿Qué hace esto?",

  "sheetViewer.cutEverything": "Todo",
  "sheetViewer.cutWashOnly": "Solo lavado",
  "sheetViewer.cutIronOnly": "Solo planchado",
  "sheetViewer.filterChart": "Filtrar la tabla",
  "sheetViewer.cutLabel": "Vista",
  "sheetViewer.cutHelp": "Qué partes de la tabla mostrar: todo, solo lavado o solo planchado.",
  "sheetViewer.pileHelp":
    "Escribe parte del nombre de un montón, como «toallas», para mostrar solo esa tarjeta.",
  "sheetViewer.pileSearchPlaceholder": "Buscar por nombre de montón…",
  "sheetViewer.advanced": "Avanzado",
  "sheetViewer.programmeHelp": "Muestra solo los montones que usan este programa.",
  "sheetViewer.anyProgramme": "Cualquier programa",
  "sheetViewer.temperatureLabel": "Temperatura",
  "sheetViewer.temperatureHelp": "Muestra solo los montones lavados a esta temperatura.",
  "sheetViewer.anyTemperature": "Cualquier temperatura",
  "sheetViewer.spinLabel": "Centrifugado",
  "sheetViewer.spinHelp": "Muestra solo los montones centrifugados a esta velocidad.",
  "sheetViewer.anySpin": "Cualquier centrifugado",
  "sheetViewer.detergentHelp":
    "Escribe parte de una nota de detergente, como «en polvo», para mostrar solo los montones que la mencionen.",
  "sheetViewer.detergentSearchPlaceholder": "Buscar por detergente…",
  "sheetViewer.sharedConfigError":
    "No se pudo abrir la configuración compartida: {error}. Se muestra en su lugar lo que ya estaba activo.",
  "sheetViewer.showingBundledChart":
    "Mostrando la tabla de ejemplo incluida. Es una tabla de lavado genérica, no la tuya.",
  "sheetViewer.uploadEditPrefix": "Sube, descarga o edita la tuya en la",
  "sheetViewer.noPileMatchAdvanced":
    "Ningún montón coincide con «{query}» con esos filtros avanzados. Prueba a aflojar alguno.",
  "sheetViewer.noPileMatchQuery": "Ningún montón coincide con «{query}». Prueba otra búsqueda.",
  "sheetViewer.noPileMatchAdvancedOnly":
    "Ningún montón coincide con esos filtros avanzados. Prueba a aflojar alguno.",
  "sheetViewer.preparingPdf": "Preparando PDF…",
  "sheetViewer.downloadForPhone": "Descargar para el móvil",
  "sheetViewer.downloadToPrint": "Descargar para imprimir",
  "sheetViewer.shareThisView": "Compartir esta vista",
  "sheetViewer.couldNotShare": "No se pudo compartir esta vista: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "No se pudo generar el PDF para el móvil: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "No se pudo generar el PDF para imprimir: {error}",
  "sheetViewer.couldntRenderPhone": "No se pudo renderizar en el PDF para el móvil: {chars}",
  "sheetViewer.couldntRenderPrint": "No se pudo renderizar en el PDF para imprimir: {chars}",

  "sheet.subtitleFull": "Desplázate hasta el montón que tienes en la mano.",
  "sheet.subtitleWash": "Metiéndola en la lavadora. El planchado está en la otra hoja.",
  "sheet.subtitleIron": "En la tabla de planchar. El lavado está en la otra hoja.",
  "sheet.washingInstructions": "Instrucciones de lavado",
  "sheet.loadsHeading": "Cargas — una línea, un lavado",
  "sheet.loadsExplain":
    "Una insignia JUNTOS significa que todos los montones de esa línea comparten un lavado: mételos en la lavadora a la vez.",
  "sheet.together": "JUNTOS",
  "sheet.legendThermostatCaption": "termostato",
  "sheet.legendProgrammeCaption": "programa",
  "sheet.legendIronExplain":
    "El anillo es el termostato de la plancha tal como aparece en el dial, y la flecha roja indica hasta dónde girarlo. La banda azul es la zona donde genera vapor; un ajuste por debajo de ella es plancha en seco. Un anillo tachado significa que hay que dejar la plancha en el armario.",
  "sheet.legendWashExplain":
    "Los diales se dibujan tal como están en la máquina: las doce en punto son {off}, y la flecha roja indica hasta dónde girarlo. Las etiquetas muestran cada valor por el que pasa la pantalla, resaltando el que quieres.",
  "sheet.legendWashExplainFullSuffix":
    " En la plancha, la banda azul es la zona donde genera vapor.",
  "sheet.washHeading": "Lavado",
  "sheet.washTogetherWithLabel": "Lavar junto con",
  "sheet.washTogetherEachOther": "entre sí",
  "sheet.washTogetherEachOtherAnd": "entre sí y con {names}",
  "sheet.washSeparately": "mismos ajustes, pero lava esto por separado — consulta la matriz",
  "sheet.washAlone": "nada más — lava esto solo",
  "sheet.dryingLabel": "Secado",
  "sheet.pileCountOne": "{count} montón",
  "sheet.pileCountOther": "{count} montones",
  "sheet.thermostatOn": "Termostato en {label}",
  "sheet.leaveIronOff": "Deja la plancha apagada",
  "sheet.neverNearBoard": "nada de esta tarjeta se acerca nunca a la tabla de planchar",
  "sheet.howHeading": "Cómo",
  "sheet.neverTheseHeading": "Nunca estas",
  "sheet.durationsDisclaimer":
    "Las duraciones son estimaciones de la propia máquina y varían según la carga.",
  "sheet.copyLink": "Copiar enlace",
  "sheet.preparing": "Preparando…",
  "sheet.download": "Descargar",
  "sheet.couldNotCopyLink": "No se pudo copiar el enlace: {error}",
  "sheet.couldNotGeneratePdf": "No se pudo generar el PDF: {error}",
  "sheet.couldntRenderInPdf": "No se pudo renderizar en el PDF: {chars}",

  "config.editMachine": "Editar máquina →",
  "config.programmes": "Programas",
  "config.temperatures": "Temperaturas",
  "config.spinSpeeds": "Velocidades de centrifugado",
  "config.ironSettings": "Ajustes de la plancha",
  "config.durationInvalidHint": "Usa H:MM, como 2:30",
  "config.durationValidHint": "Formato: H:MM, como 2:30",
  "config.durationAriaLabel": "Duración",
  "config.showingBundledConfig":
    "Mostrando la configuración de ejemplo incluida. Es una tabla de lavado y una lavadora genéricas, no las tuyas.",
  "config.uploadEditHelp":
    "Sube, descarga o edita más abajo — los cambios se aplican a todo el sitio una vez guardados, y persisten en este navegador hasta que los borres.",
  "config.yourConfigHeading": "Tu configuración",
  "config.useBundledInstead": "Usar el ejemplo incluido en su lugar",
  "config.machineHeading": "Máquina",
  "config.chartHeading": "Tabla — todos los montones",
  "config.chartEditHelp":
    "Todos los campos son editables. Al guardar se comprueba cada fila contra la máquina de arriba, igual que al subir un archivo — un valor desconocido se señala por fila y columna, no se acepta en silencio.",
  "config.sortBy": "Ordenar por",
  "config.chartOrder": "Orden de la tabla",
  "config.ironedLabel": "PLANCHADO",
  "config.ironingNotesAriaLabel": "Notas de planchado",
  "config.colourGroupHeading": "Grupo de color",
  "config.mixTagsHeading": "Etiquetas de mezcla",

  "machine.moveUp": "Subir {value}",
  "machine.moveDown": "Bajar {value}",
  "machine.removeItem": "Quitar {value}",
  "machine.addButton": "+ Añadir",
  "machine.capacityLabel": "Capacidad",
  "machine.programmesHint": "En el orden del dial, empezando desde las doce en punto.",
  "machine.temperaturesLabel": "Temperaturas (°C)",
  "machine.addPlaceholderProgramme": "Añadir un programa…",
  "machine.addPlaceholderTemperature": "Añadir una temperatura…",
  "machine.addPlaceholderSpin": "Añadir un centrifugado…",
  "machine.addPlaceholderButton": "Añadir un botón…",
  "machine.addAriaProgramme": "Añadir a Programas",
  "machine.addAriaTemperature": "Añadir a Temperaturas (°C)",
  "machine.addAriaSpin": "Añadir a Velocidades de centrifugado",
  "machine.addAriaButton": "Añadir a Botones",
  "machine.settingsHeading": "Ajustes",
  "machine.settingColumnHeader": "Ajuste",
  "machine.dotsColumnHeader": "Puntos",
  "machine.detailColumnHeader": "Detalle",
  "machine.steamColumnHeader": "Vapor",
  "machine.settingLabelAria": "Etiqueta del ajuste {n}",
  "machine.settingDotsAria": "Puntos del ajuste {n}",
  "machine.settingDetailAria": "Detalle del ajuste {n}",
  "machine.settingSteamAria": "El ajuste {n} genera vapor",
  "machine.removeSettingAria": "Quitar el ajuste {n}",
  "machine.addSetting": "+ Añadir ajuste",
  "machine.newSettingDefaultLabel": "Nuevo ajuste",
  "machine.showingOwnMachine": "Mostrando tu propia máquina.",
  "machine.showingBundledMachine":
    "Mostrando la máquina de ejemplo incluida. Es una lavadora y plancha genéricas, no las tuyas.",
  "machine.changesApplyPrefix":
    "Los cambios se aplican a todo el sitio una vez guardados — es la misma configuración que la",
  "machine.changesApplySuffix": " lee.",
  "machine.useBundledMachineInstead": "Usar la máquina incluida en su lugar",
  "machine.washerHeading": "Lavadora",

  "upload.uploadConfig": "Subir configuración",

  "keyboardNav.title": "Atajos de teclado",
  "keyboardNav.close": "Cerrar",
  "keyboardNav.scrollDown": "Bajar",
  "keyboardNav.scrollUp": "Subir",
  "keyboardNav.jumpTop": "Ir arriba del todo",
  "keyboardNav.jumpBottom": "Ir abajo del todo",
  "keyboardNav.focusSearch": "Enfocar el campo de búsqueda de la página",
  "keyboardNav.toggleHelp": "Alternar esta ayuda",
  "keyboardNav.closeHelp": "Cerrar esta ayuda",

  "theme.switchToLight": "Cambiar a modo claro",
  "theme.switchToDark": "Cambiar a modo oscuro",

  "page.config.title": "Washy washy — cargas de lavado",
  "page.config.description":
    "La configuración completa cargada: los ajustes de la lavadora y la plancha, y todos los montones de la tabla, en un solo lugar estructurado.",
  "page.config.h1": "Cargas de lavado",

  "page.machine.title": "Washy washy — ajustes de lavadora y plancha",
  "page.machine.description":
    "Los ajustes de la lavadora y la plancha — programas, temperaturas, centrifugados y el termostato de la plancha.",
  "page.machine.h1": "Ajustes de lavadora y plancha",
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

  "common.pile": "Stapel",
  "common.detergent": "Waschmittel",
  "common.notes": "Notizen",
  "common.temp": "Temp.",
  "common.spinRpm": "Schleudern (U/min)",
  "common.buttons": "Tasten",
  "common.programme": "Programm",
  "common.source": "QUELLE",
  "common.doNotIron": "Nicht bügeln",
  "common.noSpin": "ohne Schleudern",
  "common.softenerOk": "WEICHSPÜLER OK",
  "common.noSoftener": "KEIN WEICHSPÜLER",
  "common.copied": "Kopiert!",
  "common.remove": "Entfernen",
  "common.name": "Name",
  "common.iron": "Bügeln",
  "common.washingLoadsPageLink": "Waschladungen-Seite",
  "common.clockwiseFrom": "{position} im Uhrzeigersinn von {off}",
  "common.insideSteamZone": "innerhalb der Dampfzone",
  "common.belowSteamZone": "unterhalb der Dampfzone – nur Trockenbügeln",
  "common.couldNotUseFile": "Diese Datei konnte nicht verwendet werden: {error}",
  "common.couldNotSave": "Konnte nicht gespeichert werden: {error}",
  "common.downloadCurrentConfig": "Aktuelle Konfiguration herunterladen",
  "common.uploadConfigJson": "Konfiguration hochladen (JSON)",
  "common.saveChanges": "Änderungen speichern",
  "common.showingOwnConfig": "Zeigt deine eigene Konfiguration.",
  "common.whatDoesThisDo": "Was macht das?",

  "sheetViewer.cutEverything": "Alles",
  "sheetViewer.cutWashOnly": "Nur Waschen",
  "sheetViewer.cutIronOnly": "Nur Bügeln",
  "sheetViewer.filterChart": "Tabelle filtern",
  "sheetViewer.cutLabel": "Ausschnitt",
  "sheetViewer.cutHelp":
    "Welche Teile der Tabelle angezeigt werden: alles, nur Waschen oder nur Bügeln.",
  "sheetViewer.pileHelp":
    "Gib einen Teil des Namens eines Stapels ein, z. B. „Handtücher“, um nur diese Karte anzuzeigen.",
  "sheetViewer.pileSearchPlaceholder": "Nach Stapelname suchen…",
  "sheetViewer.advanced": "Erweitert",
  "sheetViewer.programmeHelp": "Nur Stapel anzeigen, die dieses Programm verwenden.",
  "sheetViewer.anyProgramme": "Beliebiges Programm",
  "sheetViewer.temperatureLabel": "Temperatur",
  "sheetViewer.temperatureHelp": "Nur Stapel anzeigen, die bei dieser Temperatur gewaschen werden.",
  "sheetViewer.anyTemperature": "Beliebige Temperatur",
  "sheetViewer.spinLabel": "Schleudern",
  "sheetViewer.spinHelp": "Nur Stapel anzeigen, die mit dieser Drehzahl geschleudert werden.",
  "sheetViewer.anySpin": "Beliebige Schleuderzahl",
  "sheetViewer.detergentHelp":
    "Gib einen Teil eines Waschmittelhinweises ein, z. B. „Pulver“, um nur Stapel anzuzeigen, die ihn erwähnen.",
  "sheetViewer.detergentSearchPlaceholder": "Nach Waschmittel suchen…",
  "sheetViewer.sharedConfigError":
    "Die geteilte Konfiguration konnte nicht geöffnet werden: {error}. Es wird stattdessen die zuvor aktive Konfiguration angezeigt.",
  "sheetViewer.showingBundledChart":
    "Zeigt die mitgelieferte Beispieltabelle. Das ist eine allgemeine Wäschetabelle, nicht deine eigene.",
  "sheetViewer.uploadEditPrefix":
    "Lade deine eigene hoch oder herunter, oder bearbeite sie auf der",
  "sheetViewer.noPileMatchAdvanced":
    "Kein Stapel passt mit diesen erweiterten Filtern zu „{query}“. Versuch, einen davon zu lockern.",
  "sheetViewer.noPileMatchQuery": "Kein Stapel passt zu „{query}“. Versuch eine andere Suche.",
  "sheetViewer.noPileMatchAdvancedOnly":
    "Kein Stapel passt zu diesen erweiterten Filtern. Versuch, einen davon zu lockern.",
  "sheetViewer.preparingPdf": "PDF wird vorbereitet…",
  "sheetViewer.downloadForPhone": "Für Handy herunterladen",
  "sheetViewer.downloadToPrint": "Zum Drucken herunterladen",
  "sheetViewer.shareThisView": "Diese Ansicht teilen",
  "sheetViewer.couldNotShare": "Diese Ansicht konnte nicht geteilt werden: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "Das Handy-PDF konnte nicht erstellt werden: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "Das Druck-PDF konnte nicht erstellt werden: {error}",
  "sheetViewer.couldntRenderPhone": "Im Handy-PDF konnte nicht dargestellt werden: {chars}",
  "sheetViewer.couldntRenderPrint": "Im Druck-PDF konnte nicht dargestellt werden: {chars}",

  "sheet.subtitleFull": "Scroll zu dem Stapel, den du in der Hand hältst.",
  "sheet.subtitleWash": "Es geht in die Maschine. Bügeln steht auf dem anderen Blatt.",
  "sheet.subtitleIron": "Am Bügelbrett. Waschen steht auf dem anderen Blatt.",
  "sheet.washingInstructions": "Waschanleitung",
  "sheet.loadsHeading": "Ladungen – eine Zeile, eine Wäsche",
  "sheet.loadsExplain":
    "Ein ZUSAMMEN-Badge bedeutet, dass sich alle Stapel dieser Zeile eine Wäsche teilen – gib sie auf einmal in die Maschine.",
  "sheet.together": "ZUSAMMEN",
  "sheet.legendThermostatCaption": "Thermostat",
  "sheet.legendProgrammeCaption": "Programm",
  "sheet.legendIronExplain":
    "Der Ring zeigt das Thermostat des Bügeleisens, wie es am Regler sitzt, und der rote Zeiger zeigt, wohin du es drehst. Das blaue Band ist die Zone, in der Dampf entsteht; eine Einstellung darunter ist Trockenbügeln. Ein durchgestrichener Ring bedeutet: Bügeleisen im Schrank lassen.",
  "sheet.legendWashExplain":
    "Die Regler sind so dargestellt, wie sie an der Maschine sitzen: zwölf Uhr ist {off}, und der rote Zeiger zeigt, wohin du drehst. Chips zeigen jeden Wert, den das Display durchläuft, gefüllt bei dem, den du willst.",
  "sheet.legendWashExplainFullSuffix":
    " Beim Bügeleisen ist das blaue Band die Zone, in der Dampf entsteht.",
  "sheet.washHeading": "Waschen",
  "sheet.washTogetherWithLabel": "Zusammen waschen mit",
  "sheet.washTogetherEachOther": "einander",
  "sheet.washTogetherEachOtherAnd": "einander und {names}",
  "sheet.washSeparately": "gleiche Einstellungen, aber diese getrennt waschen – siehe Matrix",
  "sheet.washAlone": "nichts anderes – allein waschen",
  "sheet.dryingLabel": "Trocknen",
  "sheet.pileCountOne": "{count} Stapel",
  "sheet.pileCountOther": "{count} Stapel",
  "sheet.thermostatOn": "Thermostat auf {label}",
  "sheet.leaveIronOff": "Bügeleisen ausgeschaltet lassen",
  "sheet.neverNearBoard": "nichts auf dieser Karte kommt je ans Bügelbrett",
  "sheet.howHeading": "Wie",
  "sheet.neverTheseHeading": "Niemals diese",
  "sheet.durationsDisclaimer":
    "Die Dauern sind Schätzungen der Maschine und variieren je nach Beladung.",
  "sheet.copyLink": "Link kopieren",
  "sheet.preparing": "Wird vorbereitet…",
  "sheet.download": "Herunterladen",
  "sheet.couldNotCopyLink": "Der Link konnte nicht kopiert werden: {error}",
  "sheet.couldNotGeneratePdf": "Das PDF konnte nicht erstellt werden: {error}",
  "sheet.couldntRenderInPdf": "Im PDF konnte nicht dargestellt werden: {chars}",

  "config.editMachine": "Maschine bearbeiten →",
  "config.programmes": "Programme",
  "config.temperatures": "Temperaturen",
  "config.spinSpeeds": "Schleuderzahlen",
  "config.ironSettings": "Bügeleinstellungen",
  "config.durationInvalidHint": "Verwende das Format H:MM, z. B. 2:30",
  "config.durationValidHint": "Format: H:MM, z. B. 2:30",
  "config.durationAriaLabel": "Dauer",
  "config.showingBundledConfig":
    "Zeigt die mitgelieferte Beispielkonfiguration. Das sind eine allgemeine Wäschetabelle und Waschmaschine, nicht deine eigenen.",
  "config.uploadEditHelp":
    "Lade unten hoch, herunter oder bearbeite – Änderungen gelten nach dem Speichern für die ganze Seite und bleiben in diesem Browser erhalten, bis du sie löschst.",
  "config.yourConfigHeading": "Deine Konfiguration",
  "config.useBundledInstead": "Stattdessen das mitgelieferte Beispiel verwenden",
  "config.machineHeading": "Maschine",
  "config.chartHeading": "Tabelle – jeder Stapel",
  "config.chartEditHelp":
    "Jedes Feld ist bearbeitbar. Beim Speichern wird jede Zeile gegen die Maschine oben geprüft, genau wie bei einem Upload – ein unbekannter Wert wird nach Zeile und Spalte benannt, nicht stillschweigend akzeptiert.",
  "config.sortBy": "Sortieren nach",
  "config.chartOrder": "Tabellenreihenfolge",
  "config.ironedLabel": "GEBÜGELT",
  "config.ironingNotesAriaLabel": "Bügelhinweise",
  "config.colourGroupHeading": "Farbgruppe",
  "config.mixTagsHeading": "Misch-Tags",

  "machine.moveUp": "{value} nach oben verschieben",
  "machine.moveDown": "{value} nach unten verschieben",
  "machine.removeItem": "{value} entfernen",
  "machine.addButton": "+ Hinzufügen",
  "machine.capacityLabel": "Kapazität",
  "machine.programmesHint": "In Reglerreihenfolge, beginnend bei zwölf Uhr.",
  "machine.temperaturesLabel": "Temperaturen (°C)",
  "machine.addPlaceholderProgramme": "Programm hinzufügen…",
  "machine.addPlaceholderTemperature": "Temperatur hinzufügen…",
  "machine.addPlaceholderSpin": "Schleuderzahl hinzufügen…",
  "machine.addPlaceholderButton": "Taste hinzufügen…",
  "machine.addAriaProgramme": "Zu Programme hinzufügen",
  "machine.addAriaTemperature": "Zu Temperaturen (°C) hinzufügen",
  "machine.addAriaSpin": "Zu Schleuderzahlen hinzufügen",
  "machine.addAriaButton": "Zu Tasten hinzufügen",
  "machine.settingsHeading": "Einstellungen",
  "machine.settingColumnHeader": "Einstellung",
  "machine.dotsColumnHeader": "Punkte",
  "machine.detailColumnHeader": "Detail",
  "machine.steamColumnHeader": "Dampf",
  "machine.settingLabelAria": "Bezeichnung von Einstellung {n}",
  "machine.settingDotsAria": "Punkte von Einstellung {n}",
  "machine.settingDetailAria": "Detail von Einstellung {n}",
  "machine.settingSteamAria": "Einstellung {n} erzeugt Dampf",
  "machine.removeSettingAria": "Einstellung {n} entfernen",
  "machine.addSetting": "+ Einstellung hinzufügen",
  "machine.newSettingDefaultLabel": "Neue Einstellung",
  "machine.showingOwnMachine": "Zeigt deine eigene Maschine.",
  "machine.showingBundledMachine":
    "Zeigt die mitgelieferte Beispielmaschine. Das sind eine allgemeine Waschmaschine und ein Bügeleisen, nicht deine eigenen.",
  "machine.changesApplyPrefix":
    "Änderungen gelten nach dem Speichern für die ganze Seite – dieselbe Konfiguration, wie sie die",
  "machine.changesApplySuffix": " liest.",
  "machine.useBundledMachineInstead": "Stattdessen die mitgelieferte Maschine verwenden",
  "machine.washerHeading": "Waschmaschine",

  "upload.uploadConfig": "Konfiguration hochladen",

  "keyboardNav.title": "Tastaturkürzel",
  "keyboardNav.close": "Schließen",
  "keyboardNav.scrollDown": "Nach unten scrollen",
  "keyboardNav.scrollUp": "Nach oben scrollen",
  "keyboardNav.jumpTop": "Zum Anfang springen",
  "keyboardNav.jumpBottom": "Zum Ende springen",
  "keyboardNav.focusSearch": "Suchfeld der Seite fokussieren",
  "keyboardNav.toggleHelp": "Diese Hilfe ein-/ausblenden",
  "keyboardNav.closeHelp": "Diese Hilfe schließen",

  "theme.switchToLight": "Zum hellen Modus wechseln",
  "theme.switchToDark": "Zum dunklen Modus wechseln",

  "page.config.title": "Washy washy — Waschladungen",
  "page.config.description":
    "Die vollständig geladene Konfiguration: die Einstellungen von Waschmaschine und Bügeleisen sowie jeder Stapel der Tabelle, an einem strukturierten Ort.",
  "page.config.h1": "Waschladungen",

  "page.machine.title": "Washy washy — Einstellungen für Waschmaschine & Bügeleisen",
  "page.machine.description":
    "Die Einstellungen von Waschmaschine und Bügeleisen – Programme, Temperaturen, Schleuderzahlen und das Thermostat des Bügeleisens.",
  "page.machine.h1": "Einstellungen für Waschmaschine & Bügeleisen",
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

  "common.pile": "Pile",
  "common.detergent": "Lessive",
  "common.notes": "Notes",
  "common.temp": "Temp.",
  "common.spinRpm": "Essorage (tr/min)",
  "common.buttons": "Boutons",
  "common.programme": "Programme",
  "common.source": "SOURCE",
  "common.doNotIron": "Ne pas repasser",
  "common.noSpin": "sans essorage",
  "common.softenerOk": "ADOUCISSANT OK",
  "common.noSoftener": "SANS ADOUCISSANT",
  "common.copied": "Copié !",
  "common.remove": "Supprimer",
  "common.name": "Nom",
  "common.iron": "Fer",
  "common.washingLoadsPageLink": "page des charges de lavage",
  "common.clockwiseFrom": "{position} dans le sens horaire depuis {off}",
  "common.insideSteamZone": "dans la zone vapeur",
  "common.belowSteamZone": "en dessous de la zone vapeur — repassage à sec uniquement",
  "common.couldNotUseFile": "Impossible d'utiliser ce fichier : {error}",
  "common.couldNotSave": "Impossible d'enregistrer : {error}",
  "common.downloadCurrentConfig": "Télécharger la config actuelle",
  "common.uploadConfigJson": "Importer une config (JSON)",
  "common.saveChanges": "Enregistrer les modifications",
  "common.showingOwnConfig": "Affiche ta propre config.",
  "common.whatDoesThisDo": "À quoi ça sert ?",

  "sheetViewer.cutEverything": "Tout",
  "sheetViewer.cutWashOnly": "Lavage uniquement",
  "sheetViewer.cutIronOnly": "Repassage uniquement",
  "sheetViewer.filterChart": "Filtrer le tableau",
  "sheetViewer.cutLabel": "Vue",
  "sheetViewer.cutHelp":
    "Quelles parties du tableau afficher : tout, le lavage uniquement, ou le repassage uniquement.",
  "sheetViewer.pileHelp":
    "Tape une partie du nom d'une pile, comme « serviettes », pour n'afficher que cette carte.",
  "sheetViewer.pileSearchPlaceholder": "Rechercher par nom de pile…",
  "sheetViewer.advanced": "Avancé",
  "sheetViewer.programmeHelp": "N'afficher que les piles utilisant ce programme.",
  "sheetViewer.anyProgramme": "Tous les programmes",
  "sheetViewer.temperatureLabel": "Température",
  "sheetViewer.temperatureHelp": "N'afficher que les piles lavées à cette température.",
  "sheetViewer.anyTemperature": "Toutes les températures",
  "sheetViewer.spinLabel": "Essorage",
  "sheetViewer.spinHelp": "N'afficher que les piles essorées à cette vitesse.",
  "sheetViewer.anySpin": "Tous les essorages",
  "sheetViewer.detergentHelp":
    "Tape une partie d'une note de lessive, comme « poudre », pour n'afficher que les piles qui la mentionnent.",
  "sheetViewer.detergentSearchPlaceholder": "Rechercher par lessive…",
  "sheetViewer.sharedConfigError":
    "Impossible d'ouvrir la config partagée : {error}. Affiche ce qui était déjà actif à la place.",
  "sheetViewer.showingBundledChart":
    "Affiche le tableau d'exemple fourni. C'est un tableau de lavage générique, pas le tien.",
  "sheetViewer.uploadEditPrefix": "Importe, télécharge ou modifie la tienne sur la",
  "sheetViewer.noPileMatchAdvanced":
    "Aucune pile ne correspond à « {query} » avec ces filtres avancés. Essaie d'en assouplir un.",
  "sheetViewer.noPileMatchQuery":
    "Aucune pile ne correspond à « {query} ». Essaie une autre recherche.",
  "sheetViewer.noPileMatchAdvancedOnly":
    "Aucune pile ne correspond à ces filtres avancés. Essaie d'en assouplir un.",
  "sheetViewer.preparingPdf": "Préparation du PDF…",
  "sheetViewer.downloadForPhone": "Télécharger pour téléphone",
  "sheetViewer.downloadToPrint": "Télécharger pour impression",
  "sheetViewer.shareThisView": "Partager cette vue",
  "sheetViewer.couldNotShare": "Impossible de partager cette vue : {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "Impossible de générer le PDF téléphone : {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "Impossible de générer le PDF d'impression : {error}",
  "sheetViewer.couldntRenderPhone": "Impossible d'afficher dans le PDF téléphone : {chars}",
  "sheetViewer.couldntRenderPrint": "Impossible d'afficher dans le PDF d'impression : {chars}",

  "sheet.subtitleFull": "Fais défiler jusqu'à la pile que tu as en main.",
  "sheet.subtitleWash": "Pour la mettre dans la machine. Le repassage est sur l'autre fiche.",
  "sheet.subtitleIron": "À la planche à repasser. Le lavage est sur l'autre fiche.",
  "sheet.washingInstructions": "Instructions de lavage",
  "sheet.loadsHeading": "Charges — une ligne, un lavage",
  "sheet.loadsExplain":
    "Un badge ENSEMBLE signifie que toutes les piles de cette ligne partagent un même lavage — mets-les dans la machine en même temps.",
  "sheet.together": "ENSEMBLE",
  "sheet.legendThermostatCaption": "thermostat",
  "sheet.legendProgrammeCaption": "programme",
  "sheet.legendIronExplain":
    "L'anneau représente le thermostat du fer tel qu'il apparaît sur le cadran, et le repère rouge indique où le régler. La bande bleue est la zone où il produit de la vapeur ; un réglage en dessous correspond à un repassage à sec. Un anneau barré signifie qu'il faut laisser le fer au placard.",
  "sheet.legendWashExplain":
    "Les cadrans sont dessinés tels qu'ils apparaissent sur la machine : midi correspond à {off}, et le repère rouge indique où le régler. Les puces montrent toutes les valeurs que l'affichage parcourt, celle que tu veux étant remplie.",
  "sheet.legendWashExplainFullSuffix":
    " Sur le fer, la bande bleue est la zone où il produit de la vapeur.",
  "sheet.washHeading": "Lavage",
  "sheet.washTogetherWithLabel": "Laver avec",
  "sheet.washTogetherEachOther": "entre elles",
  "sheet.washTogetherEachOtherAnd": "entre elles, et {names}",
  "sheet.washSeparately": "mêmes réglages, mais à laver séparément — voir la matrice",
  "sheet.washAlone": "rien d'autre — à laver seule",
  "sheet.dryingLabel": "Séchage",
  "sheet.pileCountOne": "{count} pile",
  "sheet.pileCountOther": "{count} piles",
  "sheet.thermostatOn": "Thermostat sur {label}",
  "sheet.leaveIronOff": "Laisse le fer éteint",
  "sheet.neverNearBoard": "rien sur cette carte ne s'approche jamais de la planche à repasser",
  "sheet.howHeading": "Comment",
  "sheet.neverTheseHeading": "Jamais avec",
  "sheet.durationsDisclaimer":
    "Les durées sont des estimations de la machine et varient selon la charge.",
  "sheet.copyLink": "Copier le lien",
  "sheet.preparing": "Préparation…",
  "sheet.download": "Télécharger",
  "sheet.couldNotCopyLink": "Impossible de copier le lien : {error}",
  "sheet.couldNotGeneratePdf": "Impossible de générer le PDF : {error}",
  "sheet.couldntRenderInPdf": "Impossible d'afficher dans le PDF : {chars}",

  "config.editMachine": "Modifier la machine →",
  "config.programmes": "Programmes",
  "config.temperatures": "Températures",
  "config.spinSpeeds": "Vitesses d'essorage",
  "config.ironSettings": "Réglages du fer",
  "config.durationInvalidHint": "Utilise H:MM, comme 2:30",
  "config.durationValidHint": "Format : H:MM, comme 2:30",
  "config.durationAriaLabel": "Durée",
  "config.showingBundledConfig":
    "Affiche la config d'exemple fournie. C'est un tableau de lavage et un lave-linge génériques, pas les tiens.",
  "config.uploadEditHelp":
    "Importe, télécharge ou modifie ci-dessous — les changements s'appliquent à tout le site une fois enregistrés, et persistent dans ce navigateur jusqu'à ce que tu les effaces.",
  "config.yourConfigHeading": "Ta config",
  "config.useBundledInstead": "Utiliser l'exemple fourni à la place",
  "config.machineHeading": "Machine",
  "config.chartHeading": "Tableau — toutes les piles",
  "config.chartEditHelp":
    "Chaque champ est modifiable. L'enregistrement vérifie chaque ligne par rapport à la machine ci-dessus, comme le ferait un import — une valeur inconnue est signalée par ligne et colonne, jamais acceptée en silence.",
  "config.sortBy": "Trier par",
  "config.chartOrder": "Ordre du tableau",
  "config.ironedLabel": "REPASSÉ",
  "config.ironingNotesAriaLabel": "Notes de repassage",
  "config.colourGroupHeading": "Groupe de couleurs",
  "config.mixTagsHeading": "Étiquettes de mélange",

  "machine.moveUp": "Déplacer {value} vers le haut",
  "machine.moveDown": "Déplacer {value} vers le bas",
  "machine.removeItem": "Supprimer {value}",
  "machine.addButton": "+ Ajouter",
  "machine.capacityLabel": "Capacité",
  "machine.programmesHint": "Dans l'ordre du cadran, en partant de midi.",
  "machine.temperaturesLabel": "Températures (°C)",
  "machine.addPlaceholderProgramme": "Ajouter un programme…",
  "machine.addPlaceholderTemperature": "Ajouter une température…",
  "machine.addPlaceholderSpin": "Ajouter un essorage…",
  "machine.addPlaceholderButton": "Ajouter un bouton…",
  "machine.addAriaProgramme": "Ajouter aux programmes",
  "machine.addAriaTemperature": "Ajouter aux températures (°C)",
  "machine.addAriaSpin": "Ajouter aux vitesses d'essorage",
  "machine.addAriaButton": "Ajouter aux boutons",
  "machine.settingsHeading": "Réglages",
  "machine.settingColumnHeader": "Réglage",
  "machine.dotsColumnHeader": "Points",
  "machine.detailColumnHeader": "Détail",
  "machine.steamColumnHeader": "Vapeur",
  "machine.settingLabelAria": "Libellé du réglage {n}",
  "machine.settingDotsAria": "Points du réglage {n}",
  "machine.settingDetailAria": "Détail du réglage {n}",
  "machine.settingSteamAria": "Le réglage {n} produit de la vapeur",
  "machine.removeSettingAria": "Supprimer le réglage {n}",
  "machine.addSetting": "+ Ajouter un réglage",
  "machine.newSettingDefaultLabel": "Nouveau réglage",
  "machine.showingOwnMachine": "Affiche ta propre machine.",
  "machine.showingBundledMachine":
    "Affiche la machine d'exemple fournie. C'est un lave-linge et un fer génériques, pas les tiens.",
  "machine.changesApplyPrefix":
    "Les changements s'appliquent à tout le site une fois enregistrés — la même config que la",
  "machine.changesApplySuffix": " lit.",
  "machine.useBundledMachineInstead": "Utiliser la machine fournie à la place",
  "machine.washerHeading": "Lave-linge",

  "upload.uploadConfig": "Importer une config",

  "keyboardNav.title": "Raccourcis clavier",
  "keyboardNav.close": "Fermer",
  "keyboardNav.scrollDown": "Défiler vers le bas",
  "keyboardNav.scrollUp": "Défiler vers le haut",
  "keyboardNav.jumpTop": "Aller tout en haut",
  "keyboardNav.jumpBottom": "Aller tout en bas",
  "keyboardNav.focusSearch": "Donner le focus au champ de recherche de la page",
  "keyboardNav.toggleHelp": "Afficher ou masquer cette aide",
  "keyboardNav.closeHelp": "Fermer cette aide",

  "theme.switchToLight": "Passer en mode clair",
  "theme.switchToDark": "Passer en mode sombre",

  "page.config.title": "Washy washy — charges de lavage",
  "page.config.description":
    "La config complète chargée : les réglages du lave-linge et du fer, et toutes les piles du tableau, au même endroit, de façon structurée.",
  "page.config.h1": "Charges de lavage",

  "page.machine.title": "Washy washy — réglages du lave-linge et du fer",
  "page.machine.description":
    "Les réglages du lave-linge et du fer — programmes, températures, essorages, et le thermostat du fer.",
  "page.machine.h1": "Réglages du lave-linge et du fer",
};
const ar: Ui = {
  "skip.toContent": "تخطي إلى المحتوى",
  "ribbon.forkMe": "انسخ المشروع (Fork) على GitHub",
  "nav.home": "الرئيسية",
  "nav.washingLoads": "أحمال الغسيل",
  "nav.washerIron": "الغسالة والمكواة",
  "nav.docs": "الوثائق",
  "switcher.label": "اللغة",
  "footer.github": "Washy washy على GitHub",
  "footer.disclaimer": "إخلاء المسؤولية",
  "footer.privacy": "سياسة الخصوصية",
  "footer.copyrightBefore": "© 2026 رايان كيس. مرخّص بموجب ",
  "footer.copyrightAfter":
    " — يُقدَّم كما هو، دون أي ضمان من أي نوع (انظر الرخصة، البندين 15–16). تحقّق دائمًا من بطاقة العناية الخاصة بالقطعة؛ يعكس هذا الجدول إعدادات أسرة واحدة، لا ضمانًا من شركة مصنِّعة.",
  "home.title": "Washy washy",
  "home.description":
    "جدول غسيل ملائم للهاتف: البرنامج ودرجة الحرارة والعصر لكل كومة، وما يمكن جمعه في أسطوانة واحدة، وموضع منظم حرارة المكواة.",
  "home.h1": "جدول الغسيل الخاص بك",
  "home.intro":
    'يحوّل جدول الغسيل إلى صفحة ملائمة للهاتف: أي برنامج ودرجة حرارة وعصر لكل كومة، وما يمكن جمعه في أسطوانة واحدة، وموضع منظم حرارة المكواة. أضف هذه الصفحة إلى الشاشة الرئيسية لهاتفك — يحتوي كل من قائمة المشاركة في Safari وقائمة *⋮* في Chrome على خيار "إضافة إلى الشاشة الرئيسية" — فتُفتح حينها كتطبيق، بلا شريط عنوان، بجانب الغسالة مباشرة.',
  "disclaimer.title": "Washy washy — إخلاء المسؤولية",
  "disclaimer.description":
    "هذا الجدول غير رسمي وتديره جهة مجتمعية، ويعكس إعدادات أسرة واحدة — لا ضمانًا من شركة مصنِّعة.",
  "disclaimer.h1": "إخلاء المسؤولية",
  "disclaimer.p1":
    "Washy washy مشروع غير رسمي تديره جهة مجتمعية. وهو غير تابع لأي شركة مصنِّعة للغسالات أو الأجهزة المنزلية، ولا معتمَد منها، ولا مُنتَج بالتعاون معها.",
  "disclaimer.p2":
    "يعكس الجدول المرفق إعدادات غسيل وكيّ خاصة بأسرة واحدة — مجموعة خيارات نجحت مع غسالة واحدة ومكواة واحدة وملابس شخص واحد. وهو ليس ضمانًا من شركة مصنِّعة، ولا معيار وسم عناية، ولا نصيحة مهنية. تتفاوت الأحمال والأقمشة والغسالات، وقد يُتلف إعداد آمن على غسالة ما غسالةً أخرى.",
  "disclaimer.p3":
    "تبقى بطاقة العناية الخاصة بالقطعة نفسها هي المرجع الأول على أي شيء يظهر هنا. وعند الاختلاف بينهما، اتّبع البطاقة.",
  "disclaimer.p4":
    'كما هو منصوص عليه في رخصة المشروع (GPL-3.0-or-later، البندان 15–16): يُقدَّم البرنامج "كما هو"، دون أي ضمان من أي نوع، صريحًا كان أو ضمنيًا. لا يتحمّل القائمون على صيانة Washy washy أي مسؤولية عن أي ضرر — بالملابس أو الأجهزة أو غير ذلك — ناتج عن استخدامه.',
  "privacy.title": "Washy washy — سياسة الخصوصية",
  "privacy.h1": "سياسة الخصوصية",
  "privacy.descriptionUmami":
    "لا حساب ولا ملفات تعريف ارتباط. تحليلات لعدد مشاهدات الصفحات عبر Umami، أداة تحترم الخصوصية ولا تجمع أي شيء يعرّف بك. يبقى أي إعداد مرفوع أو تعديل على الجدول في متصفحك أنت، ولا يُرسَل إلى أي مكان.",
  "privacy.descriptionNoUmami":
    "لا حساب ولا ملفات تعريف ارتباط ولا تحليلات ولا تتبّع. يبقى أي إعداد مرفوع أو تعديل على الجدول في متصفحك أنت، ولا يُرسَل إلى أي مكان.",
  "privacy.pUmami":
    "ليس لدى Washy washy حساب ولا يضع أي ملفات تعريف ارتباط. لكنه يستخدم [Umami](https://umami.is/)، أداة تحليلات تحترم الخصوصية، لمعرفة كيفية استخدام الموقع — أي الصفحات، وكم عدد الزيارات. لا يستخدم Umami ملفات تعريف الارتباط، ولا يتتبّعك عبر مواقع أخرى، ولا يجمع أي شيء يعرّف بك شخصيًا.",
  "privacy.pNoUmami":
    "ليس لدى Washy washy حساب ولا ملفات تعريف ارتباط ولا تحليلات ولا أي نوع من نصوص التتبّع. لا شيء هنا يراقب ما تفعله في الموقع.",
  "privacy.pStorage":
    "رفع إعدادك الخاص، أو تعديل الجدول أو إعدادات الغسالة، يحفظ تلك البيانات فقط في مساحة التخزين الخاصة بمتصفحك (`localStorage`). فهي لا تغادر جهازك أبدًا — لا إلى خادم، ولا إلينا، ولا إلى أي أحد. مسح بيانات موقع Washy washy من متصفحك يزيلها بالكامل.",
  "privacy.pHosting":
    "الموقع نفسه ثابت — ملفات عادية بلا خادم خلفي — تستضيفه [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/). وكما هو الحال مع أي مضيف ويب، ترى بنية Cloudflare التحتية البيانات الوصفية الاعتيادية لطلبات HTTP اللازمة لعرض الصفحة — عنوان IP الخاص بك، والمتصفح، والصفحة المطلوبة — تمامًا كما في أي موقع تزوره. أما Washy washy نفسه فلا يملك أي وصول إلى ذلك، ولا يطلبه من Cloudflare أو من أي جهة أخرى.",
  "banner.message":
    "ترجم الذكاء الاصطناعي هذه الصفحة إلى العربية — إن صادفت ترجمة غريبة فالذنب ذنب سكاي نت لا المطوّر.",
  "banner.dismiss": "إغلاق",
  "common.pile": "كومة",
  "common.detergent": "المنظف",
  "common.notes": "ملاحظات",
  "common.temp": "الحرارة",
  "common.spinRpm": "العصر (دورة/دقيقة)",
  "common.buttons": "الأزرار",
  "common.programme": "البرنامج",
  "common.source": "المصدر",
  "common.doNotIron": "لا تكوي",
  "common.noSpin": "بلا عصر",
  "common.softenerOk": "المنعّم مسموح",
  "common.noSoftener": "بلا منعّم",
  "common.copied": "تم النسخ!",
  "common.remove": "إزالة",
  "common.name": "الاسم",
  "common.iron": "المكواة",
  "common.washingLoadsPageLink": "صفحة أحمال الغسيل",
  "common.clockwiseFrom": "{position} في اتجاه عقارب الساعة من {off}",
  "common.insideSteamZone": "داخل منطقة البخار",
  "common.belowSteamZone": "أسفل منطقة البخار — كي جاف فقط",
  "common.couldNotUseFile": "تعذّر استخدام هذا الملف: {error}",
  "common.couldNotSave": "تعذّر الحفظ: {error}",
  "common.downloadCurrentConfig": "تنزيل الإعداد الحالي",
  "common.uploadConfigJson": "رفع إعداد (JSON)",
  "common.saveChanges": "حفظ التغييرات",
  "common.showingOwnConfig": "يُعرض إعدادك الخاص.",
  "common.whatDoesThisDo": "ما وظيفة هذا؟",
  "sheetViewer.cutEverything": "الكل",
  "sheetViewer.cutWashOnly": "الغسيل فقط",
  "sheetViewer.cutIronOnly": "الكي فقط",
  "sheetViewer.filterChart": "تصفية الجدول",
  "sheetViewer.cutLabel": "القسم",
  "sheetViewer.cutHelp": "أي أجزاء الجدول تُعرض: الكل، أو الغسيل فقط، أو الكي فقط.",
  "sheetViewer.pileHelp": 'اكتب جزءًا من اسم الكومة، مثل "مناشف"، لعرض تلك البطاقة فقط.',
  "sheetViewer.pileSearchPlaceholder": "ابحث باسم الكومة…",
  "sheetViewer.advanced": "متقدّم",
  "sheetViewer.programmeHelp": "عرض الكومات التي تستخدم هذا البرنامج فقط.",
  "sheetViewer.anyProgramme": "أي برنامج",
  "sheetViewer.temperatureLabel": "درجة الحرارة",
  "sheetViewer.temperatureHelp": "عرض الكومات المغسولة بهذه الدرجة فقط.",
  "sheetViewer.anyTemperature": "أي درجة حرارة",
  "sheetViewer.spinLabel": "العصر",
  "sheetViewer.spinHelp": "عرض الكومات المعصورة بهذه السرعة فقط.",
  "sheetViewer.anySpin": "أي عصر",
  "sheetViewer.detergentHelp":
    'اكتب جزءًا من ملاحظة عن المنظف، مثل "بودرة"، لعرض الكومات التي تذكره فقط.',
  "sheetViewer.detergentSearchPlaceholder": "ابحث بالمنظف…",
  "sheetViewer.sharedConfigError":
    "تعذّر فتح الإعداد المُشارَك: {error}. يُعرض بدلًا منه ما كان نشطًا بالفعل.",
  "sheetViewer.showingBundledChart":
    "يُعرض جدول المثال المرفق. إنه جدول غسيل عام، وليس جدولك الخاص.",
  "sheetViewer.uploadEditPrefix": "ارفع أو نزّل أو عدّل جدولك الخاص في",
  "sheetViewer.noPileMatchAdvanced":
    'لا توجد كومة تطابق "{query}" مع هذه المرشّحات المتقدّمة. جرّب تخفيف أحدها.',
  "sheetViewer.noPileMatchQuery": 'لا توجد كومة تطابق "{query}". جرّب بحثًا مختلفًا.',
  "sheetViewer.noPileMatchAdvancedOnly":
    "لا توجد كومة تطابق هذه المرشّحات المتقدّمة. جرّب تخفيف أحدها.",
  "sheetViewer.preparingPdf": "جارٍ تجهيز ملف PDF…",
  "sheetViewer.downloadForPhone": "تنزيل للهاتف",
  "sheetViewer.downloadToPrint": "تنزيل للطباعة",
  "sheetViewer.shareThisView": "مشاركة هذا العرض",
  "sheetViewer.couldNotShare": "تعذّرت مشاركة هذا العرض: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "تعذّر إنشاء ملف PDF للهاتف: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "تعذّر إنشاء ملف PDF للطباعة: {error}",
  "sheetViewer.couldntRenderPhone": "تعذّر عرض هذه الأحرف في ملف PDF الخاص بالهاتف: {chars}",
  "sheetViewer.couldntRenderPrint": "تعذّر عرض هذه الأحرف في ملف PDF الخاص بالطباعة: {chars}",
  "sheet.subtitleFull": "مرّر للوصول إلى الكومة التي بين يديك.",
  "sheet.subtitleWash": "لإدخالها في الغسالة. الكي في الورقة الأخرى.",
  "sheet.subtitleIron": "عند لوح الكي. الغسيل في الورقة الأخرى.",
  "sheet.washingInstructions": "تعليمات الغسيل",
  "sheet.loadsHeading": "الأحمال — سطر واحد، غسلة واحدة",
  "sheet.loadsExplain":
    'شارة "معًا" تعني أن كل الكومات في ذلك السطر تشترك في غسلة واحدة — ضعها في الغسالة دفعة واحدة.',
  "sheet.together": "معًا",
  "sheet.legendThermostatCaption": "منظم الحرارة",
  "sheet.legendProgrammeCaption": "البرنامج",
  "sheet.legendIronExplain":
    "الحلقة هي منظم حرارة المكواة كما يظهر على القرص، والمؤشر الأحمر هو الموضع الذي يجب توجيهه إليه. الشريط الأزرق هو المنطقة التي يُصدر فيها بخارًا؛ أي إعداد أسفله يعني كيًّا جافًا. الحلقة المشطوبة تعني ترك المكواة في الخزانة.",
  "sheet.legendWashExplain":
    "تُرسم الأقراص كما تظهر على الغسالة: الساعة الثانية عشرة هي {off}، والمؤشر الأحمر هو الموضع الذي يجب توجيهه إليه. تُظهر الشرائح كل قيمة تمر بها الشاشة، مع تظليل القيمة المطلوبة.",
  "sheet.legendWashExplainFullSuffix":
    " وعلى المكواة، الشريط الأزرق هو المنطقة التي يُصدر فيها بخارًا.",
  "sheet.washHeading": "الغسيل",
  "sheet.washTogetherWithLabel": "يُغسل مع",
  "sheet.washTogetherEachOther": "بعضها بعضًا",
  "sheet.washTogetherEachOtherAnd": "بعضها بعضًا، و{names}",
  "sheet.washSeparately": "الإعدادات نفسها، لكن اغسل هذه بشكل منفصل — راجع المصفوفة",
  "sheet.washAlone": "لا شيء آخر — تُغسل وحدها",
  "sheet.dryingLabel": "التجفيف",
  "sheet.pileCountOne": "{count} كومة",
  "sheet.pileCountOther": "{count} كومات",
  "sheet.thermostatOn": "منظم الحرارة على {label}",
  "sheet.leaveIronOff": "اترك المكواة مطفأة",
  "sheet.neverNearBoard": "لا شيء في هذه البطاقة يقترب من لوح الكي أبدًا",
  "sheet.howHeading": "الطريقة",
  "sheet.neverTheseHeading": "أبدًا هذه",
  "sheet.durationsDisclaimer": "المدد الزمنية هي تقديرات الغسالة نفسها وتختلف حسب الحمل.",
  "sheet.copyLink": "نسخ الرابط",
  "sheet.preparing": "جارٍ التجهيز…",
  "sheet.download": "تنزيل",
  "sheet.couldNotCopyLink": "تعذّر نسخ الرابط: {error}",
  "sheet.couldNotGeneratePdf": "تعذّر إنشاء ملف PDF: {error}",
  "sheet.couldntRenderInPdf": "تعذّر عرض هذه الأحرف في ملف PDF: {chars}",
  "config.editMachine": "تعديل الغسالة ←",
  "config.programmes": "البرامج",
  "config.temperatures": "درجات الحرارة",
  "config.spinSpeeds": "سرعات العصر",
  "config.ironSettings": "إعدادات الكي",
  "config.durationInvalidHint": "استخدم الصيغة س:دد، مثل 2:30",
  "config.durationValidHint": "الصيغة: س:دد، مثل 2:30",
  "config.durationAriaLabel": "المدة",
  "config.showingBundledConfig":
    "يُعرض إعداد المثال المرفق. إنه جدول غسيل وغسالة عامان، وليسا خاصين بك.",
  "config.uploadEditHelp":
    "ارفع أو نزّل أو عدّل أدناه — تُطبَّق التغييرات على الموقع كله بعد الحفظ، وتبقى محفوظة في هذا المتصفح حتى تمسحها.",
  "config.yourConfigHeading": "إعدادك",
  "config.useBundledInstead": "استخدام المثال المرفق بدلًا من ذلك",
  "config.machineHeading": "الغسالة",
  "config.chartHeading": "الجدول — كل كومة",
  "config.chartEditHelp":
    "كل حقل قابل للتعديل. يتحقق الحفظ من كل صف مقابل الغسالة أعلاه، تمامًا كما يفعل الرفع — أي قيمة غير معروفة يُشار إليها بالصف والعمود، لا أن تُقبل بصمت.",
  "config.sortBy": "الترتيب حسب",
  "config.chartOrder": "ترتيب الجدول",
  "config.ironedLabel": "مكوي",
  "config.ironingNotesAriaLabel": "ملاحظات الكي",
  "config.colourGroupHeading": "مجموعة اللون",
  "config.mixTagsHeading": "وسوم الخلط",
  "machine.moveUp": "نقل {value} لأعلى",
  "machine.moveDown": "نقل {value} لأسفل",
  "machine.removeItem": "إزالة {value}",
  "machine.addButton": "+ إضافة",
  "machine.capacityLabel": "السعة",
  "machine.programmesHint": "بترتيب القرص، بدءًا من الساعة الثانية عشرة.",
  "machine.temperaturesLabel": "درجات الحرارة (°C)",
  "machine.addPlaceholderProgramme": "إضافة برنامج…",
  "machine.addPlaceholderTemperature": "إضافة درجة حرارة…",
  "machine.addPlaceholderSpin": "إضافة سرعة عصر…",
  "machine.addPlaceholderButton": "إضافة زر…",
  "machine.addAriaProgramme": "إضافة إلى البرامج",
  "machine.addAriaTemperature": "إضافة إلى درجات الحرارة (°C)",
  "machine.addAriaSpin": "إضافة إلى سرعات العصر",
  "machine.addAriaButton": "إضافة إلى الأزرار",
  "machine.settingsHeading": "الإعدادات",
  "machine.settingColumnHeader": "الإعداد",
  "machine.dotsColumnHeader": "النقاط",
  "machine.detailColumnHeader": "التفاصيل",
  "machine.steamColumnHeader": "البخار",
  "machine.settingLabelAria": "تسمية الإعداد {n}",
  "machine.settingDotsAria": "نقاط الإعداد {n}",
  "machine.settingDetailAria": "تفاصيل الإعداد {n}",
  "machine.settingSteamAria": "الإعداد {n} يُصدر بخارًا",
  "machine.removeSettingAria": "إزالة الإعداد {n}",
  "machine.addSetting": "+ إضافة إعداد",
  "machine.newSettingDefaultLabel": "إعداد جديد",
  "machine.showingOwnMachine": "تُعرض غسالتك الخاصة.",
  "machine.showingBundledMachine":
    "تُعرض غسالة المثال المرفقة. إنها غسالة ومكواة عامتان، وليستا خاصتين بك.",
  "machine.changesApplyPrefix":
    "تُطبَّق التغييرات على الموقع كله بعد الحفظ — وهو نفس الإعداد الذي تقرؤه",
  "machine.changesApplySuffix": ".",
  "machine.useBundledMachineInstead": "استخدام الغسالة المرفقة بدلًا من ذلك",
  "machine.washerHeading": "الغسالة",
  "upload.uploadConfig": "رفع إعداد",
  "keyboardNav.title": "اختصارات لوحة المفاتيح",
  "keyboardNav.close": "إغلاق",
  "keyboardNav.scrollDown": "التمرير لأسفل",
  "keyboardNav.scrollUp": "التمرير لأعلى",
  "keyboardNav.jumpTop": "الانتقال إلى الأعلى",
  "keyboardNav.jumpBottom": "الانتقال إلى الأسفل",
  "keyboardNav.focusSearch": "التركيز على حقل البحث في الصفحة",
  "keyboardNav.toggleHelp": "تبديل عرض هذه المساعدة",
  "keyboardNav.closeHelp": "إغلاق هذه المساعدة",
  "theme.switchToLight": "التحويل إلى الوضع الفاتح",
  "theme.switchToDark": "التحويل إلى الوضع الداكن",
  "page.config.title": "Washy washy — أحمال الغسيل",
  "page.config.description":
    "الإعداد الكامل المحمّل: إعدادات الغسالة والمكواة، وكل كومة في الجدول، في مكان واحد منظّم.",
  "page.config.h1": "أحمال الغسيل",
  "page.machine.title": "Washy washy — إعدادات الغسالة والمكواة",
  "page.machine.description":
    "إعدادات الغسالة والمكواة — البرامج ودرجات الحرارة والعصرات، ومنظم حرارة المكواة.",
  "page.machine.h1": "إعدادات الغسالة والمكواة",
};
const zh: Ui = {
  "skip.toContent": "跳转到内容",
  "ribbon.forkMe": "在 GitHub 上 Fork 本项目",
  "nav.home": "首页",
  "nav.washingLoads": "洗衣清单",
  "nav.washerIron": "洗衣机与熨斗",
  "nav.docs": "文档",
  "switcher.label": "语言",
  "footer.github": "GitHub 上的 Washy washy",
  "footer.disclaimer": "免责声明",
  "footer.privacy": "隐私政策",
  "footer.copyrightBefore": "© 2026 Ryan Kes。根据 ",
  "footer.copyrightAfter":
    " 许可证提供——不附带任何形式的保证（详见许可协议第 15–16 条）。请务必查看衣物本身的洗涤标签；本图表反映的是某个家庭自己的设置，并非制造商的保证。",
  "home.title": "Washy washy",
  "home.description":
    "一份适合手机查看的洗衣图表：每一类衣物该用的程序、温度和脱水转速，哪些可以合用一个滚筒，以及熨斗温控旋钮该调到哪里。",
  "home.h1": "你的洗衣图表",
  "home.intro":
    "把洗衣图表变成一张适合手机查看的表格：每一类衣物该用哪个程序、多高的温度、多快的脱水转速，哪些可以放进同一个滚筒一起洗，以及熨斗的温控旋钮该调到哪里。把这个页面添加到手机主屏幕——Safari 的分享菜单和 Chrome 的 *⋮* 菜单里都有“添加到主屏幕”选项——添加后它会像应用一样打开，没有地址栏，就在洗衣机旁边随手可用。",
  "disclaimer.title": "Washy washy — 免责声明",
  "disclaimer.description":
    "本图表并非官方内容，而是社区维护的项目，反映的是某个家庭自己的设置——并非制造商的保证。",
  "disclaimer.h1": "免责声明",
  "disclaimer.p1":
    "Washy washy 是一个非官方的社区维护项目，与任何洗衣机或家电制造商没有任何关联，也未获得其认可或合作生产。",
  "disclaimer.p2":
    "内置图表反映的是某个家庭自己的洗涤和熨烫设置——这一套选择适用于某一台洗衣机、一个熨斗和一个人的衣物，它不是制造商的保证、洗涤标签标准，也不是专业建议。不同的衣物、面料和机器各不相同，在一台机器上安全的设置在另一台上可能会造成损坏。",
  "disclaimer.p3": "衣物本身的洗涤标签始终优先于本页面显示的任何内容。两者不一致时，请以标签为准。",
  "disclaimer.p4":
    "如项目许可协议（GPL-3.0-or-later，第 15–16 条）所述：本软件按“原样”提供，不附带任何形式的明示或暗示担保。Washy washy 的维护者对因使用本软件而造成的任何损害——衣物、机器或其他任何方面——概不负责。",
  "privacy.title": "Washy washy — 隐私政策",
  "privacy.h1": "隐私政策",
  "privacy.descriptionUmami":
    "无需账号，不使用 Cookie。通过 Umami（一款注重隐私保护的工具）统计页面浏览量，不收集任何可识别你身份的信息。上传的配置或图表修改只保存在你自己的浏览器中，绝不会发送到任何地方。",
  "privacy.descriptionNoUmami":
    "没有账号、Cookie、分析或任何形式的追踪。上传的配置或图表修改只保存在你自己的浏览器中，绝不会发送到任何地方。",
  "privacy.pUmami":
    "Washy washy 没有账号系统，也不设置 Cookie。它确实使用 [Umami](https://umami.is/)（一款注重隐私保护的分析工具）来了解网站的使用情况——哪些页面被访问、访问了多少次。Umami 不使用 Cookie，不会跨站追踪你，也不收集任何可识别你个人身份的信息。",
  "privacy.pNoUmami":
    "Washy washy 没有账号、没有 Cookie、没有分析工具，也没有任何形式的追踪脚本。这里没有任何东西在监视你在网站上的行为。",
  "privacy.pStorage":
    "上传你自己的配置，或编辑图表、机器设置，这些数据只会保存在你自己浏览器的存储空间（`localStorage`）中。它绝不会离开你的设备——不会发送到服务器，不会发给我们，也不会发给任何人。清除浏览器中 washy washy 的网站数据即可将其完全删除。",
  "privacy.pHosting":
    "网站本身是静态的——只是一些没有后端的纯文件——由 [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/) 提供服务。和任何网络托管商一样，Cloudflare 自身的基础设施能看到提供页面时涉及的普通 HTTP 请求元数据——你的 IP 地址、浏览器信息、请求的页面——这和你访问的其他任何网站一样。Washy washy 本身无法获取这些信息，也不会向 Cloudflare 或其他任何人索取。",
  "banner.message": "本页由 AI 翻译——要怪就怪天网，别怪开发者。",
  "banner.dismiss": "关闭",
  "common.pile": "类别",
  "common.detergent": "洗涤剂",
  "common.notes": "备注",
  "common.temp": "温度",
  "common.spinRpm": "脱水转速",
  "common.buttons": "按钮",
  "common.programme": "程序",
  "common.source": "来源",
  "common.doNotIron": "请勿熨烫",
  "common.noSpin": "不脱水",
  "common.softenerOk": "可用柔顺剂",
  "common.noSoftener": "禁用柔顺剂",
  "common.copied": "已复制！",
  "common.remove": "移除",
  "common.name": "名称",
  "common.iron": "熨烫",
  "common.washingLoadsPageLink": "洗衣清单页面",
  "common.clockwiseFrom": "从 {off} 顺时针转到 {position}",
  "common.insideSteamZone": "在蒸汽区域内",
  "common.belowSteamZone": "低于蒸汽区域——仅限干烫",
  "common.couldNotUseFile": "无法使用该文件：{error}",
  "common.couldNotSave": "无法保存：{error}",
  "common.downloadCurrentConfig": "下载当前配置",
  "common.uploadConfigJson": "上传配置（JSON）",
  "common.saveChanges": "保存更改",
  "common.showingOwnConfig": "正在显示你自己的配置。",
  "common.whatDoesThisDo": "这是做什么用的？",
  "sheetViewer.cutEverything": "全部",
  "sheetViewer.cutWashOnly": "仅洗涤",
  "sheetViewer.cutIronOnly": "仅熨烫",
  "sheetViewer.filterChart": "筛选图表",
  "sheetViewer.cutLabel": "范围",
  "sheetViewer.cutHelp": "选择图表的显示范围：全部、仅洗涤或仅熨烫。",
  "sheetViewer.pileHelp": "输入类别名称的一部分，例如“毛巾”，即可只显示对应卡片。",
  "sheetViewer.pileSearchPlaceholder": "按类别名称搜索…",
  "sheetViewer.advanced": "高级",
  "sheetViewer.programmeHelp": "仅显示使用该程序的类别。",
  "sheetViewer.anyProgramme": "任意程序",
  "sheetViewer.temperatureLabel": "温度",
  "sheetViewer.temperatureHelp": "仅显示以该温度洗涤的类别。",
  "sheetViewer.anyTemperature": "任意温度",
  "sheetViewer.spinLabel": "脱水",
  "sheetViewer.spinHelp": "仅显示以该转速脱水的类别。",
  "sheetViewer.anySpin": "任意转速",
  "sheetViewer.detergentHelp": "输入洗涤剂备注的一部分，例如“粉状”，即可只显示提到它的类别。",
  "sheetViewer.detergentSearchPlaceholder": "按洗涤剂搜索…",
  "sheetViewer.sharedConfigError": "无法打开分享的配置：{error}。将改为显示此前已生效的内容。",
  "sheetViewer.showingBundledChart": "正在显示内置的示例图表。这是一个通用洗衣图表，并非你自己的。",
  "sheetViewer.uploadEditPrefix": "如需上传、下载或编辑你自己的内容，请前往",
  "sheetViewer.noPileMatchAdvanced":
    "在这些高级筛选条件下，没有类别匹配“{query}”。试着放宽一项条件。",
  "sheetViewer.noPileMatchQuery": "没有类别匹配“{query}”。试试其他搜索词。",
  "sheetViewer.noPileMatchAdvancedOnly": "在这些高级筛选条件下没有匹配的类别。试着放宽一项条件。",
  "sheetViewer.preparingPdf": "正在准备 PDF…",
  "sheetViewer.downloadForPhone": "下载手机版",
  "sheetViewer.downloadToPrint": "下载打印版",
  "sheetViewer.shareThisView": "分享此视图",
  "sheetViewer.couldNotShare": "无法分享此视图：{error}",
  "sheetViewer.couldNotGeneratePhonePdf": "无法生成手机版 PDF：{error}",
  "sheetViewer.couldNotGeneratePrintPdf": "无法生成打印版 PDF：{error}",
  "sheetViewer.couldntRenderPhone": "手机版 PDF 中无法渲染：{chars}",
  "sheetViewer.couldntRenderPrint": "打印版 PDF 中无法渲染：{chars}",
  "sheet.subtitleFull": "滚动查看你手上这堆衣物。",
  "sheet.subtitleWash": "把它放进洗衣机。熨烫说明在另一张表上。",
  "sheet.subtitleIron": "在熨衣板前。洗涤说明在另一张表上。",
  "sheet.washingInstructions": "洗涤说明",
  "sheet.loadsHeading": "分批——一行一洗",
  "sheet.loadsExplain":
    "同一行出现“一起洗”徽章，表示该行的所有类别属于同一次洗涤——把它们一起放进洗衣机。",
  "sheet.together": "一起洗",
  "sheet.legendThermostatCaption": "温控旋钮",
  "sheet.legendProgrammeCaption": "程序",
  "sheet.legendIronExplain":
    "外圈是熨斗温控旋钮在刻度盘上的位置，红色指针指示应转到的位置。蓝色区域是会产生蒸汽的范围；调到蓝色区域以下即为干烫。带斜杠的圆圈表示这件衣物不要熨烫，放回柜子里就好。",
  "sheet.legendWashExplain":
    "刻度盘的画法与它在机器上的实际样子一致：十二点方向是{off}，红色指针指示应转到的位置。色块列出了显示屏会经过的每一个数值，你要的那个会被填色标出。",
  "sheet.legendWashExplainFullSuffix": " 在熨斗刻度盘上，蓝色区域是会产生蒸汽的范围。",
  "sheet.washHeading": "洗涤",
  "sheet.washTogetherWithLabel": "一起洗涤的对象",
  "sheet.washTogetherEachOther": "彼此之间",
  "sheet.washTogetherEachOtherAnd": "彼此之间，以及{names}",
  "sheet.washSeparately": "设置相同，但需分开洗——详见对照表",
  "sheet.washAlone": "不与其他任何衣物同洗——单独洗涤",
  "sheet.dryingLabel": "烘干",
  "sheet.pileCountOne": "{count} 个类别",
  "sheet.pileCountOther": "{count} 个类别",
  "sheet.thermostatOn": "温控旋钮调至{label}",
  "sheet.leaveIronOff": "熨斗保持关闭",
  "sheet.neverNearBoard": "这张卡片上的衣物绝不能靠近熨衣板",
  "sheet.howHeading": "怎么做",
  "sheet.neverTheseHeading": "绝不能这样",
  "sheet.durationsDisclaimer": "时长为机器自身的估算值，会因载量多少而有所不同。",
  "sheet.copyLink": "复制链接",
  "sheet.preparing": "准备中…",
  "sheet.download": "下载",
  "sheet.couldNotCopyLink": "无法复制链接：{error}",
  "sheet.couldNotGeneratePdf": "无法生成 PDF：{error}",
  "sheet.couldntRenderInPdf": "PDF 中无法渲染：{chars}",
  "config.editMachine": "编辑机器 →",
  "config.programmes": "程序",
  "config.temperatures": "温度",
  "config.spinSpeeds": "脱水转速",
  "config.ironSettings": "熨烫设置",
  "config.durationInvalidHint": "请使用 H:MM 格式，例如 2:30",
  "config.durationValidHint": "格式：H:MM，例如 2:30",
  "config.durationAriaLabel": "时长",
  "config.showingBundledConfig":
    "正在显示内置的示例配置。这是一台通用洗衣机和一张通用洗衣图表，并非你自己的。",
  "config.uploadEditHelp":
    "在下方上传、下载或编辑——保存后更改将应用于整个网站，并保留在此浏览器中，直到你清除它们为止。",
  "config.yourConfigHeading": "你的配置",
  "config.useBundledInstead": "改用内置示例",
  "config.machineHeading": "机器",
  "config.chartHeading": "图表——全部类别",
  "config.chartEditHelp":
    "每个字段都可编辑。保存时会像上传一样，对照上方的机器设置逐行检查——未知的值会按行和列具体指出，而不会被默默接受。",
  "config.sortBy": "排序方式",
  "config.chartOrder": "图表顺序",
  "config.ironedLabel": "已熨烫",
  "config.ironingNotesAriaLabel": "熨烫备注",
  "config.colourGroupHeading": "颜色分组",
  "config.mixTagsHeading": "混洗标签",
  "machine.moveUp": "将{value}上移",
  "machine.moveDown": "将{value}下移",
  "machine.removeItem": "移除{value}",
  "machine.addButton": "+ 添加",
  "machine.capacityLabel": "容量",
  "machine.programmesHint": "按刻度盘顺序排列，从十二点方向开始。",
  "machine.temperaturesLabel": "温度 (°C)",
  "machine.addPlaceholderProgramme": "添加一个程序…",
  "machine.addPlaceholderTemperature": "添加一个温度…",
  "machine.addPlaceholderSpin": "添加一个转速…",
  "machine.addPlaceholderButton": "添加一个按钮…",
  "machine.addAriaProgramme": "添加到“程序”",
  "machine.addAriaTemperature": "添加到“温度 (°C)”",
  "machine.addAriaSpin": "添加到“脱水转速”",
  "machine.addAriaButton": "添加到“按钮”",
  "machine.settingsHeading": "设置项",
  "machine.settingColumnHeader": "设置",
  "machine.dotsColumnHeader": "圆点",
  "machine.detailColumnHeader": "说明",
  "machine.steamColumnHeader": "蒸汽",
  "machine.settingLabelAria": "设置 {n} 的标签",
  "machine.settingDotsAria": "设置 {n} 的圆点",
  "machine.settingDetailAria": "设置 {n} 的说明",
  "machine.settingSteamAria": "设置 {n} 是否产生蒸汽",
  "machine.removeSettingAria": "移除设置 {n}",
  "machine.addSetting": "+ 添加设置",
  "machine.newSettingDefaultLabel": "新设置",
  "machine.showingOwnMachine": "正在显示你自己的机器。",
  "machine.showingBundledMachine":
    "正在显示内置的示例机器。这是一台通用洗衣机和熨斗，并非你自己的。",
  "machine.changesApplyPrefix": "保存后，更改将应用于整个网站——与",
  "machine.changesApplySuffix": "读取的是同一份配置。",
  "machine.useBundledMachineInstead": "改用内置机器",
  "machine.washerHeading": "洗衣机",
  "upload.uploadConfig": "上传配置",
  "keyboardNav.title": "键盘快捷键",
  "keyboardNav.close": "关闭",
  "keyboardNav.scrollDown": "向下滚动",
  "keyboardNav.scrollUp": "向上滚动",
  "keyboardNav.jumpTop": "跳到顶部",
  "keyboardNav.jumpBottom": "跳到底部",
  "keyboardNav.focusSearch": "聚焦页面的搜索框",
  "keyboardNav.toggleHelp": "切换此帮助",
  "keyboardNav.closeHelp": "关闭此帮助",
  "theme.switchToLight": "切换到浅色模式",
  "theme.switchToDark": "切换到深色模式",
  "page.config.title": "Washy washy — 洗衣清单",
  "page.config.description":
    "完整加载的配置：洗衣机与熨斗的设置，以及图表中的每一个类别，集中呈现在一个结构化页面中。",
  "page.config.h1": "洗衣清单",
  "page.machine.title": "Washy washy — 洗衣机与熨斗设置",
  "page.machine.description": "洗衣机与熨斗的设置——程序、温度、脱水转速，以及熨斗的温控旋钮。",
  "page.machine.h1": "洗衣机与熨斗设置",
};
const tr: Ui = {
  "skip.toContent": "İçeriğe geç",
  "ribbon.forkMe": "Beni GitHub'da fork'la",
  "nav.home": "Ana sayfa",
  "nav.washingLoads": "Çamaşır yükleri",
  "nav.washerIron": "Çamaşır makinesi ve ütü",
  "nav.docs": "Belgeler",
  "switcher.label": "Dil",
  "footer.github": "Washy washy GitHub'da",
  "footer.disclaimer": "Sorumluluk reddi",
  "footer.privacy": "Gizlilik politikası",
  "footer.copyrightBefore": "© 2026 Ryan Kes. Şu lisans altında sunulmuştur: ",
  "footer.copyrightAfter":
    " — olduğu gibi sunulur, hiçbir garanti içermez (bkz. lisansın 15–16. bölümleri). Her zaman giysinin kendi bakım etiketini kontrol edin; bu tablo bir haneye ait ayarları yansıtır, üretici garantisi değildir.",
  "home.title": "Washy washy",
  "home.description":
    "Telefon dostu bir çamaşır tablosu: her yığın için program, sıcaklık ve sıkma hızı, hangi yığınların aynı kazanı paylaşabileceği ve ütünün termostatının nereye ayarlanacağı.",
  "home.h1": "Çamaşır tablonuz",
  "home.intro":
    "Bir çamaşır tablosunu telefon dostu bir sayfaya dönüştürür: her yığın için hangi program, sıcaklık ve sıkma hızı, hangi yığınların aynı kazanı paylaşabileceği ve ütünün termostatının nereye ayarlanacağı. Bu sayfayı telefonunuzun ana ekranına ekleyin — Safari'nin Paylaş menüsünde de, Chrome'un *⋮* menüsünde de \"Ana Ekrana Ekle\" seçeneği bulunur — ve sayfa, adres çubuğu olmadan, tıpkı bir uygulama gibi, makinenin hemen yanında açılır.",
  "disclaimer.title": "Washy washy — sorumluluk reddi",
  "disclaimer.description":
    "Bu tablo resmi değildir ve topluluk tarafından yürütülür; bir hanenin kendi ayarlarını yansıtır — üretici garantisi değildir.",
  "disclaimer.h1": "Sorumluluk reddi",
  "disclaimer.p1":
    "Washy washy resmi olmayan, topluluk tarafından yürütülen bir projedir. Herhangi bir çamaşır makinesi veya beyaz eşya üreticisiyle bağlantılı değildir, onlar tarafından onaylanmamıştır ve onlarla iş birliği içinde üretilmemiştir.",
  "disclaimer.p2":
    "Birlikte gelen tablo, bir hanenin kendi çamaşır yıkama ve ütüleme ayarlarını yansıtır — bir çamaşır makinesi, bir ütü ve bir kişinin kıyafetleri için işe yarayan bir seçimler bütünü. Bu bir üretici garantisi, bir bakım etiketi standardı ya da profesyonel bir tavsiye değildir. Yükler, kumaşlar ve makineler farklılık gösterir; bir makinede güvenli olan bir ayar başka bir makineye zarar verebilir.",
  "disclaimer.p3":
    "Bir giysinin kendi bakım etiketi, burada gösterilen her şeyin her zaman önündedir. İkisi çeliştiğinde etikete uyun.",
  "disclaimer.p4":
    'Projenin lisansında (GPL-3.0-or-later, 15–16. bölümler) belirtildiği gibi: yazılım, açık ya da zımni hiçbir garanti olmaksızın "olduğu gibi" sunulur. Washy washy\'nin geliştiricileri, kullanımından doğan hiçbir zarardan — kıyafetlere, makinelere ya da başka herhangi bir şeye — sorumlu değildir.',
  "privacy.title": "Washy washy — gizlilik politikası",
  "privacy.h1": "Gizlilik politikası",
  "privacy.descriptionUmami":
    "Hesap yok, çerez yok. Sizi tanımlayacak hiçbir şey içermeyen, gizliliğe saygılı bir araç olan Umami üzerinden sayfa görüntüleme analitiği yapılır. Yüklediğiniz bir yapılandırma veya tablo düzenlemesi yalnızca kendi tarayıcınızda kalır ve hiçbir yere gönderilmez.",
  "privacy.descriptionNoUmami":
    "Hesap, çerez, analitik ya da izleme yok. Yüklediğiniz bir yapılandırma veya tablo düzenlemesi yalnızca kendi tarayıcınızda kalır ve hiçbir yere gönderilmez.",
  "privacy.pUmami":
    "Washy washy'nin hesabı yoktur ve hiçbir çerez oluşturmaz. Sitenin nasıl kullanıldığını görmek için — hangi sayfalar, kaç ziyaret — gizliliğe saygılı bir analitik aracı olan [Umami](https://umami.is/) kullanılır. Umami çerez kullanmaz, sizi başka sitelerde takip etmez ve sizi kişisel olarak tanımlayacak hiçbir şey toplamaz.",
  "privacy.pNoUmami":
    "Washy washy'nin hesabı, çerezi, analitiği ya da herhangi bir türde izleme betiği yoktur. Sitede sizi izleyen hiçbir şey bulunmuyor.",
  "privacy.pStorage":
    "Kendi yapılandırmanızı yüklemek veya tabloyu ya da makine ayarlarını düzenlemek, bu veriyi yalnızca kendi tarayıcınızın deposunda (`localStorage`) kaydeder. Hiçbir zaman cihazınızdan çıkmaz — ne bir sunucuya, ne bize, ne de başka kimseye. Washy washy için tarayıcınızın site verilerini temizlemek bu veriyi tamamen kaldırır.",
  "privacy.pHosting":
    "Sitenin kendisi statiktir — arka ucu olmayan, düz dosyalardan oluşur — ve [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/) tarafından sunulur. Herhangi bir web barındırıcısı gibi, Cloudflare'in kendi altyapısı da bir sayfayı sunarken oluşan sıradan HTTP istek meta verilerini görür — IP adresiniz, tarayıcınız, istenen sayfa — ziyaret ettiğiniz herhangi bir site gibi. Washy washy'nin kendisinin buna erişimi yoktur ve bunu ne Cloudflare'den ne de başka birinden ister.",
  "banner.message":
    "Bunu zaten İngilizce olarak okuyorsunuz — burada hiçbir yapay zeka çevirmen zarar görmedi (ya da gerekmedi).",
  "banner.dismiss": "Kapat",
  "common.pile": "Yığın",
  "common.detergent": "Deterjan",
  "common.notes": "Notlar",
  "common.temp": "Sıcaklık",
  "common.spinRpm": "Sıkma (rpm)",
  "common.buttons": "Düğmeler",
  "common.programme": "Program",
  "common.source": "KAYNAK",
  "common.doNotIron": "Ütülemeyin",
  "common.noSpin": "sıkma yok",
  "common.softenerOk": "YUMUŞATICI KULLANILABİLİR",
  "common.noSoftener": "YUMUŞATICI YOK",
  "common.copied": "Kopyalandı!",
  "common.remove": "Kaldır",
  "common.name": "Ad",
  "common.iron": "Ütü",
  "common.washingLoadsPageLink": "çamaşır yükleri sayfası",
  "common.clockwiseFrom": "{off} konumundan saat yönünde {position}",
  "common.insideSteamZone": "buhar bölgesinin içinde",
  "common.belowSteamZone": "buhar bölgesinin altında — sadece kuru ütü",
  "common.couldNotUseFile": "Bu dosya kullanılamadı: {error}",
  "common.couldNotSave": "Kaydedilemedi: {error}",
  "common.downloadCurrentConfig": "Mevcut yapılandırmayı indir",
  "common.uploadConfigJson": "Yapılandırma yükle (JSON)",
  "common.saveChanges": "Değişiklikleri kaydet",
  "common.showingOwnConfig": "Kendi yapılandırmanız gösteriliyor.",
  "common.whatDoesThisDo": "Bu ne işe yarar?",
  "sheetViewer.cutEverything": "Her şey",
  "sheetViewer.cutWashOnly": "Sadece yıkama",
  "sheetViewer.cutIronOnly": "Sadece ütüleme",
  "sheetViewer.filterChart": "Tabloyu filtrele",
  "sheetViewer.cutLabel": "Kesit",
  "sheetViewer.cutHelp":
    "Tablonun hangi bölümlerinin gösterileceği: her şey, sadece yıkama ya da sadece ütüleme.",
  "sheetViewer.pileHelp":
    'Sadece o kartı göstermek için bir yığının adının bir kısmını yazın, örneğin "havlular".',
  "sheetViewer.pileSearchPlaceholder": "Yığın adına göre ara…",
  "sheetViewer.advanced": "Gelişmiş",
  "sheetViewer.programmeHelp": "Sadece bu programı kullanan yığınları göster.",
  "sheetViewer.anyProgramme": "Herhangi bir program",
  "sheetViewer.temperatureLabel": "Sıcaklık",
  "sheetViewer.temperatureHelp": "Sadece bu sıcaklıkta yıkanan yığınları göster.",
  "sheetViewer.anyTemperature": "Herhangi bir sıcaklık",
  "sheetViewer.spinLabel": "Sıkma",
  "sheetViewer.spinHelp": "Sadece bu hızda sıkılan yığınları göster.",
  "sheetViewer.anySpin": "Herhangi bir sıkma hızı",
  "sheetViewer.detergentHelp":
    'Sadece belirttiğiniz notu içeren yığınları göstermek için bir deterjan notunun bir kısmını yazın, örneğin "toz".',
  "sheetViewer.detergentSearchPlaceholder": "Deterjana göre ara…",
  "sheetViewer.sharedConfigError":
    "Paylaşılan yapılandırma açılamadı: {error}. Bunun yerine zaten etkin olan gösteriliyor.",
  "sheetViewer.showingBundledChart":
    "Birlikte gelen örnek tablo gösteriliyor. Bu genel bir çamaşır tablosudur, sizin kendi tablonuz değildir.",
  "sheetViewer.uploadEditPrefix":
    "Kendinize ait olanı şuradan yükleyin, indirin ya da düzenleyin: ",
  "sheetViewer.noPileMatchAdvanced":
    '"{query}" ile eşleşen ve bu gelişmiş filtrelere uyan bir yığın yok. Bir tanesini gevşetmeyi deneyin.',
  "sheetViewer.noPileMatchQuery": '"{query}" ile eşleşen bir yığın yok. Farklı bir arama deneyin.',
  "sheetViewer.noPileMatchAdvancedOnly":
    "Bu gelişmiş filtrelere uyan bir yığın yok. Bir tanesini gevşetmeyi deneyin.",
  "sheetViewer.preparingPdf": "PDF hazırlanıyor…",
  "sheetViewer.downloadForPhone": "Telefon için indir",
  "sheetViewer.downloadToPrint": "Yazdırmak için indir",
  "sheetViewer.shareThisView": "Bu görünümü paylaş",
  "sheetViewer.couldNotShare": "Bu görünüm paylaşılamadı: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "Telefon PDF'i oluşturulamadı: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "Yazdırma PDF'i oluşturulamadı: {error}",
  "sheetViewer.couldntRenderPhone": "Telefon PDF'inde şunlar gösterilemedi: {chars}",
  "sheetViewer.couldntRenderPrint": "Yazdırma PDF'inde şunlar gösterilemedi: {chars}",
  "sheet.subtitleFull": "Elinizdeki yığın için kaydırın.",
  "sheet.subtitleWash": "Makineye koyma aşaması. Ütüleme diğer sayfada.",
  "sheet.subtitleIron": "Ütü masasında. Yıkama diğer sayfada.",
  "sheet.washingInstructions": "Yıkama talimatları",
  "sheet.loadsHeading": "Yükler — bir satır, bir yıkama",
  "sheet.loadsExplain":
    "BİRLİKTE rozeti, o satırdaki her yığının tek bir yıkamayı paylaştığı anlamına gelir — hepsini aynı anda makineye koyun.",
  "sheet.together": "BİRLİKTE",
  "sheet.legendThermostatCaption": "termostat",
  "sheet.legendProgrammeCaption": "program",
  "sheet.legendIronExplain":
    "Halka, ütünün kadranda durduğu haliyle termostatını gösterir; kırmızı ok ise hangi konuma çevrileceğini gösterir. Mavi bant, buhar yaptığı bölgedir; bunun altındaki bir ayar kuru ütü demektir. Üzeri çarpı işaretli bir halka, ütüyü dolapta bırakın anlamına gelir.",
  "sheet.legendWashExplain":
    "Kadranlar, makinenin üzerinde durdukları haliyle çizilmiştir: saat on iki yönü {off} konumudur, kırmızı ok ise çevrilecek konumu gösterir. Çipler, ekranın geçtiği her değeri gösterir; istediğiniz değer doldurulmuş olarak işaretlenir.",
  "sheet.legendWashExplainFullSuffix": " Ütüde, mavi bant buhar yaptığı bölgedir.",
  "sheet.washHeading": "Yıkama",
  "sheet.washTogetherWithLabel": "Şunlarla birlikte yıka",
  "sheet.washTogetherEachOther": "birbirleriyle",
  "sheet.washTogetherEachOtherAnd": "birbirleriyle ve {names} ile",
  "sheet.washSeparately": "aynı ayarlar, ama bunları ayrı yıkayın — matrise bakın",
  "sheet.washAlone": "başka hiçbir şeyle değil — tek başına yıkayın",
  "sheet.dryingLabel": "Kurutma",
  "sheet.pileCountOne": "{count} yığın",
  "sheet.pileCountOther": "{count} yığın",
  "sheet.thermostatOn": "Termostat {label} konumunda",
  "sheet.leaveIronOff": "Ütüyü kapalı bırakın",
  "sheet.neverNearBoard": "bu karttaki hiçbir şey ütü masasına yaklaştırılmaz",
  "sheet.howHeading": "Nasıl",
  "sheet.neverTheseHeading": "Asla bunlar",
  "sheet.durationsDisclaimer": "Süreler makinenin kendi tahminleridir ve yüke göre değişir.",
  "sheet.copyLink": "Bağlantıyı kopyala",
  "sheet.preparing": "Hazırlanıyor…",
  "sheet.download": "İndir",
  "sheet.couldNotCopyLink": "Bağlantı kopyalanamadı: {error}",
  "sheet.couldNotGeneratePdf": "PDF oluşturulamadı: {error}",
  "sheet.couldntRenderInPdf": "PDF'te şunlar gösterilemedi: {chars}",
  "config.editMachine": "Makineyi düzenle →",
  "config.programmes": "Programlar",
  "config.temperatures": "Sıcaklıklar",
  "config.spinSpeeds": "Sıkma hızları",
  "config.ironSettings": "Ütü ayarları",
  "config.durationInvalidHint": "S:DD biçimini kullanın, örneğin 2:30",
  "config.durationValidHint": "Biçim: S:DD, örneğin 2:30",
  "config.durationAriaLabel": "Süre",
  "config.showingBundledConfig":
    "Birlikte gelen örnek yapılandırma gösteriliyor. Bu genel bir çamaşır tablosu ve çamaşır makinesidir, sizin kendi kurulumunuz değildir.",
  "config.uploadEditHelp":
    "Aşağıdan yükleyin, indirin ya da düzenleyin — kaydedildiğinde değişiklikler sitenin tamamında geçerli olur ve siz temizleyene kadar bu tarayıcıda kalıcı olur.",
  "config.yourConfigHeading": "Yapılandırmanız",
  "config.useBundledInstead": "Bunun yerine birlikte gelen örneği kullan",
  "config.machineHeading": "Makine",
  "config.chartHeading": "Tablo — tüm yığınlar",
  "config.chartEditHelp":
    "Her alan düzenlenebilir. Kaydetmek, bir yüklemenin yaptığı gibi her satırı yukarıdaki makineye göre denetler — bilinmeyen bir değer sessizce kabul edilmez, satır ve sütun belirtilerek bildirilir.",
  "config.sortBy": "Sıralama ölçütü",
  "config.chartOrder": "Tablo sırası",
  "config.ironedLabel": "ÜTÜLENDİ",
  "config.ironingNotesAriaLabel": "Ütüleme notları",
  "config.colourGroupHeading": "Renk grubu",
  "config.mixTagsHeading": "Karışım etiketleri",
  "machine.moveUp": "{value} öğesini yukarı taşı",
  "machine.moveDown": "{value} öğesini aşağı taşı",
  "machine.removeItem": "{value} öğesini kaldır",
  "machine.addButton": "+ Ekle",
  "machine.capacityLabel": "Kapasite",
  "machine.programmesHint": "Saat on iki yönünden başlayarak, kadran sırasına göre.",
  "machine.temperaturesLabel": "Sıcaklıklar (°C)",
  "machine.addPlaceholderProgramme": "Bir program ekle…",
  "machine.addPlaceholderTemperature": "Bir sıcaklık ekle…",
  "machine.addPlaceholderSpin": "Bir sıkma hızı ekle…",
  "machine.addPlaceholderButton": "Bir düğme ekle…",
  "machine.addAriaProgramme": "Programlara ekle",
  "machine.addAriaTemperature": "Sıcaklıklara (°C) ekle",
  "machine.addAriaSpin": "Sıkma hızlarına ekle",
  "machine.addAriaButton": "Düğmelere ekle",
  "machine.settingsHeading": "Ayarlar",
  "machine.settingColumnHeader": "Ayar",
  "machine.dotsColumnHeader": "Noktalar",
  "machine.detailColumnHeader": "Detay",
  "machine.steamColumnHeader": "Buhar",
  "machine.settingLabelAria": "{n}. ayar etiketi",
  "machine.settingDotsAria": "{n}. ayar noktaları",
  "machine.settingDetailAria": "{n}. ayar detayı",
  "machine.settingSteamAria": "{n}. ayar buhar yapıyor",
  "machine.removeSettingAria": "{n}. ayarı kaldır",
  "machine.addSetting": "+ Ayar ekle",
  "machine.newSettingDefaultLabel": "Yeni ayar",
  "machine.showingOwnMachine": "Kendi makineniz gösteriliyor.",
  "machine.showingBundledMachine":
    "Birlikte gelen örnek makine gösteriliyor. Bu genel bir çamaşır makinesi ve ütüdür, sizin kendi makineniz değildir.",
  "machine.changesApplyPrefix":
    "Kaydedildiğinde değişiklikler sitenin tamamında geçerli olur — bu, ",
  "machine.changesApplySuffix": "'nın da okuduğu aynı yapılandırmadır.",
  "machine.useBundledMachineInstead": "Bunun yerine birlikte gelen makineyi kullan",
  "machine.washerHeading": "Çamaşır makinesi",
  "upload.uploadConfig": "Yapılandırma yükle",
  "keyboardNav.title": "Klavye kısayolları",
  "keyboardNav.close": "Kapat",
  "keyboardNav.scrollDown": "Aşağı kaydır",
  "keyboardNav.scrollUp": "Yukarı kaydır",
  "keyboardNav.jumpTop": "En üste git",
  "keyboardNav.jumpBottom": "En alta git",
  "keyboardNav.focusSearch": "Sayfanın arama alanına odaklan",
  "keyboardNav.toggleHelp": "Bu yardımı aç/kapat",
  "keyboardNav.closeHelp": "Bu yardımı kapat",
  "theme.switchToLight": "Açık moda geç",
  "theme.switchToDark": "Koyu moda geç",
  "page.config.title": "Washy washy — çamaşır yükleri",
  "page.config.description":
    "Tam yüklü yapılandırma: çamaşır makinesi ve ütünün ayarları, tablodaki her yığınla birlikte tek bir yapılandırılmış yerde.",
  "page.config.h1": "Çamaşır yükleri",
  "page.machine.title": "Washy washy — çamaşır makinesi ve ütü ayarları",
  "page.machine.description":
    "Çamaşır makinesi ve ütünün ayarları — programlar, sıcaklıklar, sıkma hızları ve ütünün termostatı.",
  "page.machine.h1": "Çamaşır makinesi ve ütü ayarları",
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

  "common.pile": "Da Pile",
  "common.detergent": "Da Suds",
  "common.notes": "Da Word",
  "common.temp": "Heat",
  "common.spinRpm": "Spin, rpm-style",
  "common.buttons": "Buttons",
  "common.programme": "Programme",
  "common.source": "SOURCE",
  "common.doNotIron": "Don't iron dis, chump",
  "common.noSpin": "no spin, jack",
  "common.softenerOk": "SOFTENER'S COOL",
  "common.noSoftener": "NO SOFTENER, JACK",
  "common.copied": "Copied, dig it!",
  "common.remove": "Split",
  "common.name": "Handle",
  "common.iron": "Iron",
  "common.washingLoadsPageLink": "washin' loads page",
  "common.clockwiseFrom": "{position} clockwise from {off}, you dig?",
  "common.insideSteamZone": "deep inside the steam zone",
  "common.belowSteamZone": "below the steam zone — dry iron only, chump",
  "common.couldNotUseFile": "No can do with that file, jack: {error}",
  "common.couldNotSave": "Couldn't save dat, chump: {error}",
  "common.downloadCurrentConfig": "Snag da current config",
  "common.uploadConfigJson": "Upload a config (JSON), dig it",
  "common.saveChanges": "Lock in dem changes",
  "common.showingOwnConfig": "Showin' yo' own config, fo' sho'.",
  "common.whatDoesThisDo": "What's dis jibber-jabber do?",

  "sheetViewer.cutEverything": "Everything, baby",
  "sheetViewer.cutWashOnly": "Washin' only",
  "sheetViewer.cutIronOnly": "Ironin' only",
  "sheetViewer.filterChart": "Filter dis chart, jack",
  "sheetViewer.cutLabel": "Slice",
  "sheetViewer.cutHelp":
    "Which parts of da chart to show: everything, washin' only, or ironin' only.",
  "sheetViewer.pileHelp":
    'Type part of a pile\'s handle, like "towels", and just dat card show up, you dig?',
  "sheetViewer.pileSearchPlaceholder": "Search by pile handle…",
  "sheetViewer.advanced": "Advanced stuff",
  "sheetViewer.programmeHelp": "Show only piles rollin' wit' dis programme.",
  "sheetViewer.anyProgramme": "Any ol' programme",
  "sheetViewer.temperatureLabel": "Heat",
  "sheetViewer.temperatureHelp": "Show only piles washed at dis here heat.",
  "sheetViewer.anyTemperature": "Any ol' heat",
  "sheetViewer.spinLabel": "Spin",
  "sheetViewer.spinHelp": "Show only piles spun at dis speed, jack.",
  "sheetViewer.anySpin": "Any ol' spin",
  "sheetViewer.detergentHelp":
    'Type part of a suds note, like "powder", and only dem piles mentionin\' it show up.',
  "sheetViewer.detergentSearchPlaceholder": "Search by suds…",
  "sheetViewer.sharedConfigError":
    "Couldn't crack open dat shared config, jack: {error}. Showin' what was already cookin' instead.",
  "sheetViewer.showingBundledChart":
    "Showin' da bundled example chart. It's a plain ol' laundry chart, not yo' own.",
  "sheetViewer.uploadEditPrefix": "Upload, download or tinker wit' yo' own on da",
  "sheetViewer.noPileMatchAdvanced":
    "No pile matchin' \"{query}\" wit' them deep-cut filters. Loosen one up, chump.",
  "sheetViewer.noPileMatchQuery": 'No pile matchin\' "{query}". Try another search, jack.',
  "sheetViewer.noPileMatchAdvancedOnly":
    "No pile matchin' them deep-cut filters. Loosen one up, chump.",
  "sheetViewer.preparingPdf": "Cookin' up dat PDF…",
  "sheetViewer.downloadForPhone": "Snag it fo' yo' phone",
  "sheetViewer.downloadToPrint": "Snag it to print",
  "sheetViewer.shareThisView": "Pass round dis view",
  "sheetViewer.couldNotShare": "Couldn't pass dis view round, jack: {error}",
  "sheetViewer.couldNotGeneratePhonePdf": "Couldn't cook up da phone PDF, chump: {error}",
  "sheetViewer.couldNotGeneratePrintPdf": "Couldn't cook up da print PDF, chump: {error}",
  "sheetViewer.couldntRenderPhone": "Couldn't render dat in da phone PDF: {chars}",
  "sheetViewer.couldntRenderPrint": "Couldn't render dat in da print PDF: {chars}",

  "sheet.subtitleFull": "Scroll on down fo' da pile you holdin', dig it.",
  "sheet.subtitleWash": "Gettin' it in da machine. Ironin's on da other sheet, jack.",
  "sheet.subtitleIron": "At da board. Washin's on da other sheet, jack.",
  "sheet.washingInstructions": "Washin' instructions",
  "sheet.loadsHeading": "Loads — one line, one wash, dig it",
  "sheet.loadsExplain":
    "A TOGETHER badge mean every pile on dat line share one wash — throw 'em in da machine all at once, chump.",
  "sheet.together": "TOGETHER",
  "sheet.legendThermostatCaption": "thermostat",
  "sheet.legendProgrammeCaption": "programme",
  "sheet.legendIronExplain":
    "Dat ring's da iron's thermostat, sittin' right there on da dial, and da red pointer's where you turn it, dig it. Da blue band's da zone where it's makin' steam; a setting below dat, you got a dry iron. A crossed-out ring mean leave dat iron in da cupboard, jack.",
  "sheet.legendWashExplain":
    "Dem dials drawn just like they sit on da machine: twelve o'clock is {off}, and da red pointer's where you turn it. Dem chips show every value da display steps through, filled in on da one you want, you dig?",
  "sheet.legendWashExplainFullSuffix":
    " On da iron, dat blue band's da zone where it's makin' steam.",
  "sheet.washHeading": "Wash",
  "sheet.washTogetherWithLabel": "Wash together wit'",
  "sheet.washTogetherEachOther": "each other, dig it",
  "sheet.washTogetherEachOtherAnd": "each other, and {names}",
  "sheet.washSeparately": "same settings, but wash dese separate-like — check da matrix, jack",
  "sheet.washAlone": "nothin' else — wash it alone, chump",
  "sheet.dryingLabel": "Dryin'",
  "sheet.pileCountOne": "{count} pile",
  "sheet.pileCountOther": "{count} piles, solid",
  "sheet.thermostatOn": "Thermostat set to {label}, jack",
  "sheet.leaveIronOff": "Leave dat iron off, chump",
  "sheet.neverNearBoard": "ain't nothin' on dis card ever goin' near da board",
  "sheet.howHeading": "How",
  "sheet.neverTheseHeading": "Never dese, chump",
  "sheet.durationsDisclaimer":
    "Dem durations is just da machine's own guesses, and they shift wit' da load, dig it.",
  "sheet.copyLink": "Copy da link",
  "sheet.preparing": "Cookin' it up…",
  "sheet.download": "Snag it",
  "sheet.couldNotCopyLink": "Couldn't copy dat link, jack: {error}",
  "sheet.couldNotGeneratePdf": "Couldn't cook up dat PDF, chump: {error}",
  "sheet.couldntRenderInPdf": "Couldn't render dat in da PDF: {chars}",

  "config.editMachine": "Tinker wit' da machine →",
  "config.programmes": "Programmes",
  "config.temperatures": "Heats",
  "config.spinSpeeds": "Spin speeds",
  "config.ironSettings": "Iron settings",
  "config.durationInvalidHint": "Use H:MM, like 2:30, dig it",
  "config.durationValidHint": "Format: H:MM, like 2:30, you dig",
  "config.durationAriaLabel": "How long",
  "config.showingBundledConfig":
    "Showin' da bundled example config. Just a plain laundry chart and washin' machine, not yo' own.",
  "config.uploadEditHelp":
    "Upload, download, or tinker below — changes hit da whole site once you save 'em, and they stick round in dis browser till you wipe 'em clean, jack.",
  "config.yourConfigHeading": "Yo' config",
  "config.useBundledInstead": "Roll wit' da bundled example instead",
  "config.machineHeading": "Machine",
  "config.chartHeading": "Chart — every last pile",
  "config.chartEditHelp":
    "Every field's yours to tinker wit'. Savin' checks each row against da machine up top, same as an upload do — a value it don't recognize gets called out by row and column, ain't slippin' through quiet, chump.",
  "config.sortBy": "Sort by",
  "config.chartOrder": "Chart order",
  "config.ironedLabel": "IRONED",
  "config.ironingNotesAriaLabel": "Ironin' notes",
  "config.colourGroupHeading": "Colour clique",
  "config.mixTagsHeading": "Mix tags",

  "machine.moveUp": "Bump {value} up",
  "machine.moveDown": "Bump {value} down",
  "machine.removeItem": "Split {value}",
  "machine.addButton": "+ Add",
  "machine.capacityLabel": "Capacity",
  "machine.programmesHint": "In dial order, kickin' off from twelve o'clock.",
  "machine.temperaturesLabel": "Heats (°C)",
  "machine.addPlaceholderProgramme": "Add a programme…",
  "machine.addPlaceholderTemperature": "Add a heat…",
  "machine.addPlaceholderSpin": "Add a spin…",
  "machine.addPlaceholderButton": "Add a button…",
  "machine.addAriaProgramme": "Add to Programmes",
  "machine.addAriaTemperature": "Add to Heats (°C)",
  "machine.addAriaSpin": "Add to Spin speeds",
  "machine.addAriaButton": "Add to Buttons",
  "machine.settingsHeading": "Settings",
  "machine.settingColumnHeader": "Setting",
  "machine.dotsColumnHeader": "Dots",
  "machine.detailColumnHeader": "Detail",
  "machine.steamColumnHeader": "Steam",
  "machine.settingLabelAria": "Setting {n} handle",
  "machine.settingDotsAria": "Setting {n} dots",
  "machine.settingDetailAria": "Setting {n} detail",
  "machine.settingSteamAria": "Setting {n} makin' steam",
  "machine.removeSettingAria": "Split setting {n}",
  "machine.addSetting": "+ Add setting",
  "machine.newSettingDefaultLabel": "Fresh setting",
  "machine.showingOwnMachine": "Showin' yo' own machine, fo' sho'.",
  "machine.showingBundledMachine":
    "Showin' da bundled example machine. Just a plain ol' washer and iron, not yo' own.",
  "machine.changesApplyPrefix": "Changes hit da whole site once you save 'em — same config da",
  "machine.changesApplySuffix": " reads, you dig.",
  "machine.useBundledMachineInstead": "Roll wit' da bundled machine instead",
  "machine.washerHeading": "Washer",

  "upload.uploadConfig": "Upload config, dig it",

  "keyboardNav.title": "Keyboard shortcuts, jack",
  "keyboardNav.close": "Close",
  "keyboardNav.scrollDown": "Scroll on down",
  "keyboardNav.scrollUp": "Scroll on up",
  "keyboardNav.jumpTop": "Jump to da top",
  "keyboardNav.jumpBottom": "Jump to da bottom",
  "keyboardNav.focusSearch": "Zero in on da page's search field",
  "keyboardNav.toggleHelp": "Toggle dis help",
  "keyboardNav.closeHelp": "Close dis help",

  "theme.switchToLight": "Flip to light mode",
  "theme.switchToDark": "Flip to dark mode",

  "page.config.title": "Washy washy — washin' loads",
  "page.config.description":
    "Da whole loaded config: da washin' machine and iron's settings, and every pile in da chart, all in one tight package, dig it.",
  "page.config.h1": "Washin' Loads",

  "page.machine.title": "Washy washy — washer & iron settings",
  "page.machine.description":
    "Da washin' machine and iron's settings — programmes, heats, spins, and da iron's thermostat, dig it.",
  "page.machine.h1": "Washer & Iron Settings",
};

/** Exported for test/ui.test.ts, which checks every locale carries the same keys. */
export const dictionaries: Record<Locale, Ui> = { en, ja, de, es, fr, ar, zh, tr, jive };

/** Plain `{token}` -> `String(value)` replacement — see the `Ui` interface's own doc comment. */
export type TranslationParams = Record<string, string | number>;

export function translator(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  return function t(key: keyof Ui, params?: TranslationParams): string {
    const value = dict[key] ?? dictionaries[DEFAULT_LOCALE][key];
    if (!params) return value;
    return Object.entries(params).reduce(
      (result, [token, replacement]) => result.replaceAll(`{${token}}`, String(replacement)),
      value,
    );
  };
}
