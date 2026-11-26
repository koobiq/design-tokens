const ALIAS = /^\{[^{}]+\}$/;
const UNITS = new Set(['px', 'rem']);
const KEYS = 'unit,value';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const assertDimension = (value, path, { allowReference = false } = {}) => {
    if (allowReference && typeof value === 'string' && ALIAS.test(value)) return;

    const valid =
        isPlainObject(value) &&
        Object.keys(value).sort().join(',') === KEYS &&
        Number.isFinite(value.value) &&
        UNITS.has(value.unit);

    if (!valid) {
        throw new Error(
            `${path}: expected dimension { value: <finite number>, unit: "px" | "rem" }` +
                `${allowReference ? ' or a token reference' : ''}; received ${JSON.stringify(value)}`
        );
    }
};

const tokenPath = (token) => token.path?.join('.') ?? token.name ?? '<unknown token>';

export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-value/dimension',
        type: 'value',
        filter: (token) => (token.$type ?? token.type) === 'dimension',
        transform: (token, _config, options) => {
            const value = options?.usesDtcg ? token.$value : token.value;

            // Existing dimension strings remain supported. Objects must be complete and valid.
            if (typeof value === 'string') return value;

            assertDimension(value, tokenPath(token));

            return `${value.value}${value.unit}`;
        }
    });
};
