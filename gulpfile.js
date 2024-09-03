
// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модули gulp-sass
const sass = require('gulp-sass');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем gulp-imagemin для работы с изображениями
const imagemin = require('gulp-imagemin');

// Подключаем модуль gulp-newer
const newer = require('gulp-newer');

// Подключаем модуль del
const del = require('del');

// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'dist/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

function html(){
	return src('app/index.html')
				.pipe(dest('dist/'))
				.pipe(browserSync.stream());
}

function scripts() {
	return src([ // Берём файлы из источников
		'node_modules/jquery/dist/jquery.min.js',
		'app/js/delighters.min.js',
    'app/js/jquery.fancybox.min.js',
		'app/js/slick.min.js',// Пример подключения библиотеки
		'app/js/slider.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('script.min.js')) // Конкатенируем в один файл
	.pipe(uglify()) // Сжимаем JavaScript
	.pipe(dest('dist/js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
	return src('app/scss/style.scss') // Выбираем источник: "app/sass/mstyle.scss"
	.pipe(sass({outputStyle: 'nested',}).on('error', sass.logError)) // Подключаем модули gulp-sass
	.pipe(concat('style.min.css')) // Конкатенируем в файл app.min.js
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('dist/css')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function libs(){
  return src([
    'app/libs/normalize.css',
		'app/libs/jquery.fancybox.min.css',
    'app/libs/slick.css',
  ])
    .pipe(concat('libs.min.css'))
    .pipe(dest('dist/libs'))
    .pipe(browserSync.stream())
}

function images() {
	return src('app/img/**') // Берём все изображения из папки источника // Проверяем, было ли изменено (сжато) изображение ранее
	.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
	.pipe(dest('dist/img/')) // Выгружаем оптимизированные изображения в папку назначения
}

function startwatch() {

	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);

	// Мониторим файлы препроцессора на изменения
	watch('app/**/*.scss', styles);

	// Мониторим файлы HTML на изменения
	watch('app/**/*.html', html);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/img/src/**/*', images);

}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

exports.html = html;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспортируем функцию libs() в таск libs
exports.libs = libs;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg


// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(html, styles, scripts, libs, images, browsersync, startwatch);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(html, styles, scripts, libs, images, browsersync, startwatch);
