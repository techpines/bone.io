
module.exports = (grunt) ->
    
    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON("package.json")
        coffee: compileJoined:
            options: bare: true
            files:
                "bone.io.js": [
                    "lib/client/index.coffee"
                    "lib/client/history.coffee"
                    "lib/client/view.coffee"
                    "lib/client/io.coffee"
                    "lib/client/router.coffee"
                ]
        uglify:
            my_target:
                files:
                    "bone.io.min.js": ["bone.io.js"]

        watch:
            files: ["lib/client/*.coffee"]
            tasks: ["default"]

    
    # These plugins provide necessary tasks
    grunt.loadNpmTasks "grunt-contrib-coffee"
    grunt.loadNpmTasks "grunt-contrib-uglify"
    grunt.loadNpmTasks "grunt-contrib-watch"
    
    # Default task
    grunt.registerTask "default", ["coffee", "uglify"]

    # Watch task
    grunt.registerTask "dev", ["coffee", "uglify", "watch"]

    
