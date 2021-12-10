import { ListOperations } from "./services/list-services";
import DexieIndexedDB from "./services/dexie-services";
export default function Load(url) {
  var swUrl = url + "/SiteAssets/JS/sw.js";
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(swUrl)
      .then(
        (registration) => {
          console.log("worker registration is successfull", registration.scope);
          validateData(url);
        },
        (err) => {
          console.log(err);
        }
      )
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("Service worker is not supported");
  }
}

async function validateData(url) {
  var listOps = new ListOperations();
  var ops = new DexieIndexedDB();

  const listNames: any = await listOps.getConfigListNames(url);  
  var configListNames: string = listNames[0].ConfigValue;
  if (configListNames.indexOf(",") !== -1) {
    var names = configListNames.split(",");
    await ops.checkDBTable(names, url);
  }

  //

  // Promise.all([await ops.getMasterInfo(), listOps.getLastModifiedItemInfo(url)])
  //   .then((data) => {
  //     if (data[0] !== undefined) {
  //       if (data[0][0] === undefined) {
  //         listOps.getListItems(url);
  //         ops.addLastModifiedInfo(data[1][0]);
  //       }
  //     } else {
  //       listOps.getListItems(url);
  //       ops.addLastModifiedInfo(data[1][0]);
  //     }
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
}
