<script lang="ts">
  import * as duckdb from '@duckdb/duckdb-wasm';
  import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
  import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
  import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
  import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
  import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';
  import { onMount } from 'svelte';

  export let queryResult = '';
  export let queryInput = '';
  export let files: FileList;

  let db: Promise<duckdb.AsyncDuckDB>;

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
    const c = await (await db).connect();

    // const res = await fetch(
    //   'https://shell.duckdb.org/data/tpch/0_01/parquet/lineitem.parquet'
    // );
    // await db.registerFileBuffer(
    //   'buffer.parquet',
    //   new Uint8Array(await res.arrayBuffer())
    // );

    const result = await c.query(queryString);
    console.log(result);
    queryResult = result;
  }

  async function registerFile(file: File) {
    console.log(file);
    await (
      await db
    ).registerFileHandle(
      'buffer.parquet',
      file,
      DuckDBDataProtocol.BROWSER_FILEREADER,
      true
    );
  }

  onMount(async () => {
    db = initDuckDb();
  });
</script>

<div class="container">
  <input type="file" id="file" bind:files />
  {#if files && files[0]}
    <input type="text" class="input" bind:value={queryInput} />
    <br />
    <button
      on:click={() => {
        registerFile(files[0]).then(() => {
          console.log('file registered');
          query(queryInput);
        });
      }}>Query</button
    >
    <div class="queryResult">{queryResult}</div>
  {/if}
</div>

<style>
  .queryResult {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 50%;
    height: 50%;
  }
  .input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 50%;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
</style>
