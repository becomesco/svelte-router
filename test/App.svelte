<script lang="ts">
  import { RouterContainer } from '../src/components';
  import { Router } from '../src';
  import { P1, P2, P404 } from './pages';

  Router.register(
    [
      {
        path: '/',
        component: P1,
      },
      {
        path: '/p2',
        component: P2,
      },
    ],
    {
      path: '/',
      component: P404,
    }
  );
</script>

<main>
  <RouterContainer />
</main>
