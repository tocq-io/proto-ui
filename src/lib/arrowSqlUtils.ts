import { Table, tableFromIPC } from "@apache-arrow/ts";
import { run_sql } from "proto-query-engine";
import { errorView } from "$lib/storeUtils";

export async function getTables(sqlStatement: string): Promise<Set<string>> {
    let tables = new Set<string>();
    return run_sql('EXPLAIN ' + sqlStatement)
        .then((ipcResult) => {
            const table = tableFromIPC(ipcResult);
            for (const result of table.toArray()) {
                const row = result.toArray();
                // TODO this could probably be done in a more robust way on the rust side...
                if (row[0] === 'physical_plan') {
                    for (const analysis of row[1].split(/\n/)) {
                        let candidate: string = analysis.trim();
                        const idLength = 'ArrowExec: file_groups={1 group: [['.length;
                        const startIndex = candidate.indexOf('ArrowExec: ');
                        if (startIndex == 0) {
                            const endIndex = candidate.indexOf('.arrow');
                            candidate = candidate.substring(idLength, endIndex);
                            tables.add(candidate.trim());
                        }
                    }
                }
            }
            // TODO this is a bit odd
            errorView.update((errV) => {
                errV.visibility = 'hidden';
                return errV;
            });
            return tables;
        })
        .catch((e) => {
            errorView.set({
                color: 'red',
                visibility: 'visible',
                msg: e.message
            });
            return new Set();
        });
}

export async function getArrowTable(sqlStatement: string, id: string): Promise<Table | undefined> {
    return run_sql(sqlStatement)
        .then((reslt) => {
            errorView.update((errV) => {
                errV.visibility = 'hidden';
                return errV;
            });
            return tableFromIPC(reslt);
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