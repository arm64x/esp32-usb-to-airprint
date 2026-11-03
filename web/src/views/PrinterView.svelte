<script lang="ts">
  import { t, i18n } from '../lib/i18n.svelte';
  import type { Message } from '../lib/i18n';
  import Printer from '@lucide/svelte/icons/printer';
  import Upload from '@lucide/svelte/icons/upload';
  import FolderOpen from '@lucide/svelte/icons/folder-open';
  import Lightbulb from '@lucide/svelte/icons/lightbulb';
  import CircleStop from '@lucide/svelte/icons/circle-stop';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import { device, deviceLabel, type Job, type Supply } from '../lib/device.svelte';
  import { cancelJob, identifyPrinter, statusOk, statusText } from '../lib/ipp';
  import { addFile, formatSize, isSupported } from '../lib/files.svelte';
  import { openPrint, pickFiles, toast } from '../lib/ui.svelte';
  import { cartridgeState, guideFor } from '../lib/errors';
  import Modal from '../components/Modal.svelte';
  import Wifi from '@lucide/svelte/icons/wifi';

  const p = $derived(device.printer);
  const active = $derived(p?.jobs.find((j) => j.id === p.active && (j.state === 'processing' || j.state === 'pending')));
  let input: HTMLInputElement;

  const status = $derived.by(() => {
    if (!device.loaded) return { text: t('Connecting…'), tone: '' };
    if (!p) return { text: t('Unavailable'), tone: 'err' };
    if (!p.connected) return { text: t('Not connected'), tone: 'warn' };
    if (p.reasons.some((r) => r.endsWith('-error'))) return { text: deviceLabel(p.message), tone: 'err' };
    if (p.state === 'processing') return { text: t('Printing'), tone: 'busy' };
    if (device.scan?.state === 'scanning') return { text: t('Scanning'), tone: 'busy' };
    return { text: t('Ready'), tone: 'ok' };
  });

  const REASONS: Partial<Record<string, Message>> = {
    'marker-supply-low-warning': 'Ink is running low',
    'marker-supply-empty-error': 'An ink cartridge is empty or missing',
    'media-empty-error': 'Out of paper: load paper in the rear tray',
    'media-jam-error': 'Paper jam',
    'cover-open-error': 'The cover is open',
    'offline-report': 'The printer is not connected',
  };

  function reasonText(r: string): string {
    const key = REASONS[r];
    return key ? t(key) : r;
  }

  function inkColor(s: Supply): string {
    const cs = s.color.match(/#[0-9a-f]{6}/gi) || ['#888'];
    return cs.length > 1 ? `linear-gradient(90deg, ${cs.join(', ')})` : cs[0];
  }

  const STATE: Record<Job['state'], [Message, string]> = {
    pending: ['Waiting', 'busy'],
    held: ['Held', 'warn'],
    processing: ['Printing', 'busy'],
    completed: ['Done', 'ok'],
    canceled: ['Canceled', ''],
    aborted: ['Failed', 'err'],
  };

  // the device's clock is set over the network; without it, no time
  function ago(time: number): string {
    if (time < 1.6e9) return '';
    const seconds = Math.max(0, Date.now() / 1000 - time);
    if (seconds < 60) return t('just now');
    const relative = new Intl.RelativeTimeFormat(i18n.locale, { style: 'short' });
    if (seconds < 3600) return relative.format(-Math.round(seconds / 60), 'minute');
    if (seconds < 86400) return relative.format(-Math.round(seconds / 3600), 'hour');
    return relative.format(-Math.round(seconds / 86400), 'day');
  }

  async function chooseFile() {
    const [f] = await pickFiles(t('Choose a file to print'), false);
    if (f) openPrint(f);
  }

  async function upload(e: Event) {
    const list = (e.target as HTMLInputElement).files;
    const file = list?.[0];
    (e.target as HTMLInputElement).value = '';
    if (!file) return;
    if (!isSupported(file.type, file.name)) return toast(t('Choose a PDF or an image'), 'error');
    try {
      const f = await addFile({ name: file.name, blob: file, source: 'upload' });
      openPrint(f);
    } catch (err) {
      toast(t('Cannot open {name}: {error}', { name: file.name, error: (err as Error).message }), 'error');
    }
  }

  async function identify() {
    try {
      await identifyPrinter();
      toast(t('The light on the printer box flashes blue'), 'ok');
    } catch (e) {
      toast(t('Failed: {error}', { error: (e as Error).message }), 'error');
    }
  }

  // names: the printer's AirPrint name and its .local address (GET/POST /api/settings)
  let settings = $state<{ printer_name: string; hostname: string; setup_network: boolean; version: string } | null>(null);
  let newName = $state('');
  let newHost = $state('');
  let saving = $state(false);
  $effect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((js) => {
        if (!js) return;
        settings = js;
        newName = js.printer_name;
        newHost = js.hostname;
      })
      .catch(() => {});
  });
  const settingsChanged = $derived(!!settings && (newName !== settings.printer_name || newHost !== settings.hostname));
  async function saveSettings() {
    saving = true;
    try {
      const body = new URLSearchParams({ pname: newName.trim(), host: newHost.trim() });
      const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      const js = await r.json().catch(() => ({}));
      if (!r.ok) return toast(js.error || t('Could not save'), 'error', [], 8000);
      toast(t('Saved. The printer box restarts; open http://{host}.local/ in a moment.', { host: newHost.trim().toLowerCase() }), 'ok', [], 12000);
    } catch (e) {
      toast(`${t('Could not save')}: ${(e as Error).message}`, 'error');
    } finally {
      saving = false;
    }
  }
  let forgetOpen = $state(false);
  let forgetting = $state(false);
  async function forgetWifi() {
    forgetting = true;
    try {
      const r = await fetch('/api/wifi/forget', { method: 'POST' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast(t('The printer box restarts into its setup network.'), 'ok', [], 12000);
      forgetOpen = false;
    } catch (e) {
      toast(`${t('Failed')}: ${(e as Error).message}`, 'error');
    } finally {
      forgetting = false;
    }
  }

  async function cancel(id: number) {
    try {
      const r = await cancelJob(id);
      if (!statusOk(r.status)) throw new Error(statusText(r));
      toast(t('Canceling: the sheet is finished and ejected'));
    } catch (e) {
      toast(t('Cannot cancel: {error}', { error: (e as Error).message }), 'error');
    }
  }
</script>

<div class="grid">
  <section class="card hero">
    <div class="art"><Printer size={40} strokeWidth={1.5} /></div>
    <div class="grow">
      <div class="row wrap">
        <h1 class="ellipsis">{p?.name || t('Printer')}</h1>
        <span class="pill {status.tone}"><span class="dot"></span>{status.text}</span>
      </div>
      <p class="muted">{p?.model || ''}{p?.connected && p.message && deviceLabel(p.message) !== status.text ? ` · ${deviceLabel(p.message)}` : ''}</p>
      <div class="actions row wrap">
        <button class="btn primary" onclick={() => input.click()} disabled={!p?.connected}>
          <Upload size={17} /> {t('Upload & print')}
        </button>
        <button class="btn" onclick={chooseFile} disabled={!p?.connected}><FolderOpen size={17} /> {t('Print from Files')}</button>
        <button class="btn ghost" onclick={identify} disabled={!device.online}><Lightbulb size={17} /> {t('Identify')}</button>
      </div>
      <input bind:this={input} type="file" accept="application/pdf,image/*" hidden onchange={upload} />
    </div>
  </section>

  {#if p && (p.reasons.length || p.codes?.length)}
    <section class="card card-pad alerts">
      {#each p.codes ?? [] as c (c)}
        <div class="row">
          <CircleAlert size={18} class="err" />
          <span><b>{t('Code {code}', { code: c })}</b> · {guideFor(c, i18n.locale, p.model).title}</span>
        </div>
      {/each}
      {#each p.reasons as r}
        <div class="row">
          <CircleAlert size={18} class={r.endsWith('-error') ? 'err' : 'warn'} />
          <span>{reasonText(r)}</span>
        </div>
      {/each}
    </section>
  {/if}

  {#if active}
    <section class="card card-pad job">
      <div class="row">
        <div class="grow">
          <h2 class="ellipsis">{active.name}</h2>
          <p class="muted small">
            {active.state === 'pending' ? t('Waiting for the document') : t('Page {page}', { page: active.pages + 1 })} ·
            {active.user ? t('{size} received · from {user}', { size: formatSize(active.bytes), user: active.user }) : t('{size} received', { size: formatSize(active.bytes) })}
          </p>
        </div>
        <button class="btn danger" onclick={() => cancel(active.id)}><CircleStop size={17} /> {t('Cancel')}</button>
      </div>
      <div class="bar indeterminate"><div></div></div>
    </section>
  {/if}

  <section class="card card-pad">
    <h2>{t('Ink')}</h2>
    {#if p?.supplies.length}
      <div class="inks">
        {#each p.supplies as s}
          <div class="ink">
            <div class="row"><span class="grow">{deviceLabel(s.name)}</span><b>{s.level >= 0 ? s.level + '%' : cartridgeState(s.state, i18n.locale) || t('unknown')}</b></div>
            <div class="bar">
              <div style:width={(s.level >= 0 ? s.level : 0) + '%'} style:background={inkColor(s)}></div>
            </div>
          </div>
        {/each}
      </div>
      <p class="muted small">{t('Refilled cartridges report "unknown".')}</p>
    {:else}
      <p class="muted">{p?.connected ? t('The printer has not reported its ink yet.') : t('No printer connected.')}</p>
    {/if}
  </section>

  {#if settings}
    <section class="card card-pad settings">
      <h2>{t('Settings')}</h2>
      <div class="field">
        <span class="label">{t('Printer name (shown on phones and computers)')}</span>
        <input class="input" maxlength="48" bind:value={newName} />
      </div>
      <div class="field">
        <span class="label">{t('Address')}</span>
        <div class="row host">
          <span class="muted">http://</span><input class="input" maxlength="32" pattern="[A-Za-z0-9-]+" bind:value={newHost} /><span class="muted">.local/</span>
        </div>
      </div>
      <div class="row actions">
        <button class="btn primary" onclick={saveSettings} disabled={!settingsChanged || saving}>{t('Save and restart')}</button>
        <button class="btn" onclick={() => (forgetOpen = true)}><Wifi size={17} /> {t('Change WiFi network')}</button>
        <span class="muted small grow">{t('Firmware')} {settings.version}</span>
      </div>
    </section>
  {/if}

  {#if forgetOpen}
    <Modal title={t('Change WiFi network')} onclose={() => (forgetOpen = false)} compact>
      <div class="forget">
        <div class="forget-icon"><Wifi size={28} /></div>
        <p>{t('Forget the WiFi network? The printer box then opens its own setup network "Printer-Setup-XXXX": join it from a phone to choose a network again.')}</p>
      </div>
      {#snippet footer()}
        <button class="btn" onclick={() => (forgetOpen = false)} disabled={forgetting}>{t('Cancel')}</button>
        <button class="btn danger" onclick={forgetWifi} disabled={forgetting}>{t('Change WiFi network')}</button>
      {/snippet}
    </Modal>
  {/if}

  <section class="card card-pad">
    <h2>{t('Recent jobs')}</h2>
    {#if p?.jobs.length}
      <ul class="jobs">
        {#each p.jobs as j (j.id)}
          {@const state = STATE[j.state]}
          {@const label = state ? t(state[0]) : j.state}
          {@const tone = state?.[1] || ''}
          <li class="row">
            <div class="grow">
              <div class="ellipsis">{j.name}</div>
              <div class="muted small">
                {[j.pages === 1 ? t('{count} page', { count: j.pages }) : t('{count} pages', { count: j.pages }), ago(j.time), j.user].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span class="pill {tone}">{label}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="muted">{t('No jobs since the printer box started.')}</p>
    {/if}
  </section>

  <section class="card card-pad tips">
    <h2>{t('Other ways to print')}</h2>
    <p class="muted small">
      {t('iPhone, iPad and Mac: AirPrint (Share → Print). Android: the default print service. The button on the printer box scans a page into Files; press it twice for a test page, hold it to cancel.')}
    </p>
  </section>
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .hero,
  .alerts,
  .job {
    grid-column: 1 / -1;
  }
  .hero {
    display: flex;
    gap: 22px;
    padding: 24px;
    align-items: center;
  }
  .art {
    display: grid;
    place-items: center;
    width: 92px;
    height: 92px;
    border-radius: 24px;
    background: var(--accent-soft);
    color: var(--accent);
    flex: none;
  }
  .actions {
    margin-top: 16px;
  }
  h2 {
    margin-bottom: 12px;
  }
  .alerts {
    display: grid;
    gap: 6px;
  }
  .alerts :global(.warn) {
    color: var(--warn);
  }
  .alerts :global(.err) {
    color: var(--err);
  }
  .job h2 {
    margin: 0;
  }
  .job .bar {
    margin-top: 12px;
  }
  .indeterminate > div {
    width: 35%;
    animation: slide 1.4s ease-in-out infinite;
  }
  @keyframes slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(300%);
    }
  }
  .settings {
    display: grid;
    gap: 12px;
  }
  .settings .field {
    display: grid;
    gap: 6px;
  }
  .settings .host {
    flex-wrap: wrap;
    min-width: 0;
  }
  .settings .host .input {
    flex: 1 1 8em;
    min-width: 0;
    width: auto;
  }
  .settings .actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  .forget {
    display: grid;
    gap: 12px;
    justify-items: center;
    text-align: center;
    padding: 20px 20px 8px;
  }
  .forget p {
    margin: 0;
  }
  .forget-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: var(--accent-soft);
    color: var(--accent);
  }
  .inks {
    display: grid;
    gap: 14px;
    margin-bottom: 12px;
  }
  .ink .bar {
    height: 10px;
    margin-top: 6px;
    border-radius: 5px;
  }
  .ink .bar > div {
    border-radius: 5px;
  }
  .jobs {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
  }
  .jobs li {
    padding: 9px 0;
    border-top: 1px solid var(--border);
  }
  .jobs li:first-child {
    border-top: 0;
    padding-top: 0;
  }
  .tips {
    grid-column: 1 / -1;
  }
  .tips h2 {
    margin-bottom: 6px;
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
    .hero {
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
      padding: 18px;
    }
    .art {
      width: 60px;
      height: 60px;
      border-radius: 16px;
    }
  }
</style>
