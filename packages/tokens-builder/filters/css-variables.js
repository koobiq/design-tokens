module.exports = (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'css-variables',
        matcher: (prop) => !prop.attributes.font && !prop.attributes.palette
    })
}
