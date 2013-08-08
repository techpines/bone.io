
module.exports = (grunt) ->
    
    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON "./package.json"
        coffee: compileJoined:
            options: bare: true
            files:
                "bone.io.js": [
                    "lib/browser/index.coffee"
                    "lib/browser/config.coffee"
                    "lib/browser/util.coffee"
                    "lib/browser/io.coffee"
                    "lib/browser/history.coffee"
                    "lib/browser/view.coffee"
                    "lib/browser/router.coffee"
                    "lib/browser/mount.coffee"
                ]
        uglify:
            my_target:
                files:
                    "bone.io.min.js": ["bone.io.js"]

        watch:
            files: ["lib/browser/*.coffee"]
            tasks: ["default"]

    
    # These plugins provide necessary tasks
    grunt.loadNpmTasks "grunt-contrib-coffee"
    grunt.loadNpmTasks "grunt-contrib-uglify"
    grunt.loadNpmTasks "grunt-contrib-watch"
    
    # Default task
    grunt.registerTask "default", ["coffee", "uglify"]

    # Watch task
    grunt.registerTask "dev", ["coffee", "uglify", "watch"]

    
