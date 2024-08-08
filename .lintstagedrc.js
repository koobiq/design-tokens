module.exports = {
    '*.{md,yml,json,js}': 'prettier --write',
    '*.js': 'eslint --max-warnings=0 --fix'
};
