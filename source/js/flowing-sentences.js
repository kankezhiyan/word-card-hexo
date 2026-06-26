(function () {
	'use strict';

	const config = window.wordcardSentencesConfig || {};

	const showBox = document.getElementById('sentences');
	const words = document.getElementById('words');
	const source = document.getElementById('author');

	if (!words || !source || !showBox) {
		return;
	}

	// 自定义数据模式：缓存数组
	let customDataCache = null;

	// 一言模式：请求 API
	const fetchHitokoto = async () => {
		const url = config.apiUrl || 'https://v1.hitokoto.cn';
		try {
			const response = await fetch(url, {
				method: 'GET',
				mode: 'cors',
				headers: {
					'Cache-Control': 'no-cache',
					'pragma': 'no-cache'
				}
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.warn('Failed to fetch from hitokoto API:', error);
			return null;
		}
	};

	// 自定义模式：首次请求并缓存
	const fetchCustomData = async () => {
		const url = config.customUrl || config.defaultUrl;
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Cache-Control': 'no-cache',
					'pragma': 'no-cache'
				}
			});
			customDataCache = await response.json();
			return customDataCache;
		} catch (error) {
			console.warn('Failed to fetch custom data:', error);
			return null;
		}
	};

	// 自定义模式：从缓存随机取一条
	const getRandomFromCache = () => {
		if (!customDataCache || customDataCache.length === 0) return null;
		const index = Math.floor(Math.random() * customDataCache.length);
		return customDataCache[index];
	};

	// 写入页面
	const writeInfo = async () => {
		if (config.source === 'hitokoto') {
			// 一言模式
			const data = await fetchHitokoto();
			if (data && data.hitokoto) {
				words.innerHTML = data.hitokoto;
				if (data.type === 'd') {
					const fromText = data.from ? data.from.replace(/[《》]/g, '') : '';
					source.innerHTML = `——${fromText ? '《' + fromText + '》' : '佚名'}`;
				} else {
					source.innerHTML = `——${data.from ? '「' + data.from + '」' : '佚名'}`;
				}
				showBox.setAttribute('href', `https://hitokoto.cn?uuid=${data.uuid || ''}`);
			} else {
				words.innerHTML = 'Word Card, 一个简单优雅的 WordPress 主题';
				source.innerHTML = '——Word Card';
				showBox.setAttribute('href', '/');
			}
		} else {
			// 自定义模式
			if (!customDataCache) {
				await fetchCustomData();
			}
			const item = getRandomFromCache();
			if (item) {
				words.innerHTML = item.sentences || '';
				source.innerHTML = `——${item.author || '佚名'}`;
			} else {
				words.innerHTML = 'Word Card, 一个简单优雅的 WordPress 主题';
				source.innerHTML = '——Word Card';
			}
			showBox.setAttribute('href', config.customLink || '/');
		}
	};

	// 定时更新句子内容
	const rollingInfo = async () => {
		setTimeout(rollingInfo, 8000);
		showBox.style.opacity = 0;
		await writeInfo();
		showBox.style.opacity = 1;
	};

	// 初始化并启动滚动
	rollingInfo();
})();