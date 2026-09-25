/* Teach me: Site Carpenter. Two lessons per unit that between them cover the unit's KSBs. */
(function(){
  const {L,Q,T,M,O,lesson,unit,add}=window.EVIA_TEACH;
  add("site",[
    unit("Structural carcassing","Structural carcassing",[
      lesson("sc-carc1","Load-bearing studwork","Plates, studs, noggins and openings",[
        L("Load-bearing stud walls","A sole plate at the bottom, a head plate on top and studs between, usually at 400 or 600 mm centres. Noggins brace the studs and give fixings. Over an opening, a lintel (header) sits on cripple studs to carry the load."),
        M("Match the part to its job",[["Sole plate","Bottom timber fixed to the floor"],["Head plate","Top timber tying the studs together"],["Noggin","Short piece between studs for bracing and fixing"],["Cripple stud","Short stud that supports a lintel"]]),
        Q("Why are studs often at 600 mm centres?",["Boards are 1,200 mm wide, so edges land on a stud","It uses the most timber","It’s the only legal spacing","It looks neat"],"Board joints need something to fix to."),
        Q("Which strength class is stronger?",["C24","C16","Both the same","It depends on colour"],"C24 is stronger. Always use the grade on the drawing."),
        O("Put building a stud wall in order",["Set out and fix the sole plate","Mark the stud positions on both plates","Fix the head plate","Fit the studs plumb","Fit noggins and trim openings"],"Marking both plates together keeps studs plumb."),
        T("You can swap load-bearing timber for a smaller size if it’s all that’s on site.",false,"Structural sizes come from the engineer or tables. Never undersize.")
      ]),
      lesson("sc-carc2","Power tools, timber and safety","Using tools well and choosing timber",[
        M("Match the power tool to a safety point",[["Circular saw","Guard working and the work supported"],["Nail gun","Sequential trigger; never point it at anyone"],["Drill","Right bit and a firm grip"],["Mitre saw","Let the blade stop before lifting"]]),
        Q("Before changing a blade, you should…",["Unplug it or remove the battery","Switch off at the trigger","Let it slow down","Hold the blade still"],"Isolating stops it starting unexpectedly."),
        L("Timber","Softwoods (spruce, pine, Douglas fir) are used for carcassing, graded C16 or C24. Treated timber resists rot. Engineered timber like I-joists and glulam is strong and stable. Store timber flat, off the ground and covered."),
        Q("How should carcassing timber be stored on site?",["Flat, off the ground on bearers, and covered","Standing upright against a wall","On wet ground","Uncovered in the sun"],"It stays straight and dry."),
        T("Putting health and safety first means using a tool’s guard every time.",true,"Guards are there because blades don’t stop for fingers.")
      ])
    ]),
    unit("Timber/metal partition walls","Partition walls",[
      lesson("sc-part1","Timber and metal partitions","Stud layouts, tracks and lasers",[
        L("Partitions","Timber partitions use plates and studs. Metal partitions use U-shaped tracks at the top and bottom with C-studs clipped between, then boards screwed on. Set out the line with a laser, fix the plates or tracks, then the studs."),
        M("Match the part to the system",[["Track","Metal channel at top and bottom"],["C-stud","Metal upright between tracks"],["Sole plate","Timber at the bottom of a timber stud wall"],["Noggin","Timber brace between studs"]]),
        L("Laser levels","A cross-line laser projects level and plumb lines to set out partitions. Check its accuracy regularly, store it in its case, never look into the beam and switch it off when not in use."),
        Q("How can you check a laser level is still accurate?",["Mark a line, turn it 180° and check it matches","Look into the beam","Shake it","Check the battery"],"If the lines don’t match, it needs recalibrating."),
        Q("What is a timber sizing (span) table used for?",["Choosing the right timber size for a span, spacing and load","Pricing timber","Ordering screws","Measuring moisture"],"Pick the size that suits the span and strength class."),
        T("It’s safe to look into a laser beam for a moment.",false,"Even low-power lasers can damage eyes.")
      ]),
      lesson("sc-part2","Modern methods and learning","How buildings go together now",[
        L("Principles and modern methods","Walls carry or divide; floors and roofs spread loads down to foundations. Modern methods include timber frame panels, SIPs, metal framing systems and factory-made modules, which need accurate site work."),
        M("Match the method to its description",[["Timber frame panels","Wall panels made in a factory"],["SIPs","Insulated panels that are strong and quick to fit"],["Metal stud systems","Light, straight framing for partitions"],["Volumetric modules","Whole rooms built off site"]]),
        Q("Why do factory-made components need accurate site work?",["There’s little room to adjust them to fit","They’re heavier","They’re cheaper","They don’t"],"Setting out has to be spot on."),
        T("Asking to learn a new system, like metal stud framing, is a good way to develop.",true,"Seeking learning opportunities is part of being a great apprentice.")
      ])
    ]),
    unit("Floor joists (and coverings)","Floor joists",[
      lesson("sc-floor1","Joists and coverings","Sizing, hangers, strutting and decking",[
        L("Floor joists","Joist size comes from span tables (span, spacing, strength class). Joists sit in hangers or on bearers, level and at the right centres. Strutting stops them twisting: one row for spans between 2.5 and 4.5 m, two rows over 4.5 m."),
        Q("A joist spans 3.6 m. How many rows of strutting?",["One, at mid-span","None","Two","Three"],"Spans from 2.5 to 4.5 m need one row."),
        L("Notches and holes","Notch only the top edge, no deeper than 0.125 × the joist depth, between 0.07 and 0.25 of the span from the support. Drill holes on the centre line, no bigger than 0.25 × the depth, between 0.25 and 0.4 of the span."),
        Q("Where may you drill holes for cables in a joist?",["On the centre line, between 0.25 and 0.4 of the span from the support","Near the bottom edge","Anywhere","Right next to the support"],"The centre of the joist carries the least stress."),
        L("Floor coverings","Moisture-resistant tongue-and-groove chipboard or boards are glued and screwed or nailed to every joist, joints staggered, with an expansion gap round the edge."),
        T("Floor boards should be laid tight against the walls with no gap.",false,"Leave an expansion gap so they don’t buckle.")
      ]),
      lesson("sc-floor2","Fixings, decay and the environment","Structural fixings, rot and resources",[
        M("Match the fixing to its use",[["Joist hanger","Supports a joist end on a wall or beam"],["Restraint strap","Ties floors or roofs to the walls"],["Coach screw","Heavy-duty timber fixing"],["Truss clip","Fixes trusses to the wall plate"]]),
        Q("How should a joist hanger be fixed?",["With the right nails in every hole","With one screw","Glued only","Any nails, a few holes"],"Structural fixings only work if fixed as the maker says."),
        M("Match the problem to a sign",[["Wet rot","Soft, dark timber where it stays damp"],["Dry rot","White strands and a mushroom-like growth"],["Woodworm","Small round exit holes"],["Overloading","Sagging or cracked joists"]]),
        M("Match the control to what it does",[["LEV","Extracts dust at the source"],["RPE","A mask that filters your air"],["COSHH","Controls hazardous substances"],["PUWER","Keeps work equipment safe"]]),
        T("Using offcuts for noggins and strutting helps reduce waste.",true,"Good planning uses materials efficiently.")
      ])
    ]),
    unit("Straight flights of stairs","Stairs",[
      lesson("sc-stair1","Fitting a straight flight","Fixing, levels and the rules",[
        L("Fitting stairs","Check the opening and floor-to-floor height against the drawing. Fix the top of the flight to the trimmer, fix the wall string to the wall, check every tread is level and the flight is square, and protect the treads while other work goes on."),
        O("Put fitting a flight in order",["Check the opening and total rise","Offer up the flight and check it’s level","Fix the top to the trimmer","Fix the wall string","Fit newels and protect the treads"],"Check before you fix."),
        Q("What is the maximum rise for a private stair?",["220 mm","250 mm","180 mm","300 mm"],"Minimum going is also 220 mm, with a maximum pitch of 42°."),
        Q("What minimum headroom is needed over a domestic stair?",["2 m","1.5 m","1.8 m","2.5 m"],"Measured vertically from the pitch line."),
        T("Treads should be protected while other trades are working.",true,"Boards or covers stop damage and slips.")
      ]),
      lesson("sc-stair2","Drawings, awareness and safety","Information and staying safe",[
        L("Drawings and digital models","Drawings and specifications give the stair’s rise, going and fixing details. Digital models and tablets are used on some sites; check you’re using the latest revision."),
        Q("Why check the drawing revision?",["An older version may have different sizes","It isn’t important","To see the architect’s name","For the date only"],"Building to an old drawing wastes time."),
        Q("What’s a key hazard while fitting stairs?",["Falling through the open stairwell","Too much light","Paint fumes","Rain"],"Guard or cover openings."),
        Q("What causes most slips and trips?",["Untidy work areas and trailing leads","Good lighting","Wearing boots","Signs"],"Clear up as you go."),
        T("Putting safety first means stopping if a stairwell opening isn’t protected.",true,"Report it and don’t work next to it until it’s safe.")
      ])
    ]),
    unit("Service encasement","Service encasement",[
      lesson("sc-serv1","Boxing in services","Frames, access and fire",[
        L("Service encasement","Frame round pipes and ducts with battens, then board it in. Leave access panels at valves, meters and joints. Don’t fix through pipes or cables, allow for pipes expanding, and use fire-rated boards where the drawings say."),
        O("Put boxing in a pipe in order",["Find the services and check for hidden pipes and cables","Fix the battens to form the frame","Cut and fit the boards","Fit an access panel at the valve","Fill and finish ready for decoration"],"Access panels mean no one has to rip it out later."),
        Q("Why include an access panel?",["So valves and meters can be reached","It looks nice","It saves boards","It isn’t needed"],"Services need maintaining."),
        Q("What should you use before fixing into a wall near services?",["A cable and pipe detector","A spirit level","A tape measure","A hammer"],"Check before you drill or nail."),
        T("Fire-rated encasement must be built exactly as specified.",true,"Gaps or the wrong board let fire spread.")
      ]),
      lesson("sc-serv2","Hand tools, fire, wellbeing and inclusion","Tools and looking after people",[
        M("Match the hand tool to its use",[["Tenon saw","Accurate small cuts"],["Block plane","Trimming end grain and edges"],["Sliding bevel","Copying angles"],["Spirit level","Checking level and plumb"]]),
        M("Match the extinguisher to its use",[["Water (red)","Wood and paper"],["Foam (cream)","Flammable liquids"],["CO2 (black)","Electrical fires"],["Dry powder (blue)","Many types, including gas"]]),
        Q("Where can a worker find support with stress or low mood?",["Their employer, a mental health first aider or the Construction Industry Helpline","Nowhere on site","Only a doctor","Social media"],"Help is there: use it."),
        Q("Which action helps an inclusive culture?",["Making sure everyone can use the welfare facilities","Nicknames about someone’s background","Leaving people out of briefings","Ignoring comments"],"Inclusion means everyone can take part."),
        T("Hand tools should be stored clean and with edges protected.",true,"It keeps them sharp and safe.")
      ])
    ]),
    unit("Cladding","Cladding",[
      lesson("sc-clad1","Fitting timber cladding","Battens, gaps, fixings and profiles",[
        L("Timber cladding","Fix battens (and counter-battens) over a breathable membrane to leave a ventilated gap behind the boards. Use stainless steel or suitable fixings so timber like cedar or oak doesn’t stain. Leave gaps for movement, fit insect mesh at vents and follow fire-break details."),
        M("Match the profile to its description",[["Shiplap","Rebated boards that overlap neatly"],["Feather-edge","Tapered boards that overlap"],["Board-on-board","Vertical boards with gaps covered by others"],["Tongue and groove","Boards that lock edge to edge"]]),
        Q("Why is there a ventilated gap behind cladding?",["So moisture can dry out and the timber doesn’t rot","To save boards","For cables","It isn’t needed"],"Air flow keeps the back of the boards dry."),
        Q("Why use stainless steel fixings with cedar or oak?",["The tannins react with plain steel and stain black","They’re cheaper","They’re easier to hide","It doesn’t matter"],"The right fixings keep cladding looking good."),
        T("Cladding boards should be fixed tight together with no movement gaps.",false,"Timber moves with moisture, so leave gaps as specified.")
      ]),
      lesson("sc-clad2","Safe systems, asbestos and wellbeing","Planning safe work",[
        M("Match the document to what it does",[["Risk assessment","Finds hazards and controls"],["Method statement","Safe step-by-step method"],["Toolbox talk","Short safety briefing"],["Induction","Site rules when you start"]]),
        L("Asbestos","Old cladding, soffits and boards on buildings from before 2000 may contain asbestos. If you suspect it, stop, don’t disturb it, keep others away and tell your supervisor."),
        Q("You’re removing old soffit boards and suspect asbestos. What do you do?",["Stop, leave them and tell your supervisor","Snap them off quickly","Cut them smaller","Sweep up"],"Only licensed contractors deal with it."),
        Q("What keeps a work area safe when cladding at height?",["Proper scaffold, clear platforms and nothing below the work","Ladders only","Leaving offcuts on the scaffold","Working quickly"],"Keep platforms tidy and the area below barriered."),
        T("Wellbeing includes physical health, like avoiding back strain from awkward lifting.",true,"Plan lifts and get help with long boards.")
      ])
    ]),
    unit("Wall and floor units","Units and fitments",[
      lesson("sc-units1","Fitting units and fitments","Datums, level and worktops",[
        L("Fitting units","Find the high point of the floor, set a level datum line (a laser helps), fix base units level along it, then wall units securely to studs or masonry with the right fixings. Worktops are joined with a jig and router, then sealed."),
        O("Put fitting a run of units in order",["Check the floor and set a level datum","Fit the base units level to the datum","Fix the wall units securely","Fit and joint the worktop","Fit doors and adjust them"],"A good datum makes everything line up."),
        Q("Why start from the high point of the floor?",["So every unit can be packed up to the same level","It’s the easiest corner","To save legs","It doesn’t matter"],"You can pack up, but you can’t cut the floor down."),
        L("Jigs","A worktop jig guides the router to cut accurate joints. Making your own jig for repeat jobs, like drilling handle holes, keeps every one the same."),
        Q("Why use a jig to drill handle holes on 20 doors?",["Every handle ends up in the same place","It looks professional","It’s the law","It’s faster to measure each one"],"Jigs make repeat work accurate."),
        T("Wall units can be fixed with any screws into plasterboard.",false,"Use fixings suited to the load and the wall, into studs or proper cavity fixings.")
      ]),
      lesson("sc-units2","Environment and teamwork","Waste, resources and working together",[
        M("Match the waste to what to do",[["Packaging cardboard","Flatten and recycle"],["Clean timber offcuts","Reuse or recycle"],["Worktop off-cuts","Reuse for small shelves or recycle"],["Adhesive and sealant tubes","Dispose of as hazardous where marked"]]),
        Q("What does FSC or PEFC on timber products show?",["They come from well-managed forests","They’re fireproof","They’re waterproof","They’re cheaper"],"Sustainable forestry matters."),
        M("Match the teamwork habit to an example",[["Communicating","Telling the plumber when units are fitted"],["Reliability","Finishing when you said"],["Respect","Leaving the kitchen clean for the next trade"],["Helping","Carrying a worktop together"]]),
        T("Team-focus means planning your work around other trades, like electricians and plumbers.",true,"Kitchens need everyone working in the right order.")
      ])
    ]),
    unit("Handrails and spindles","Handrails and spindles",[
      lesson("sc-hand1","Fitting handrails and spindles","Heights, gaps and fixing",[
        L("Balustrades on site","Fit newel posts plumb and secure, then the handrail at about 900 mm above the pitch line on domestic stairs, and spindles at gaps that won’t let a 100 mm sphere through. Cut spindles to the pitch angle so they sit tight."),
        Q("What is the maximum gap between spindles on a domestic stair?",["Less than 100 mm","150 mm","120 mm","200 mm"],"So a small child can’t get through."),
        Q("Which tool copies the stair pitch to mark spindle ends?",["Sliding bevel","Tri-square","Tape measure","Chisel"],"Set it to the pitch and mark every spindle."),
        M("Match the hand tool to its use",[["Sliding bevel","Copying the pitch angle"],["Tenon saw","Cutting spindles cleanly"],["Spirit level","Checking newels are plumb"],["Chisel","Trimming housings"]]),
        T("Newel posts must be fixed solidly because the handrail relies on them.",true,"A loose newel makes the whole balustrade unsafe.")
      ]),
      lesson("sc-hand2","Signs, talking and learning","Safety signs and clear communication",[
        M("Match the sign colour to its meaning",[["Blue circle","You must do this"],["Yellow triangle","Warning of a hazard"],["Red circle","You must not do this"],["Green square","Safe condition, like first aid"]]),
        M("Match the trade word to its meaning",[["Pitch line","Line joining the nosings"],["Newel","Main post of a balustrade"],["Baluster","Another name for a spindle"],["Going","Depth of a step"]]),
        Q("Which is the clearest message to your supervisor?",["The newel at the top is 5 mm out of plumb; shall I reset it before fitting the rail?","Something’s wrong","It’s a bit off","Not sure"],"Say what, where and what you suggest."),
        T("Asking an experienced carpenter to watch you fit spindles is a good way to learn.",true,"Feedback helps you improve.")
      ])
    ]),
    unit("Internal and external doors","Doors",[
      lesson("sc-door1","Hanging doors","Sizing, gaps and connections",[
        L("Hanging a door","Measure the opening, then plane the door to fit with even gaps of about 2 to 3 mm at the sides and top and a floor gap to suit the covering. Fit the hinges, then the lock and handles. External doors need weather seals and a threshold."),
        O("Put hanging a door in order",["Measure the opening and check it’s square","Trim the door to size with even gaps","Mark and cut in the hinges","Hang the door and check the swing","Fit the lock, latch and handles"],"Take small amounts off at a time."),
        Q("What is a typical gap at the sides and top of an internal door?",["About 2 to 3 mm","10 mm","None","20 mm"],"Even gaps look right and stop sticking."),
        M("Match the product to its use",[["Mastic sealant","Sealing gaps round external frames"],["Preservative","Protecting timber from rot and insects"],["Wood filler","Filling holes before painting"],["Weather seal","Stopping draughts at external doors"]]),
        M("Match the fixing to a use",[["Lost-head nail","Fixings that need hiding"],["Screw","Strong fixing that can be removed"],["Bolt","Heavy structural connection"],["Adhesive","Bonding along a whole joint"]]),
        T("Always check the drawing or schedule for which way a door should open.",true,"The door schedule gives size, type and hand.")
      ]),
      lesson("sc-door2","Sharp tools and safety","Maintaining hand tools",[
        L("Sharpening","Grind a chisel or plane iron at about 25°, hone a small bevel at about 30°, flatten the back and remove the burr. A sharp tool needs less force and is safer."),
        O("Put sharpening a plane iron in order",["Flatten the back","Grind the bevel at about 25°","Hone at about 30°","Remove the burr","Refit and set the blade"],"Set the blade to take a fine shaving."),
        Q("Why is a blunt chisel more dangerous?",["You push harder, so it slips","It’s heavier","It’s sharper","It isn’t"],"Keep your tools sharp."),
        Q("Where do you find a door’s size, type and fire rating?",["The door schedule and specification","The delivery driver","The skip","Guess from the opening"],"Schedules list every door."),
        T("Putting wellbeing first includes getting help to lift heavy external doors.",true,"Two-person lifts prevent injuries.")
      ])
    ]),
    unit("Skirting boards and architrave","Skirting and architrave",[
      lesson("sc-skirt1","Skirting and architrave","Mitres, scribes and splices",[
        L("Fitting mouldings","Mitre external corners at 45°. Scribe internal corners: cut the profile of one board to fit over the other, so the joint stays tight. On long runs, splice with a 45° scarf joint. Set architrave back from the lining edge by a small, even margin of about 5 mm."),
        M("Match the joint to where it’s used",[["Mitre","External corners"],["Scribe","Internal corners"],["Splice (scarf)","Joining lengths on a long run"],["Margin","Even reveal between architrave and lining"]]),
        Q("Why scribe internal corners instead of mitring them?",["A scribe stays tight when the timber shrinks","It’s quicker","It uses less timber","It looks different"],"Mitres on internal corners tend to open up."),
        O("Put fitting a length of skirting in order",["Measure the wall","Cut one end to scribe or mitre","Mark and cut the other end","Dry-fit and adjust","Fix to the wall"],"Dry-fit before fixing."),
        T("A 45° splice is less noticeable than a square butt joint.",true,"The overlap hides any movement.")
      ]),
      lesson("sc-skirt2","Dust, environment and working for yourself","Controls, waste and employment",[
        M("Match the control to what it does",[["LEV","Extracts dust at the saw"],["RPE","Filters the air you breathe"],["Eye protection","Stops chips reaching your eyes"],["Hearing protection","Protects your ears from saw noise"]]),
        Q("What’s the best way to deal with short offcuts of skirting?",["Keep useful ones for small returns, recycle the rest","Throw them all in the general skip","Burn them","Leave them on the floor"],"Using offcuts reduces waste."),
        L("Employment and tax","Employed people pay tax through PAYE. Self-employed people use Self Assessment. In construction, the Construction Industry Scheme (CIS) deducts tax from subcontractors: 20% if registered, 30% if not."),
        M("Match the term to its meaning",[["PAYE","Tax taken from wages by your employer"],["Self Assessment","You report and pay your own tax"],["CIS","Tax deducted from subcontractor payments"],["Public liability insurance","Covers damage or injury to others"]]),
        T("Self-employed carpenters need to keep records of what they earn and spend.",true,"You need them for your tax return.")
      ])
    ]),
    unit("Window boards","Window boards",[
      lesson("sc-wb1","Fitting window boards","Measuring, notching and mitring",[
        L("Window boards","Measure the reveal width and depth, allowing the board to run past the reveals (horns) and overhang the wall. Mark and cut the notches, round or bullnose the front edge, mitre returns where needed, and fix it level on packers."),
        O("Put fitting a window board in order",["Measure the reveal and overhang","Mark out the horns and notches","Cut and shape the board","Dry-fit and check it’s level","Fix and seal"],"Mark from the reveal, not the tape alone."),
        Q("What are the horns of a window board?",["The parts that extend past the reveals","The front edge","The fixings","The packers"],"They’re notched round the plaster line."),
        Q("What angle do you cut for a mitred return on a square corner?",["45°","30°","90°","60°"],"Two 45° cuts make a 90° corner."),
        T("A window board should be fixed level even if the sill isn’t.",true,"Pack it to level.")
      ]),
      lesson("sc-wb2","Standards and inclusion","Regulations and fairness at work",[
        M("Match the standard to what it is",[["British Standards","Agreed ways to make and fit things"],["Building Regulations","Legal requirements for buildings"],["Warranty standards","Quality rules for new homes"],["Specification","What this job must use"]]),
        Q("Which is an example of inclusion on site?",["Briefings everyone can understand, including those with English as a second language","Only briefing the regular team","Making jokes about accents","Leaving people to work it out"],"Everyone needs to understand safety information."),
        M("Match the word to its meaning",[["Equity","Fair access and treatment for everyone"],["Diversity","Valuing differences"],["Inclusion","Everyone feels part of the team"],["Discrimination","Treating someone unfairly because of who they are"]]),
        T("Contributing to an inclusive culture includes challenging offensive comments.",true,"Or reporting them if you can’t challenge safely.")
      ])
    ]),
    unit("Roofs and loft hatch","Roofs",[
      lesson("sc-roof1","Pitched roofs and loft hatches","Trussed and cut roofs",[
        L("Pitched roofs","Trussed rafters are made in a factory, usually fitted at 600 mm centres on wall plates and braced with diagonal and longitudinal bracing. Never cut or alter a truss. Traditional cut roofs are built on site: ridge, rafters with birdsmouth cuts on the wall plate, purlins and ceiling joists."),
        M("Match the roof part to its description",[["Ridge","Board at the top where rafters meet"],["Wall plate","Timber on the wall the rafters sit on"],["Purlin","Beam supporting rafters part way up"],["Birdsmouth","Notch in a rafter to sit on the wall plate"]]),
        Q("Can you cut a trussed rafter to make room for a loft hatch?",["No: trim the opening as the designer shows","Yes, if you add a noggin","Yes, one truss is fine","Only the bottom chord"],"Trusses are engineered as a whole."),
        Q("A rafter rises 3 m over a run of 4 m. How long is it (before overhang)?",["5 m","7 m","3.5 m","12 m"],"3-4-5: the square root of 3² + 4² is 5."),
        L("Loft hatches","The opening is trimmed with trimmers to the size shown, then lined, with an insulated, draught-sealed hatch."),
        T("Roof bracing is optional if the trusses look straight.",false,"Bracing is essential for stability.")
      ]),
      lesson("sc-roof2","Flat roofs, estimating and working at height","Warm and cold roofs, lists and safety",[
        L("Flat roofs","A warm flat roof has the insulation above the deck with a vapour control layer below it. A cold roof has insulation between the joists and a ventilated gap above. Firrings (tapered strips) on the joists give the fall so water runs off."),
        M("Match the term to its meaning",[["Warm roof","Insulation above the deck"],["Cold roof","Insulation between joists, ventilated above"],["Firrings","Tapered strips that create a fall"],["Vapour control layer","Stops moist air getting into the roof"]]),
        Q("Roof joists at 400 mm centres over a 4.8 m length. How many joists?",["13","12","11","16"],"4,800 ÷ 400 = 12 spaces, so 13 joists."),
        L("Working at height","Use scaffold with edge protection or other collective protection; ladders are for short, simple tasks. Lofts and roof voids can be confined spaces: plan access, ventilation and how you’d get out."),
        Q("What protects people from falling off a roof edge?",["Guard rails or edge protection on the scaffold","Working carefully","A spotter only","Nothing is needed"],"Collective protection comes first."),
        T("Team-focus on a roof includes calling out before passing materials up.",true,"Everyone needs to know what’s coming.")
      ])
    ])
  ]);
})();
