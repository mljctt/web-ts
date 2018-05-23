#!/usr/bin/env node

const fs = require('fs'),
    path = require('path'),
    tpl = require(path.join(__dirname, 'template', 'tpl.js')),
    pwd = process.cwd(),
    operation = process.argv[2],
    option = process.argv[3],
    db_type = process.argv[4],
    exec = require('child_process').exec;
project_name = path.basename(pwd);
let pkg = require(path.join(__dirname, 'package.example.json'));
let tsconfig = require(path.join(__dirname, 'tsconfig.example.json'));

if (!operation || (operation !== 'init' && !option)) {
    usage_info();
    process.exit(0);
}
switch (operation) {
    case 'init':
        init();
        break;
    case 'new':
        new_module(option);
        break;
    case 'delete':
        delete_module(option);
        break;
    default:
        usage_info();
        break;
}

function usage_info() {
    const usage = `Usage: web-ts operation [init | new | delete] option [module_name] [databse_type]\n\nExample:\n\t web-ts init \t\t\t Create a api project named current dir.\n\t web-ts new users \t\t Create src/routes/users.ts and src/dao/users.ts files.\n\t web-ts new users mysql \t Create users module with DB base on mysql.\n\t web-ts delete users \t\t Delete src/routes/users.ts and src/dao/users.ts files.`;
    console.log(usage);
}

/**
 * init project.
 */
async function init() {
    await init_dir();
    await init_file();
    await init_dependencies();
    await installDependencies();
}

/**
 * create route and dao files.
 */
async function new_module(option) {
    await new_route(option);
    await new_dao(option);
}

/**
 * delete route and dao files.
 */
async function delete_module(option) {
    await del_route(option);
    await del_dao(option);
}

async function del_route(option) {
    await new Promise((resolve, reject) => {
        fs.unlink(path.join(pwd, 'src', 'routes', option + '.ts'), (err) => { // asynchronous delete
            console.log(` ---> Delete File\tsrc/routes/${option}.ts \tsuccess...`);
            resolve();
        });
    });
}

async function del_dao(option) {
    await new Promise((resolve, reject) => {
        fs.unlink(path.join(pwd, 'src', 'dao', option + '.ts'), (err) => { // asynchronous delete
            console.log(` ---> Delete File\tsrc/dao/${option}.ts\tsuccess...`);
            resolve();
        });
    });
}

async function new_route(option) {
    await new Promise((resolve, reject) => {
        if (db_type && db_type == 'mysql') {
            fs.writeFile(path.join(pwd, 'src', 'routes', option + '.ts'), tpl.mysql_router.replace(/\$option/g, option), (err) => {
                if (err)
                    throw err;
                console.log(` ---> Create File\tsrc/routes/${option}.ts\tsuccess...`);
                resolve();
            });
        } else {
            fs.writeFile(path.join(pwd, 'src', 'routes', option + '.ts'), tpl.base_router.replace(/\$option/g, option), (err) => {
                if (err)
                    throw err;
                console.log(` ---> Create File\tsrc/routes/${option}.ts \tsuccess...`);
                resolve();
            });
        }
    });
}

async function new_dao(option) {
    await new Promise((resolve, reject) => {
        if (db_type && db_type == 'mysql') {
            let tableName = option.replace(/-/g, '_');
            fs.writeFile(path.join(pwd, 'src', 'dao', option + '.ts'), tpl.mysql_dao.replace(/\$option/g, tableName), (err) => {
                if (err)
                    throw err;
                console.log(` ---> Create File\tsrc/dao/${option}.ts\tsuccess...`);
                resolve();
            });
        } else {
            fs.writeFile(path.join(pwd, 'src', 'dao', option + '.ts'), tpl.base_dao.replace(/\$option/g, option), (err) => {
                if (err)
                    throw err;
                console.log(` ---> Create File\tsrc/dao/${option}.ts\tsuccess...`);
                resolve();
            });
        }
    });
}

/**
 * create route,dao,middleware and conf dir.
 */
async function init_dir() {

    // mkdir src first.
    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'dist'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tdist\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src', 'types'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc/types\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src', 'routes'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc/routes\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src', 'dao'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc/dao\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src', 'middleware'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc/middleware\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src', 'conf'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc/conf\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.mkdir(path.join(pwd, 'src', 'tools'), (err) => {
            if (err && err.code !== 'EEXIST')
                throw err;
            console.log(' ---> Create Directory\tsrc/tools\t\t\tsuccess...');
            resolve();
        });
    });
}

async function init_file() {
    /**
     * create app.ts and write tpl code into it.
     */
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'app.ts'), tpl.app, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/app.ts\t\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'routes', 'index.ts'), tpl.index, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/routes/index.ts \tsuccess...');
            resolve();
        });
    });

    /**
     * create middleware/log.ts
     */
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'middleware', 'log.ts'), tpl.log, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/middleware/log.ts \tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'middleware', 'koa-router-ext.ts'), tpl.koa_router_ext, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/middleware/koa-router-ext.ts \tsuccess...');
            resolve();
        });
    });

    /**
     * create config.ts | db_development.ts | db_production.ts | db_staging.ts
     */
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'conf', 'config.ts'), tpl.config, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/conf/config.ts\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'conf', 'db_development.ts'), tpl.db_development, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/conf/db_development.ts \tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'conf', 'db_staging.ts'), tpl.db_staging, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/conf/db_staging.ts \tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'conf', 'db_production.ts'), tpl.db_production, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/conf/db_production.ts \tsuccess...');
            resolve();
        });
    });

    /**
     * create mongo.ts | redis.ts | qiniu.ts | mysql.ts
     */
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'tools', 'mongo.ts'), tpl.mongo, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/tools/mongo.ts\t\tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'tools', 'redis.ts'), tpl.redis, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/tools/redis.ts\t\tsuccess...');
            resolve();
        });
    });

    // await new Promise((resolve, reject) => {
    //     fs.writeFile(path.join(pwd, 'src', 'tools', 'qiniu.ts'), tpl.qiniu, (err) => {
    //         if (err)
    //             throw err;
    //         console.log(' ---> Create File\tsrc/tools/qiniu.ts\t\tsuccess...');
    //         resolve();
    //     });
    // });

    // await new Promise((resolve, reject) => {
    //     fs.writeFile(path.join(pwd, 'src', 'tools', 'mysql.ts'), tpl.mysql, (err) => {
    //         if (err)
    //             throw err;
    //         console.log(' ---> Create File\tsrc/tools/mysql.ts\t\tsuccess...');
    //         resolve();
    //     });
    // });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'tools', 'security.ts'), tpl.tools, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/tools/security.ts \tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'tools', 'time.ts'), tpl.tools_time, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/tools/time.ts \tsuccess...');
            resolve();
        });
    });

    // ------------- d.ts
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'types', 'koa-router.d.ts'), tpl.d_ts_koaRouter, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/types/koa-router.d.ts \tsuccess...');
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'types', 'grpc-sdk-client.d.ts'), tpl.d_ts_grpc, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/types/grpc-sdk-client.d.ts \tsuccess...');
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'types', 'koa-exception.d.ts'), tpl.d_ts_exception, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/types/koa-exception.d.ts \tsuccess...');
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'src', 'types', 'koa-router-form-parser.d.ts'), tpl.d_ts_formParser, (err) => {
            if (err)
                throw err;
            console.log(' ---> Create File\tsrc/types/koa-router-form-parser.d.ts \tsuccess...');
            resolve();
        });
    });
}

/**
 * add dependencies to package.json
 */
async function init_dependencies() {
    pkg.devDependencies = {
            "@types/ioredis": "0.0.24",
            "@types/koa": "^2.0.39",
            "@types/koa-bodyparser": "^3.0.23",
            "@types/moment-timezone": "^0.2.34",
            "@types/mongodb": "^2.2.7",
            "@types/node": "^8.0.17",
            "gulp": "^3.9.1"
        },
        pkg.dependencies = {
            "grpc-sdk-client": "^2.0.3",
            "ioredis": "^3.1.2",
            "koa": "^2.3.0",
            "koa-bodyparser": "^4.2.0",
            "koa-exception": "^2.0.3",
            "koa-router": "^7.2.1",
            "koa-router-form-parser": "^0.1.2",
            "moment-timezone": "^0.5.13",
            "mongodb": "^2.2.30"
        }
    pkg.name = project_name;
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'package.json'), JSON.stringify(pkg, null, 4), (err) => {
            if (err)
                throw err;
            console.log(' ---> Add dependencies \tsuccess...');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(pwd, 'tsconfig.json'), JSON.stringify(tsconfig, null, 4), (err) => {
            if (err)
                throw err;
            console.log(' ---> Add tsconfig.json \tsuccess...');
            resolve();
        });
    });
}

async function installDependencies() {
    await new Promise(
        (resolve, reject) => {
            console.log(' ---> Installing Dependency ...');
            exec('npm i', (error, stdout, stderr) => {
                if (stderr) console.error("  ---> Installing Failure: ", stderr);
                else console.log(stdout);
                resolve();
            });
        }
    )
}