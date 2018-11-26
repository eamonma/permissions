module.exports = function(grunt) {

  grunt.initConfig({
    cssmin: {
      build: {
        src: 'styles.css',
        dest: 'dist/styles.css'
      }
    },

    uglify: {
      build: {
        files: {
          'dist/app.js': ['app.js']
        }
      }
    }
  });

  grunt.registerTask("css", ["cssmin"]);
  grunt.registerTask("js", ["uglify"]);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');

};
