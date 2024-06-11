module.exports = (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'css-variables',
        matcher: (prop) => {
            return !prop.attributes.font && !prop.attributes.palette && !prop.attributes.light && !prop.attributes.dark
        }
    })

    StyleDictionary.registerFilter({
        name: 'css-variables-light',
        matcher: (prop) => prop.attributes.light
    })

    StyleDictionary.registerFilter({
        name: 'css-variables-dark',
        matcher: (prop) => prop.attributes.dark
    })
}
