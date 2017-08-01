module.exports = `/**
  Create By brainqi@outlook.com  2016-08-12 09:40:00

  MongoDB common operation utils:
  - Insert One Document.
  - Insert Many Documents.
  - Find Document.
  - Find Specified Document.
  - Find All Documents with a Query Filter and Return results with page info.
  - Find All Documents with a Query Filter and without page query.
  - Find All Specified Documents with a Query Filter and without page query.
  - Find Specified Documents with a Query Filter and page query.
  - Find Doc count.
  - Update One Document.
  - Update Many Documents.
  - FindAndModify Documents.
  - Remove One Document.
  - Remove Many Document.
*/
import * as config from '../conf/config';
import * as time from './time';
import { MongoClient, Db, DeleteWriteOpResultObject, InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, UpdateWriteOpResult, InsertWriteOpResult, WriteOpResult } from "mongodb";
let db: Db;

async function _init() {
    if (!db) {
        let client = new MongoClient();
        db = await client.connect(config.Mongo.url);
    }
}

(async () => {
    await _init();
})();
/**
 * 通用回调函数
 */
interface CommonCB<T> {
    (err: Error, result: T): void;
}
interface PageResult {
    count: number,
    docs: any
}

let mgo = {
    /**
     * init 在web环境下，不要调用，这个方法用于一次性执行脚本时使用!
     */
    init: async () => {
        await _init();
    },
    /**
     * Get Mongo Database Instance.
     */
    getDB: () => {
        return db;
    },
    /** 
     * Insert one document.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} doc Inserted document.
     * @param {Function} callback callback(err,result).
    */
    insertDocument: (collectionName: string, doc: any, callback: CommonCB<InsertOneWriteOpResult>) => {
        let collection = db.collection(collectionName);
        doc.createAt = new Date();
        collection.insertOne(doc, (err, result) => {
            callback(err, result);
        });
    },

    // ---------------------------------------------------------------------------
    /**
     * Insert many documents.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Array} docs Inserted documents.
     * @param {Function} callback callback(err,result).
     */
    insertDocuments: (collectionName: string, docs: any[], callback: CommonCB<InsertWriteOpResult>) => {
        let collection = db.collection(collectionName);
        collection.insertMany(docs, (err, result) => {
            callback(err, result);
        });

    },

    // ---------------------------------------------------------------------------
    /**
     * Upsert document.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} upsertDoc Upserted document.
     * @param {Function} callback callback(err,result).
     */
    upsertDocument: (collectionName: string, queryDoc: any, upsertDoc: any, callback: CommonCB<WriteOpResult>) => {
        let collection = db.collection(collectionName);
        collection.update(queryDoc, upsertDoc, { upsert: true }, (err, result) => {
            callback(err, result);
        });
    },

    /**
     * Aggregate - Mongo aggregate framework
     * @param {string} collectionName - Mongodb collection name.
     * @param {Array} params - aggregate array params
     * @param {Function} callback - callback(err,result).
     */
    aggregate: (collectionName: string, params: any, callback: CommonCB<any[]>) => {
        let collection = db.collection(collectionName);
        collection.aggregate(params, (err, docs) => {
            callback(err, docs);
        });
    },

    /**
     * Aggregate For $lookup
     * 
     * @param {string} collectionName - collection name
     * @param {Object} lookupDoc - { from: <collection to join>, localField: <field from the input documents>, foreignField: <field from the documents of the "from" collection>, as: <output array field>}
     * @param {Object} matchDoc - like having or where in SQL
     * @param {Object} pageDoc - page params.
     * @param {Function} callback - callback function return err,docs
     */
    aggregateForLookup: (collectionName: string, lookupDoc: any, matchDoc: any, pageDoc: any, callback: CommonCB<PageResult>) => {
        let page = pageDoc.page == null ? 1 : parseInt(pageDoc.page);
        let size = pageDoc.size == null ? 20 : parseInt(pageDoc.size);
        size = size > 200 ? 200 : size; // API speed limit for 200 records/times
        let skip = (page - 1) * size;
        let collection = db.collection(collectionName);
        collection.aggregate([
            { $lookup: lookupDoc }, { $match: matchDoc == null ? {} : matchDoc }, { $skip: skip }, { $limit: size }
        ], (err, docs) => {
            collection.count(matchDoc, (err, count) => {
                callback(err, { docs: docs, count: count });
            });
        });
    },

    /**
     * Find One Document.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Function} callback callback(doc).
     */
    findDocument: (collectionName: string, queryDoc: any, callback: CommonCB<any>) => {
        let collection = db.collection(collectionName);
        collection.findOne(queryDoc, (err, doc) => {
            callback(err, doc);
        });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find Specified Document.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} specifiedDoc Specified returned document. For example: {name: 1, passwd:0} name returned and passwd not.
     * @param {Function} callback callback(doc).
     */
    findSpecifiedDocument: (collectionName: string, queryDoc: any, specifiedDoc: any, callback: CommonCB<any>) => {
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.findOne(queryDoc, specifiedDoc, (err, doc) => {
            callback(err, doc);
        });
    },

    // ---------------------------------------------------------------------------
    /**
     * Find All Documents with a Query Filter and Return results with page info.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Function} callback callback(results).
     */
    findDocuments: (collectionName: string, queryDoc: any, callback: CommonCB<PageResult>) => {
        queryDoc = queryDoc == null ? {} : queryDoc;
        let page = queryDoc.page == null ? 1 : parseInt(queryDoc.page);
        let size = queryDoc.size == null ? 20 : parseInt(queryDoc.size);
        size = size > 200 ? size : size; // API speed limit for 200 records/times
        let skip = (page - 1) * size;
        delete queryDoc.page;
        delete queryDoc.size;
        delete queryDoc.timestamp;
        for (let pro in queryDoc) {
            if (!queryDoc[pro] && queryDoc[pro] !== 0) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        // desc by create time.
        collection.find(queryDoc)
            .sort({ createAt: -1 })
            .skip(skip)
            .limit(size)
            .toArray(
            (err, docs) => {
                collection.count(queryDoc,
                    (err, count) => {
                        for (let doc of docs) {
                            doc.createAt = time.format(doc.createAt);
                            doc.updateAt == null ? '' : doc.updateAt = time.format(doc.updateAt);
                        }
                        callback(err, { count: count, docs: docs });
                    });
            });
    },

    // ---------------------------------------------------------------------------
    /**
     * Find All Documents with a Query Filter and without page query.
     */
    findAllDocuments: (collectionName: string, queryDoc: any, callback: CommonCB<any>) => {
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.find(queryDoc)
            .toArray((err, docs) => {
                callback(err, docs);
            });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find All Documents with a sorted document and a Query Filter and without page query.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} sortDoc Sort document.
     * @param {Function} callback callback(docs).
     */
    findAllDocumentsSorted: (collectionName: string, queryDoc: any, sortDoc: any, callback: CommonCB<any>) => {
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.find(queryDoc)
            .sort(sortDoc)
            .toArray((err, docs) => {
                callback(err, docs);
            });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find All Specified Documents with a Query Filter and without page query.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} specifiedDoc Specified returned document. For example: {name: 1, passwd:0} name returned and passwd not.
     * @param {Function} callback - callback(doc).
     */
    findAllSpecifiedDocuments: (collectionName: string, queryDoc: any, specifiedDoc: any, callback: CommonCB<any>) => {
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.find(queryDoc, specifiedDoc)
            .toArray((err, docs) => {
                callback(err, docs);
            });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find Specified Documents with a Query Filter and page query.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} specifiedDoc Specified returned document. For example: {name: 1, passwd:0} name returned and passwd not.
     * @param {Function} callback callback(doc).
     */
    findSpecifiedDocuments: (collectionName: string, queryDoc: any, specifiedDoc: any, callback: CommonCB<PageResult>) => {
        queryDoc = queryDoc == null ? {} : queryDoc;
        let page = queryDoc.page == null ? 1 : parseInt(queryDoc.page);
        let size = queryDoc.size == null ? 20 : parseInt(queryDoc.size);
        size = size > 200 ? 200 : size; // API speed limit for 200 records/times
        let skip = (page - 1) * size;
        delete queryDoc.page;
        delete queryDoc.size;
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.find(queryDoc, specifiedDoc)
            .sort({ createAt: -1 })
            .skip(skip)
            .limit(size)
            .toArray(
            (err, docs) => {
                collection.count(queryDoc,
                    (err, count) => {
                        let results = {};
                        for (let doc of docs) {
                            doc.createAt = time.format(doc.createAt);
                            doc.updateAt == null ? '' : doc.updateAt = time.format(doc.updateAt);
                        }
                        callback(err, { count: count, docs: docs });
                    });
            });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find Specified Sorted Documents with a Query Filter and page query.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} specifiedDoc Specified returned document. For example: {name: 1, passwd:0} name returned and passwd not.
     * @param {Object} sortDoc Sort document.
     * @param {Function} callback callback(results).
     */
    findSpecifiedSortedDocuments: (collectionName: string, queryDoc: any, specifiedDoc: any, sortDoc: any, callback: CommonCB<PageResult>) => {
        queryDoc = queryDoc == null ? {} : queryDoc;
        let page = queryDoc.page == null ? 1 : parseInt(queryDoc.page);
        let size = queryDoc.size == null ? 20 : parseInt(queryDoc.size);
        size = size > 200 ? 200 : size; // API speed limit for 200 records/times
        let skip = (page - 1) * size;
        delete queryDoc.page;
        delete queryDoc.size;
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);

        collection.find(queryDoc, specifiedDoc)
            .sort(sortDoc)
            .skip(skip)
            .limit(size)
            .toArray(
            (err, docs) => {
                collection.count(queryDoc,
                    (err, count) => {
                        let results = {};
                        for (let doc of docs) {
                            doc.createAt = time.format(doc.createAt);
                            doc.updateAt == null ? '' : doc.updateAt = time.format(doc.updateAt);
                        }
                        callback(err, { count: count, docs: docs });
                    });
            });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find All Specified Sorted Documents without page Filter query.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} specifiedDoc Specified returned document. For example: {name: 1, passwd:0} name returned and passwd not.
     * @param {Object} sortDoc Sort document.
     * @param {Function} callback callback(docs).
     */
    findAllSpecifiedSortedDocuments: (collectionName: string, queryDoc: any, specifiedDoc: any, sortDoc: any, callback: CommonCB<any>) => {
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.find(queryDoc, specifiedDoc)
            .sort(sortDoc)
            .toArray(
            (err, docs) => {
                callback(err, docs);
            });
    },
    // ---------------------------------------------------------------------------
    /**
     * Find Doc count.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Function} callback callback(results).
     */
    findCount: (collectionName: string, queryDoc: any, callback: CommonCB<number>) => {
        for (let pro in queryDoc) {
            if (!queryDoc[pro]) // delete null property.
                delete queryDoc[pro];
        }
        let collection = db.collection(collectionName);
        collection.count(queryDoc, (err, count) => {
            callback(err, count);
        })
    },
    // ---------------------------------------------------------------------------
    /**
     * Update one document.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} conditionDoc Update condition document.
     * @param {Object} sortDoc Sort document.
     * @param {Function} callback callback(err,result).
     */
    updateDocument: (collectionName: string, conditionDoc: any, updatedDoc: any, callback: CommonCB<UpdateWriteOpResult>) => {
        let collection = db.collection(collectionName);
        let update_doc = null;
        delete updatedDoc._id; // don't update _id & createAt field.
        delete updatedDoc.createAt;
        if (updatedDoc.hasOwnProperty('$push') || updatedDoc.hasOwnProperty('$pull') || updatedDoc.hasOwnProperty('$unset')) {
            update_doc = updatedDoc;
        } else {
            updatedDoc.updateAt = new Date();
            update_doc = { $set: updatedDoc };
        }
        collection.updateOne(conditionDoc, update_doc, (err, result) => {
            callback(err, result);
        });
    },
    // ---------------------------------------------------------------------------
    /**
     * Update many documents.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} conditionDoc Update condition document.
     * @param {Object} updatedDoc Updated document.
     * @param {Function} callback callback(err,result).
     */
    updateDocuments: (collectionName: string, conditionDoc: any, updatedDoc: any, callback: CommonCB<UpdateWriteOpResult>) => {
        updatedDoc.updateAt = new Date();
        let collection = db.collection(collectionName);
        delete updatedDoc._id; // don't update _id & createAt field.
        delete updatedDoc.createAt;
        collection.updateMany(conditionDoc, { $set: updatedDoc }, (err, result) => {
            callback(err, result);
        });
    },
    // ---------------------------------------------------------------------------
    /**
     * findAndModify requires a sort parameter. 
     * 
     * The {new: true} option will return the updated document when boolean true. 
     * If set to false, it will return the old document before update. 
     * 
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} queryDoc Query document.
     * @param {Object} sortDoc Sort document.
     * @param {Object} updateDoc Update document.
     * @param {Function} callback callback(err,result).
     */
    FindAndModifyDocument: (collectionName: string, queryDoc: any, sortDoc: any, updateDoc: any, callback: CommonCB<FindAndModifyWriteOpResultObject>) => {
        let collection = db.collection(collectionName);
        if (sortDoc) {
            collection.findOneAndUpdate(queryDoc, updateDoc, sortDoc, (err, result) => {
                callback(err, result);
            });
        } else {
            collection.findOneAndUpdate(queryDoc, updateDoc, (err, result) => {
                callback(err, result);
            });
        }

    },
    // ---------------------------------------------------------------------------
    /**
     * Remove one document.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} doc Remove document.
     * @param {Function} callback callback(err,result).
     */
    removeDocument: (collectionName: string, doc: any, callback: CommonCB<DeleteWriteOpResultObject>) => {
        let collection = db.collection(collectionName);
        collection.deleteOne(doc, (err, result) => {
            callback(err, result);
        });
    },
    // ---------------------------------------------------------------------------
    /**
     * Remove Many documents.
     * 
     * @param {string} collectionName Mongodb collection name.
     * @param {Object} doc Remove document.
     * @param {Function} callback callback(err,result).
     */
    removeDocuments: (collectionName: string, doc: any, callback: CommonCB<DeleteWriteOpResultObject>) => {
        let collection = db.collection(collectionName);
        collection.deleteMany(doc, (err, result) => {
            callback(err, result);
        });
    }
};

export = mgo;`