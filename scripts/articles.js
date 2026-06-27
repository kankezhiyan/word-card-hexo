'use strict';

hexo.extend.generator.register('articles', function(locals) {
  var config = hexo.config;
  var perPage = config.per_page || 10;
  var posts = locals.posts.sort('-date');
  var base = 'articles';

  if (perPage === 0) {
    return {
      path: base + '/index.html',
      layout: ['page'],
      data: Object.assign({}, locals, {
        __articles_pagination: true,
        posts: posts,
        page: 1,
        current: 1,
        total: 1,
        prev: 0,
        next: 0,
        prev_link: '',
        next_link: '',
        base: '/' + base + '/',
        total_posts: posts.length
      })
    };
  }

  var total = Math.ceil(posts.length / perPage);
  var result = [];

  for (var i = 1; i <= total; i++) {
    var start = (i - 1) * perPage;
    var end = start + perPage;
    var data = {
      __articles_pagination: true,
      posts: posts.slice(start, end),
      page: i,
      current: i,
      total: total,
      prev: i > 1 ? i - 1 : 0,
      next: i < total ? i + 1 : 0,
      prev_link: i > 1 ? (i === 2 ? '/' + base + '/' : '/' + base + '/page/' + (i - 1) + '/') : '',
      next_link: i < total ? '/' + base + '/page/' + (i + 1) + '/' : '',
      base: '/' + base + '/',
      total_posts: posts.length
    };

    result.push({
      path: i === 1 ? base + '/index.html' : base + '/page/' + i + '/index.html',
      layout: ['page'],
      data: Object.assign({}, locals, data)
    });
  }

  return result;
});
