#include "wifi_setup.h"

#include <ctype.h>
#include <string.h>

// ---------------------------------------------------------------------------
// page

typedef struct {
    char *p;
    size_t n, len;
} out_t;

static void put(out_t *o, const char *s)
{
    size_t k = strlen(s);
    if (o->len + k >= o->n)
        k = o->len + 1 < o->n ? o->n - o->len - 1 : 0;
    memcpy(o->p + o->len, s, k);
    o->len += k;
    o->p[o->len] = 0;
}

// text and attribute values
static void put_esc(out_t *o, const char *s)
{
    for (; s && *s; s++) {
        switch (*s) {
        case '&': put(o, "&amp;"); break;
        case '<': put(o, "&lt;"); break;
        case '>': put(o, "&gt;"); break;
        case '"': put(o, "&quot;"); break;
        case '\'': put(o, "&#39;"); break;
        default: {
            char c[2] = {*s, 0};
            put(o, c);
        }
        }
    }
}

static int bars(int rssi)
{
    return rssi >= -55 ? 4 : rssi >= -67 ? 3 : rssi >= -75 ? 2 : 1;
}

static const char STYLE[] =
    ":root{--bg:#f3f4f7;--card:#fff;--text:#191c23;--muted:#687080;--line:#e2e5eb;--accent:#3f56e0;"
    "--soft:rgba(63,86,224,.1);--field:#fff}"
    "@media(prefers-color-scheme:dark){:root{--bg:#101216;--card:#181b21;--text:#e6e8ec;--muted:#979eab;"
    "--line:#2b3039;--accent:#7c8dff;--soft:rgba(124,141,255,.14);--field:#1e2229}}"
    "*{box-sizing:border-box}body{font:16px/1.5 -apple-system,system-ui,sans-serif;margin:0;padding:20px 14px 40px;"
    "color:var(--text);background:var(--bg)}"
    "main{max-width:30em;margin:0 auto}"
    ".card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;"
    "box-shadow:0 1px 2px rgba(16,24,40,.05),0 4px 16px rgba(16,24,40,.06)}"
    ".hd{display:flex;align-items:center;gap:12px;margin-bottom:14px}"
    ".ic{width:44px;height:44px;border-radius:12px;background:var(--soft);color:var(--accent);display:grid;"
    "place-items:center;font-size:22px;flex:none}"
    "h1{font-size:1.15em;margin:0;line-height:1.25}.sub{margin:2px 0 0;color:var(--muted);font-size:.9em}"
    ".msg{padding:10px 14px;border-radius:9px;margin:0 0 14px;font-size:.95em}"
    ".ok{background:rgba(21,128,61,.12);color:#15803d}.err{background:rgba(198,40,40,.1);color:#c62828}"
    ".wait{background:rgba(180,83,9,.12);color:#b45309}"
    "fieldset{border:0;padding:0;margin:0}legend{font-weight:600;font-size:.8em;letter-spacing:.04em;"
    "text-transform:uppercase;color:var(--muted);margin-bottom:6px}"
    ".net{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid var(--line);"
    "border-radius:9px;margin:0 0 6px;background:var(--field);cursor:pointer}"
    ".net:has(:checked){border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}"
    ".net input{accent-color:var(--accent);margin:0}.net span{flex:1;overflow-wrap:anywhere}"
    ".sig{flex:0!important;white-space:nowrap;font-size:.8em;color:var(--muted)}.dim{opacity:.25}"
    "label.f{display:block;margin:14px 0 6px;font-weight:600;font-size:.8em;letter-spacing:.04em;"
    "text-transform:uppercase;color:var(--muted)}"
    "input[type=text],input[type=password]{width:100%;font-size:16px;padding:10px 12px;color:var(--text);"
    "background:var(--field);border:1px solid var(--line);border-radius:9px}"
    "input:focus{outline:2px solid var(--accent);outline-offset:-1px}"
    ".sp{display:flex;align-items:center;gap:8px;margin:8px 0 0;font-size:.95em;color:var(--muted)}"
    ".sp input{accent-color:var(--accent)}"
    "button{font:inherit;font-weight:600;width:100%;padding:12px 16px;border:0;border-radius:9px;"
    "background:var(--accent);color:#fff;margin-top:16px;cursor:pointer}"
    "button.l{background:none;color:var(--accent);margin-top:6px;padding:8px}"
    ".foot{color:var(--muted);font-size:.85em;margin:16px 0 0;text-align:center}"
    "p{margin:0 0 12px}";

// room kept for the rest of the page after the list (the form's fields and buttons are about
// 1 KB): odd names around must not push the password field out of the buffer
#define TAIL_ROOM 1536

static void network_list(out_t *o, const wifi_setup_page_t *p)
{
    put(o, "<fieldset><legend>Network (2.4 GHz)</legend>");
    bool checked = false;
    for (int i = 0; i < p->n_networks && o->n - o->len > TAIL_ROOM + 512; i++) {
        const wifi_setup_network_t *w = &p->networks[i];
        bool c = !checked && (p->ssid ? strcmp(p->ssid, w->ssid) == 0 : i == 0);
        checked |= c;
        put(o, "<label class=net><input type=radio name=ssid value=\"");
        put_esc(o, w->ssid);
        put(o, c ? "\" checked><span>" : "\"><span>");
        put_esc(o, w->ssid);
        put(o, "</span><span class=sig>");
        int b = bars(w->rssi);
        static const char *const glyph[4] = {"\xe2\x96\x82", "\xe2\x96\x84", "\xe2\x96\x86", "\xe2\x96\x88"};
        for (int k = 0; k < 4; k++) {
            put(o, k < b ? "" : "<span class=dim>");
            put(o, glyph[k]);
            put(o, k < b ? "" : "</span>");
        }
        put(o, w->secure ? " \xf0\x9f\x94\x92" : "");     // lock
        put(o, "</span></label>");
    }
    if (p->n_networks == 0)
        put(o, "<p>No network found. Type its name below, or scan again.</p>");
    put(o, "<label class=f for=other>Other network</label>"
           "<input type=text id=other name=other maxlength=32 autocapitalize=none autocorrect=off "
           "spellcheck=false placeholder=\"Network name (hidden networks)\">"
           "</fieldset>");
}

size_t wifi_setup_page(const wifi_setup_page_t *p, char *buf, size_t n)
{
    out_t o = {buf, n, 0};
    if (!n)
        return 0;
    buf[0] = 0;
    put(&o, "<!doctype html><html><head><meta charset=utf-8>"
            "<meta name=viewport content=\"width=device-width,initial-scale=1\">");
    if (p->state == WIFI_SETUP_CONNECTING)
        put(&o, "<meta http-equiv=refresh content=2>");
    put(&o, "<title>WiFi setup</title><style>");
    put(&o, STYLE);
    put(&o, "</style></head><body><main><div class=card><div class=hd><div class=ic>&#128424;</div><div><h1>");
    put_esc(&o, p->printer_name);
    put(&o, "</h1><p class=sub>WiFi setup</p></div></div>");

    switch (p->state) {
    case WIFI_SETUP_CONNECTING:
        put(&o, "<div class=\"msg wait\">Connecting to <b>");
        put_esc(&o, p->ssid);
        put(&o, "</b>&hellip;</div><p>If this page stops answering, the printer has probably joined the "
                "network: connect this device to <b>");
        put_esc(&o, p->ssid);
        put(&o, "</b> again and open <b>http://");
        put_esc(&o, p->hostname);
        put(&o, ".local/</b>.</p></div></main></body></html>");
        return o.len;
    case WIFI_SETUP_CONNECTED:
        put(&o, "<div class=\"msg ok\">Connected to <b>");
        put_esc(&o, p->ssid);
        put(&o, "</b>.</div><p>The printer restarts and joins it; this setup network goes away. Connect "
                "this device to <b>");
        put_esc(&o, p->ssid);
        put(&o, "</b> again, then open <b>http://");
        put_esc(&o, p->hostname);
        put(&o, ".local/</b>");
        if (p->ip && *p->ip) {
            put(&o, " (or <b>http://");
            put_esc(&o, p->ip);
            put(&o, "/</b>)");
        }
        put(&o, ".</p><p>To choose another network later, hold the BOOT button for 10 seconds.</p>"
                "</div></main></body></html>");
        return o.len;
    case WIFI_SETUP_FAILED:
        put(&o, "<div class=\"msg err\">Could not connect");
        if (p->ssid && *p->ssid) {
            put(&o, " to <b>");
            put_esc(&o, p->ssid);
            put(&o, "</b>");
        }
        put(&o, ": ");
        put_esc(&o, p->error && *p->error ? p->error : "no answer");
        put(&o, ".</div>");
        break;
    case WIFI_SETUP_IDLE:
        put(&o, "<p>Choose the WiFi network the printer should join.</p>");
        break;
    }

    put(&o, "<form method=post action=/connect>");
    network_list(&o, p);
    put(&o, "<label class=f for=pname>Printer name (shown on phones and computers)</label>"
            "<input type=text id=pname name=pname maxlength=48 autocorrect=off value=\"");
    put_esc(&o, p->printer_name);
    put(&o, "\"><label class=f for=host>Address: http://<i>name</i>.local/ (letters, digits, dashes)</label>"
            "<input type=text id=host name=host maxlength=32 autocapitalize=none autocorrect=off "
            "pattern=\"[A-Za-z0-9-]+\" value=\"");
    put_esc(&o, p->hostname);
    put(&o, "\">");
    put(&o, "<label class=f for=password>Password</label>"
            "<input type=password id=password name=password maxlength=64 autocomplete=current-password>"
            "<label class=sp><input type=checkbox onchange=\"password.type=this.checked?'text':'password'\"> "
            "Show password</label>"
            "<button>Connect</button></form>"
            "<form method=post action=/rescan><button class=l>Scan again</button></form>");
    put(&o, "<p class=foot>Once connected, the printer is at http://");
    put_esc(&o, p->hostname);
    put(&o, ".local/</p></div></main></body></html>");
    return o.len;
}

// ---------------------------------------------------------------------------
// form

static int hex(int c)
{
    if (c >= '0' && c <= '9')
        return c - '0';
    c = tolower(c);
    return c >= 'a' && c <= 'f' ? c - 'a' + 10 : -1;
}

// decodes s[0..len) into out; its length, -2 if it does not fit
static int url_decode(const char *s, size_t len, char *out, size_t n)
{
    size_t k = 0;
    for (size_t i = 0; i < len; i++) {
        int c = (unsigned char)s[i];
        if (c == '+') {
            c = ' ';
        } else if (c == '%' && i + 2 < len && hex(s[i + 1]) >= 0 && hex(s[i + 2]) >= 0) {
            c = hex(s[i + 1]) * 16 + hex(s[i + 2]);
            i += 2;
        }
        if (k + 1 >= n) {
            out[0] = 0;
            return -2;
        }
        out[k++] = (char)c;
    }
    out[k] = 0;
    return (int)k;
}

int wifi_setup_form_value(const char *body, size_t len, const char *key, char *out, size_t n)
{
    if (!n)
        return -2;
    out[0] = 0;
    size_t klen = strlen(key);
    for (size_t i = 0; i < len;) {
        size_t end = i;
        while (end < len && body[end] != '&')
            end++;
        if (end - i >= klen + 1 && memcmp(body + i, key, klen) == 0 && body[i + klen] == '=')
            return url_decode(body + i + klen + 1, end - i - klen - 1, out, n);
        if (end - i == klen && memcmp(body + i, key, klen) == 0)     // "key" alone: empty
            return url_decode("", 0, out, n);
        i = end + 1;
    }
    return -1;
}

bool wifi_setup_password_ok(const char *pw)
{
    size_t n = strlen(pw);
    if (n == 0 || (n >= 8 && n <= 63))
        return true;
    if (n != 64)
        return false;
    for (size_t i = 0; i < n; i++)
        if (hex((unsigned char)pw[i]) < 0)
            return false;
    return true;
}

// ---------------------------------------------------------------------------
// DNS

#define DNS_HEADER 12
#define TYPE_A 1
#define TYPE_ANY 255
#define CLASS_IN 1
#define ANSWER_TTL 10       // seconds: nothing should keep these answers once the setup is done

size_t wifi_setup_dns_reply(const uint8_t *q, size_t len, const uint8_t ip[4], uint8_t *out, size_t outsize)
{
    if (len < DNS_HEADER || len > 512)
        return 0;
    // a standard query (QR 0, opcode 0) with one question
    if ((q[2] & 0x80) || (q[2] & 0x78) || q[4] != 0 || q[5] != 1)
        return 0;
    size_t i = DNS_HEADER;
    while (1) {
        if (i >= len)
            return 0;
        uint8_t l = q[i];
        if (l == 0)
            break;
        if (l > 63)             // a pointer or a reserved label type: not in a query
            return 0;
        i += 1 + l;
    }
    i++;                        // the root label
    if (i + 4 > len)
        return 0;
    int type = q[i] << 8 | q[i + 1], cls = q[i + 2] << 8 | q[i + 3];
    size_t qend = i + 4;
    bool answer = (type == TYPE_A || type == TYPE_ANY) && (cls & 0x7fff) == CLASS_IN;
    size_t rlen = qend + (answer ? 16 : 0);
    if (rlen > outsize)
        return 0;

    memcpy(out, q, qend);       // id, flags, the question; additional records (EDNS) dropped
    out[2] = 0x84 | (q[2] & 0x01);  // response, authoritative, recursion desired as asked
    out[3] = 0x80;              // recursion available, no error
    out[6] = 0;
    out[7] = answer ? 1 : 0;    // answers
    memset(out + 8, 0, 4);      // authority, additional
    if (answer) {
        uint8_t *a = out + qend;
        a[0] = 0xc0;            // the name: a pointer to the question's
        a[1] = DNS_HEADER;
        a[2] = 0;
        a[3] = TYPE_A;
        a[4] = 0;
        a[5] = CLASS_IN;
        a[6] = a[7] = a[8] = 0;
        a[9] = ANSWER_TTL;
        a[10] = 0;
        a[11] = 4;
        memcpy(a + 12, ip, 4);
    }
    return rlen;
}
