export default (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/css',
        // No `color/css` here on purpose. Its v4+ filter is `$type === 'color'` plus "tinycolor2
        // can parse this value", so now that the sources carry DTCG types it starts firing. The
        // OKLch palette is safe (tinycolor2 does not parse `oklch()`), but `transparent` and
        // `#00000000` do parse, and it rewrites all 24 of them to `rgba(0, 0, 0, 0)`. Our values
        // are already valid CSS, so there is nothing to gain from the churn.
        transforms: [
            'attribute/cti',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'shadow/css/shorthand',
            'name/custom-kebab',
            'kbq-attribute/comment'
        ]
    });
};
