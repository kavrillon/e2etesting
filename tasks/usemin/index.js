import gulp from 'gulp';
import usemin from 'gulp-usemin';
import minifyCss from 'gulp-cssnano';
import minifyHtml from 'gulp-minify-html';
import uglify from 'gulp-uglify';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import config from '../config';

gulp.task('minify', ['clean', 'sass', /*'bower',*/ '6to5'], () => {

    return gulp.src(`${config.paths.dist}/index.html`)
        .pipe(usemin({
            cssVendor: [minifyCss({zindex: false}), rev()],
            html: [minifyHtml({ empty: true })],
            cssApp: [minifyCss({zindex: false}), rev()],
            jsVendor: [uglify(), rev()],
            jsApp: [uglify(), rev()]
        }))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('usemin', ['minify', 'clean:bigs']);
