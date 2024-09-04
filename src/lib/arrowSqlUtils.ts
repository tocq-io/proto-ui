import { Table, tableFromArrays, tableFromIPC } from "@apache-arrow/ts";
import { errorView } from "$lib/storeUtils";
import * as duckdb from '@duckdb/duckdb-wasm';
// import duckdb_coi from '@duckdb/duckdb-wasm/dist/duckdb-coi.wasm?url';
// import duckdb_coi_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-coi.worker.js?url';
// import duckdb_coi_pthread from '@duckdb/duckdb-wasm/dist/duckdb-browser-coi.pthread.worker.js?url';
// import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
// import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
// import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
// import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { getCsvFile } from "./fileUtils";


let duckDb: Promise<duckdb.AsyncDuckDB>;

export function initDuckDb() {
    duckDb = _initDuckDb();
}

export function getJsDelivrBundlesWithCoi(): duckdb.DuckDBBundles {
    const jsdelivr_dist_url = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.1-dev106.0/dist/`;
    return {
        mvp: {
            mainModule: `${jsdelivr_dist_url}duckdb-mvp.wasm`,
            mainWorker: `${jsdelivr_dist_url}duckdb-browser-mvp.worker.js`,
        },
        eh: {
            mainModule: `${jsdelivr_dist_url}duckdb-eh.wasm`,
            mainWorker: `${jsdelivr_dist_url}duckdb-browser-eh.worker.js`,
        },
        coi: {
            mainModule: `${jsdelivr_dist_url}duckdb-coi.wasm`,
            mainWorker: `${jsdelivr_dist_url}duckdb-browser-coi.worker.js`,
            pthreadWorker: `${jsdelivr_dist_url}duckdb-browser-coi.pthread.worker.js`,
        },
    };
}

async function _initDuckDb() {
    // const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    //     mvp: {
    //         mainModule: duckdb_wasm,
    //         mainWorker: mvp_worker,
    //     },
    //     eh: {
    //         mainModule: duckdb_wasm_eh,
    //         mainWorker: eh_worker,
    //     },
    //     //TODO
    //       coi: {
    //         mainModule: duckdb_coi,
    //         mainWorker: duckdb_coi_worker,
    //         pthreadWorker: duckdb_coi_pthread
    //       }
    // };
    // // Select a bundle based on browser checks
    // let bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // const worker = new Worker(bundle.mainWorker!,
    //     { credentials: 'include', type: 'module', name: 'sql_engine' });
    // const logger = new duckdb.ConsoleLogger();
    // let dDb = new duckdb.AsyncDuckDB(logger, worker);
    // await dDb.instantiate(bundle.mainModule, bundle.pthreadWorker);

    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    // console.log(await duckdb.getPlatformFeatures());
    // console.log(JSDELIVR_BUNDLES);

    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
    );

    const wasmURL = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainModule!}");`], { type: 'text/javascript' })
    );

    const pthreadUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.pthreadWorker!}");`], { type: 'text/javascript' })
    );

    // Instantiate the asynchronus version of DuckDB-Wasm
    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    const dDb = new duckdb.AsyncDuckDB(logger, worker);
    await dDb.instantiate(wasmURL, pthreadUrl);
    URL.revokeObjectURL(workerUrl);
    await dDb.ping()
    return dDb;
}



export async function getTables(sqlStatement: string) {
    const db = await duckDb;
    const duckConnection = await db.connect();
    let tables = duckConnection.getTableNames(sqlStatement);
    return tables;
}

export async function registerCsv(file: FileSystemFileHandle, fileName: string, id: string) {
    const db = await duckDb;
    const duckConnection = await db.connect();
    await getCsvFile(fileName)
        .then((async (fileHandle) => {
            // TODO
            // const accessHandler = fileHandle.createSyncAccessHandle({
            //   mode: "read-only",
            // }); 
            // await db.registerFileBuffer(fileName + '.csv', accessHandle, duckdb.DuckDBDataProtocol.BROWSER_FSACCESS, true);
            const buffer = await (await fileHandle.getFile()).arrayBuffer();
            const fileBytes = new Uint8Array(buffer);
            //TODO register file directly
            await db.registerFileBuffer(fileName + '.csv', fileBytes);
            return duckConnection.insertCSVFromPath(fileName + '.csv', {
                name: fileName,
                detect: true,
                header: true,
                delimiter: ',',
            });
        }));
}

export async function getArrowTable(sqlStatement: string): Promise<Table | undefined> {
    const db = await duckDb;
    const duckConnection = await db.connect();
    return duckConnection.query(sqlStatement)
        .then((tbl) => {
            errorView.update((errV) => {
                errV.visibility = 'hidden';
                return errV;
            });
            return tbl;
        })
        .catch((e) => {
            errorView.set({
                color: 'red',
                visibility: 'visible',
                msg: e.message
            });
            return undefined
        });
}