module.exports = {
    '*': 'prettier --write --ignore-unknown',
    '*.js': 'eslint --max-warnings=0 --fix'
};
