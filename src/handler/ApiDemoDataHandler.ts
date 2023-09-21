import { RouteHandler } from '@orbstation/route/RouteHandler'

const ApiDemoDataHandler: RouteHandler = async(_req, res) => {
    return res.send({
        'javascript_history': {
            'birth': {
                'year': 1995,
                'founder': 'Brendan Eich',
                'description': 'JavaScript was created to add basic interactivity to web pages.',
            },
            'dynamic_web': {
                'libraries': ['jQuery', 'Prototype', 'MooTools'],
                'description': 'Libraries like jQuery and others brought dynamic capabilities to JavaScript, simplifying web development.',
            },
            'nodejs_revolution': {
                'year': 2009,
                'founder': 'Ryan Dahl',
                'description': 'Node.js introduced server-side JavaScript, with a focus on non-blocking, event-driven architecture for scalability.',
            },
            'ecmascript_standard': {
                'year': 1997,
                'description': 'ECMAScript standardizes JavaScript, ensuring consistency across implementations and enabling continuous evolution.',
            },
            'reactjs_innovation': {
                'year': 2013,
                'founder': 'Facebook',
                'description': 'ReactJS introduced component-based UI development and a virtual DOM for efficient rendering.',
            },
        },
        'modern_javascript': {
            'esm_power': {
                'year': 2015,
                'features': ['import', 'export'],
                'description': 'ECMAScript 6 (ES6) brought modular coding with the \'import\' and \'export\' statements.',
            },
            'reactjs_excellence': {
                'description': 'ReactJS offers a component-based UI architecture and speedy virtual DOM rendering.',
            },
        },
        'reactjs_everywhere': {
            'description': 'ReactJS is widely used today for both client and server-side rendering, enabling isomorphic applications for speed and SEO-friendliness.',
        },
    })
}

export default ApiDemoDataHandler
