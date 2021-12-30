import Config from "../common/config";
import { ListOperations } from "./list-services";

export default class DexieServices {
  private config = new Config();
  private listOps = new ListOperations();

  public getMasterInfo(db, table, listname) {
    return new Promise((resolve, reject) => {
      db.table(table)
        .where(this.config.KEYCOLUMNLISTNAME)
        .equals(listname)
        .toArray()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }

  public getTableSchema(url: string) {
    return new Promise((resolve, reject) => {
      this.listOps
        .getConfigListColumns(url)
        .then(async (data: any) => {
          if (data.length > 0) {
            resolve(data);
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public async createDBTable(tableSchema, db) {
    let currentVersion = db.verno;
    let newVersion = currentVersion + 1;
    return new Promise((resolve, reject) => {
      db.version(newVersion).stores(tableSchema);
      db.open()
        .then((success) => {
          resolve(success);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public addBulkDataToIndexedDBTable(data, tableName, db) {
    return new Promise((resolve, reject) => {
      if (db.table(tableName) !== null || db.table(tableName) !== undefined) {
        db.table(tableName).clear();
      }
      db.table(tableName)
        .bulkAdd(data)
        .then((res) => {
          resolve(res);
          console.log("Data added in table");
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public async addListLastModifiedInfo(item, db, tableName:string) {
    var existingRecord: any = await this.getMasterInfo(
      db,
      this.config.LATESTRECORDTABLE,
      tableName.toLowerCase()
    );
    if (existingRecord.length > 0) {
      this.deleteListItem(db, existingRecord[0].ID).then((d) => {
        this.addListLastModifiedRecord(db, item, tableName);
      });
    } else {
      this.addListLastModifiedRecord(db, item, tableName);
    }
  }

  public addListLastModifiedRecord(db, item, tableName) {
    return new Promise((resolve, reject) => {
      db.table(this.config.LATESTRECORDTABLE)
        .add({
          listItemID: item.ID,
          listname: tableName,
          modified: item.Modified,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  public deleteListItem(db, id) {
    return new Promise(async (resolve, reject) => {
      db.table(this.config.LATESTRECORDTABLE)
        .where("ID")
        .equals(id)
        .delete()
        .then((deleteCount) => {
          resolve(deleteCount);
        })
        .catch((error) => {
          console.error("Error: " + error);
          reject(error);
        });
    });
  }
}
