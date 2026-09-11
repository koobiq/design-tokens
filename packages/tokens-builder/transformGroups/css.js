export default (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/css',
        // No `color/css` here on purpose: its v4+ filter is `$type === 'color'`, so once the
        // sources carry DTCG types it would round-trip every OKLch value through
        // hex/rgba and flatten the wide-gamut palette. Values are already valid CSS.
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
