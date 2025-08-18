<script lang="ts">

  let {name, value=$bindable()} : {name: string, value: string} = $props();

</script>


  <div class="row p-2">
    <label class="col col-form-label" for="textInput">{name}:</label>
    <input
      class="col col-form-input form-control"
      id="textInput"
      type="text"
      bind:value={value}
      required
    />
  </div>