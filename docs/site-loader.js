(function () {
  'use strict';

  const target = new URL('./scifi-ui/', window.location.href);
  target.search = window.location.search;
  target.hash = window.location.hash;

  if (target.href !== window.location.href) {
    window.location.replace(target.href);
  }
}());
