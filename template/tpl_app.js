module.exports = `import * as Koa from 'koa';
import * as path from 'path';
import * as fs from 'fs';
import * as bodyParser from 'koa-bodyparser';
import * as ex from 'koa-exception';
import * as logger from './middleware/log';
import * as formParser from 'koa-router-form-parser';
import * as routerExt from './middleware/koa-router-ext';

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  await next();
});

app.use(logger());
app.use(ex('CN'));
app.use(bodyParser());
app.use(formParser());
app.use(routerExt());

const routerDir = path.join(__dirname, 'routes');

function readFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(routerDir, (err, files) => {
            resolve(files.filter((f) => {
                return f.endsWith('.js');
            }))
        });
    });
};

(async () => {
    let files = await readFiles();
    for (let file of files) {
        try {
            app.use(require(path.join(routerDir, file)).routes());
        } catch (error) {
            console.log(error);
            console.error(' ---> Start Failure, please check the config files.');
            process.exit(0);
        }
    }
})();

let port = process.env.NODE_PORT || 3000;
app.listen(port, function () {
    console.log(\` ---> Server running on port: \${port}\`);
});`;