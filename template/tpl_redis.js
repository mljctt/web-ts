module.exports = `import * as Redis from 'ioredis';
import * as config from '../conf/config';

let cluster: Redis.Redis;

function init() {
    if (!cluster) {
        cluster = new Redis.Cluster(config.Redis.cluster, {
            // scaleReads: 'slave'
        });
    }
}

(() => {
    init();
})();

let r = {

    getClusterClient: () => {
        return cluster;
    },
    generateKey: (token: string) => {
        return 'token:' + token;
    },

    del: (key: string) => {
        cluster.del(key);
    },

    get: (key: string, callback: Redis.ResCallbackT<string>) => {
        cluster.get(key, (err, value) => {
            callback(err, value);
        });
    },

    // expires is an optional parameter.
    set: (key: string, value: any, expires: number, callback: Redis.ResCallbackT<any[]>) => {
        if (typeof expires === 'undefined') {
            cluster.set(key, value);
        } else {
            let pipeline = cluster.pipeline();
            pipeline.set(key, value).expire(key, expires).exec((err, results) => {
                if (err) {
                    console.error('--- redis set error:', err);
                }
                callback(err, results);
            });
        }
    },

    // 获取 hash_table 的 field
    hkeys: (key: string, callback: Redis.ResCallbackT<any[]>) => {
        cluster.hkeys(key, (err: Error, results: any[]) => {
            callback(err, results);
        });
    },

    // key => table_name , field => field
    hset: (key: string, field: string, value: any) => {
        cluster.hset(key, field, value);
    },

    // field:optional parameter.
    hget: (key: string, field: string, callback: Redis.ResCallbackT<any[]>) => {
        cluster.hget(key, field, (err: Error, value: any[]) => {
            callback(err, value);
        })
    },

    hgetall: (key: string, callback: Redis.ResCallbackT<any[]>) => {
        cluster.hgetall(key, (err: Error, results: any[]) => {
            callback(err, results);
        });
    },

    hmset: (key: string, map: any) => {
        cluster.hmset(key, map);
    }
};

export = r;
`