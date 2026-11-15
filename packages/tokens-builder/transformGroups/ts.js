export default (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/ts',
        // `color/hex` and `size/px` are deliberately absent. Both used to match on
        // `attributes.category` and never fired here; in v4+ they match on `$type`:
        //   - `size/px` now matches every `dimension`, including `letter-spacing: normal`,
        //     where parseFloat gives NaN. That is 25 hard transform errors.
        //   - `color/hex` leaves OKLch alone (tinycolor2 cannot parse it) but rewrites
        //     `transparent` / `#00000000`.
        // Values already carry their units and are valid CSS as authored.
        transforms: ['attribute/cti', 'name/pascal', 'shadow/css/shorthand', 'kbq-attribute/comment']
    });
};
