/* Teach me: Trowel Occupations Level 3 (NVQ). Lessons follow the NVQ units and their outcomes. */
(function(){
  const {L,Q,T,M,O,lesson,unit,add}=window.EVIA_TEACH;
  add("trowel3",[
    unit("Unit 102: Health, safety and welfare","",[
      lesson("t3-102a","Safety law and your duties","Legislation, hazards and reporting",[
        L("Your duties","The Health and Safety at Work Act puts duties on employers and on you: take care of yourself and others, follow instructions and training, and don’t interfere with safety equipment. Report hazards you notice, especially ones created by changing conditions."),
        M("Match the law to what it covers",[["Health and Safety at Work Act","General duties of employers and employees"],["RIDDOR","Reporting serious injuries, diseases and dangerous occurrences"],["COSHH","Hazardous substances"],["Work at Height Regulations","Planning and protecting work at height"]]),
        Q("Conditions change and a new hazard appears. What should you do?",["Make it safe if you can and report it straight away","Wait until the next toolbox talk","Carry on","Tell a friend"],"New hazards need controlling before anyone gets hurt."),
        O("Put responding to an accident in order",["Make the area safe","Get first aid help","Report it to your supervisor","Record it in the accident book"],"Serious incidents may also need reporting under RIDDOR."),
        T("Employees have legal duties under health and safety law, not just employers.",true,"You must take reasonable care of yourself and others.")
      ]),
      lesson("t3-102b","Welfare, responsibility and security","Looking after people and the site",[
        L("Welfare and security","Sites must provide toilets, washing facilities, drinking water, somewhere to eat and rest, and somewhere to dry clothes. Security means signing in and out, wearing your ID, securing tools and materials, and challenging or reporting people who shouldn’t be there."),
        M("Match the situation to the right action",[["Someone you don’t know on site","Politely ask or report them"],["Leaving at the end of the day","Sign out and secure tools"],["Welfare cabin left dirty","Clean up after yourself"],["Unattended materials by the gate","Store them securely"]]),
        Q("Which shows personal responsibility for health and safety?",["Keeping your area tidy and wearing the right PPE","Leaving it to the supervisor","Removing guards to work faster","Ignoring signs"],"Safety is everyone’s job."),
        T("Welfare facilities are a legal requirement on construction sites.",true,"Set out in the Construction (Design and Management) Regulations.")
      ])
    ]),
    unit("Unit 234: Masonry cladding","Masonry cladding",[
      lesson("t3-234a","Cladding frames","Timber, steel and concrete frames",[
        L("Masonry cladding","Brick cladding is a non-structural outer leaf tied back to a frame. On timber frame, ties are fixed to the studs (not just the sheathing) over a breathable membrane, and gaps are left at sills, eaves and openings because the timber frame shrinks. On steel and concrete frames, brickwork sits on support angles with movement joints below them."),
        M("Match the frame to a key detail",[["Timber frame","Leave gaps for frame shrinkage"],["Concrete frame","Support angles with movement joints under them"],["Steel frame","Ties or channels fixed to the steel"],["Existing masonry","Tie or fix into the existing structure"]]),
        Q("Why leave gaps at sills and eaves when cladding a timber frame?",["The timber frame shrinks, so the brickwork must not be tight to it","To ventilate the roof","To save bricks","For cables"],"Differential movement can crack brickwork or lift sills."),
        Q("Where do cavity barriers go?",["Where the drawings require them to stop fire spreading in the cavity, such as at floors and party walls","Only at the bottom of the wall","Anywhere they fit","They aren’t needed with brick"],"Fire must not travel through the cavity."),
        T("A compressible movement joint is left under a support angle.",true,"It stops the frame’s load and movement crushing the brickwork below.")
      ]),
      lesson("t3-234b","Information, resources and protection","Planning cladding work",[
        M("Match the information to what it gives",[["Drawings","Layout, sizes and details"],["Specification","Materials and standards"],["Schedules","Lists, such as ties or lintels"],["Manufacturer’s information","How to fit their product"]]),
        Q("What should you check before starting cladding at height?",["Scaffold is inspected, loaded correctly and has edge protection","Only the weather","That the van is nearby","Nothing"],"Access equipment must be safe and suitable."),
        Q("Why estimate ties and support angles before starting?",["So the right quantity is on site and work isn’t held up","To guess the price","It isn’t needed","To fill the skip"],"Resources must match the method and programme."),
        T("Protecting finished cladding from other trades is part of the job.",true,"Cover sills and corners and protect from mortar splashes.")
      ])
    ]),
    unit("Unit 235: Masonry structures","Masonry structures",[
      lesson("t3-235a","Walls, openings and details","Cavity, solid and blockwork to specification",[
        L("Masonry structures","Build cavity walls, solid walls and blockwork to the drawings: correct bond and gauge, ties at the right spacing, clean cavities, trays and DPCs in the right places. Openings need correct reveals, closers, lintel bearings and trays. Cills, cappings and copings shed water with drips and DPCs."),
        M("Match the detail to its purpose",[["Coping with drip","Throws water clear of the wall"],["DPC under coping","Stops water soaking down"],["Cavity tray over lintel","Directs water out through weep holes"],["Cavity closer","Closes and insulates the reveal"]]),
        Q("What decides the bond and joint finish on a job?",["The drawings and specification","Personal preference","The weather","Whatever bricks arrive"],"Always work to the contract information."),
        O("Put a quality check in order",["Check gauge and level with the gauge rod","Check plumb and line","Check bond and perps","Check joint finish and cleanliness"],"Checking as you go stops errors growing."),
        T("Minor tolerance errors can be left if the next trade will cover them.",false,"Work to the specified tolerances.")
      ]),
      lesson("t3-235b","Time, resources and protection","Working to a programme",[
        Q("You’re behind the allocated time. What’s the best action?",["Tell your supervisor early and discuss options","Rush and cut corners","Say nothing","Work alone at night"],"Early warning lets the programme be adjusted."),
        M("Match the resource to an example",[["Materials","Bricks, blocks, mortar"],["Components","Lintels, trays, ties"],["Plant","Mixer, forklift"],["Labour","Bricklayers and labourers"]]),
        L("Protecting the work","Cover new work against rain and frost, protect clean faces from splashes, and keep the area tidy. Damage costs time and money to put right."),
        T("Knowing why the work matters (its purpose) helps you plan it properly.",true,"For example, a wall carrying a floor load must be built strictly to specification.")
      ])
    ]),
    unit("Unit 300: Planning work and resources","Planning work",[
      lesson("t3-300a","Planning the sequence","Activities, resources and programmes",[
        L("Planning work","Identify the activities, the resources each needs (labour, materials, plant, time) and the order they must happen in. A programme (often a bar chart) shows when each activity happens and which ones depend on others."),
        O("Put planning a job in order",["Read the drawings and specification","List the work activities","Work out resources for each","Plan the sequence and timings","Check it against the project programme"],"Good plans prevent delays."),
        M("Match the term to its meaning",[["Programme","Timeline of activities"],["Lead time","How long materials take to arrive"],["Dependency","One task must finish before another starts"],["Critical path","Tasks that can’t slip without delaying the job"]]),
        Q("Special bricks have a 6-week lead time. When should they be ordered?",["At least 6 weeks before they’re needed","The day before","When the wall starts","After the job"],"Plan around lead times."),
        T("Weather is an external factor that can affect a masonry programme.",true,"Rain and frost can stop bricklaying.")
      ]),
      lesson("t3-300b","When things change","Clarifying, adapting and reporting",[
        Q("The specified blocks aren’t available. What should you do?",["Seek advice on approved alternatives before using anything else","Use any similar block","Stop work for good","Guess"],"Alternatives must meet the specification and be approved."),
        Q("Another trade is running late and holding you up. What’s best?",["Tell your supervisor and suggest re-sequencing work","Complain to the other trade","Go home","Build round them"],"Report changed circumstances with a solution."),
        M("Match the situation to the right person to tell",[["Design question","Supervisor or site manager, to the designer"],["Delivery missing","Supervisor or buyer"],["Hazard on site","Supervisor straight away"],["Programme change","Site manager"]]),
        T("You should justify changes to the programme with reasons and evidence.",true,"Decision makers need to know why.")
      ])
    ]),
    unit("Unit 303: Methods of work",["Methods of work","Drawings and information"],[
      lesson("t3-303a","Getting the right information","Drawings, specifications and other sources",[
        M("Match the document to what it tells you",[["Drawings","Layout, sizes and details"],["Specification","Materials and workmanship standards"],["Schedules","Lists of repeated items"],["Manufacturer’s information","How to install their product"]]),
        Q("A detail isn’t clear on the drawing. What should you do?",["Get clarification from the supervisor or designer before building","Build what you think","Leave it out","Copy another job"],"Guessing can be expensive to put right."),
        Q("On a 1:50 drawing, a pier is 9 mm wide. What is its real width?",["450 mm","90 mm","45 mm","900 mm"],"9 × 50 = 450 mm."),
        L("Other sources","If project data isn’t enough, collect information from the manufacturer, British Standards, the Building Regulations, the site manager or technical helplines, then check it’s current."),
        T("The latest drawing revision should always be used.",true,"Check the revision letter and date.")
      ]),
      lesson("t3-303b","Choosing and communicating a method","Best use of resources",[
        L("Choosing a method","Compare possible methods on safety, quality, time, cost and what the contract and regulations require. Then confirm the chosen method and tell everyone involved, often through a method statement and briefing."),
        M("Match the factor to a question to ask",[["Safety","Can it be done without undue risk?"],["Quality","Will it meet the specification?"],["Time","Does it fit the programme?"],["Cost","Is it the best use of resources?"]]),
        Q("How is a chosen method best shared with the team?",["A method statement and a briefing before work starts","A text to one person","Nothing: they’ll work it out","A note on the skip"],"Everyone should know the method and why."),
        T("A cheaper method is always the best one.",false,"It must also be safe, meet the specification and fit the programme.")
      ])
    ]),
    unit("Unit 313: Architectural and decorative",["Arches","Chimneys and fireplaces","Decorative work","Curved and splayed walls"],[
      lesson("t3-313a","Arches","Terms, types and building on a centre",[
        L("Arch terms","Span: the width of the opening. Rise: height from springing line to the top of the soffit. Springing line: where the arch starts. Voussoirs: the wedge-shaped units. Key: the centre voussoir. Intrados: the inside curve; extrados: the outside curve."),
        M("Match the term to its meaning",[["Voussoir","Wedge-shaped unit of an arch"],["Key brick","Centre voussoir at the crown"],["Springing line","Where the arch starts to curve"],["Intrados","Inside curve (soffit) of the arch"]]),
        M("Match the arch to its description",[["Rough ringed","Uncut bricks with wedge-shaped joints"],["Axed","Bricks cut to a taper"],["Gauged","Rubbed bricks with very fine joints"],["Segmental","Part of a circle, less than a semicircle"]]),
        O("Put building an arch in order",["Set out the arch and springing points","Fix the centre (turning piece)","Mark out the voussoirs on the centre","Lay voussoirs from both sides to the key","Leave the centre until the mortar has hardened"],"Work evenly from both sides so the centre isn’t pushed over."),
        T("An arch should be built evenly from both springings towards the key.",true,"It keeps the load on the centre balanced.")
      ]),
      lesson("t3-313b","Chimneys and fireplaces","Flues, DPCs and the throat",[
        L("Chimney stacks","Flue liners are laid sockets up, joints sealed, and kept clean. DPC trays and flashings stop water getting in where the stack passes through the roof. Oversailing courses and a capping or cowl finish the top. Heights and distances follow Approved Document J."),
        L("Fireplaces","A constructional hearth protects the floor. Fire bricks line the fire. The throat and gather lead smoke smoothly into the flue."),
        M("Match the part to its job",[["Flue liner","Carries smoke and protects the stack"],["Flashing","Seals where the stack meets the roof"],["Gather","Narrows smoke into the flue"],["Hearth","Protects the floor from the fire"]]),
        Q("Which way should flue liners be laid?",["Sockets facing up","Sockets facing down","It doesn’t matter","Sideways"],"So condensation runs down inside and doesn’t leak out at joints."),
        T("Working on a chimney stack means working at height with scaffold protection.",true,"Plan access and edge protection before starting.")
      ]),
      lesson("t3-313c","Decorative features","Corbels, plinths, strings and specials",[
        L("Decorative brickwork","Corbelling projects courses out in steps; keep each step small (a quarter brick is common). Plinths and string courses use special shaped bricks. Dentil courses project alternate headers. Panels and patterns use contrasting bricks. Set out from the centre so cuts are hidden."),
        M("Match the feature to its description",[["Corbel","Courses stepped out from the face"],["Plinth","Projecting base course, often bevelled"],["String course","A horizontal band along the wall"],["Dentil course","Alternate headers projecting like teeth"]]),
        Q("Why limit how far each corbel course projects?",["Too much overhang makes the corbel unstable","It saves bricks","It looks old-fashioned","It doesn’t matter"],"Each course needs enough bearing on the one below."),
        Q("Why set out decorative panels from the centre?",["So the pattern is symmetrical and cuts are equal","It’s quicker","To use fewer bricks","It’s the law"],"Symmetry matters in decorative work."),
        T("Special bricks should be ordered early because they often have long lead times.",true,"Plan them into the programme.")
      ]),
      lesson("t3-313d","Curved and splayed walls","Radius rods, templates and squints",[
        L("Curved walls","For walls curved on plan, set out the centre and use a trammel (radius rod) to check each course. Tight curves may need headers or specials to avoid big joints; large radii can use stretchers. Check the face with a curved template."),
        L("Splayed walls","Walls that meet at an angle other than 90° use angle (squint) specials or cut bricks at the splay, keeping the bond right on both faces."),
        Q("What keeps a curved wall to the correct radius?",["A trammel or radius rod from the centre point","A straight edge","The spirit level alone","Eyeing it up"],"Check every course against the radius."),
        Q("Why use headers on a tight curve?",["Shorter units follow the curve without wide joints","They’re cheaper","They’re stronger","It’s tradition"],"Long stretchers leave gaps on tight curves."),
        T("A curved-in-elevation wall needs a template to check its shape.",true,"The template matches the curve on the drawing.")
      ])
    ]),
    unit("Unit 502: Working relationships","Working relationships",[
      lesson("t3-502a","Communicating well","Information, advice and goodwill",[
        L("Good working relationships","Give clear, accurate information at the right level of detail and urgency. Offer help and advice, and encourage questions. Respect other trades and the client."),
        M("Match the situation to a good response",[["Another trade asks about your work","Explain clearly and politely"],["Urgent safety issue","Tell the right person immediately"],["A client’s question","Answer or pass it to the site manager"],["A new starter seems lost","Offer help and invite questions"]]),
        Q("What’s the best way to share a change that affects another trade?",["Tell them early, clearly and in person, then confirm","Leave a note on their tools","Say nothing","Tell them afterwards"],"Early, clear communication builds trust."),
        T("Encouraging questions helps avoid mistakes.",true,"People are more likely to check if they feel welcome to ask.")
      ]),
      lesson("t3-502b","Disagreements and alternatives","Keeping trust and respect",[
        L("Resolving differences","Listen to understand, stay calm, focus on the work not the person, explain your reasons and look for a solution that meets the specification. If you can’t agree, involve the supervisor."),
        O("Put resolving a disagreement in order",["Listen to their view","Explain yours calmly with reasons","Look for options that meet the specification","Agree a way forward or involve the supervisor"],"Aim for an outcome everyone can accept."),
        Q("A plasterer says your reveals aren’t plumb. What’s the best response?",["Check them together and put right anything that’s out","Argue","Ignore them","Blame the bricks"],"Checking together keeps goodwill."),
        T("Winning the argument matters more than finding a solution.",false,"Goodwill and good work matter more.")
      ])
    ]),
    unit("Unit 701: Setting out","Setting out",[
      lesson("t3-701a","Setting out a building","Datums, profiles and square",[
        L("Setting out","Establish lines and levels from the site datum or temporary bench mark (TBM), transferred with an optical or laser level. Fix profiles clear of the excavation to hold building lines. Check right angles with 3-4-5 or by measuring diagonals."),
        M("Match the item to its purpose",[["TBM","Known level everything is measured from"],["Profile","Holds building lines clear of the dig"],["Laser level","Transfers levels accurately"],["Diagonal check","Confirms a rectangle is square"]]),
        Q("A rectangle is 8 m by 6 m. What should each diagonal measure?",["10 m","14 m","12 m","9 m"],"6-8-10 is double 3-4-5."),
        O("Put setting out in order",["Check the drawings and datum","Set out the main building line","Set out right angles and check diagonals","Fix profiles clear of the work","Check everything again before digging"],"Always check twice."),
        T("Profiles are fixed where the excavation won’t disturb them.",true,"They must stay in place while the foundations go in.")
      ]),
      lesson("t3-701b","Angles, curves and openings","Batters, trammels and gauge rods",[
        L("Beyond right angles","Set out obtuse or acute angles with a builder’s square, a template or an instrument. Batters (sloping walls) use a batter board or frame. Curves use a centre point and trammel. Opening positions and heights are marked with a gauge rod."),
        M("Match the task to the equipment",[["Curve on plan","Trammel from a centre point"],["Batter","Batter board or frame"],["Opening heights","Gauge rod"],["Angles","Template or instrument"]]),
        Q("Why mark opening positions before building starts?",["So openings are the right size and in the right place","To save bricks","To help the scaffolders","It isn’t necessary"],"Moving an opening later is costly."),
        T("Setting out mistakes are cheap to fix once the walls are up.",false,"They’re cheapest to fix before anything is built.")
      ])
    ]),
    unit("Unit 238: Thin joint masonry","Masonry structures",[
      lesson("t3-238a","Thin joint systems","Blocks, compound and first course",[
        L("Thin joint masonry","Thin joint uses accurate aircrete blocks bonded with a thin layer (about 2 to 3 mm) of jointing mortar. The first course is bedded on normal mortar and set dead level, because every course above follows it. Mix the jointing mortar exactly as the manufacturer says and apply it with the special scoop."),
        O("Put building thin joint in order",["Bed the first course level on normal mortar","Mix the jointing mortar as specified","Apply it with the serrated scoop","Lay and tap blocks into place","Fit ties and check level and plumb"],"The first course sets the standard for the rest."),
        Q("Why must the first course be perfectly level?",["Thin joints can’t take up errors like normal joints","It’s quicker","It saves blocks","It doesn’t matter"],"With 2 to 3 mm joints there’s no room to adjust."),
        Q("How thick is a thin joint?",["About 2 to 3 mm","10 mm","20 mm","5 cm"],"That’s where it gets its name."),
        T("Jointing mortar can be mixed however you like.",false,"Follow the manufacturer’s mixing and working times.")
      ]),
      lesson("t3-238b","Openings, cutting and safety","Working with aircrete",[
        L("Cutting and openings","Cut aircrete with a hand saw or bandsaw and control the dust. Openings need lintels with the correct bearing and cut blocks set accurately. Ties suit thin joint (flat or helical ties)."),
        Q("What should you use when cutting blocks that make dust?",["Dust control and suitable RPE","Nothing","A fan","Water on the floor"],"Silica and fine dust damage your lungs."),
        M("Match the item to its use",[["Serrated scoop","Spreads jointing mortar evenly"],["Rubbing float","Levels small high spots"],["Block saw","Cuts aircrete blocks"],["Helical tie","Ties thin joint walls"]]),
        T("Thin joint walls can be built faster because the mortar sets quickly.",true,"That’s one of the main benefits.")
      ])
    ]),
    unit("Unit 690: Repair and maintenance","Repairs",[
      lesson("t3-690a","Repairing masonry","Repointing, replacing and stitching",[
        L("Repair methods","Repoint by raking out joints to a sound depth (usually at least 15 mm), cleaning and dampening, then pointing with a matching mortar. Replace damaged bricks with matching ones. Stitch cracks with helical bars bonded into the joints where specified."),
        O("Put repointing in order",["Rake out joints to a sound depth","Brush out and dampen","Point with matching mortar","Finish to match the existing joint","Protect while it cures"],"Matching mortar and finish make the repair blend in."),
        Q("Why use lime mortar on an old building with soft bricks?",["Hard cement mortar can trap moisture and damage the bricks","Lime is quicker","It’s cheaper","It doesn’t matter"],"The mortar should be weaker than the brick."),
        M("Match the defect to a repair",[["Eroded joints","Repointing"],["Spalled brick","Replace the brick"],["Stable crack","Crack stitching as specified"],["Staining","Gentle cleaning"]]),
        T("The cause of the damage should be found and fixed as well as the damage itself.",true,"Otherwise it will happen again.")
      ]),
      lesson("t3-690b","Old buildings and safety","Asbestos, access and matching",[
        Q("You suspect asbestos in an old building you’re repairing. What do you do?",["Stop, don’t disturb it and tell your supervisor","Carry on carefully","Remove it yourself","Hose it down"],"Only licensed contractors deal with it."),
        L("Matching existing work","Match brick colour, size and texture, the mortar colour and strength, and the joint finish. Listed buildings may need approval for materials and methods."),
        Q("What might a listed building need before repairs?",["Approval for materials and methods","Nothing special","Modern cement mortar","Painting"],"Protected buildings have rules."),
        T("Access equipment for repairs must be inspected and suitable for the task.",true,"Scaffolds and towers must be safe before use.")
      ])
    ]),
    unit("Unit 828: Specialist masonry elements","Masonry cladding",[
      lesson("t3-828a","Support and restraint","Support angles, channels and wind posts",[
        L("Specialist elements","Support angles carry brickwork from the frame, set level with shims and a movement joint below. Channel systems let ties slide up and down to meet the courses. Wind posts are steel posts fixed top and bottom that give sideways restraint to long or tall panels."),
        M("Match the element to its purpose",[["Support angle","Carries brickwork from the frame"],["Channel system","Lets ties line up with the courses"],["Wind post","Resists wind on long panels"],["Wall starter kit","Ties a new wall to an existing one"]]),
        Q("What goes under a support angle?",["A compressible movement joint","Solid mortar","A DPC only","Nothing"],"It stops frame movement loading the brickwork below."),
        Q("Why use a wall starter kit?",["To tie a new wall to an existing one without cutting in bond","To start a mixer","To level the first course","For decoration"],"It’s quicker and less disruptive than toothing in."),
        T("Brick soffit systems let brickwork appear to span under openings or overhangs.",true,"They’re fixed with specialist brackets or units.")
      ]),
      lesson("t3-828b","Barriers and fire","Vapour, moisture and fire barriers",[
        L("Barriers","Vapour control layers stop warm, moist air getting into the structure. Moisture barriers and DPMs stop water getting through. Fire barriers and cavity barriers close the cavity to stop fire spreading. Laps and seals must be continuous."),
        M("Match the barrier to what it stops",[["Vapour control layer","Moist air getting into the structure"],["DPM","Moisture through floors or walls"],["Cavity barrier","Fire and smoke spreading in the cavity"],["Cavity tray","Water travelling across the cavity"]]),
        Q("Why must barrier laps be sealed and continuous?",["Gaps let moisture or fire through","It looks neat","It saves material","They don’t need to be"],"A barrier is only as good as its weakest joint."),
        T("Fire barriers can be left out if the cavity is small.",false,"Fit them wherever the drawings and regulations require.")
      ])
    ]),
    unit("Unit 837: Drainage","",[
      lesson("t3-837a","Laying drains","Falls, bedding and chambers",[
        L("Drainage","Foul water (from toilets, sinks) and surface water (rain) are usually kept in separate systems. Pipes are laid to a steady fall, bedded on granular material, with inspection chambers at changes of direction and junctions so the drain can be cleared."),
        M("Match the term to its meaning",[["Foul water","Waste from toilets, sinks and showers"],["Surface water","Rain from roofs and paved areas"],["Fall","The slope that makes water flow"],["Inspection chamber","Access point for clearing the drain"]]),
        Q("Where is an inspection chamber needed?",["At changes of direction and junctions","Every metre","Only at the house","Nowhere"],"So every length can be rodded."),
        Q("What should drain pipes be bedded on?",["Granular material such as pea gravel","Broken bricks","Nothing","Topsoil"],"It supports the pipe evenly along its length."),
        T("Foul water can be connected to a surface water drain.",false,"Mixing them causes pollution. Keep them separate unless it’s a combined system.")
      ]),
      lesson("t3-837b","Testing and trench safety","Checking the drain and staying safe",[
        L("Testing","Drains are tested before backfilling, usually with an air or water test, to prove there are no leaks. Backfill carefully in layers so pipes aren’t damaged."),
        O("Put laying a drain in order",["Check the drawings, levels and falls","Excavate safely with trench support","Lay the bedding and pipes to the fall","Test the drain","Backfill carefully in layers"],"Test before backfilling so leaks are easy to fix."),
        Q("What must you do before digging a trench?",["Locate buried services with drawings and a cable detector","Just start digging","Only check the weather","Nothing"],"Hitting a cable or gas main can kill."),
        Q("Why do trenches need support or battering back?",["The sides can collapse and bury someone","To make them look tidy","To save soil","They don’t"],"Trench collapse is a serious hazard."),
        T("A drain should be tested before it is backfilled.",true,"It’s much harder to find leaks afterwards.")
      ])
    ])
  ]);
})();
