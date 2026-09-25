/* Teach me: Bricklayer (ST0095). Lessons for every unit that between them cover the unit's KSBs.
   Mixing mortar is the first unit in the new style: short lessons where Evia teaches a bit, you try it, get
   feedback, learn something new, try again, then a quick challenge and a second go at anything you missed. It ends
   with a unit challenge. The other units still use the first, simpler style. */
(function(){
  const {L,Q,T,M,O,lesson,unit,add}=window.EVIA_TEACH;
  const bk=k=>({key:k,label:k[0].toUpperCase()+k.slice(1),pic:"bucket-"+k});
  const CHALLENGE={t:"banner",kind:"challenge",title:"Quick challenge",text:"A couple of harder ones to finish. Show what you’ve got!"};
  /* Mixing mortar: S14, K20 (ratios, silos, pre-mixed, gauging, hand and machine mixing), S1 and K1 (safety signs),
     S6 and K12 (how much to mix), S20 (teamwork) and B1 (health, safety and wellbeing first). */
  add("bricklayer",[{unit:"Mixing mortar",skill:"Mortar mixing",lessons:[
    {id:"mm1",title:"What’s in mortar",blurb:"The ingredients, and what a ratio means",
      surprise:{t:"choice",q:"You’ve tipped 3 buckets of cement onto the board for a 1:4 mix. How many buckets of sand go with them?",opts:["12","7","4","3"],a:0,why:"4 of sand for every 1 of cement: 3 × 4 = 12."},
      steps:[
      {t:"explore",title:"Meet the mix",pic:"ingredients",say:"Mortar bonds the bricks together, spreads the load evenly and keeps the weather out. Tap each ingredient.",spots:[
        {x:54,y:80,label:"Sand",text:"*Building sand* (soft sand) gives mortar its body. It’s most of the mix."},
        {x:158,y:46,label:"Cement",text:"Cement is the *binder*. Mixed with water it sets hard and holds everything together."},
        {x:205,y:82,label:"Water",text:"Clean water starts the cement setting and makes the mix workable."},
        {x:272,y:90,label:"Plasticiser",text:"A *plasticiser* makes mortar smoother and easier to spread. Some mixes use lime for this instead."}]},
      {t:"match",q:"Match each ingredient to its job",pairs:[["Sand","Gives the mix its body"],["Cement","Binds it as it sets"],["Water","Starts the set"],["Plasticiser","Makes it easier to spread"]],why:"Sand for body, cement to bind, water to start the set, plasticiser to help it spread."},
      {t:"teach",key:"Ratio",title:"Mixed by ratio",pic:"ratio",say:"Mortar is mixed by *ratio*, by volume. 1:4 means 1 part cement to 4 parts sand, using the same bucket for every part."},
      {t:"load",q:"Load a *1:3* mix onto the board",into:"Mixing board",items:[bk("cement"),bk("sand")],need:{cement:1,sand:3},hint:"1:3 is 1 bucket of cement and 3 of sand.",why:"1 part cement to 3 parts sand. The first number is the cement."},
      {t:"gap",text:"A 1:5 mix is 1 part [cement] to 5 parts [sand].",opts:["water","lime"],why:"The first number is the cement, the second the sand."},
      {t:"teach",title:"Three-part mixes",pic:"ratio3",say:"Some specifications add lime as a third part. *1:1:6* means 1 cement, 1 lime and 6 sand. The order is always cement, lime, sand."},
      {t:"tap",q:"The spec says 1:1:6. Tap the number for the lime.",text:"1 : {1} : 6",hint:"It goes cement, then lime, then sand.",why:"Cement : lime : sand, so the middle number is the lime."},
      {t:"teach",title:"Stronger isn’t better",pic:"cracks",say:"Mortar should be a bit weaker than the bricks. Then if the wall moves, cracks follow the joints, which can be raked out and repointed, instead of splitting the bricks."},
      {t:"tf",q:"The strongest mix is always the best choice.",a:false,why:"Too strong and the bricks crack instead of the joints. The specification sets the right mix for the job."},
      CHALLENGE,
      {t:"build",q:"What does *1:4* mean? Build it.",answer:"1 part cement to 4 parts sand",extra:["water","lime","3"],why:"1:4 is 1 part cement to 4 parts sand, measured by volume."},
      {t:"scene",who:"Your supervisor",say:"Can you get some mortar mixed for the garden wall?",q:"Nobody’s told you the mix. What do you do?",opts:[
        {text:"Check the specification, or ask what mix it needs",ok:true,why:"The spec sets the mix for the job. If you’re not sure, ask."},
        {text:"Make it 1:3 to be safe, as stronger is better",ok:false,why:"Stronger isn’t safer. Too strong and the bricks can crack. The spec sets the mix."},
        {text:"Use whatever you mixed on the last job",ok:false,why:"Every job can be different. Check the spec, or ask."}]}
    ]},
    {id:"mm2",title:"Gauging it right",blurb:"Measure the same way every time",
      surprise:{t:"tf",q:"Two batches mixed at the same ratio, but with sand from different deliveries, can dry a different colour.",a:true,why:"Sand colour varies between deliveries, so use the same sand for the whole job where you can."},
      steps:[
      {t:"teach",key:"Gauging",title:"Gauge every part",pic:"strike",say:"*Gauging* means measuring every part the same way, every time. Fill the bucket or gauge box, then strike it off level with a straight edge."},
      {t:"choice",q:"Which bucket is gauged properly?",opts:[{pic:"heaped"},{pic:"level"},{pic:"under"}],a:1,why:"Struck off level holds the same amount every time. Heaped holds more, and short holds less."},
      {t:"teach",title:"Why not count shovels?",pic:"banding",say:"Every shovelful is a different size, so the mix drifts. Batches come out different strengths and colours, and it shows as patchy joints on the finished wall."},
      {t:"judge",q:"Good gauging, or bad?",items:[
        {text:"Using the same bucket for the cement and the sand",good:true,why:"Same bucket, same size parts."},
        {text:"Heaping the bucket to save a trip",good:false,why:"A heaped bucket holds more, so the mix changes."},
        {text:"Counting shovelfuls of sand",good:false,why:"Shovelfuls vary in size."},
        {text:"Striking off each bucket level",good:true,why:"Level every time means the same amount every time."},
        {text:"Adding an extra bit of cement for luck",good:false,why:"It changes the strength and the colour."}]},
      {t:"teach",title:"Watch the sand",pic:"sandcover",say:"Sand left in the rain soaks up water. Wet sand already holds some, so add yours a little at a time. Keep sand covered, and use the same delivery for the whole job so the colour matches."},
      {t:"scene",who:"Your supervisor",say:"It rained all night and the sand’s soaked.",q:"How does that change your mixing?",opts:[
        {text:"Add water a little at a time, because the sand already holds some",ok:true,why:"Wet sand brings its own water. Add yours slowly until the mix is right."},
        {text:"Add the usual amount of water all at once",ok:false,why:"With wet sand, that makes a sloppy, weak mix."},
        {text:"Add extra cement to dry it out",ok:false,why:"That changes the ratio, so the strength and colour change too."}]},
      {t:"spot",q:"Jay mixed three batches for one wall. Tap the mistake.",lines:["Batch 1: 1 bucket of cement to 4 of sand, all struck off level","Batch 2: the same bucket, struck off level again","Batch 3: 1 bucket of cement, then 4 big shovelfuls of sand","Each time: water added a little at a time"],a:2,why:"Shovelfuls aren’t a measure. Batch 3 will be a different strength and colour from the rest of the wall."},
      {t:"quick",items:[
        {q:"Heaped buckets are fine if you’re in a hurry",a:false},
        {q:"Gauging keeps the colour the same from batch to batch",a:true},
        {q:"A gauge box is struck off level",a:true},
        {q:"Soaking wet sand needs extra water",a:false},
        {q:"Use the same bucket for every part",a:true}]}
    ]},
    {id:"mm3",title:"Mixing by hand",blurb:"Dry mix, make a well, add water, turn",
      surprise:{t:"tf",q:"Washing-up liquid is a good swap for plasticiser.",a:false,why:"It isn’t made for mortar and can put too much air in, which weakens it. Use a proper plasticiser at the dose on the tub."},
      steps:[
      {t:"watch",title:"Mixing by hand",frames:[
        {pic:"hand1",text:"Gauge the sand and cement onto a clean mixing board."},
        {pic:"hand2",text:"Turn it over dry until it’s one even colour, with no streaks."},
        {pic:"hand3",text:"Make a well in the middle and pour in some water, with the plasticiser mixed in if you’re using it."},
        {pic:"hand4",text:"Turn the dry mix in from the edges, adding water a little at a time, until it’s smooth and workable."}]},
      {t:"order",q:"Put the steps in order",items:["Gauge the sand and cement","Dry mix to one even colour","Make a well in the middle","Add water a little at a time","Turn it until it’s smooth and workable"],why:"Dry mixing first spreads the cement evenly before any water goes in."},
      {t:"teach",key:"Workable",title:"What good mortar looks like",pic:"consistency",say:"Good mortar is *workable*: one even colour, holds its shape on the trowel and spreads smoothly. Too wet, it slumps and runs. Too dry, it crumbles and won’t stick."},
      {t:"sort",q:"Too wet, just right or too dry?",bins:["Too wet","Just right","Too dry"],items:[
        {text:"Slumps and runs off the trowel",bin:0,why:"Too much water."},
        {text:"Crumbles and won’t stick to the brick",bin:2,why:"Not enough water to bind it."},
        {text:"Holds its shape and spreads smoothly",bin:1,why:"That’s workable mortar."},
        {text:"Water sitting on top of the mix",bin:0,why:"More water than the mix can hold."},
        {text:"Stiff and hard to spread",bin:2,why:"It needs a little more water."},
        {text:"Squeezes out and smears the face of the bricks",bin:0,why:"Sloppy mortar oozes out of the joints and stains the face."}]},
      {t:"choice",q:"Which trowel of mortar is just right?",opts:[{pic:"trowel-wet"},{pic:"trowel-good"},{pic:"trowel-dry"}],a:1,why:"It holds a neat shape with an even colour: not runny, not crumbly."},
      {t:"teach",title:"Use it in time",pic:"clock2h",say:"Only mix what you’ll use in about two hours. Once mortar starts to set, adding water just weakens it, so throw it away and mix fresh."},
      {t:"next",seq:["Dry mix to one even colour","Make a well in the middle","Pour some water into the well"],opts:["Turn the dry mix in from the edges","Leave it to soak for an hour","Tip the water off and start again"],a:0,why:"Turn it in from the edges, adding water a little at a time."},
      CHALLENGE,
      {t:"scene",who:"On site",say:"The mortar in your tub was mixed nearly three hours ago and it’s stiffening up.",q:"What now?",opts:[
        {text:"Throw it away and mix a fresh batch",ok:true,why:"Once it’s started to set it won’t bond properly. Next time, mix less, more often."},
        {text:"Add water and knock it back up",ok:false,why:"Adding water to mortar that’s setting weakens it."},
        {text:"Add some cement to bring it back",ok:false,why:"That won’t bring it back, and it changes the mix."}]},
      {t:"gap",text:"Dry mix until it’s one even [colour], then add water a little at a [time].",opts:["shape","bucket","batch"],why:"Even colour first, then water a little at a time."}
    ]},
    {id:"mm4",title:"Mixers, silos and pre-mix",blurb:"Machine mixing and ready-made mortar",
      surprise:{t:"choice",q:"What colour are the plugs and leads for 110 V site equipment?",opts:["Yellow","Blue","Red","Black"],a:0,why:"Yellow is 110 V. Blue is 230 V and red is 400 V."},
      steps:[
      {t:"explore",title:"The drum mixer",pic:"mixer",say:"For bigger batches you’ll use a drum mixer. Only use one if you’ve been shown how. Tap each part.",spots:[
        {x:196,y:50,label:"Drum",text:"Turns to mix the mortar. Tip each shovelful in at the mouth. Never put your hands, a shovel or a tool inside while it’s turning."},
        {x:104,y:92,label:"Tipping wheel",text:"Tilts the drum to empty the mortar into a barrow."},
        {x:170,y:98,label:"Motor",text:"Electric or petrol. Keep the guards on, and switch off before you clean or fix anything."},
        {x:150,y:141,label:"Stand",text:"Set it up level and stable on firm ground, out of the way of walkways."},
        {x:264,y:153,label:"110 V plug",text:"Electric tools and mixers on site usually run on 110 V, with yellow plugs and leads. Check the lead isn’t damaged."}]},
      {t:"teach",title:"Loading the mixer",pic:"mixload",say:"With the drum turning: some water first, then half the sand, the cement, the rest of the sand, then top up the water slowly. Let it mix for a few minutes."},
      {t:"order",q:"Load the mixer in the right order",items:["Some of the water","Half the sand","The cement","The rest of the sand","Top up the water slowly"],why:"Water first stops the mix sticking to the drum, and the cement goes in between the sand so it mixes in evenly."},
      {t:"hot",q:"Tap where you must never put your hands while it’s turning",pic:"mixer",a:0,spots:[
        {x:196,y:50,r:34,label:"Drum"},{x:104,y:92,r:17,label:"Tipping wheel",why:"You turn that wheel to tip the drum. Look for the part that mixes."},{x:170,y:98,r:12,label:"Motor"},{x:150,y:141,r:16,label:"Stand"},{x:264,y:153,r:14,label:"Plug"}],
        why:"The drum. Keep hands, gloves and tools out. Switch off and wait for it to stop before you clean it."},
      {t:"judge",q:"Safe or not?",labels:["Safe","Not safe"],items:[
        {text:"Scraping the drum with a shovel while it turns",good:false,why:"The shovel can be snatched and swung round."},
        {text:"Switching off and unplugging before cleaning inside",good:true,why:"No power means nothing can move."},
        {text:"Checking the guards are on before you start",good:true,why:"Guards keep hands and clothes away from moving parts."},
        {text:"Hitting the drum with a hammer to free stuck mortar",good:false,why:"It damages the drum. Clean it with water and some coarse aggregate while it turns, then tip it out."},
        {text:"Refuelling a petrol mixer while it’s running",good:false,why:"Switch off and let it cool first. Fuel on a hot engine can catch fire."}]},
      {t:"explore",title:"Silo mortar",pic:"silo",say:"Big sites often have a silo. The mix is set at the factory, so every batch comes out the same. Tap to see how it works.",spots:[
        {x:114,y:88,label:"Silo",text:"Holds dry mortar, already blended at the factory: sand, cement and any additives."},
        {x:152,y:139,label:"Mixer",text:"At the bottom, water is added and it’s mixed as it comes through."},
        {x:161,y:113,label:"Controls",text:"Start it, and stop when you’ve got enough. Only use it if you’ve been shown how."},
        {x:256,y:125,label:"Water supply",text:"A hose brings the water in at a set flow, so the mix stays the same."},
        {x:197,y:154,label:"Outlet",text:"Mixed mortar comes out here, into a barrow or tub."}]},
      {t:"teach",key:"Retarder",title:"Pre-mixed mortar",pic:"premix",say:"Ready-to-use mortar arrives wet in tubs. A *retarder* keeps it workable for a set time, often a day or two, so check the delivery ticket. Keep the lid on so it doesn’t dry out or get rained on."},
      {t:"match",q:"Match each way of getting mortar",pairs:[["By hand","Small amounts on a clean board"],["Drum mixer","Bigger batches, mixed for a few minutes"],["Silo","Big sites, the same mix every time"],["Pre-mixed tub","Ready to use, within its time"]],why:"Hand mixing for small amounts, a mixer for bigger batches, silos on big sites, and pre-mix ready to go."},
      CHALLENGE,
      {t:"label",q:"Label the silo",pic:"silo",spots:[
        {x:40,y:40,px:84,py:44,label:"Dry mortar"},{x:40,y:112,px:106,py:138,label:"Mixer"},{x:212,y:40,px:163,py:106,label:"Controls"},
        {x:276,y:80,px:283,py:126,label:"Water supply"},{x:262,y:152,px:203,py:152,label:"Outlet"}],
        why:"Dry mortar in the silo, water from the supply, mixed at the bottom, and out through the outlet."},
      {t:"scene",who:"Your labourer",say:"The silo mortar’s coming out much wetter than usual today.",q:"What’s the best thing to do?",opts:[
        {text:"Stop and tell your supervisor so it can be checked",ok:true,why:"Only someone trained should change the water setting. Reporting it keeps every batch right."},
        {text:"Use it anyway, as it’ll dry out on the wall",ok:false,why:"Wet mortar is weaker, slumps in the joints and stains the face."},
        {text:"Tip a bag of cement into the barrow to thicken it",ok:false,why:"That changes the mix. The silo’s mix is set at the factory."}]}
    ]},
    {id:"mm5",title:"Safe, sorted and together",blurb:"PPE, signs, how much to mix, teamwork",
      surprise:{t:"choice",q:"Which sign tells you to wear eye protection?",opts:[{pic:"sign-eyewash"},{pic:"sign-eyes"},{pic:"sign-warn"}],a:1,why:"A blue circle is a must-do sign: wear eye protection. The green one shows where the eyewash is."},
      steps:[
      {t:"cards",recall:true,title:"Warm up: can you remember these?",cards:[
        {front:"1:4",back:"1 part cement to 4 parts sand."},
        {front:"Gauging",back:"Measuring every part the same way, struck off level."},
        {front:"Workable",back:"Holds its shape on the trowel and spreads smoothly."},
        {front:"Retarder",back:"Keeps ready-to-use mortar workable for a set time."}]},
      {t:"explore",title:"Kit up to mix",pic:"ppe-close",say:"Wet cement is strongly alkaline. It can burn skin, sometimes without you feeling it until hours later. Tap to see what protects you.",spots:[
        {x:145,y:46,label:"Goggles",text:"Cement splashes and dust can seriously damage your eyes."},
        {x:174,y:66,label:"Dust mask",text:"For opening and tipping cement bags, which throws up fine dust."},
        {x:121,y:137,label:"Gloves",text:"Waterproof gloves keep wet cement off your hands. Don’t let it get inside them."},
        {x:160,y:92,label:"Long sleeves",text:"Keep your arms and legs covered, with hi-vis on top so you’re seen."},
        {x:147,y:193,label:"Boots",text:"Safety boots. Wet mortar inside a boot, or soaking through at the knees, can burn."}]},
      {t:"scene",who:"Your mate",say:"Argh, mortar’s just splashed in my eye!",q:"What do you do first?",opts:[
        {text:"Rinse it with clean water straight away, for at least 10 minutes, and get first aid",ok:true,why:"Use an eyewash or clean water for at least 10 minutes, then get first aid or medical help."},
        {text:"Tell them to rub it until it stops stinging",ok:false,why:"Rubbing grinds the grit in. Rinse it out."},
        {text:"Wait and see if it settles down",ok:false,why:"Cement can damage an eye quickly. Rinse it straight away."}]},
      {t:"cards",title:"Safety signs: tap each one to flip it",cards:[
        {pic:"sign-eyes",term:"Blue circle: must do",back:"A *mandatory* sign. This one says wear eye protection."},
        {pic:"sign-nosmoke",term:"Red ring and bar: must not",back:"A *prohibition* sign. This one says no smoking."},
        {pic:"sign-warn",term:"Yellow triangle: warning",back:"A *warning* sign: there’s a hazard. This one is general danger."},
        {pic:"sign-firstaid",term:"Green square: safe condition",back:"Shows safety equipment or the way out. This one is first aid."},
        {pic:"sign-extinguisher",term:"Red square: fire equipment",back:"Shows where fire-fighting kit is. This one is a fire extinguisher."}]},
      {t:"sort",q:"What kind of sign is it?",bins:["Must do","Must not","Warning","Safe condition","Fire equipment"],items:[
        {pic:"sign-hat",bin:0,why:"Blue circle: wear a hard hat."},
        {pic:"sign-gloves",bin:0,why:"Blue circle: wear gloves."},
        {pic:"sign-nophone",bin:1,why:"Red ring and bar: no mobile phones."},
        {pic:"sign-electric",bin:2,why:"Yellow triangle: danger, electricity."},
        {pic:"sign-eyewash",bin:3,why:"Green square: eyewash station."},
        {pic:"sign-extinguisher",bin:4,why:"Red square: fire extinguisher."}]},
      {t:"teach",title:"How much to mix",pic:"wall-est",say:"Work out what you’ll lay before the mortar starts to set, and mix just that. A half-brick wall takes about *60 bricks* a square metre."},
      {t:"gap",q:"Work it out",text:"A half-brick wall 5 m long and 1.2 m high is 6 m². At 60 bricks a square metre, that’s about [360] bricks.",opts:["300","72","600"],why:"5 × 1.2 = 6 m², and 6 × 60 = 360 bricks."},
      {t:"teach",title:"Mortar runs the job",pic:"team",say:"Tell your labourer what you’ll need and when, keep the mixing area tidy, and speak up early when cement or the silo is running low. Look out for each other too."},
      {t:"judge",q:"Good teamwork, or not?",labels:["Good","Not good"],items:[
        {text:"Telling your labourer you’ll need more mortar in half an hour",good:true,why:"A heads-up means nobody’s left waiting."},
        {text:"Leaving the hose and mixer lead across the walkway",good:false,why:"It’s a trip hazard for everyone."},
        {text:"Letting the site manager know the silo’s nearly empty",good:true,why:"A refill takes time to arrange."},
        {text:"Keeping quiet about a faulty mixer so work isn’t held up",good:false,why:"Report it and don’t use it. Faulty kit puts everyone at risk."},
        {text:"Checking a new starter has been shown how to use the mixer",good:true,why:"Looking out for each other keeps everyone safe."}]},
      {t:"quick",items:[
        {q:"A red ring with a bar means you must not",a:true},
        {q:"A yellow triangle means you must do something",a:false},
        {q:"Green signs show a safe condition, like first aid",a:true},
        {q:"Wet cement can burn without you feeling it at first",a:true},
        {q:"It’s fine to mix a whole day’s mortar first thing",a:false},
        {q:"110 V leads and plugs are yellow",a:true}]}
    ]},
    {id:"mm6",title:"Unit challenge",blurb:"Ten questions from across the unit",challenge:true,steps:[
      {t:"banner",kind:"trophy",title:"Unit challenge",text:"Ten questions from across the unit, getting harder as you go. No teaching this time: it’s all you!",go:"I’m ready",xp:"+50 XP for finishing"},
      {t:"choice",q:"Which bucket would you use to gauge?",opts:[{pic:"heaped"},{pic:"under"},{pic:"level"}],a:2,why:"Struck off level: the same amount every time."},
      {t:"match",q:"Match each sign to what it means",pairs:[[{pic:"sign-eyes"},"Wear eye protection"],[{pic:"sign-nosmoke"},"No smoking"],[{pic:"sign-firstaid"},"First aid"],[{pic:"sign-warn"},"Warning: danger"]],why:"Blue must do, red must not, yellow warning, green safe condition."},
      {t:"load",q:"You need a bigger batch. Load a *1:4* mix using *2* buckets of cement.",into:"Mixer",items:[bk("cement"),bk("sand")],need:{cement:2,sand:8},hint:"Twice the cement means twice the sand.",why:"2 of cement means 2 × 4 = 8 of sand. Same ratio, bigger batch."},
      {t:"order",q:"Load the mixer in the right order",items:["Some of the water","Half the sand","The cement","The rest of the sand","Top up the water slowly"],why:"Water first, cement in between the sand, then top up the water slowly."},
      {t:"label",q:"Label the PPE for mixing",pic:"ppe-person",spots:[
        {x:48,y:30,px:142,py:32,label:"Hard hat"},{x:48,y:70,px:145,py:50,label:"Goggles"},{x:48,y:140,px:114,py:137,label:"Gloves"},
        {x:272,y:52,px:171,py:61,label:"Dust mask"},{x:272,y:112,px:185,py:112,label:"Hi-vis"},{x:272,y:180,px:180,py:194,label:"Boots"}],
        why:"Hard hat, goggles, a dust mask for tipping bags, hi-vis over long sleeves, gloves and boots."},
      {t:"gap",text:"Wet cement is [alkaline], so it can [burn] your skin.",opts:["acidic","cool"],why:"Wet cement is strongly alkaline and can cause serious burns."},
      {t:"tf",pic:"cracks",q:"Cracks that split the bricks, instead of following the joints, can be a sign the mortar was too strong.",a:true,why:"Mortar should be a bit weaker than the bricks, so any cracking stays in the joints."},
      {t:"scene",who:"Your supervisor",say:"It’s half three. You knock off at half four and you’ll lay about 100 more bricks.",q:"How much mortar do you mix?",opts:[
        {text:"Just enough for about 100 bricks",ok:true,why:"Mix what you’ll use. Anything left at the end of the day is waste."},
        {text:"A full mixer, to be on the safe side",ok:false,why:"Most of it would go off before it’s used. That’s wasted cement and money."},
        {text:"None: use this morning’s leftovers in the tub",ok:false,why:"This morning’s mortar will have started to set, so it won’t bond properly."}]},
      {t:"hot",q:"Tap the sign that shows where first aid is",pic:"signs4",a:3,spots:[{x:44,y:42,r:33,label:"Blue sign"},{x:121,y:42,r:33,label:"Red sign"},{x:198,y:42,r:33,label:"Yellow sign"},{x:275,y:42,r:33,label:"Green sign"}],why:"The green square with a white cross is first aid."},
      {t:"build",q:"Build the golden rule for mixers",answer:"Never reach into a turning drum",extra:["always","gloves","mixer"],why:"Switch off and wait for it to stop before anything goes in."}
    ]}
  ]}]);
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
