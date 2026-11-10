/* Live npm dist-tag lookup with an honest unavailable fallback. */
(function () {
  'use strict';
  var link = document.getElementById('npm-latest-version');
  var status = document.getElementById('npm-version-status');
  if (!link || !status || typeof fetch !== 'function' || typeof AbortController !== 'function') return;
  function message(en, th) {
    status.replaceChildren();
    [['en', en], ['th', th]].forEach(function (item) {
      var span = document.createElement('span');
      span.className = item[0];
      span.textContent = item[1];
      status.appendChild(span);
    });
  }
  message('(checking registry…)', '(กำลังตรวจสอบ registry…)');
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, 5000);
  fetch('https://registry.npmjs.org/create-issflow/latest', {
    signal: controller.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer'
  }).then(function (response) {
    if (!response.ok) throw new Error('Registry unavailable');
    return response.json();
  }).then(function (data) {
    if (!data || data.name !== 'create-issflow' || typeof data.version !== 'string' ||
        !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(data.version) || data.version.length > 100) {
      throw new Error('Invalid registry response');
    }
    link.textContent = 'v' + data.version;
    link.href = 'https://www.npmjs.com/package/create-issflow/v/' + encodeURIComponent(data.version);
    status.replaceChildren();
  }).catch(function () {
    message('(unable to verify; open npm)', '(ตรวจสอบไม่ได้ โปรดเปิด npm)');
  }).finally(function () { clearTimeout(timer); });
})();
