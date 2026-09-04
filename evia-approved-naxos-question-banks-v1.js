(() => {
  'use strict';

  const BANK_URL = 'https://ddrnfinch.github.io/Naxos-Mapping_Engine/question-banks.json';
  let bankData = null;
  let bankLoadPromise = null;

  function validQuestions(items) {
    return Array.isArray(items) && items.every((item) =>
      item && typeof item.q === 'string' &&
      Array.isArray(item.a) && item.a.length === 4 &&
      Number.isInteger(item.correct) && item.correct >= 0 && item.correct < 4
    );
  }

  function activeQualificationId() {
    const direct = cleanText(
      activeCourseMeta?.qualificationId ||
      activeCourseMeta?.qualification?.id ||
      ''
    ).toUpperCase();
    if (direct) return direct;

    const title = cleanText(activeCourseTitle).toUpperCase();
    if (title.includes('ST0264') && title.includes('ARCHITECTURAL')) return 'ST0264-AJ';
    if (title.includes('ST0264') && title.includes('SITE CARPENTER')) return 'ST0264-SITE';
    for (const id of ['ST0095', 'ST0171', '6570-04', '6570-05']) {
      if (title.includes(id)) return id;
    }
    return '';
  }

  async function ensureNaxosQuestionBanks() {
    if (bankData) return bankData;
    if (bankLoadPromise) return bankLoadPromise;

    bankLoadPromise = (async () => {
      const response = await fetch(BANK_URL, { cache: 'default' });
      if (!response.ok) throw new Error(`Naxos question bank returned ${response.status}.`);
      const data = await response.json();
      if (data?.naxosQuestionBank !== 1 || !data?.banks) throw new Error('Invalid Naxos question bank.');
      for (const scope of Object.values(data.banks)) {
        if (!scope || typeof scope !== 'object') continue;
        for (const questions of Object.values(scope)) {
          if (!validQuestions(questions)) throw new Error('Invalid question list in Naxos question bank.');
        }
      }
      bankData = data;
      return bankData;
    })();

    try {
      return await bankLoadPromise;
    } catch (error) {
      bankLoadPromise = null;
      throw error;
    }
  }

  function bankForCategory(category) {
    if (!bankData) return [];
    const key = cleanText(category).toLowerCase();
    const common = bankData.banks?.common?.[key];
    if (validQuestions(common) && common.length) return common;

    const qualificationId = activeQualificationId();
    const course = bankData.banks?.[qualificationId]?.[key];
    if (validQuestions(course) && course.length) return course;

    const generic = bankData.banks?.generic?.[key];
    return validQuestions(generic) ? generic : [];
  }

  const originalStartTestMe = startTestMe;

  testBankForCategory = function(category) {
    return bankForCategory(category);
  };

  startTestMe = async function() {
    try {
      await ensureNaxosQuestionBanks();
    } catch (error) {
      console.warn('Naxos question bank unavailable', error);
      testState = null;
      await chatSay('The Naxos question bank is not available yet. Try again when course data is available.', [
        { label: 'Main menu', action: 'chat-home' }
      ]);
      return;
    }
    return originalStartTestMe();
  };

  for (const key of Object.keys(quickTestBanks)) quickTestBanks[key] = Object.freeze([]);
  for (const key of Object.keys(epaQuestionBanks)) epaQuestionBanks[key] = Object.freeze([]);

  const style = document.createElement('style');
  style.id = 'evia-approved-chat-one-column-v1';
  style.textContent = '.chat-options{grid-template-columns:minmax(0,1fr)!important;}';
  document.head.appendChild(style);

  ensureNaxosQuestionBanks().catch(() => {});

  window.__eviaNaxosQuestionBanks = Object.freeze({
    ensure: ensureNaxosQuestionBanks,
    qualificationId: activeQualificationId,
    bankForCategory
  });
})();
