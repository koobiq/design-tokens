export default (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/ts',
        // `color/hex` and `size/px` are deliberately absent. Both used to match on
        // `attributes.category` and never fired here; in v4+ they match on `$type`, where
        // `color/hex` would flatten OKLch to hex and `size/px` would throw on keyword
        // dimensions like `letter-spacing: normal`. Values already carry their units.
        transforms: ['attribute/cti', 'name/pascal', 'kbq-attribute/comment']
    });
};
