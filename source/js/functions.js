(function (window) {
	'use strict';

	// 获取时间
	const getTimeInNeed = (type) => {
		const date = new Date();

		switch (type) {
			case 'hour':
				return date.getHours();
			case 'month':
				return date.getMonth();
			case 'date':
				return date.getDate();
			default:
				return null;
		}
	};

	// 获取视窗高度
	const getClientHeight = () => {
		const bodyHeight = document.body.clientHeight;
		const docHeight = document.documentElement.clientHeight;
		return Math.min(bodyHeight, docHeight);
	};

	// 获取视窗宽度
	const getClientWidth = () => {
		const bodyWidth = document.body.clientWidth;
		const docWidth = document.documentElement.clientWidth;
		return Math.min(bodyWidth, docWidth);
	};

	// 平滑滚动
	const scrollToDest = (pos, time = 300) => {
		const currentPos = window.pageYOffset;
		const targetPos = currentPos > pos ? pos - 50 : pos;

		if ('scrollBehavior' in document.documentElement.style) {
			window.scrollTo({
				top: targetPos,
				behavior: 'smooth'
			});
			return;
		}

		let start = null;
		const finalPos = +targetPos;

		const step = (currentTime) => {
			start = !start ? currentTime : start;
			const progress = currentTime - start;

			if (currentPos < finalPos) {
				window.scrollTo(0, ((finalPos - currentPos) * progress / time) + currentPos);
			} else {
				window.scrollTo(0, currentPos - ((currentPos - finalPos) * progress / time));
			}

			if (progress < time) {
				window.requestAnimationFrame(step);
			} else {
				window.scrollTo(0, finalPos);
			}
		};

		window.requestAnimationFrame(step);
	};

	let alertTimer = null;
	let alertTimeout = null;

	const showAlert = (message, type = 'info') => {
		const alertBar = document.getElementById('alert-bar');
		const alertMessage = document.getElementById('alert-message');
		const alertIcon = document.querySelector('.alert-icon i');

		if (!alertBar || !alertMessage || !alertIcon) {
			return;
		}

		if (alertTimer) {
			clearTimeout(alertTimer);
		}
		if (alertTimeout) {
			clearTimeout(alertTimeout);
		}

		alertMessage.textContent = message;

		switch (type) {
			case 'success':
				alertIcon.className = 'fa fa-check-circle';
				break;
			case 'error':
				alertIcon.className = 'fa fa-times-circle';
				break;
			case 'warning':
				alertIcon.className = 'fa fa-exclamation-triangle';
				break;
			default:
				alertIcon.className = 'fa fa-bell';
		}

		alertBar.style.display = 'block';
		alertBar.style.opacity = '0';
		alertBar.style.transform = 'translateX(-50%) translateY(-60%)';

		alertTimer = setTimeout(() => {
			alertBar.style.opacity = '1';
			alertBar.style.transform = 'translateX(-50%) translateY(-50%)';

			alertTimeout = setTimeout(() => {
				alertBar.style.opacity = '0';
				alertBar.style.transform = 'translateX(-50%) translateY(-60%)';

				alertTimer = setTimeout(() => {
					alertBar.style.display = 'none';
				}, 500);
			}, 3000);
		}, 50);
	};

//特定日期自动悼念模式
const wordcardParseMourningDates = (raw) => {
    if (!raw) return [];
    return String(raw)
        .split(/[,，\s]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
            const m = s.replace(/[月日\/\.\-]+/g, '-').match(/^(\d{1,2})-(\d{1,2})$/);
            if (!m) return '';
            const mm = String(parseInt(m[1], 10)).padStart(2, '0');
            const dd = String(parseInt(m[2], 10)).padStart(2, '0');
            const month = parseInt(mm, 10);
            const day = parseInt(dd, 10);
            if (month < 1 || month > 12 || day < 1 || day > 31) return '';
            return `${mm}-${dd}`;
        })
        .filter(Boolean);
};

const wordcardIsMourningDay = (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) return false;
    const now = new Date();
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return dates.indexOf(today) !== -1;
};

const wordcardApplyMourningByDate = (enable) => {
    const html = document.documentElement;
    if (!html) return;
    if (enable) {
        html.style.setProperty('--global-grayscale', 'grayscale(100%)');
        html.setAttribute('data-wordcard-mourning-by-date', '1');
    } else {
        html.style.removeProperty('--global-grayscale');
        html.removeAttribute('data-wordcard-mourning-by-date');
    }
};

const initMourningByDate = () => {
    const cfg = window.wordcardMourningByDateConfig;
    if (!cfg) return;
    if (cfg.enabled !== '1' && cfg.enabled !== 1 && cfg.enabled !== 'true' && cfg.enabled !== true) {
        return;
    }
    const dates = wordcardParseMourningDates(cfg.dates || '');
    if (wordcardIsMourningDay(dates)) {
        wordcardApplyMourningByDate(true);
    }
};

// 评论区回调
const handleCommentSubmit = (e) => {
		e.preventDefault();

		const form = e.target;
		const authorInput = document.getElementById('comment-author');
		const emailInput = document.getElementById('comment-email');
		const commentInput = document.getElementById('comment');

		const author = authorInput ? authorInput.value.trim() : '';
		const email = emailInput ? emailInput.value.trim() : '';
		const comment = commentInput ? commentInput.value.trim() : '';

		const isLoggedIn = document.querySelector('.logged-in-as') !== null;

		if (!isLoggedIn && !author) {
			showAlert('请填写昵称', 'warning');
			authorInput.focus();
			return;
		}

		if (!isLoggedIn && !email) {
			showAlert('请填写邮箱', 'warning');
			emailInput.focus();
			return;
		}

		if (!isLoggedIn && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			showAlert('请填写有效的邮箱地址', 'warning');
			emailInput.focus();
			return;
		}

		if (!comment) {
			showAlert('请填写评论内容', 'warning');
			commentInput.focus();
			return;
		}

		const submitBtn = form.querySelector('#submit');
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.innerHTML = '<span class="submit-btn-text"><i class="fa fa-spinner fa-spin"></i></span>发送中...';
		}

		const formData = new FormData(form);

		fetch(form.action, {
			method: 'POST',
			body: formData,
			credentials: 'same-origin'
		})
		.then(response => response.text())
		.then(data => {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = data;

			const errorEl = tempDiv.querySelector('#commentform .error, .comment-respond #respond .error, .comment-form-comment ~ .error');
			const hasErrorNotice = errorEl && errorEl.textContent.trim();

			if (hasErrorNotice) {
				showAlert(errorEl.textContent.trim(), 'error');
			} else {
				showAlert('评论提交成功，评论将在审核后展示', 'success');
				form.reset();
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			}
		})
		.catch(() => {
			showAlert('评论提交失败，请稍后重试', 'error');
		})
		.finally(() => {
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.innerHTML = '<span class="submit-btn-text"><i class="fa fa-send"></i></span>发送';
			}
		});
	};

	const initCommentForm = () => {
		const commentForm = document.getElementById('commentform');
		if (commentForm) {
			commentForm.setAttribute('novalidate', 'novalidate');
			commentForm.addEventListener('submit', handleCommentSubmit);
		}
	};

	// 关闭轻提示
	const initAlertClose = () => {
		const alertClose = document.getElementById('alert-close');
		const alertBar = document.getElementById('alert-bar');

		if (alertClose && alertBar) {
			alertClose.addEventListener('click', () => {
				alertBar.style.opacity = '0';
				alertBar.style.transform = 'translateX(-50%) translateY(-60%)';

				if (alertTimer) {
					clearTimeout(alertTimer);
				}
				if (alertTimeout) {
					clearTimeout(alertTimeout);
				}

				alertTimer = setTimeout(() => {
					alertBar.style.display = 'none';
				}, 500);
			});
		}
	};

	const initCommentPageJump = () => {
		const pageInput = document.getElementById('comment-page-input');
		const goButton = document.getElementById('comment-page-go');

		if (pageInput && goButton) {
			goButton.addEventListener('click', () => {
				const targetPage = parseInt(pageInput.value, 10);
				const maxPage = parseInt(pageInput.getAttribute('max'), 10);

				if (isNaN(targetPage) || targetPage < 1) {
					pageInput.value = 1;
					pageInput.focus();
					return;
				}

				if (targetPage > maxPage) {
					pageInput.value = maxPage;
					pageInput.focus();
					return;
				}

				const url = new URL(window.location.href);
				url.searchParams.set('cpage', targetPage);
				window.location.href = url.toString();
			});

			pageInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					goButton.click();
				}
			});
		}
	};

	const initScrollToComments = () => {
		const hash = window.location.hash;
		if (hash === '#comments' || hash === '#respond') {
			const target = document.querySelector(hash);
			if (target) {
				const targetPos = target.getBoundingClientRect().top + window.pageYOffset - 72;
				setTimeout(() => {
					window.scrollTo({
						top: targetPos,
						behavior: 'smooth'
					});
				}, 100);
			}
		}
	};

	const initSitePageJump = () => {
		const pageJump = document.querySelector('.page-jump');
		if (!pageJump) {
			return;
		}

		const pageInput = pageJump.querySelector('.page-jump-input');
		const goButton = pageJump.querySelector('.page-jump-go');

		if (pageInput && goButton) {
			goButton.addEventListener('click', () => {
				const targetPage = parseInt(pageInput.value, 10);
				const maxPage = parseInt(pageInput.getAttribute('max'), 10);

				if (isNaN(targetPage) || targetPage < 1) {
					pageInput.value = 1;
					pageInput.focus();
					return;
				}

				if (targetPage > maxPage) {
					pageInput.value = maxPage;
					pageInput.focus();
					return;
				}

				const url = new URL(window.location.href);
				if (targetPage === 1) {
					url.searchParams.delete('paged');
				} else {
					url.searchParams.set('paged', targetPage);
				}
				window.location.href = url.toString();
			});

			pageInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					goButton.click();
				}
			});
		}
	};

	document.addEventListener('DOMContentLoaded', () => {
		initCommentForm();
		initAlertClose();
		initCommentPageJump();
		initScrollToComments();
		initSitePageJump();
		initMourningByDate();
	});

	// 暴露到全局
	window.WordCard = {
		getTimeInNeed,
		getClientHeight,
		getClientWidth,
		scrollToDest,
		showAlert,
		initMourningByDate,
		wordcardIsMourningDay,
		wordcardParseMourningDates
	};
})(window);