(function () {
    'use strict';

    const target = document.documentElement;
    const colorStorageKey = 'user-theme-scheme';
    const targetAttributeName = 'data-theme-scheme';

    const colorModList = {
        'auto': true, 'day': true, 'sunset': true, 'night': true, 'moonlight': true, 'lowlight': true
    };

    const themeButtonStatement = {
        'auto': '1', 'day': '2', 'sunset': '3', 'night': '4', 'moonlight': '5', 'lowlight': '6'
    };

    const themeButtonEvent = {
        '1': 'auto', '2': 'day', '3': 'sunset', '4': 'night', '5': 'moonlight', '6': 'lowlight'
    };

    const siteLocStorage = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('LocalStorage set failed:', e);
        }
    };

    const getLocStorage = (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('LocalStorage get failed:', e);
            return null;
        }
    };

    const getMQMod = () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'moonlight' : 'auto';
    };

    const siteAutoTheme = () => {
        let timeOnLoad = window.WordCard ? WordCard.getTimeInNeed('hour') : new Date().getHours();

        if (timeOnLoad >= 5 && timeOnLoad < 15) { return 'day' }
        else if (timeOnLoad >= 15 && timeOnLoad < 18) { return 'sunset' }
        else if (timeOnLoad >= 18 && timeOnLoad < 23) { return 'night' }
        else { return 'moonlight' }
    };

    const writeModAttribute = (value) => {
        if (value === 'auto') {
            target.setAttribute(targetAttributeName, siteAutoTheme());
        } else {
            target.setAttribute(targetAttributeName, value);
        }
        siteLocStorage(colorStorageKey, value);
    };

    const userModSitting = (mod) => {
        let siteMod = mod || getLocStorage(colorStorageKey);
        let mediaMod = getMQMod();

        if (siteMod === mediaMod) {
            writeModAttribute(mediaMod);
        } else if (colorModList[siteMod]) {
            writeModAttribute(siteMod);
        } else if (siteMod === null) {
            writeModAttribute(mediaMod);
        } else {
            target.setAttribute(targetAttributeName, siteAutoTheme());
            siteLocStorage(colorStorageKey, 'auto');
        }
    };

    const themeModSitting = () => {
        let sitetheme = getLocStorage(colorStorageKey);
        if (colorModList[sitetheme]) {
            sitetheme = themeButtonStatement[sitetheme];
        } else if (sitetheme === null) {
            sitetheme = themeButtonStatement[getMQMod()];
        } else {
            sitetheme = themeButtonStatement['auto'];
        }

        return sitetheme;
    };

    const themeListSite = (mod) => {
        let theme = mod || themeModSitting();
        let floatMod = document.getElementById('theme-' + theme);
        if (floatMod) {
            floatMod.classList.add('theme-be-actived');
        }
    };

    const themeListClean = (list) => {
        if (!list) return;
        list.forEach((item) => {
            item.classList.remove('theme-be-actived');
        });
    };

    const themeListSwitch = () => {
        let floatList = document.querySelectorAll('.theme-box li');

        floatList.forEach((item, key) => {
            let index = String(key + 1);
            item.setAttribute('data-value', index);
            item.addEventListener('click', () => {
                themeListClean(floatList);
                themeListSite(index);
                userModSitting(themeButtonEvent[index]);
            });
        });
    };

    const init = () => {
        userModSitting();
        themeListSite();
        themeListSwitch();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
