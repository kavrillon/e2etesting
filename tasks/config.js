const base = 'src';

const ports = {
    dev: 8080
};

const paths = {
    app: `${base}/`,
    bowerComponents: `${base}/bower_components`,
    dist: 'dist',
    fonts: `${base}/assets/fonts`,
    images: `${base}/assets/images`,
    index: `${base}/index.html`
};

const globs = {
    repo: 'https://github.com/kavrillon/fo-checker.git',
    bower: `${paths.bowerComponents}/**/*`,
    fonts: `${paths.fonts}/**/*`,
    html: `${paths.app}/**/*.html`,
    images: `${paths.images}/**/*`,
    js: `${paths.app}/**/*.js`,
    scss: `${paths.app}/**/*.scss`
};

module.exports = {
    base: base,
    globs: globs,
    paths: paths,
    ports: ports
};
