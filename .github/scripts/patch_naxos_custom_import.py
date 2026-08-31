from pathlib import Path

path = Path('index.html')
text = path.read_text()
start_marker = '    function buildNaxosKsbCourse(categories, registry, evidenceRules) {'
end_marker = '    async function importNaxosKsbPack(pointer) {'
start = text.find(start_marker)
end = text.find(end_marker, start)
if start < 0 or end < 0:
    raise SystemExit('Could not locate the Naxos KSB importer boundaries')

new = r"""    function applyNaxosKsbCustomisations(categories, customisations) {
      const cloned = JSON.parse(JSON.stringify(categories || []));
      const custom = customisations && typeof customisations === 'object' ? customisations : {};
      const titles = custom.titles && typeof custom.titles === 'object' ? custom.titles : {};
      const taskEdits = custom.taskEdits && typeof custom.taskEdits === 'object' ? custom.taskEdits : {};

      cloned.forEach((category, categoryIndex) => {
        const categoryTitle = cleanText(titles.category?.[String(categoryIndex)]);
        if (categoryTitle) category.title = categoryTitle;
        (category.subcategories || []).forEach((subcategory, subcategoryIndex) => {
          const subKey = `${categoryIndex}:${subcategoryIndex}`;
          const subcategoryTitle = cleanText(titles.subcategory?.[subKey]);
          if (subcategoryTitle) subcategory.title = subcategoryTitle;
          (subcategory.tasks || []).forEach((task, taskIndex) => {
            const taskKey = `${categoryIndex}:${subcategoryIndex}:${taskIndex}`;
            const taskTitle = cleanText(titles.task?.[taskKey]);
            if (taskTitle) task.title = taskTitle;
            const evidence = taskEdits[taskKey]?.evidence;
            if (evidence && typeof evidence === 'object') task.naxosEvidenceOverride = evidence;
          });
        });
      });

      const customTasks = Array.isArray(custom.customTasks) ? custom.customTasks : [];
      customTasks.forEach((customTask, index) => {
        const categoryIndex = Number(customTask?.categoryIndex);
        const subcategoryIndex = Number(customTask?.subcategoryIndex);
        if (!Number.isInteger(categoryIndex) || !Number.isInteger(subcategoryIndex)) return;
        const subcategory = cloned[categoryIndex]?.subcategories?.[subcategoryIndex];
        if (!subcategory) return;
        const title = cleanText(customTask?.title);
        const targets = Array.isArray(customTask?.targets) ? customTask.targets.map(cleanText).filter(Boolean) : [];
        if (!title || !targets.length) return;
        const evidence = customTask?.evidence && typeof customTask.evidence === 'object' ? customTask.evidence : null;
        subcategory.tasks = Array.isArray(subcategory.tasks) ? subcategory.tasks : [];
        subcategory.tasks.push({
          id: cleanText(customTask?.id) || `custom-${categoryIndex}-${subcategoryIndex}-${index + 1}`,
          title,
          ksbTargets: targets,
          evidenceRequirements: Array.isArray(customTask?.evidenceRequirements) ? customTask.evidenceRequirements.map(cleanText).filter(Boolean) : [],
          evidenceProfile: cleanText(evidence?.profileId) || 'knowledge',
          naxosEvidenceOverride: evidence,
          naxosCustom: true
        });
      });

      return cloned;
    }

    function naxosResolvedProfile(task, profiles) {
      const override = task?.naxosEvidenceOverride && typeof task.naxosEvidenceOverride === 'object' ? task.naxosEvidenceOverride : null;
      const overrideProfileId = cleanText(override?.profileId);
      const base = profiles[overrideProfileId] || profiles[task?.evidenceProfile] || profiles.knowledge || {};
      if (!override) return base;
      const preferred = Array.isArray(override.preferred) ? override.preferred : null;
      return preferred ? { ...base, preferred } : base;
    }

    function buildNaxosKsbCourse(categories, registry, evidenceRules) {
      const profiles = evidenceRules?.profiles || {};
      return (categories || []).slice(0, 5).map((category) => ({
        label: cleanText(category?.title) || `Route ${category?.id || ''}`.trim(),
        children: (category?.subcategories || []).slice(0, 5).map((subcategory) => ({
          label: cleanText(subcategory?.title) || `Section ${subcategory?.id || ''}`.trim(),
          children: (subcategory?.tasks || []).slice(0, 5).map((task) => {
            const profile = naxosResolvedProfile(task, profiles);
            const requirementItems = naxosTaskRequirements(task, registry, profile);
            return {
              label: cleanText(task?.title) || cleanText(task?.id) || 'Task',
              recommended: naxosPreferredOption(profile),
              alternative: naxosAlternativeOption(profile),
              requirementsHeading: 'What the evidence must show or explain',
              requirementItems,
              requirements: requirementItems.join('\n'),
              ksbTargets: Array.isArray(task?.ksbTargets) ? task.ksbTargets.map(cleanText).filter(Boolean) : [],
              evidenceRequirements: Array.isArray(task?.evidenceRequirements) ? task.evidenceRequirements.map(cleanText).filter(Boolean) : [],
              naxosCustom: Boolean(task?.naxosCustom)
            };
          })
        }))
      })).filter((category) => category.label && category.children.length);
    }

"""
text = text[:start] + new + text[end:]

old_import = '      const items = buildNaxosKsbCourse(categories, registry, evidenceRules);'
new_import = "      const customisedCategories = applyNaxosKsbCustomisations(categories, pointer.customisations);\n      const items = buildNaxosKsbCourse(customisedCategories, registry, evidenceRules);"
if old_import not in text:
    raise SystemExit('Expected Naxos import call was not found')
text = text.replace(old_import, new_import, 1)
path.write_text(text)
