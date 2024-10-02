$( document ).ready(function() {
    window.grade = '1';    	
    getKanjiByGrade();
});

function getKanjiByGrade() {
    $.ajax({
        type: 'GET',
        url:'https://kanjiapi.dev/v1/kanji/grade-'+window.grade,
        dataType: "json",
    
        success: function(result){
            window.kanji = result;
    
            $.each(result, function(index, value) {
                let kanjiCard = '<div class="kanji-card card col-md-3" style="width: 18rem;" id="kanji_'+value+'"><a href="#ex1" rel="modal:open"'
                + '<div class="card" style="width: 18rem; height: 18rem;">'
                + '<h5 class="align-middle text-center fs-1" style="margin-top: 50%">'+ value + '</h5>'
                + '</div>'
                + '</a></div>';
    
                $('#card-row').append(kanjiCard);
            });
        }
      });
}

$(document).on('click', '[id^="btn-grade-"]', function() {
    const gradeRegex = /([^-]+$)/;
    let previousGradestr = "#btn-grade-"+window.grade;
    window.grade = gradeRegex.exec($(this).attr('id'))[0];
    $(previousGradestr).removeClass('btn btn-secondary');
    $(previousGradestr).addClass('btn btn-primary');
    $(this).addClass('btn btn-secondary')
    $('#card-row').html('');  
    
    getKanjiByGrade();
});

function getTranslateKanji() {
    $('#card-row').html('');

    let randomKnaji = window.kanji[Math.floor(Math.random()*window.kanji.length)];
    console.log(randomKnaji);
    //TODO: refactor
    $.ajax({
        type: 'GET',
        url:'https://kanjiapi.dev/v1/kanji/' + randomKnaji,
        dataType: "json",

        success: function(result){
            window.kanjiMeaning = result.heisig_en;
            let kanjiCard = '<div class="kanji-card" style="width: 18rem;" id="kanji_'+randomKnaji+'">'
            + '<div class="card" style="width: 18rem; height: 18rem;">'
            + '<h5 class="align-middle text-center fs-1" style="margin-top: 50%">'+ randomKnaji + '</h5>'
            + '</div>'
            + '</div>';

            let input = '<input type="text" class="form-control mt-3" id="translate-input">';
            let checkBtn = '<button id="submit-translate-btn" type="button" class="btn btn-primary mt-3">Check</button>'
            $('#translate-div').append(kanjiCard);
            $('#translate-div').append(input);
            $('#translate-div').append(checkBtn);
        }
    });
}


$(document).on('click', '#mode-translate', function() {
    getTranslateKanji();        
});


$(document).on('click', '#submit-translate-btn', function() {
    let translateInput = $('#translate-input');
//todo: include other meanings
    if (translateInput.val() == window.kanjiMeaning || window.kanjiMeaning.includes(translateInput.val())) {
        translateInput.addClass('bg-success');
    } else {
        translateInput.addClass('bg-danger');
        let correctMeaningSpan = '<div id="correct-meaning">'+window.kanjiMeaning+'</span>';
        $('#translate-div').append(correctMeaningSpan);
    }

    let translateNewKanjiBtn = '<button id="translate-new-kanji-btn" type="button" class="btn btn-primary mt-3">New Kanji</button>';
    $('#submit-translate-btn').remove();
    $('#translate-div').append(translateNewKanjiBtn);
});


$(document).on('click', '#translate-new-kanji-btn', function() {
    $('#translate-div').html('');
    getTranslateKanji();
});

function createStringFromArray(array) {
    let arrayStr = '';
    $.each(array, function(index, value) {
        let isLastElement = index == array.length -1;
        if(!isLastElement) {
            arrayStr += value + ', ';
        } else {
            arrayStr += value;
        }
    });
    return arrayStr;
}

function getRandomWord() {
    let randomWordArray = window.words[Math.floor(Math.random()*window.words.length)];
            
    let meaningsStr = createStringFromArray(randomWordArray['meanings'][0]['glosses']);
   
    let pronoundedArray = [];
    let writtenArray = [];

    let pronouncedStr = '';
    let writtenStr = '';

    $.each(randomWordArray['variants'], function(index, value) {
        pronoundedArray.push(value['pronounced']);
        writtenArray.push(value['written']);
    });

    pronouncedStr = createStringFromArray(pronoundedArray);
    writtenStr = createStringFromArray(writtenArray);
    let wordsHtml = '<li id="word-li" class="list-group-item"> Word: ' + meaningsStr + '</li>'
        + '<li id="written-li" class="list-group-item"> Written: ' + writtenStr + '</li>'
        + '<li id="pronounced-li" class="list-group-item"> Pronounced: ' + pronouncedStr + '</li>'
    $("#kanji-info-ul").append(wordsHtml);
}


$(document).on('click', '[id^="kanji_"]', function() {
    let newWordbtn = '<button id="new-word-btn" type="button" class="btn btn-primary mt-3">Get New Word</button>';
    
    let kanji = $(this).attr('id').split("_").pop();
    $.ajax({
        type: 'GET',
        url:'https://kanjiapi.dev/v1/kanji/' + kanji,
        dataType: "json",
    
        success: function(result){
            let kunReadingsStr = createStringFromArray(result.kun_readings);
            let nameReadingsStr = createStringFromArray(result.name_readings);
            let onReadingsStr = createStringFromArray(result.on_readings);
            let meaningsReadingsStr = createStringFromArray(result.meanings);

            let kanjiModalContents = '<div class="card" style="width: 100%;">'
            + '<div class="card-header">'
            + 'Details for Kanji: ' + kanji 
            + '</div>'
            + '<ul class="list-group list-group-flush" id="kanji-info-ul">'
            + '<li class="list-group-item"> Heisig Meaning: ' + result.heisig_en + '</li>'
            + '<li class="list-group-item"> Other Meanings: ' + meaningsReadingsStr + '</li>'
            + '<li class="list-group-item"> Kun Readings: ' + kunReadingsStr + '</li>'
            + '<li class="list-group-item"> Name Readings: ' + nameReadingsStr + '</li>'
            + '<li class="list-group-item"> On Readings: ' + onReadingsStr + '</li>'
            + '</div>';
            $('#ex1').html(kanjiModalContents);
        } 
        
      });

      $.ajax({
        type: 'GET',
        url:'https://kanjiapi.dev/v1/words/' + kanji,
        dataType: "json",
    
        success: function(result){
            window.words = result;
            getRandomWord();
            $('#ex1').append(newWordbtn);
        } 
      });
});


$(document).on('click', '[id="new-word-btn"]', function() {
    $('#word-li').remove();
    $('#written-li').remove();
    $('#pronounced-li').remove();
    getRandomWord();
});