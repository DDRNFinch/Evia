/* Teach me: Maths, Functional Skills Level 2, one lesson per area, with site examples. No off-the-job time. */
(function(){
  const {L,Q,T,M,O,lesson,unit}=window.EVIA_TEACH,fs={fs:"maths"};
  window.EVIA_TEACH.fs.push(
    unit("Number","",[
      lesson("m2-num","Number and calculations","Big numbers, order of operations and checking",[
        L("Order of operations","Work out brackets first, then powers, then × and ÷, then + and −. So 3 + 4 × 5 = 3 + 20 = 23, not 35."),
        Q("What is 6 + 3 × 4?",["18","36","13","24"],"Multiply first: 3 × 4 = 12, then 6 + 12 = 18."),
        Q("What is (6 + 3) × 4?",["36","18","27","24"],"Brackets first: 6 + 3 = 9, then 9 × 4 = 36."),
        Q("A pallet holds 400 bricks. How many bricks on 7 pallets?",["2,800","2,400","3,200","1,100"],"400 × 7 = 2,800."),
        L("Estimate to check","Round to easy numbers to check an answer is sensible. 48 × 21 is about 50 × 20 = 1,000, so 1,008 looks right and 10,080 doesn’t."),
        Q("Roughly, what is 198 × 52?",["About 10,000","About 1,000","About 100,000","About 5,000"],"198 is about 200 and 52 is about 50: 200 × 50 = 10,000."),
        T("−5 + 8 = 3",true,"Start at −5 and count up 8: you pass zero and land on 3. Negative numbers come up with temperatures and levels below datum."),
        Q("It’s −2 °C at 7am and 9 °C at noon. How much has it warmed up?",["11 °C","7 °C","9 °C","−11 °C"],"From −2 up to 0 is 2, then up to 9 is 9 more: 2 + 9 = 11.")
      ]),
      lesson("m2-fdp","Fractions, decimals and percentages","Switching between them and working them out",[
        L("Three ways to say the same thing","½ = 0.5 = 50%. ¼ = 0.25 = 25%. ¾ = 0.75 = 75%. ⅒ = 0.1 = 10%. To turn a percentage into a decimal, divide by 100."),
        M("Match the ones that are equal",[["½","50%"],["¼","0.25"],["¾","75%"],["⅒","0.1"]]),
        Q("What is 15% of 200?",["30","15","20","300"],"10% of 200 is 20, 5% is 10, so 15% is 30."),
        Q("A £240 tool is reduced by 25%. What’s the sale price?",["£180","£215","£60","£200"],"25% of 240 is 60, so 240 − 60 = £180."),
        Q("What is ⅗ of 45 m?",["27 m","9 m","25 m","30 m"],"45 ÷ 5 = 9, then 9 × 3 = 27."),
        Q("Which is biggest?",["0.7","⅔","65%","0.65"],"⅔ is about 0.667, so 0.7 is the biggest."),
        T("Adding 10% then taking 10% off gets you back where you started.",false,"100 + 10% = 110. Then 10% of 110 is 11, so 110 − 11 = 99, not 100.")
      ]),
      lesson("m2-ratio","Ratio and proportion","Sharing, scaling and best buys",[
        L("Ratio","A ratio compares amounts. 1:4 cement to sand means 5 parts in total: 1 part cement and 4 parts sand.","ratio"),
        Q("Share 30 buckets in the ratio 1:5. How many are sand (the 5)?",["25","5","6","20"],"1 + 5 = 6 parts. 30 ÷ 6 = 5 per part, so sand is 5 × 5 = 25."),
        Q("A mix uses 2 bags of cement for 10 bags of sand. How much sand for 5 bags of cement?",["25 bags","20 bags","15 bags","50 bags"],"Sand is 5 times the cement, so 5 × 5 = 25."),
        L("Direct proportion","If one amount doubles and the other doubles too, they’re in direct proportion. Find the value of one, then multiply: the unitary method."),
        Q("4 m of skirting costs £18. How much for 10 m?",["£45","£40","£72","£28"],"One metre is £18 ÷ 4 = £4.50. Ten metres is £45."),
        Q("Which is the best buy for screws?",["200 for £9","100 for £5","50 for £2.60","25 for £1.40"],"Per 100: £4.50, £5.00, £5.20 and £5.60. 200 for £9 is cheapest per screw."),
        T("If 3 people take 6 days, 6 people will take 12 days.",false,"More people means less time here: 6 people take about 3 days. That’s inverse proportion.")
      ]),
      lesson("m2-money","Money and financial calculations","Pay, VAT, budgets and deductions",[
        L("Working with money","Always show pounds to two decimal places: £4.5 is £4.50. Check totals against a quick estimate."),
        Q("You work 37.5 hours at £12.40 an hour. What’s your pay before deductions?",["£465.00","£446.40","£480.00","£372.00"],"37.5 × 12.40 = 465."),
        Q("Materials cost £150 before VAT at 20%. What’s the total?",["£180","£170","£150.20","£120"],"20% of 150 is 30, so £180."),
        Q("A price including 20% VAT is £96. What was it before VAT?",["£80","£76.80","£86","£72"],"£96 is 120% of the price, so 96 ÷ 1.2 = £80."),
        O("Put the steps for checking a quote in order",["Read what’s included","Add up the costs","Add VAT if it isn’t included","Compare with your budget"],"Know what you’re paying for before you do the sums."),
        T("Overtime at time and a half on £12 an hour is £18 an hour.",true,"1.5 × £12 = £18.")
      ])
    ],fs),
    unit("Measures, shape and space","",[
      lesson("m2-measure","Measures and units","Metric units, converting and time",[
        L("Metric units","Length: 10 mm = 1 cm, 1,000 mm = 1 m, 1,000 m = 1 km. Mass: 1,000 g = 1 kg, 1,000 kg = 1 tonne. Capacity: 1,000 ml = 1 litre.","tape"),
        M("Match the equal amounts",[["2.5 m","2,500 mm"],["1.2 kg","1,200 g"],["750 ml","0.75 litres"],["3 tonnes","3,000 kg"]]),
        Q("A bag of cement is 25 kg. How many bags make 1 tonne?",["40","25","400","4"],"1 tonne is 1,000 kg: 1,000 ÷ 25 = 40."),
        Q("A job starts at 07:45 and finishes at 16:15 with a 30-minute break. How long is the working time?",["8 hours","8½ hours","9 hours","7½ hours"],"07:45 to 16:15 is 8½ hours, minus 30 minutes = 8 hours."),
        Q("You cut three 850 mm lengths from a 3 m board. How much is left?",["450 mm","550 mm","2,150 mm","150 mm"],"3 × 850 = 2,550 mm. 3,000 − 2,550 = 450 mm (ignoring saw cuts)."),
        T("A kerf (saw cut) takes a little off each cut, so allow for it.",true,"A few millimetres per cut soon adds up over several lengths.")
      ]),
      lesson("m2-shape","Shape, space and angles","Angles, right angles and properties of shapes",[
        L("Angles","A right angle is 90°. Angles on a straight line add to 180°. Angles in a triangle add to 180°, and in a four-sided shape to 360°."),
        Q("Two angles of a triangle are 90° and 35°. What’s the third?",["55°","65°","45°","125°"],"180 − 90 − 35 = 55°."),
        L("Checking square: 3-4-5","A triangle with sides 3, 4 and 5 always has a right angle. On site, measure 3 m one way and 4 m the other: if the diagonal is 5 m, the corner is square."),
        Q("Using the 3-4-5 rule, sides of 6 m and 8 m should give a diagonal of…",["10 m","12 m","14 m","9 m"],"Double 3-4-5 is 6-8-10."),
        M("Match the shape to its property",[["Square","4 equal sides, 4 right angles"],["Rectangle","Opposite sides equal, 4 right angles"],["Equilateral triangle","3 equal sides and angles"],["Circle","Every point the same distance from the centre"]]),
        T("The two diagonals of a rectangle are the same length.",true,"That’s why builders check a rectangle is square by comparing its diagonals.")
      ]),
      lesson("m2-apv","Area, perimeter and volume","Walls, floors, concrete and circles",[
        L("Perimeter and area","Perimeter is the distance around the edge. Area is length × width, in m². A 4 m by 3 m room has a perimeter of 14 m and an area of 12 m².","area"),
        Q("A room is 5 m by 4 m. How much skirting for the perimeter (ignore the door)?",["18 m","20 m","9 m","40 m"],"5 + 4 + 5 + 4 = 18 m."),
        Q("A wall is 6 m long and 2.5 m high with a 1 m × 2 m door. What area needs building?",["13 m²","15 m²","17 m²","10 m²"],"6 × 2.5 = 15 m², minus the door 2 m² = 13 m²."),
        L("Volume","Volume is length × width × depth, in m³. A trench 10 m long, 0.6 m wide and 0.2 m deep holds 10 × 0.6 × 0.2 = 1.2 m³ of concrete."),
        Q("A slab is 4 m × 3 m × 0.1 m. How much concrete?",["1.2 m³","12 m³","0.12 m³","7.1 m³"],"4 × 3 × 0.1 = 1.2 m³."),
        Q("The area of a circle is π × r². About how much is a circle with a 2 m radius?",["12.6 m²","6.3 m²","4 m²","25.1 m²"],"3.14 × 2 × 2 ≈ 12.6 m²."),
        T("Doubling the length and width of a floor doubles its area.",false,"It makes the area four times bigger: 2 × 2 = 4.")
      ]),
      lesson("m2-scale","Scale and drawings","Reading scales, plans and elevations",[
        L("Scale","A scale of 1:50 means 1 mm on the drawing is 50 mm in real life. Drawings on site are often 1:50, 1:20 or 1:100."),
        Q("On a 1:50 drawing a wall measures 80 mm. How long is it really?",["4 m","400 mm","40 m","1.6 m"],"80 × 50 = 4,000 mm = 4 m."),
        Q("A 3 m opening drawn at 1:20 measures…",["150 mm","60 mm","300 mm","15 mm"],"3,000 ÷ 20 = 150 mm."),
        M("Match the view to what it shows",[["Plan","Looking down from above"],["Elevation","Looking straight at a side"],["Section","A slice through to show inside"],["Detail","A small part drawn larger"]]),
        T("If a dimension is written on the drawing, use it rather than measuring the drawing.",true,"Written dimensions are exact. Measuring a printed drawing can be out if it’s been copied or scaled.")
      ])
    ],fs),
    unit("Handling data","",[
      lesson("m2-data","Data, charts and graphs","Tables, bar charts, pie charts and line graphs",[
        L("Reading charts","Check the title, the axes and the scale before you read a value. A line graph shows change over time; a bar chart compares amounts; a pie chart shows parts of a whole."),
        M("Match the chart to what it’s best for",[["Line graph","Change over time"],["Bar chart","Comparing amounts"],["Pie chart","Parts of a whole"],["Table","Exact values"]]),
        Q("In a pie chart, half the waste is timber. What angle is its slice?",["180°","90°","50°","360°"],"A whole pie is 360°, so half is 180°."),
        Q("A bar chart’s scale goes up in 5s. A bar stops halfway between 20 and 25. What’s its value?",["22.5","22","25","21"],"Halfway between 20 and 25 is 22.5."),
        T("A graph with a vertical axis that doesn’t start at zero can make small differences look big.",true,"Always check the scale before comparing.")
      ]),
      lesson("m2-avg","Averages and range","Mean, median, mode and range",[
        L("Four measures","Mean: add them up and divide by how many. Median: the middle value when in order. Mode: the most common. Range: biggest minus smallest (how spread out)."),
        Q("Hours worked: 6, 8, 7, 9, 5. What’s the mean?",["7","8","6","35"],"6 + 8 + 7 + 9 + 5 = 35, and 35 ÷ 5 = 7."),
        Q("Find the median of 12, 4, 9, 7, 15.",["9","7","12","47"],"In order: 4, 7, 9, 12, 15. The middle one is 9."),
        Q("Deliveries per day: 3, 5, 3, 8, 3, 6. What’s the mode?",["3","5","8","4.7"],"3 appears most often."),
        Q("What’s the range of 14, 22, 9, 30?",["21","30","9","16"],"30 − 9 = 21."),
        T("One very large value changes the median more than the mean.",false,"It’s the other way round: the mean is pulled by extreme values; the median barely moves.")
      ]),
      lesson("m2-prob","Probability","How likely something is",[
        L("Probability","Probability goes from 0 (impossible) to 1 (certain). It can be a fraction, decimal or percentage. Probability = number of ways it can happen ÷ total number of outcomes."),
        Q("A box has 3 faulty and 17 good hinges. What’s the chance of picking a faulty one?",["3/20","3/17","17/20","1/3"],"3 faulty out of 20 in total."),
        Q("The chance of rain is 30%. What’s the chance of no rain?",["70%","30%","60%","100%"],"The probabilities add up to 100%."),
        O("Put these from least to most likely",["Impossible","Unlikely","Even chance","Likely","Certain"],"The probability scale runs from 0 to 1."),
        T("If a coin lands heads 3 times in a row, tails is more likely next time.",false,"Each flip is still 50:50. The coin doesn’t remember.")
      ])
    ],fs),
    unit("Algebra and problem solving","",[
      lesson("m2-alg","Formulae and algebra","Using and rearranging formulae",[
        L("Using a formula","A formula is a rule with letters for numbers. Area of a rectangle: A = l × w. Put the numbers in and work it out."),
        Q("Cost = £45 × days + £30. What is the cost for 4 days?",["£210","£300","£180","£79"],"45 × 4 = 180, plus 30 = £210."),
        Q("If 3x + 5 = 20, what is x?",["5","15","8.3","25"],"Take 5 from both sides: 3x = 15. Divide by 3: x = 5."),
        Q("Number of bricks = 60 × area. How many for 8.5 m²?",["510","480","85","600"],"60 × 8.5 = 510."),
        Q("A = l × w. The area is 24 m² and the length is 6 m. What is the width?",["4 m","18 m","30 m","144 m"],"Rearrange: w = A ÷ l = 24 ÷ 6 = 4 m."),
        T("In 2a + 3a, you can simplify to 5a.",true,"Like terms add together.")
      ]),
      lesson("m2-solve","Problem solving","Multi-step problems on site",[
        L("A method for problems","Read it twice. Pick out what you know and what you need. Choose the steps, do them one at a time, show your working, then check the answer makes sense."),
        O("Put the problem-solving steps in order",["Read the problem carefully","Pick out what you know and what you need","Work it out step by step","Check your answer makes sense"],"Showing each step gets you marks even if a sum slips."),
        Q("A 4.8 m wall needs posts every 1.2 m, including both ends. How many posts?",["5","4","6","8"],"4.8 ÷ 1.2 = 4 gaps, so 5 posts."),
        Q("Boards come in packs of 6 at £42 a pack. You need 20 boards. What’s the cost?",["£168","£140","£126","£210"],"20 ÷ 6 = 3.33, so buy 4 packs: 4 × £42 = £168."),
        Q("A van does 40 miles per gallon. A 150-mile round trip uses how much fuel?",["3.75 gallons","4 gallons","3 gallons","190 gallons"],"150 ÷ 40 = 3.75."),
        T("It’s fine to round down the number of packs you need to buy.",false,"If you need part of a pack, you still have to buy the whole pack: round up.")
      ])
    ],fs)
  );
})();
