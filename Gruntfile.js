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
        },

        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['mocha'],
                options: {
                    spawn: false,
                },
            },
        },
    });

    /////////////////////////////////////////////


    grunt.registerTask('default', ['uglify']);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    
    grunt.registerTask('mocha', ['mochaTest']);

};
