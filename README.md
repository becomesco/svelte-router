# Svelte Router

Simple and easy to use Svelte router.

## Get started

- Install the package: `@becomes/svelte-router`,
- Add router to the `src/app.svelte`,

```sveltehtml
<!-- app.svelte -->

<script lang="ts">
  import { Router } from "@becomes/svelte-router";
  import { RouterContainer } from "@becomes/svelte-router/components";
  import { Home, P404 } from './pages';
  
  Router.register([
    {
      path: '/',
      component: Home,
    }
  ], {
    path: '',
    component: P404
  })
</script>

<RouterContainer />
```
