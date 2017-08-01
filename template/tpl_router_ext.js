module.exports = `import * as redis from '../tools/redis';
import * as mongo from '../tools/mongo';
import * as config from '../conf/config';
import * as Router from 'koa-router';


let routerExt = () => {
    return async (ctx: Router.IRouterContext, next: () => Promise<any>) => {
        ctx.getUserInfo = function (): Promise<Router.UserCacheInfo> {
            return new Promise((resovle, reject) => {
                const token = ctx.cookies.get('sso-token');
                if (!token) {
                    let err = new Error('您还未登录!');
                    err.name = "token_error";
                    reject(err);
                }
                redis.get(redis.generateKey(token), (err: Error, value: string) => {
                    if (err || value == null) {
                        if (err) console.error(\`---> Redis 获取 Token异常: \${err} 将从Mongodb中获取...\`);
                        // get userinfo from mongodb by token string.
                        mongo.findDocument('users', { token: token, last_login: { $gte: new Date(new Date().getTime() - config.Redis.ttl * 1000) } }, (err, doc) => {
                            if (!doc) {
                                let err = new Error('登录信息已过期,请先登录!');
                                err.name = "token_error";
                                reject(err);
                            }
                            resovle(doc);
                        });
                    } else {
                        resovle(JSON.parse(value));
                    }
                });
            });
        };
        await next();
    }
}

export = routerExt;`