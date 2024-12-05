<script lang="ts">
	import { loadKnowns } from '$lib/schedules.js';
	import { user } from '$lib/stores/user.js';
  import {base} from '$app/paths';
	loadKnowns();
  
  export let lastResponse: 'leaderboard' | 'flightlist' | undefined = undefined;
  export let table_rows: Record<string, any>[];

  let col_map = {
    id: "flight_id",
    lat: "origin_lat",
    lng: "origin_lng",
    Name: "name",
    Country: "country",
    Date: "date",
    Comment: "comment",
    Rank: "rank",
    Position: "table_rank",
    Score: "score",
    Version: "version",
  }

  let col_heads: string[];
	$: if (lastResponse=='leaderboard') {
    col_heads = ['Position', 'Rank', 'Name', 'Country', 'Date', 'Score'];
  } else if (lastResponse=='flightlist') {
    col_heads = [...['Date', 'Score', 'Comment'], ...($user?.is_superuser ? ['Name'] :[])];
  }

  
</script>


<div class="col">
  {#if lastResponse}
    <div class="mh-100 overflow-scroll">
      <table class="table table-sm table-success table-striped text-center">
        <thead class="table-dark sticky-top" style="z-index:-1">
          <tr>
            {#each col_heads as col_head}
              <th scope="col">{col_head}</th>
            {/each}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each table_rows as row}
            <tr>
              {#each col_heads as col_head}
                <td>{row[col_map[col_head]]}</td>
              {/each}
              <td><a href="{base}/database/flight/?flight_id={row.flight_id}">View</a></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
