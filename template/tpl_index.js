module.exports =  `import * as Router from 'koa-router';

const router = new Router();

router.get('/', async ctx => {
    let params = ctx.query;
    ctx.body = { code: 200, msg: 'Hello Msg from Typescript.' };
});

export = router;`