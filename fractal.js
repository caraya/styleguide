'use strict';

/*
* Require the path module
*/
const path = require('path');

/*
 * Require the Fractal module
 */
const fractal = module.exports = require('@frctl/fractal').create();

fractal.set('project.title', 'Rivendellweb Style Guide');

fractal.components.set('path', path.join(__dirname, 'components'));
fractal.components.set('default.status', 'wip');

fractal.docs.set('path', path.join(__dirname, '/docs'));
fractal.web.set('builder.dest', __dirname + '/build');
fractal.web.set('static.path', path.join(__dirname, '/public'));

fractal.components.set('statuses', {
    idea: {
        label: "Idea",
        description: "Brainstorm. Do not implement",
        color: "#FF88FF"
    },
    prototype: {
        label: "Prototype",
            description: "Do not implement.",
            color: "#FF3333"
    },
    wip: {
        label: "WIP",
            description: "Work in progress. Implement with caution.",
            color: "#FF9233"
    },
    ready: {
        label: "Ready",
            description: "Ready to implement.",
            color: "#29CC29"
    }
});

fractal.docs.set('statuses', {
    draft: {
        label: 'Draft',
            description: 'Work in progress.',
            color: '#FF3333'
    },
    ready: {
        label: 'Ready',
            description: 'Ready for referencing.',
            color: '#29CC29'
    }
});
