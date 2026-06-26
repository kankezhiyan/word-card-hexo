(function () {
    'use strict';

    var scrollTimer = null;

    var getScrollTop = function () {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    var throttle = function (fn, delay) {
        return function () {
            if (scrollTimer) return;
            scrollTimer = setTimeout(function () {
                fn();
                scrollTimer = null;
            }, delay);
        };
    };

    var initBackToTop = function () {
        var toTop = document.getElementById('back-to-top');
        if (!toTop) return;
        toTop.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.WordCard && window.WordCard.scrollToDest) {
                window.WordCard.scrollToDest(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    var initScrollDown = function () {
        var scrollDown = document.getElementById('scroll-down');
        var paperMain = document.getElementById('paper-main');
        if (!scrollDown || !paperMain) return;
        scrollDown.addEventListener('click', function () {
            if (window.WordCard && window.WordCard.scrollToDest) {
                window.WordCard.scrollToDest(paperMain.getBoundingClientRect().top + window.pageYOffset, 300);
            } else {
                window.scrollTo({ top: paperMain.getBoundingClientRect().top + window.pageYOffset, behavior: 'smooth' });
            }
        });
    };

    var initDynamicTitle = function () {
        var config = window.wordcardDynamicTitle || {};
        if (!config.enabled) return;

        var hiddenText = config.hidden || '\u9875\u9762\u5DF2\u4F11\u7720';
        var visibleText = config.visible || '\u9875\u9762\u5DF2\u663E\u793A';

        var originalTitle = document.title;
        var welcomeTimer = null;
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                document.title = hiddenText;
                if (welcomeTimer) {
                    clearTimeout(welcomeTimer);
                    welcomeTimer = null;
                }
            } else {
                document.title = visibleText;
                welcomeTimer = setTimeout(function () {
                    document.title = originalTitle;
                }, 1500);
            }
        });
    };

    var initSidebarMovement = function () {
        var sidebar = document.getElementById('side-bar');
        var paperMain = document.getElementById('paper-main');
        if (!sidebar || !paperMain) return;

        var updateSidebar = function () {
            var triggerPoint = paperMain.getBoundingClientRect().top;
            if (triggerPoint <= 0) {
                sidebar.classList.add('side-in');
            } else {
                sidebar.classList.remove('side-in');
            }
        };

        updateSidebar();
        window.addEventListener('scroll', throttle(updateSidebar, 100), { passive: true });
        window.addEventListener('resize', throttle(updateSidebar, 100));
    };

    var initLinkShare = function () {
        var shareLink = document.getElementById('share-page');
        if (!shareLink) return;
        var config = window.wordcardShareText || {};
        var prefix = config.prefix !== undefined ? config.prefix : '';
        var suffix = config.suffix !== undefined ? config.suffix : '';
        var successMsg = config.successMsg !== undefined ? config.successMsg : '\u5DF2\u590D\u5236\u94FE\u63A5';
        var errorMsg = config.errorMsg !== undefined ? config.errorMsg : '\u590D\u5236\u94FE\u63A5\u5931\u8D25';
        shareLink.addEventListener('click', function () {
            var url = window.location.href;
            var shareText = prefix + url + suffix;
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shareText).then(() => {
                    if (window.WordCard && window.WordCard.showAlert) {
                        window.WordCard.showAlert(successMsg, "success");
                    } else { alert(successMsg) }
                }, () => {
                    if (window.WordCard && window.WordCard.showAlert) {
                        window.WordCard.showAlert(errorMsg, "error")
                    } else {
                        alert(errorMsg)
                    }
                });
            }
        })
    }

    var initThemeBox = function () {
        var themeMask = document.getElementById('theme-mask');
        var themeUser = document.getElementById('theme-user');
        var themeSearch = document.getElementById('theme-search');
        var themeUserBox = document.getElementById('theme-user-box');
        var themeSearchBox = document.getElementById('theme-search-box');
        var bodyStyle = document.body.style;

        if (!themeMask || !themeUser || !themeSearch || !themeUserBox || !themeSearchBox || !bodyStyle) return;

        var hideAll = function () {
            themeUserBox.classList.remove('theme-bar-appear');
            themeSearchBox.classList.remove('theme-bar-appear');
            themeMask.classList.remove('mark-appear');
            bodyStyle.removeProperty('overflow', 'hidden');
        };

        themeUser.addEventListener('click', function (e) {
            e.stopPropagation();
            hideAll();
            themeMask.classList.add('mark-appear');
            themeUserBox.classList.add('theme-bar-appear');
            bodyStyle.setProperty('overflow', 'hidden');
        });

        themeSearch.addEventListener('click', function (e) {
            e.stopPropagation();
            hideAll();
            themeMask.classList.add('mark-appear');
            themeSearchBox.classList.add('theme-bar-appear');
            bodyStyle.setProperty('overflow', 'hidden');
        });

        themeMask.addEventListener('click', function () {
            hideAll();
        });
    };

    var initAll = function () {
        initBackToTop();
        initScrollDown();
        initDynamicTitle();
        initSidebarMovement();
        initLinkShare()
        initThemeBox();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
