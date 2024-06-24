<script lang="ts">
  import * as duckdb from '@duckdb/duckdb-wasm';
  import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
  import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
  import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
  import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
  import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';
  import { onMount } from 'svelte';
  import { GridApi, createGrid } from 'ag-grid-community';
  import type * as arrow from 'apache-arrow';
  import 'ag-grid-community/styles/ag-grid.css';
  import 'ag-grid-community/styles/ag-theme-quartz.css';

  export let queryResult: arrow.Table<any>;
  export let queryInput = '';
  export let files: FileList;

  let db: Promise<duckdb.AsyncDuckDB>;
  let agGridApi: GridApi;
  let columns: string[] = [];
  let feedbackText: string = null;

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
    const connection = await (await db).connect();
    const result = await connection.query(queryString).then((result) => {
      console.log(result);
      queryResult = result;

      columns = queryResult.schema.fields.map((field: any) => field.name);
      const queryData = queryResult.toArray();

      let colDefs: any[] = [];
      columns.forEach((key: any) =>
        colDefs.push({
          field: key,
          filter: true,
        })
      );
      agGridApi.setGridOption('columnDefs', colDefs);
      agGridApi.setGridOption('rowData', queryData);
      // agGridApi.autoSizeAllColumns();
      agGridApi = agGridApi;
    }).catch((error) => {
      feedbackText = error;
      console.log(error);
    });
  }

  async function registerFiles(files: FileList) {
    for (let file of files) {
      console.log(file);
      await (
        await db
      ).registerFileHandle(
        file.name,
        file,
        DuckDBDataProtocol.BROWSER_FILEREADER,
        true
      );
      queryInput = `select * from '${file.name}';`;
    }
  }

  onMount(() => {
    agGridApi = createGrid(
      document.getElementById('queryResultGrid') as any,
      {}
    );
    db = initDuckDb();
  });
</script>

<div class="container">
  <figure>
    <img src="inspector_duck.png" alt="DuckDB Logo" height="200px" />
    <h1>Inspector Duck</h1>
  </figure>
  <input type="file" id="file" bind:files multiple on:change={() => {registerFiles(files)}} />
  {#if files && files[0]}
    <textarea
      class="input"
      bind:value={queryInput}
      rows="10"
      placeholder="select * from {files[0].name};"
    />
    <br />
    <button
      on:click={() => {
        query(queryInput);
      }}>Query</button
    >
  {/if}
  <div >
    <br />
  </div>
  <div class="feedback">
    {#if feedbackText}
      <p>{feedbackText}</p>
    {/if}
    {#if queryResult}
      <p>
        {queryResult.batches.reduce((result, {data}) => result + data.length, 0)} rows returned in {queryResult.schema.fields.length} columns
      </p>
    {/if}
  </div>
  <div
    class={columns.length > 0
      ? 'queryResult ag-theme-quartz-auto-dark'
      : 'queryResult ag-theme-quartz-auto-dark hidden'}
    id="queryResultGrid"
  ></div>
</div>

<style>
  h1 {
    font-family: Arial;
  }
  .hidden {
    display: none;
  }
  .queryResult {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 50%;
    height: 50%;
    overflow-x: auto;
  }
  .input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 50%;
    height: 100px;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
</style>
