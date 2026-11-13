/**
 * True for the building blocks of the shadows: the offsets, blur, spread and colors that live in
 * shadows.json5 next to the composite shadows and mirror the Figma "Shadow" variables.
 *
 * They are sources only. The composite shadows (`$type: 'shadow'`) are what ships, with these
 * values already substituted (see formats/shadow-references.js), so none of them gets a CSS
 * variable, a Sass variable or a JS constant of its own.
 */
export const isShadowParameter = (token) => token.filePath?.includes('shadows.json5') && token.$type !== 'shadow';
