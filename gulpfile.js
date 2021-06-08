const {series, parallel, src, dest} = require('gulp')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const replace = require('gulp-replace')
const uglify = require('gulp-uglify')
const postcss = require('gulp-postcss')

/* Destination dir */

const destDir = './dist'

/* JS. Transpile with babel & minify */

const processJs = (baseName, isMin) => {
  let r = src('src/js/' + baseName + '.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))

  if (isMin) {
    r = r.pipe(uglify()).pipe(rename(baseName + '.min.js'))
  }

  return r.pipe(dest(destDir + '/js'))
}

const processJsMain = () => {
  return processJs('main')
}

const processJsMainMin = () => {
  return processJs('main', true)
}

const processJsChartSample = () => {
  return processJs('chart.sample')
}

const processJsChartSampleMin = () => {
  return processJs('chart.sample', true)
}

/* CSS */

const processCss = () => {
  return src('src/css/main.css')
    .pipe(postcss())
    .pipe(dest(destDir + '/css'))
}

/* HTML */
const dateNowMillis = Date.now()

const concatHtml = file => {
  const replaceHtmlClassWith = 'has-aside-left has-aside-mobile-transition has-navbar-fixed-top'

  const sources = [
    'src/html/parts/head.html',
    'src/html/parts/app-open.html',
    'src/html/parts/navbar.html',
    'src/html/parts/aside.html',
    'src/html/parts/title-bar.html',
    'src/html/parts/hero-bar.html',
    `src/html/${file}.html`,
    'src/html/parts/footer.html',
    'src/html/parts/sample-modal.html',
    'src/html/parts/app-close.html',
    'src/html/parts/bottom-scripts.html',
  ]

  if (file === 'index') {
    sources.push('src/html/parts/bottom-scripts-home.html')
  }

  sources.push('src/html/parts/bottom.html')

  const titleStrings = {
    tables: 'Tables',
    index: 'Dashboard',
    forms: 'Forms',
    profile: 'Profile'
  }

  const titleStringsLong = {
    tables: 'Responsive Tables'
  }

  const titleStringReplacement = titleStrings[file] ? titleStrings[file] : ''
  const titleStringLongReplacement = titleStringsLong[file] ? titleStringsLong[file] : titleStringReplacement

  return src(sources)
    .pipe(concat(`${file}.html`))
    .pipe(replace('--date-now-millis', dateNowMillis.toString()))
    .pipe(replace('--html-class', replaceHtmlClassWith))
    .pipe(replace('--stylesheet-min-path', `css/main.css?v=${dateNowMillis.toString()}`))
    .pipe(replace(`--set-active-${file}-html`, 'active'))
    .pipe(replace(/ --set-active-[a-z-]+/gi, ''))
    .pipe(replace('{{ titleString }}', titleStringReplacement))
    .pipe(replace('{{ titleStringLong }}', titleStringLongReplacement))
    .pipe(dest(destDir))
}

/* Img */

const copyImg = () => {
  return src('src/img/*')
    .pipe(dest(destDir + '/img'))
}

exports.default = series(
  parallel(
    () => concatHtml('index'),
    () => concatHtml('tables'),
    () => concatHtml('forms'),
    () => concatHtml('profile'),
  ),
  processJsMain,
  processJsMainMin,
  processJsChartSample,
  processJsChartSampleMin,
  copyImg,
  processCss
)
