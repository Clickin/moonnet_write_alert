// ==UserScript==
// @name         TYPE-MOON Write Leave Alert
// @name:ko      TYPE-MOON 글쓰기 이탈 경고
// @namespace    https://www.typemoon.net/
// @version      0.1.1
// @description  Show the browser's default leave-page warning while TYPE-MOON SmartEditor2 is present.
// @description:ko TYPE-MOON SmartEditor2가 있는 동안 브라우저 기본 페이지 이탈 확인창을 표시합니다.
// @license      MIT
// @match        https://www.typemoon.net/*
// @match        http://www.typemoon.net/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const EDITOR_IFRAME_SRC =
    'https://www.typemoon.net/plugin/editor/smarteditor2/SmartEditor2Skin.html';
  const EDITOR_IFRAME_SELECTOR = [
    `iframe[src="${EDITOR_IFRAME_SRC}"]`,
    `iframe[src^="${EDITOR_IFRAME_SRC}?"]`,
  ].join(',');
  const WRITE_UPDATE_URL = 'https://www.typemoon.net/bbs/write_update.php';

  let leaveWarningEnabled = false;
  let allowNextUnload = false;

  function hasSmartEditorIframe() {
    return document.querySelector(EDITOR_IFRAME_SELECTOR) !== null;
  }

  function syncLeaveWarningState() {
    leaveWarningEnabled = hasSmartEditorIframe();
  }

  function isWriteCompletionForm(form) {
    if (!(form instanceof HTMLFormElement)) {
      return false;
    }

    const name = form.getAttribute('name') || form.name || '';
    const method = form.getAttribute('method') || form.method || '';
    const action = form.getAttribute('action') || form.action || '';

    if (name.toLowerCase() !== 'fwrite') {
      return false;
    }

    if (method.toLowerCase() !== 'post') {
      return false;
    }

    try {
      return new URL(action, window.location.href).href === WRITE_UPDATE_URL;
    } catch (_error) {
      return false;
    }
  }

  function handleSubmit(event) {
    if (!isWriteCompletionForm(event.target)) {
      return;
    }

    allowNextUnload = true;
    window.setTimeout(() => {
      allowNextUnload = false;
    }, 1000);
  }

  function handleBeforeUnload(event) {
    if (!leaveWarningEnabled || allowNextUnload) {
      allowNextUnload = false;
      return undefined;
    }

    event.preventDefault();
    event.returnValue = '';
    return '';
  }

  function startWatchingEditorPresence() {
    const root = document.documentElement || document.body;
    if (!root) {
      document.addEventListener('DOMContentLoaded', startWatchingEditorPresence, {
        once: true,
      });
      return;
    }

    syncLeaveWarningState();

    const observer = new MutationObserver(syncLeaveWarningState);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });
  }

  document.addEventListener('submit', handleSubmit, { capture: true });
  window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
  startWatchingEditorPresence();
})();
