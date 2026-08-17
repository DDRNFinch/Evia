"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

const progress = [
  { label: "TOC", name: "Time on course", value: 68 },
  { label: "KSB", name: "Knowledge, skills & behaviours", value: 42 },
  { label: "OTJ", name: "Off-the-job training", value: 74 },
  { label: "EPA", name: "End-point assessment", value: 56 },
];

type EviaExpression = "idle" | "look-down" | "look-up-left" | "look-up-right" | "smile";
type View =
  | "root"
  | "course"
  | "study"
  | "portfolio"
  | "settings"
  | "install-app"
  | "profile"
  | "manage-course"
  | "import-course"
  | "paste-layout"
  | "build-course"
  | "units"
  | "unit"
  | "admin-lock"
  | "admin"
  | "placeholder";
type KsbType = "Skill" | "Knowledge" | "Behaviour";
type CourseSource = "auto" | "layout" | "file";

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

const courseMappingVersion = 4;

const calmExpressionSequence: { pose: EviaExpression; duration: number }[] = [
  { pose: "idle", duration: 2800 },
  { pose: "look-up-left", duration: 1500 },
  { pose: "idle", duration: 2100 },
  { pose: "look-up-right", duration: 1500 },
  { pose: "idle", duration: 2400 },
  { pose: "smile", duration: 1800 },
];

const attentiveExpressionSequence: { pose: EviaExpression; duration: number }[] = [
  { pose: "look-down", duration: 2300 },
  { pose: "idle", duration: 1100 },
  { pose: "smile", duration: 1700 },
  { pose: "idle", duration: 1400 },
  { pose: "look-up-left", duration: 1600 },
  { pose: "idle", duration: 900 },
  { pose: "look-up-right", duration: 1600 },
];

const stopWords = new Set([
  "and", "the", "for", "with", "from", "into", "that", "this", "their", "they", "work",
  "working", "within", "using", "use", "appropriate", "relevant", "required", "requirements",
  "including", "industry", "able", "must", "will", "can", "are", "to",
  "of", "in", "on", "a", "an", "or", "as", "be", "by", "at",
]);

function ProgressArch({ label, name, value }: { label: string; name: string; value: number }) {
  return (
    <div className="progress-arch" aria-label={`${name}: ${value}%`}>
      <svg viewBox="0 0 100 62" aria-hidden="true">
        <path className="arch-track" pathLength="100" d="M 9 54 A 41 41 0 0 1 91 54" />
        <path
          className="arch-value"
          pathLength="100"
          d="M 9 54 A 41 41 0 0 1 91 54"
          style={{ strokeDasharray: `${value} 100` }}
        />
      </svg>
      <span className="arch-label" aria-hidden="true">{label}</span>
      <span className="arch-number">{value}%</span>
    </div>
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
  const [course, setCourse] = useState<LearnerCourse | null>(null);
  const [ksbsText, setKsbsText] = useState("");
  const [layoutText, setLayoutText] = useState("");
  const [courseFileName, setCourseFileName] = useState("");
  const [pendingFileCourse, setPendingFileCourse] = useState<LearnerCourse | null>(null);
  const [courseError, setCourseError] = useState("");
  const [courseManagerBack, setCourseManagerBack] = useState<View>("profile");
  const [unitSearch, setUnitSearch] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
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
    let onboardingComplete = false;
    let savedCourse: LearnerCourse | null = null;

    try {
      savedName = window.localStorage.getItem("evia-full-name") ?? "";
      onboardingComplete = window.localStorage.getItem("evia-onboarding-complete") === "true";
      const storedCourse = window.localStorage.getItem("evia-course");
      savedCourse = storedCourse ? JSON.parse(storedCourse) as LearnerCourse : null;
    } catch {
      onboardingComplete = false;
    }

    if (!onboardingComplete) {
      setFullName(savedName);
      setOnboardingStep(savedName ? 1 : 0);
    } else {
      setFullName(savedName);
    }

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
    setOnboardingChecked(true);
  }, []);

  useEffect(() => {
    if (onboardingStep !== null) {
      if (onboardingStep === 1) setExpression("smile");
      else if (onboardingStep >= 2) setExpression("look-down");
      else setExpression("idle");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setExpression(open ? "look-down" : "idle");
      return;
    }

    const sequence = open ? attentiveExpressionSequence : calmExpressionSequence;
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    setExpression(sequence[index].pose);
    const showNextExpression = () => {
      timer = setTimeout(() => {
        index = (index + 1) % sequence.length;
        setExpression(sequence[index].pose);
        showNextExpression();
      }, sequence[index].duration);
    };
    showNextExpression();
    return () => clearTimeout(timer);
  }, [open, view, onboardingStep]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const isOnboarding = onboardingChecked && onboardingStep !== null;
  const selectedUnit = course?.units.find((unit) => unit.id === selectedUnitId) ?? null;
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

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 2800);
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
    setPanelLeaving(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setView(nextView);
      setPanelLeaving(false);
    }, 180);
  };

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
      "manage-course": courseManagerBack, "import-course": "manage-course", "paste-layout": "manage-course",
      "build-course": "manage-course", units: "course", unit: "units", "admin-lock": "settings", admin: "settings",
    };
    if (view === "placeholder") navigate(placeholder.back);
    else navigate(targets[view] ?? "root");
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
    profile: "My Profile", "manage-course": "Manage My Course", "import-course": "Import Course File",
    "paste-layout": "Paste Course Layout", "build-course": "Let Evia Build It", units: "Units",
    unit: "Course Unit", "admin-lock": "Admin Settings",
    admin: "Admin Settings", placeholder: placeholder.title,
  };

  const workspaceViews: View[] = ["manage-course", "import-course", "paste-layout", "build-course", "units", "unit"];
  const tallViews: View[] = ["root", "settings", "install-app", "admin"];
  const shellClasses = `menu-shell${workspaceViews.includes(view) ? " is-workspace" : ""}${tallViews.includes(view) ? " is-tall" : ""}`;

  const renderKsbGroup = (type: KsbType, title: string, methods: string[]) => {
    const items = [...(selectedUnit?.ksbs.filter((ksb) => ksb.type === type) ?? [])]
      .sort((left, right) => left.code.localeCompare(right.code, undefined, { numeric: true }));
    return (
      <section className="ksb-group" aria-labelledby={`${type.toLowerCase()}-heading`}>
        <div className="ksb-group-heading">
          <h3 id={`${type.toLowerCase()}-heading`}>{title}</h3><span>{items.length}</span>
        </div>
        {items.length ? items.map((ksb) => {
          return (
            <article className="ksb-item" key={`${selectedUnit?.id}-${ksb.code}`}>
              <div className="ksb-item-copy">
                <span className="ksb-code">{ksb.code}</span>
                <div><h4>{ksb.description}</h4></div>
              </div>
              <div className="evidence-methods" aria-label={`Evidence options for ${ksb.code}`}>
                {methods.map((method) => (
                  <button type="button" key={method} onClick={() => showNotice(`${method} selected for ${ksb.code}.`)}>{method}</button>
                ))}
              </div>
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
      <div className="option-list">
        <OptionRow title="Units" note={course ? `${course.units.length} ready` : "Course not added"} onClick={() => navigate("units")} />
        <OptionRow title="Off The Job" onClick={() => openPlaceholder("Off The Job", "course")} />
        <OptionRow title="EPA Practice" onClick={() => openPlaceholder("EPA Practice", "course")} />
      </div>
    );

    if (view === "study") return (
      <div className="option-list">
        <OptionRow title="Maths & English" onClick={() => openPlaceholder("Maths & English", "study")} />
        <OptionRow title="Trade Subjects" onClick={() => openPlaceholder("Trade Subjects", "study")} />
        <OptionRow title="EDI Subjects" onClick={() => openPlaceholder("EDI Subjects", "study")} />
      </div>
    );

    if (view === "portfolio") return (
      <div className="option-list">
        <OptionRow title="Portfolio Health" onClick={() => openPlaceholder("Portfolio Health", "portfolio")} />
        <OptionRow title="My Evidence" onClick={() => openPlaceholder("My Evidence", "portfolio")} />
        <OptionRow title="Download Portfolio" onClick={() => openPlaceholder("Download Portfolio", "portfolio")} />
      </div>
    );

    if (view === "settings") return (
      <div className="option-list four-options">
        <OptionRow title="Install Evia" note={isInstalled ? "Installed on this device" : "Add Evia to this device"} onClick={() => navigate("install-app")} />
        <OptionRow title="My Profile" onClick={() => navigate("profile")} />
        <OptionRow title="General Settings" onClick={() => openPlaceholder("General Settings", "settings")} />
        <OptionRow title="Accessibility" onClick={() => openPlaceholder("Accessibility", "settings")} />
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

    if (view === "profile") return (
      <div className="option-list">
        <OptionRow title="Manage My Course" note={course ? "Course added" : "Set up your course"} onClick={() => openCourseManager("profile")} />
        <OptionRow title="Edit My Details" onClick={() => openPlaceholder("Edit My Details", "profile")} />
        <OptionRow title="Update My Schedule" onClick={() => openPlaceholder("Update My Schedule", "profile")} />
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
        <label className="course-text-block is-primary-input">
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
        <label className="course-text-block is-primary-input">
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
              const knowledgeCount = unit.ksbs.filter((item) => item.type === "Knowledge").length;
              const skillCount = unit.ksbs.filter((item) => item.type === "Skill").length;
              const behaviourCount = unit.ksbs.filter((item) => item.type === "Behaviour").length;
              return (
              <button type="button" className="duty-row" key={unit.id} onClick={() => { setSelectedUnitId(unit.id); navigate("unit"); }}>
                <span className="duty-row-copy"><strong>{unit.title}</strong><small>{knowledgeCount} Knowledge · {skillCount} Skill{skillCount === 1 ? "" : "s"} · {behaviourCount} Behaviour{behaviourCount === 1 ? "" : "s"}</small></span>
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
        <header className="duty-summary"><span>Evidence collection</span><h3>{selectedUnit.title}</h3><p>{selectedUnit.summary}</p></header>
        {renderKsbGroup("Skill", "Skills", ["Photo", "Video"])}
        {renderKsbGroup("Knowledge", "Knowledge", ["Written", "Audio"])}
        {renderKsbGroup("Behaviour", "Behaviours", ["Reflection", "Witness testimony"])}
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
      <div className="option-list admin-options">
        <div className="admin-status"><span /> Admin settings unlocked</div>
        <OptionRow title="Course Controls" onClick={() => openPlaceholder("Course Controls", "admin")} />
        <OptionRow title="Learner Access" onClick={() => openPlaceholder("Learner Access", "admin")} />
        <OptionRow title="Data & Privacy" onClick={() => openPlaceholder("Data & Privacy", "admin")} />
      </div>
    );

    return <div className="placeholder-state"><span className="placeholder-line" aria-hidden="true" /><h3>{placeholder.title}</h3><p>This area is ready for the next part of Evia.</p></div>;
  };

  return (
    <main className={`evia-app${ready ? " is-ready" : ""}${open ? " is-open" : ""}${isOnboarding ? " is-onboarding" : ""}`}>
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
      <button type="button" className="evia-anchor" aria-label={open ? "Close Evia menu" : "Open Evia menu"} aria-expanded={open} disabled={isOnboarding} onClick={toggleEvia}>
        <span className="evia-float"><span className="evia-halo" aria-hidden="true" /><span className={`evia-face expression-${expression}`} aria-hidden="true"><span className="evia-eyes"><span className="evia-eye eye-left" /><span className="evia-eye eye-right" /></span></span></span>
      </button>

      <section className="menu-stage" aria-hidden={!open} aria-label="Evia menu">
        <div className={shellClasses}>
          <div className={`view-panel${view === "root" ? " is-root-view" : ""}${panelLeaving ? " is-leaving" : ""}`} key={view}>
            {view !== "root" && <div className="detail-header"><button type="button" className="back-button" aria-label={`Back from ${viewTitles[view]}`} onClick={goBack}><span aria-hidden="true">‹</span></button><h2>{viewTitles[view]}</h2><span className="header-spacer" aria-hidden="true" /></div>}
            <div className={`view-content view-${view}`}>{renderViewContent()}</div>
          </div>
        </div>
      </section>

      <section className="progress-dock" aria-label="Your progress"><div className="progress-row">{progress.map((item) => <ProgressArch key={item.label} {...item} />)}</div></section>
      {notice && <div className="app-toast" role="status">{notice}</div>}

      {onboardingChecked && onboardingStep !== null && (
        <section className={`onboarding-layer onboarding-step-${onboardingStep}`} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description">
          <div className="onboarding-panel" key={onboardingStep}>
            {onboardingStep === 0 && <><p className="onboarding-kicker">Hello, I’m Evia</p><h1 id="onboarding-title">What’s your full name?</h1><p id="onboarding-description" className="onboarding-copy">I’m your apprenticeship personal assistant. Let’s get to know each other.</p><form className="name-form" onSubmit={submitName}><label className="sr-only" htmlFor="learner-name">Full name</label><div className="name-pill"><input id="learner-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name" autoComplete="name" maxLength={80} /><button type="submit" disabled={!fullName.trim()} aria-label="Continue"><span aria-hidden="true">→</span></button></div></form></>}
            {onboardingStep === 1 && <><p className="onboarding-kicker">Welcome to Evia</p><h1 id="onboarding-title">Nice to meet you, {firstName}.</h1><p id="onboarding-description" className="onboarding-copy">I’m your apprenticeship PA. I’ll help you stay on top of your course, evidence, study and EPA preparation without making things complicated.</p><button type="button" className="onboarding-action" onClick={() => setOnboardingStep(2)}>Let me show you around <span aria-hidden="true">→</span></button><div className="onboarding-dots" aria-hidden="true"><span className="is-current" /><span /><span /></div></>}
            {onboardingStep === 2 && <><p className="onboarding-kicker">Your assistant</p><h1 id="onboarding-title">Tap me whenever you need help.</h1><p id="onboarding-description" className="onboarding-copy">Tap me to open your options. I can guide you to your course, self-study tools, portfolio and settings from one simple place.</p><button type="button" className="onboarding-action" onClick={() => setOnboardingStep(3)}>Next <span aria-hidden="true">→</span></button><div className="onboarding-dots" aria-hidden="true"><span /><span className="is-current" /><span /></div></>}
            {onboardingStep === 3 && <><p className="onboarding-kicker">Your progress</p><h1 id="onboarding-title">Four arches. One clear view.</h1><p id="onboarding-description" className="onboarding-copy compact-copy">The arches stay at the bottom of the app so you can see what needs attention at a glance.</p><div className="arch-guide" aria-label="Progress arch meanings">{progress.map((item) => <div className="arch-guide-item" key={item.label}><span className="arch-guide-code">{item.label}</span><span className="arch-guide-name">{item.name}</span></div>)}</div><button type="button" className="onboarding-action" onClick={completeOnboarding}>Start using Evia <span aria-hidden="true">→</span></button><div className="onboarding-dots" aria-hidden="true"><span /><span /><span className="is-current" /></div></>}
          </div>
        </section>
      )}
    </main>
  );
}
