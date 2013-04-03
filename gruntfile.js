 'use strict';

 module.exports = function (grunt) {

     // Project configuration.
     grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

         coffee: {
             compile: {
                 files: {
                     'bone.io.js': 'lib/index.coffee' // 1:1 compile

                 }
             }
         },
         uglify: {
             my_target: {
                 files: {
                     'bone.io.min.js': ['bone.io.js']
                 }
             }
         },

             watch: {
         files: ['lib/index.coffee'],
             tasks: ['coffee', 'uglify']
                }
            });

             // These plugins provide necessary tasks.
             grunt.loadNpmTasks('grunt-contrib-coffee');
             grunt.loadNpmTasks('grunt-contrib-uglify');
             grunt.loadNpmTasks('grunt-contrib-watch');

             // Default task.
             grunt.registerTask('default', ['coffee', 'uglify', 'watch']);

         };