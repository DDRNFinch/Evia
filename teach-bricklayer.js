/* Teach me: Bricklayer (ST0095). Two lessons per unit that between them cover the unit's KSBs. Mixing mortar is in teach.js. */
(function(){
  const {L,Q,T,M,O,lesson,unit,add}=window.EVIA_TEACH;
  add("bricklayer",[
    unit("Jointing Styles",["Jointing styles","Joint protection"],[
      lesson("bk-joint1","Joint finishes","Flush, half round, weather struck and recessed",[
        L("Four common finishes","Flush: rubbed flat with the face. Half round (bucket handle): a curved hollow pressed in with a jointer. Weather struck: slopes in at the top so rain runs off. Recessed: raked back a few millimetres, square, for a shadow effect.","joints"),
        M("Match the finish to its description",[["Flush","Flat with the brick face"],["Half round","A curved hollow made with a jointer"],["Weather struck","Slopes so rain runs off"],["Recessed","Raked back square, leaving a shadow"]]),
        Q("Which finish is designed to shed rain on an exposed wall?",["Weather struck","Recessed","A joint left raked out","An unfinished joint"],"The slope throws water off the brick below."),
        Q("When do you tool the joints?",["When the mortar is thumbprint hard","Straight away while it’s very wet","The next day","Once it’s fully set"],"Too wet and it smears; too hard and it won’t take the shape."),
        T("Recessed joints are a good choice for walls in very exposed, wet places.",false,"The ledge they leave can hold water and frost. Use them where the specification allows."),
        O("Put the finishing steps in order",["Let the mortar go thumbprint hard","Tool the joints with the jointer","Lightly brush off loose mortar","Check the finish is even along the wall"],"Tool at the right time, then tidy and check.")
      ]),
      lesson("bk-joint2","Protection, PPE and teamwork","Protecting work and each other",[
        L("Protect new work","New brickwork can be damaged by frost, rain and other trades. Cover it with hessian and polythene or frost covers, don’t lay bricks at about 3 °C and falling, and protect corners, reveals and sills from barrows and deliveries."),
        Q("Frost is forecast overnight. What do you do with today’s brickwork?",["Cover it with frost covers or hessian and polythene","Leave it: it’ll be fine","Wet it down","Rake out the joints"],"Frost can damage mortar that hasn’t gained strength."),
        Q("Why protect finished corners and reveals?",["Barrows and materials can chip them","It looks tidy","To keep them warm","It isn’t needed"],"Damage costs time to put right and spoils the finish."),
        M("Match the PPE to what it protects against",[["Gloves","Cement burns and cuts"],["Eye protection","Chips and splashes"],["Hard hat","Falling objects"],["Safety boots","Heavy things landing on your feet"]]),
        Q("Your labourer can’t keep up with two bricklayers. What’s a good team response?",["Help out or raise it so the work can be reorganised","Complain to others","Slow down on purpose","Ignore it"],"Good teams sort problems out together."),
        T("Good teamwork includes thinking about the trades who come after you.",true,"Leave work clean, protected and accurate for the next trade.")
      ])
    ]),
    unit("Repair brick walling","Brick repairs",[
      lesson("bk-repair1","Spotting defects and repairing","What’s wrong and how to put it right",[
        L("Common defects","Spalled or cracked faces (usually frost), white salts (efflorescence), crumbling joints (weathering) and cracks through the joints (movement or settlement). Some cracks point to structural problems: report them."),
        M("Match the defect to its likely cause",[["Spalled brick face","Frost and water getting in"],["White salt deposits","Efflorescence as the wall dries"],["Stepped crack through joints","Movement or settlement"],["Crumbling joints","Weathered mortar needing repointing"]]),
        O("Put the steps for replacing a brick in order",["Check it’s safe and set up the work area","Cut out the brick and mortar with a plugging chisel and club hammer","Clean out and dampen the hole","Butter the new brick and bed it in","Point the joints to match"],"Clean, damp and well-filled joints give a sound repair."),
        Q("What should you match when repairing?",["Brick colour, size and texture, the mortar and the joint finish","Just the size","Nothing: it’s only a repair","Only the joint finish"],"A good repair is hard to spot."),
        T("A long stepped crack can be patched without telling anyone.",false,"It may be a structural problem. Report it so it can be checked.")
      ]),
      lesson("bk-repair2","Safe systems, asbestos and the environment","Working safely on existing buildings",[
        M("Match each document to what it does",[["Risk assessment","Finds the hazards and how to control them"],["Method statement","Sets out the safe way to do the job, step by step"],["Toolbox talk","A short safety briefing"],["Site induction","The site rules when you start"]]),
        L("Asbestos","Buildings built or refurbished before 2000 may contain asbestos, for example in old boards, pipe lagging, flues and cement sheets. Breathing in the fibres can cause fatal diseases years later. If you suspect it: stop, don’t disturb it, keep others away and tell your supervisor."),
        Q("You uncover an old grey flue pipe that might contain asbestos. What do you do?",["Stop, leave it alone and tell your supervisor","Cut it out carefully","Sweep up the dust","Carry on wearing a dust mask"],"Only trained, licensed people deal with it."),
        Q("What does “perp” mean?",["The vertical joint between bricks","A type of brick","A spirit level","The top course"],"Short for perpendicular joint. Using trade words helps you communicate clearly."),
        Q("Sound bricks come out during a repair. What’s best?",["Clean and reuse them, or recycle","Put them all in the skip","Leave them on site","Bury them"],"Reusing materials cuts waste and cost."),
        T("Keeping a safe, tidy work area is part of every repair job.",true,"Barrier off the area below work, keep walkways clear and clean up as you go.")
      ])
    ]),
    unit("Basic Brick wall","Setting out a solid wall",[
      lesson("bk-basic1","Building a simple wall","Ends first, line, gauge and capping",[
        L("The basics","Build on a clean, level base. Dry-bond the first course, build the ends first, then run in the middle to a line. Keep courses level, perps plumb, and gauge at 75 mm a course (65 mm brick plus a 10 mm joint)."),
        Q("What is the standard gauge for one brick course?",["75 mm","65 mm","100 mm","85 mm"],"A 65 mm brick plus a 10 mm bed joint."),
        O("Put building a simple wall in order",["Check the base is clean and level","Dry-bond the first course","Build up the ends","Run in the courses to the line","Finish with a capping or coping"],"The ends control the line, so they go up first."),
        Q("Why build the ends first?",["They hold the line so the middle comes out straight and level","It’s quicker to finish","So the middle can be skipped","It uses less mortar"],"Line and pins stretched between the ends guide every course."),
        L("Capping and coping","The top of a wall needs protecting from rain. Brick-on-edge capping or a coping stone with a drip does the job, often with a DPC under it to stop water soaking down."),
        T("A coping with a drip throws water clear of the wall face.",true,"The drip stops water running back and staining the wall.")
      ]),
      lesson("bk-basic2","Tools, buildings and safety","Using and caring for your tools",[
        M("Match the tool to its job",[["Spirit level","Checking level and plumb"],["Line and pins","Keeping courses straight"],["Bolster and club hammer","Cutting bricks"],["Brick jointer","Finishing joints"]]),
        Q("How should you look after your trowel at the end of the day?",["Clean off the mortar and store it dry","Leave mortar on it to protect it","Leave it in water overnight","Throw it in the van"],"Clean, dry tools last longer and work better."),
        Q("The head of your club hammer is loose. What do you do?",["Stop using it and get it repaired or replaced","Tape it","Carry on carefully","Use it for light work only"],"A flying hammer head can seriously injure someone."),
        L("How a building works","Foundations spread the load into the ground. Walls carry floors and roofs. A DPC stops damp rising. Insulation keeps heat in, and cavity trays direct water out."),
        M("Match the part to what it does",[["Foundation","Spreads the load into the ground"],["DPC","Stops damp rising"],["Insulation","Keeps the heat in"],["Cavity tray","Directs water out of the cavity"]]),
        T("Putting health and safety first means stopping work if something is unsafe.",true,"No job is worth an injury. Stop and report it.")
      ])
    ]),
    unit("Set out solid walling","Setting out a solid wall",[
      lesson("bk-setout1","Setting out from drawings","Reading the drawing and getting it square",[
        L("Setting out","Read the drawing for dimensions, bond and levels. Transfer them to the base with a tape, line and pins and a square. Dry-bond the first course to check the bond and plan any cuts."),
        Q("Why dry-bond the first course?",["To check the bond and plan cuts before using mortar","To save mortar","It’s quicker","To test the bricks"],"It shows how the bond works over the length."),
        Q("How can you check a corner is square?",["Measure 3, 4 and 5 (or compare the diagonals)","Look at it","Use a level","Count the bricks"],"A 3-4-5 triangle always has a right angle."),
        M("Match the feature to its description",[["Attached pier","Bonded into a wall to strengthen it"],["Isolated pier","Stands on its own"],["Banding","A course of contrasting brick"],["Projecting course","Bricks set out from the face"]]),
        L("Digital drawings","Some sites use digital models (BIM), tablets and lasers for setting out. The principle is the same: accurate information, checked before you build."),
        T("If the drawing and the site don’t match, build what looks right.",false,"Stop and ask. Building to a guess can be costly to put right.")
      ]),
      lesson("bk-setout2","Safe, clear and owning your work","Slips, communication and responsibility",[
        Q("What causes most slips and trips on site?",["Untidy work areas and trailing materials","Wearing boots","Good lighting","Signs"],"Keep walkways clear and stack materials tidily."),
        Q("Which is the clearest message to your labourer?",["Can I have two spots of mortar on the left-hand corner, please?","Get me some stuff","More!","You know what I need"],"Say what, how much and where."),
        M("Match the trade word to its meaning",[["Perp","Vertical joint"],["Bed joint","Horizontal joint"],["Stretcher","Long face of a brick"],["Header","Short end of a brick"]]),
        Q("A few courses up, you notice your wall is 10 mm out of gauge. What do you do?",["Own it: correct it now or tell your supervisor","Hide it in the joints","Blame the bricks","Carry on"],"Taking ownership means putting it right early."),
        T("Situational awareness means keeping an eye on what’s going on around you.",true,"Watch for plant, edges, trenches and people.")
      ])
    ]),
    unit("Build solid walling","Brick bonds",[
      lesson("bk-bond1","Brick bonds","Stretcher, English, Flemish and garden wall",[
        L("Why bond?","Bond is the pattern of bricks that stops vertical joints lining up, spreading the load and making the wall strong. Half-brick walls use stretcher bond. One-brick walls use English, Flemish or garden wall bonds.","bonds"),
        M("Match the bond to its pattern",[["Stretcher bond","All stretchers, half lap"],["English bond","Alternate courses of headers and stretchers"],["Flemish bond","Headers and stretchers alternate in every course"],["English garden wall","Three stretcher courses to one header course"]]),
        Q("What does a queen closer do in English or Flemish bond?",["Sets up the quarter lap next to the quoin header","Finishes the coping","Fills the cavity","Replaces a damaged brick"],"It’s a brick cut in half along its length."),
        Q("What is broken bond?",["Using cut bricks where the length doesn’t fit whole bricks","A bond that has fallen down","Mixing colours","Leaving out headers"],"Place the broken bond in the middle or under an opening where it’s least seen."),
        L("Soldiers and brick-on-edge","A soldier course is bricks stood on end. Brick-on-edge is bricks laid on their edge, often as a capping. Set them out from the centre so any cuts are equal."),
        T("Soldier courses need careful gauge so the perps stay plumb and even.",true,"Any error shows straight away in a soldier course.")
      ]),
      lesson("bk-bond2","Drawings and the environment","Information and waste",[
        L("Drawings and specifications","Drawings show plans, elevations and sections at a scale, with a key. The specification says the materials and standards: brick type, mortar mix and joint finish."),
        Q("Where would you find the mortar mix and joint finish?",["In the specification","On the site hoarding","On the delivery note","Nowhere: choose yourself"],"The spec sets the standard for the job."),
        Q("On a 1:20 drawing, a pier measures 22 mm wide. What is its real width?",["440 mm","220 mm","22 mm","2.2 m"],"22 × 20 = 440 mm."),
        L("Look after the environment","Order the right amount, cut carefully, reuse offcuts, separate waste into the right skips and never wash cement or mortar into drains or watercourses."),
        M("Match the waste to the right action",[["Timber pallets","Return to the supplier or recycle"],["Mixer washout water","Let it settle; never pour it into drains"],["Brick offcuts","Reuse or recycle as hardcore"],["Plastic wrap","Separate for recycling"]]),
        T("It’s fine to wash out the mixer into the nearest drain.",false,"Cement washout pollutes water. Use a washout area.")
      ])
    ]),
    unit("Set out Cavity Walling","Cavity wall setting out",[
      lesson("bk-cset1","Setting out a cavity wall","Profiles, gauge rods, DPCs and trays",[
        L("Cavity walls","Two leaves, usually brick outside and block inside, with a cavity between them, tied together. Set out with profiles and lines, check square and level, and use a gauge rod for course heights and openings.","cavity"),
        M("Match the item to its job",[["Profile","Holds the lines at corners"],["Gauge rod","Marks course heights and opening levels"],["DPC","Stops damp rising"],["Weep holes","Let water out above trays"]]),
        Q("At least how far above ground level should the DPC be?",["150 mm","50 mm","75 mm","300 mm"],"At least 150 mm above finished ground level."),
        Q("Where do cavity trays go?",["Over openings and where the cavity is bridged, with weep holes","At the bottom of the foundations","Inside the blockwork","Only at the roof"],"Trays catch water in the cavity and direct it out."),
        O("Put setting out in order",["Check the drawings and levels","Set up profiles and lines","Check it’s square","Mark openings with the gauge rod","Lay the first courses and the DPC"],"Accurate setting out saves problems higher up.")
      ]),
      lesson("bk-cset2","Materials, quantities and safety","Estimating and the regulations",[
        L("Materials","Bricks and blocks, mortar, DPC, wall ties, plasticisers, concrete and steel lintels. Efflorescence is white salts appearing as new brickwork dries; it usually brushes off."),
        Q("A half-brick outer leaf needs about 60 bricks per m². How many for 12 m²?",["720","600","60","1,200"],"60 × 12 = 720, then add a little for waste."),
        Q("Blocks need about 10 per m². How many for 12 m²?",["120","12","60","240"],"10 × 12 = 120."),
        Q("Wall ties are normally spaced at about…",["900 mm across and 450 mm up, closer at openings","100 mm apart","Only at corners","2 m apart"],"Extra ties go within 225 mm of openings."),
        M("Match the regulation to what it covers",[["COSHH","Hazardous substances like cement"],["PUWER","Work equipment is safe and maintained"],["Electrical safety","Checked leads and 110 V tools on site"],["RIDDOR","Reporting serious accidents"]]),
        T("Asking an experienced bricklayer to show you a technique is a good way to learn.",true,"Seeking learning and development is part of being a good apprentice.")
      ])
    ]),
    unit("Construct Cavity Walling","Cavity wall construction",[
      lesson("bk-cbuild1","Building the cavity wall","Ties, insulation and a clean cavity",[
        L("Building it","Build both leaves together and keep the cavity clean. Wall ties slope slightly down to the outer leaf with the drip in the middle. Fit insulation tight with no gaps. Cavity barriers and fire stopping close the cavity where needed."),
        Q("Which way should wall ties slope?",["Slightly down towards the outer leaf","Up towards the inner leaf","Always perfectly level","It doesn’t matter"],"So any water runs to the outside, never inwards."),
        Q("Why keep mortar droppings out of the cavity?",["They can bridge the cavity and let damp through","They weaken the ties","They block deliveries","It’s only for looks"],"A clean cavity keeps the inside dry."),
        O("Put building the leaves in order",["Lay the courses to the line","Place wall ties at the right spacing","Fit the insulation tight","Clean the ties and cavity as you go"],"Ties and insulation go in as the wall rises."),
        T("Fire stopping closes the cavity so fire and smoke can’t travel through it.",true,"It’s required at openings and edges set by the regulations and drawings.")
      ]),
      lesson("bk-cbuild2","Fire, wellbeing and warm buildings","Extinguishers, support and energy",[
        M("Match the extinguisher to its use",[["Water (red)","Wood, paper and fabric"],["Foam (cream)","Flammable liquids like petrol"],["CO2 (black)","Electrical fires"],["Dry powder (blue)","Many types, including gas"]]),
        Q("Which extinguisher must NOT be used on an electrical fire?",["Water","CO2","Dry powder","None of them"],"Water conducts electricity."),
        L("Warm, dry buildings","Insulation keeps heat in, airtightness stops draughts and ventilation lets moist air out. Gaps in insulation or unfilled joints make cold spots where heat escapes."),
        Q("What happens if insulation boards have gaps between them?",["Heat escapes and cold, damp spots can form","Nothing","The wall is stronger","The room is warmer"],"Tight joints matter."),
        L("Wellbeing","Long hours, stress and heavy lifting take a toll. Talk to someone, use your employer’s support, a mental health first aider, or the Construction Industry Helpline run by the Lighthouse charity."),
        Q("A workmate has seemed withdrawn for weeks. What’s a good step?",["Check in with them privately and point them to support","Joke about it","Ignore it","Tell everyone"],"A quiet word can make a big difference.")
      ])
    ]),
    unit("Cavity opening","Lintels",[
      lesson("bk-open1","Forming an opening","Reveals, closers, lintels and trays",[
        L("Openings","Set out with the gauge rod, build reveals plumb, close the cavity with an insulated cavity closer, and bed the lintel level with the right bearing. Fit the cavity tray with weep holes above it."),
        Q("What is the usual minimum end bearing for a lintel?",["150 mm each end","25 mm","50 mm in total","It doesn’t matter"],"Check the lintel maker’s instructions and the drawing."),
        M("Match the part to its job",[["Cavity closer","Closes and insulates the cavity at the reveal"],["Lintel","Carries the load over the opening"],["Brick-on-edge sill","Throws water off below the window"],["Soldier course","Bricks on end over the opening"]]),
        O("Put forming an opening in order",["Set out the width and height","Build the reveals plumb with closers","Bed the lintel level with the right bearing","Fit the cavity tray and weep holes","Continue the courses above"],"Openings need to be exactly the size on the drawing."),
        L("Movement joints","Long walls expand and shrink. Movement joints are left clear of mortar, filled with compressible filler and sealed, so the wall can move without cracking."),
        T("A movement joint should be filled solid with mortar.",false,"That stops it moving and defeats the point.")
      ]),
      lesson("bk-open2","Standards, modern methods and inclusion","Rules, new ways of building and fairness",[
        M("Match the standard to what it is",[["British Standards","Agreed ways to make and build things"],["Building Regulations","Legal rules for safe, warm buildings"],["Warranty standards","Quality rules new homes must meet"],["Specification","What this job must use"]]),
        L("Modern methods of construction","Precast lintels and components, corner profiles, timber or steel frames clad in brick and masonry support systems speed up building. Accuracy still matters."),
        Q("What are corner profiles for?",["Holding the lines accurately at corners","Replacing bricklayers","Measuring mortar","Supporting the roof"],"You build to the line they hold."),
        L("Equity, diversity and inclusion","Equity is fair treatment and access. Diversity is valuing differences. Inclusion means everyone feels part of the team. Banter aimed at someone’s background, gender, race, religion, disability or sexuality isn’t acceptable."),
        Q("“Banter” is making a colleague uncomfortable. What should you do?",["Challenge it or report it, and check they’re OK","Join in","Ignore it","Laugh along"],"Everyone deserves to feel safe at work."),
        T("Making new starters feel welcome helps build an inclusive culture.",true,"Small things, like introducing people, make a difference.")
      ])
    ]),
    unit("Gable end/Raked wall",["Raking cuts","Cutting bricks"],[
      lesson("bk-gable1","Raking walls and cuts","Setting out the rake and cutting to it",[
        L("Raked walls","A gable or raked wall follows a slope. Set out the rake with a line or template at the angle on the drawing, then cut each brick to the line so the rake is straight and the joints stay even."),
        O("Put cutting a brick by hand in order",["Measure and mark the cut on all faces","Put on eye protection and gloves","Score the line with a bolster and club hammer","Strike firmly to cut","Trim the edge with a brick hammer or scutch"],"Marking all faces keeps the cut square."),
        Q("Which hand tools are used to cut a brick?",["Bolster and club hammer","Trowel and level","Line and pins","Jointer and brush"],"A brick hammer or scutch trims the cut edge."),
        Q("How do you keep a raking cut line straight?",["Use a line or template set to the rake","Guess each brick","Follow the last brick","Use a level only"],"The line gives every cut the same angle."),
        T("Offer each brick up to the rake line and mark it before cutting.",true,"Measure twice, cut once.")
      ]),
      lesson("bk-gable2","Power tools, height and ownership","Cutting safely and working at height",[
        M("Match the power tool to a safe way to use it",[["Disc cutter","Trained operator, guard fitted, water or extraction"],["Mixer","Switched off before reaching in"],["Drill","Right bit and a secure grip"],["110 V tools","Safer voltage on site"]]),
        Q("You need to cut a block with a disc cutter. What is essential?",["Training, the guard on, dust control and eye, ear and dust protection","Just gloves","Cut quickly to avoid dust","Remove the guard to see better"],"Silica dust from cutting can cause serious lung disease."),
        L("Working at height and in confined spaces","Gables are built at height: use a proper scaffold with guard rails and toe boards, keep it clear and never overload it. Confined spaces like manholes need a permit and training: never go in without."),
        Q("The scaffold is missing a guard rail. What do you do?",["Don’t use it and report it","Work carefully near the edge","Fix it yourself with timber","Tie a rope across"],"Only competent people alter scaffolding."),
        T("Taking ownership means checking your own work and putting mistakes right.",true,"Your name is on your work.")
      ])
    ])
  ]);
})();
