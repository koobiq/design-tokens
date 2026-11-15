import { getReferences } from 'style-dictionary/utils';
import { isPrivate } from '../filters/private.js';

/**
 * True when the value of a token points at a private token, which has no variable to point at.
 *
 * A private token is filtered out of every file, so it is found only in `unfilteredTokens`, the whole
 * dictionary. References to other shipped tokens are still written as `var()`, across files on purpose.
 * A reference to a private token is written as its value instead.
 */
export const referencesPrivate = (token, { dictionary, usesDtcg }) => {
    const original = usesDtcg ? token.original.$value : token.original.value;

    return getReferences(original, dictionary.tokens, {
        unfilteredTokens: dictionary.unfilteredTokens,
        usesDtcg,
        warnImmediately: false
    }).some(isPrivate);
};
