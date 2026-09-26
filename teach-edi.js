/* Teach me: equality, diversity and inclusion (EDI), for every course. Built on the Equality Act 2010, with site
   examples. Like maths and English, it doesn't log off-the-job time. */
(function(){
  const {TE,CD,Q,T,M,O,G,S,J,SC,CHAL,lesson,unit}=window.EVIA_TEACH,edi={fs:"edi"};
  window.EVIA_TEACH.fs.push(
    unit("Equality, diversity and inclusion","",[
      lesson("edi-what","What EDI means","Equality, diversity and inclusion at work",[
        CD("Three words",[["Equality","Equality","Everyone treated fairly and given the same chances"],["Diversity","Diversity","Valuing the ways people are different"],["Inclusion","Inclusion","Everyone feels welcome and can take part"]]),
        TE("Why it matters on site","A crew that treats everyone fairly works *safer* and *better*: people speak up about problems, and good workers stay. The *Equality Act 2010* makes fair treatment the law.","team"),
        M("Match the word to an example",[["Equality","The same pay and training for the same job"],["Diversity","A crew of different ages and backgrounds"],["Inclusion","Asking the quiet new starter what they think"]],"Fair chances, valuing differences, everyone taking part."),
        CHAL(),
        Q("Which law protects people from discrimination at work in Great Britain?",["The Equality Act 2010","The Health and Safety at Work Act 1974","The Building Regulations","The Data Protection Act 2018"],"The Equality Act 2010."),
        T("Fair treatment matters in the office, but not on site.",false,"It applies to every workplace, site included.")
      ]),
      lesson("edi-protected","Protected characteristics","The nine things the law protects",[
        TE("Nine protected characteristics","It’s against the law to treat you unfairly because of your *age*, *disability*, *gender reassignment*, *marriage or civil partnership*, *pregnancy and maternity*, *race*, *religion or belief*, *sex* or *sexual orientation*."),
        J("Is it a protected characteristic?",[["Age",true,"Young or old."],["Religion or belief",true,"Having no religion counts too."],["The football team you support",false,"Not protected."],["Disability",true,"It can include hidden conditions."],["Your taste in music",false,"Not protected."]],["Protected","Not protected"]),
        TE("What they cover","*Race* includes colour, nationality and ethnic or national origin. *Disability* can include hidden conditions, like diabetes or some mental health conditions, when they have a big, long-term effect on everyday life."),
        CHAL(),
        Q("How many protected characteristics are there?",["Nine","Five","Twelve","Three"],"Nine, all in the Equality Act 2010."),
        G("Treating someone unfairly because of a protected characteristic is called [discrimination].",["promotion","appraisal"],"That’s discrimination.")
      ]),
      lesson("edi-types","Types of discrimination","Direct, indirect, harassment and victimisation",[
        CD("Four kinds",[["Direct","Direct discrimination","Treating someone worse because of who they are"],["Indirect","Indirect discrimination","A rule for everyone that puts one group at a disadvantage, with no good reason"],["Harassment","Harassment","Unwanted behaviour linked to who someone is, that upsets, humiliates or intimidates them"],["Victimisation","Victimisation","Treating someone badly because they complained, or backed up a complaint"]]),
        S("Which kind is it?",["Direct","Indirect","Harassment","Victimisation"],[["Not offering a woman a site job because she’s a woman",0,"Worse treatment because of her sex."],["A rule that everyone works every Saturday, with no real need, which rules out some faiths",1,"The same rule for all, but unfair on one group."],["Jokes about a colleague’s religion that humiliate him",2,"Unwanted and linked to his religion."],["Leaving someone off overtime because they reported harassment",3,"Punished for complaining."]]),
        CHAL(),
        T("If you didn’t mean to offend, it can’t be harassment.",false,"What counts is the effect on the person, not what you meant."),
        Q("A new starter reports racist comments and then gets all the worst jobs. What is that?",["Victimisation","Indirect discrimination","Fair treatment","Positive action"],"Being punished for complaining is victimisation.")
      ]),
      lesson("edi-banter","Banter or bullying?","Respect on site and speaking up",[
        TE("Where banter stops","Banter is fine when *everyone’s* laughing. It crosses the line when it’s aimed at one person, keeps happening, or picks on who they are.","team"),
        J("Fine, or over the line?",[["A joke the whole crew is in on, including the person it’s about",true,"Everyone’s laughing."],["A nickname about someone’s accent or skin colour",false,"Linked to race: harassment."],["Copying the way a colleague with a stammer speaks",false,"Picking on a disability."],["Wolf-whistling at someone walking past the site",false,"Sexual harassment."]],["Fine","Over the line"]),
        O("If you see someone being picked on",["Check it’s safe to step in","Ask them to stop, or help the person away","Check the person is OK afterwards","Report it to your supervisor, site manager or training provider"],"Act if it’s safe, support, then report."),
        SC("A workmate’s jokes","A workmate keeps making jokes about a new labourer’s religion. The labourer laughs along but looks uncomfortable.","What do you do?",[["Speak up or report it, and check the labourer is OK","Laughing along doesn’t mean it’s welcome."],["Nothing, he’s laughing","He may feel he has to."],["Join in so you fit in","Then you’re part of it."]]),
        CHAL(),
        Q("As an apprentice, who can you report discrimination to?",["Your supervisor, site manager, HR or your training provider","No one: you just put up with it","Only the police","Only your workmates"],"You have lots of people to go to, including your tutor or assessor."),
        T("An employer can be held responsible for harassment by its staff.",true,"So employers must take it seriously.")
      ]),
      lesson("edi-include","Making work inclusive","Reasonable adjustments and fair choices",[
        TE("Reasonable adjustments","Employers must make *reasonable adjustments* so disabled workers aren’t held back: instructions read out as well as written, extra time in tests, or a flashing or vibrating fire alarm for someone who’s deaf. The government’s *Access to Work* scheme can help pay."),
        J("A reasonable adjustment?",[["Coloured overlays and extra time for a dyslexic apprentice",true,"Helps them show what they know."],["A vibrating pager alarm for a deaf worker",true,"They’ll know when to get out."],["Refusing to explain a drawing a second time",false,"That’s just unhelpful."],["Telling someone to keep their condition quiet",false,"That isn’t support."]],["Yes","No"]),
        TE("Snap judgements","Everyone makes snap judgements about people, often without noticing. Catch yourself, and judge people on their *skills and work*, not their age, sex or background."),
        Q("A 50-year-old starts an apprenticeship. Someone says they’re too old to learn. That comment is…",["Age discrimination","Fair comment","Just banter","Good advice"],"Age is protected, and anyone can learn a trade."),
        CHAL(),
        SC("A new apprentice","A new apprentice has diabetes and asks for short breaks to check their blood sugar.","What should the employer do?",[["Allow the breaks as a reasonable adjustment","A small change that keeps them safe at work."],["Refuse: breaks are breaks","That could be disability discrimination."],["Tell them to find another job","That’s discrimination."]]),
        T("Inclusion means giving everyone exactly the same, whatever they need.",false,"Sometimes fair means different support, like reasonable adjustments.")
      ])
    ],edi)
  );
})();
