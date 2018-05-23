module.exports = `import * as Router from 'koa-router';
import * as dao from '../dao/$option';

const router = new Router({
        prefix: '/$option'
    });

router.get('/', async ctx => {
    let params = ctx.query;
    ctx.body = { code: 200, data: await dao.list(params) };
});

router.post('/', async ctx => {
    let data = ctx.request.body;
    await dao.create(data);
    ctx.body = { code: 200, msg: 'ok' };
});

router.put('/', async ctx => {
    let data = ctx.request.body;
    await dao.update(data);
    ctx.body = { code: 200, msg: 'ok' };
});

router.delete('/:id', async ctx => {
    let id = parseInt(ctx.params.id);
    await dao.delete(id);
    ctx.body = { code: 200, msg: 'ok' };
});
router.get('/:id', async ctx => {
    let doc = await dao.get({ id: parseInt(ctx.params.id) });    
    ctx.body = { code: 200, data: doc };
});

export = router;`