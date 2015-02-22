module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            specs: {
                options: {
                    ui: 'bdd',
                    reporter: 'spec',
                    require: './specs/helpers/chai'
                },
                src: ['specs/**/*.spec.js']
            }
        }
    });

    /////////////////////////////////////////////

    grunt.loadNpmTasks('grunt-mocha-test');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

    grunt.registerTask('mocha', ['mochaTest']);

};
