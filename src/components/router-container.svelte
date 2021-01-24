<script>
  import { Router } from '../core';
  let component;
  let props;
  let params;
  let data;
  Router.listen((_component, _params, _props, _options) => {
    component = _component;
    params = _params;
    props = _props;
    data = _options ? _options.data : undefined;
  });
  Router.navigate(window.location.pathname, { push: true });
</script>

{#if component}
  <svelte:component this={component} {props} {params} {data} />
{/if}