"use client";

import { type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

type EviaExpression = "idle" | "look-down" | "look-up-left" | "look-up-right" | "smile" | "curious" | "sleepy" | "double-blink" | "happy-bounce";
type View =
  | "root"
  | "course"
  | "study"
  | "portfolio"
  | "settings"
  | "install-app"
  | "toc-settings"
  | "ksb-progress"
  | "otj-progress"
  | "epa-practice"
  | "epa-session"
  | "evidence-options"
  | "evidence"
  | "evidence-list"
  | "portfolio-download"
  | "profile"
  | "profile-details"
  | "accessibility"
  | "study-library"
  | "study-module"
  | "manage-course"
  | "import-course"
  | "paste-layout"
  | "build-course"
  | "units"
  | "unit"
  | "admin-lock"
  | "admin"
  | "admin-rpl"
  | "placeholder";
type KsbType = "Skill" | "Knowledge" | "Behaviour";
type CourseSource = "auto" | "layout" | "file";
type EvidenceMethod = "photo" | "video" | "written" | "audio" | "reflection" | "witness";
type EpaArea = "practical" | "interview" | "mcq";

type EviaInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type CourseKsb = {
  code: string;
  type: KsbType;
  title: string;
  description: string;
};

type CourseUnit = {
  id: string;
  number: number;
  title: string;
  summary: string;
  ksbs: CourseKsb[];
};

type LearnerCourse = {
  createdAt: number;
  mappingVersion: number;
  sourceType?: CourseSource;
  rawKsbs: string;
  units: CourseUnit[];
  inputCounts: { knowledge: number; skills: number; behaviours: number };
};

type CourseBuildResult = { course: LearnerCourse | null; error: string };

type CourseTimeline = {
  startDate: string;
  endDate: string;
  weeklyHours: number;
};

type EvidenceRecord = {
  id: string;
  ksbCode: string;
  ksbType: KsbType;
  method: EvidenceMethod;
  createdAt: number;
  updatedAt?: number;
  fileIds: string[];
  fileNames: string[];
  text?: string;
  witness?: {
    name: string;
    role: string;
    date: string;
    testimony: string;
    signature?: SignatureData;
    signedAt?: number;
  };
};

type SignaturePoint = { x: number; y: number };
type SignatureData = { strokes: SignaturePoint[][] };

type SignatureApproval = {
  name: string;
  role: string;
  signedAt: number;
  signature: SignatureData;
};

type PdfSignatureBlock = SignatureApproval & { label: string };

type ExportRequest = {
  kind: "unit" | "portfolio" | "otj";
  unitId?: string;
};

type ProgressSnapshot = {
  toc: number;
  ksb: number;
  otj: number;
  epa: number;
};

type AccessibilitySettings = {
  textSize: "standard" | "large" | "extra";
  highContrast: boolean;
  reduceMotion: boolean;
  readingFocus: boolean;
  readAloud: boolean;
};

type StudyCategory = "maths-english" | "trade" | "edi";

type StudyQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

type StudyModule = {
  id: string;
  category: StudyCategory;
  title: string;
  level: string;
  summary: string;
  sections: { title: string; body: string }[];
  questions: StudyQuestion[];
};

type OtjEntry = {
  id: string;
  date: string;
  title: string;
  hours: number;
  unitId?: string;
  createdAt?: number;
};

type ProgressItem = {
  label: "TOC" | "KSB" | "OTJ" | "EPA";
  name: string;
  value: number;
  target?: number;
  updated?: boolean;
  onClick: () => void;
};

type ReminderItem = {
  id: string;
  label: string;
  onClick?: () => void;
};

type EviaGuideStep = {
  title: string;
  body: string;
  prompt?: string;
  placeholder?: string;
};

const evidenceOptions: Record<KsbType, { method: EvidenceMethod; label: string; rule: string }[]> = {
  Skill: [
    { method: "photo", label: "3 photos", rule: "Three clear, specific photos" },
    { method: "video", label: "1 video", rule: "One continuous practical video" },
  ],
  Knowledge: [
    { method: "written", label: "Written statement", rule: "One written statement" },
    { method: "audio", label: "Audio explanation", rule: "One audio explanation" },
  ],
  Behaviour: [
    { method: "reflection", label: "Reflection", rule: "One reflective account" },
    { method: "witness", label: "Witness testimony", rule: "One witness testimony" },
  ],
};

const evidenceMethodNames: Record<EvidenceMethod, string> = {
  photo: "Photographic evidence",
  video: "Video evidence",
  written: "Written statement",
  audio: "Audio explanation",
  reflection: "Reflective account",
  witness: "Witness testimony",
};

const epaPracticeAreas: Record<EpaArea, { title: string; summary: string; steps: string[] }> = {
  practical: {
    title: "Practical mock",
    summary: "Rehearse the full practical assessment in the correct sequence and to the required standard.",
    steps: [
      "Read the practical brief and identify exactly what must be produced.",
      "Plan the sequence, materials, tools, safety controls and quality checks.",
      "Complete a timed practical rehearsal without tutor prompts.",
      "Review the finished work against tolerances and record what to improve.",
    ],
  },
  interview: {
    title: "Interview mock",
    summary: "Practise explaining your decisions, evidence and technical knowledge clearly.",
    steps: [
      "Choose evidence examples that show your strongest Skills and Behaviours.",
      "Practise describing what you did, why you did it and the result.",
      "Answer follow-up questions without reading from notes.",
      "Record the areas where your answer needs more detail or technical language.",
    ],
  },
  mcq: {
    title: "MCQ mock",
    summary: "Complete a timed multiple-choice knowledge check and review every incorrect answer.",
    steps: [
      "Select a mock covering the Knowledge statements in your course.",
      "Complete it under timed conditions without notes.",
      "Review each incorrect answer and return to the matching Knowledge statement.",
      "Repeat the weak topics, then record your final mock result.",
    ],
  },
};

const epaMcqQuestions: StudyQuestion[] = [
  {
    prompt: "What is the best first action when an EPA question feels unclear?",
    options: ["Guess quickly", "Ask for the permitted clarification", "Skip the whole assessment", "Read a prepared answer"],
    answer: 1,
    explanation: "Ask for clarification within the assessment rules, then answer the question that has actually been asked.",
  },
  {
    prompt: "Which answer structure gives an assessor the strongest work-based evidence?",
    options: ["A definition only", "What I did, why, result and learning", "A one-word answer", "What someone else usually does"],
    answer: 1,
    explanation: "A specific example showing your action, reasoning, result and learning demonstrates both competence and understanding.",
  },
  {
    prompt: "During a practical mock, when should quality be checked?",
    options: ["Only at the end", "Before, during and at completion", "Only if something fails", "After the assessor leaves"],
    answer: 1,
    explanation: "Planned checks throughout the task catch errors early and show a controlled working method.",
  },
  {
    prompt: "What should you do after an incorrect mock-test answer?",
    options: ["Memorise the option letter", "Review the linked KSB and explain the correct reasoning", "Delete the result", "Avoid that topic"],
    answer: 1,
    explanation: "Returning to the mapped KSB and explaining the reasoning turns the error into useful learning.",
  },
];

const studyModules: StudyModule[] = [
  {
    id: "maths-l1-number", category: "maths-english", title: "Maths: Number, Ratio & Percentages", level: "Level 1",
    summary: "Use whole numbers, fractions, decimals, ratios and percentages in realistic workplace problems.",
    sections: [
      { title: "Choose the operation", body: "Underline what the problem asks for, identify the known quantities and decide whether to add, subtract, multiply or divide. Estimate first so you can spot an unreasonable calculator answer." },
      { title: "Fractions, decimals and percentages", body: "These are different ways of showing a proportion. Convert a percentage to a decimal by dividing by 100. To find 20% of 85, calculate 0.20 × 85 = 17." },
      { title: "Ratio at work", body: "A ratio compares quantities in the same units. For a 1:4 mix, there are 5 total parts. A 25 litre batch therefore uses 5 litres of the first material and 20 litres of the second." },
    ],
    questions: [
      { prompt: "A job needs 240 items and 15% extra for waste. How many should be ordered?", options: ["255", "264", "276", "300"], answer: 2, explanation: "15% of 240 is 36, so 240 + 36 = 276." },
      { prompt: "A 1:3 mix totals 20 litres. How much is the first part?", options: ["4 L", "5 L", "6 L", "15 L"], answer: 1, explanation: "There are 4 equal parts; 20 ÷ 4 = 5 litres per part." },
      { prompt: "Which is equal to 0.35?", options: ["3.5%", "35%", "350%", "0.35%"], answer: 1, explanation: "Multiply a decimal by 100 to express it as a percentage." },
    ],
  },
  {
    id: "maths-l2-measure", category: "maths-english", title: "Maths: Measures, Formulae & Data", level: "Level 2",
    summary: "Solve multi-step problems involving scale, area, volume, formulae and workplace data.",
    sections: [
      { title: "Area and volume", body: "Keep units consistent before calculating. Rectangle area is length × width; a cuboid volume is length × width × height. State square or cubic units and round only at the end." },
      { title: "Scale and formulae", body: "At a 1:50 scale, 1 cm on a drawing represents 50 cm in reality. Substitute known values into a formula carefully, follow the order of operations and include the unit in the final answer." },
      { title: "Interpreting data", body: "Check titles, axes, units and sample size before drawing a conclusion. The mean can be distorted by an extreme value, so compare it with the median and range when judging performance." },
    ],
    questions: [
      { prompt: "A floor is 6.2 m by 4.5 m. What is its area?", options: ["10.7 m²", "21.4 m²", "27.9 m²", "55.8 m²"], answer: 2, explanation: "6.2 × 4.5 = 27.9 square metres." },
      { prompt: "On a 1:50 drawing, a wall measures 8 cm. What is the real length?", options: ["0.4 m", "4 m", "40 m", "400 m"], answer: 1, explanation: "8 × 50 = 400 cm, which is 4 metres." },
      { prompt: "Which measure is usually least affected by one extreme result?", options: ["Mean", "Median", "Range", "Total"], answer: 1, explanation: "The median is the middle value and is less influenced by a single outlier." },
    ],
  },
  {
    id: "english-l1", category: "maths-english", title: "English: Workplace Reading & Writing", level: "Level 1",
    summary: "Find key information, follow instructions and write clear, accurate workplace messages.",
    sections: [
      { title: "Purpose and audience", body: "Before reading or writing, decide why the text exists and who will use it. A site notice, customer email and method statement need different detail, tone and vocabulary." },
      { title: "Retrieve and check information", body: "Scan headings and keywords, then read the relevant section closely. Separate facts from opinions and cross-check dates, measurements, names and instructions before acting." },
      { title: "Write for action", body: "Use a clear subject, logical order and specific request. Check sentence boundaries, spelling and punctuation. A reader should know what happened, what is needed, who is responsible and by when." },
    ],
    questions: [
      { prompt: "Which email subject is clearest?", options: ["Hi", "Problem", "Action required: damaged delivery, 14 May", "Important!!!"], answer: 2, explanation: "It identifies the required action, issue and date without opening the message." },
      { prompt: "Where should you look first for one detail in a long procedure?", options: ["The final sentence", "Headings and keywords", "Every word at the same speed", "Only the pictures"], answer: 1, explanation: "Scanning the structure helps locate the section before close reading." },
      { prompt: "Which is a fact?", options: ["The room looks excellent", "The test was completed at 14:20", "This is probably safest", "The design feels modern"], answer: 1, explanation: "A recorded completion time can be checked objectively." },
    ],
  },
  {
    id: "english-l2", category: "maths-english", title: "English: Comparing Texts & Presenting a Case", level: "Level 2",
    summary: "Compare viewpoints, judge evidence and communicate a convincing, well-structured response.",
    sections: [
      { title: "Compare, do not just summarise", body: "Identify each writer’s purpose, viewpoint, evidence, tone and language choices. Explain both a similarity and a difference, supporting each point with a precise reference." },
      { title: "Judge reliability", body: "Ask who produced the information, when it was published, what evidence is supplied and whether another dependable source confirms it. Strong confidence needs more than confident wording." },
      { title: "Build a reasoned response", body: "State your position, organise related points into paragraphs and support claims with evidence. Address a reasonable counterargument before ending with a clear recommendation." },
    ],
    questions: [
      { prompt: "What makes a comparison analytical?", options: ["Retelling both texts", "Explaining how their evidence or viewpoints differ", "Counting paragraphs", "Choosing the longer text"], answer: 1, explanation: "Analysis links a specific feature to its effect or significance." },
      { prompt: "Which source check is strongest?", options: ["It has many colours", "It agrees with me", "Its author, date and supporting evidence can be verified", "It is short"], answer: 2, explanation: "Authority, currency and verifiable evidence are meaningful reliability checks." },
      { prompt: "Where should a counterargument appear?", options: ["It should never appear", "Where it can be answered with evidence", "Only in the title", "After the sign-off"], answer: 1, explanation: "Acknowledging and answering a reasonable objection strengthens the case." },
    ],
  },
  {
    id: "trade-coshh", category: "trade", title: "COSHH & Hazardous Substances", level: "Core construction",
    summary: "Recognise hazardous substances and apply the hierarchy of controls before relying on PPE.",
    sections: [
      { title: "What COSHH controls", body: "COSHH covers substances that can harm health, including dusts, fumes, vapours, liquids and biological agents. Labels and safety data sheets help, but the work activity and route of exposure must also be assessed." },
      { title: "Assess and control", body: "Identify the substance, who may be exposed, how exposure can occur and the likely harm. Prevent exposure where reasonably practicable; otherwise use suitable engineering controls, safe methods, training and only then appropriate PPE or RPE." },
      { title: "Check the controls", body: "Controls must be used, maintained and reviewed. Report damaged extraction, unsuitable RPE, spills or symptoms immediately and follow emergency, storage and disposal arrangements." },
    ],
    questions: [
      { prompt: "What should happen before PPE is treated as the main control?", options: ["Nothing", "Consider preventing exposure and engineering controls", "Ask workers to be careful", "Remove labels"], answer: 1, explanation: "PPE is important but sits below elimination and engineering controls in the control approach." },
      { prompt: "Which may be a COSHH hazard?", options: ["Silica dust", "A clean chair", "A pencil drawing", "A calendar"], answer: 0, explanation: "Respirable crystalline silica dust can cause serious lung disease and needs effective control." },
      { prompt: "When should a COSHH assessment be reviewed?", options: ["Never", "Only every ten years", "When work changes or controls may no longer be effective", "Only after a fine"], answer: 2, explanation: "A change, incident or evidence that controls are ineffective should trigger review." },
    ],
  },
  {
    id: "trade-riddor", category: "trade", title: "RIDDOR & Incident Reporting", level: "Core construction",
    summary: "Know what to record, escalate and report after a work-related incident.",
    sections: [
      { title: "Immediate response", body: "Protect life first: stop the activity, summon help, make the area safe without creating more risk and preserve relevant evidence. Follow the organisation’s emergency and internal reporting procedure." },
      { title: "What RIDDOR covers", body: "RIDDOR requires responsible persons to report specified work-related deaths, injuries, occupational diseases and dangerous occurrences. Not every accident is reportable, but internal records may still be required." },
      { title: "Accurate records", body: "Record facts promptly: who, what, where, when, immediate controls, witnesses and the outcome. Avoid guesses or blame. Escalate to the responsible person, who decides and submits any statutory report." },
    ],
    questions: [
      { prompt: "Who normally submits a RIDDOR report?", options: ["Any bystander", "The responsible person", "Only the injured person", "The equipment supplier"], answer: 1, explanation: "Employers, certain self-employed people and people in control of work premises may be responsible persons." },
      { prompt: "What belongs in an incident record?", options: ["Rumours", "Facts, time, place, people and actions", "Only who is blamed", "A later guess"], answer: 1, explanation: "A timely factual record supports investigation and any reporting decision." },
      { prompt: "What is the first priority after a serious incident?", options: ["Finish the task", "Protect people and summon help", "Post online", "Discard the evidence"], answer: 1, explanation: "Immediate safety and emergency response take priority." },
    ],
  },
  {
    id: "trade-handling", category: "trade", title: "Manual Handling & Safer Movement", level: "Core construction",
    summary: "Avoid hazardous handling where possible and plan safer lifts using task, load, individual and environment factors.",
    sections: [
      { title: "Avoid, assess, reduce", body: "First avoid hazardous manual handling where reasonably practicable. If it cannot be avoided, assess the risk and reduce it using mechanical aids, smaller loads, better layout, suitable team handling and clear information." },
      { title: "Dynamic assessment", body: "Consider the task, individual capability, load and environment. Check route, grip, stability, height, distance, repetition, lighting and floor condition. Stop if the conditions differ from the plan." },
      { title: "A controlled movement", body: "Plan the destination, get close to the load, use a stable position, move smoothly and avoid twisting. Technique does not make an unsuitable load safe, and there is no single legal maximum lifting weight." },
    ],
    questions: [
      { prompt: "What is the first control question?", options: ["Can hazardous handling be avoided?", "Can I lift faster?", "Who is watching?", "Can I hold my breath?"], answer: 0, explanation: "Avoiding the hazardous handling operation is the first consideration." },
      { prompt: "Is there one legal maximum weight that is safe for everyone?", options: ["Yes, 25 kg", "Yes, 20 kg", "No", "Only outdoors"], answer: 2, explanation: "Risk depends on the task, load, individual and environment, not one universal number." },
      { prompt: "When should a lift stop?", options: ["If the route or load is not as assessed", "Only after dropping it", "Never once started", "When someone speaks"], answer: 0, explanation: "A change in conditions can invalidate the assessment and requires a safer plan." },
    ],
  },
  {
    id: "trade-plans", category: "trade", title: "Drawings, Plans & Specifications", level: "Core construction",
    summary: "Read dimensions, symbols, scale, notes and revisions before turning technical information into work.",
    sections: [
      { title: "Orientate the information", body: "Confirm the drawing title, location, scale, revision, units and relationship between plan, elevation, section and detail. Never assume an old print is the current instruction." },
      { title: "Extract what controls the task", body: "Identify dimensions, levels, tolerances, materials, references and specification notes. Cross-check linked details and raise conflicts before work continues rather than choosing an interpretation silently." },
      { title: "Communicate changes", body: "Record requests for information and approved changes through the agreed system. Marking up a personal copy does not replace formal revision control or authorisation." },
    ],
    questions: [
      { prompt: "What should be checked before using a drawing?", options: ["Paper colour", "Revision and scale", "Who printed it", "Only the title font"], answer: 1, explanation: "Revision and scale are essential controls, together with title, units and location." },
      { prompt: "What should you do if a dimension conflicts with a detail?", options: ["Guess", "Raise the conflict through the agreed process", "Use the smaller number", "Ignore the detail"], answer: 1, explanation: "The conflict needs authorised clarification before affected work proceeds." },
      { prompt: "Which view usually shows a horizontal arrangement from above?", options: ["Plan", "Elevation", "Section", "Schedule"], answer: 0, explanation: "A plan conventionally shows the arrangement viewed from above." },
    ],
  },
  {
    id: "trade-law", category: "trade", title: "Construction Law & Site Responsibilities", level: "Core construction",
    summary: "Understand CDM roles, worker responsibilities and how lawful duties become practical site controls.",
    sections: [
      { title: "CDM is about managed work", body: "The Construction (Design and Management) Regulations 2015 place duties across the project team. Clients, designers and contractors must exchange useful information, appoint capable people and plan, manage, monitor and coordinate work in proportion to the risk." },
      { title: "The worker’s role", body: "A construction worker must have the skills, knowledge, training and experience needed for the work, or suitable training and supervision. Workers should understand site risks, follow rules and procedures, cooperate with dutyholders and report unsafe conditions." },
      { title: "Instructions do not remove judgement", body: "Use the current construction phase plan, induction, RAMS and task instructions, but stop and raise a concern if the activity or conditions are different. Take reasonable care of yourself and others and use provided equipment in line with training." },
    ],
    questions: [
      { prompt: "What is a contractor expected to do with construction work under CDM?", options: ["Plan, manage and monitor it", "Leave all safety to workers", "Start before planning", "Avoid coordination"], answer: 0, explanation: "Contractors plan, manage and monitor their work, provide suitable supervision and coordinate where required." },
      { prompt: "What should a worker do if site conditions differ from the safe plan?", options: ["Continue silently", "Stop and raise the concern", "Remove the controls", "Guess a new method"], answer: 1, explanation: "A changed condition can invalidate the planned control measures and needs review." },
      { prompt: "Which statement best describes worker competence?", options: ["A job title alone", "Relevant skills, knowledge, training and experience, or suitable supervision while learning", "Owning tools", "Time on site only"], answer: 1, explanation: "Competence is connected to the work and risk, with training and supervision supporting those still developing." },
    ],
  },
  {
    id: "edi-equality", category: "edi", title: "Equality, Diversity & Inclusion", level: "Core workplace",
    summary: "Work fairly, challenge exclusion and understand the practical difference between equality, equity, diversity and inclusion.",
    sections: [
      { title: "Four connected ideas", body: "Equality means fair access and treatment; equity recognises that people may need different support to reach a fair outcome. Diversity is the presence of difference, while inclusion means people can participate, contribute and belong." },
      { title: "Inclusive practice", body: "Use respectful language, pronounce names correctly, make information accessible and avoid assumptions about ability or background. Reasonable adjustments remove barriers without lowering the required occupational standard." },
      { title: "Respond to concerns", body: "Challenge unsafe or discriminatory behaviour when it is safe to do so, support the person affected, record facts and use the organisation’s reporting route. Do not promise secrecy you cannot keep." },
    ],
    questions: [
      { prompt: "What does an inclusive workplace do?", options: ["Treats every need as identical", "Removes barriers so people can participate", "Avoids all differences", "Lowers every standard"], answer: 1, explanation: "Inclusion creates meaningful participation while maintaining legitimate standards." },
      { prompt: "What is a reasonable adjustment intended to do?", options: ["Give an unfair advantage", "Remove a disability-related disadvantage", "Change a person’s job title", "Hide performance"], answer: 1, explanation: "Adjustments address substantial disadvantage and enable fair access." },
      { prompt: "What should a report of discrimination contain?", options: ["Facts and the agreed reporting route", "Online rumours", "A promise of total secrecy", "No dates"], answer: 0, explanation: "A factual, timely report through the proper route supports a fair response." },
    ],
  },
  {
    id: "edi-safeguarding", category: "edi", title: "Safeguarding & Speaking Up", level: "Core workplace",
    summary: "Recognise concerns, respond calmly and pass information to the right safeguarding person without investigating it yourself.",
    sections: [
      { title: "Notice the concern", body: "A concern may arise from a disclosure, injury, behaviour change, neglect, exploitation, online contact or something that does not feel right. You do not need proof before sharing a genuine safeguarding concern." },
      { title: "Receive a disclosure", body: "Listen, stay calm, take the person seriously and explain that you must share information with someone who can help. Do not interrogate, confront an alleged abuser or promise to keep the disclosure secret." },
      { title: "Record and report", body: "Write the person’s own words where possible, distinguish observation from opinion, add date and time, and contact the designated safeguarding lead or emergency services if there is immediate danger." },
    ],
    questions: [
      { prompt: "What should you promise after a safeguarding disclosure?", options: ["Complete secrecy", "That you will share it only with people who need to help", "That you will investigate", "That nobody will act"], answer: 1, explanation: "Be honest about the need to pass the concern to the appropriate safeguarding person." },
      { prompt: "Do you need proof before reporting a genuine concern?", options: ["Yes", "No", "Only after asking colleagues", "Only if it happened at work"], answer: 1, explanation: "Safeguarding staff assess concerns; the learner should record and report rather than investigate." },
      { prompt: "What should a disclosure record preserve?", options: ["The person’s own words", "Your improved version", "Only your opinion", "Nothing in writing"], answer: 0, explanation: "Accurate words, context, date and time matter." },
    ],
  },
  {
    id: "edi-values", category: "edi", title: "British Values & Prevent", level: "Core workplace",
    summary: "Apply democracy, rule of law, individual liberty, mutual respect and tolerance while knowing how to raise a Prevent concern.",
    sections: [
      { title: "Values in daily work", body: "Democracy includes having a voice and listening to others; rule of law means understanding and following lawful rules; individual liberty supports informed choices; mutual respect and tolerance protect people with different beliefs and backgrounds." },
      { title: "Professional disagreement", body: "People can disagree firmly without intimidation or dehumanising language. Test claims against reliable evidence, allow lawful viewpoints to be heard and challenge hatred or discrimination through safe reporting routes." },
      { title: "Prevent concerns", body: "Changes in behaviour alone do not prove radicalisation. Notice the whole context, record factual concerns and follow the provider’s safeguarding or Prevent route. Do not investigate or label the person yourself." },
    ],
    questions: [
      { prompt: "Which value supports people making lawful, informed choices?", options: ["Individual liberty", "Rule by rumour", "Silence", "Uniformity"], answer: 0, explanation: "Individual liberty includes protected, responsible choice within the law." },
      { prompt: "How should a Prevent concern be handled?", options: ["Publicly label the person", "Record facts and use the safeguarding route", "Investigate their devices", "Ignore all changes"], answer: 1, explanation: "Use the provider’s safeguarding process; do not conduct your own investigation." },
      { prompt: "Can mutual respect include disagreement?", options: ["No", "Yes, when expressed lawfully and without abuse", "Only online", "Only with a manager"], answer: 1, explanation: "Respectful disagreement is compatible with democratic participation and individual liberty." },
    ],
  },
];

const courseMappingVersion = 4;
const dayInMilliseconds = 86_400_000;
const evidenceDatabaseName = "evia-evidence-files";
const evidenceStoreName = "files";

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
}

function parseLocalDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function dateDifferenceInDays(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, (endUtc - startUtc) / dayInMilliseconds);
}

function todayDateValue() {
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function openEvidenceDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(evidenceDatabaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(evidenceStoreName)) {
        request.result.createObjectStore(evidenceStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Evidence storage is unavailable."));
  });
}

async function saveEvidenceFile(id: string, file: File) {
  const database = await openEvidenceDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(evidenceStoreName, "readwrite");
      transaction.objectStore(evidenceStoreName).put({
        id,
        blob: file,
        name: file.name,
        type: file.type,
        size: file.size,
        savedAt: Date.now(),
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("The evidence file could not be saved."));
      transaction.onabort = () => reject(transaction.error ?? new Error("The evidence file could not be saved."));
    });
  } finally {
    database.close();
  }
}

async function getEvidenceFile(id: string) {
  const database = await openEvidenceDatabase();
  try {
    return await new Promise<{ blob: Blob; name: string; type: string } | null>((resolve, reject) => {
      const transaction = database.transaction(evidenceStoreName, "readonly");
      const request = transaction.objectStore(evidenceStoreName).get(id);
      request.onsuccess = () => {
        const value = request.result as { blob?: Blob; name?: string; type?: string } | undefined;
        resolve(value?.blob ? { blob: value.blob, name: value.name ?? "evidence", type: value.type ?? value.blob.type } : null);
      };
      request.onerror = () => reject(request.error ?? new Error("The evidence file could not be opened."));
    });
  } finally {
    database.close();
  }
}

async function deleteEvidenceFile(id: string) {
  const database = await openEvidenceDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(evidenceStoreName, "readwrite");
      transaction.objectStore(evidenceStoreName).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("The evidence file could not be deleted."));
      transaction.onabort = () => reject(transaction.error ?? new Error("The evidence file could not be deleted."));
    });
  } finally {
    database.close();
  }
}

function evidenceRecordComplete(record: EvidenceRecord) {
  if (record.method === "photo") return record.fileIds.length >= 3;
  if (record.method === "video" || record.method === "audio") return record.fileIds.length >= 1;
  if (record.method === "written" || record.method === "reflection") return countWords(record.text ?? "") >= 30;
  return Boolean(
    record.witness?.name.trim()
    && record.witness.role.trim()
    && record.witness.date
    && record.witness.signature?.strokes.length
    && countWords(record.witness.testimony) >= 30,
  );
}

function evidenceRecordProgress(record: EvidenceRecord | undefined) {
  if (!record) return 0;
  if (record.method === "photo") return Math.min(100, Math.round((record.fileIds.length / 3) * 100));
  if (record.method === "video" || record.method === "audio") return record.fileIds.length ? 100 : 0;
  if (record.method === "written" || record.method === "reflection") return Math.min(100, Math.round((countWords(record.text ?? "") / 30) * 100));
  const completeFields = [record.witness?.name, record.witness?.role, record.witness?.date, record.witness?.signature?.strokes.length].filter(Boolean).length;
  const words = countWords(record.witness?.testimony ?? "");
  return evidenceRecordComplete(record) ? 100 : Math.min(90, completeFields * 15 + Math.round(Math.min(30, words) / 30 * 45));
}

function fileSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "Evidence";
}

function fileExtension(file: File) {
  const fromName = file.name.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0]?.toLowerCase();
  if (fromName) return fromName;
  const subtype = file.type.split("/")[1]?.split(";")[0]?.replace("jpeg", "jpg");
  return subtype ? `.${subtype}` : "";
}

function evidenceFileName(ksb: CourseKsb, method: EvidenceMethod, index: number, file: File) {
  const route = method === "photo" ? `Photo-${index + 1}` : evidenceMethodNames[method].replace(/\s+/g, "-");
  return `${fileSafe(`${ksb.code}-${conciseTitle(ksb.description, 7)}-${route}`)}${fileExtension(file)}`;
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(value: string, maximum = 86) {
  const words = pdfSafe(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maximum && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function escapePdf(value: string) {
  return pdfSafe(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createEvidencePdf(title: string, subtitle: string, sourceLines: string[], signatures: PdfSignatureBlock[] = []) {
  const lines = sourceLines.flatMap((line) => line ? wrapText(line, 82) : [""]);
  const contentPages = Array.from({ length: Math.max(1, Math.ceil(lines.length / 37)) }, (_, index) => ({
    kind: "content" as const,
    lines: lines.slice(index * 37, (index + 1) * 37),
  }));
  const signaturePages = Array.from({ length: Math.ceil(signatures.length / 4) }, (_, index) => ({
    kind: "signature" as const,
    signatures: signatures.slice(index * 4, (index + 1) * 4),
  }));
  const pages = [...contentPages, ...signaturePages];
  const objects: string[] = [];
  const pageObjects = pages.map((_, index) => 5 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjects.map((number) => `${number} 0 R`).join(" ")}] >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  pages.forEach((page, index) => {
    const pageObject = pageObjects[index];
    const contentObject = pageObject + 1;
    const commands = [
      "0.988 0.984 0.972 rg 0 0 595 842 re f",
      "0.975 0.952 0.866 rg 0 762 595 80 re f",
      "0.94 0.76 0.24 rg 42 778 8 42 re f",
      `BT /F2 16 Tf 0.10 0.10 0.11 rg 62 805 Td (${escapePdf(title)}) Tj ET`,
      `BT /F1 8.5 Tf 0.34 0.34 0.36 rg 62 785 Td (${escapePdf(subtitle)}) Tj ET`,
      "0.88 0.84 0.72 RG 0.7 w 42 758 m 553 758 l S",
    ];
    if (page.kind === "content") {
      let y = 735;
      page.lines.forEach((line) => {
        const isSection = /^(UNIT EVIDENCE PACK|PORTFOLIO SUMMARY|OTJ EVIDENCE PACK|LEARNER DETAILS|MAPPING SUMMARY|UNIT OTJ SUMMARY|ACTIVITY RECORD|DECLARATION)/.test(line);
        const isKsb = /^[KSB]\d/.test(line);
        const isEvidence = /^(EVIDENCE:|RPL:|Attached media:|Witness:|Learner account:)/.test(line);
        if (isSection) {
          commands.push(`0.965 0.938 0.84 rg 42 ${y - 5} 511 20 re f`);
          commands.push(`BT /F2 9.5 Tf 0.18 0.18 0.19 rg 50 ${y + 1} Td (${escapePdf(line)}) Tj ET`);
          y -= 27;
          return;
        }
        if (isKsb) {
          commands.push(`0.94 0.76 0.24 rg 42 ${y - 4} 4 16 re f`);
          commands.push(`BT /F2 9 Tf 0.14 0.14 0.15 rg 53 ${y} Td (${escapePdf(line)}) Tj ET`);
        } else {
          const x = isEvidence ? 56 : 48;
          const font = isEvidence ? "F1" : "F1";
          const size = isEvidence ? "8.2" : "8.7";
          const colour = isEvidence ? "0.39 0.36 0.27" : "0.25 0.25 0.27";
          commands.push(`BT /${font} ${size} Tf ${colour} rg ${x} ${y} Td (${escapePdf(line)}) Tj ET`);
        }
        y -= line ? 15 : 8;
      });
    } else {
      commands.push("BT /F2 13 Tf 0.14 0.14 0.15 rg 42 730 Td (Declarations and signatures) Tj ET");
      commands.push("BT /F1 8.5 Tf 0.37 0.37 0.39 rg 42 711 Td (Handwritten signatures were captured in Evia at the time shown below.) Tj ET");
      page.signatures.forEach((block, blockIndex) => {
        const top = 680 - blockIndex * 155;
        commands.push(`0.975 0.967 0.93 rg 42 ${top - 122} 511 132 re f`);
        commands.push(`0.94 0.76 0.24 rg 42 ${top + 3} 511 4 re f`);
        commands.push(`BT /F2 9.5 Tf 0.16 0.16 0.17 rg 54 ${top - 16} Td (${escapePdf(block.label)}) Tj ET`);
        commands.push(`BT /F1 8.5 Tf 0.29 0.29 0.31 rg 54 ${top - 34} Td (${escapePdf(`${block.name} | ${block.role}`)}) Tj ET`);
        const boxX = 54;
        const boxY = top - 96;
        const boxWidth = 260;
        const boxHeight = 46;
        commands.push(`0.78 0.75 0.66 RG 0.65 w ${boxX} ${boxY} ${boxWidth} ${boxHeight} re S`);
        commands.push("0.12 0.12 0.13 RG 0.9 w");
        block.signature.strokes.forEach((stroke) => {
          if (stroke.length < 2) return;
          const first = stroke[0];
          commands.push(`${(boxX + first.x * boxWidth).toFixed(2)} ${(boxY + (1 - first.y) * boxHeight).toFixed(2)} m`);
          stroke.slice(1).forEach((point) => commands.push(`${(boxX + point.x * boxWidth).toFixed(2)} ${(boxY + (1 - point.y) * boxHeight).toFixed(2)} l`));
          commands.push("S");
        });
        const timestamp = new Date(block.signedAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
        commands.push(`BT /F1 7.7 Tf 0.42 0.42 0.44 rg 330 ${top - 70} Td (Signed: ${escapePdf(timestamp)}) Tj ET`);
        commands.push(`BT /F1 7.7 Tf 0.42 0.42 0.44 rg 330 ${top - 87} Td (Recorded by Evia) Tj ET`);
      });
    }
    commands.push("0.86 0.83 0.74 RG 0.6 w 42 42 m 553 42 l S");
    commands.push(`BT /F1 7.5 Tf 0.48 0.48 0.5 rg 42 25 Td (Evia - Apprentice Vocational Assistant) Tj ET`);
    commands.push(`BT /F1 7.5 Tf 0.48 0.48 0.5 rg 492 25 Td (Page ${index + 1} of ${pages.length}) Tj ET`);
    const stream = commands.join("\n");
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n%EVIA\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

const crcTable = Array.from({ length: 256 }, (_, number) => {
  let crc = number;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => { crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8); });
  return (crc ^ 0xffffffff) >>> 0;
}

function littleEndian(value: number, size: 2 | 4) {
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  if (size === 2) view.setUint16(0, value, true);
  else view.setUint32(0, value >>> 0, true);
  return bytes;
}

function joinBytes(parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  parts.forEach((part) => { result.set(part, offset); offset += part.length; });
  return result;
}

async function createZip(entries: { name: string; blob: Blob }[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const entry of entries) {
    const name = encoder.encode(fileSafe(entry.name.replace(/\.[^.]+$/, "")) + (entry.name.match(/\.[^.]+$/)?.[0] ?? ""));
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(data);
    const local = joinBytes([
      littleEndian(0x04034b50, 4), littleEndian(20, 2), littleEndian(0x0800, 2), littleEndian(0, 2),
      littleEndian(dosTime, 2), littleEndian(dosDate, 2), littleEndian(crc, 4), littleEndian(data.length, 4),
      littleEndian(data.length, 4), littleEndian(name.length, 2), littleEndian(0, 2), name, data,
    ]);
    localParts.push(local);
    centralParts.push(joinBytes([
      littleEndian(0x02014b50, 4), littleEndian(20, 2), littleEndian(20, 2), littleEndian(0x0800, 2), littleEndian(0, 2),
      littleEndian(dosTime, 2), littleEndian(dosDate, 2), littleEndian(crc, 4), littleEndian(data.length, 4),
      littleEndian(data.length, 4), littleEndian(name.length, 2), littleEndian(0, 2), littleEndian(0, 2),
      littleEndian(0, 2), littleEndian(0, 2), littleEndian(0, 4), littleEndian(localOffset, 4), name,
    ]));
    localOffset += local.length;
  }
  const central = joinBytes(centralParts);
  const end = joinBytes([
    littleEndian(0x06054b50, 4), littleEndian(0, 2), littleEndian(0, 2), littleEndian(entries.length, 2),
    littleEndian(entries.length, 2), littleEndian(central.length, 4), littleEndian(localOffset, 4), littleEndian(0, 2),
  ]);
  const zipBytes = joinBytes([...localParts, central, end]);
  return new Blob([zipBytes.buffer as ArrayBuffer], { type: "application/zip" });
}

const calmExpressionSequence: { pose: EviaExpression; duration: number }[] = [
  { pose: "idle", duration: 2800 },
  { pose: "look-up-left", duration: 1500 },
  { pose: "look-up-right", duration: 1500 },
  { pose: "smile", duration: 1800 },
  { pose: "curious", duration: 1700 },
  { pose: "sleepy", duration: 1100 },
  { pose: "double-blink", duration: 900 },
  { pose: "happy-bounce", duration: 1450 },
];

const attentiveExpressionSequence: { pose: EviaExpression; duration: number }[] = [
  { pose: "look-down", duration: 2300 },
  { pose: "idle", duration: 1100 },
  { pose: "smile", duration: 1700 },
  { pose: "look-up-left", duration: 1600 },
  { pose: "look-up-right", duration: 1600 },
  { pose: "curious", duration: 1500 },
  { pose: "double-blink", duration: 850 },
  { pose: "happy-bounce", duration: 1350 },
];

function correctLearnerText(value: string) {
  const safeCorrections: Array<[RegExp, string]> = [
    [/\bteh\b/gi, "the"], [/\bhte\b/gi, "the"], [/\bthier\b/gi, "their"],
    [/\bbecuase\b/gi, "because"], [/\bsaftey\b/gi, "safety"], [/\brecieve\b/gi, "receive"],
    [/\bwich\b/gi, "which"], [/\bworkign\b/gi, "working"], [/\blearneres\b/gi, "learners"],
    [/\bdont\b/gi, "don’t"], [/\bcant\b/gi, "can’t"], [/\bwont\b/gi, "won’t"],
    [/\bim\b/gi, "I’m"], [/\bive\b/gi, "I’ve"], [/\bi\b/g, "I"],
  ];
  let cleaned = value.trim().replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1");
  safeCorrections.forEach(([pattern, replacement]) => { cleaned = cleaned.replace(pattern, replacement); });
  cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
  if (cleaned && !/[.!?]$/.test(cleaned)) cleaned += ".";
  return cleaned;
}

const stopWords = new Set([
  "and", "the", "for", "with", "from", "into", "that", "this", "their", "they", "work",
  "working", "within", "using", "use", "appropriate", "relevant", "required", "requirements",
  "including", "industry", "able", "must", "will", "can", "are", "to",
  "of", "in", "on", "a", "an", "or", "as", "be", "by", "at",
]);

function SignaturePad({ value, onChange, label }: {
  value: SignatureData | null;
  onChange: (signature: SignatureData | null) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const strokesRef = useRef<SignaturePoint[][]>(value?.strokes ?? []);

  const renderSignature = (strokes: SignaturePoint[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#28282b";
    strokes.forEach((stroke) => {
      if (!stroke.length) return;
      context.beginPath();
      stroke.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (!index) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    });
  };

  useEffect(() => {
    strokesRef.current = value?.strokes ?? [];
    renderSignature(strokesRef.current);
  }, [value]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
    };
  };

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    strokesRef.current = [...strokesRef.current, [pointFromEvent(event)]];
    renderSignature(strokesRef.current);
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const strokes = [...strokesRef.current];
    strokes[strokes.length - 1] = [...strokes[strokes.length - 1], pointFromEvent(event)];
    strokesRef.current = strokes;
    renderSignature(strokes);
  };

  const finish = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    drawingRef.current = false;
    const strokes = strokesRef.current.filter((stroke) => stroke.length > 1);
    strokesRef.current = strokes;
    onChange(strokes.length ? { strokes } : null);
  };

  return (
    <div className={`signature-pad${value?.strokes.length ? " has-signature" : ""}`}>
      <div className="signature-pad-heading"><span>{label}</span><small>{value?.strokes.length ? "Signature captured" : "Write inside the box"}</small></div>
      <canvas
        ref={canvasRef}
        width={900}
        height={260}
        aria-label={label}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <div className="signature-pad-footer"><span aria-hidden="true">Sign above</span><button type="button" onClick={() => { strokesRef.current = []; renderSignature([]); onChange(null); }}>Clear</button></div>
    </div>
  );
}

function ProgressArch({ label, name, value, target, updated, onClick }: ProgressItem) {
  const markerAngle = Math.PI - (Math.PI * Math.max(0, Math.min(100, target ?? 0))) / 100;
  const markerX = 50 + 41 * Math.cos(markerAngle);
  const markerY = 54 - 41 * Math.sin(markerAngle);
  return (
    <button type="button" className={`progress-arch${updated ? " is-updated" : ""}`} aria-label={`${name}: ${value}%. Open ${label} details`} onClick={onClick}>
      <svg viewBox="0 0 100 62" aria-hidden="true">
        <path className="arch-track" pathLength="100" d="M 9 54 A 41 41 0 0 1 91 54" />
        <path
          className="arch-value"
          pathLength="100"
          d="M 9 54 A 41 41 0 0 1 91 54"
          style={{ strokeDasharray: `${value} 100` }}
        />
        {target !== undefined && <path className="arch-target-marker" d={`M ${markerX - 3.2} ${markerY - 7} L ${markerX + 3.2} ${markerY - 7} L ${markerX} ${markerY - 1.2} Z`} />}
      </svg>
      <span className="arch-label" aria-hidden="true">{label}</span>
      <span className="arch-number">{value}%</span>
    </button>
  );
}

function OptionRow({ title, note, onClick, tabIndex = 0 }: {
  title: string;
  note?: string;
  onClick: () => void;
  tabIndex?: number;
}) {
  return (
    <button type="button" className="option-row" onClick={onClick} tabIndex={tabIndex}>
      <span className="option-row-copy">
        <span>{title}</span>
        {note && <small>{note}</small>}
      </span>
      <span className="row-chevron" aria-hidden="true">›</span>
    </button>
  );
}

function cleanLine(line: string) {
  return line.replace(/^\s*[•*-]\s*/, "").replace(/\s+/g, " ").trim();
}

function conciseTitle(text: string, maxWords = 8) {
  const cleaned = cleanLine(text)
    .replace(/^[KSB]\s*\d+(?:\.\d+)?[A-Za-z]?[\s:–—.-]*/i, "")
    .replace(/^(?:awareness|importance|principles?|methods?|considerations?)\s+of\s+/i, "")
    .replace(/^(?:comply with|identify and use|select and use|prepare and maintain|read and interpret|estimate and select|set out and construct|carry out|applies?|apply|follow|construct)\s+/i, "")
    .split(/[.;]/)[0]
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, maxWords);
  const title = words.join(" ") || "Course requirement";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

const tokenAliases: Record<string, string> = {
  safe: "safety", safely: "safety", regulatory: "regulation", regulations: "regulation",
  environmental: "environment", sustainable: "sustainability", recycle: "recycling",
  recycled: "recycling", communicates: "communication", communicate: "communication",
  verbal: "communication", teams: "teamwork", team: "teamwork", inclusive: "inclusion",
  diverse: "diversity", drawings: "drawing", specifications: "specification",
  tools: "equipment", tool: "equipment", bricklaying: "brick", brickwork: "brick",
  wellbeing: "wellbeing", welfare: "wellbeing", protective: "protection",
  construction: "construct", building: "building", build: "building", cutt: "cut", sett: "setting",
  profil: "profile", techniqu: "technique", toleranc: "tolerance", ties: "tie", gaug: "gauge",
};

function stemToken(word: string) {
  let stem = word.toLowerCase();
  if (stem.length > 6 && stem.endsWith("ies")) stem = `${stem.slice(0, -3)}y`;
  else if (stem.length > 6 && stem.endsWith("ing")) stem = stem.slice(0, -3);
  else if (stem.length > 5 && stem.endsWith("ed")) stem = stem.slice(0, -2);
  else if (stem.length > 5 && stem.endsWith("es")) stem = stem.slice(0, -2);
  else if (stem.length > 4 && stem.endsWith("s")) stem = stem.slice(0, -1);
  return tokenAliases[stem] ?? stem;
}

function meaningfulWords(text: string) {
  return text
    .toLowerCase()
    .replace(/well[\s-]being/g, "wellbeing")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map(stemToken)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function wordsToTokens(words: string[]) {
  const tokens = new Set(words);
  for (let index = 0; index < words.length - 1; index += 1) tokens.add(`${words[index]}_${words[index + 1]}`);
  return tokens;
}

function tokenise(text: string) {
  return wordsToTokens(meaningfulWords(text));
}

function anchorTokens(text: string) {
  const leadingClause = text.split(/[.:;]/)[0];
  return wordsToTokens(meaningfulWords(leadingClause).slice(0, 14));
}

function combineTokens(items: CourseKsb[]) {
  const combined = new Set<string>();
  items.forEach((item) => tokenise(item.description).forEach((token) => combined.add(token)));
  return combined;
}

function combineAnchorTokens(items: CourseKsb[]) {
  const combined = new Set<string>();
  items.forEach((item) => anchorTokens(item.description).forEach((token) => combined.add(token)));
  return combined;
}

function createTokenWeights(items: CourseKsb[]) {
  const documents = items.map((item) => tokenise(item.description));
  const frequency = new Map<string, number>();
  documents.forEach((tokens) => tokens.forEach((token) => frequency.set(token, (frequency.get(token) ?? 0) + 1)));
  const weights = new Map<string, number>();
  frequency.forEach((count, token) => {
    const rarity = 1 + Math.log((documents.length + 1) / (count + 1));
    weights.set(token, rarity * (token.includes("_") ? 1.35 : 1));
  });
  return weights;
}

function semanticScore(left: Set<string>, right: Set<string>, weights?: Map<string, number>) {
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  let leftWeight = 0;
  let rightWeight = 0;
  left.forEach((token) => {
    const weight = weights?.get(token) ?? 1;
    leftWeight += weight;
    if (right.has(token)) overlap += weight;
  });
  right.forEach((token) => { rightWeight += weights?.get(token) ?? 1; });
  return overlap / Math.sqrt(leftWeight * rightWeight);
}

function keywordAffinity(
  left: Set<string>,
  right: Set<string>,
  leftAnchors: Set<string>,
  rightAnchors: Set<string>,
  weights: Map<string, number>,
) {
  return semanticScore(left, right, weights) + semanticScore(leftAnchors, rightAnchors, weights) * 0.72;
}

function parseKsbs(raw: string) {
  const normalized = raw.replace(/\r/g, "");
  const marker = /(?:^|\n)\s*(?:[•*-]\s*)?(?:(?:knowledge|skills?|behaviours?)\s+)?([KSB])\s*(\d+(?:\.\d+)?[A-Za-z]?)\s*(?::|-|–|—|\.|\)|\s)\s*/gim;
  const matches = [...normalized.matchAll(marker)];
  const seen = new Set<string>();

  return matches.flatMap((match, index): CourseKsb[] => {
    const letter = match[1].toUpperCase();
    const code = `${letter}${match[2]}`;
    if (seen.has(code)) return [];

    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? normalized.length) : normalized.length;
    const description = normalized
      .slice(start, end)
      .split("\n")
      .map(cleanLine)
      .filter((line) => line && !/^#{0,6}\s*(?:knowledge|skills?|behaviours?)\s*:?[\s-]*$/i.test(line))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!description) return [];

    seen.add(code);
    const type: KsbType = letter === "S" ? "Skill" : letter === "B" ? "Behaviour" : "Knowledge";
    return [{ code, type, title: conciseTitle(description), description }];
  });
}

function cleanUnitHeading(value: string) {
  return cleanLine(value)
    .replace(/^#{1,6}\s*/, "")
    .replace(/^(?:unit|collection)\s+\d+\s*[:–—-]?\s*/i, "")
    .replace(/^(?:unit|collection)\s*[:–—-]\s*/i, "")
    .trim();
}

function makeStructuredCourse(
  sourceUnits: { title: string; ksbs: CourseKsb[] }[],
  rawKsbs: string,
  sourceType: CourseSource,
): CourseBuildResult {
  if (!sourceUnits.length) return { course: null, error: "I couldn’t find any course units." };

  const seenCore = new Set<string>();
  const behaviourCodes = new Set<string>();
  let knowledgeCount = 0;
  let skillCount = 0;
  const units: CourseUnit[] = [];

  for (let index = 0; index < sourceUnits.length; index += 1) {
    const sourceUnit = sourceUnits[index];
    const title = cleanUnitHeading(sourceUnit.title);
    if (!title) return { course: null, error: "Every unit needs a clear title." };
    if (!sourceUnit.ksbs.length) return { course: null, error: `“${title}” does not contain any recognised KSBs.` };

    const unitCodes = new Set<string>();
    const ksbs: CourseKsb[] = [];
    for (const sourceKsb of sourceUnit.ksbs) {
      const code = sourceKsb.code.toUpperCase().replace(/\s+/g, "");
      const letter = code.charAt(0);
      if (!/^[KSB]\d+(?:\.\d+)?[A-Z]?$/i.test(code)) {
        return { course: null, error: `“${sourceKsb.code}” in “${title}” is not a recognised KSB code.` };
      }
      const description = cleanLine(sourceKsb.description);
      if (!description) return { course: null, error: `${code} in “${title}” needs its full wording.` };
      if (unitCodes.has(code)) return { course: null, error: `${code} appears twice in “${title}”.` };
      if (letter !== "B" && seenCore.has(code)) return { course: null, error: `${code} is assigned to more than one unit.` };

      unitCodes.add(code);
      if (letter !== "B") seenCore.add(code);
      if (letter === "K") knowledgeCount += 1;
      if (letter === "S") skillCount += 1;
      if (letter === "B") behaviourCodes.add(code);
      const type: KsbType = letter === "S" ? "Skill" : letter === "B" ? "Behaviour" : "Knowledge";
      ksbs.push({ code, type, title: conciseTitle(description), description });
    }

    const unitKnowledge = ksbs.filter((item) => item.type === "Knowledge").length;
    const unitSkills = ksbs.filter((item) => item.type === "Skill").length;
    if (!unitSkills) return { course: null, error: `“${title}” needs at least one Skill.` };
    units.push({
      id: `unit-${index + 1}`,
      number: index + 1,
      title,
      summary: `${unitKnowledge} Knowledge and ${unitSkills} Skill${unitSkills === 1 ? "" : "s"}, arranged by your tutor.`,
      ksbs,
    });
  }

  return {
    course: {
      createdAt: Date.now(), mappingVersion: courseMappingVersion, sourceType, rawKsbs, units,
      inputCounts: { knowledge: knowledgeCount, skills: skillCount, behaviours: behaviourCodes.size },
    },
    error: "",
  };
}

function buildCourseFromLayout(rawLayout: string): CourseBuildResult {
  const lines = rawLayout.replace(/\r/g, "").split("\n");
  const sections: { title: string; body: string[] }[] = [];
  let current: { title: string; body: string[] } | null = null;
  const codeLine = /^\s*(?:[•*-]\s*)?(?:knowledge|skills?|behaviours?)?\s*[KSB]\s*\d+(?:\.\d+)?[A-Za-z]?\s*(?::|-|–|—|\.|\)|\s)/i;
  const sectionHeading = /^#{0,6}\s*(?:knowledge|skills?|behaviours?)\s*:?\s*$/i;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      if (current) current.body.push("");
      continue;
    }
    if (sectionHeading.test(line)) {
      if (current) current.body.push(line);
      continue;
    }

    const nextLine = lines.slice(index + 1).map((value) => value.trim()).find(Boolean) ?? "";
    const previousLine = index > 0 ? lines[index - 1].trim() : "";
    const explicitHeading = /^#{1,6}\s+|^(?:unit|collection)\s*(?:\d+)?\s*[:–—-]/i.test(line);
    const shortHeading = line.length <= 72 && line.split(/\s+/).length <= 9 && !/[:.!?]$/.test(line);
    const looksLikeHeading = !codeLine.test(line) && (current === null || explicitHeading
      || (shortHeading && codeLine.test(nextLine) && (!previousLine || current.body.some((value) => codeLine.test(value)))));

    if (looksLikeHeading) {
      if (current) sections.push(current);
      current = { title: cleanUnitHeading(line), body: [] };
    } else {
      if (!current) return { course: null, error: "Start the layout with a unit title, followed by its KSBs." };
      current.body.push(line);
    }
  }
  if (current) sections.push(current);

  const sourceUnits = sections.map((section) => ({
    title: section.title,
    ksbs: parseKsbs(section.body.join("\n")),
  }));
  return makeStructuredCourse(sourceUnits, rawLayout, "layout");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildCourseFromFile(rawFile: string): CourseBuildResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawFile) as unknown;
  } catch {
    return { course: null, error: "That file is not a valid Evia course file." };
  }
  if (!isRecord(parsed)) return { course: null, error: "That file does not contain a recognised course." };
  const root = isRecord(parsed.course) ? parsed.course : parsed;
  if (!Array.isArray(root.units)) return { course: null, error: "That file does not contain any course units." };

  const sourceUnits: { title: string; ksbs: CourseKsb[] }[] = [];
  for (const rawUnit of root.units) {
    if (!isRecord(rawUnit)) return { course: null, error: "One of the units in that file is not valid." };
    const titleValue = typeof rawUnit.title === "string" ? rawUnit.title : typeof rawUnit.name === "string" ? rawUnit.name : "";
    const combinedItems = Array.isArray(rawUnit.ksbs)
      ? rawUnit.ksbs
      : [rawUnit.knowledge, rawUnit.skills, rawUnit.behaviours].flatMap((value) => Array.isArray(value) ? value : []);
    if (!combinedItems.length) return { course: null, error: `“${titleValue || "Untitled unit"}” does not contain any KSBs.` };

    const ksbs: CourseKsb[] = [];
    for (const rawItem of combinedItems) {
      if (typeof rawItem === "string") {
        const parsedItems = parseKsbs(rawItem);
        if (!parsedItems.length) return { course: null, error: `I couldn’t read a KSB in “${titleValue || "Untitled unit"}”.` };
        ksbs.push(...parsedItems);
        continue;
      }
      if (!isRecord(rawItem)) return { course: null, error: `I couldn’t read a KSB in “${titleValue || "Untitled unit"}”.` };
      const code = typeof rawItem.code === "string" ? rawItem.code : typeof rawItem.id === "string" ? rawItem.id : "";
      const description = typeof rawItem.description === "string" ? rawItem.description
        : typeof rawItem.text === "string" ? rawItem.text
          : typeof rawItem.title === "string" ? rawItem.title : "";
      if (!code || !description) return { course: null, error: `A KSB in “${titleValue || "Untitled unit"}” is missing its code or wording.` };
      const letter = code.trim().charAt(0).toUpperCase();
      const type: KsbType = letter === "S" ? "Skill" : letter === "B" ? "Behaviour" : "Knowledge";
      ksbs.push({ code, type, title: conciseTitle(description), description });
    }
    sourceUnits.push({ title: titleValue, ksbs });
  }

  return makeStructuredCourse(sourceUnits, rawFile, "file");
}

type ActivityRule = { label: string; pattern: RegExp };

// Collection names are deliberately derived from Skills only. Knowledge and Behaviours
// help form the collection, but can never hide the practical activities in its title.
const practicalActivityRules: ActivityRule[] = [
  { label: "Setting Out", pattern: /\bset(?:ting)?\s+out\b|\bmark(?:ing)?\s+out\b/i },
  { label: "Plumbing", pattern: /\bplumb(?:ing|er)?\b|\bpipe(?:work|s)?\b|\bsanitary(?:ware)?\b|\bwater\s+(?:supply|system|services?)\b/i },
  { label: "Electrics", pattern: /\belectric(?:al|ian|ity)?\b|\bwiring\b|\bcabl(?:e|es|ing)\b|\bcircuit(?:s|ry)?\b|\bsocket(?:s)?\b/i },
  { label: "Tiling", pattern: /\btil(?:e|es|ed|ing)\b/i },
  { label: "Flooring", pattern: /\bfloor(?:ing|s)?\b|\bfloor\s+finish(?:es)?\b/i },
  { label: "Gas Installation", pattern: /\bgas\s+(?:installation|appliance|system|work)\b/i },
  { label: "Heating & Ventilation", pattern: /\bheating\b|\bboiler(?:s)?\b|\bradiator(?:s)?\b|\bventilation\b|\bhvac\b/i },
  { label: "Drainage", pattern: /\bdrain(?:age|s)?\b|\bsewer(?:age|s)?\b/i },
  { label: "Carpentry & Joinery", pattern: /\bcarpentry\b|\bjoinery\b|\btimber\s+(?:frame|work)\b|\bwoodwork(?:ing)?\b/i },
  { label: "Cavity Walling", pattern: /\bcavity\s+(?:(?:brick|block|masonry)\s+)?(?:wall|walling)\b/i },
  { label: "Solid Walling", pattern: /\bsolid\s+(?:(?:brick|block|masonry)\s+)?(?:wall|walling)\b/i },
  { label: "Raking Walling", pattern: /\braking\s+cut\b|\bgable(?:\s+end)?\s+wall\b/i },
  { label: "Decorative Walling", pattern: /\bdecorative\s+(?:wall|walling|brickwork)\b|\b(?:isolated|attached)\s+pier\b/i },
  { label: "Brickwork & Blockwork", pattern: /\bbrick(?:work|laying|s)?\b|\bblock(?:work|laying|s)?\b|\bmasonry\b/i },
  { label: "Roofing", pattern: /\broof(?:ing|s)?\b|\bslat(?:e|es|ing)\b/i },
  { label: "Plastering & Rendering", pattern: /\bplaster(?:ing|work)?\b|\brender(?:ing)?\b/i },
  { label: "Painting & Decorating", pattern: /\bpaint(?:ing)?\b|\bdecorat(?:e|ing|ion)\b|\bwallpaper(?:ing)?\b/i },
  { label: "Drylining", pattern: /\bdry\s?lin(?:e|ing)\b|\bplasterboard(?:ing)?\b/i },
  { label: "Glazing", pattern: /\bglaz(?:e|ed|ing)\b|\bglass\s+installation\b/i },
  { label: "Scaffolding", pattern: /\bscaffold(?:ing|s)?\b/i },
  { label: "Groundworks", pattern: /\bgroundwork(?:s)?\b|\bexcavat(?:e|ion|ing)\b|\btrench(?:es|ing)?\b/i },
  { label: "Concrete & Formwork", pattern: /\bconcret(?:e|ing)\b|\bformwork\b|\breinforcement\b/i },
  { label: "Welding & Fabrication", pattern: /\bweld(?:ing|ed)?\b|\bfabricat(?:e|ion|ing)\b/i },
  { label: "Insulation", pattern: /\binsulat(?:e|ed|ion|ing)\b|\bairtight(?:ness)?\b/i },
  { label: "Mortar Mixing", pattern: /\b(?:mix|mixing|gauge|gauging)\b[^.;]{0,45}\bmortar\b|\bmortar\b[^.;]{0,45}\b(?:mix|mixing|gauge|gauging)\b/i },
  { label: "Joint Finishing", pattern: /\bjoint\s+finish(?:es|ing)?\b|\bweather\s+struck\b|\brecessed\s+joint\b/i },
  { label: "Brick & Block Cutting", pattern: /\b(?:cut|cutting)\b[^.;]{0,40}\b(?:brick|block)s?\b/i },
  { label: "Repairs & Maintenance", pattern: /\brepair(?:s|ing|ed)?\b|\bmaintain(?:ing|ed)?\b|\bmaintenance\b|\bservice(?:ing|d)?\b/i },
  { label: "Machining & CNC", pattern: /\bmachin(?:e|ing)\b|\bcnc\b|\bturning\b|\bmilling\b/i },
  { label: "Mechanical Fitting", pattern: /\bmechanical\s+(?:fit|fitting|assembly|installation)\b|\bfit(?:ting)?\s+mechanical\b/i },
  { label: "Vehicle Maintenance", pattern: /\bvehicle(?:s)?\b|\bautomotive\b|\bengine(?:s)?\b|\bbraking\s+system\b/i },
  { label: "Software Development", pattern: /\bsoftware\b|\bcod(?:e|ing)\b|\bprogram(?:ming)?\b|\bapplication\s+development\b/i },
  { label: "Networks & IT", pattern: /\bnetwork(?:s|ing)?\b|\binformation\s+technology\b|\bit\s+system(?:s)?\b|\bserver(?:s)?\b/i },
  { label: "Data Analysis", pattern: /\bdata\s+(?:analysis|analytics|modelling|visualisation)\b|\banalys(?:e|ing)\s+data\b/i },
  { label: "Cybersecurity", pattern: /\bcyber\s?security\b|\binformation\s+security\b|\bsecurity\s+incident\b/i },
  { label: "Engineering Design", pattern: /\bengineering\s+design\b|\bcad\b|\btechnical\s+design\b/i },
  { label: "Care & Support", pattern: /\bpersonal\s+care\b|\bcare\s+plan\b|\bservice\s+user(?:s)?\b|\bpatient\s+care\b/i },
  { label: "Childcare", pattern: /\bchildcare\b|\bchildren'?s\s+development\b|\bearly\s+years\b/i },
  { label: "Teaching & Training", pattern: /\bteach(?:ing)?\b|\btrain(?:ing)?\s+(?:people|learners|staff)\b|\blesson\s+delivery\b/i },
  { label: "Hairdressing & Barbering", pattern: /\bhairdress(?:ing|er)?\b|\bbarber(?:ing)?\b|\bhair\s+(?:cutting|styling|colouring)\b/i },
  { label: "Beauty Therapy", pattern: /\bbeauty\s+therapy\b|\bskin\s+treatment(?:s)?\b|\bnail\s+treatment(?:s)?\b/i },
  { label: "Food Preparation", pattern: /\bfood\s+preparation\b|\bcook(?:ing)?\b|\bbak(?:e|ing)\b|\bkitchen\s+production\b/i },
  { label: "Hospitality Service", pattern: /\bfood\s+service\b|\bguest\s+service\b|\bhospitality\b|\bfront\s+of\s+house\b/i },
  { label: "Customer Service", pattern: /\bcustomer\s+service\b|\bcustomer\s+enquir(?:y|ies)\b|\bcustomer\s+complaint(?:s)?\b/i },
  { label: "Sales & Retail", pattern: /\bsales?\b|\bretail\b|\bmerchandis(?:e|ing)\b/i },
  { label: "Business Administration", pattern: /\bbusiness\s+administration\b|\badministrative\s+task(?:s)?\b|\boffice\s+systems?\b/i },
  { label: "Accounting & Finance", pattern: /\baccount(?:ing|s)?\b|\bbookkeep(?:ing)?\b|\bfinancial\s+(?:record|transaction|report)\b/i },
  { label: "Laboratory Work", pattern: /\blaborator(?:y|ies)\b|\blab\s+(?:test|work|procedure)\b|\bspecimen(?:s)?\b/i },
  { label: "Agriculture & Horticulture", pattern: /\bagricultur(?:e|al)\b|\bhorticultur(?:e|al)\b|\bcrop(?:s)?\b|\bplant\s+production\b/i },
  { label: "Landscaping", pattern: /\blandscap(?:e|ing)\b|\bhardscape\b|\bsoftscape\b/i },
  { label: "Animal Care", pattern: /\banimal\s+(?:care|welfare|handling)\b|\bveterinary\b/i },
  { label: "Warehousing & Logistics", pattern: /\bwarehouse\b|\blogistics\b|\bdispatch\b|\bstock\s+movement\b/i },
];

const supportingActivityRules: ActivityRule[] = [
  { label: "Health, Safety & PPE", pattern: /\bhealth\s+and\s+safety\b|\bsafe\s+working\b|\bhazard(?:s)?\b|\brisk\s+assessment(?:s)?\b|\bppe\b|\bpersonal\s+protective\s+equipment\b/i },
  { label: "Sustainability", pattern: /\benvironment(?:al)?\b|\bsustainab(?:le|ility)\b|\brecycl(?:e|ing)\b|\bwaste\b/i },
  { label: "Drawings & Specifications", pattern: /\bdrawing(?:s)?\b|\bspecification(?:s)?\b|\btechnical\s+information\b/i },
  { label: "Estimating & Resources", pattern: /\bestimat(?:e|ing|ion)\b|\bquantit(?:y|ies)\b|\bresource(?:s)?\b/i },
  { label: "Tools & Equipment", pattern: /\bhand\s+tool(?:s)?\b|\bpower\s+tool(?:s)?\b|\bequipment\b/i },
  { label: "Standards & Compliance", pattern: /\bregulation(?:s)?\b|\bstandard(?:s)?\b|\bguidance\b|\bcomply\b|\bcompliance\b/i },
  { label: "Communication", pattern: /\bcommunicat(?:e|ion|ing)\b|\bconstruction\s+terminology\b/i },
  { label: "Teamwork", pattern: /\bteam\s*work(?:ing)?\b|\bteam\s+goals?\b|\bwider\s+team\b/i },
  { label: "Equity, Diversity & Inclusion", pattern: /\bequit(?:y|able)\b|\bdivers(?:ity|e)\b|\binclusi(?:on|ve)\b/i },
  { label: "Wellbeing", pattern: /\bwell[ -]?being\b|\bmental\s+health\b|\bphysical\s+health\b/i },
  { label: "Quality Assurance", pattern: /\bquality\b|\binspect(?:ion|ing)\b|\btolerance(?:s)?\b/i },
  { label: "Work Protection", pattern: /\bprotect(?:ing|ion)?\b[^.;]{0,45}\b(?:materials?|finished\s+work|work)\b/i },
  { label: "Planning & Coordination", pattern: /\bplan(?:ning)?\b|\bschedul(?:e|ing)\b|\bcoordinat(?:e|ion|ing)\b/i },
];

function fallbackSkillActivity(description: string) {
  const cleaned = cleanLine(description)
    .replace(/\([^)]*\)/g, " ")
    .split(/[.;:]/)[0]
    .replace(/\bfor example\b.*$/i, "")
    .replace(/\bincluding\b.*$/i, "")
    .replace(/^(?:be able to|ensure that|demonstrate the ability to)\s+/i, "")
    .replace(/^(?:(?:plan|prepare|select|identify|use|apply|install|construct|produce|create|deliver|provide|support|undertake|perform|complete|operate|assemble|fit|fix|lay|measure|cut|mix|test|check|monitor|review|repair|service|maintain|store|follow|communicate|coordinate|carry out|work on)\s+(?:and\s+\w+\s+)*)/i, "")
    .replace(/\b(?:to|within|in accordance with)\s+(?:given|specified|required|relevant)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 5);
  const phrase = words.join(" ") || conciseTitle(description, 5) || "Practical Work";
  return phrase.split(" ").map((word) => /^(?:ppe|rpe|cad|bim|cnc|it|ict|hvac)$/i.test(word)
    ? word.toUpperCase()
    : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`).join(" ");
}

function practicalLabelsFromText(text: string) {
  let labels = practicalActivityRules.filter((rule) => rule.pattern.test(text)).map((rule) => rule.label);
  const specificWalling = labels.some((label) => ["Cavity Walling", "Solid Walling", "Raking Walling", "Decorative Walling"].includes(label));
  if (specificWalling) labels = labels.filter((label) => label !== "Brickwork & Blockwork" && label !== "Insulation");
  if (labels.some((label) => ["Mortar Mixing", "Joint Finishing", "Brick & Block Cutting"].includes(label))) {
    labels = labels.filter((label) => label !== "Brickwork & Blockwork");
  }
  return [...new Set(labels)];
}

function activityLabelsForSkill(skill: CourseKsb) {
  const text = skill.description.trim();
  const supporting = supportingActivityRules.filter((rule) => rule.pattern.test(text)).map((rule) => rule.label);
  if (/^comply\b[^.;]{0,65}\bhealth\s+and\s+safety\b/i.test(text)) return ["Health & Safety"];
  if (/^identify\s+and\s+use\b[^.;]{0,60}\b(?:ppe|personal\s+protective\s+equipment)\b/i.test(text)) return ["PPE"];
  if (/^prepare\s+and\s+maintain\b[^.;]{0,55}\bsafe\s+working\s+area\b/i.test(text)) return ["Safe Work Area"];
  if (/^select\s+and\s+use\b[^.;]{0,55}\bhand\s+tools?\b/i.test(text)) return ["Hand Tool Use"];
  if (/^maintain\s+and\s+store\b[^.;]{0,55}\bhand\s+tools?\b/i.test(text)) return ["Tool Care & Storage"];
  if (/^(?:follow|apply|contribute)\b[^.;]{0,70}\b(?:equity|diversity|inclusion|inclusive)\b/i.test(text)) {
    return ["Equity, Diversity & Inclusion"];
  }
  const complianceLed = /^(?:comply|follow|adhere|observe|work\s+safely|maintain\s+(?:a\s+)?safe|prepare\s+and\s+maintain\s+(?:a\s+)?safe|identify\s+(?:hazards?|risks?))/i.test(text);
  if (complianceLed) return [supporting[0] ?? fallbackSkillActivity(text)];

  if (/^(?:estimate|calculate|quantify)|^(?:select|identify)\b[^.;]{0,35}\brequired\s+resources?\b/i.test(text)) {
    return ["Estimating & Resources"];
  }
  if (/^(?:read|interpret|extract)\b[^.;]{0,65}\b(?:drawings?|specifications?|technical\s+information)\b/i.test(text)) {
    return ["Drawings & Specifications"];
  }
  if (/^(?:select|identify|use|operate|maintain|store)\b[^.;]{0,55}\b(?:hand\s+tools?|power\s+tools?|tools?|equipment)\b|^(?:maintain|store)\s+and\s+(?:maintain|store)\b[^.;]{0,55}\btools?\b/i.test(text)) {
    return ["Tools & Equipment"];
  }
  if (/^protect\b[^.;]{0,70}\b(?:materials?|finished\s+work|work)\b/i.test(text)) {
    return ["Work Protection"];
  }

  if (/^set\s+out\b|^set\s+out\s+and\s+construct\b/i.test(text)) {
    const walling = practicalLabelsFromText(text).filter((label) => ["Cavity Walling", "Solid Walling", "Raking Walling", "Decorative Walling"].includes(label));
    return [...new Set(["Setting Out", ...walling])];
  }

  if (/\b(?:repair|repairing|maintain|maintenance|service|servicing)\b/i.test(text)) {
    const domains = practicalLabelsFromText(text).filter((label) => !["Repairs & Maintenance", "Setting Out"].includes(label));
    if (domains.includes("Vehicle Maintenance")) return ["Vehicle Maintenance"];
    if (domains.length) {
      const repairDomains = domains.map((label) => label === "Brickwork & Blockwork" ? "Brickwork"
        : label === "Electrics" ? "Electrical"
          : label.replace(/\s+&\s+.*$/, ""));
      const uniqueDomains = [...new Set(repairDomains)];
      const domainTitle = uniqueDomains.length === 1
        ? uniqueDomains[0]
        : `${uniqueDomains.slice(0, -1).join(", ")} & ${uniqueDomains.at(-1)}`;
      return [`${domainTitle} Repairs & Maintenance`];
    }
    return ["Repairs & Maintenance"];
  }

  const practical = practicalLabelsFromText(text);
  if (practical.length) return practical;

  return supporting.length ? [supporting[0]] : [fallbackSkillActivity(text)];
}

function generateSkillTitle(items: CourseKsb[]) {
  const skills = items
    .filter((item) => item.type === "Skill")
    .sort((left, right) => left.code.localeCompare(right.code, undefined, { numeric: true }));
  const labels = [...new Set(skills.flatMap(activityLabelsForSkill))];
  if (!labels.length) return "Practical Work";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2 && labels.every((label) => !/[&,]/.test(label))) return `${labels[0]} & ${labels[1]}`;
  return labels.join(" · ");
}

function balancedSizes(total: number, groups: number) {
  const base = Math.floor(total / groups);
  const remainder = total % groups;
  return Array.from({ length: groups }, (_, index) => base + (index < remainder ? 1 : 0));
}

function chooseUnitCount(total: number, knowledge: number, skills: number) {
  const maximum = Math.min(total, knowledge, skills);
  const target = total / 4.5;
  return Array.from({ length: maximum }, (_, index) => index + 1)
    .filter((count) => {
      const sizes = balancedSizes(total, count);
      const threes = sizes.filter((size) => size === 3).length;
      return sizes.every((size) => size >= 3 && size <= 6) && threes <= 1;
    })
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0] ?? 0;
}

function behaviourScore(behaviour: CourseKsb, unitItems: CourseKsb[], weights?: Map<string, number>) {
  const behaviourTokens = tokenise(behaviour.description);
  const unitTokens = combineTokens(unitItems);
  let score = semanticScore(behaviourTokens, unitTokens, weights);
  const hasAny = (words: string[]) => words.some((word) => unitTokens.has(word));
  if (behaviourTokens.has("ownership") && hasAny(["construct", "prepare", "apply", "repair", "maintain", "deliver"])) score += 0.12;
  if ((behaviourTokens.has("learn") || behaviourTokens.has("development")) && hasAny(["skill", "technical", "practice", "equipment", "design"])) score += 0.08;
  return score;
}

function buildCourse(rawKsbs: string): CourseBuildResult {
  const ksbs = parseKsbs(rawKsbs);
  const knowledge = ksbs.filter((item) => item.type === "Knowledge");
  const skills = ksbs.filter((item) => item.type === "Skill");
  const behaviours = ksbs.filter((item) => item.type === "Behaviour");
  if (!knowledge.length || !skills.length) return { course: null, error: "I need both Knowledge and Skills items, using codes such as K1 and S1." };
  if (behaviours.length < 2) return { course: null, error: "Add at least two Behaviours so every Unit can have two relevant behaviours." };

  const core = [...knowledge, ...skills];
  const unitCount = chooseUnitCount(core.length, knowledge.length, skills.length);
  if (!unitCount) return { course: null, error: "There aren’t enough Knowledge and Skills items to make balanced Units of 4–6. Add the complete KSB list and try again." };

  type CoreBundle = { items: CourseKsb[]; tokens: Set<string>; anchors: Set<string>; score: number };
  const tokenWeights = createTokenWeights(core);
  const unmatchedKnowledge = new Map(knowledge.map((item) => [item.code, item]));
  const unmatchedSkills = new Map(skills.map((item) => [item.code, item]));
  const pairCandidates = knowledge.flatMap((knowledgeItem) => skills.map((skillItem) => ({
    knowledge: knowledgeItem,
    skill: skillItem,
    score: keywordAffinity(
      tokenise(knowledgeItem.description), tokenise(skillItem.description),
      anchorTokens(knowledgeItem.description), anchorTokens(skillItem.description), tokenWeights,
    ),
  }))).sort((left, right) => right.score - left.score
    || left.knowledge.code.localeCompare(right.knowledge.code, undefined, { numeric: true })
    || left.skill.code.localeCompare(right.skill.code, undefined, { numeric: true }));

  const pairedBundles: CoreBundle[] = [];
  pairCandidates.forEach((candidate) => {
    if (!unmatchedKnowledge.has(candidate.knowledge.code) || !unmatchedSkills.has(candidate.skill.code)) return;
    const items = [candidate.knowledge, candidate.skill];
    pairedBundles.push({ items, tokens: combineTokens(items), anchors: combineAnchorTokens(items), score: candidate.score });
    unmatchedKnowledge.delete(candidate.knowledge.code);
    unmatchedSkills.delete(candidate.skill.code);
  });

  if (pairedBundles.length < unitCount) {
    return { course: null, error: "I couldn’t give every Unit both Knowledge and Skills. Check that you pasted the complete course." };
  }

  const doubleGroupCount = Math.min(unitCount, pairedBundles.length - unitCount);
  const bundleEdges = pairedBundles.flatMap((left, leftIndex) => pairedBundles.slice(leftIndex + 1).map((right, offset) => ({
    leftIndex,
    rightIndex: leftIndex + offset + 1,
    score: keywordAffinity(left.tokens, right.tokens, left.anchors, right.anchors, tokenWeights),
  }))).sort((left, right) => right.score - left.score
    || left.leftIndex - right.leftIndex || left.rightIndex - right.rightIndex);

  const usedBundleIndexes = new Set<number>();
  const bundleGroups: CoreBundle[][] = [];
  for (const edge of bundleEdges) {
    if (bundleGroups.length >= doubleGroupCount) break;
    if (usedBundleIndexes.has(edge.leftIndex) || usedBundleIndexes.has(edge.rightIndex)) continue;
    bundleGroups.push([pairedBundles[edge.leftIndex], pairedBundles[edge.rightIndex]]);
    usedBundleIndexes.add(edge.leftIndex);
    usedBundleIndexes.add(edge.rightIndex);
  }

  const remainingBundles = pairedBundles.filter((_, index) => !usedBundleIndexes.has(index));
  while (bundleGroups.length < unitCount && remainingBundles.length) bundleGroups.push([remainingBundles.shift() as CoreBundle]);

  while (remainingBundles.length) {
    let bestBundleIndex = 0;
    let bestGroupIndex = -1;
    let bestScore = -Infinity;
    remainingBundles.forEach((bundle, bundleIndex) => bundleGroups.forEach((group, groupIndex) => {
      if (group.length >= 3) return;
      const groupTokens = new Set(group.flatMap((member) => [...member.tokens]));
      const groupAnchors = new Set(group.flatMap((member) => [...member.anchors]));
      const score = keywordAffinity(bundle.tokens, groupTokens, bundle.anchors, groupAnchors, tokenWeights);
      if (score > bestScore) {
        bestScore = score;
        bestBundleIndex = bundleIndex;
        bestGroupIndex = groupIndex;
      }
    }));
    if (bestGroupIndex < 0) break;
    bundleGroups[bestGroupIndex].push(remainingBundles.splice(bestBundleIndex, 1)[0]);
  }

  const seedGroups = bundleGroups.map((group) => group.flatMap((bundle) => bundle.items));

  const singleItems = [...unmatchedKnowledge.values(), ...unmatchedSkills.values()];
  const minimumCoreSize = Math.min(5, Math.floor(core.length / unitCount));
  while (singleItems.length) {
    let bestItemIndex = 0;
    let bestUnitIndex = 0;
    let bestScore = -Infinity;
    const needsMinimumCore = seedGroups.some((group) => group.length < minimumCoreSize);
    singleItems.forEach((item, itemIndex) => {
      const itemTokens = tokenise(item.description);
      const itemAnchors = anchorTokens(item.description);
      seedGroups.forEach((group, groupIndex) => {
        if (needsMinimumCore && group.length >= minimumCoreSize) return;
        if (!needsMinimumCore && group.length >= 6) return;
        const groupTokens = combineTokens(group);
        const groupAnchors = combineAnchorTokens(group);
        const score = keywordAffinity(itemTokens, groupTokens, itemAnchors, groupAnchors, tokenWeights);
        if (score > bestScore) {
          bestScore = score;
          bestItemIndex = itemIndex;
          bestUnitIndex = groupIndex;
        }
      });
    });
    seedGroups[bestUnitIndex].push(singleItems.splice(bestItemIndex, 1)[0]);
  }

  const units: CourseUnit[] = seedGroups.map((items, index) => {
    const selectedBehaviours = [...behaviours]
      .sort((left, right) => behaviourScore(right, items, tokenWeights) - behaviourScore(left, items, tokenWeights) || left.code.localeCompare(right.code, undefined, { numeric: true }))
      .slice(0, 2);
    const knowledgeCount = items.filter((item) => item.type === "Knowledge").length;
    const skillCount = items.filter((item) => item.type === "Skill").length;
    return {
      id: `unit-${index + 1}`,
      number: index + 1,
      title: generateSkillTitle(items),
      summary: `${knowledgeCount} Knowledge and ${skillCount} Skill${skillCount === 1 ? "" : "s"}, grouped for holistic evidence.`,
      ksbs: [...items, ...selectedBehaviours],
    };
  });

  const mappedCodes = units.flatMap((unit) => unit.ksbs.filter((item) => item.type !== "Behaviour").map((item) => item.code));
  const mappedSet = new Set(mappedCodes);
  const validSizes = units.every((unit) => {
    const unitCore = unit.ksbs.filter((item) => item.type !== "Behaviour");
    return unitCore.length >= 3 && unitCore.length <= 6
      && unitCore.some((item) => item.type === "Knowledge")
      && unitCore.some((item) => item.type === "Skill")
      && unit.ksbs.filter((item) => item.type === "Behaviour").length === 2;
  });
  if (!validSizes || mappedCodes.length !== core.length || mappedSet.size !== core.length) {
    return { course: null, error: "I couldn’t balance that list safely. Check that every K and S code is unique, then try again." };
  }

  return {
    course: {
      createdAt: Date.now(), mappingVersion: courseMappingVersion, sourceType: "auto", rawKsbs, units,
      inputCounts: { knowledge: knowledge.length, skills: skills.length, behaviours: behaviours.length },
    },
    error: "",
  };
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("root");
  const [panelLeaving, setPanelLeaving] = useState(false);
  const [expression, setExpression] = useState<EviaExpression>("idle");
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [employer, setEmployer] = useState("");
  const [course, setCourse] = useState<LearnerCourse | null>(null);
  const [timeline, setTimeline] = useState<CourseTimeline>({ startDate: "", endDate: "", weeklyHours: 37 });
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>([]);
  const [otjEntries, setOtjEntries] = useState<OtjEntry[]>([]);
  const [epaChecks, setEpaChecks] = useState<Record<EpaArea, boolean[]>>({
    practical: [false, false, false, false],
    interview: [false, false, false, false],
    mcq: [false, false, false, false],
  });
  const [epaResponses, setEpaResponses] = useState<Record<EpaArea, string[]>>({ practical: ["", "", "", ""], interview: ["", "", "", ""], mcq: ["", "", "", ""] });
  const [epaAnswers, setEpaAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [rplCodes, setRplCodes] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({ textSize: "standard", highContrast: false, reduceMotion: false, readingFocus: false, readAloud: false });
  const [selectedStudyCategory, setSelectedStudyCategory] = useState<StudyCategory>("maths-english");
  const [selectedStudyModuleId, setSelectedStudyModuleId] = useState("");
  const [studyAnswers, setStudyAnswers] = useState<Record<string, number[]>>({});
  const [ksbsText, setKsbsText] = useState("");
  const [layoutText, setLayoutText] = useState("");
  const [courseFileName, setCourseFileName] = useState("");
  const [pendingFileCourse, setPendingFileCourse] = useState<LearnerCourse | null>(null);
  const [courseError, setCourseError] = useState("");
  const [courseManagerBack, setCourseManagerBack] = useState<View>("profile");
  const [unitSearch, setUnitSearch] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [activeEpaArea, setActiveEpaArea] = useState<EpaArea>("practical");
  const [activeEvidenceKsb, setActiveEvidenceKsb] = useState<CourseKsb | null>(null);
  const [evidenceBack, setEvidenceBack] = useState<View>("unit");
  const [activeEvidenceMethod, setActiveEvidenceMethod] = useState<EvidenceMethod>("photo");
  const [evidenceStep, setEvidenceStep] = useState(0);
  const [evidenceFiles, setEvidenceFiles] = useState<(File | null)[]>([]);
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceError, setEvidenceError] = useState("");
  const [timelineError, setTimelineError] = useState("");
  const [otjError, setOtjError] = useState("");
  const [savingEvidence, setSavingEvidence] = useState(false);
  const [exporting, setExporting] = useState("");
  const [witnessDraft, setWitnessDraft] = useState<NonNullable<EvidenceRecord["witness"]>>({ name: "", role: "", date: todayDateValue(), testimony: "", signature: undefined, signedAt: undefined });
  const [otjDraft, setOtjDraft] = useState({ date: todayDateValue(), title: "", hours: "", unitId: "" });
  const [exportRequest, setExportRequest] = useState<ExportRequest | null>(null);
  const [learnerSignature, setLearnerSignature] = useState<SignatureData | null>(null);
  const [employerSignature, setEmployerSignature] = useState<SignatureData | null>(null);
  const [employerSigner, setEmployerSigner] = useState("");
  const [signatureError, setSignatureError] = useState("");
  const [displayedProgress, setDisplayedProgress] = useState<ProgressSnapshot>({ toc: 0, ksb: 0, otj: 0, epa: 0 });
  const [updatedProgress, setUpdatedProgress] = useState<Array<keyof ProgressSnapshot>>([]);
  const [progressCelebration, setProgressCelebration] = useState("");
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [eviaPlusOpen, setEviaPlusOpen] = useState(false);
  const [eviaGuideStep, setEviaGuideStep] = useState(0);
  const [guidedWritingAnswers, setGuidedWritingAnswers] = useState<string[]>([]);
  const [guidedWritingDraft, setGuidedWritingDraft] = useState("");
  const [guidedWritingError, setGuidedWritingError] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [placeholder, setPlaceholder] = useState({ title: "", back: "root" as View });
  const [notice, setNotice] = useState("");
  const [installPrompt, setInstallPrompt] = useState<EviaInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    return window.matchMedia("(display-mode: standalone)").matches
      || navigatorWithStandalone.standalone === true;
  });
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRiseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressBaseline = useRef<ProgressSnapshot | null>(null);
  const previousView = useRef<View>("root");
  const lastReadTap = useRef<{ time: number; element: HTMLElement | null }>({ time: 0, element: null });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as EviaInstallPrompt);
    };
    const markInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);

    if ("serviceWorker" in navigator) {
      const serviceWorkerUrl = new URL("./sw.js", window.location.href).toString();
      navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {
        // Evia remains usable online when service-worker registration is unavailable.
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  useEffect(() => {
    let savedName = "";
    let savedEmployer = "";
    let onboardingComplete = false;
    let savedCourse: LearnerCourse | null = null;
    let savedTimeline: CourseTimeline | null = null;
    let savedEvidence: EvidenceRecord[] = [];
    let savedOtjEntries: OtjEntry[] = [];
    let savedEpaChecks: Record<EpaArea, boolean[]> | null = null;
    let savedEpaResponses: Record<EpaArea, string[]> | null = null;
    let savedEpaAnswers: number[] | null = null;
    let savedRplCodes: string[] = [];
    let savedAccessibility: AccessibilitySettings | null = null;
    let savedStudyAnswers: Record<string, number[]> = {};

    try {
      savedName = window.localStorage.getItem("evia-full-name") ?? "";
      savedEmployer = window.localStorage.getItem("evia-employer") ?? "";
      onboardingComplete = window.localStorage.getItem("evia-onboarding-complete") === "true";
      const storedCourse = window.localStorage.getItem("evia-course");
      savedCourse = storedCourse ? JSON.parse(storedCourse) as LearnerCourse : null;
      const storedTimeline = window.localStorage.getItem("evia-course-timeline");
      savedTimeline = storedTimeline ? JSON.parse(storedTimeline) as CourseTimeline : null;
      const storedEvidence = window.localStorage.getItem("evia-evidence-records");
      const parsedEvidence = storedEvidence ? JSON.parse(storedEvidence) : [];
      savedEvidence = Array.isArray(parsedEvidence) ? parsedEvidence as EvidenceRecord[] : [];
      const storedOtj = window.localStorage.getItem("evia-otj-entries");
      const parsedOtj = storedOtj ? JSON.parse(storedOtj) : [];
      savedOtjEntries = Array.isArray(parsedOtj) ? parsedOtj as OtjEntry[] : [];
      const storedEpa = window.localStorage.getItem("evia-epa-checks");
      savedEpaChecks = storedEpa ? JSON.parse(storedEpa) as Record<EpaArea, boolean[]> : null;
      const storedEpaResponses = window.localStorage.getItem("evia-epa-responses");
      savedEpaResponses = storedEpaResponses ? JSON.parse(storedEpaResponses) as Record<EpaArea, string[]> : null;
      const storedEpaAnswers = window.localStorage.getItem("evia-epa-answers");
      savedEpaAnswers = storedEpaAnswers ? JSON.parse(storedEpaAnswers) as number[] : null;
      const storedRpl = window.localStorage.getItem("evia-rpl-codes");
      savedRplCodes = storedRpl ? JSON.parse(storedRpl) as string[] : [];
      const storedAccessibility = window.localStorage.getItem("evia-accessibility");
      savedAccessibility = storedAccessibility ? JSON.parse(storedAccessibility) as AccessibilitySettings : null;
      const storedStudyAnswers = window.localStorage.getItem("evia-study-answers");
      savedStudyAnswers = storedStudyAnswers ? JSON.parse(storedStudyAnswers) as Record<string, number[]> : {};
    } catch {
      onboardingComplete = false;
    }

    if (!onboardingComplete) {
      setFullName(savedName);
      setOnboardingStep(savedName ? 1 : 0);
    } else {
      setFullName(savedName);
    }
    setEmployer(savedEmployer);

    if (savedCourse?.units?.length) {
      let currentCourse = savedCourse;
      if ((savedCourse.sourceType ?? "auto") === "auto" && savedCourse.mappingVersion !== courseMappingVersion && savedCourse.rawKsbs) {
        const refreshedCourse = buildCourse(savedCourse.rawKsbs).course;
        if (refreshedCourse) {
          currentCourse = refreshedCourse;
          try { window.localStorage.setItem("evia-course", JSON.stringify(refreshedCourse)); } catch { /* Keep the refreshed session course. */ }
        }
      }
      setCourse(currentCourse);
      if (currentCourse.sourceType === "layout") setLayoutText(currentCourse.rawKsbs ?? "");
      else if ((currentCourse.sourceType ?? "auto") === "auto") setKsbsText(currentCourse.rawKsbs ?? "");
    }
    if (savedTimeline?.startDate || savedTimeline?.endDate || savedTimeline?.weeklyHours) {
      setTimeline({
        startDate: savedTimeline.startDate ?? "",
        endDate: savedTimeline.endDate ?? "",
        weeklyHours: Number(savedTimeline.weeklyHours) || 37,
      });
    }
    setEvidenceRecords(savedEvidence.filter((record) => record?.ksbCode && record?.method));
    setOtjEntries(savedOtjEntries.filter((entry) => entry?.date && Number(entry?.hours) > 0));
    if (savedEpaChecks) {
      setEpaChecks({
        practical: Array.isArray(savedEpaChecks.practical) ? savedEpaChecks.practical.slice(0, 4) : [false, false, false, false],
        interview: Array.isArray(savedEpaChecks.interview) ? savedEpaChecks.interview.slice(0, 4) : [false, false, false, false],
        mcq: Array.isArray(savedEpaChecks.mcq) ? savedEpaChecks.mcq.slice(0, 4) : [false, false, false, false],
      });
    }
    if (savedEpaResponses) setEpaResponses({
      practical: Array.isArray(savedEpaResponses.practical) ? savedEpaResponses.practical.slice(0, 4) : ["", "", "", ""],
      interview: Array.isArray(savedEpaResponses.interview) ? savedEpaResponses.interview.slice(0, 4) : ["", "", "", ""],
      mcq: Array.isArray(savedEpaResponses.mcq) ? savedEpaResponses.mcq.slice(0, 4) : ["", "", "", ""],
    });
    if (savedEpaAnswers) setEpaAnswers(savedEpaAnswers.slice(0, 4));
    setRplCodes(Array.isArray(savedRplCodes) ? savedRplCodes.filter((code) => typeof code === "string") : []);
    if (savedAccessibility) setAccessibility({
      textSize: ["standard", "large", "extra"].includes(savedAccessibility.textSize) ? savedAccessibility.textSize : "standard",
      highContrast: Boolean(savedAccessibility.highContrast), reduceMotion: Boolean(savedAccessibility.reduceMotion),
      readingFocus: Boolean(savedAccessibility.readingFocus), readAloud: Boolean(savedAccessibility.readAloud),
    });
    setStudyAnswers(savedStudyAnswers && typeof savedStudyAnswers === "object" ? savedStudyAnswers : {});
    setOnboardingChecked(true);
  }, []);

  useEffect(() => {
    if (onboardingStep !== null) {
      if (onboardingStep === 1) setExpression("smile");
      else if (onboardingStep >= 2) setExpression("look-down");
      else setExpression("idle");
      return;
    }

    if (eviaPlusOpen) {
      setExpression(eviaGuideStep % 3 === 2 ? "smile" : "look-down");
      return;
    }

    const reduceMotion = accessibility.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setExpression(open ? "look-down" : "idle");
      return;
    }

    const sequence = open ? attentiveExpressionSequence : calmExpressionSequence;
    let previousPose: EviaExpression | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const showNextExpression = () => {
      const choices = sequence.filter((item) => item.pose !== previousPose);
      const next = choices[Math.floor(Math.random() * choices.length)] ?? sequence[0];
      previousPose = next.pose;
      setExpression(next.pose);
      timer = setTimeout(() => {
        showNextExpression();
      }, next.duration + Math.round(Math.random() * 1050));
    };
    showNextExpression();
    return () => clearTimeout(timer);
  }, [open, view, onboardingStep, accessibility.reduceMotion, eviaPlusOpen, eviaGuideStep]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    if (progressTimer.current) clearTimeout(progressTimer.current);
    if (progressRiseTimer.current) clearTimeout(progressRiseTimer.current);
  }, []);

  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const isOnboarding = onboardingChecked && onboardingStep !== null;
  const selectedUnit = course?.units.find((unit) => unit.id === selectedUnitId) ?? null;
  const courseKsbs = [...new Map(
    (course?.units.flatMap((unit) => unit.ksbs) ?? []).map((ksb) => [ksb.code, ksb]),
  ).values()];
  const courseKsbCodes = new Set(courseKsbs.map((ksb) => ksb.code));
  const completedKsbCodes = new Set(
    [
      ...evidenceRecords.filter((record) => courseKsbCodes.has(record.ksbCode) && evidenceRecordComplete(record)).map((record) => record.ksbCode),
      ...rplCodes.filter((code) => courseKsbCodes.has(code)),
    ],
  );
  const ksbProgress = courseKsbs.length ? clampPercentage((completedKsbCodes.size / courseKsbs.length) * 100) : 0;
  const courseStart = parseLocalDate(timeline.startDate);
  const courseEnd = parseLocalDate(timeline.endDate);
  const today = parseLocalDate(todayDateValue()) ?? new Date();
  const validTimeline = Boolean(courseStart && courseEnd && courseEnd > courseStart);
  const totalCourseDays = validTimeline && courseStart && courseEnd ? Math.max(1, dateDifferenceInDays(courseStart, courseEnd)) : 0;
  const courseElapsedDays = validTimeline && courseStart && courseEnd
    ? Math.min(totalCourseDays, dateDifferenceInDays(courseStart, today))
    : 0;
  const tocProgress = totalCourseDays ? clampPercentage((courseElapsedDays / totalCourseDays) * 100) : 0;
  const weeklyOtjTarget = Math.max(0, Number(timeline.weeklyHours) || 0) * 0.2;
  const totalOtjHours = weeklyOtjTarget * (totalCourseDays / 7);
  const requiredOtjHours = weeklyOtjTarget * (courseElapsedDays / 7);
  const loggedOtjHours = otjEntries.reduce((total, entry) => total + (Number(entry.hours) || 0), 0);
  const otjProgress = requiredOtjHours > 0 ? clampPercentage((loggedOtjHours / requiredOtjHours) * 100) : 0;
  const completedEpaAreas = (Object.keys(epaPracticeAreas) as EpaArea[])
    .filter((area) => epaChecks[area]?.length === epaPracticeAreas[area].steps.length && epaChecks[area].every(Boolean));
  const epaProgress = clampPercentage((completedEpaAreas.length / 3) * 100);
  const evidenceProgressForCode = (code: string) => {
    if (rplCodes.includes(code)) return 100;
    return evidenceRecords
      .filter((record) => record.ksbCode === code)
      .reduce((best, record) => Math.max(best, evidenceRecordProgress(record)), 0);
  };
  const unitProgressDetails = (unit: CourseUnit) => {
    const ksbs = [...new Map(unit.ksbs.map((ksb) => [ksb.code, ksb])).values()];
    const progressValues = ksbs.map((ksb) => evidenceProgressForCode(ksb.code));
    const complete = progressValues.filter((value) => value === 100).length;
    const started = progressValues.filter((value) => value > 0).length;
    const percentage = ksbs.length ? clampPercentage(progressValues.reduce((total, value) => total + value, 0) / ksbs.length) : 0;
    return { total: ksbs.length, complete, started, percentage, isComplete: Boolean(ksbs.length) && complete === ksbs.length };
  };
  const unitOtjTarget = course?.units.length ? totalOtjHours / course.units.length : 0;
  const unitOtjHours = (unitId: string) => otjEntries
    .filter((entry) => entry.unitId === unitId)
    .reduce((total, entry) => total + (Number(entry.hours) || 0), 0);

  useEffect(() => {
    if (!onboardingChecked) return;
    const current = { toc: tocProgress, ksb: ksbProgress, otj: otjProgress, epa: epaProgress };
    if (!progressBaseline.current) {
      progressBaseline.current = current;
      setDisplayedProgress(current);
      previousView.current = view;
      return;
    }

    const returnedHome = view === "root" && previousView.current !== "root";
    if (returnedHome) {
      const baseline = progressBaseline.current;
      const changed = (Object.keys(current) as Array<keyof ProgressSnapshot>).filter((key) => current[key] !== baseline[key]);
      if (changed.length) {
        setDisplayedProgress(baseline);
        setUpdatedProgress(changed);
        const positive = changed.filter((key) => current[key] > baseline[key]);
        const preferred = positive.find((key) => key === "ksb") ?? positive.find((key) => key === "otj") ?? positive.find((key) => key === "epa") ?? positive[0];
        if (preferred) {
          const change = current[preferred] - baseline[preferred];
          const messages: Record<keyof ProgressSnapshot, string> = {
            toc: `Your Time on Course is now ${current.toc}%.`,
            ksb: `You’ve just added ${change}% to your KSB completion!`,
            otj: `You improved your OTJ by ${change}%!`,
            epa: `You improved your EPA readiness by ${change}%!`,
          };
          setProgressCelebration(messages[preferred]);
        } else {
          const key = changed[0];
          setProgressCelebration(`Your ${key.toUpperCase()} progress is now ${current[key]}%.`);
        }
        if (progressRiseTimer.current) clearTimeout(progressRiseTimer.current);
        progressRiseTimer.current = setTimeout(() => setDisplayedProgress(current), 120);
        if (progressTimer.current) clearTimeout(progressTimer.current);
        progressTimer.current = setTimeout(() => {
          setUpdatedProgress([]);
        }, 4800);
      } else setDisplayedProgress(current);
      progressBaseline.current = current;
    }
    previousView.current = view;
  }, [onboardingChecked, view, tocProgress, ksbProgress, otjProgress, epaProgress]);

  useEffect(() => {
    if (!course?.units.length || otjDraft.unitId) return;
    setOtjDraft((current) => ({ ...current, unitId: course.units[0].id }));
  }, [course, otjDraft.unitId]);
  const searchTerm = unitSearch.trim().toLowerCase();
  const filteredUnits = course?.units.filter((unit) => {
    if (!searchTerm) return true;
    return `${unit.title} ${unit.summary} ${unit.ksbs.map((ksb) => `${ksb.code} ${ksb.title} ${ksb.description}`).join(" ")}`
      .toLowerCase()
      .includes(searchTerm);
  }) ?? [];
  const draftKsbs = parseKsbs(ksbsText);
  const draftCounts = {
    knowledge: draftKsbs.filter((item) => item.type === "Knowledge").length,
    skills: draftKsbs.filter((item) => item.type === "Skill").length,
    behaviours: draftKsbs.filter((item) => item.type === "Behaviour").length,
  };
  const layoutDraftKsbs = parseKsbs(layoutText);
  const layoutDraftCounts = {
    knowledge: layoutDraftKsbs.filter((item) => item.type === "Knowledge").length,
    skills: layoutDraftKsbs.filter((item) => item.type === "Skill").length,
    behaviours: new Set(layoutDraftKsbs.filter((item) => item.type === "Behaviour").map((item) => item.code)).size,
  };
  const selectedStudyModule = studyModules.find((module) => module.id === selectedStudyModuleId) ?? null;
  const activeEvidenceRecord = activeEvidenceKsb
    ? evidenceRecords.find((record) => record.ksbCode === activeEvidenceKsb.code && record.method === activeEvidenceMethod)
    : undefined;
  const homeGuidanceMessages = (() => {
    const messages: string[] = [];
    const partialPhoto = evidenceRecords.find((record) => record.method === "photo" && record.fileIds.length > 0 && record.fileIds.length < 3);
    if (partialPhoto) messages.push(`${partialPhoto.ksbCode} · add ${3 - partialPhoto.fileIds.length} more photo${3 - partialPhoto.fileIds.length === 1 ? "" : "s"}`);
    const partialRecord = evidenceRecords.find((record) => !evidenceRecordComplete(record) && record.id !== partialPhoto?.id);
    if (partialRecord) messages.push(`${partialRecord.ksbCode} · finish ${evidenceMethodNames[partialRecord.method].toLowerCase()}`);
    if (!course) messages.push("Add your course");
    else {
      const nextKsb = courseKsbs.find((ksb) => !completedKsbCodes.has(ksb.code));
      if (nextKsb && !messages.length) messages.push(`${nextKsb.code} · add evidence`);
      if (requiredOtjHours > loggedOtjHours + 0.05) messages.push(`OTJ · ${(requiredOtjHours - loggedOtjHours).toFixed(1)}h behind target`);
      const nextEpa = (Object.keys(epaPracticeAreas) as EpaArea[]).find((area) => !completedEpaAreas.includes(area));
      if (nextEpa) messages.push(`EPA · ${epaPracticeAreas[nextEpa].title.toLowerCase()}`);
    }
    return messages.slice(0, 4);
  })();

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 2800);
  };

  const saveTimeline = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = parseLocalDate(timeline.startDate);
    const end = parseLocalDate(timeline.endDate);
    const weeklyHours = Number(timeline.weeklyHours);
    if (!start || !end) {
      setTimelineError("Add both your course start date and planned end date.");
      return;
    }
    if (end <= start) {
      setTimelineError("Your planned end date must be after your start date.");
      return;
    }
    if (dateDifferenceInDays(start, end) > 3650) {
      setTimelineError("Check those dates. A course timeline can be up to 10 years long.");
      return;
    }
    if (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > 100) {
      setTimelineError("Add your normal weekly working hours, between 1 and 100.");
      return;
    }
    const savedTimeline = { ...timeline, weeklyHours };
    setTimeline(savedTimeline);
    setTimelineError("");
    try { window.localStorage.setItem("evia-course-timeline", JSON.stringify(savedTimeline)); } catch { /* Keep session data. */ }
    showNotice("Your course timeline has been updated.");
  };

  const persistEvidenceRecords = (records: EvidenceRecord[]) => {
    setEvidenceRecords(records);
    try { window.localStorage.setItem("evia-evidence-records", JSON.stringify(records)); } catch { /* Keep session data. */ }
  };

  const openEvidenceOptions = (ksb: CourseKsb) => {
    setActiveEvidenceKsb(ksb);
    setEvidenceBack(view);
    setEvidenceError("");
    navigate("evidence-options");
  };

  const startEvidence = (ksb: CourseKsb, method: EvidenceMethod) => {
    const saved = evidenceRecords.find((record) => record.ksbCode === ksb.code && record.method === method);
    setActiveEvidenceKsb(ksb);
    setActiveEvidenceMethod(method);
    setEvidenceStep(1);
    setEvidenceFiles([]);
    setEvidenceText(saved?.text ?? "");
    setWitnessDraft(saved?.witness ?? { name: "", role: "", date: todayDateValue(), testimony: "", signature: undefined, signedAt: undefined });
    setEvidenceError("");
    navigate("evidence");
  };

  const saveMediaEvidence = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !activeEvidenceKsb || savingEvidence) return;
    const existing = evidenceRecords.find((record) => record.ksbCode === activeEvidenceKsb.code && record.method === activeEvidenceMethod);
    if (activeEvidenceMethod === "photo" && (existing?.fileIds.length ?? 0) >= 3) return;
    if (file.size > 250_000_000) {
      setEvidenceError("That file is larger than 250 MB. Record a shorter clip or choose a smaller file.");
      return;
    }
    setSavingEvidence(true);
    setEvidenceError("");
    const recordId = existing?.id ?? `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const index = activeEvidenceMethod === "photo" ? (existing?.fileIds.length ?? 0) : 0;
    const fileId = `${recordId}-file-${Date.now()}-${index + 1}`;
    const namedFile = new File([file], evidenceFileName(activeEvidenceKsb, activeEvidenceMethod, index, file), { type: file.type, lastModified: file.lastModified });
    try {
      await saveEvidenceFile(fileId, namedFile);
      if (activeEvidenceMethod !== "photo" && existing?.fileIds.length) {
        await Promise.all(existing.fileIds.map((id) => deleteEvidenceFile(id).catch(() => undefined)));
      }
      const nextRecord: EvidenceRecord = {
        ...(existing ?? { id: recordId, ksbCode: activeEvidenceKsb.code, ksbType: activeEvidenceKsb.type, method: activeEvidenceMethod, createdAt: Date.now(), fileIds: [], fileNames: [] }),
        updatedAt: Date.now(),
        fileIds: activeEvidenceMethod === "photo" ? [...(existing?.fileIds ?? []), fileId] : [fileId],
        fileNames: activeEvidenceMethod === "photo" ? [...(existing?.fileNames ?? []), namedFile.name] : [namedFile.name],
      };
      const nextRecords = existing ? evidenceRecords.map((record) => record.id === existing.id ? nextRecord : record) : [...evidenceRecords, nextRecord];
      persistEvidenceRecords(nextRecords);
      const progress = evidenceRecordProgress(nextRecord);
      showNotice(progress === 100 ? `${activeEvidenceKsb.code} evidence complete.` : `${activeEvidenceKsb.code} saved · ${progress}% complete.`);
    } catch {
      setEvidenceError("Evia couldn’t save that file on this device. Check storage space and try again.");
    } finally {
      setSavingEvidence(false);
    }
  };

  const removeMediaEvidence = async (index: number) => {
    if (!activeEvidenceRecord || savingEvidence) return;
    const fileId = activeEvidenceRecord.fileIds[index];
    setSavingEvidence(true);
    try {
      await deleteEvidenceFile(fileId);
      const nextIds = activeEvidenceRecord.fileIds.filter((_, itemIndex) => itemIndex !== index);
      const nextNames = activeEvidenceRecord.fileNames.filter((_, itemIndex) => itemIndex !== index);
      const nextRecords = nextIds.length
        ? evidenceRecords.map((record) => record.id === activeEvidenceRecord.id ? { ...record, fileIds: nextIds, fileNames: nextNames, updatedAt: Date.now() } : record)
        : evidenceRecords.filter((record) => record.id !== activeEvidenceRecord.id);
      persistEvidenceRecords(nextRecords);
      showNotice("Evidence file deleted.");
    } catch {
      setEvidenceError("That file could not be deleted. Try again.");
    } finally {
      setSavingEvidence(false);
    }
  };

  // Retained for the legacy render branch below; the live evidence workflow saves media immediately.
  const selectEvidenceFile = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setEvidenceFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });
  };
  const continueEvidence = () => setEvidenceStep((step) => Math.min(2, step + 1));

  const validateEvidence = () => {
    if (["written", "reflection"].includes(activeEvidenceMethod) && countWords(evidenceText) < 30) {
      return "Add at least 30 words so your evidence gives the assessor enough specific detail.";
    }
    if (activeEvidenceMethod === "witness") {
      if (!witnessDraft.name.trim() || !witnessDraft.role.trim() || !witnessDraft.date) {
        return "Add the witness’s name, role and the date they observed you.";
      }
      if (countWords(witnessDraft.testimony) < 30) {
        return "The witness testimony needs at least 30 words describing what they personally observed.";
      }
      if (!witnessDraft.signature?.strokes.length) {
        return "The witness must sign the testimony before it can be saved.";
      }
    }
    return "";
  };

  const saveEvidence = async () => {
    if (!activeEvidenceKsb || savingEvidence) return;
    const error = validateEvidence();
    if (error) {
      setEvidenceError(error);
      return;
    }
    setSavingEvidence(true);
    setEvidenceError("");
    const existing = evidenceRecords.find((record) => record.ksbCode === activeEvidenceKsb.code && record.method === activeEvidenceMethod);
    const recordId = existing?.id ?? `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      const nextRecord: EvidenceRecord = {
        ...(existing ?? { id: recordId, ksbCode: activeEvidenceKsb.code, ksbType: activeEvidenceKsb.type, method: activeEvidenceMethod, createdAt: Date.now(), fileIds: [], fileNames: [] }),
        updatedAt: Date.now(),
        fileNames: [`${fileSafe(`${activeEvidenceKsb.code}-${conciseTitle(activeEvidenceKsb.description, 7)}-${evidenceMethodNames[activeEvidenceMethod]}`)}.txt`],
        ...(["written", "reflection"].includes(activeEvidenceMethod) ? { text: evidenceText.trim() } : {}),
        ...(activeEvidenceMethod === "witness" ? { witness: { ...witnessDraft, name: witnessDraft.name.trim(), role: witnessDraft.role.trim(), testimony: witnessDraft.testimony.trim(), signedAt: Date.now() } } : {}),
      };
      const nextRecords = existing ? evidenceRecords.map((record) => record.id === existing.id ? nextRecord : record) : [...evidenceRecords, nextRecord];
      persistEvidenceRecords(nextRecords);
      showNotice(`${activeEvidenceKsb.code} evidence saved on this device.`);
      setSavingEvidence(false);
      navigate("evidence-options");
    } catch {
      setSavingEvidence(false);
      setEvidenceError("Evia couldn’t save that file on this device. Check your available storage and try again.");
    }
  };

  const addOtjEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hours = Number(otjDraft.hours);
    if (!course?.units.length) {
      setOtjError("Add your course before recording Unit-linked OTJ activity.");
      return;
    }
    if (!otjDraft.unitId || !course.units.some((unit) => unit.id === otjDraft.unitId)) {
      setOtjError("Choose the Unit this learning relates to.");
      return;
    }
    if (!otjDraft.date || !otjDraft.title.trim() || !Number.isFinite(hours) || hours <= 0 || hours > 24) {
      setOtjError("Add the activity, date and the number of off-the-job hours, up to 24 hours per entry.");
      return;
    }
    const nextEntries = [...otjEntries, {
      id: `otj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: otjDraft.date,
      title: otjDraft.title.trim(),
      hours,
      unitId: otjDraft.unitId,
      createdAt: Date.now(),
    }];
    setOtjEntries(nextEntries);
    setOtjDraft({ date: todayDateValue(), title: "", hours: "", unitId: otjDraft.unitId });
    setOtjError("");
    try { window.localStorage.setItem("evia-otj-entries", JSON.stringify(nextEntries)); } catch { /* Keep session data. */ }
    showNotice(`${hours} OTJ hour${hours === 1 ? "" : "s"} added.`);
  };

  const toggleEpaStep = (area: EpaArea, index: number) => {
    setEpaChecks((current) => {
      const nextArea = [...current[area]];
      nextArea[index] = !nextArea[index];
      const next = { ...current, [area]: nextArea };
      try { window.localStorage.setItem("evia-epa-checks", JSON.stringify(next)); } catch { /* Keep session data. */ }
      return next;
    });
  };

  const updateEpaResponse = (area: EpaArea, index: number, value: string) => {
    setEpaResponses((current) => {
      const nextArea = [...current[area]];
      nextArea[index] = value;
      const next = { ...current, [area]: nextArea };
      try { window.localStorage.setItem("evia-epa-responses", JSON.stringify(next)); } catch { /* Keep session data. */ }
      return next;
    });
    setEpaChecks((current) => {
      const nextArea = [...current[area]];
      nextArea[index] = countWords(value) >= 12;
      const next = { ...current, [area]: nextArea };
      try { window.localStorage.setItem("evia-epa-checks", JSON.stringify(next)); } catch { /* Keep session data. */ }
      return next;
    });
  };

  const answerEpaQuestion = (index: number, answer: number) => {
    const nextAnswers = [...epaAnswers];
    nextAnswers[index] = answer;
    setEpaAnswers(nextAnswers);
    try { window.localStorage.setItem("evia-epa-answers", JSON.stringify(nextAnswers)); } catch { /* Keep session data. */ }
    setEpaChecks((current) => {
      const nextMcq = epaMcqQuestions.map((question, questionIndex) => nextAnswers[questionIndex] === question.answer);
      const next = { ...current, mcq: nextMcq };
      try { window.localStorage.setItem("evia-epa-checks", JSON.stringify(next)); } catch { /* Keep session data. */ }
      return next;
    });
  };

  const startEpa = (area: EpaArea) => {
    setActiveEpaArea(area);
    navigate("epa-session");
  };

  const completeEpaSession = () => {
    if (!epaChecks[activeEpaArea].every(Boolean)) return;
    showNotice(`${epaPracticeAreas[activeEpaArea].title} completed.`);
    navigate("epa-practice");
  };

  const saveProfileDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedName = fullName.trim().replace(/\s+/g, " ");
    const cleanedEmployer = employer.trim().replace(/\s+/g, " ");
    const start = parseLocalDate(timeline.startDate);
    const end = parseLocalDate(timeline.endDate);
    const weeklyHours = Number(timeline.weeklyHours);
    if (!cleanedName || !cleanedEmployer) {
      setTimelineError("Add the learner’s full name and employer.");
      return;
    }
    if (!start || !end || end <= start) {
      setTimelineError("Add a valid course start date and an end date after it.");
      return;
    }
    if (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > 100) {
      setTimelineError("Working hours must be between 1 and 100 per week.");
      return;
    }
    const nextTimeline = { ...timeline, weeklyHours };
    setFullName(cleanedName);
    setEmployer(cleanedEmployer);
    setTimeline(nextTimeline);
    setTimelineError("");
    try {
      window.localStorage.setItem("evia-full-name", cleanedName);
      window.localStorage.setItem("evia-employer", cleanedEmployer);
      window.localStorage.setItem("evia-course-timeline", JSON.stringify(nextTimeline));
    } catch { /* Keep session data. */ }
    showNotice("Your learner details have been saved.");
  };

  const updateAccessibility = (changes: Partial<AccessibilitySettings>) => {
    const next = { ...accessibility, ...changes };
    setAccessibility(next);
    try { window.localStorage.setItem("evia-accessibility", JSON.stringify(next)); } catch { /* Keep session data. */ }
  };

  const toggleRpl = (code: string) => {
    const next = rplCodes.includes(code) ? rplCodes.filter((item) => item !== code) : [...rplCodes, code];
    setRplCodes(next);
    try { window.localStorage.setItem("evia-rpl-codes", JSON.stringify(next)); } catch { /* Keep session data. */ }
  };

  const answerStudyQuestion = (moduleId: string, index: number, answer: number) => {
    const nextModule = [...(studyAnswers[moduleId] ?? [])];
    nextModule[index] = answer;
    const next = { ...studyAnswers, [moduleId]: nextModule };
    setStudyAnswers(next);
    try { window.localStorage.setItem("evia-study-answers", JSON.stringify(next)); } catch { /* Keep session data. */ }
  };

  const witnessSignatureBlocks = (codes: Set<string>): PdfSignatureBlock[] => evidenceRecords
    .filter((record) => codes.has(record.ksbCode) && record.method === "witness" && record.witness?.signature?.strokes.length)
    .map((record) => ({
      label: `Witness declaration · ${record.ksbCode}`,
      name: record.witness?.name ?? "Witness",
      role: record.witness?.role ?? "Witness",
      signedAt: record.witness?.signedAt ?? record.updatedAt ?? record.createdAt,
      signature: record.witness?.signature as SignatureData,
    }));

  const unitPdf = (unit: CourseUnit, learnerApproval: SignatureApproval) => {
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const uniqueKsbs = [...new Map(unit.ksbs.map((ksb) => [ksb.code, ksb])).values()];
    const unitCodes = new Set(uniqueKsbs.map((ksb) => ksb.code));
    const lines = [
      "UNIT EVIDENCE PACK", "", "LEARNER DETAILS", `Learner: ${fullName || "Not supplied"}`,
      `Employer: ${employer || "Not supplied"}`, `Course dates: ${timeline.startDate || "Not supplied"} to ${timeline.endDate || "Not supplied"}`,
      `Working hours: ${timeline.weeklyHours || 0} per week`, `Generated: ${date}`, "", "MAPPING SUMMARY",
      `${uniqueKsbs.length} mapped KSBs | ${uniqueKsbs.filter((ksb) => completedKsbCodes.has(ksb.code)).length} complete or RPL`, "",
    ];
    uniqueKsbs.forEach((ksb) => {
      lines.push(`${ksb.code} - ${ksb.type}: ${ksb.description}`);
      if (rplCodes.includes(ksb.code)) lines.push("RPL: Marked as recognised prior learning by an authorised administrator.");
      const records = evidenceRecords.filter((record) => record.ksbCode === ksb.code);
      if (!records.length && !rplCodes.includes(ksb.code)) lines.push("EVIDENCE: No evidence currently saved.");
      records.forEach((record) => {
        lines.push(`EVIDENCE: ${evidenceMethodNames[record.method]} - ${evidenceRecordComplete(record) ? "Complete" : `${evidenceRecordProgress(record)}% complete`}`);
        record.fileNames.forEach((name) => lines.push(`Attached media: ${name}`));
        if (record.text) lines.push(`Learner account: ${record.text}`);
        if (record.witness) {
          lines.push(`Witness: ${record.witness.name}, ${record.witness.role}, observed ${record.witness.date}. ${record.witness.testimony}`);
          if (record.witness.signedAt) lines.push(`Witness signature captured: ${new Date(record.witness.signedAt).toLocaleString("en-GB")}`);
        }
      });
      lines.push("");
    });
    const signatures: PdfSignatureBlock[] = [
      { ...learnerApproval, label: "Learner declaration" },
      ...witnessSignatureBlocks(unitCodes),
    ];
    return createEvidencePdf(`${unit.title} - Evidence Pack`, `${fullName || "Learner"} | Professionally mapped to the course KSBs`, lines, signatures);
  };

  const unitPackEntries = async (unit: CourseUnit, learnerApproval: SignatureApproval, prefix = "") => {
    const unitName = fileSafe(unit.title);
    const entries: { name: string; blob: Blob }[] = [{ name: `${prefix}${unitName}-Evidence-Pack.pdf`, blob: unitPdf(unit, learnerApproval) }];
    const codes = new Set(unit.ksbs.map((ksb) => ksb.code));
    const records = evidenceRecords.filter((record) => codes.has(record.ksbCode));
    for (const record of records) {
      for (let index = 0; index < record.fileIds.length; index += 1) {
        const stored = await getEvidenceFile(record.fileIds[index]);
        if (stored) entries.push({ name: `${prefix}${unitName}-${stored.name || record.fileNames[index]}`, blob: stored.blob });
      }
      if (record.text) entries.push({ name: `${prefix}${unitName}-${record.fileNames[0] ?? `${record.ksbCode}-${record.method}.txt`}`, blob: new Blob([record.text], { type: "text/plain;charset=utf-8" }) });
      if (record.witness) entries.push({ name: `${prefix}${unitName}-${record.fileNames[0] ?? `${record.ksbCode}-Witness-Testimony.txt`}`, blob: new Blob([`Witness: ${record.witness.name}\nRole: ${record.witness.role}\nDate observed: ${record.witness.date}\nSigned in Evia: ${record.witness.signedAt ? new Date(record.witness.signedAt).toLocaleString("en-GB") : "Not recorded"}\nMapped KSB: ${record.ksbCode}\n\n${record.witness.testimony}`], { type: "text/plain;charset=utf-8" }) });
    }
    return entries;
  };

  const downloadUnitPack = async (unit: CourseUnit, learnerApproval: SignatureApproval) => {
    if (exporting) return;
    setExporting(unit.id);
    try {
      const zip = await createZip(await unitPackEntries(unit, learnerApproval));
      triggerDownload(zip, `${fileSafe(unit.title)}-Evidence-Pack.zip`);
      showNotice(`${unit.title} evidence pack downloaded.`);
    } catch {
      showNotice("Evia couldn’t build that evidence pack. Check the saved media and try again.");
    } finally {
      setExporting("");
    }
  };

  const downloadFullPortfolio = async (learnerApproval: SignatureApproval) => {
    if (!course || exporting) return;
    setExporting("all");
    try {
      const indexPdf = createEvidencePdf("Evia Apprenticeship Portfolio", fullName || "Learner", [
        "PORTFOLIO SUMMARY", `Learner: ${fullName || "Not supplied"}`, `Employer: ${employer || "Not supplied"}`,
        `Course dates: ${timeline.startDate || "Not supplied"} to ${timeline.endDate || "Not supplied"}`,
        `KSB coverage: ${completedKsbCodes.size} of ${courseKsbs.length} (${ksbProgress}%)`, `Units: ${course.units.length}`, "",
        ...course.units.map((unit) => `${unit.title}: ${unitProgressDetails(unit).complete} of ${unitProgressDetails(unit).total} mapped KSBs complete`),
      ], [{ ...learnerApproval, label: "Learner portfolio declaration" }]);
      const entries: { name: string; blob: Blob }[] = [{ name: "Evia-Portfolio-Index.pdf", blob: indexPdf }];
      for (const unit of course.units) entries.push(...await unitPackEntries(unit, learnerApproval, `${fileSafe(unit.title)}-`));
      triggerDownload(await createZip(entries), `${fileSafe(fullName || "Learner")}-Evia-Portfolio.zip`);
      showNotice("Your complete portfolio has been downloaded.");
    } catch {
      showNotice("Evia couldn’t build the full portfolio. Check the saved media and try again.");
    } finally {
      setExporting("");
    }
  };

  const downloadOtjPack = async (learnerApproval: SignatureApproval, employerApproval?: SignatureApproval) => {
    if (exporting) return;
    setExporting("otj");
    try {
      const lines = [
        "OTJ EVIDENCE PACK", "", "LEARNER DETAILS", `Learner: ${fullName || "Not supplied"}`,
        `Employer: ${employer || "Not supplied"}`, `Course dates: ${timeline.startDate || "Not supplied"} to ${timeline.endDate || "Not supplied"}`,
        `Contracted hours: ${timeline.weeklyHours || 0} per week`, `OTJ course target: ${totalOtjHours.toFixed(1)} hours`,
        `OTJ recorded to date: ${loggedOtjHours.toFixed(1)} hours`, `Pack generated: ${new Date().toLocaleString("en-GB")}`, "",
        "UNIT OTJ SUMMARY",
      ];
      (course?.units ?? []).forEach((unit) => {
        const logged = unitOtjHours(unit.id);
        lines.push(`${unit.title}: ${logged.toFixed(1)}h recorded of ${unitOtjTarget.toFixed(1)}h unit allocation`);
      });
      const unassigned = otjEntries.filter((entry) => !entry.unitId || !course?.units.some((unit) => unit.id === entry.unitId));
      if (unassigned.length) lines.push(`Unassigned legacy entries: ${unassigned.reduce((total, entry) => total + entry.hours, 0).toFixed(1)}h`);
      lines.push("", "ACTIVITY RECORD");
      (course?.units ?? []).forEach((unit) => {
        lines.push(unit.title.toUpperCase());
        const entries = otjEntries.filter((entry) => entry.unitId === unit.id).sort((left, right) => left.date.localeCompare(right.date));
        if (!entries.length) lines.push("No OTJ entries recorded for this Unit.");
        entries.forEach((entry) => {
          const recorded = new Date(entry.createdAt ?? new Date(`${entry.date}T12:00:00`).getTime()).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
          lines.push(`${entry.date} | ${entry.hours.toFixed(1)}h | ${entry.title}`);
          lines.push(`Entry recorded in Evia: ${recorded}`);
        });
        lines.push("");
      });
      if (unassigned.length) {
        lines.push("UNASSIGNED LEGACY ENTRIES");
        unassigned.forEach((entry) => lines.push(`${entry.date} | ${entry.hours.toFixed(1)}h | ${entry.title}`));
      }
      lines.push("", "DECLARATION", "The learner confirms the OTJ activities in this pack are a true record of learning completed away from normal productive duties.");
      if (employerApproval) lines.push(`Employer verification completed by ${employerApproval.name} on ${new Date(employerApproval.signedAt).toLocaleString("en-GB")}.`);
      else lines.push("Employer verification was not added. Employer review is recommended.");
      const signatures: PdfSignatureBlock[] = [{ ...learnerApproval, label: "Learner OTJ declaration" }];
      if (employerApproval) signatures.push({ ...employerApproval, label: "Employer OTJ verification" });
      const pdf = createEvidencePdf("Off-the-job Training Record", `${fullName || "Learner"} | Unit-mapped OTJ activity`, lines, signatures);
      triggerDownload(pdf, `${fileSafe(fullName || "Learner")}-OTJ-Evidence-Pack.pdf`);
      showNotice("Your signed OTJ evidence pack has been downloaded.");
    } catch {
      showNotice("Evia couldn’t build the OTJ pack. Check the saved entries and try again.");
    } finally {
      setExporting("");
    }
  };

  const requestSignedExport = (request: ExportRequest) => {
    if (exporting) return;
    setExportRequest(request);
    setLearnerSignature(null);
    setEmployerSignature(null);
    setEmployerSigner("");
    setSignatureError("");
  };

  const completeSignedExport = async () => {
    if (!exportRequest) return;
    if (!fullName.trim()) {
      setSignatureError("Add the learner’s full name in My Profile before downloading a signed pack.");
      return;
    }
    if (!learnerSignature?.strokes.length) {
      setSignatureError("The learner must sign before the pack can be downloaded.");
      return;
    }
    if (exportRequest.kind === "otj" && ((employerSigner.trim() && !employerSignature?.strokes.length) || (!employerSigner.trim() && employerSignature?.strokes.length))) {
      setSignatureError("Add both the employer representative’s name and signature, or leave both blank.");
      return;
    }
    const signedAt = Date.now();
    const learnerApproval: SignatureApproval = { name: fullName.trim(), role: "Learner", signedAt, signature: learnerSignature };
    const employerApproval = exportRequest.kind === "otj" && employerSigner.trim() && employerSignature
      ? { name: employerSigner.trim(), role: `Employer representative · ${employer || "Employer"}`, signedAt, signature: employerSignature }
      : undefined;
    const request = exportRequest;
    setExportRequest(null);
    if (request.kind === "unit") {
      const unit = course?.units.find((item) => item.id === request.unitId);
      if (unit) await downloadUnitPack(unit, learnerApproval);
    } else if (request.kind === "portfolio") await downloadFullPortfolio(learnerApproval);
    else await downloadOtjPack(learnerApproval, employerApproval);
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").trim().slice(0, 2500));
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const handleTouchReadAloud = (event: ReactPointerEvent<HTMLElement>) => {
    if (!accessibility.readAloud || event.pointerType !== "touch") return;
    const target = event.target as HTMLElement;
    if (target.matches("input, textarea")) return;
    const readable = target.closest("button, article, label, header, p, h1, h2, h3, h4, section") as HTMLElement | null;
    const now = Date.now();
    if (readable && lastReadTap.current.element === readable && now - lastReadTap.current.time < 380) {
      event.preventDefault();
      speakText(readable.innerText);
      lastReadTap.current = { time: 0, element: null };
    } else lastReadTap.current = { time: now, element: readable };
  };

  const installEvia = async () => {
    if (isInstalled) {
      showNotice("Evia is already installed on this device.");
      return;
    }
    if (!installPrompt) {
      showNotice("Use your browser menu and choose Add to Home Screen.");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      showNotice("Evia is being added to your device.");
    }
    setInstallPrompt(null);
  };

  const navigate = (nextView: View) => {
    if (panelLeaving || nextView === view) return;
    setRemindersOpen(false);
    setPanelLeaving(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setView(nextView);
      setPanelLeaving(false);
    }, 180);
  };

  const openProgressView = (nextView: View) => {
    if (!open) {
      setView(nextView);
      setOpen(true);
      return;
    }
    navigate(nextView);
  };

  const progressItems: ProgressItem[] = [
    { label: "TOC", name: "Time on course", value: displayedProgress.toc, updated: updatedProgress.includes("toc"), onClick: () => openProgressView("toc-settings") },
    { label: "KSB", name: "KSB evidence", value: displayedProgress.ksb, target: tocProgress, updated: updatedProgress.includes("ksb"), onClick: () => openProgressView("ksb-progress") },
    { label: "OTJ", name: "Off-the-job training", value: displayedProgress.otj, target: tocProgress, updated: updatedProgress.includes("otj"), onClick: () => openProgressView("otj-progress") },
    { label: "EPA", name: "EPA practice", value: displayedProgress.epa, target: tocProgress, updated: updatedProgress.includes("epa"), onClick: () => openProgressView("epa-practice") },
  ];

  const openPlaceholder = (title: string, back: View) => {
    setPlaceholder({ title, back });
    navigate("placeholder");
  };

  const openCourseManager = (back: View = "profile") => {
    if (course?.sourceType === "layout") setLayoutText(course.rawKsbs);
    else if ((course?.sourceType ?? "auto") === "auto" && course) setKsbsText(course.rawKsbs);
    setCourseManagerBack(back);
    setCourseError("");
    setCourseFileName("");
    setPendingFileCourse(null);
    navigate("manage-course");
  };

  const goBack = () => {
    const targets: Partial<Record<View, View>> = {
      course: "root", study: "root", portfolio: "root", settings: "root", "install-app": "settings", profile: "settings",
      "profile-details": "profile", accessibility: "settings", "study-library": "study", "study-module": "study-library",
      "manage-course": courseManagerBack, "import-course": "manage-course", "paste-layout": "manage-course",
      "build-course": "manage-course", units: "course", unit: "units", "admin-lock": "settings", admin: "settings",
      "toc-settings": "root", "ksb-progress": "root", "otj-progress": "course", "epa-practice": "course",
      "epa-session": "epa-practice", "evidence-options": evidenceBack, evidence: "evidence-options", "evidence-list": "portfolio",
      "portfolio-download": "portfolio", "admin-rpl": "admin",
    };
    if (view === "placeholder") navigate(placeholder.back);
    else navigate(targets[view] ?? "root");
  };

  const returnToHome = () => {
    if (isOnboarding || exportRequest) return;
    setRemindersOpen(false);
    setEviaPlusOpen(false);
    setPanelLeaving(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setView("root");
      setOpen(false);
      setPanelLeaving(false);
      setSelectedUnitId("");
      setUnitSearch("");
    }, 160);
  };

  const handleBackgroundHome = (event: ReactMouseEvent<HTMLElement>) => {
    if (isOnboarding || exportRequest || eviaPlusOpen || (!open && view === "root")) return;
    const target = event.target as HTMLElement;
    if (!target.classList.contains("evia-app")
      && !target.classList.contains("ambient")
      && !target.classList.contains("menu-stage")
      && !target.classList.contains("menu-shell")
      && !target.classList.contains("view-panel")
      && !target.classList.contains("view-content")
      && !target.classList.contains("detail-header")) return;
    returnToHome();
  };

  const openReminder = (message: string) => {
    setRemindersOpen(false);
    if (message === "Add your course") {
      setOpen(true);
      openCourseManager("root");
      return;
    }
    if (message.startsWith("OTJ")) {
      openProgressView("otj-progress");
      return;
    }
    if (message.startsWith("EPA")) {
      openProgressView("epa-practice");
      return;
    }
    const code = message.match(/^[KSB]\d+(?:\.\d+)?[A-Za-z]?/i)?.[0]?.toUpperCase();
    const ksb = code ? courseKsbs.find((item) => item.code.toUpperCase() === code) : undefined;
    if (ksb) {
      setOpen(true);
      openEvidenceOptions(ksb);
    }
  };

  const openEviaGuide = () => {
    setRemindersOpen(false);
    setEviaGuideStep(0);
    setGuidedWritingAnswers([]);
    setGuidedWritingDraft("");
    setGuidedWritingError("");
    setEviaPlusOpen(true);
  };

  const toggleEvia = () => {
    if (open) {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      setPanelLeaving(false);
      setView("root");
      setSelectedUnitId("");
      setUnitSearch("");
    }
    setOpen((current) => !current);
  };

  const submitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedName = fullName.trim().replace(/\s+/g, " ");
    if (!cleanedName) return;
    setFullName(cleanedName);
    try { window.localStorage.setItem("evia-full-name", cleanedName); } catch { /* Continue without storage. */ }
    setOnboardingStep(1);
  };

  const completeOnboarding = () => {
    try { window.localStorage.setItem("evia-onboarding-complete", "true"); } catch { /* Continue without storage. */ }
    setOnboardingStep(null);
  };

  const saveCourse = (nextCourse: LearnerCourse, message: string) => {
    setCourse(nextCourse);
    setCourseError("");
    try { window.localStorage.setItem("evia-course", JSON.stringify(nextCourse)); } catch { /* Keep session data. */ }
    showNotice(message);
    setSelectedUnitId("");
    setUnitSearch("");
    navigate("units");
  };

  const makeCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = buildCourse(ksbsText);
    if (!result.course) {
      setCourseError(result.error);
      return;
    }
    saveCourse(result.course, `Your course is ready. Evia created ${result.course.units.length} balanced Units.`);
  };

  const makeLayoutCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = buildCourseFromLayout(layoutText);
    if (!result.course) {
      setCourseError(result.error);
      return;
    }
    saveCourse(result.course, `Your tutor’s layout is ready with ${result.course.units.length} Units.`);
  };

  const selectCourseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPendingFileCourse(null);
    setCourseError("");
    if (!file) {
      setCourseFileName("");
      return;
    }
    setCourseFileName(file.name);
    if (file.size > 2_000_000) {
      setCourseError("That course file is too large. Choose a file smaller than 2 MB.");
      return;
    }
    let fileContents = "";
    try {
      fileContents = await file.text();
    } catch {
      setCourseError("Evia couldn’t read that file. Try choosing it again or use Paste Course Layout.");
      return;
    }
    const result = buildCourseFromFile(fileContents);
    if (!result.course) {
      setCourseError(result.error);
      return;
    }
    setPendingFileCourse(result.course);
  };

  const importCourseFile = () => {
    if (!pendingFileCourse) return;
    saveCourse(pendingFileCourse, `Course imported with ${pendingFileCourse.units.length} tutor-made Units.`);
  };

  const unlockAdmin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminCode === "1984") {
      setAdminError("");
      setAdminCode("");
      navigate("admin");
    } else {
      setAdminError("That code isn’t correct.");
    }
  };

  const viewTitles: Record<View, string> = {
    root: "", course: "My Course", study: "Self Study", portfolio: "My Portfolio", settings: "Settings",
    "install-app": "Install Evia",
    "toc-settings": "Time On Course", "ksb-progress": "KSB Progress", "otj-progress": "Off The Job",
    "epa-practice": "EPA Practice", "epa-session": "EPA Mock", "evidence-options": "Evidence Options", evidence: "Add Evidence", "evidence-list": "My Evidence",
    "portfolio-download": "Download Portfolio", profile: "My Profile", "profile-details": "Edit My Details", accessibility: "Accessibility",
    "study-library": "Teaching Packs", "study-module": selectedStudyModule?.title ?? "Teaching Pack",
    "manage-course": "Manage My Course", "import-course": "Import Course File",
    "paste-layout": "Paste Course Layout", "build-course": "Let Evia Build It", units: "Units",
    unit: "Course Unit", "admin-lock": "Admin Settings",
    admin: "Admin Settings", "admin-rpl": "Recognised Prior Learning", placeholder: placeholder.title,
  };

  const workspaceViews: View[] = [
    "manage-course", "import-course", "paste-layout", "build-course", "units", "unit", "toc-settings",
    "ksb-progress", "otj-progress", "epa-practice", "epa-session", "evidence-options", "evidence", "evidence-list",
    "portfolio-download", "profile-details", "accessibility", "study-library", "study-module", "admin-rpl",
  ];
  const tallViews: View[] = ["root", "course", "study", "portfolio", "settings", "install-app", "profile", "admin"];
  const shellClasses = `menu-shell${workspaceViews.includes(view) ? " is-workspace" : ""}${tallViews.includes(view) ? " is-tall" : ""}`;

  const writingGuidePrompts: EviaGuideStep[] | null = view === "evidence" && activeEvidenceKsb
    ? activeEvidenceMethod === "written"
      ? [
          { title: "What do you understand?", body: `Use your own words for ${activeEvidenceKsb.code}. Do not worry about spelling yet.`, prompt: "Explain what you know", placeholder: "I understand…" },
          { title: "How does it apply?", body: "Explain where or when this knowledge is used in your work.", prompt: "How it applies in your work", placeholder: "In my work, this applies when…" },
          { title: "Give a real example", body: "Describe something you have seen, discussed or carried out that relates to this knowledge.", prompt: "Your example", placeholder: "For example…" },
          { title: "Why does it matter?", body: "Finish with the reason this knowledge is important to the work, people or finished result.", prompt: "Why it matters", placeholder: "This matters because…" },
        ]
      : activeEvidenceMethod === "reflection"
        ? [
            { title: "Describe the situation", body: `Use a real situation that demonstrates ${activeEvidenceKsb.code}.`, prompt: "What was happening?", placeholder: "The situation was…" },
            { title: "Explain your action", body: "Say what you personally did and the choice you made.", prompt: "What did you do?", placeholder: "I decided to…" },
            { title: "Record the result", body: "Explain what happened because of your actions.", prompt: "What was the result?", placeholder: "As a result…" },
            { title: "Reflect on the learning", body: "Say what you learned and what you would repeat or improve next time.", prompt: "What did you learn?", placeholder: "I learned that…" },
          ]
        : activeEvidenceMethod === "witness"
          ? [
              { title: "Set the scene", body: "The witness should use their own words and identify the task they personally observed.", prompt: "Task observed", placeholder: "I personally observed the learner…" },
              { title: "Describe the learner’s actions", body: "Record exactly what the learner did. Avoid assumptions or second-hand information.", prompt: "Actions observed", placeholder: "The learner…" },
              { title: "Describe the standard", body: "Explain the quality, consistency or safe standard that was achieved.", prompt: "Standard achieved", placeholder: "The work demonstrated…" },
              { title: "Link the Behaviour", body: `Explain how the observation demonstrated ${activeEvidenceKsb.code}.`, prompt: "How the Behaviour was shown", placeholder: "This showed the Behaviour because…" },
            ]
          : null
    : null;

  const guideByView: Partial<Record<View, EviaGuideStep[]>> = {
    root: [
      { title: "Choose your next area", body: "Open My Course for Units, OTJ and EPA; Self Study for teaching packs; or My Portfolio for evidence health and downloads." },
      { title: "Follow the next action", body: "The reminder icon shows the shortest useful action based on your current course progress." },
      { title: "Watch the four arches", body: "TOC is your pace. KSB, OTJ and EPA show the progress you are building against it." },
    ],
    course: [
      { title: "Start with a Unit", body: "Open Units and choose the activity with the fewest yellow dots." },
      { title: "Keep OTJ current", body: "Record learning away from normal productive work and link it to the most relevant Unit." },
      { title: "Practise for EPA", body: "Use practical, interview and MCQ practice regularly rather than leaving it until the end." },
    ],
    units: [
      { title: "Read the dots", body: "Each grey dot is one KSB still needing evidence. A yellow dot is complete." },
      { title: "Choose one Unit", body: "Start with a Unit that already has some yellow dots, or select the activity you are doing next at work or college." },
      { title: "Complete one KSB at a time", body: "Open the Unit, choose a grey K, S or B, then follow one of its approved evidence routes." },
    ],
    unit: [
      { title: selectedUnit?.title ?? "Complete this Unit", body: "The K, S and B dots show exactly which criteria are complete. Grey dots still need evidence." },
      { title: "Choose a grey KSB", body: "Tap its full description. I will show only the evidence routes allowed for that Knowledge, Skill or Behaviour." },
      { title: "Finish one approved route", body: "You only need one complete route for each KSB. When every dot is yellow, the whole Unit tile turns light yellow." },
    ],
    "evidence-options": [
      { title: `Choose evidence for ${activeEvidenceKsb?.code ?? "this KSB"}`, body: "Pick the route that gives the clearest, most authentic evidence of the full criterion." },
      { title: "Use one complete route", body: "You do not need to complete both options. Finish the route that best represents the learner’s work." },
      { title: "Check before saving", body: "Make sure the evidence is clear, specific, relevant and safe to include in the portfolio." },
    ],
    "toc-settings": [
      { title: "Add the course dates", body: "Enter the official apprenticeship start date and planned end date." },
      { title: "Add normal weekly hours", body: "Use the learner’s contracted working hours, including normal paid training time." },
      { title: "Save the timeline", body: "I will calculate TOC and use it as the target position for KSB, OTJ and EPA progress." },
    ],
    "ksb-progress": [
      { title: "Find an uncovered KSB", body: "The incomplete criteria appear first. Choose one that matches the learner’s next activity." },
      { title: "Read the full criterion", body: "Check every part of the wording before deciding what evidence will meet it." },
      { title: "Add one approved route", body: "A KSB counts once a complete evidence route is saved or verified as RPL." },
    ],
    "otj-progress": [
      { title: "Choose the related Unit", body: "Link the learning to the Unit it supports so the OTJ pack is organised correctly." },
      { title: "Record the learning", body: "Add the activity date, time spent and a concise explanation of what was learned." },
      { title: "Check the Unit allocation", body: "Compare recorded hours with the equal target shown for each Unit, then save and sign the pack when required." },
    ],
    "epa-practice": [
      { title: "Choose an EPA method", body: "Use practical, interview or MCQ practice depending on the area you need to strengthen." },
      { title: "Complete every step", body: "Treat the mock like the real assessment and answer without reading a model response first." },
      { title: "Review the result", body: "Repeat weaker areas until you can explain or demonstrate them confidently and consistently." },
    ],
    "epa-session": [
      { title: "Work through one prompt", body: "Read the current task carefully and respond as though this were the real EPA." },
      { title: "Use specific examples", body: "Explain what you would do, why you would do it and how you would check the outcome." },
      { title: "Complete the mock", body: "Finish every step before returning to the EPA overview so the arch can update." },
    ],
    study: [
      { title: "Choose a subject", body: "Use Maths & English, Trade Subjects or EDI depending on the learning you need today." },
      { title: "Open one teaching pack", body: "Read the short lesson in order rather than jumping straight to the questions." },
      { title: "Complete the knowledge check", body: "Use the explanations to correct mistakes, then retry until the pack is complete." },
    ],
    "study-library": [
      { title: "Choose one teaching pack", body: "Start with an unfinished pack that supports your current work or upcoming assessment." },
      { title: "Read before answering", body: "Work through the lesson first so the MCQ checks learning rather than guessing." },
      { title: "Return to weaker topics", body: "A pack is complete when every question is correct. Review explanations before retrying." },
    ],
    "study-module": [
      { title: "Read one section at a time", body: "Pause after each short section and connect it to something you have seen or done." },
      { title: "Answer every MCQ", body: "Choose the best answer without guessing. I will explain the reasoning immediately." },
      { title: "Correct any mistakes", body: "Review the explanation and try again until every answer is correct." },
    ],
    portfolio: [
      { title: "Check Portfolio Health", body: "Use it to find KSBs with no complete evidence route." },
      { title: "Review saved evidence", body: "Open My Evidence to confirm the method, date and completion status of each record." },
      { title: "Download a signed pack", body: "Use Download Portfolio when the learner is ready to sign and create professional mapped evidence packs." },
    ],
    "portfolio-download": [
      { title: "Choose the download scope", body: "Download one Unit for a focused pack or all Units for the complete portfolio." },
      { title: "Review the evidence", body: "Check the KSB mappings and attached media before signing the declaration." },
      { title: "Sign and save", body: "The learner’s handwritten signature and exact date and time are added to the PDF." },
    ],
    "evidence-list": [
      { title: "Check incomplete records first", body: "A partial record needs the remaining media, words or signature before it covers the KSB." },
      { title: "Confirm the KSB", body: "Make sure every saved item is attached to the correct Knowledge, Skill or Behaviour." },
      { title: "Return to the Unit", body: "Open the relevant Unit to add, replace or complete its evidence route." },
    ],
    settings: [
      { title: "Keep your profile accurate", body: "Your name, employer, working hours and course dates appear throughout progress and evidence packs." },
      { title: "Adjust accessibility", body: "Choose larger text, high contrast, reading focus, reduced motion or read aloud support." },
      { title: "Use Admin only when authorised", body: "RPL and course controls affect completion records and should only be changed by authorised staff." },
    ],
    profile: [
      { title: "Manage the course", body: "Import a tutor file, paste an existing course structure or let Evia organise a complete KSB list." },
      { title: "Check learner details", body: "Keep the learner name, employer, working hours and dates current." },
    ],
    "profile-details": [
      { title: "Enter the learner details", body: "Use the name and employer that should appear on formal evidence packs." },
      { title: "Check working hours", body: "These determine the learner’s weekly and total OTJ target." },
      { title: "Save the dates", body: "The start and end dates determine TOC and all paced target markers." },
    ],
    "manage-course": [
      { title: "Choose the correct method", body: "Import a finished Evia file, paste a tutor-made layout, or give Evia an unorganised KSB list." },
      { title: "Keep official wording", body: "Use the complete published KSB descriptions without shortening or rewriting them." },
      { title: "Review before evidence starts", body: "Check Unit titles and mappings before learners begin adding evidence." },
    ],
    "import-course": [
      { title: "Choose the tutor file", body: "Select the approved .evia or .json course file supplied by the tutor." },
      { title: "Check the recognised totals", body: "Confirm the Unit, Knowledge, Skill and Behaviour counts look correct." },
      { title: "Import the course", body: "The tutor’s titles, order and mappings will be preserved exactly." },
    ],
    "paste-layout": [
      { title: "Add the Unit title", body: "Start each Unit with its intended activity-based title on a separate line." },
      { title: "Paste full KSB wording", body: "Place the K, S and B codes with their complete descriptions underneath the correct title." },
      { title: "Separate the next Unit", body: "Leave a blank line, add the next title and continue until the whole course is included." },
    ],
    "build-course": [
      { title: "Paste the complete KSB list", body: "Include every official K, S and B code with its full description." },
      { title: "Let Evia organise it", body: "Evia pairs the strongest related Skills, maps matching Knowledge and adds relevant Behaviours." },
      { title: "Review the activity titles", body: "Check that each Unit title clearly describes the Skills inside it before evidence begins." },
    ],
    accessibility: [
      { title: "Choose a comfortable text size", body: "Use Standard, Large or Extra Large and check it on a detailed KSB page." },
      { title: "Add visual support", body: "High contrast and reading focus reduce distraction and make content easier to follow." },
      { title: "Use read aloud", body: "Enable read aloud, then double-tap readable content anywhere in Evia." },
    ],
    "admin-lock": [{ title: "Authorised access only", body: "Enter the four-digit admin code to open settings that change formal course records." }],
    admin: [{ title: "Choose one controlled setting", body: "Use RPL only for verified prior learning and review any course or data changes carefully." }],
    "admin-rpl": [
      { title: "Find the verified KSB", body: "Search by code or wording and check the full criterion before changing its status." },
      { title: "Confirm the prior learning", body: "Only use RPL when suitable evidence has been reviewed by an authorised person." },
      { title: "Mark or remove RPL", body: "Tap once to mark the KSB and again to remove it. The portfolio records the status clearly." },
    ],
    "install-app": [{ title: "Install Evia", body: "Use the install button when available, or choose Install app or Add to Home Screen from your browser menu." }],
  };

  const evidenceGuideSteps: EviaGuideStep[] = activeEvidenceMethod === "photo"
    ? [
        { title: "Read the full Skill", body: `Make sure every photo relates directly to ${activeEvidenceKsb?.code ?? "the selected Skill"}.` },
        { title: "Photo one — preparation", body: "Capture the work area, setting out, materials or safe preparation clearly." },
        { title: "Photo two — activity", body: "Capture the learner carrying out the Skill so their own practical work is visible." },
        { title: "Photo three — completed standard", body: "Capture the finished result clearly enough for someone to judge its standard." },
      ]
    : activeEvidenceMethod === "video"
      ? [
          { title: "Plan one continuous video", body: `The recording must show the learner completing ${activeEvidenceKsb?.code ?? "the selected Skill"}, not only the finished work.` },
          { title: "Show the process", body: "Include preparation, safe technique, key practical stages and checks without unnecessary footage." },
          { title: "Show the result", body: "Finish by showing the completed work clearly and explaining any checks made." },
        ]
      : activeEvidenceMethod === "audio"
        ? [
            { title: "Plan the explanation", body: `Explain ${activeEvidenceKsb?.code ?? "the selected Knowledge"} in your own words.` },
            { title: "Use a real example", body: "Say where the knowledge applies and describe something you have seen or done." },
            { title: "Explain why it matters", body: "Finish with the impact on the work, people or finished result, then record in a quiet place." },
          ]
        : [];

  const eviaGuideSteps = writingGuidePrompts ?? (view === "evidence" ? evidenceGuideSteps : guideByView[view]) ?? [
    { title: viewTitles[view] || "Evia support", body: "Complete the visible section in order. Read each instruction, add only accurate information and check it before saving." },
  ];
  const activeGuideStep = eviaGuideSteps[Math.min(eviaGuideStep, Math.max(0, eviaGuideSteps.length - 1))];
  const isWritingGuide = Boolean(writingGuidePrompts);

  const closeEviaGuide = () => {
    setEviaPlusOpen(false);
    setGuidedWritingError("");
  };

  const moveGuideBack = () => {
    if (eviaGuideStep <= 0) return;
    const previous = eviaGuideStep - 1;
    setEviaGuideStep(previous);
    setGuidedWritingDraft(guidedWritingAnswers[previous] ?? "");
    setGuidedWritingError("");
  };

  const moveGuideForward = () => {
    let answers = guidedWritingAnswers;
    if (activeGuideStep?.prompt) {
      if (!guidedWritingDraft.trim()) {
        setGuidedWritingError("Add your own words before moving to the next step.");
        return;
      }
      answers = [...guidedWritingAnswers];
      answers[eviaGuideStep] = correctLearnerText(guidedWritingDraft);
      setGuidedWritingAnswers(answers);
    }

    if (eviaGuideStep < eviaGuideSteps.length - 1) {
      const next = eviaGuideStep + 1;
      setEviaGuideStep(next);
      setGuidedWritingDraft(answers[next] ?? "");
      setGuidedWritingError("");
      return;
    }

    if (isWritingGuide) {
      const compiled = answers.filter(Boolean).join("\n\n");
      if (activeEvidenceMethod === "witness") setWitnessDraft((current) => ({ ...current, testimony: compiled }));
      else setEvidenceText(compiled);
      setEvidenceError("");
      showNotice(activeEvidenceMethod === "witness" ? "Witness account compiled from their answers." : "Your statement has been compiled from your answers.");
    }
    closeEviaGuide();
  };

  const renderUnitCompletionDots = (unit: CourseUnit) => {
    const groups: Array<{ type: KsbType; label: string }> = [
      { type: "Knowledge", label: "K" }, { type: "Skill", label: "S" }, { type: "Behaviour", label: "B" },
    ];
    return (
      <span className="unit-completion-dots">
        {groups.map(({ type, label }) => {
          const items = [...new Map(unit.ksbs.filter((ksb) => ksb.type === type).map((ksb) => [ksb.code, ksb])).values()];
          const complete = items.filter((ksb) => completedKsbCodes.has(ksb.code)).length;
          return (
            <span className="unit-dot-group" key={type} aria-label={`${type}: ${complete} of ${items.length} complete`}>
              <b>{label}:</b>
              <span>{items.map((ksb) => <i className={completedKsbCodes.has(ksb.code) ? "is-complete" : ""} key={ksb.code} />)}</span>
            </span>
          );
        })}
      </span>
    );
  };

  const renderKsbGroup = (type: KsbType, title: string) => {
    const items = [...(selectedUnit?.ksbs.filter((ksb) => ksb.type === type) ?? [])]
      .sort((left, right) => left.code.localeCompare(right.code, undefined, { numeric: true }));
    return (
      <section className="ksb-group" aria-labelledby={`${type.toLowerCase()}-heading`}>
        <div className="ksb-group-heading">
          <h3 id={`${type.toLowerCase()}-heading`}>{title}</h3><span>{items.length}</span>
        </div>
        {items.length ? items.map((ksb) => {
          const savedRecords = evidenceRecords.filter((record) => record.ksbCode === ksb.code);
          const isRpl = rplCodes.includes(ksb.code);
          const isComplete = isRpl || savedRecords.some(evidenceRecordComplete);
          return (
            <article className={`ksb-item${isComplete ? " is-complete" : ""}`} key={`${selectedUnit?.id}-${ksb.code}`}>
              <button type="button" className="ksb-description-button" onClick={() => openEvidenceOptions(ksb)} aria-label={`Open evidence options for ${ksb.code}`}>
                <span className="ksb-code">{ksb.code}</span>
                <span className="ksb-description-copy"><strong>{ksb.description}</strong><small>{isRpl ? "Recognised prior learning" : isComplete ? "Evidence route complete" : "Tap to add evidence"}</small></span>
                <span className="status-dot" aria-hidden="true">{isComplete ? "✓" : "›"}</span>
              </button>
            </article>
          );
        }) : <p className="empty-group">No {title.toLowerCase()} are mapped to this Unit yet.</p>}
      </section>
    );
  };

  const renderViewContent = () => {
    if (view === "root") return (
      <div className="root-list">
        <OptionRow title="My Course" onClick={() => navigate("course")} />
        <OptionRow title="Self Study" onClick={() => navigate("study")} />
        <OptionRow title="My Portfolio" onClick={() => navigate("portfolio")} />
        <OptionRow title="Settings" onClick={() => navigate("settings")} />
      </div>
    );

    if (view === "course") return (
      <div className="option-list is-fill">
        <OptionRow title="Units" note={course ? `${course.units.length} ready` : "Course not added"} onClick={() => navigate("units")} />
        <OptionRow title="Off The Job" note={`${loggedOtjHours.toFixed(1)} hours recorded`} onClick={() => navigate("otj-progress")} />
        <OptionRow title="EPA Practice" note={`${completedEpaAreas.length} of 3 mocks complete`} onClick={() => navigate("epa-practice")} />
      </div>
    );

    if (view === "study") return (
      <div className="option-list is-fill">
        <OptionRow title="Maths & English" note="Level 1 and Level 2" onClick={() => { setSelectedStudyCategory("maths-english"); navigate("study-library"); }} />
        <OptionRow title="Trade Subjects" note="Construction essentials" onClick={() => { setSelectedStudyCategory("trade"); navigate("study-library"); }} />
        <OptionRow title="EDI Subjects" note="Safe, fair workplaces" onClick={() => { setSelectedStudyCategory("edi"); navigate("study-library"); }} />
      </div>
    );

    if (view === "study-library") {
      const labels: Record<StudyCategory, { title: string; copy: string }> = {
        "maths-english": { title: "Maths & English", copy: "Original Level 1 and Level 2 lessons based on the Functional Skills subject content, followed by marked knowledge checks." },
        trade: { title: "Trade essentials", copy: "Plain-English construction learning on safety, legislation, handling and technical information." },
        edi: { title: "EDI & safeguarding", copy: "Practical learning for fair, safe and respectful workplaces." },
      };
      const category = labels[selectedStudyCategory];
      const modules = studyModules.filter((module) => module.category === selectedStudyCategory);
      return (
        <div className="study-workspace">
          <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>I’ll guide you through each pack.</strong><p>{category.copy} Read each short lesson, then complete the MCQs and review my explanations.</p></div></div>
          <header className="study-heading"><span>Self study</span><h3>{category.title}</h3><p>{modules.length} guided teaching packs</p></header>
          <div className="study-card-list">
            {modules.map((module) => {
              const answers = studyAnswers[module.id] ?? [];
              const correct = module.questions.filter((question, index) => answers[index] === question.answer).length;
              const complete = answers.length >= module.questions.length && correct === module.questions.length;
              return <button type="button" className={`study-card${complete ? " is-complete" : ""}`} key={module.id} onClick={() => { setSelectedStudyModuleId(module.id); navigate("study-module"); }}><span className="study-card-level">{complete ? "✓" : module.level}</span><span><strong>{module.title}</strong><small>{module.summary}</small><em>{answers.filter((answer) => answer !== undefined).length ? `${correct} of ${module.questions.length} correct` : "Not started"}</em></span><span className="row-chevron" aria-hidden="true">›</span></button>;
            })}
          </div>
        </div>
      );
    }

    if (view === "study-module" && selectedStudyModule) {
      const answers = studyAnswers[selectedStudyModule.id] ?? [];
      const correct = selectedStudyModule.questions.filter((question, index) => answers[index] === question.answer).length;
      const answered = selectedStudyModule.questions.filter((_, index) => answers[index] !== undefined).length;
      return (
        <div className="study-workspace">
          <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Take this at your pace.</strong><p>Read the lesson in order. At the end I’ll mark each answer immediately and explain the reasoning, so a mistake becomes part of the learning.</p></div></div>
          <header className="practice-header"><span>{selectedStudyModule.level}</span><h3>{selectedStudyModule.title}</h3><p>{selectedStudyModule.summary}</p></header>
          <div className="lesson-sections">{selectedStudyModule.sections.map((section, index) => <article className="lesson-card" key={section.title}><span>{index + 1}</span><div><h4>{section.title}</h4><p>{section.body}</p></div></article>)}</div>
          <div className="section-heading"><span>Knowledge check</span><small>{correct} of {selectedStudyModule.questions.length} correct</small></div>
          <div className="quiz-list">{selectedStudyModule.questions.map((question, questionIndex) => {
            const selected = answers[questionIndex];
            return <article className="quiz-card" key={question.prompt}><h4>{questionIndex + 1}. {question.prompt}</h4><div className="quiz-options">{question.options.map((option, optionIndex) => <button type="button" className={`${selected === optionIndex ? "is-selected" : ""}${selected !== undefined && optionIndex === question.answer ? " is-correct" : ""}${selected === optionIndex && selected !== question.answer ? " is-wrong" : ""}`} key={option} onClick={() => answerStudyQuestion(selectedStudyModule.id, questionIndex, optionIndex)}>{option}</button>)}</div>{selected !== undefined && <p className={selected === question.answer ? "quiz-feedback is-correct" : "quiz-feedback"}><strong>{selected === question.answer ? "Correct." : "Not quite."}</strong> {question.explanation}</p>}</article>;
          })}</div>
          <div className={`quiz-result${answered === selectedStudyModule.questions.length && correct === selectedStudyModule.questions.length ? " is-complete" : ""}`}><span>{answered === selectedStudyModule.questions.length && correct === selectedStudyModule.questions.length ? "✓" : correct}</span><div><strong>{answered < selectedStudyModule.questions.length ? `${selectedStudyModule.questions.length - answered} question${selectedStudyModule.questions.length - answered === 1 ? "" : "s"} left` : correct === selectedStudyModule.questions.length ? "Teaching pack complete" : "Review the explanations and retry"}</strong><small>Your answers are saved on this device.</small></div></div>
        </div>
      );
    }

    if (view === "portfolio") return (
      <div className="option-list is-fill">
        <OptionRow title="Portfolio Health" note={`${completedKsbCodes.size} of ${courseKsbs.length} KSBs evidenced`} onClick={() => navigate("ksb-progress")} />
        <OptionRow title="My Evidence" note={`${evidenceRecords.length} record${evidenceRecords.length === 1 ? "" : "s"}`} onClick={() => navigate("evidence-list")} />
        <OptionRow title="Download Portfolio" note="PDF evidence packs and attached media" onClick={() => navigate("portfolio-download")} />
      </div>
    );

    if (view === "portfolio-download") {
      if (!course) return <div className="empty-course-state"><span className="empty-course-mark" aria-hidden="true">+</span><h3>Add your course first</h3><p>Evia builds evidence packs from the Units, KSB mappings and evidence saved on this device.</p><button type="button" onClick={() => openCourseManager("portfolio-download")}>Add course <span aria-hidden="true">→</span></button></div>;
      return (
        <div className="progress-workspace">
          <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Your evidence pack is mapped for you.</strong><p>Each download contains a professional Unit PDF with the full KSB wording, evidence status and mapping, plus every attached photo, video or audio file.</p></div></div>
          <div className="progress-summary-grid"><div className="progress-summary-main"><span>Portfolio coverage</span><strong>{ksbProgress}%</strong><small>{completedKsbCodes.size} of {courseKsbs.length} KSBs complete or RPL</small></div><div className="progress-summary-stat"><span>Evidence packs</span><strong>{course.units.length}</strong><small>One per Unit</small></div></div>
          <button className="make-course-button" type="button" disabled={Boolean(exporting)} onClick={() => requestSignedExport({ kind: "portfolio" })}>{exporting === "all" ? "Building portfolio…" : "Sign & download all evidence packs"}<span aria-hidden="true">↓</span></button>
          <div className="download-unit-list">{course.units.map((unit) => {
            const codes = new Set(unit.ksbs.map((ksb) => ksb.code));
            const covered = [...codes].filter((code) => completedKsbCodes.has(code)).length;
            return <button type="button" key={unit.id} disabled={Boolean(exporting)} onClick={() => requestSignedExport({ kind: "unit", unitId: unit.id })}><span><strong>{unit.title}</strong><small>{covered} of {codes.size} KSBs complete · signed PDF + attached media</small></span><em>{exporting === unit.id ? "Building…" : "Sign & download"}</em></button>;
          })}</div>
        </div>
      );
    }

    if (view === "settings") return (
      <div className="option-list is-fill four-options">
        <OptionRow title="Install Evia" note={isInstalled ? "Installed on this device" : "Add Evia to this device"} onClick={() => navigate("install-app")} />
        <OptionRow title="My Profile" onClick={() => navigate("profile")} />
        <OptionRow title="General Settings" onClick={() => openPlaceholder("General Settings", "settings")} />
        <OptionRow title="Accessibility" note={accessibility.readAloud ? "Read aloud enabled" : "Reading and display support"} onClick={() => navigate("accessibility")} />
        <OptionRow title="Admin Settings" note="Locked" onClick={() => navigate("admin-lock")} />
      </div>
    );

    if (view === "install-app") return (
      <div className="install-app-panel">
        <span className="install-app-icon" style={{ backgroundImage: 'url("./icon-192.png")' }} aria-hidden="true" />
        <div className="install-app-copy">
          <h3>{isInstalled ? "Evia is installed" : "Keep Evia on your phone"}</h3>
          <p>Open Evia full screen from your home screen, with your course saved on this device.</p>
        </div>
        <button className="install-app-button" type="button" onClick={installEvia} disabled={isInstalled}>
          {isInstalled ? "Installed" : installPrompt ? "Install Evia" : "Add to Home Screen"}
          {!isInstalled && <span aria-hidden="true">→</span>}
        </button>
        <p className="install-app-help"><strong>Android:</strong> use Chrome’s menu and tap Install app. <strong>iPhone:</strong> use Safari’s Share menu and tap Add to Home Screen.</p>
      </div>
    );

    if (view === "toc-settings") return (
      <form className="progress-workspace" onSubmit={saveTimeline}>
        <div className="evia-guidance">
          <span className="guidance-mark" aria-hidden="true">E</span>
          <div><strong>Let’s set your timeline.</strong><p>I calculate TOC from your start date to your planned end date, using today as the point you have reached.</p></div>
        </div>
        <div className="progress-summary-grid">
          <div className="progress-summary-main"><span>Time on course</span><strong>{tocProgress}%</strong><small>{validTimeline ? `${Math.round(courseElapsedDays)} of ${Math.round(totalCourseDays)} days elapsed` : "Add your course dates"}</small></div>
          <div className="progress-summary-stat"><span>OTJ each week</span><strong>{weeklyOtjTarget.toFixed(1)}h</strong><small>20% of working hours</small></div>
        </div>
        <div className="field-grid">
          <label className="clean-field is-required"><span>Course start date</span><input required type="date" min="2000-01-01" max="2100-12-31" value={timeline.startDate} onChange={(event) => { setTimeline({ ...timeline, startDate: event.target.value }); setTimelineError(""); }} /></label>
          <label className="clean-field is-required"><span>Planned end date</span><input required type="date" min="2000-01-01" max="2100-12-31" value={timeline.endDate} onChange={(event) => { setTimeline({ ...timeline, endDate: event.target.value }); setTimelineError(""); }} /></label>
          <label className="clean-field is-wide is-required"><span>Normal working hours each week</span><input required type="number" min="1" max="100" step="0.5" inputMode="decimal" value={timeline.weeklyHours} onChange={(event) => { setTimeline({ ...timeline, weeklyHours: Number(event.target.value) }); setTimelineError(""); }} /></label>
        </div>
        <p className="calculation-note">TOC = elapsed course days ÷ total planned course days. Dates stay on this device and can be changed whenever your plan changes.</p>
        {timelineError && <p className="form-error" role="alert">{timelineError}</p>}
        <button className="make-course-button" type="submit">Save course timeline<span aria-hidden="true">→</span></button>
      </form>
    );

    if (view === "ksb-progress") {
      if (!course) return (
        <div className="empty-course-state">
          <span className="empty-course-mark" aria-hidden="true">+</span><h3>Add your course first</h3>
          <p>Once your KSBs are added, Evia will calculate progress from the number with valid evidence against them.</p>
          <button type="button" onClick={() => openCourseManager("ksb-progress")}>Add course <span aria-hidden="true">→</span></button>
        </div>
      );
      return (
        <div className="progress-workspace">
          <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>I count each KSB once.</strong><p>A KSB is complete when at least one of its approved evidence routes has been saved.</p></div></div>
          <div className="progress-summary-grid">
            <div className="progress-summary-main"><span>KSB evidence</span><strong>{ksbProgress}%</strong><small>{completedKsbCodes.size} of {courseKsbs.length} KSBs evidenced</small></div>
            <div className="progress-summary-stat"><span>Remaining</span><strong>{Math.max(0, courseKsbs.length - completedKsbCodes.size)}</strong><small>KSBs need evidence</small></div>
          </div>
          <div className="ksb-progress-list">
            {courseKsbs
              .sort((left, right) => Number(completedKsbCodes.has(left.code)) - Number(completedKsbCodes.has(right.code)) || left.code.localeCompare(right.code, undefined, { numeric: true }))
              .map((ksb) => {
                const complete = completedKsbCodes.has(ksb.code);
                const isRpl = rplCodes.includes(ksb.code);
                return (
                  <button type="button" className={`ksb-progress-row${complete ? " is-complete" : ""}`} key={ksb.code} onClick={() => openEvidenceOptions(ksb)}>
                    <span className="ksb-progress-code">{ksb.code}</span><span className="ksb-progress-copy"><strong>{ksb.description}</strong><small>{ksb.type} · {isRpl ? "Recognised prior learning" : complete ? "Evidence complete" : "No complete evidence — tap to add"}</small></span><span className="status-dot" aria-hidden="true">{complete ? "✓" : "›"}</span>
                  </button>
                );
              })}
          </div>
        </div>
      );
    }

    if (view === "otj-progress") return (
      <div className="progress-workspace">
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>I’ll keep your OTJ target clear.</strong><p>Your target is 20% of normal working hours, paced against the amount of your course that has elapsed.</p></div></div>
        <div className="progress-summary-grid">
          <div className="progress-summary-main"><span>OTJ progress</span><strong>{otjProgress}%</strong><small>{loggedOtjHours.toFixed(1)}h logged · {requiredOtjHours.toFixed(1)}h expected by today</small></div>
          <div className="progress-summary-stat"><span>Course target</span><strong>{validTimeline ? `${totalOtjHours.toFixed(1)}h` : "—"}</strong><small>{weeklyOtjTarget.toFixed(1)} hours per week</small></div>
        </div>
        {!validTimeline && <button type="button" className="inline-action" onClick={() => navigate("toc-settings")}>Set course dates to calculate your target <span aria-hidden="true">→</span></button>}
        {!course?.units.length && <button type="button" className="inline-action" onClick={() => openCourseManager("otj-progress")}>Add your course to allocate OTJ to Units <span aria-hidden="true">→</span></button>}
        <button type="button" className="make-course-button otj-download" disabled={!otjEntries.length || Boolean(exporting)} onClick={() => requestSignedExport({ kind: "otj" })}>{exporting === "otj" ? "Building OTJ pack…" : "Review, sign & download OTJ pack"}<span aria-hidden="true">↓</span></button>
        <form className="otj-form" onSubmit={addOtjEntry}>
          <div className="section-heading"><span>Record an activity</span><small>Learning completed away from normal productive duties</small></div>
          <div className="field-grid">
            <label className="clean-field is-wide is-required"><span>Related Unit</span><select required value={otjDraft.unitId} onChange={(event) => { setOtjDraft({ ...otjDraft, unitId: event.target.value }); setOtjError(""); }}><option value="">Choose a Unit</option>{course?.units.map((unit) => <option value={unit.id} key={unit.id}>{unit.title}</option>)}</select></label>
            <label className="clean-field is-required"><span>Date</span><input required type="date" value={otjDraft.date} onChange={(event) => { setOtjDraft({ ...otjDraft, date: event.target.value }); setOtjError(""); }} /></label>
            <label className="clean-field is-required"><span>Hours</span><input required type="number" min="0.1" max="24" step="0.1" inputMode="decimal" value={otjDraft.hours} onChange={(event) => { setOtjDraft({ ...otjDraft, hours: event.target.value }); setOtjError(""); }} placeholder="1.5" /></label>
            <label className="clean-field is-wide is-required"><span>What did you learn?</span><input required type="text" value={otjDraft.title} onChange={(event) => { setOtjDraft({ ...otjDraft, title: event.target.value }); setOtjError(""); }} placeholder="Example: cavity wall workshop" maxLength={120} /></label>
          </div>
          {otjError && <p className="form-error" role="alert">{otjError}</p>}
          <button className="make-course-button" type="submit">Add OTJ activity<span aria-hidden="true">→</span></button>
        </form>
        {course?.units.length ? <div className="unit-otj-list">
          <div className="section-heading"><span>OTJ by Unit</span><small>{validTimeline ? `${unitOtjTarget.toFixed(1)}h allocated to each Unit` : "Set course dates for targets"}</small></div>
          {course.units.map((unit) => {
            const logged = unitOtjHours(unit.id);
            const percentage = unitOtjTarget > 0 ? clampPercentage((logged / unitOtjTarget) * 100) : 0;
            return <article className={`unit-otj-card${percentage >= 100 ? " is-complete" : logged > 0 ? " has-hours" : ""}`} key={unit.id}><span><strong>{unit.title}</strong><small>{logged.toFixed(1)}h recorded · {unitOtjTarget.toFixed(1)}h allocation</small></span><em>{percentage}%</em><span className="unit-progress-track"><span style={{ width: `${percentage}%` }} /></span></article>;
          })}
        </div> : null}
        <div className="record-list">
          <div className="section-heading"><span>Recent OTJ</span><small>{otjEntries.length} recorded activit{otjEntries.length === 1 ? "y" : "ies"}</small></div>
          {[...otjEntries].sort((left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0) || right.date.localeCompare(left.date)).map((entry) => { const unit = course?.units.find((item) => item.id === entry.unitId); return <div className="record-row" key={entry.id}><div><strong>{entry.title}</strong><small>{unit?.title ?? "Unassigned legacy entry"} · Activity date {new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</small><small>Saved {new Date(entry.createdAt ?? new Date(`${entry.date}T12:00:00`).getTime()).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</small></div><span>{entry.hours.toFixed(1)}h</span></div>; })}
          {!otjEntries.length && <p className="empty-list-copy">No OTJ activities recorded yet.</p>}
        </div>
      </div>
    );

    if (view === "epa-practice") return (
      <div className="progress-workspace">
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Let’s make EPA feel familiar.</strong><p>Complete each mock step by step. Your EPA arch reflects the number of practice areas you have fully completed.</p></div></div>
        <div className="progress-summary-grid">
          <div className="progress-summary-main"><span>EPA readiness</span><strong>{epaProgress}%</strong><small>{completedEpaAreas.length} of 3 practice areas complete</small></div>
          <div className="progress-summary-stat"><span>Next step</span><strong>{completedEpaAreas.length === 3 ? "Ready" : `${3 - completedEpaAreas.length} left`}</strong><small>Practical · Interview · MCQ</small></div>
        </div>
        <div className="epa-card-list">
          {(Object.keys(epaPracticeAreas) as EpaArea[]).map((area) => {
            const practice = epaPracticeAreas[area];
            const completedSteps = epaChecks[area].filter(Boolean).length;
            const complete = completedSteps === practice.steps.length;
            return <button type="button" className={`epa-card${complete ? " is-complete" : ""}`} key={area} onClick={() => startEpa(area)}><span className="epa-card-number">{complete ? "✓" : completedSteps}</span><span><strong>{practice.title}</strong><small>{practice.summary}</small><em>{complete ? "Complete" : `${completedSteps} of ${practice.steps.length} steps`}</em></span><span className="row-chevron" aria-hidden="true">›</span></button>;
          })}
        </div>
      </div>
    );

    if (view === "epa-session") {
      const practice = epaPracticeAreas[activeEpaArea];
      const allStepsComplete = epaChecks[activeEpaArea].every(Boolean);
      return (
        <div className="progress-workspace">
          <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>I’ll take you through this one step at a time.</strong><p>{activeEpaArea === "mcq" ? "Choose an answer and I’ll explain the reasoning. All four must be correct to complete the mock." : "Complete the activity, then record a specific response of at least 12 words. Your work is saved as you go."}</p></div></div>
          <header className="practice-header"><span>EPA practice</span><h3>{practice.title}</h3><p>{practice.summary}</p></header>
          {activeEpaArea === "mcq" ? <div className="quiz-list">{epaMcqQuestions.map((question, index) => { const selected = epaAnswers[index]; return <article className="quiz-card" key={question.prompt}><h4>{index + 1}. {question.prompt}</h4><div className="quiz-options">{question.options.map((option, optionIndex) => <button type="button" className={`${selected === optionIndex ? "is-selected" : ""}${selected !== undefined && selected >= 0 && optionIndex === question.answer ? " is-correct" : ""}${selected === optionIndex && selected !== question.answer ? " is-wrong" : ""}`} key={option} onClick={() => answerEpaQuestion(index, optionIndex)}>{option}</button>)}</div>{selected !== undefined && selected >= 0 && <p className={selected === question.answer ? "quiz-feedback is-correct" : "quiz-feedback"}><strong>{selected === question.answer ? "Correct." : "Try again."}</strong> {question.explanation}</p>}</article>; })}</div> : <div className="epa-response-list">{practice.steps.map((step, index) => <label className={`epa-response${epaChecks[activeEpaArea][index] ? " is-complete" : ""}`} key={step}><span>{epaChecks[activeEpaArea][index] ? "✓" : index + 1}</span><div><strong>{step}</strong><small>{activeEpaArea === "practical" ? "Record what you planned or completed, the checks you made and the result." : "Write the answer you would give aloud. Include a specific example and why it mattered."}</small><textarea required rows={4} value={epaResponses[activeEpaArea][index] ?? ""} onChange={(event) => updateEpaResponse(activeEpaArea, index, event.target.value)} placeholder={activeEpaArea === "practical" ? "My approach was… I checked… The result was…" : "In this situation I… I chose this because… The result was…"} /><em>{countWords(epaResponses[activeEpaArea][index] ?? "")} / 12 words</em></div></label>)}</div>}
          <button className="make-course-button" type="button" disabled={!allStepsComplete} onClick={completeEpaSession}>{allStepsComplete ? "Complete this mock" : "Complete every step first"}<span aria-hidden="true">→</span></button>
        </div>
      );
    }

    if (view === "evidence-options" && activeEvidenceKsb) return (
      <div className="evidence-wizard">
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Choose one evidence route.</strong><p>I’ll explain every step and save it directly against {activeEvidenceKsb.code}. A Skill needs three specific photos or one clear video; Knowledge and Behaviours use the two routes shown below.</p></div></div>
        <header className="evidence-criterion"><span>{activeEvidenceKsb.code} · {activeEvidenceKsb.type}</span><h3>{activeEvidenceKsb.description}</h3></header>
        <div className="evidence-option-list">{evidenceOptions[activeEvidenceKsb.type].map((option) => {
          const record = evidenceRecords.find((item) => item.ksbCode === activeEvidenceKsb.code && item.method === option.method);
          const progress = evidenceRecordProgress(record);
          const complete = record ? evidenceRecordComplete(record) : false;
          return <button type="button" className={`evidence-option-pill${complete ? " is-complete" : ""}`} style={{ background: complete ? "rgba(221, 239, 216, .92)" : `linear-gradient(90deg, rgba(247, 210, 88, .32) ${progress}%, rgba(252, 250, 244, .9) ${progress}%)` }} key={option.method} onClick={() => startEvidence(activeEvidenceKsb, option.method)}><span><strong>{option.label}</strong><small>{option.rule}</small></span><em>{complete ? "Complete" : progress ? `${progress}%` : "Start"}</em><span className="row-chevron" aria-hidden="true">›</span></button>;
        })}</div>
        {rplCodes.includes(activeEvidenceKsb.code) && <div className="rpl-note"><span>RPL</span><p>This KSB has been marked as recognised prior learning. New evidence can still be added.</p></div>}
      </div>
    );

    if (view === "evidence" && activeEvidenceKsb) {
      const record = activeEvidenceRecord;
      const progress = evidenceRecordProgress(record);
      const photoPrompts = [
        ["Preparation", "Show the working area, materials, tools and controls before the task begins."],
        ["Work in progress", "Show yourself carrying out the activity, with the work and safe method visible."],
        ["Finished result", "Show the completed work, finish, quality checks and relevant measurements."],
      ];
      const mediaMethod = ["photo", "video", "audio"].includes(activeEvidenceMethod);
      return (
        <div className="evidence-wizard">
          <div className="evidence-progress-line"><span style={{ width: `${progress}%` }} /><small>{progress}% complete</small></div>
          <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>{evidenceMethodNames[activeEvidenceMethod]}</strong><p>{activeEvidenceMethod === "photo" ? "Take the photos at different stages. I save each one immediately, so you can leave and return later." : activeEvidenceMethod === "video" ? "Record one continuous practical sequence showing preparation, safe technique, the main stages and finished result." : activeEvidenceMethod === "audio" ? "Explain the full Knowledge statement in your own words, connect it to work and say why it matters." : activeEvidenceMethod === "written" ? "Write what you know, how it applies, a real example and why it matters." : activeEvidenceMethod === "reflection" ? "Describe the situation, your action, the result, what you learned and what you will improve." : "The witness must record what they personally saw, the standard achieved and how it demonstrates the Behaviour."}</p></div></div>
          <header className="evidence-criterion compact"><span>{activeEvidenceKsb.code} · Files use a concise title from this criterion</span><h3>{activeEvidenceKsb.description}</h3></header>

          {activeEvidenceMethod === "photo" && <div className="saved-media-list">{record?.fileNames.map((name, index) => <article className="saved-media" key={record.fileIds[index]}><span>{index + 1}</span><div><strong>{photoPrompts[index]?.[0] ?? `Photo ${index + 1}`}</strong><small>{name}</small></div><button type="button" className="delete-evidence" onClick={() => removeMediaEvidence(index)} aria-label={`Delete ${name}`}>×</button></article>)}{(record?.fileIds.length ?? 0) < 3 && <label className="capture-evidence"><input type="file" accept="image/*" capture="environment" onChange={saveMediaEvidence} disabled={savingEvidence} /><span>＋</span><div><strong>{savingEvidence ? "Saving…" : `Take photo ${(record?.fileIds.length ?? 0) + 1} of 3`}</strong><small>{photoPrompts[record?.fileIds.length ?? 0]?.[1]}</small></div></label>}</div>}
          {activeEvidenceMethod === "video" && <div className="saved-media-list">{record?.fileNames[0] && <article className="saved-media is-complete"><span>✓</span><div><strong>Practical video saved</strong><small>{record.fileNames[0]}</small></div><button type="button" className="delete-evidence" onClick={() => removeMediaEvidence(0)} aria-label={`Delete ${record.fileNames[0]}`}>×</button></article>}<label className="capture-evidence"><input type="file" accept="video/*" capture="environment" onChange={saveMediaEvidence} disabled={savingEvidence} /><span>{record?.fileIds.length ? "↻" : "＋"}</span><div><strong>{savingEvidence ? "Saving…" : record?.fileIds.length ? "Replace video" : "Record or choose video"}</strong><small>Keep the task and your actions visible. You can replace the saved video if needed.</small></div></label></div>}
          {activeEvidenceMethod === "audio" && <div className="saved-media-list">{record?.fileNames[0] && <article className="saved-media is-complete"><span>✓</span><div><strong>Audio explanation saved</strong><small>{record.fileNames[0]}</small></div><button type="button" className="delete-evidence" onClick={() => removeMediaEvidence(0)} aria-label={`Delete ${record.fileNames[0]}`}>×</button></article>}<label className="capture-evidence"><input type="file" accept="audio/*" capture="user" onChange={saveMediaEvidence} disabled={savingEvidence} /><span>{record?.fileIds.length ? "↻" : "＋"}</span><div><strong>{savingEvidence ? "Saving…" : record?.fileIds.length ? "Replace audio" : "Record or choose audio"}</strong><small>State the KSB, explain the principles, give an example and say why the knowledge matters.</small></div></label></div>}
          {["written", "reflection"].includes(activeEvidenceMethod) && <label className="guided-textarea is-required"><span>{activeEvidenceMethod === "written" ? "Your knowledge statement" : "Your reflection"}</span><small>{activeEvidenceMethod === "written" ? "Use: what I know → how it applies → a real example → why it matters." : "Use: what happened → what I did → the result → what I learned → what I will improve."}</small><textarea required rows={10} value={evidenceText} onChange={(event) => { setEvidenceText(event.target.value); setEvidenceError(""); }} placeholder={activeEvidenceMethod === "written" ? "I understand that… In my work this applies when… For example… This matters because…" : "The situation was… I decided to… The result was… I learned… Next time I will…"} /><em className={countWords(evidenceText) >= 30 ? "is-ready" : ""}>{countWords(evidenceText)} / 30 minimum words</em></label>}
          {activeEvidenceMethod === "witness" && <div className="witness-form">
            <div className="field-grid"><label className="clean-field is-required"><span>Witness name</span><input required type="text" value={witnessDraft.name} onChange={(event) => { setWitnessDraft({ ...witnessDraft, name: event.target.value }); setEvidenceError(""); }} placeholder="Full name" /></label><label className="clean-field is-required"><span>Witness role</span><input required type="text" value={witnessDraft.role} onChange={(event) => { setWitnessDraft({ ...witnessDraft, role: event.target.value }); setEvidenceError(""); }} placeholder="Supervisor" /></label><label className="clean-field is-wide is-required"><span>Date observed</span><input required type="date" value={witnessDraft.date} onChange={(event) => { setWitnessDraft({ ...witnessDraft, date: event.target.value }); setEvidenceError(""); }} /></label></div>
            <label className="guided-textarea is-required"><span>What did the witness observe?</span><small>Use the witness’s own words. Include the task, learner actions, standard achieved and how this showed the Behaviour.</small><textarea required rows={9} value={witnessDraft.testimony} onChange={(event) => { setWitnessDraft({ ...witnessDraft, testimony: event.target.value }); setEvidenceError(""); }} placeholder="I personally observed the learner…" /><em className={countWords(witnessDraft.testimony) >= 30 ? "is-ready" : ""}>{countWords(witnessDraft.testimony)} / 30 minimum words</em></label>
            <SignaturePad label="Witness signature — required" value={witnessDraft.signature ?? null} onChange={(signature) => { setWitnessDraft({ ...witnessDraft, signature: signature ?? undefined, signedAt: signature ? Date.now() : undefined }); setEvidenceError(""); }} />
            <p className="signature-declaration">By signing, the witness confirms this is their own account of what they personally observed.</p>
          </div>}
          {evidenceError && <p className="form-error" role="alert">{evidenceError}</p>}
          {mediaMethod ? <button className="make-course-button" type="button" onClick={() => navigate("evidence-options")}>{progress === 100 ? "Done — evidence complete" : "Done for now"}<span aria-hidden="true">→</span></button> : <button className="make-course-button" type="button" disabled={savingEvidence} onClick={saveEvidence}>{savingEvidence ? "Saving…" : record ? "Update evidence" : "Save evidence"}<span aria-hidden="true">→</span></button>}
        </div>
      );
    }

    if (view === "placeholder" && activeEvidenceKsb && placeholder.title === "__legacy-evidence-never__") {
      const selectedOption = evidenceOptions[activeEvidenceKsb.type].find((option) => option.method === activeEvidenceMethod);
      const photoPrompts = [
        ["Preparation", `Show the working area, materials, tools and controls before you begin ${activeEvidenceKsb.code}.`],
        ["Work in progress", `Show yourself carrying out the activity so the assessor can see how you meet ${activeEvidenceKsb.code}.`],
        ["Finished result", "Show the completed work clearly, including the quality, finish and any relevant measurements."],
      ];
      return (
        <div className="evidence-wizard">
          <div className="wizard-progress" aria-label={`Evidence step ${evidenceStep + 1} of 3`}><span className={evidenceStep >= 0 ? "is-current" : ""} /><span className={evidenceStep >= 1 ? "is-current" : ""} /><span className={evidenceStep >= 2 ? "is-current" : ""} /></div>
          {evidenceStep === 0 && <>
            <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>We’ll build this evidence together.</strong><p>I’ll explain exactly what to include, check the minimum requirement and save it against the right KSB.</p></div></div>
            <header className="evidence-criterion"><span>{activeEvidenceKsb.code} · {activeEvidenceKsb.type}</span><h3>{activeEvidenceKsb.description}</h3></header>
            <div className="evidence-route"><small>Your chosen route</small><strong>{evidenceMethodNames[activeEvidenceMethod]}</strong><p>{selectedOption?.rule}. You only need to complete one approved route for this KSB.</p></div>
            <button className="make-course-button" type="button" onClick={continueEvidence}>Show me what to do<span aria-hidden="true">→</span></button>
          </>}
          {evidenceStep === 1 && <>
            <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>{evidenceMethodNames[activeEvidenceMethod]}</strong><p>{activeEvidenceMethod === "photo" ? "Use three different, specific images—not three angles of the same finished result." : activeEvidenceMethod === "video" ? "Record one clear sequence showing you doing the work, not only the finished result." : activeEvidenceMethod === "audio" ? "Explain what you know in your own words and connect it to a real example from your work." : activeEvidenceMethod === "written" ? "Explain what you know, why it matters and how it applies in your work." : activeEvidenceMethod === "reflection" ? "Describe what happened, what you did, what you learned and what you would do next time." : "The witness must describe what they personally saw you do and how it met the criterion."}</p></div></div>
            <header className="evidence-criterion compact"><span>{activeEvidenceKsb.code}</span><h3>{activeEvidenceKsb.description}</h3></header>
            {activeEvidenceMethod === "photo" && <div className="evidence-upload-list">{photoPrompts.map(([title, prompt], index) => <label className={`evidence-upload${evidenceFiles[index] ? " has-file" : ""}`} key={title}><input type="file" accept="image/*" capture="environment" onChange={(event) => selectEvidenceFile(index, event)} /><span>{index + 1}</span><div><strong>{title}</strong><small>{prompt}</small><em>{evidenceFiles[index]?.name ?? "Tap to take or choose a photo"}</em></div></label>)}</div>}
            {activeEvidenceMethod === "video" && <label className={`evidence-upload is-single${evidenceFiles[0] ? " has-file" : ""}`}><input type="file" accept="video/*" capture="environment" onChange={(event) => selectEvidenceFile(0, event)} /><span>1</span><div><strong>One practical video</strong><small>Show the preparation, key stages, safe technique and finished result in one clear sequence. Keep the work and your actions visible.</small><em>{evidenceFiles[0]?.name ?? "Tap to record or choose a video"}</em></div></label>}
            {activeEvidenceMethod === "audio" && <label className={`evidence-upload is-single${evidenceFiles[0] ? " has-file" : ""}`}><input type="file" accept="audio/*" capture="user" onChange={(event) => selectEvidenceFile(0, event)} /><span>1</span><div><strong>One audio explanation</strong><small>State the KSB, explain the key principles, give a work-based example and finish with why the knowledge matters.</small><em>{evidenceFiles[0]?.name ?? "Tap to record or choose audio"}</em></div></label>}
            {["written", "reflection"].includes(activeEvidenceMethod) && <label className="guided-textarea"><span>{activeEvidenceMethod === "written" ? "Your knowledge statement" : "Your reflection"}</span><small>{activeEvidenceMethod === "written" ? "Use: what I know → how it applies → a real example → why it matters." : "Use: what happened → what I did → the result → what I learned → what I will improve."}</small><textarea rows={9} value={evidenceText} onChange={(event) => { setEvidenceText(event.target.value); setEvidenceError(""); }} placeholder={activeEvidenceMethod === "written" ? "I understand that… In my work this applies when… For example… This matters because…" : "The situation was… I decided to… The result was… I learned… Next time I will…"} /><em className={countWords(evidenceText) >= 30 ? "is-ready" : ""}>{countWords(evidenceText)} / 30 minimum words</em></label>}
            {activeEvidenceMethod === "witness" && <div className="witness-form"><div className="field-grid"><label className="clean-field"><span>Witness name</span><input type="text" value={witnessDraft.name} onChange={(event) => { setWitnessDraft({ ...witnessDraft, name: event.target.value }); setEvidenceError(""); }} /></label><label className="clean-field"><span>Witness role</span><input type="text" value={witnessDraft.role} onChange={(event) => { setWitnessDraft({ ...witnessDraft, role: event.target.value }); setEvidenceError(""); }} placeholder="Supervisor" /></label><label className="clean-field is-wide"><span>Date observed</span><input type="date" value={witnessDraft.date} onChange={(event) => { setWitnessDraft({ ...witnessDraft, date: event.target.value }); setEvidenceError(""); }} /></label></div><label className="guided-textarea"><span>What did the witness observe?</span><small>Write in the witness’s own words. Include the task, the learner’s actions, the standard achieved and how this demonstrated the Behaviour.</small><textarea rows={8} value={witnessDraft.testimony} onChange={(event) => { setWitnessDraft({ ...witnessDraft, testimony: event.target.value }); setEvidenceError(""); }} placeholder="I personally observed the learner…" /><em className={countWords(witnessDraft.testimony) >= 30 ? "is-ready" : ""}>{countWords(witnessDraft.testimony)} / 30 minimum words</em></label></div>}
            {evidenceError && <p className="form-error" role="alert">{evidenceError}</p>}
            <button className="make-course-button" type="button" onClick={continueEvidence}>Review my evidence<span aria-hidden="true">→</span></button>
          </>}
          {evidenceStep === 2 && <>
            <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>This meets the minimum evidence route.</strong><p>Check the details below. Saving it will mark {activeEvidenceKsb.code} as evidenced and update your KSB arch.</p></div></div>
            <div className="evidence-review"><span className="review-check" aria-hidden="true">✓</span><div><small>{activeEvidenceKsb.code} · {activeEvidenceKsb.type}</small><strong>{evidenceMethodNames[activeEvidenceMethod]}</strong><p>{activeEvidenceMethod === "photo" ? "3 specific photos ready" : ["video", "audio"].includes(activeEvidenceMethod) ? evidenceFiles[0]?.name : activeEvidenceMethod === "witness" ? `${witnessDraft.name}, ${witnessDraft.role} · ${countWords(witnessDraft.testimony)} words` : `${countWords(evidenceText)} words ready`}</p></div></div>
            <header className="evidence-criterion compact"><span>Mapped criterion</span><h3>{activeEvidenceKsb.description}</h3></header>
            {evidenceError && <p className="form-error" role="alert">{evidenceError}</p>}
            <button className="make-course-button" type="button" disabled={savingEvidence} onClick={saveEvidence}>{savingEvidence ? "Saving on this device…" : "Save evidence"}<span aria-hidden="true">→</span></button>
          </>}
        </div>
      );
    }

    if (view === "evidence-list") return (
      <div className="progress-workspace">
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Your evidence stays mapped.</strong><p>Every record below is attached to its KSB and stored on this device. File evidence is kept in the app’s private local storage.</p></div></div>
        <div className="progress-summary-grid"><div className="progress-summary-main"><span>Evidence records</span><strong>{evidenceRecords.length}</strong><small>{completedKsbCodes.size} unique KSBs covered</small></div><div className="progress-summary-stat"><span>KSB progress</span><strong>{ksbProgress}%</strong><small>{Math.max(0, courseKsbs.length - completedKsbCodes.size)} KSBs remaining</small></div></div>
        <div className="evidence-record-list">
          {[...evidenceRecords].sort((left, right) => (right.updatedAt ?? right.createdAt) - (left.updatedAt ?? left.createdAt)).map((record) => { const complete = evidenceRecordComplete(record); return <article className={`evidence-record${complete ? " is-complete" : ""}`} key={record.id}><span className="evidence-record-code">{record.ksbCode}</span><div><strong>{evidenceMethodNames[record.method]}</strong><small>{record.ksbType} · {new Date(record.updatedAt ?? record.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</small><p>{record.fileNames.length ? record.fileNames.join(" · ") : record.method === "witness" ? `Witness: ${record.witness?.name ?? "Recorded"}` : `${countWords(record.text ?? "")} words`}</p></div><span className="status-dot" aria-hidden="true">{complete ? "✓" : `${evidenceRecordProgress(record)}%`}</span></article>; })}
          {!evidenceRecords.length && <div className="empty-evidence"><span aria-hidden="true">＋</span><h3>No evidence saved yet</h3><p>Open a course Unit, choose a KSB and Evia will guide you through the right evidence route.</p><button type="button" onClick={() => navigate("units")}>Open Units <span aria-hidden="true">→</span></button></div>}
        </div>
      </div>
    );

    if (view === "profile") return (
      <div className="option-list is-fill">
        <OptionRow title="Manage My Course" note={course ? "Course added" : "Set up your course"} onClick={() => openCourseManager("profile")} />
        <OptionRow title="Edit My Details" note={employer || "Learner, employer, hours and dates"} onClick={() => { setTimelineError(""); navigate("profile-details"); }} />
      </div>
    );

    if (view === "profile-details") return (
      <form className="progress-workspace" onSubmit={saveProfileDetails}>
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>These details identify your evidence packs.</strong><p>I also use your working hours and course dates to calculate TOC and your paced OTJ target.</p></div></div>
        <div className="field-grid profile-fields">
          <label className="clean-field is-wide is-required"><span>Learner’s full name</span><input required type="text" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setTimelineError(""); }} placeholder="Full name" maxLength={80} /></label>
          <label className="clean-field is-wide is-required"><span>Employer</span><input required type="text" value={employer} onChange={(event) => { setEmployer(event.target.value); setTimelineError(""); }} placeholder="Employer name" maxLength={120} /></label>
          <label className="clean-field is-required"><span>Working hours per week</span><input required type="number" min="1" max="100" step="0.5" inputMode="decimal" value={timeline.weeklyHours} onChange={(event) => { setTimeline({ ...timeline, weeklyHours: Number(event.target.value) }); setTimelineError(""); }} /></label>
          <label className="clean-field is-required"><span>Course start date</span><input required type="date" min="2000-01-01" max="2100-12-31" value={timeline.startDate} onChange={(event) => { setTimeline({ ...timeline, startDate: event.target.value }); setTimelineError(""); }} /></label>
          <label className="clean-field is-wide is-required"><span>Planned end date</span><input required type="date" min="2000-01-01" max="2100-12-31" value={timeline.endDate} onChange={(event) => { setTimeline({ ...timeline, endDate: event.target.value }); setTimelineError(""); }} /></label>
        </div>
        {timelineError && <p className="form-error" role="alert">{timelineError}</p>}
        <button className="make-course-button" type="submit">Save my details<span aria-hidden="true">→</span></button>
      </form>
    );

    if (view === "accessibility") return (
      <div className="accessibility-workspace">
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Make Evia easier to use.</strong><p>Your choices apply across the app and stay on this device. Turn on read aloud, then double-tap text anywhere to hear it.</p></div></div>
        <section className="accessibility-section"><h3>Text size</h3><div className="segmented-control" role="group" aria-label="Text size">{(["standard", "large", "extra"] as const).map((size) => <button type="button" className={accessibility.textSize === size ? "is-active" : ""} key={size} onClick={() => updateAccessibility({ textSize: size })}>{size === "standard" ? "Standard" : size === "large" ? "Large" : "Extra large"}</button>)}</div></section>
        <section className="accessibility-section toggle-list">
          <label><span><strong>Double-tap to read aloud</strong><small>Hear the text you double-tap anywhere in Evia</small></span><input type="checkbox" checked={accessibility.readAloud} onChange={(event) => updateAccessibility({ readAloud: event.target.checked })} /></label>
          <label><span><strong>High contrast</strong><small>Stronger text, borders and controls</small></span><input type="checkbox" checked={accessibility.highContrast} onChange={(event) => updateAccessibility({ highContrast: event.target.checked })} /></label>
          <label><span><strong>Reading focus</strong><small>Increase line spacing and reduce surrounding visual detail</small></span><input type="checkbox" checked={accessibility.readingFocus} onChange={(event) => updateAccessibility({ readingFocus: event.target.checked })} /></label>
          <label><span><strong>Reduce motion</strong><small>Minimise Evia’s movement and page transitions</small></span><input type="checkbox" checked={accessibility.reduceMotion} onChange={(event) => updateAccessibility({ reduceMotion: event.target.checked })} /></label>
        </section>
        <button className="make-course-button" type="button" onClick={() => speakText("Hello, I’m Evia. Read aloud is working. Double tap text anywhere in the app and I will read it to you.")}>Test read aloud<span aria-hidden="true">▶</span></button>
      </div>
    );

    if (view === "manage-course") return (
      <div className="course-methods">
        <div className="builder-intro">
          <span className="builder-kicker">Choose how to add your course</span>
          <p>Use a finished tutor file, preserve a written course layout, or give Evia a complete KSB list to organise.</p>
        </div>
        <div className="option-list course-method-pills">
          <OptionRow title="Import Course File" note="Use a finished tutor-created Evia course" onClick={() => { setCourseError(""); navigate("import-course"); }} />
          <OptionRow title="Paste Course Layout" note="Keep your own unit names and KSB mappings" onClick={() => { setCourseError(""); navigate("paste-layout"); }} />
          <OptionRow title="Let Evia Build It" note="Paste an unorganised KSB list" onClick={() => { setCourseError(""); navigate("build-course"); }} />
        </div>
      </div>
    );

    if (view === "import-course") return (
      <div className="course-builder">
        <div className="builder-intro">
          <span className="builder-kicker">Tutor-made course</span>
          <p>Choose a structured .evia or .json file. Evia keeps the tutor’s unit titles, order and KSB mappings exactly as supplied.</p>
        </div>
        <label className="course-file-row">
          <input type="file" accept=".evia,.json,application/json" onChange={selectCourseFile} aria-label="Choose an Evia course file" />
          <span><strong>{courseFileName || "Choose course file"}</strong><small>{courseFileName ? "File checked on this device" : ".evia or .json · maximum 2 MB"}</small></span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4" /><path d="M5 14v4.2A1.8 1.8 0 0 0 6.8 20h10.4a1.8 1.8 0 0 0 1.8-1.8V14" /></svg>
        </label>
        {pendingFileCourse && (
          <div className="file-course-preview" aria-live="polite">
            <span><strong>{pendingFileCourse.units.length}</strong> Units recognised</span>
            <small>{pendingFileCourse.inputCounts.knowledge} Knowledge · {pendingFileCourse.inputCounts.skills} Skills · {pendingFileCourse.inputCounts.behaviours} Behaviours</small>
          </div>
        )}
        {courseError && <p className="form-error" role="alert">{courseError}</p>}
        <button className="make-course-button" type="button" disabled={!pendingFileCourse} onClick={importCourseFile}>Import course<span aria-hidden="true">→</span></button>
      </div>
    );

    if (view === "paste-layout") return (
      <form className="course-builder" onSubmit={makeLayoutCourse}>
        <div className="builder-intro">
          <span className="builder-kicker">Use your tutor’s structure</span>
          <p>Put each unit title above its KSBs. Evia preserves the titles, order and mappings rather than reorganising them.</p>
        </div>
        <label className="course-text-block is-primary-input is-required">
          <span>Paste course layout</span><small>Start each unit on a new line; leave a blank line between units</small>
          <textarea value={layoutText} onChange={(event) => { setLayoutText(event.target.value); setCourseError(""); }} placeholder={"Health and Safety\nK1: Awareness of health and safety regulations...\nK2: Safety control equipment and PPE...\nS1: Comply with health and safety regulations...\nS2: Identify and use PPE...\nB1: Put health, safety and wellbeing first.\n\nPlanning and Resources\nK10: Interpret drawings and specifications...\nK12: Resource estimation techniques...\nS5: Read and interpret drawings...\nS6: Estimate and select required resources..."} rows={16} />
        </label>
        {layoutDraftKsbs.length > 0 && (
          <div className="course-input-counts" aria-live="polite">
            <span><strong>{layoutDraftCounts.knowledge}</strong> Knowledge</span>
            <span><strong>{layoutDraftCounts.skills}</strong> Skills</span>
            <span><strong>{layoutDraftCounts.behaviours}</strong> Behaviours</span>
          </div>
        )}
        {courseError && <p className="form-error" role="alert">{courseError}</p>}
        <button className="make-course-button" type="submit">Use this layout<span aria-hidden="true">→</span></button>
      </form>
    );

    if (view === "build-course") return (
      <form className="course-builder" onSubmit={makeCourse}>
        <div className="builder-intro">
          <span className="builder-kicker">Let Evia organise it</span>
          <p>Paste a complete, unorganised KSB list. Evia will pair Skills, create activity titles and map the Knowledge and Behaviours.</p>
        </div>
        <label className="course-text-block is-primary-input is-required">
          <span>Paste KSBs</span><small>Headings and multi-line wording are fine</small>
          <textarea value={ksbsText} onChange={(event) => { setKsbsText(event.target.value); setCourseError(""); }} placeholder={"Knowledge\nK1: The regulations and guidance for...\nK2: The principles of...\n\nSkills\nS1: Comply with...\nS2: Apply...\n\nBehaviours\nB1: Put safety first.\nB2: Take ownership of work."} rows={16} />
        </label>
        {draftKsbs.length > 0 && (
          <div className="course-input-counts" aria-live="polite">
            <span><strong>{draftCounts.knowledge}</strong> Knowledge</span>
            <span><strong>{draftCounts.skills}</strong> Skills</span>
            <span><strong>{draftCounts.behaviours}</strong> Behaviours</span>
          </div>
        )}
        {courseError && <p className="form-error" role="alert">{courseError}</p>}
        <button className="make-course-button" type="submit">{course ? "Re-sort my course" : "Sort my course"}<span aria-hidden="true">→</span></button>
      </form>
    );

    if (view === "units") {
      if (!course) return (
        <div className="empty-course-state">
          <span className="empty-course-mark" aria-hidden="true">+</span>
          <h3>No course added yet</h3>
          <p>Import a tutor file, paste a course layout, or let Evia organise a complete KSB list.</p>
          <button type="button" onClick={() => openCourseManager("units")}>Add now <span aria-hidden="true">→</span></button>
        </div>
      );

      return (
        <div className="duties-browser">
          <label className="duty-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.75" cy="10.75" r="6.25" /><path d="m15.5 15.5 4 4" /></svg>
            <input type="search" value={unitSearch} onChange={(event) => setUnitSearch(event.target.value)} placeholder="Search Units or KSBs" aria-label="Search Units or KSBs" />
          </label>
          <p className="holistic-note">{course.sourceType === "layout" || course.sourceType === "file"
            ? "This course uses the tutor’s unit titles and KSB mappings."
            : "Every Knowledge and Skill is used once. Two relevant Behaviours support each Unit."}</p>
          <div className="duty-list">
            {filteredUnits.map((unit) => {
              const progress = unitProgressDetails(unit);
              return (
              <button type="button" className={`duty-row${progress.isComplete ? " is-complete" : ""}`} key={unit.id} onClick={() => { setSelectedUnitId(unit.id); navigate("unit"); }}>
                <span className="duty-row-copy">
                  <span className="unit-title-line"><strong>{unit.title}</strong></span>
                  {renderUnitCompletionDots(unit)}
                </span>
                <span className="row-chevron" aria-hidden="true">›</span>
              </button>
            );})}
            {!filteredUnits.length && <p className="no-results">No Units or KSBs match “{unitSearch}”.</p>}
          </div>
        </div>
      );
    }

    if (view === "unit" && selectedUnit) return (
      <div className="duty-detail">
        <header className={`duty-summary${unitProgressDetails(selectedUnit).isComplete ? " is-complete" : ""}`}>
          <span>Evidence collection</span><h3>{selectedUnit.title}</h3><p>{selectedUnit.summary}</p>
          {renderUnitCompletionDots(selectedUnit)}
          <button type="button" className="unit-download-button" disabled={Boolean(exporting)} onClick={() => requestSignedExport({ kind: "unit", unitId: selectedUnit.id })}>{exporting === selectedUnit.id ? "Building evidence pack…" : "Sign & download Unit evidence"}<span aria-hidden="true">↓</span></button>
        </header>
        {renderKsbGroup("Skill", "Skills")}
        {renderKsbGroup("Knowledge", "Knowledge")}
        {renderKsbGroup("Behaviour", "Behaviours")}
      </div>
    );

    if (view === "admin-lock") return (
      <form className="admin-lock" onSubmit={unlockAdmin}>
        <span className="lock-mark" aria-hidden="true" /><h3>Admin access</h3><p>Enter the four-digit admin code.</p>
        <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={adminCode} onChange={(event) => setAdminCode(event.target.value.replace(/\D/g, ""))} aria-label="Admin code" placeholder="••••" />
        {adminError && <p className="admin-error" role="alert">{adminError}</p>}
        <button type="submit" disabled={adminCode.length !== 4}>Unlock</button>
      </form>
    );

    if (view === "admin") return (
      <div className="option-list is-fill admin-options">
        <div className="admin-status"><span /> Admin settings unlocked</div>
        <OptionRow title="Recognised Prior Learning" note={`${rplCodes.length} KSB${rplCodes.length === 1 ? "" : "s"} marked RPL`} onClick={() => { setUnitSearch(""); navigate("admin-rpl"); }} />
        <OptionRow title="Course Controls" onClick={() => openPlaceholder("Course Controls", "admin")} />
        <OptionRow title="Learner Access" onClick={() => openPlaceholder("Learner Access", "admin")} />
        <OptionRow title="Data & Privacy" onClick={() => openPlaceholder("Data & Privacy", "admin")} />
      </div>
    );

    if (view === "admin-rpl") return (
      <div className="progress-workspace">
        <div className="evia-guidance"><span className="guidance-mark" aria-hidden="true">E</span><div><strong>Only mark verified prior learning.</strong><p>An RPL KSB counts as covered in Portfolio Health and is clearly labelled in the evidence pack. Tap again to remove it.</p></div></div>
        {!course ? <div className="empty-course-state"><h3>No course added</h3><p>Add a course before marking individual KSBs as RPL.</p></div> : <><label className="duty-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.75" cy="10.75" r="6.25" /><path d="m15.5 15.5 4 4" /></svg><input type="search" value={unitSearch} onChange={(event) => setUnitSearch(event.target.value)} placeholder="Search KSB code or wording" aria-label="Search KSBs for RPL" /></label><div className="rpl-list">{courseKsbs.filter((ksb) => !unitSearch.trim() || `${ksb.code} ${ksb.description}`.toLowerCase().includes(unitSearch.trim().toLowerCase())).sort((left, right) => left.code.localeCompare(right.code, undefined, { numeric: true })).map((ksb) => { const marked = rplCodes.includes(ksb.code); return <button type="button" className={marked ? "is-rpl" : ""} key={ksb.code} aria-pressed={marked} onClick={() => toggleRpl(ksb.code)}><span>{ksb.code}</span><strong>{ksb.description}</strong><em>{marked ? "RPL ✓" : "Mark RPL"}</em></button>; })}</div></>}
      </div>
    );

    return <div className="placeholder-state"><span className="placeholder-line" aria-hidden="true" /><h3>{placeholder.title}</h3><p>This area is ready for the next part of Evia.</p></div>;
  };

  const reminderItems: ReminderItem[] = [
    ...(progressCelebration ? [{ id: "progress-change", label: progressCelebration, onClick: () => { setProgressCelebration(""); setRemindersOpen(false); } }] : []),
    ...homeGuidanceMessages.map((label, index) => ({ id: `reminder-${index}-${label}`, label, onClick: () => openReminder(label) })),
  ];

  return (
    <main
      className={`evia-app${ready ? " is-ready" : ""}${open ? " is-open" : ""}${isOnboarding ? " is-onboarding" : ""}${eviaPlusOpen ? " is-guided" : ""} text-${accessibility.textSize}${accessibility.highContrast ? " is-high-contrast" : ""}${accessibility.readingFocus ? " is-reading-focus" : ""}${accessibility.reduceMotion ? " is-reduced-motion" : ""}`}
      onClick={handleBackgroundHome}
      onDoubleClick={(event) => {
        if (!accessibility.readAloud) return;
        const target = event.target as HTMLElement;
        if (target.matches("input, textarea")) return;
        const readable = target.closest("button, article, label, header, p, h1, h2, h3, h4, section") as HTMLElement | null;
        speakText(readable?.innerText ?? target.innerText ?? "");
      }}
      onPointerUp={handleTouchReadAloud}
    >
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />

      {!isOnboarding && !eviaPlusOpen && <div className="app-top-controls">
        <button type="button" className="evia-plus-launch" onClick={openEviaGuide}>Evia+</button>
        <div className="reminder-control">
          <button
            type="button"
            className={`reminder-button${updatedProgress.length || progressCelebration ? " has-update" : ""}`}
            aria-label={`Reminders${reminderItems.length ? `, ${reminderItems.length} available` : ""}`}
            aria-expanded={remindersOpen}
            onClick={() => setRemindersOpen((current) => !current)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 10a4.5 4.5 0 0 1 9 0c0 5 2 5.4 2 6.5h-13c0-1.1 2-1.5 2-6.5Z" /><path d="M10 19h4" /></svg>
            {reminderItems.length > 0 && <span>{Math.min(9, reminderItems.length)}</span>}
          </button>
          {remindersOpen && <div className="reminder-menu" role="menu" aria-label="Evia reminders">
            <div className="reminder-menu-heading"><strong>What’s next</strong><button type="button" onClick={() => setRemindersOpen(false)} aria-label="Close reminders">×</button></div>
            {reminderItems.map((item) => <button type="button" role="menuitem" className={item.id === "progress-change" ? "is-progress" : ""} key={item.id} onClick={() => { if (item.onClick) item.onClick(); else setRemindersOpen(false); }}>{item.label}<span aria-hidden="true">›</span></button>)}
            {!reminderItems.length && <p>You’re up to date.</p>}
          </div>}
        </div>
      </div>}

      <button type="button" className="evia-anchor" aria-label={open ? "Close Evia menu" : "Open Evia menu"} aria-expanded={open} disabled={isOnboarding} onClick={toggleEvia}>
        <span className="evia-float"><span className="evia-halo" aria-hidden="true" /><span className={`evia-face expression-${expression}`} aria-hidden="true"><span className="evia-eyes"><span className="evia-eye eye-left" /><span className="evia-eye eye-right" /></span></span></span>
      </button>

      <section className="menu-stage" aria-hidden={!open || eviaPlusOpen} aria-label="Evia menu">
        <div className={shellClasses}>
          <div className={`view-panel${view === "root" ? " is-root-view" : ""}${panelLeaving ? " is-leaving" : ""}`} key={view}>
            {view !== "root" && <div className="detail-header"><button type="button" className="back-button" aria-label={`Back from ${viewTitles[view]}`} onClick={goBack}><span aria-hidden="true">‹</span></button><h2>{viewTitles[view]}</h2><span className="header-spacer" aria-hidden="true" /></div>}
            <div className={`view-content view-${view}`}>{renderViewContent()}</div>
          </div>
        </div>
      </section>

      <section className="progress-dock" aria-label="Your progress" aria-hidden={eviaPlusOpen}>
        <div className="progress-row">{progressItems.map((item) => <ProgressArch key={item.label} {...item} />)}</div>
      </section>
      {notice && <div className="app-toast" role="status">{notice}</div>}

      {eviaPlusOpen && activeGuideStep && <section className="evia-plus-layer" role="dialog" aria-modal="true" aria-labelledby="evia-plus-title" aria-describedby="evia-plus-copy">
        <button type="button" className="evia-plus-close" onClick={closeEviaGuide} aria-label="Close Evia guided support">×</button>
        <div className="evia-plus-step" key={`${view}-${eviaGuideStep}`}>
          <div className="evia-plus-kicker"><span>Evia+</span><small>Step {eviaGuideStep + 1} of {eviaGuideSteps.length}</small></div>
          <h2 id="evia-plus-title">{activeGuideStep.title}</h2>
          <p id="evia-plus-copy">{activeGuideStep.body}</p>
          {activeGuideStep.prompt && <label className="evia-plus-input"><span>{activeGuideStep.prompt}</span><textarea value={guidedWritingDraft} onChange={(event) => { setGuidedWritingDraft(event.target.value); setGuidedWritingError(""); }} placeholder={activeGuideStep.placeholder} rows={5} autoFocus /></label>}
          {guidedWritingError && <p className="evia-plus-error" role="alert">{guidedWritingError}</p>}
          <div className="evia-plus-progress" aria-hidden="true">{eviaGuideSteps.map((_, index) => <span className={index <= eviaGuideStep ? "is-active" : ""} key={index} />)}</div>
          <div className="evia-plus-actions">
            {eviaGuideStep > 0 ? <button type="button" className="evia-plus-back" onClick={moveGuideBack}>Back</button> : <span />}
            <button type="button" className="evia-plus-next" onClick={moveGuideForward}>{eviaGuideStep === eviaGuideSteps.length - 1 ? isWritingGuide ? "Compile my statement" : "Done" : "Next step"}<span aria-hidden="true">→</span></button>
          </div>
          {isWritingGuide && <small className="evia-plus-assurance">Only your answers are used. Evia corrects spelling, grammar and punctuation without adding technical content.</small>}
        </div>
      </section>}

      {exportRequest && <section className="signature-layer" role="dialog" aria-modal="true" aria-labelledby="signature-title">
        <div className="signature-sheet">
          <div className="signature-sheet-heading"><span className="guidance-mark" aria-hidden="true">E</span><div><small>Declaration</small><h2 id="signature-title">Sign before downloading</h2><p>The learner’s handwritten signature and the exact download time will be added to the professional PDF.</p></div></div>
          <SignaturePad label={`Learner signature — ${fullName || "name required"}`} value={learnerSignature} onChange={(signature) => { setLearnerSignature(signature); setSignatureError(""); }} />
          <p className="signature-declaration">I confirm this pack is a true record of my own work, learning and evidence.</p>
          {exportRequest.kind === "otj" && <div className="employer-verification">
            <div className="section-heading"><span>Employer verification</span><small>Optional but recommended</small></div>
            <p>The employer representative should check the Unit allocations and every OTJ entry before signing.</p>
            <label className="clean-field"><span>Employer representative’s full name</span><input type="text" value={employerSigner} onChange={(event) => { setEmployerSigner(event.target.value); setSignatureError(""); }} placeholder="Leave blank if not available" /></label>
            <SignaturePad label="Employer representative signature — optional" value={employerSignature} onChange={(signature) => { setEmployerSignature(signature); setSignatureError(""); }} />
          </div>}
          <p className="signature-timestamp">Download timestamp: {new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</p>
          {signatureError && <p className="form-error" role="alert">{signatureError}</p>}
          <div className="signature-actions"><button type="button" className="secondary-action" onClick={() => setExportRequest(null)}>Cancel</button><button type="button" className="primary-action" onClick={completeSignedExport}>Sign & download<span aria-hidden="true">↓</span></button></div>
        </div>
      </section>}

      {onboardingChecked && onboardingStep !== null && (
        <section className={`onboarding-layer onboarding-step-${onboardingStep}`} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description">
          <div className="onboarding-panel" key={onboardingStep}>
            {onboardingStep === 0 && <><p className="onboarding-kicker">Hello, I’m Evia</p><h1 id="onboarding-title">What’s your full name?</h1><p id="onboarding-description" className="onboarding-copy">I’m your apprenticeship personal assistant. Let’s get to know each other.</p><form className="name-form" onSubmit={submitName}><label className="sr-only" htmlFor="learner-name">Full name</label><div className="name-pill"><input id="learner-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name" autoComplete="name" maxLength={80} /><button type="submit" disabled={!fullName.trim()} aria-label="Continue"><span aria-hidden="true">→</span></button></div></form></>}
            {onboardingStep === 1 && <><p className="onboarding-kicker">Welcome to Evia</p><h1 id="onboarding-title">Nice to meet you, {firstName}.</h1><p id="onboarding-description" className="onboarding-copy">I’m your apprenticeship PA. I’ll help you stay on top of your course, evidence, study and EPA preparation without making things complicated.</p><button type="button" className="onboarding-action" onClick={() => setOnboardingStep(2)}>Let me show you around <span aria-hidden="true">→</span></button><div className="onboarding-dots" aria-hidden="true"><span className="is-current" /><span /><span /></div></>}
            {onboardingStep === 2 && <><p className="onboarding-kicker">Your assistant</p><h1 id="onboarding-title">Tap me whenever you need help.</h1><p id="onboarding-description" className="onboarding-copy">Tap me to open your options. I can guide you to your course, self-study tools, portfolio and settings from one simple place.</p><button type="button" className="onboarding-action" onClick={() => setOnboardingStep(3)}>Next <span aria-hidden="true">→</span></button><div className="onboarding-dots" aria-hidden="true"><span /><span className="is-current" /><span /></div></>}
            {onboardingStep === 3 && <><p className="onboarding-kicker">Your progress</p><h1 id="onboarding-title">Four arches. One clear view.</h1><p id="onboarding-description" className="onboarding-copy compact-copy">Tap any arch to see how it is calculated, update its details or continue the work behind it.</p><div className="arch-guide" aria-label="Progress arch meanings">{progressItems.map((item) => <div className="arch-guide-item" key={item.label}><span className="arch-guide-code">{item.label}</span><span className="arch-guide-name">{item.name}</span></div>)}</div><button type="button" className="onboarding-action" onClick={completeOnboarding}>Start using Evia <span aria-hidden="true">→</span></button><div className="onboarding-dots" aria-hidden="true"><span /><span /><span className="is-current" /></div></>}
          </div>
        </section>
      )}
    </main>
  );
}
