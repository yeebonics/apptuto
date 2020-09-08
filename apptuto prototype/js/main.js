apptuto = {
   init: function() {
      apptuto.updateTest();
   },
   pos: 0, 
	correctAnswers: 0, 
	bookmarks: [],
   answers: [], 
   isPaused: false,
   updateTest: function() { // if test is over > renderRev, else renderQuestion
      $.getJSON("js/quizData.json", function(data){ (apptuto.pos >= data.length) ? apptuto.renderRev() : apptuto.renderQ(data);})
   },
   renderQ: function(data) {
      var currentPos = data[apptuto.pos];
         $("#q").html(currentPos["Q"]);
         $("#QID").html(currentPos["QID"]);
         $("#q-num").html(apptuto.pos + 1);
         $("#A").html(currentPos["answers"]["A"]);
         $("#B").html(currentPos["answers"]["B"]);
         $("#C").html(currentPos["answers"]["C"]);
   },
   renderRev: function() {
      $("#quiz-content").addClass("hidden"); 
      $("#review-section").css("display", "block"); 
      clock.togglePause();
      $.getJSON("js/quizData.json", function(data){
         for(var i=0; i < data.length; i++) {
            var index = data[i],
               currentAnswer = index.ans,
               options = data[i]["answers"];

            apptuto.reviewTest(i, currentAnswer);
            apptuto.createReviewSection(i, index, options, currentAnswer);
         }
      })
   },
   reviewTest: function(currentIndex, currentAnswer){
      var time;
      // add to correct counter / post remaining time
      if(apptuto.answers[currentIndex] == currentAnswer) { apptuto.correctAnswers ++;} 
      (clock.setTime == -1) ? time = "Out of Time" : time = clock.setTime + " seconds";
      
      $("#rScore").html(apptuto.correctAnswers + "/ 10");
      $("#rPercent").html(Math.round((apptuto.correctAnswers/10 * 100)));
      $("#rTime").html(time);
   },
   createReviewSection: function(i, index, options, currentAnswer) {
      var cor, 
         actualAnswer = index["ans"],
         answerSection = '<div class="r-ans">',
         bm;
    
         (apptuto.answers[i] == currentAnswer) ? cor = "correct" : cor = "incorrect";
         (apptuto.bookmarks[i] == true) ? bm = "active" : bm = "";
         
         // -> index: A, B, C / if index == correct-ans > .correct / if it != correct-ans && != user's answer .incorrect 
         for(answerIndex in options) {
            var userAnswer = apptuto.answers[i],
               string;
            if(answerIndex == index.ans) { string = `<div class="ans-opt correct"><span>${answerIndex} </span> ${index["answers"][answerIndex]}</div>`;} 
            else if ( (answerIndex != index.ans) && (answerIndex ==userAnswer) || (userAnswer == undefined) ) {string = `<div class="ans-opt incorrect"><span>${answerIndex} </span> ${index["answers"][answerIndex]}</div>`;} 
            else {string = `<div class="ans-opt"><span>${answerIndex} </span> ${index["answers"][answerIndex]}</div>`;}
            answerSection = answerSection + string;
         }
         answerSection += `</div>`;

         var sec1 = `
            <div class="review-section">
               <div class="review-header">
                  <div class="question-number">
                     <div class="label ${cor}"></div>
                     <span> ${"Question: " + (i+1)}</span>
                  </div>
                  <span class="star ${bm}">&#9733;</span>
               </div>
               <div class="question-review">
                  <div class="b"><span> ${"QID: " + index["QID"]}</span></div>
                  <div class="r-sec"> ${index["Q"]}</span></div>`;
         var sec3 = `      
                  <div class="b">Relevant LOS</div>
                  <div class="r-sec">${index["LOS"]}</div>
                  <div class="b">Explanation</div>
                  <div>${index["explanation"]}</div>
               </div>
            </div>`;
         $("#results").append(sec1+answerSection+sec3);
   }
}

clock = {
   i: 1, 
   setTime: 59,
   initialOffset: '440', // circumference in px
   timer(time, paused){
      var time = clock.setTime,
         paused = apptuto.isPaused
      if (time < 0) { 
         $('.time').text(time);
         clearInterval(incrementTimer);
         apptuto.renderRev();
         return;
      } else if(!paused && time< 10) {
         $('.circle_animation').css("stroke", "red");
         clock.updateTimer();
      } else if(!paused && time < 30) {
         $('.circle_animation').css("stroke", "yellow");
         clock.updateTimer();
      } else if(!apptuto.isPaused){
         clock.updateTimer();  
      }
   },
   updateTimer: function () {
      //return false; // pauses timer for dev
      $('.time').text(clock.setTime);
      $('.circle_animation').css('stroke-dashoffset', clock.initialOffset-((clock.i+1)*(clock.initialOffset/60)));
      clock.i++;
      clock.setTime --; 
   },
   togglePause: function(){ // app !paused > pause it
      (!apptuto.isPaused) ? apptuto.isPaused = true : apptuto.isPaused = false;
   }
}

var incrementTimer = window.setInterval(clock.timer, 1000); // calls function every second

$("#submit").click(function(e){ // submit / error tooltip anim / push answers
   if( $(".option.active").length == 0 ) {
      $(".nxt-alert").addClass("active");
      $(".nxt-alert").on("animationend", function(){ $(this).removeClass("active");});
      return false;
   } else {
      apptuto.pos++;
      apptuto.answers.push($(".option.active").attr('data-option'));
      ($("#bookmark").hasClass("bookmarked")) ? apptuto.bookmarks.push(true) : apptuto.bookmarks.push(false);
      $("#bookmark").removeClass("bookmarked");
      $("#bookmark > .btn-nm").text("Bookmark");
      $(".option").removeClass("active");
      apptuto.updateTest();
   }  
})

$("#bookmark").click(function(){ // toggle bookmark and text
   $(this).toggleClass("bookmarked");
   ($("#bookmark > .btn-nm").text() == "Bookmark") ? $("#bookmark > .btn-nm").text("Bookmarked") : $("#bookmark > .btn-nm").text("Bookmark");
})

$("#pause").click(function(e){ // modal overlay
   $(".overlay, .overlay-mod").addClass("show");
   clock.togglePause();
})

$("#ov-resume").click(function(){ // toggles overlay / resumes
   $(".overlay-mod").removeClass("show");
   setTimeout(function(){
      $(".overlay").removeClass("show")
   }, 500);

   clock.togglePause();
})

$(".option").each(function(index){ // adds active class to options
   $(this).on("click", function(){
      $(".option").removeClass("active");
      $(this).addClass("active");
   })
})

$( document ).ready(function() { apptuto.init(); });