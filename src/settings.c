#include "settings.h"

#include <ctype.h>
#include <stdio.h>
#include <string.h>

#include "esp_log.h"
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "local_config.h"
#include "nvs_flash.h"

static const char *TAG = "settings";
#define NS "setup"

static char s_hostname[SETTINGS_HOSTNAME_MAX + 1];
static char s_printer_name[SETTINGS_PRINTER_NAME_MAX + 1];

static void read_str(nvs_handle_t h, const char *key, char *out, size_t n, const char *fallback)
{
    size_t len = n;
    if (nvs_get_str(h, key, out, &len) != ESP_OK || !out[0])
        snprintf(out, n, "%s", fallback);
}

void settings_init(void)
{
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        nvs_flash_erase();
        err = nvs_flash_init();
    }
    snprintf(s_hostname, sizeof(s_hostname), "%s", HOSTNAME);
    snprintf(s_printer_name, sizeof(s_printer_name), "%s", PRINTER_NAME);
    nvs_handle_t h;
    if (err == ESP_OK && nvs_open(NS, NVS_READONLY, &h) == ESP_OK) {
        read_str(h, "host", s_hostname, sizeof(s_hostname), HOSTNAME);
        read_str(h, "pname", s_printer_name, sizeof(s_printer_name), PRINTER_NAME);
        nvs_close(h);
    }
    if (!settings_hostname_ok(s_hostname))
        snprintf(s_hostname, sizeof(s_hostname), "printer");
    if (!settings_printer_name_ok(s_printer_name))
        snprintf(s_printer_name, sizeof(s_printer_name), "Printer (ESP32)");
    ESP_LOGI(TAG, "printer \"%s\" at %s.local", s_printer_name, s_hostname);
}

const char *settings_hostname(void)
{
    return s_hostname;
}

const char *settings_printer_name(void)
{
    return s_printer_name;
}

bool settings_hostname_ok(const char *hostname)
{
    size_t n = hostname ? strlen(hostname) : 0;
    if (n < 1 || n > SETTINGS_HOSTNAME_MAX || hostname[0] == '-' || hostname[n - 1] == '-')
        return false;
    for (size_t i = 0; i < n; i++) {
        unsigned char c = (unsigned char)hostname[i];
        if (!(isalnum(c) || c == '-'))
            return false;
    }
    return true;
}

bool settings_printer_name_ok(const char *name)
{
    size_t n = name ? strlen(name) : 0;
    if (n < 1 || n > SETTINGS_PRINTER_NAME_MAX)
        return false;
    for (size_t i = 0; i < n; i++) {
        unsigned char c = (unsigned char)name[i];
        if (c < 0x20 || c == 0x7f)
            return false;
    }
    return name[0] != ' ' && name[n - 1] != ' ';
}

esp_err_t settings_set(const char *hostname, const char *printer_name)
{
    char host[SETTINGS_HOSTNAME_MAX + 1], pname[SETTINGS_PRINTER_NAME_MAX + 1];
    snprintf(host, sizeof(host), "%s", hostname && *hostname ? hostname : s_hostname);
    snprintf(pname, sizeof(pname), "%s", printer_name && *printer_name ? printer_name : s_printer_name);
    if (hostname && strlen(hostname) > SETTINGS_HOSTNAME_MAX)
        return ESP_ERR_INVALID_ARG;
    if (printer_name && strlen(printer_name) > SETTINGS_PRINTER_NAME_MAX)
        return ESP_ERR_INVALID_ARG;
    for (char *c = host; *c; c++)
        *c = (char)tolower((unsigned char)*c);
    if (!settings_hostname_ok(host) || !settings_printer_name_ok(pname))
        return ESP_ERR_INVALID_ARG;
    if (!strcmp(host, s_hostname) && !strcmp(pname, s_printer_name))
        return ESP_OK;
    nvs_handle_t h;
    esp_err_t err = nvs_open(NS, NVS_READWRITE, &h);
    if (err != ESP_OK)
        return err;
    err = nvs_set_str(h, "host", host);
    if (err == ESP_OK)
        err = nvs_set_str(h, "pname", pname);
    if (err == ESP_OK)
        err = nvs_commit(h);
    nvs_close(h);
    if (err == ESP_OK) {
        strcpy(s_hostname, host);
        strcpy(s_printer_name, pname);
        ESP_LOGI(TAG, "saved: printer \"%s\" at %s.local (applies after a restart)", pname, host);
    }
    return err;
}

static void restart_task(void *arg)
{
    vTaskDelay(pdMS_TO_TICKS(1000));
    esp_restart();
}

void settings_restart_soon(void)
{
    xTaskCreate(restart_task, "restart", 2048, NULL, 1, NULL);
}
