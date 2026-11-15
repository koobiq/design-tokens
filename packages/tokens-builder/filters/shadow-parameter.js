/**
 * The colour roles of a theme: `shadow.light|dark.outline|key|ambient`. They are the public
 * `--kbq-shadow-outline|key|ambient` variables, which the composite shadows and products use, so they
 * ship like any other colour role. Sitting directly under a theme, they are the only colour tokens of
 * shadows.json5 that are not parameters.
 */
export const isShadowRole = (token) =>
    token.path?.[0] === 'shadow' && token.path.length === 3 && token.$type === 'color';

/**
 * True for the building blocks of the shadows that live in shadows.json5 next to the composite shadows:
 * the base offsets, blur, spread and colors of each layer, per theme. They mirror the Figma "Shadow"
 * variables.
 *
 * They are sources only. The composite shadows (`$type: 'shadow'`) are what ships, with these values
 * already substituted (see formats/shadow-references.js), so none of them gets a CSS variable, a Sass
 * variable or a JS constant of its own.
 */
export const isShadowParameter = (token) =>
    token.filePath?.includes('shadows.json5') && token.$type !== 'shadow' && !isShadowRole(token);
