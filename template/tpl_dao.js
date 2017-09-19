module.exports = `import * as mongo from '../tools/mongo';
 import { ObjectID, InsertOneWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject } from 'mongodb';

let dao = {
    list: (params?: any): Promise<any> => {
        return new Promise(
            (resolve, reject) => {
                mongo.findDocuments('$option', params, (err, results) => {
                    resolve(results);
                });
            });
    },
    listAll: (params?: any): Promise<any> => {
        return new Promise(
            (resolve, reject) => {
                mongo.findAllDocuments('$option', params, (err, docs) => {
                    resolve(docs);
                });
            });
    },
    get: (param?: any): Promise<any> => {
        return new Promise(
            (resolve, reject) => {
                mongo.findDocument('$option', param, (err, doc) => {
                    resolve(doc);
                });
            });
    },
    create: (doc: any): Promise<InsertOneWriteOpResult> => {
        return new Promise(
            (resolve, reject) => {
                mongo.insertDocument('$option', doc, (err, result: InsertOneWriteOpResult) => {
                    if (err) reject("系统异常，新增失败!");
                    resolve(result);
                });
            });
    },
    update: (doc: any): Promise<UpdateWriteOpResult> => {
        return new Promise(
            (resolve, reject) => {
                mongo.updateDocument('$option', { _id: new ObjectID(doc._id) }, doc, (err, result: UpdateWriteOpResult) => {
                    if (err != null || result.result.n == 0) {
                        reject("系统异常,更新失败!");
                    } else {
                        resolve(result);
                    }
                });
            });
    },
    batchUpdateById: (docs: any[]): Promise<boolean> => {
        return new Promise(
            (resolve, reject) => {
                let db = mongo.getDB();
                let bulk = db.collection('$option').initializeUnorderedBulkOp();
                for (let doc of docs) {
                    let id = doc._id;
                    delete doc._id;
                    bulk.find({ _id: new ObjectID(id) }).updateOne({ $set: doc });
                }
                bulk.execute((err, result) => {
                    if (err) {
                        console.error('--->更新失败! %s => %s', err.name, err.message);
                        reject(new Error('系统异常,更新失败!'));
                    } else {
                        resolve(true);
                    }
                });
            });
    },
    delete: (id: string): Promise<DeleteWriteOpResultObject> => {
        return new Promise(
            (resolve, reject) => {
                mongo.removeDocument('$option', { _id: new ObjectID(id) }, (err, result: DeleteWriteOpResultObject) => {
                    if (err) reject("系统异常,删除失败!");
                    resolve(result);
                });
            });
    },
    batchDelete: (ids: string[]): Promise<DeleteWriteOpResultObject> => {
        let idArr: ObjectID[] = [];
        for (let id of ids) {
            idArr.push(new ObjectID(id));
        }
        return new Promise(
            (resolve, reject) => {
                mongo.removeDocuments('$option', { _id: { $in: idArr } }, (err, result: DeleteWriteOpResultObject) => {
                    if (err) reject("系统异常,批量删除失败!");
                    resolve(result);
                });
            });
    }
}
export = dao;
`