/* Teach me: English, Functional Skills Level 2, one lesson per area, with workplace examples. No off-the-job time. */
(function(){
  const {L,Q,T,M,O,lesson,unit}=window.EVIA_TEACH,fs={fs:"english"};
  window.EVIA_TEACH.fs.push(
    unit("Reading","",[
      lesson("e2-read","Reading","Skimming, scanning and reading closely",[
        L("Three ways to read","Skim to get the gist (headings, first lines). Scan to find one thing fast (a date, a size, a name). Read closely when every detail matters, like a method statement."),
        M("Match the task to the way to read",[["Find the delivery date on a letter","Scan"],["See what a leaflet is about","Skim"],["Follow a risk assessment","Read closely"]]),
        Q("You need to know if a safety notice applies to your job. What should you do first?",["Skim the heading and first lines","Read every word twice","Scan for your name","Ignore it until break"],"Skimming tells you quickly whether it’s relevant, then you read closely if it is."),
        T("Headings, bullet points and bold text help you find information quickly.",true,"Writers use layout features to guide the reader. Use them.")
      ]),
      lesson("e2-understand","Understanding information","Main points, purpose and meaning",[
        L("Main point and purpose","Ask: what is this mostly about (main point)? Why was it written (purpose)? Is it to inform, instruct, persuade or describe?"),
        M("Match the text to its main purpose",[["A method statement","Instruct"],["A timber merchant’s advert","Persuade"],["A site newsletter","Inform"],["A holiday brochure","Describe and persuade"]]),
        Q("“Hard hats must be worn beyond this point.” What is the purpose?",["To instruct","To persuade","To entertain","To describe"],"It tells you what to do."),
        Q("If you meet a word you don’t know, what’s a good first step?",["Use the words around it to work out the meaning","Skip the whole paragraph","Guess and move on","Stop reading"],"Context often gives the meaning. Check a dictionary if it still isn’t clear."),
        T("The main point is always in the last sentence.",false,"It’s often near the start, especially in workplace documents. Look for it in headings and opening lines.")
      ]),
      lesson("e2-find","Finding and selecting information","Getting what you need from documents",[
        L("Find and select","Know what you’re looking for before you start. Use contents pages, headings, tables and indexes. Pick only the information that answers the question."),
        Q("Which part of a manual helps you find a topic fastest?",["The contents page or index","The front cover","The last page","The copyright notice"],"They list topics with page numbers."),
        O("Put these in order to find information in a long document",["Decide exactly what you need","Check the contents or index","Scan the right section","Read that part closely"],"Narrow it down before reading in detail."),
        Q("A delivery note lists 12 items. You need to check the wall ties arrived. What do you do?",["Scan the list for wall ties and check the quantity","Read every word from the top","Count all 12 items","Phone the supplier first"],"Scanning finds the line you need; then check the detail."),
        T("You should copy out everything you read in case it’s useful.",false,"Select only what answers your question, or your notes get too long to use.")
      ]),
      lesson("e2-compare","Comparing information","Spotting similarities and differences",[
        L("Comparing texts","When you compare, look at the same things in each: what they say, who wrote them, why, how up to date they are and how they present it."),
        Q("Two suppliers quote for the same sand. What should you compare?",["Price, delivery time and what’s included","Only the logo","Only the price","How long the email is"],"The cheapest isn’t always best value if delivery or extras differ."),
        Q("Two websites give different drying times for a product. Which do you trust?",["The manufacturer’s data sheet","The one with more pictures","The first one you found","Neither, just guess"],"Go to the most reliable, official source."),
        M("Match the comparison word to its meaning",[["Similarly","The same"],["However","Different"],["Both","Shared by two"],["Whereas","A contrast"]]),
        T("A newer version of a document can replace information in an older one.",true,"Always check the date or version number, especially on drawings and method statements.")
      ]),
      lesson("e2-fact","Fact, opinion and bias","Telling them apart",[
        L("Fact, opinion and bias","A fact can be checked and proved. An opinion is what someone thinks or feels. Bias is when a text only gives one side, or leans towards what the writer wants you to think."),
        Q("Which of these is a fact?",["Cement is alkaline","This is the best brick on the market","Everyone loves our service","Our bricks look amazing"],"It can be checked and proved. The others are opinions."),
        Q("Which of these is an opinion?",["Our service is second to none","The delivery arrived at 9am","The board is 18 mm thick","The quote includes VAT"],"“Second to none” is a judgement, not something you can measure."),
        Q("Which word often shows an opinion?",["Best","Measured","Weighs","Contains"],"Words like best, amazing and worst show judgement, not fact."),
        Q("An advert for a power tool only quotes happy customers. This is an example of…",["Bias","A fact","A formal report","An instruction"],"It leaves out anything negative to persuade you."),
        T("An opinion can be useful even though it isn’t a fact.",true,"An experienced tradesperson’s opinion is valuable. Just know it’s an opinion.")
      ]),
      lesson("e2-infer","Inference and conclusions","Reading between the lines",[
        L("Inference","Inference means working out what isn’t said directly, using clues in the text. A conclusion is a judgement based on the evidence you’ve read."),
        Q("A note says: “Please make sure the mixer is clean before you leave today.” What can you infer?",["It hasn’t always been left clean","The mixer is new","You’re leaving early","The mixer is broken"],"People don’t usually write reminders unless there’s been a problem."),
        Q("A supervisor writes: “Great effort on the wall. Let’s look at the joints tomorrow.” What’s the best conclusion?",["The work is good but the joints need improving","The wall must be taken down","The joints are perfect","You’re in trouble"],"Praise first, then a clue that the joints need attention."),
        T("An inference should be backed up by evidence in the text.",true,"Point to the words that led you to your conclusion.")
      ])
    ],fs),
    unit("Spelling, punctuation and grammar","",[
      lesson("e2-spell","Spelling","Common mistakes and trade words",[
        L("Spelling tricks","Say it in syllables (sep-a-rate). Look for a word inside a word (there’s ‘a rat’ in separate). Learn the trade words you use most."),
        Q("Which is spelt correctly?",["Necessary","Neccessary","Necesary","Neccesary"],"One collar (c) and two sleeves (ss): necessary."),
        Q("Which is spelt correctly?",["Measurement","Mesurement","Measurment","Measuremant"],"Measure + ment."),
        M("Match the word to its meaning",[["Their","Belonging to them"],["There","A place"],["They’re","They are"],["Where","Which place"]]),
        Q("Pick the correct spelling of the part above an opening.",["Lintel","Lentil","Lintle","Lintal"],"A lentil is a pulse. A lintel spans an opening."),
        T("“Accommodation” has a double c and a double m.",true,"Accommodation has room for two c’s and two m’s.")
      ]),
      lesson("e2-punct","Punctuation","Full stops, commas, apostrophes and more",[
        L("The main marks","Full stop: ends a sentence. Comma: separates items in a list or parts of a sentence. Apostrophe: shows something belongs (the joiner’s saw) or letters are missed out (don’t). Question mark: ends a question."),
        Q("Which uses the apostrophe correctly?",["The supervisor’s van is here.","The supervisors van’s is here.","The supervisor’s van’s is here.","The supervisors’s van is here."],"The van belongs to the supervisor: supervisor’s van."),
        Q("Which list is punctuated correctly?",["We need sand, cement, lime and water.","We need sand cement lime and water.","We need, sand, cement, lime and water.","We need sand, cement, lime, and, water."],"Commas separate list items; ‘and’ joins the last two."),
        M("Match the mark to its job",[["Full stop","Ends a sentence"],["Question mark","Ends a question"],["Comma","Separates items in a list"],["Apostrophe","Shows belonging or missing letters"]]),
        T("“Its” with no apostrophe means belonging to it.",true,"It’s = it is. Its = belonging to it: the wall and its footing.")
      ]),
      lesson("e2-grammar","Grammar","Tenses, agreement and complete sentences",[
        L("Grammar basics","A sentence needs a subject and a verb and must make sense on its own. Keep to one tense. Make the verb agree with the subject: the brick is, the bricks are."),
        Q("Which sentence is correct?",["The bricks were delivered this morning.","The bricks was delivered this morning.","The bricks is delivered this morning.","The bricks been delivered this morning."],"Plural subject (bricks) takes were."),
        Q("Which is a complete sentence?",["I checked the level.","Checked the level.","Because the level.","The level and the square."],"It has a subject (I) and a verb (checked) and makes sense."),
        Q("Which keeps the same tense?",["I measured the gap and cut the board.","I measured the gap and cut the board tomorrow.","I measure the gap and cutted the board.","I will measured the gap."],"Both verbs are in the past."),
        T("“Me and him fitted the door” is correct in a formal report.",false,"Use “He and I fitted the door” in formal writing.")
      ]),
      lesson("e2-vocab","Vocabulary","Choosing the right word",[
        L("The right word","Choose words that are precise and suit the reader. Technical terms are fine for your trade, but explain them for a customer. Formal writing avoids slang."),
        M("Match the informal word to a formal one",[["Sorted","Completed"],["Loads of","A large number of"],["Fixed up","Repaired"],["Get","Obtain"]]),
        Q("Which word is most precise?",["Plumb","Straight-ish","Good","Fine"],"Plumb means exactly vertical."),
        Q("Which is best in a report to a customer?",["The frame was secured with 100 mm screws.","We banged it in with big screws.","It’s well solid now.","Screws went in lol."],"Clear, precise and formal."),
        T("Using a long word is always better than a short one.",false,"Use the clearest word. Short, plain words are often best.")
      ])
    ],fs),
    unit("Writing","",[
      lesson("e2-clear","Writing clearly and accurately","Plan, paragraph and proofread",[
        L("Clear writing","Plan what you want to say. Use paragraphs: one main idea each. Keep sentences short. Then proofread: check spelling, punctuation and that it makes sense.","write"),
        O("Put the writing process in order",["Plan your points","Write a first draft","Read it back","Correct mistakes"],"Proofreading catches most mistakes."),
        Q("When should you start a new paragraph?",["When you move to a new main idea","After every sentence","Only at the end","Never in a report"],"Paragraphs group sentences about one idea."),
        Q("Which is clearer?",["The skip is full. Please book another one.","The skip which is full and which I noticed earlier is now in a state that means another needs booking.","Skip full book another please now.","Skip."],"Short, complete sentences are easiest to read."),
        T("Reading your work out loud helps you spot mistakes.",true,"You hear missing words and clumsy sentences.")
      ]),
      lesson("e2-purpose","Writing for different purposes and audiences","Tone, format and who’s reading",[
        L("Purpose and audience","Ask who will read it and why. A note to a workmate can be informal; a letter to a customer or your assessor should be formal. The purpose (inform, instruct, persuade, request) shapes what you include."),
        M("Match the reader to the right tone",[["A workmate","Friendly and informal"],["A customer","Polite and formal"],["Your assessor","Formal and detailed"],["The site manager","Clear and professional"]]),
        Q("You’re writing to a customer about a delay. Which opening fits?",["Dear Mrs Patel,","Hiya!","Oi,","To whoever,"],"A formal letter or email starts with Dear and the person’s name."),
        Q("Which would persuade a manager to buy a new tool?",["Explain how it saves time and money, with figures","Say you really want it","Say everyone else has one","Just order it"],"Persuasive writing uses reasons and evidence."),
        T("The same message can need different wording for different readers.",true,"Change the tone and detail to suit the reader.")
      ]),
      lesson("e2-email","Emails and workplace communication","Clear, polite and to the point",[
        L("A good work email","Clear subject line. Greeting. Say why you’re writing in the first line. Keep it short, one topic. Polite sign-off with your name. Check the right person is in the ‘To’ box before sending."),
        Q("Which is the best subject line?",["Delivery for 14 High St on Friday","Hi","Important!!!","Stuff"],"It tells the reader what the email is about."),
        O("Put the parts of an email in order",["Subject line","Greeting","Why you’re writing","Details","Sign-off and name"],"The reader should know the point by the end of the first line."),
        Q("Which sign-off suits a work email?",["Kind regards, Sam","Luv Sam xx","Laters","Bye bye"],"Keep it professional."),
        T("Writing in capital letters in an email can come across as shouting.",true,"Use normal sentences; bold a key point if you need to.")
      ]),
      lesson("e2-report","Reports and formal writing","Structure, headings and facts",[
        L("Writing a report","A report has a title, a short introduction, headings for each section, facts in a logical order, and a conclusion or recommendation. Use formal language and the third person or ‘I’ carefully."),
        O("Put a report in order",["Title","Introduction","Findings under headings","Conclusion","Recommendations"],"Readers can jump to the part they need."),
        Q("Which sentence suits a formal report?",["Two bricks on the third course were cracked and have been replaced.","Loads of bricks were smashed lol.","Honestly the wall was a disaster.","Bricks = broken."],"Factual, precise and formal."),
        Q("What goes in the conclusion?",["A summary of what you found","A brand new topic","Jokes","Your contact list"],"Sum up the findings; recommendations say what should happen next."),
        T("Headings make a report easier to read.",true,"They break it into sections the reader can find quickly.")
      ]),
      lesson("e2-instruct","Instructions and explanations","Steps in order, one action each",[
        L("Writing instructions","Number the steps. Start each with a verb (Check, Fit, Measure). One action per step. Put safety warnings before the step they apply to. Explanations say how or why something happens."),
        O("Put these instructions in order",["Wear gloves and eye protection","Measure and mark the cut","Clamp the board","Make the cut","Sand the edge"],"Safety first, then each action in the order it happens."),
        Q("Which is the best instruction?",["Check the frame is plumb with a spirit level.","The frame should, if possible, be looked at in terms of plumbness.","Plumb frame.","Do the frame thing."],"Starts with a verb and says exactly what to do."),
        Q("Where should a safety warning go?",["Before the step it applies to","After the last step","At the end of the document","It isn’t needed"],"People need the warning before they do the risky step."),
        T("An explanation tells you why or how something happens, not just what to do.",true,"Instructions say what to do; explanations help you understand.")
      ])
    ],fs),
    unit("Speaking and listening","",[
      lesson("e2-speak","Speaking and listening","Clear speaking and active listening",[
        L("Speaking and listening","Speak clearly at a steady pace and use words the listener knows. Listen actively: look at the speaker, don’t interrupt, and check you’ve understood by summing up or asking a question."),
        M("Match the skill to an example",[["Active listening","Nodding and summing up what you heard"],["Clarifying","“Do you mean the left-hand door?”"],["Body language","Facing the speaker, not your phone"],["Clear speaking","Steady pace, no mumbling"]]),
        Q("Your supervisor gives you instructions you don’t fully understand. What do you do?",["Ask a question to check","Nod and guess","Say nothing","Ask someone else later"],"Asking straight away avoids mistakes."),
        Q("Which question checks understanding best?",["“So you want the skirting fitted in the hall first?”","“Yeah?”","“What?”","“Whatever you say.”"],"Repeating back the key detail confirms you’ve understood."),
        T("On a noisy site, it’s fine to shout instructions from far away.",false,"Get closer, use hand signals, or step somewhere quieter. Check they heard you.")
      ]),
      lesson("e2-discuss","Discussions and presentations","Taking part and presenting ideas",[
        L("Discussions and presentations","In a discussion: listen, take turns, build on others’ points, disagree politely with reasons. In a presentation: plan a start, middle and end, speak to the audience not your notes, and invite questions."),
        O("Put a short presentation in order",["Say what you’ll talk about","Give your main points","Give an example","Sum up","Ask for questions"],"Tell them what you’ll say, say it, then sum up."),
        Q("Which is a polite way to disagree?",["“I see your point, but I think we should check the drawing first.”","“That’s rubbish.”","“Whatever.”","Walk away"],"Acknowledge their view, then give your reason."),
        Q("How do you help a quiet colleague in a discussion?",["Ask for their view by name","Talk over them","Ignore them","Finish their sentences"],"Inviting them in is inclusive and often brings good ideas."),
        T("It’s good practice to rehearse a presentation out loud first.",true,"You’ll spot bits that don’t flow and feel more confident.")
      ])
    ],fs)
  );
})();
