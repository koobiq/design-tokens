/**
 * Internal tokens: intermediate values that exist to be referenced and inherited, and that ship no
 * variable of their own on any platform.
 *
 * They are marked in the sources with `$extensions: { 'io.koobiq': { private: true } }`, on the
 * token or on its group, and normalised to a plain `private` key by preprocessors/private.js. The
 * filter that keeps them out of every output is composed in configs/index.js.
 */
export const isPrivate = (token) => token.private === true;
