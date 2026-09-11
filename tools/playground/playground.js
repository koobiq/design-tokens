/**
 * Live theme playground for @koobiq/design-tokens.
 *
 * The point it demonstrates: the semantic palette is a pure 1:1 alias layer over the
 * engineering palette, so re-theming means repointing ~40 variables and nothing downstream
 * has to change. That is exactly what `semantic.json5` does at build time — here we do the
 * same thing at runtime, by writing `--kbq-semantic-*: var(--kbq-plt-*)` overrides.
 *
 * Family lists are read out of the built CSS rather than hardcoded, so the page cannot go
 * stale when the palette changes.
 */

const TOKENS = '/tokens';
const STEPS = 20;

const els = {
    controls: document.getElementById('pg-controls'),
    ramps: document.getElementById('pg-ramps'),
    chain: document.getElementById('pg-chain'),
    radius: document.getElementById('pg-radius'),
    radiusValue: document.getElementById('pg-radius-value'),
    theme: document.getElementById('pg-theme'),
    reset: document.getElementById('pg-reset'),
    copy: document.getElementById('pg-copy')
};

const overrides = document.createElement('style');
document.head.append(overrides);

/** `darkSlateA` → `dark-slate-a`, so we can build variable names from source-style keys. */
const toKebab = (name) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/** `--kbq-plt-dark-slate-a1` → the engineering family key `darkSlateA`. */
function parseFamily(variable, prefix) {
    const match = variable.match(new RegExp(`^--kbq-${prefix}-([a-z-]+?)-(a?)(\\d+)$`));

    if (!match) return null;

    const [, kebab, alpha] = match;
    const camel = kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

    return { family: camel + (alpha ? 'A' : ''), alpha: Boolean(alpha) };
}

async function readFamilies(file, prefix) {
    const css = await fetch(`${TOKENS}/${file}`).then((r) => r.text());
    const families = new Map();

    for (const [, variable] of css.matchAll(/^\s*(--kbq-[\w-]+)\s*:/gm)) {
        const parsed = parseFamily(variable, prefix);

        if (parsed) families.set(parsed.family, parsed);
    }

    return families;
}

const pltFamilies = await readFamilies('palette.css', 'plt');
const semanticFamilies = await readFamilies('semantic-palette.css', 'semantic');

/**
 * A semantic family is themeable if both its light and dark counterparts exist, and it has an
 * alpha twin. `warningFixed` is intentionally excluded: it is fixed-hue by design.
 */
const THEMEABLE = [
    { key: 'theme', label: 'Brand (theme)' },
    { key: 'contrast', label: 'Contrast (neutral)' },
    { key: 'error', label: 'Error' },
    { key: 'success', label: 'Success' },
    { key: 'warning', label: 'Warning' },
    { key: 'visited', label: 'Visited links' }
].filter(({ key }) => semanticFamilies.has(key) && semanticFamilies.has(`dark${key[0].toUpperCase()}${key.slice(1)}`));

/** Engineering families offered as choices: plain hue ramps that have a dark twin. */
const CHOICES = [...pltFamilies.keys()]
    .filter(
        (family) =>
            !family.startsWith('dark') &&
            !family.endsWith('A') &&
            !family.endsWith('Fixed') &&
            pltFamilies.has(`${family}A`) &&
            pltFamilies.has(`dark${family[0].toUpperCase()}${family.slice(1)}`)
    )
    .sort();

/** What each semantic family aliases today, read from the built CSS. */
const defaults = await (async () => {
    const css = await fetch(`${TOKENS}/semantic-palette.css`).then((r) => r.text());
    const found = {};

    for (const [, semantic, plt] of css.matchAll(
        /--kbq-semantic-([\w-]+?)-a?\d+:\s*var\(--kbq-plt-([a-z-]+?)-a?\d+\)/g
    )) {
        const camel = semantic.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

        found[camel] ??= plt.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    }

    return found;
})();

const state = Object.fromEntries(THEMEABLE.map(({ key }) => [key, defaults[key] ?? CHOICES[0]]));

const capitalise = (s) => s[0].toUpperCase() + s.slice(1);

/** Build the `--kbq-semantic-*: var(--kbq-plt-*)` block for the current selection. */
function buildOverrides() {
    const lines = [];

    for (const { key } of THEMEABLE) {
        const chosen = state[key];

        for (const [semantic, plt] of [
            [key, chosen],
            [`dark${capitalise(key)}`, `dark${capitalise(chosen)}`]
        ]) {
            for (const alpha of ['', 'A']) {
                for (let step = 1; step <= STEPS; step++) {
                    const suffix = `${alpha ? 'a' : ''}${step}`;

                    lines.push(
                        `  --kbq-semantic-${toKebab(semantic)}-${suffix}: var(--kbq-plt-${toKebab(plt)}-${suffix});`
                    );
                }
            }
        }
    }

    lines.push(`  --kbq-size-border-radius: ${els.radius.value}px;`);

    return `:root {\n${lines.join('\n')}\n}\n`;
}

function apply() {
    overrides.textContent = buildOverrides();
    els.radiusValue.textContent = `${els.radius.value}px`;
    renderRamps();
}

// --- controls -------------------------------------------------------------------

els.controls.innerHTML = THEMEABLE.map(
    ({ key, label }) => `
    <label class="pg-field">
        <span>${label}</span>
        <select data-family="${key}">
            ${CHOICES.map((c) => `<option value="${c}"${c === state[key] ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
    </label>`
).join('');

els.controls.addEventListener('change', (event) => {
    const family = event.target.dataset.family;

    if (!family) return;

    state[family] = event.target.value;
    apply();
});

els.radius.addEventListener('input', apply);

els.theme.addEventListener('click', () => {
    const dark = document.body.classList.toggle('kbq-dark');

    document.body.classList.toggle('kbq-light', !dark);
    els.theme.textContent = dark ? 'Light theme' : 'Dark theme';
    renderRamps();
});

els.reset.addEventListener('click', () => {
    for (const { key } of THEMEABLE) state[key] = defaults[key] ?? CHOICES[0];
    for (const select of els.controls.querySelectorAll('select')) select.value = state[select.dataset.family];
    els.radius.value = 8;
    apply();
});

// --- the actual deliverable: a patch you can paste into semantic.json5 -----------

els.copy.addEventListener('click', async () => {
    const changed = THEMEABLE.filter(({ key }) => state[key] !== defaults[key]);

    if (changed.length === 0) {
        els.copy.textContent = 'Nothing changed';
        setTimeout(() => (els.copy.textContent = 'Copy semantic.json5 patch'), 1600);

        return;
    }

    const blocks = [];

    for (const { key } of changed) {
        const chosen = state[key];

        for (const [semantic, plt] of [
            [key, chosen],
            [`${key}A`, `${chosen}A`],
            [`dark${capitalise(key)}`, `dark${capitalise(chosen)}`],
            [`dark${capitalise(key)}A`, `dark${capitalise(chosen)}A`]
        ]) {
            const steps = Array.from(
                { length: STEPS },
                (_, i) => `            '${i + 1}': { $value: '{plt.${plt}.${i + 1}}' }`
            ).join(',\n');

            blocks.push(`        ${semantic}: {\n${steps}\n        }`);
        }
    }

    const patch = `// Paste into packages/design-tokens/web/properties/semantic.json5\n{\n    semantic: {\n        $type: 'color',\n${blocks.join(',\n')}\n    }\n}\n`;

    try {
        await navigator.clipboard.writeText(patch);
        els.copy.textContent = `Copied ${changed.length} family/families`;
    } catch {
        // Clipboard needs a secure context; fall back to showing the patch.
        console.log(patch);
        els.copy.textContent = 'Logged to console';
    }

    setTimeout(() => (els.copy.textContent = 'Copy semantic.json5 patch'), 1600);
});

// --- ramps ----------------------------------------------------------------------

function renderRamps() {
    const dark = document.body.classList.contains('kbq-dark');

    els.ramps.innerHTML = THEMEABLE.map(({ key, label }) => {
        const family = dark ? `dark${capitalise(key)}` : key;
        const swatches = Array.from({ length: STEPS }, (_, i) => {
            const variable = `--kbq-semantic-${toKebab(family)}-${i + 1}`;

            return `<button class="pg-swatch" type="button" data-token="${variable}" style="background: var(${variable})" title="${variable}"></button>`;
        }).join('');

        return `<div class="pg-ramp"><span class="pg-ramp-label">${label}</span><span class="pg-ramp-steps">${swatches}</span></div>`;
    }).join('');
}

// --- reference chain inspector ---------------------------------------------------

/**
 * Collects the *declared* value of every custom property, per selector.
 *
 * `getComputedStyle` is no use here: for a custom property it returns the value after var()
 * substitution, so the whole chain has already collapsed to the final colour. Reading the
 * stylesheets back gives us what was actually authored, which is the thing worth showing.
 * The override <style> is a stylesheet too, so live re-theming is reflected automatically.
 */
function collectDeclarations() {
    const declared = new Map();

    for (const sheet of document.styleSheets) {
        let rules;

        try {
            rules = sheet.cssRules;
        } catch {
            // Cross-origin stylesheet — not ours, skip it.
            continue;
        }

        for (const rule of rules) {
            if (!(rule instanceof CSSStyleRule)) continue;

            for (const property of rule.style) {
                if (!property.startsWith('--kbq-')) continue;

                const scope = declared.get(rule.selectorText) ?? new Map();

                scope.set(property, rule.style.getPropertyValue(property).trim());
                declared.set(rule.selectorText, scope);
            }
        }
    }

    return declared;
}

/** Walks `--a: var(--b)` hops through the declared values, honouring the active theme. */
function resolveChain(variable) {
    const declared = collectDeclarations();
    const theme = document.body.classList.contains('kbq-dark') ? '.kbq-dark' : '.kbq-light';
    // Theme scopes win over :root, which is how the cascade resolves them on the page.
    const lookup = (name) => declared.get(theme)?.get(name) ?? declared.get(':root')?.get(name);

    const chain = [];
    let current = variable;

    for (let hop = 0; hop < 8 && current; hop++) {
        const raw = lookup(current);

        if (raw === undefined) break;

        chain.push({ variable: current, value: raw });

        const next = raw.match(/^var\((--[\w-]+)\)$/);

        current = next ? next[1] : null;
    }

    return chain;
}

function renderChain(variable) {
    const chain = resolveChain(variable);

    if (chain.length === 0) {
        els.chain.innerHTML = `<li class="pg-chain-empty">${variable} is not defined in this theme.</li>`;

        return;
    }

    els.chain.innerHTML = chain.map(({ variable: name, value }) => `<li><b>${name}</b><br>${value}</li>`).join('');
}

document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-token]');

    if (!target) return;

    if (target.tagName === 'A') event.preventDefault();

    renderChain(target.dataset.token);
});

els.chain.innerHTML = '<li class="pg-chain-empty">Nothing selected yet.</li>';
apply();
