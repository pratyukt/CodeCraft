const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Coding Platform API',
        version: '1.0.0',
        description: 'A comprehensive API for coding platform with authentication, problems, submissions, and AI chat',
        contact: {
            name: 'API Support',
            email: 'support@codingplatform.com'
        }
    },
    servers: [
        {
            url: process.env.NODE_ENV === 'production'
                ? 'https://your-production-domain.com'
                : `http://localhost:${process.env.PORT || 3000}`,
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: [
        './server.js',
        './routes/*.js'
    ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;