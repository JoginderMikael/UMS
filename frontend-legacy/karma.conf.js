// Karma configuration

module.exports = function (config) {
  config.set({
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // Mock environment setup if needed

      // App Source files (must be loaded as modules but only when imported by specs)
      { pattern: 'scripts/**/*.js', type: 'module', included: false },
      { pattern: 'admin/**/*.js', type: 'module', included: false },
      { pattern: 'faculty/**/*.js', type: 'module', included: false },
      { pattern: 'student/**/*.js', type: 'module', included: false },

      // Test specs
      { pattern: 'test/spec/admin/**/*.js', type: 'module' },
      { pattern: 'test/spec/faculty/**/*.js', type: 'module' },
      { pattern: 'test/spec/student/**/*.js', type: 'module' },
      { pattern: 'test/spec/scripts/**/*.js', type: 'module' },
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    preprocessors: {
      'admin/**/*.js': ['coverage'],
      'faculty/**/*.js': ['coverage'],
      'student/**/*.js': ['coverage'],
      'scripts/**/*.js': ['coverage']
    },

    // test results reporter to use
    reporters: ['progress', 'coverage'],

    // coverage config
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'text' }
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // enable / disable watching file
    autoWatch: false,

    // start these browsers
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    singleRun: true,

    // Concurrency level
    concurrency: Infinity
  })
}
