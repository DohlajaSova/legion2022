var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    nunjucksRender = require('gulp-nunjucks-render'),
    htmlhint = require("gulp-htmlhint"),
    del = require("del"),
    newer = require('gulp-newer'),
    pkg = require('./package.json'),
    preprocess = require('gulp-preprocess'),
    htmlclean = require('gulp-htmlclean'),
    deporder = require('gulp-deporder'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass')(require('sass')),
    minifyCss = require('gulp-clean-css'),
    connect = require('gulp-connect'),
    browserSync = require('browser-sync').create();
var
    source = 'src/',
    dest = 'build/',
    assets = 'assets/',
    images = { in : source + 'img/**/*',
            out: dest + assets + 'css/img/'
    },
    js = { in : source + 'js/**/*',
            out: dest + assets + 'js',
            filename: 'app.js'
    },

    devBuild = ((process.env.NODE_ENV || 'development').trim().toLocaleLowerCase() !== 'production'),
    devBuild=false;

    html = { in : source + 'pages/**/*.nunjucks)',
            watch: [source + 'pages/**/*', source + 'templates/**/*'],
            out: dest,
            context: {
                devBuild: devBuild,
                author: pkg.author,
                version: pkg.version
            }
    },
    css = { in : source + 'scss/*.scss',
            watch: source + 'scss/**/*',
            out: dest + assets + 'css/',
            sassOpt: {
                outpuStyle: 'nested',
                imagePath: '../img',
                precision: 3,
                errLogToConsole: true
            }
    },
    fonts = { in : source + 'fonts/*.*',
            out: dest + assets + 'css/fonts/'
    };

console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + '-build');

gulp.task('webserver', function(done) { 
  connect.server({ 
    root: './build',
    livereload: true, 
    port: 8080
  }); 
  done();
}); 


//объединение и перенос js
gulp.task('js', function () {
    if (devBuild) {
        return gulp.src(js.in)
            .pipe(gulp.dest(js.out));
    } else {
        return gulp.src(js.in)
            .pipe(deporder())
            .pipe(plugins.concat(js.filename))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(js.out));
    }
});

gulp.task('imagescss', function () {
    return gulp.src(source + 'img/*.*').pipe(newer(images.out)).pipe(gulp.dest(dest + assets + 'css/img'));

});
//оптимизация и перенос картинок
gulp.task('images', gulp.series('imagescss'), function () {
    return gulp.src(images.in).pipe(newer(images.out)).pipe(gulp.dest(images.out));
});

// очистка сборки
gulp.task('clean', function () {
    del([dest + "*"]);
});


gulp.task('html', function() {
  nunjucksRender.nunjucks.configure(['src/templates']);
  return gulp.src('src/pages/**/*.nunjucks')
  .pipe(nunjucksRender({
      path: 'src/templates'
    }))
    .pipe(htmlhint())//проверка на валидность
    .pipe(htmlhint.reporter())//если есть ошибки - сборка не проходит
  .pipe(gulp.dest('build'))
  .pipe(connect.reload());
});

gulp.task('sass', function () {
    return gulp.src(css.in)
		.pipe(sass(css.sassOpt).on('error', sass.logError))
    .pipe($.autoprefixer({ 
      overrideBrowserslist: ['last 2 versions', 'ie >= 11'] 
    })) 
    .pipe(rename('elegion.css'))
    .pipe(gulp.dest(css.out))
});

gulp.task('fonts', function () {
    return gulp.src(fonts.in).pipe(newer(fonts.out)).pipe(gulp.dest(fonts.out));
});

gulp.task('css', gulp.series('sass',  function () {
    if (!devBuild) {
        return gulp.src(dest + assets + 'css/*').pipe(minifyCss()).pipe(gulp.dest(dest + assets + 'css'));
    } else {
        return gulp.src('src/css/**/*').pipe(gulp.dest(dest + assets + 'css')).pipe(connect.reload());
    }
}));

gulp.task('browser-sync', function () {
    var files = [
      'build/*.html',
      'build/assets/css/**/*.css',
      'build/assets/img/**/*',
      'build/assets/js/**/*.js'
   ];

    browserSync.init(files, {
        server: {
            baseDir: './build'
        }
    });
});

gulp.task("default", gulp.series('images', 'html', 'js', 'fonts', 'css', 'webserver', function () {
    gulp.watch(html.watch, gulp.series('html'));
    gulp.watch(images.in, gulp.series('images'));
    gulp.watch(css.watch, gulp.series('css'));
    gulp.watch(js.in, gulp.series('js'));
    gulp.watch(fonts.in, gulp.series('fonts'));
}));
