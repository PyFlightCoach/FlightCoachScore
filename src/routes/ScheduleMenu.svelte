<script lang="ts">
  import {dbServer} from "$lib/api";
  import NavMenu from "$lib/components/NavMenu.svelte";


  const uploadSchedule = (file: File) => {
    const form_data = new FormData();
    form_data.append('files', file);
    const r = dbServer.post('schedule', form_data);
  };


</script>


<NavMenu>
  <span slot="icon"><i class="bi bi-clipboard"></i> </span>
  <label class="dropdown-item">
    <input
      type="file"
      name="input-name"
      style="display: none;"
      accept=".json, .ajson"
      on:change={(e: Event) => {
        if (e.target?.files?.length > 0) {uploadSchedule(e.target.files[0])};
      }}
    />
    <span>Upload</span>
  </label>
  <div class="dropdown-item" >Browse</div>
</NavMenu>