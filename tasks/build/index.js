import gulp from 'gulp';

gulp.task('build:dev', [
    'clean',
    'htmlprocess',
    'sass',
    'fonts',
    'image:dev',
    // 'bower',
    '6to5'
]);

gulp.task('build:dist', [
    // 'lint',
    'clean',
    'htmlprocess',
    'sass',
    'fonts',
    'image:dist',
    // 'bower',
    '6to5',
    'usemin',
    'clean:generated'
]);
