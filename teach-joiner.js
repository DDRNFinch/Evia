/* Teach me: Bench (architectural) Joiner. Two lessons per unit that between them cover the unit's KSBs. */
(function(){
  const {L,Q,T,M,O,lesson,unit,add}=window.EVIA_TEACH;
  add("joiner",[
    unit("Basic woodworking joints","Woodworking joints",[
      lesson("jn-joints1","Four basic joints","Mortise and tenon, dovetail, bridle and halving",[
        L("The basic joints","Mortise and tenon: a tongue (tenon) fits a slot (mortise), used for frames and doors. Dovetail: interlocking tails and pins, strong in one direction, used for drawers. Bridle: an open mortise, used for frame corners. Halving: half the thickness removed from each piece, for simple frames."),
        M("Match the joint to where it’s used",[["Mortise and tenon","Door and window frames"],["Dovetail","Drawer fronts and boxes"],["Bridle","Frame corners and legs"],["Halving","Simple frames and crossings"]]),
        Q("As a general rule, how thick is a tenon?",["About a third of the timber’s thickness","The full thickness","A tenth of the thickness","Half the width"],"A third leaves enough timber either side of the mortise."),
        Q("What is a typical dovetail slope for softwood?",["1 in 6","1 in 20","1 in 2","45°"],"About 1 in 6 for softwood and 1 in 8 for hardwood."),
        O("Put making a mortise and tenon in order",["Mark out from the face side and face edge","Gauge the mortise and tenon with a mortise gauge","Cut the mortise","Cut the tenon cheeks and shoulders","Dry-fit, then glue and cramp"],"Everything is marked from the face side and edge so parts line up."),
        T("Joints should be dry-fitted before gluing.",true,"You find problems while you can still fix them.")
      ]),
      lesson("jn-joints2","Connections, timber and safety","Dowels, biscuits, adhesives and materials",[
        M("Match the connection to its description",[["Dowels","Round wooden pins glued into holes"],["Biscuits","Oval wafers that swell in slots"],["Staples","Quick fixings for backs and panels"],["PVA adhesive","Wood glue, some types water-resistant"]]),
        Q("Which glue is right for an external joinery joint?",["A water-resistant adhesive, such as D4 PVA or polyurethane","Standard interior PVA","Wallpaper paste","Contact adhesive"],"Check the durability rating for outdoor use."),
        L("Timber and timber products","Softwoods come from conifers (pine, spruce, Douglas fir); hardwoods from broadleaf trees (oak, sapele, beech). Timber can be home-grown or imported. Timber products include plywood, MDF, OSB and chipboard. Joinery timber should be dried to a suitable moisture content, around 12% for inside work."),
        M("Match the material to a feature",[["Oak","Home-grown hardwood, strong and durable"],["Plywood","Layers glued with grain crossing, stable"],["MDF","Smooth, even board; dust needs control"],["Redwood (pine)","Common imported softwood for joinery"]]),
        T("Putting health and safety first includes wearing the right PPE even for a quick cut.",true,"Most injuries happen on the “quick jobs”.")
      ])
    ]),
    unit("Timber Window",["Timber windows","Drawings"],[
      lesson("jn-window1","Making a casement window","Frame, casement, rebates and weathering",[
        L("Parts of a casement window","The frame has a head, jambs and a sill. The casement (the opening part) has stiles and rails. Glazing rebates hold the glass. The sill is weathered (sloped) with a drip underneath so water runs away from the wall."),
        M("Match the part to its job",[["Sill","Sheds water at the bottom of the frame"],["Drip groove","Stops water running back under the sill"],["Glazing rebate","Holds the glass or glazed unit"],["Stile","Upright part of the casement"]]),
        O("Put making a window in order",["Read the drawing and cutting list","Mark out the frame and casement from the rod","Cut the joints and rebates","Dry-assemble and check square","Glue up, fit ironmongery and glaze"],"Checking square before gluing saves a lot of trouble."),
        Q("How do you check a frame is square?",["Measure both diagonals: they should match","Look along it","Use a spirit level","Check one corner with a square only"],"Equal diagonals mean a square frame."),
        T("The sill is sloped so rainwater runs away from the window.",true,"That slope is called weathering.")
      ]),
      lesson("jn-window2","Drawings, dust and the environment","Information, protection and sustainability",[
        L("Drawings and specifications","Drawings show the window’s sizes and sections; the specification says the timber, finish and ironmongery. Digital design and modelling (CAD, BIM) can produce drawings and cutting lists directly."),
        Q("Where would you find the timber species and finish for the window?",["The specification","The delivery note","The site hoarding","Anywhere"],"The spec sets out materials and standards."),
        M("Match the control to what it does",[["LEV","Extracts dust at the machine"],["RPE","A mask that filters what you breathe"],["Dust suppression","Stops dust getting into the air"],["PPE","Protects your eyes, ears, hands and feet"]]),
        Q("Why is fine wood dust a hazard?",["It can damage your lungs, and some hardwood dust can cause cancer","It makes the floor messy","It blunts tools","It isn’t a hazard"],"Control it at source with extraction, then use RPE."),
        Q("You’re replacing an old window and find a grey board behind it that could be asbestos. What do you do?",["Stop, leave it and tell your supervisor","Break it up and bin it","Sand it smooth","Cut round it"],"Never disturb suspected asbestos."),
        T("Planning cuts to use timber efficiently helps the environment.",true,"Less waste means fewer trees and less cost.")
      ])
    ]),
    unit("Straight staircases","Straight staircases",[
      lesson("jn-stairs1","Making a straight staircase","Strings, treads, risers and the rules",[
        L("Parts of a stair","Two strings (the sides) carry treads (what you step on) and risers (the uprights). The nosing is the front edge of the tread. Rise is the height of one step; going is the depth."),
        M("Match the part to its description",[["String","Side board that carries the steps"],["Tread","The part you step on"],["Riser","The upright between treads"],["Nosing","The front edge of a tread"]]),
        L("Building Regulations (private stairs)","Maximum rise 220 mm, minimum going 220 mm, maximum pitch 42°, and twice the rise plus the going between 550 and 700 mm. Headroom at least 2 m."),
        Q("A private stair has a rise of 200 mm and a going of 250 mm. Is 2R + G within the rules?",["Yes: 650 mm","No: 450 mm","No: 750 mm","Yes: 450 mm"],"2 × 200 + 250 = 650, between 550 and 700."),
        Q("The total rise is 2,600 mm. With 13 risers, what is each rise?",["200 mm","216 mm","260 mm","130 mm"],"2,600 ÷ 13 = 200 mm."),
        T("All the risers in a flight should be the same height.",true,"Uneven steps are a trip hazard.")
      ]),
      lesson("jn-stairs2","Cutting lists, talking and safety","Estimating, communication and working safely",[
        L("Cutting list","A cutting list gives each part: name, number, finished length × width × thickness and material. Add an allowance for machining and waste when you order."),
        O("Put producing a cutting list in order",["Study the drawing and setting out","List every component","Write the finished sizes and quantities","Add allowances for machining","Total up the material to order"],"Accurate lists stop waste and shortages."),
        Q("Why add an allowance to finished sizes?",["Sawn timber is planed and trimmed to size","To make parts bigger","It’s a tradition","To use up timber"],"Planing and trimming remove material."),
        Q("Which is the clearest message to a colleague?",["The 2,600 mm stair needs 13 risers of 200 mm: can you check my setting out?","Is it alright?","Check the stairs thing","Sorted?"],"Use the right terms and numbers."),
        L("Height and confined spaces","Fitting stairs means working at height and near open stairwells: use guardrails or covers and the right access equipment. Confined spaces (lofts, voids) need planning: good ventilation, a way out and someone who knows you’re there."),
        T("Contributing to an inclusive culture includes speaking up when someone is being left out.",true,"Everyone should feel part of the team.")
      ])
    ]),
    unit("Door frames and linings","Door frames and linings",[
      lesson("jn-frames1","Frames and linings","What’s the difference and how they’re made",[
        L("Frames and linings","Door frames are heavier sections with a rebate for the door, often used for external doors and sometimes with a sill. Linings are thinner boards lining an internal opening, with separate stops planted on."),
        M("Match the item to its description",[["Door frame","Heavy section with a rebated stop"],["Door lining","Thin board lining an internal opening"],["Planted stop","A strip fixed on for the door to close against"],["Horn","Extra length left on the head for fixing, cut off later"]]),
        Q("Which would you normally use for an external door?",["A rebated door frame","A thin lining","No frame at all","A stair string"],"External doors need the strength and weathering of a frame."),
        L("Timber decay","Wet rot attacks timber that stays damp. Dry rot (a fungus) can spread through masonry and needs specialist treatment. Woodworm leaves small exit holes. Fix the cause of the damp, cut out and replace decayed timber and treat what remains."),
        M("Match the problem to a sign",[["Wet rot","Soft, dark timber where it stays damp"],["Dry rot","White strands and a mushroom-like growth"],["Woodworm","Small round exit holes and dust"],["Joint failure","Gaps opening at the joints"]]),
        T("Replacing rotten timber without fixing the source of damp will usually last.",false,"Stop the water getting in, or it will rot again.")
      ]),
      lesson("jn-frames2","Sharp tools, signs and learning","Sharpening, safety signs and development",[
        L("Sharpening chisels and planes","Flatten the back, grind a bevel at about 25°, then hone a small secondary bevel at about 30° on an oilstone, waterstone or diamond plate. Remove the burr (wire edge) by rubbing the back flat."),
        O("Put sharpening a chisel in order",["Flatten the back","Grind the bevel at about 25°","Hone at about 30°","Remove the burr from the back","Test the edge on scrap"],"A sharp tool is safer: it needs less force."),
        Q("Why is a sharp chisel safer than a blunt one?",["It needs less force, so it’s less likely to slip","It looks better","It’s lighter","It isn’t safer"],"Blunt tools slip and cause injuries."),
        M("Match the sign colour to its meaning",[["Blue circle","You must do this"],["Yellow triangle","Warning of a hazard"],["Red circle","You must not do this"],["Green square","Safe condition, like first aid"]]),
        T("Asking to try a new technique under supervision is a good way to learn.",true,"Seeking learning opportunities helps you progress.")
      ])
    ]),
    unit("Timber doors",["Timber doors","Power tools"],[
      lesson("jn-doors1","Making timber doors","Panelled, ledged and fire doors",[
        L("Types of door","Panelled doors: stiles, rails and muntins with panels. Ledged and braced doors: boards with horizontal ledges and diagonal braces. Flush doors: a frame covered with sheet material."),
        M("Match the part to its description",[["Stile","Upright at each side"],["Rail","Horizontal member"],["Muntin","Upright between panels"],["Brace","Diagonal that stops a ledged door sagging"]]),
        Q("On a ledged and braced door, which way do the braces run?",["Up and away from the hinge side","Down towards the hinges","Straight across","It doesn’t matter"],"The bottom of each brace sits near the hinges, so it pushes the weight back to them."),
        L("Fire doors","A fire door (for example FD30, 30 minutes) only works as a complete assembly: the right door, frame, intumescent strips and smoke seals, certified hinges and a self-closer, with the right gaps (usually around 3 mm). Never alter one without approval."),
        Q("Which of these would break a fire door’s certification?",["Cutting in unapproved ironmongery","Fitting the specified intumescent strips","Using certified hinges","Keeping the gaps within tolerance"],"Any change must follow the manufacturer’s certification."),
        T("A fire door should be wedged open to let air through.",false,"It must close by itself to stop fire and smoke spreading.")
      ]),
      lesson("jn-doors2","Power tools and the regulations","Using, storing and staying safe",[
        M("Match the power tool to a key safety point",[["Circular saw","Guard working and work supported"],["Router","Feed against the direction of the cutter"],["Nail gun","Sequential trigger; never point at anyone"],["Planer","Let it stop before putting it down"]]),
        Q("Before changing a router cutter, what must you do?",["Unplug it or remove the battery","Switch it off at the trigger only","Let it slow down","Nothing"],"Isolate the power so it can’t start."),
        M("Match the law or regulation to what it covers",[["Health and Safety at Work Act","Duties of employers and employees"],["PUWER","Work equipment is safe and maintained"],["COSHH","Hazardous substances like dust and glue"],["Manual Handling Regulations","Lifting and carrying safely"]]),
        Q("How should power tools be stored?",["Clean, dry and in their case, with leads coiled","In a wet van","With blades exposed","Plugged in"],"Good storage protects the tool and the next user."),
        T("Team-focus means thinking about how your work affects the next trade.",true,"For example, leaving doors hung, clean and protected for decorators.")
      ])
    ]),
    unit("Wall and floor units","Wall and floor units",[
      lesson("jn-units1","Setting out and making units","Rods, marking out and assembly",[
        L("Setting rods","A setting rod is a full-size drawing, often on a board, showing the unit’s height, width and depth sections. Parts are marked out directly from it, so every joint and length is right."),
        O("Put making a unit in order",["Draw the setting rod","Produce the cutting list","Mark out from the rod","Cut and machine the parts","Dry-assemble, then glue up"],"The rod is the reference for everything."),
        Q("What happens if a marking-out error isn’t spotted?",["Parts won’t fit, wasting time and material","Nothing","The unit is stronger","It’s fixed by sanding"],"Check against the rod before cutting."),
        Q("What are face side and face edge marks for?",["So all marking out is from the same true faces","To show the best-looking side only","To mark waste","For the customer"],"Measuring from the same faces keeps parts consistent."),
        T("Floor units need to be fitted level even if the floor isn’t.",true,"Adjustable legs or packing get them level.")
      ]),
      lesson("jn-units2","Dust, safety and working for yourself","Controls, wellbeing and employment",[
        M("Match the equipment to its use",[["LEV","Extracting dust at the source"],["FFP3 mask","Filtering fine dust you breathe"],["Ear defenders","Protecting hearing near machines"],["Safety glasses","Stopping chips reaching your eyes"]]),
        L("Employment and business","You might be employed (PAYE, tax taken from pay), self-employed (you pay tax through Self Assessment) or run a limited company. In construction, the Construction Industry Scheme (CIS) deducts tax from subcontractors’ payments. A small business needs a plan, insurance such as public liability, and good records."),
        Q("Under CIS, what is the usual deduction for a registered subcontractor?",["20%","30%","0%","50%"],"30% if not registered; gross payment status means 0%."),
        M("Match the term to its meaning",[["PAYE","Tax taken from your wages by your employer"],["Self Assessment","You report and pay your own tax"],["Public liability insurance","Covers injury or damage to others"],["Business plan","Sets out what you’ll do and how it will pay"]]),
        T("Putting health and wellbeing first includes taking proper breaks.",true,"Tired people make mistakes.")
      ])
    ]),
    unit("Timber mouldings","Materials",[
      lesson("jn-mould1","Making and finishing mouldings","Profiles, machining and finishes",[
        L("Mouldings","Mouldings like architrave, skirting, dado and picture rail are shaped on a spindle moulder or router. Keep the profile consistent and machine with the grain to avoid tearing."),
        M("Match the moulding to where it goes",[["Architrave","Around a door or window opening"],["Skirting","Along the bottom of a wall"],["Dado rail","Part way up a wall"],["Picture rail","Near the top of a wall"]]),
        L("Finishing","Sand through the grits (for example 80, 120 then 180). Seal knots with knotting before priming. Then primer, undercoat and top coat, or a stain, varnish or oil for a natural look."),
        O("Put a painted finish in order",["Fill and sand smooth","Apply knotting to knots","Prime","Undercoat","Top coat"],"Each coat does a different job."),
        Q("Why seal knots before painting?",["Resin in knots bleeds through paint","To make them darker","To make it waterproof","It isn’t needed"],"Knotting stops resin staining the finish."),
        T("Sanding across the grain gives the best finish.",false,"Sand with the grain to avoid scratches that show through.")
      ]),
      lesson("jn-mould2","Sustainability and wellbeing","Forests, waste and looking after yourself",[
        L("Sustainable timber","FSC and PEFC certification show timber comes from well-managed forests. Use offcuts, recycle clean timber and dispose of treated or painted waste correctly."),
        Q("What does FSC or PEFC on timber show?",["It comes from responsibly managed forests","It’s fireproof","It’s hardwood","It’s pre-painted"],"Look for it when ordering."),
        M("Match the waste to what to do",[["Clean offcuts","Reuse for small parts or recycle"],["Sawdust","Bag it; some can be used as fuel or bedding"],["Treated timber","Dispose of as specified; don’t burn it"],["Empty paint tins","Hazardous or recycling waste as marked"]]),
        L("Wellbeing","Physical strain, stress and long days add up. Talk to someone, use your employer’s support or a mental health first aider, or call the Construction Industry Helpline (Lighthouse charity)."),
        Q("A friend at work says they can’t sleep and feel low. What’s a good first step?",["Listen, and help them find support","Tell them to toughen up","Ignore it","Post about it"],"Listening and pointing to support can really help."),
        T("Considering the environment includes switching off extraction and machines when not in use.",true,"It saves energy and cost.")
      ])
    ]),
    unit("Staircase spindles and balustrades","Staircase spindles",[
      lesson("jn-bal1","Balustrades and jigs","Parts, the rules and repeat cuts",[
        L("Balustrade parts","Newel posts at the ends, a handrail on top, a baserail (or the string) at the bottom and spindles (balusters) between. Gaps must not let a 100 mm sphere through, and a domestic handrail is about 900 mm above the pitch line."),
        M("Match the part to its description",[["Newel post","Main post at the end of a flight"],["Handrail","What you hold on to"],["Spindle","Upright filling the balustrade"],["Baserail","Bottom rail the spindles sit in"]]),
        Q("What is the largest gap allowed between spindles on a domestic stair?",["Less than 100 mm","150 mm","200 mm","There’s no limit"],"So a child’s head can’t pass through."),
        L("Jigs","A jig holds or guides work so repeated cuts are identical, like cutting every spindle end at the stair pitch. It saves time and improves accuracy."),
        Q("Why make a jig for cutting 20 spindles?",["Every cut comes out the same, quickly and safely","It looks professional","It uses more timber","It isn’t worth it"],"Jigs are ideal for repeat work."),
        T("A jig can also make a cut safer by holding small pieces away from the blade.",true,"It keeps your hands clear.")
      ]),
      lesson("jn-bal2","Awareness, teamwork and inclusion","Working safely with others",[
        Q("What causes most slips and trips?",["Cluttered floors, offcuts and trailing leads","Good lighting","Wearing boots","Clear signs"],"Keep the floor clear as you work."),
        L("Situational awareness","Keep an eye on what’s happening around you: people moving timber, machines starting, open stairwells and edges."),
        M("Match the teamwork habit to an example",[["Communicating","Telling others before moving a long board"],["Reliability","Finishing what you said you would"],["Helping","Lending a hand with a heavy lift"],["Respect","Listening to other people’s ideas"]]),
        Q("A new starter is being left out of breaks and chat. What could you do?",["Include them and introduce them to the team","Leave them to it","Join in leaving them out","Report them"],"Small actions build an inclusive team."),
        T("Good team working means only looking after your own job.",false,"Teams succeed together, including the wider build team.")
      ])
    ]),
    unit("Ironmongery","Ironmongery",[
      lesson("jn-iron1","Fitting ironmongery","Hinges, locks, handles and runners",[
        L("Fitting ironmongery","Hang doors on butt hinges, commonly about 150 mm from the top and 225 mm from the bottom, with a third hinge on heavy or fire doors. Mortice locks and latches are cut in square to the edge. Handles are usually about 1,000 mm from the floor. Drawer runners must be level and parallel."),
        O("Put fitting a mortice latch in order",["Mark the height and centre on the door edge","Drill and chisel the mortice","Fit the latch and mark the faceplate","Drill for the spindle and fit the handles","Mark and fit the striking plate on the frame"],"Mark carefully: mistakes in a door are hard to hide."),
        Q("Roughly where does the top hinge go?",["About 150 mm from the top","Right at the top edge","In the middle","500 mm down"],"And the bottom hinge about 225 mm from the bottom."),
        Q("A drawer won’t close smoothly. What’s the likely cause?",["The runners aren’t level or parallel","The handle is too big","The drawer is painted","It’s too light"],"Check both runners with a level and measure between them."),
        T("Fire doors often need three hinges.",true,"Always follow the door’s certification.")
      ]),
      lesson("jn-iron2","Hand tools, standards and fairness","Tools, regulations and inclusion",[
        M("Match the hand tool to its use",[["Mortise gauge","Marks both sides of a mortise at once"],["Sliding bevel","Sets out and copies angles"],["Tri-square","Checks and marks right angles"],["Smoothing plane","Final smoothing of a surface"]]),
        Q("How should chisels be stored?",["With edge guards, in a roll or rack","Loose in a bucket","Edge down on a bench","In a wet toolbox"],"Protecting the edge keeps it sharp and you safe."),
        M("Match the standard to what it is",[["British Standards","Agreed ways to make and fit things"],["Building Regulations","Legal requirements for buildings"],["Warranty standards","Quality rules for new homes"],["Manufacturer’s instructions","How to fit that product correctly"]]),
        Q("Which is an example of equity at work?",["Adjusting how training is given so everyone can take part","Treating everyone exactly the same whatever their needs","Only training the fastest learners","Letting people sort themselves out"],"Equity means fair access, which may need different support."),
        T("Seeking feedback on your work is a good way to improve.",true,"Ask your supervisor what you could do better.")
      ])
    ]),
    unit("Fixed Machinery","Fixed machinery",[
      lesson("jn-mach1","Fixed machines","Inspect, prepare and operate safely",[
        L("Fixed woodworking machines","Crosscut saw, band saw, surface planer and thicknesser, and mortiser. Only use them when trained and authorised. Before use: check guards, blades and extraction, set the machine up, and clear the area."),
        M("Match the machine to its job",[["Crosscut saw","Cutting timber to length"],["Band saw","Cutting curves and deep cuts"],["Planer and thicknesser","Making timber flat, square and to thickness"],["Mortiser","Cutting mortises"]]),
        O("Put using a machine in order",["Check you’re trained and authorised","Inspect guards, blades and extraction","Set up for the job and adjust the guard","Use push sticks to keep hands clear","Isolate the machine when finished"],"Isolate before any adjustment or blade change."),
        Q("How close should the band saw’s top guard be set?",["Just above the work","As high as it goes","It can be removed","Touching the table"],"The less blade exposed, the safer."),
        Q("A guard is damaged. What do you do?",["Don’t use the machine; isolate it and report it","Use it carefully","Tape it up","Ask a friend to watch"],"PUWER says equipment must be safe to use."),
        T("You should use a push stick when your hands would come close to the blade.",true,"Keep your hands well away from moving blades.")
      ]),
      lesson("jn-mach2","Fire, safe systems and modern methods","Workshop safety and how buildings are made",[
        M("Match the extinguisher to its use",[["Water (red)","Wood, paper and fabric"],["Foam (cream)","Flammable liquids"],["CO2 (black)","Electrical fires"],["Dry powder (blue)","Many types, including gas"]]),
        Q("Why is a dusty workshop a fire risk?",["Fine dust burns easily and can even explode","Dust is damp","Dust puts fires out","It isn’t a risk"],"Keep extraction working and the shop clean."),
        M("Match the document to what it does",[["Risk assessment","Finds hazards and controls"],["Method statement","Safe way to do the job"],["Toolbox talk","Short safety briefing"],["Induction","Rules when you start"]]),
        L("Modern methods of construction","Timber frame panels, structural insulated panels (SIPs), cross-laminated timber and volumetric modules are made in factories and assembled on site. Joinery for them must be accurate, because there’s little room to adjust."),
        T("Team-focus in a workshop includes leaving a machine clean and set safely for the next person.",true,"Good habits protect everyone.")
      ])
    ])
  ]);
})();
