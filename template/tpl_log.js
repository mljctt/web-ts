module.exports = `import * as Router from 'koa-router';

let logger = function () {
    return async (ctx: Router.IRouterContext, next: () => Promise<any>) => {
        let start = new Date().getTime();
        await next();
        if (ctx.path === '/favicon.ico') {
            ctx.response.status = 200;
        } 
        let ms = new Date().getTime() - start;
        console.log(\`[32m \${new Date().toLocaleDateString()} \${new Date().toLocaleTimeString()} - [1m \${ctx.method} \${ctx.status} [0m [36m \${ctx.url} [0m - [33m \${ms} ms [0m\`);
    }
}

export = logger;`