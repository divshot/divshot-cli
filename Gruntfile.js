module.exports = function(grunt) {
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // Lint it!
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '*.js',
        'lib/**/*.js',
        'test/**/*.js'
      ]
    },
    
    // Test runner
    mochaTest: {
      tests: {
        options: {
          reporter: 'spec',
          require: ['./test/test_config']
        },
        src: [__dirname + '/test/**/*.js']
      }
    },
    
    // Watch
    watch: {
      test: {
        files: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
        tasks: ['test']
      },
      jshint: {
        files: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
        tasks: ['jshint']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Run tests only
  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);
  
  // Tests with a watcher
  grunt.registerTask('test:watch', [
    'jshint',
    'mochaTest',
    'watch:test'
  ]);
};
