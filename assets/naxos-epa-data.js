(()=>{
"use strict";
const N=window.NaxosDemoEPA=window.NaxosDemoEPA||{};
const q=(question,options,answer,ksb,why="")=>({question,options,answer,ksb,why});
const BRICK_MCQ=[
q("Which document normally sets out the safe sequence and controls for a task?",["Method statement","Delivery ticket","Timesheet","Snagging list"],0,"K3"),
q("What is the main purpose of a risk assessment?",["To identify hazards and decide controls","To order materials","To calculate wages","To record brick quantities"],0,"K3"),
q("Which control is most appropriate for reducing inhalation of silica dust when cutting masonry?",["Suitable dust suppression or extraction and RPE","Work faster","Open a window only","Wear gloves only"],0,"K2"),
q("What does COSHH mainly deal with?",["Hazardous substances and exposure controls","Scaffold design","Brick bonds","Setting-out dimensions"],0,"K1"),
q("Why should waste be segregated on site?",["To support safe disposal, reuse and recycling","To make skips heavier","To avoid measuring materials","To replace a risk assessment"],0,"K4"),
q("What is a main purpose of wall insulation?",["Reduce heat transfer","Increase mortar strength","Replace wall ties","Prevent all movement"],0,"K5"),
q("What is the main purpose of a DPC?",["Resist moisture passing through the construction","Support a lintel","Tie wall leaves together","Control mortar colour"],0,"K8"),
q("Which document is most likely to give dimensions and locations for the work?",["Construction drawing","Payslip","Toolbox register","Delivery receipt"],0,"K10"),
q("Why is a gauge rod useful?",["To keep courses and heights consistent","To test electrical tools","To measure mortar strength","To sharpen tools"],0,"K21"),
q("What is the main purpose of wall ties in a cavity wall?",["Connect the two leaves while maintaining the cavity","Replace insulation","Support scaffold boards","Form the DPC"],0,"K22"),
q("Why are weep holes used above some openings?",["To allow water collected by a cavity tray to drain out","To hold insulation in place","To ventilate the room","To fix the lintel"],0,"K22"),
q("What is the purpose of a cavity tray?",["To direct moisture to the outer leaf and weep holes","To increase brick strength","To replace the lintel","To support the inner leaf"],0,"K22"),
q("What is the best reason for checking line, level and plumb regularly?",["To identify and correct inaccuracies as work progresses","To reduce the number of wall ties","To avoid using drawings","To make mortar set faster"],0,"K21"),
q("What does stretcher bond mainly show on the face of a wall?",["Stretchers overlapping by approximately half a unit","Headers only","Vertical joints aligned in every course","Bricks laid on edge only"],0,"K15"),
q("Which bond alternates headers and stretchers within each course?",["Flemish bond","Stretcher bond","Stack bond","Broken bond"],0,"K15"),
q("Why are movement joints provided in masonry?",["To accommodate movement and reduce uncontrolled cracking","To drain the cavity","To hold insulation","To replace DPC"],0,"K19"),
q("What is efflorescence?",["Salt deposits that can appear on masonry surfaces","A type of wall tie","A mortar joint profile","A lintel defect"],0,"K24"),
q("Why should bricks and blocks be protected from frost and saturation?",["To reduce damage and poor performance","To make them heavier","To remove the need for mortar","To improve colour matching only"],0,"K25"),
q("What is the purpose of a lintel?",["Support masonry over an opening","Tie two wall leaves together","Stop rising damp","Set mortar ratio"],0,"K8"),
q("Before using a powered cutting tool, what should be checked first?",["That it is suitable, guarded and in safe condition","That the wall is already complete","That mortar is fully dry","That the delivery note is signed"],0,"K14"),
q("What is meant by gauging mortar materials?",["Measuring ingredients consistently to the required ratio","Adding water without measuring","Mixing any available materials","Judging colour only"],0,"K20"),
q("Why should a mortar ratio be followed?",["To achieve the specified performance and consistency","To make every mix the same colour only","To eliminate curing time","To avoid using clean water"],0,"K20"),
q("Which joint finish is formed with a rounded jointing tool?",["Half-round","Flush","Recessed","Weather-struck"],0,"K17"),
q("Why is a recessed joint generally more exposed than a half-round joint?",["It leaves the mortar face set back from the masonry face","It contains no cement","It has no bed joints","It removes the need for pointing"],0,"K17"),
q("What should happen if a drawing conflicts with the work on site?",["Stop and seek clarification before proceeding","Choose whichever dimension is easiest","Ignore the drawing","Continue and correct it later"],0,"K10"),
q("Why are openings checked for size and position during setting out?",["So components and finishes can fit the required dimensions","To reduce the number of courses","To avoid using profiles","To change the bond automatically"],0,"K21"),
q("What is a key reason for keeping the cavity clear?",["To reduce moisture bridging and maintain performance","To increase mortar waste","To support scaffold","To replace insulation"],0,"K22"),
q("How should rigid cavity insulation generally be fitted?",["Tightly jointed and positioned as specified without gaps","Loose with large gaps","Only at corners","Against the outer face regardless of specification"],0,"K22"),
q("Why is fire stopping installed in required locations?",["To restrict the spread of fire and smoke through concealed spaces","To replace wall ties","To increase opening width","To colour-code the cavity"],0,"K22"),
q("What is the best response to finding defective brickwork?",["Identify the cause and use an appropriate repair method","Cover it immediately","Ignore it if it is above ground","Add more wall ties"],0,"K24"),
q("Why should hand tools be cleaned and stored correctly?",["To maintain condition, safety and service life","To change their size","To avoid PPE","To increase mortar strength"],0,"K13"),
q("When cutting a brick by hand, what helps achieve an accurate cut?",["Measure, mark and use the correct tool and technique","Strike it randomly","Soak every brick first","Remove PPE"],0,"K29"),
q("What is the purpose of a return in masonry?",["It forms a change in wall direction and helps create a stable junction","It drains a cavity tray","It replaces a lintel","It is a mortar joint finish"],0,"K22"),
q("Why is clear construction terminology important when speaking with the team?",["It reduces misunderstanding about the work","It replaces drawings","It removes the need for supervision","It changes tolerances"],0,"K26"),
q("What is a good example of effective teamwork?",["Coordinating work and communicating with other trades","Working without telling anyone","Ignoring sequencing","Only checking your own area"],0,"K27"),
q("What should you do if you are unsure how to carry out an unfamiliar task safely?",["Ask for guidance or training before continuing","Guess and continue","Remove the controls","Wait until the end of the day"],0,"K1"),
q("Why is inclusion important on a construction site?",["People should be treated fairly and able to contribute safely","It removes all site rules","It means everyone does the same job","It replaces competence requirements"],0,"K28"),
q("What is the most appropriate action if you or a colleague is struggling with wellbeing?",["Use available support and raise concerns appropriately","Ignore it","Post about it publicly","Leave the site without telling anyone"],0,"K31"),
q("Why are materials estimated before work starts?",["To plan sufficient resources and reduce shortages and waste","To avoid reading drawings","To replace quality checks","To remove the need for storage"],0,"K12"),
q("What is the safest approach when work at height is required?",["Use the planned access and fall-prevention controls","Stand on loose materials","Climb the wall","Work without checking the platform"],0,"K1")
];
const BRICK_INTERVIEW=[
{theme:"Defects & repair",question:"Tell me about a time you identified a defect or problem in brickwork and what you did about it.",cover:["What the defect or problem was","How you identified the likely cause","What repair or correction you carried out","How you checked the finished result"],ksbs:["K24","S16","B3"]},
{theme:"Protection",question:"Explain how you protect materials and finished masonry from weather or site damage.",cover:["What needed protecting","The risk from frost, water or site activity","What protection you used","How you checked it remained effective"],ksbs:["K25","S17","B3"]},
{theme:"Mortar",question:"Tell me about a mortar mix you have used and how you made sure the ratio and consistency were right.",cover:["The specified ratio","How the materials were gauged","How the mortar was mixed","How you knew the consistency was suitable"],ksbs:["K20","S14"]},
{theme:"Information",question:"Give an example of how you used a drawing, specification or site information to carry out your work.",cover:["What information you needed","Where you found it","How it affected your setting out or work","What you did if anything was unclear"],ksbs:["K10","S5"]},
{theme:"Communication",question:"Tell me about a time you had to communicate clearly with another trade or member of the site team.",cover:["Who you communicated with","What construction terminology you used","How you made the message clear","How you confirmed it was understood"],ksbs:["K26","S18"]},
{theme:"Teamwork",question:"Describe a job where teamwork affected the quality or sequence of your brickwork.",cover:["Who else was involved","How the work was sequenced","What you did to support the wider team","What the result was"],ksbs:["K27","S20","B6"]},
{theme:"Ownership",question:"Tell me about a time you checked your own work and corrected something before it became a bigger problem.",cover:["What you checked","What was wrong or at risk","What you changed","How you confirmed the standard afterwards"],ksbs:["B3","S11"]},
{theme:"Inclusion",question:"Explain how you make sure people are treated fairly and respectfully when you are working with them.",cover:["A realistic workplace example","How you considered another person's needs or viewpoint","What inclusive behaviour looked like","Why it mattered to the team"],ksbs:["K28","S19","B4"]},
{theme:"Development",question:"Tell me about something new you learned or practised and how it improved your work.",cover:["What you learned","How you practised it","What feedback you used","How it improved your competence"],ksbs:["B5"]},
{theme:"Wellbeing",question:"If you or someone else was struggling physically or mentally at work, what support could you use?",cover:["What signs might concern you","How you would respond appropriately","Where support could be found","Why wellbeing is part of safe working"],ksbs:["K31","S21","B1"]}
];
const BRICK_PRACTICAL=[
{title:"Safe setup and controls",desc:"Set up safely before masonry work begins.",checks:["Identify the main hazards and controls","Select suitable PPE and RPE","Prepare and maintain a safe work area","Check tools and equipment before use"],ksbs:["K1","K2","K3","S1","S2","S7","B1"]},
{title:"Set out cavity wall and opening",desc:"Set out from the drawing and maintain accurate line, level, square and gauge.",checks:["Read the required dimensions from the drawing","Set out wall lines and opening position","Use profiles, level, square and gauge correctly","Re-check dimensions before building"],ksbs:["K10","K21","S5","S10"]},
{title:"Build cavity wall accurately",desc:"Build the two leaves, return and opening while keeping the cavity clean.",checks:["Maintain stretcher bond and correct lap","Keep line, level, plumb and gauge within tolerance","Form the return and opening accurately","Keep the cavity clean while building"],ksbs:["K22","S11","B3"]},
{title:"Opening, lintel and special courses",desc:"Rehearse the opening details and special brickwork required by the practical task.",checks:["Install or position the lintel to the task information","Set out the soldier course accurately","Form the brick-on-edge sill correctly","Check the opening dimensions and finish"],ksbs:["K22","K23","S11","B3"]},
{title:"Cavity components",desc:"Rehearse the components controlling moisture, thermal performance and fire.",checks:["Position wall ties and retaining clips correctly","Fit insulation tightly without avoidable gaps","Install DPC, cavity tray and weep holes to the task","Include cavity closure and fire stopping where specified"],ksbs:["K8","K22","S11"]},
{title:"Finishing, cutting and quality",desc:"Rehearse final workmanship checks, joint finishes, cutting and protection.",checks:["Produce the specified mortar joint finishes","Measure and cut masonry accurately","Identify and correct simple defects","Protect the completed work from damage"],ksbs:["K17","K24","K25","K29","S12","S15","S16","S17","B3"]}
];
const BRICK_FAULTS=[
{title:"Cavity bridge",question:"You find mortar droppings bridging the cavity immediately below the insulation. What is wrong, what could it cause, and what would you do?",ksbs:["K22","K24","S16"]},
{title:"Insulation gap",question:"Two insulation boards have a visible gap between them. What could this affect and how would you correct it before continuing?",ksbs:["K5","K22","S11"]},
{title:"Cavity tray",question:"The cavity tray does not turn up at the back and has no clear route to the weep holes. What is the risk and what should be corrected?",ksbs:["K22","S11"]},
{title:"Opening out of plumb",question:"One reveal is running out of plumb as the wall rises. What checks would you make and how would you correct it?",ksbs:["K21","K22","S10","S11","B3"]}
];
const BRICK_DRAWING=[
{title:"Opening",question:"The drawing gives an opening width of 900 mm. Before building above it, which measurements would you independently check?",points:["Opening width at more than one height","Plumb of both reveals","Level and bearing position for the lintel","Overall wall line, level, gauge and square"],ksbs:["K10","K21","S5","S10"]},
{title:"Setting out",question:"A drawing gives the wall position, return and opening. What should you establish before laying the first course?",points:["Datum and wall lines","Opening position and width","Square at the return","Profiles, gauge and level reference"],ksbs:["K10","K21","S10"]},
{title:"Cavity detail",question:"A detail shows DPC, cavity tray, weep holes and insulation around an opening. What information must you take from it before building?",points:["Heights and positions","Component sequence","Required laps or closures","How moisture drains to the outer leaf"],ksbs:["K8","K10","K22","S5","S11"]}
];
const BRICK_PROFILE={standard:"ST0095 v1.2",title:"Bricklayer",pathway:"",pathwayTitle:"Bricklayer",mcq:{minutes:60,questions:40,failMax:24,passMax:32},interview:{minutes:60,questions:10},practical:{hours:12,minQuestions:6},mcqBank:BRICK_MCQ,interview:BRICK_INTERVIEW,practicalAreas:BRICK_PRACTICAL};
N.data={BRICK_PROFILE,BRICK_FAULTS,BRICK_DRAWING};
window.NaxosBrickProfile=BRICK_PROFILE;
})();
