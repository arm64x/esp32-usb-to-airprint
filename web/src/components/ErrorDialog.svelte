<script lang="ts">
  // Pops up when the printer reports an error code, with the fix in the UI's
  // language (lib/errors.ts). Closes by itself when the error clears; Close
  // hides it until the set of codes changes.
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Modal from './Modal.svelte';
  import { device } from '../lib/device.svelte';
  import { codesFor, guideFor, warningText } from '../lib/errors';
  import { i18n, t } from '../lib/i18n.svelte';

  const p = $derived(device.printer);
  const codes = $derived(p?.connected ? codesFor(p) : []);
  const warnings = $derived(p?.connected ? (p.warnings ?? []).filter((w) => warningText(w)) : []);
  const key = $derived(codes.join(','));
  let dismissed = $state('');

  $effect(() => {
    if (!key) dismissed = ''; // the error cleared: the next one shows again
  });

  const open = $derived(!!key && key !== dismissed);
  // read the locale here so the guides follow the language picker
  const guides = $derived(codes.map((code) => ({ code, g: guideFor(code, i18n.locale, p?.model) })));
</script>

{#if open}
  <Modal
    title={codes.length > 1 ? t('The printer reports {count} errors', { count: codes.length }) : t('The printer reports error {code}', { code: codes[0] })}
    onclose={() => (dismissed = key)}>
    <div class="errors">
      {#each guides as { code, g } (code)}
        <section class="card card-pad err-card" class:service={g.service}>
          <div class="row head">
            {#if g.service}<Wrench size={20} class="err" />{:else}<CircleAlert size={20} class="err" />{/if}
            <div class="grow">
              <h3>{t('Code {code}', { code })} · {g.title}</h3>
              {#if g.blink}<span class="small muted">{g.blink}</span>{/if}
            </div>
          </div>
          <p class="cause">{g.cause}</p>
          <p class="small muted label">{t('How to fix')}</p>
          <ol>
            {#each g.steps as s}
              <li>{s}</li>
            {/each}
          </ol>
          {#if g.service}
            <p class="small service-note">{t('If these steps do not help, the printer needs a technician or Canon service.')}</p>
          {/if}
        </section>
      {/each}
      {#each warnings as w (w)}
        <p class="small muted">{t('Warning {code}: {text}', { code: w, text: warningText(w, i18n.locale) })}</p>
      {/each}
      <p class="small muted">{t('This window closes by itself when the error clears.')}</p>
    </div>
  </Modal>
{/if}

<style>
  .errors {
    display: grid;
    gap: 12px;
    padding: 16px 20px 20px;
  }
  .err-card {
    display: grid;
    gap: 8px;
    border-color: color-mix(in srgb, var(--err, #d33) 45%, var(--border));
  }
  .err-card.service {
    border-style: dashed;
  }
  .head {
    align-items: flex-start;
  }
  h3 {
    font-size: 1.05rem;
    margin: 0;
  }
  .cause {
    margin: 0;
  }
  .label {
    margin: 4px 0 0;
  }
  ol {
    margin: 0;
    padding-left: 1.3em;
    display: grid;
    gap: 6px;
  }
  .service-note {
    margin: 0;
    color: var(--err, #d33);
  }
</style>
