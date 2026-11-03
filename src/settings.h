// Names chosen at runtime: the printer's AirPrint name and its .local
// hostname, kept in NVS (namespace "setup"). They are set from the WiFi setup
// page and from the web UI's settings, and fall back to .env's PRINTER_NAME
// and HOSTNAME, so a prebuilt firmware needs no .env at all.
#pragma once

#include <stdbool.h>
#include <stddef.h>

#include "esp_err.h"

#define SETTINGS_HOSTNAME_MAX 32
#define SETTINGS_PRINTER_NAME_MAX 48

// Reads the saved names (needs nothing before it: it initialises NVS itself).
void settings_init(void);
const char *settings_hostname(void);
const char *settings_printer_name(void);

// 1 to 32 of a-z, 0-9 and '-', not at the ends (a DNS label; upper case is lowered by settings_set).
bool settings_hostname_ok(const char *hostname);
// 1 to 48 printable characters.
bool settings_printer_name_ok(const char *name);
// Saves both (NULL or "" keeps the current one). ESP_ERR_INVALID_ARG when one
// is not acceptable; nothing is written then. The names apply after a restart.
esp_err_t settings_set(const char *hostname, const char *printer_name);
// Restarts the board in about a second (after an HTTP reply went out).
void settings_restart_soon(void);
