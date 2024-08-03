// ==UserScript==
// @name         Neptun Rice
// @namespace    https://stringel.hu/
// @homepage     https://github.com/Str1ngel/neptun-rice
// @version      v0.0.2
// @description  Extensive theming for Neptun (dark base only)
// @author       Svecov Szergej
// @match        https://neptun.uni-obuda.hu/*
// @match        https://*.neptun.uni-obuda.hu/*
// @grant        GM.addStyle
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @run-at       document-start
// @updateURL    https://github.com/Str1ngel/neptun-rice/releases/latest/download/Neptun.Rice.user.js
// @downloadURL  https://github.com/Str1ngel/neptun-rice/releases/latest/download/Neptun.Rice.user.js
// @supportURL   https://github.com/glorantq/neptun-rice/issues
// ==/UserScript==

(async function () {
    'use strict';

    const DEFAULTS = {
        textColor: "#dddddd",
        darkText: "#121212",
        backgroundColor: "#1f1e1e",
        darkerBackground: "#171616",
        neptunBorderColor: "#232222",
        neptunLightGray: "#313131",
        neptunDarkGray: "#121212",
        neptunAlertBackground: "#FFDCA9",
        neptunAlertBorder: "#FAAB78",
        neptunLighterGray: "#474747",
        neptunMidDark: "#232222",
        neptunPrimary: "#EB8242",
        neptunPrimaryDark: "#C9753D",
        neptunPrimaryLight: "#F1AE89",
        npuGreen: "#83B582",
        npuYellow: "#FCDDB0",
        npuRed: "#EF4B4B",
        neptunFont: `system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
    };

    const cssBaseUrl = GM.info.script.version === "local" ? "http://127.0.0.1:8080/css" : `https://rawcdn.githack.com/Str1ngel/neptun-rice/${GM.info.script.version}/css`;

    const SETTINGS_KEYS = Object.keys(DEFAULTS);

    async function loadSettings() {
        const settings = {};
        for (const key of SETTINGS_KEYS) {
            settings[key] = await GM.getValue(key, DEFAULTS[key]);
        }
        settings.loginCssUrl = await GM.getValue("loginCssUrl", `${cssBaseUrl}/ndm_login.css`);
        settings.neptunCssUrl = await GM.getValue("neptunCssUrl", `${cssBaseUrl}/ndm_neptun.css`);
        settings.imagesCssUrl = await GM.getValue("imagesCssUrl", `${cssBaseUrl}/ndm_images.css`);
        return settings;
    }

    function generateCss(settings) {
        return `
        @import url("${settings.loginCssUrl}");
        @import url("${settings.imagesCssUrl}");
        @import url("${settings.neptunCssUrl}");

        :root {
            ${SETTINGS_KEYS.map(key => `--${key}: ${settings[key]};`).join('\n')}
            --neptunFont: ${settings.neptunFont};
        }

        /* Exclude elements with the class 'ignore-style' from being styled */
        .ignore-style * {
            all: unset;
        }
        `;
    }

    function addCss(css) {
        const styleElement = document.createElement("style");
        styleElement.innerHTML = css;
        styleElement.className = "ndm-style";
        document.head.appendChild(styleElement);

        // Exclude the timetable element from being styled
        const timetableElement = document.getElementById("upFunction_h_addsubjects_upOrarendTervezo_OrarendTervezo");
        if (timetableElement) {
            timetableElement.classList.add("ignore-style");
        }
    }

    function changeGadgetButton(title, newSource) {
        for (const button of document.getElementsByClassName("gadgetbutton")) {
            if (button.title === title) {
                button.src = newSource;
            }
        }
    }

    function createFooter() {
        const footer = document.createElement("footer");
        footer.id = "ndm_footer";

        const attribution1 = document.createElement("div");
        attribution1.id = "ndm_attribution1";

        const scriptName = document.createElement("a");
        scriptName.href = "https://github.com/glorantq/neptun-rice";
        scriptName.target = "_blank";
        scriptName.innerText = `${GM.info.script.name} ${GM.info.script.version}:`;

        const settingsButton = document.createElement("a");
        settingsButton.innerText = "Settings";

        attribution1.appendChild(scriptName);
        attribution1.appendChild(settingsButton);

        const attribution2 = document.createElement("span");
        attribution2.innerHTML = `Some icons on this page are used under license from <a href="https://icons8.com/">Icons8</a>`;

        footer.appendChild(attribution1);
        footer.appendChild(attribution2);

        document.body.appendChild(footer);

        return settingsButton;
    }

    function createSettingsDialog(settings) {
        const dialogContainer = document.createElement("div");
        dialogContainer.id = "ndm_dialog_container";

        const settingsDialog = document.createElement("div");
        settingsDialog.title = `${GM.info.script.name} Settings`;
        settingsDialog.id = "ndm_settings_dialog";
        settingsDialog.innerHTML = `
        <div id="ndm_settings_inner">
            ${generateSettingsHtml(settings)}
        </div>
        <div id="ndm_settings_buttons">
            <button class="button" type="button" id="ndm_settings_close">Close</button>
            <button class="button" type="button" id="ndm_settings_save">Save</button>
        </div>
        `;

        dialogContainer.appendChild(settingsDialog);
        document.body.appendChild(dialogContainer);

        return dialogContainer;
    }

    function generateSettingsHtml(settings) {
        return `
        <div class="ndm_property_wrapper">
            <h2>Theme colours</h2>
            <ul class="ndm_property_list">
                ${generateColorInputs(settings, ['neptunPrimary', 'neptunPrimaryDark', 'neptunPrimaryLight'])}
            </ul>
        </div>
        <div class="ndm_property_wrapper">
            <h2>Neptun PowerUp! colours</h2>
            <ul class="ndm_property_list">
                ${generateColorInputs(settings, ['npuGreen', 'npuYellow', 'npuRed'])}
            </ul>
        </div>
        <div class="ndm_property_wrapper">
            <h2>Common base colours</h2>
            <ul class="ndm_property_list">
                ${generateColorInputs(settings, ['textColor', 'darkText', 'backgroundColor', 'darkerBackground'])}
            </ul>
        </div>
        <div class="ndm_property_wrapper">
            <h2>Neptun base colours</h2>
            <ul class="ndm_property_list">
                ${generateColorInputs(settings, ['neptunLighterGray', 'neptunLightGray', 'neptunMidDark', 'neptunDarkGray', 'neptunBorderColor', 'neptunAlertBackground', 'neptunAlertBorder'])}
            </ul>
        </div>
        <div class="ndm_property_wrapper">
            <h2>Advanced</h2>
            <ul class="ndm_property_list">
                ${generateTextInputs(settings, ['loginCssUrl', 'neptunCssUrl', 'imagesCssUrl'])}
            </ul>
        </div>
        <div class="ndm_property_wrapper">
            <h2>Miscellaneous</h2>
            <ul class="ndm_property_list">
                <li><span>Version</span><span>${GM.info.script.version}</span></li>
                <li><span>Reset to default</span><a class="GadgetMenuItem" id="ndm_reset_colors_button">Reset</a></li>
                <li><span>Export theme</span><a class="GadgetMenuItem" id="ndm_export_button">Export</a></li>
                <li><span>Import theme</span><a class="GadgetMenuItem" id="ndm_import_button">Import</a></li>
            </ul>
        </div>
        `;
    }

    function generateColorInputs(settings, keys) {
        return keys.map(key => `<li><span>${key.replace(/([A-Z])/g, ' $1')}</span><input type="color" value="${settings[key]}" name="${key}"></li>`).join('');
    }

    function generateTextInputs(settings, keys) {
        return keys.map(key => `<li><span>${key.replace(/([A-Z])/g, ' $1')}</span><input type="text" value="${settings[key]}" name="${key}"></li>`).join('');
    }

    function listProperties() {
        return Array.from(document.querySelectorAll('.ndm_property_list > li input')).map(input => ({
            name: input.name,
            value: input.value
        }));
    }

    async function resetColors() {
        for (const key of SETTINGS_KEYS) {
            await GM.deleteValue(key);
        }
        alert("Deleted all saved colours!");
        window.location.reload();
    }

    function exportTheme() {
        const savedTheme = {};
        for (const setting of listProperties()) {
            savedTheme[setting.name] = setting.value;
        }
        prompt("Theme data:", JSON.stringify(savedTheme));
    }

    function importTheme() {
        const themeData = prompt("Theme data:");
        if (themeData != null) {
            const theme = JSON.parse(themeData);
            for (const setting in theme) {
                document.querySelector(`.ndm_property_list > li input[name=${setting}]`).value = theme[setting];
            }
        }
    }

    async function saveColors() {
        for (const setting of listProperties()) {
            console.log(`${setting.name} => ${setting.value}`);
            await GM.setValue(setting.name, setting.value);
        }
        window.location.reload();
    }

    function openSettingsDialog(dialogContainer) {
        dialogContainer.className = "ndm-dialog-visible";
    }

    function closeSettingsDialog(dialogContainer) {
        dialogContainer.className = "";
    }

    const settings = await loadSettings();
    const css = generateCss(settings);
    addCss(css);

    console.log("[Neptun Rice] Injecting CSS");

    window.addEventListener("load", () => {
        console.log("[Neptun Rice] Window loaded, continuing");

        changeGadgetButton("Bezárás", "https://glorantv.web.elte.hu/neptun_assets/16_ghb_close.png");
        changeGadgetButton("Frissítés", "https://glorantv.web.elte.hu/neptun_assets/16_ghb_refresh.png");

        console.log("[Neptun Rice] Performing DOM hacks");

        const settingsButton = createFooter();
        const dialogContainer = createSettingsDialog(settings);

        document.getElementById("ndm_reset_colors_button").onclick = resetColors;
        document.getElementById("ndm_export_button").onclick = exportTheme;
        document.getElementById("ndm_import_button").onclick = importTheme;
        document.getElementById("ndm_settings_close").onclick = () => closeSettingsDialog(dialogContainer);
        document.getElementById("ndm_settings_save").onclick = () => setTimeout(saveColors, 1);

        settingsButton.onclick = () => openSettingsDialog(dialogContainer);

        console.log("[Neptun Rice] Done");
    });
})();
