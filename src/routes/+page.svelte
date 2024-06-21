<script lang="ts">
  import * as duckdb from '@duckdb/duckdb-wasm';
  import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
  import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
  import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
  import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

  let queryResult = '';
  async function initDuckDb(): Promise<duckdb.AsyncDuckDB> {
    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
      mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
      },
      eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
      },
    };
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    return db;
  }

  async function query(queryString: string) {
    const db = await initDuckDb();
    const c = await db.connect();

    const query = 'SELECT count(*) FROM buffer.parquet;';
    const res = await fetch(
      'https://shell.duckdb.org/data/tpch/0_01/parquet/lineitem.parquet'
    );
    await db.registerFileBuffer(
      'buffer.parquet',
      new Uint8Array(await res.arrayBuffer())
    );

    const result = await c.query(query);
    console.log(result);
    queryResult = result;
    // return resu;
  }
</script>


<button on:click={() => query('SELECT count(*) FROM buffer.parquet;')}
  >Click me</button
>
<div class="queryResult">{queryResult}</div>

<style>
  .queryResult {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
</style>
