module.exports = `import * as mysql from '../tools/mysql';

let dao = {
    list: (params: any) => {
        return new Promise(
            (resolve, reject) => {
                mysql.list('$option', params, (err: any, res: any) => {
                    if (err) reject(new Error('查询失败，系统异常!'));
                    resolve(res);
                });
            }
        )
    },
    get: (params: any) => {
        return new Promise(
            (resolve, reject) => {
                mysql.findOne('$option', params, (err: any, res: any) => {
                    if (err) reject(new Error('查询失败，系统异常!'));
                    resolve(res);
                })
            });
    },
    create: (params: any) => {
        return new Promise(
            (resolve, reject) => {
                mysql.insert('$option', params, (err: any, res: any) => {
                    if (err) reject(new Error("保存失败，系统异常!"));
                    resolve(res);
                })
            }
        )
    },
    update: (params: any) => {
        return new Promise(
            (resolve, reject) => {
                if (!params.id) reject(new Error('id 为必传参数'));
                mysql.updateById('$option', params, (err: any, res: any) => {
                    if (err) reject(new Error("更新失败，系统异常!"));
                    resolve(res);
                });
            }
        )
    },
    /**
     * soft delete.
    */
    delete: (id: Number) => {
        return new Promise(
            (resolve, reject) => {
                if (!id) reject(new Error('id 为必传参数'));
                mysql.updateById('$option', id, (err: any, res: any) => {
                    if (err) reject(new Error("删除失败，系统异常!"));
                    resolve(res);
                });
            }
        )
    }
}
export = dao;
`;