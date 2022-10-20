import { exampleDataset } from './dataset_example.js'
import { KEY } from './key.js';
import { dataset } from './dataset.js'
$(document).ready(main);

/* ------------------------------------------------------------------------------------------ */
/* Main params
/* ------------------------------------------------------------------------------------------ */
// Constant parameters 
var TIME_BETWEEN_QUESTIONS = 1000;
const MAX_REQUESTS = 7;
const DEBUG = 0;
const condition = 'cf';

// global variables
var currentQuestionIndex = 0;
var currentInstructionIndex = 0;
var savedState = 0;
var state = 'instructions';
var wait = false;
var prolificID = new URLSearchParams(window.location.search).get('PROLIFIC_PID');
var reset = new URLSearchParams(window.location.search).get('RESET');
var packID = new URLSearchParams(window.location.search).get('PACK_ID');
var startTime = undefined;
var rt = undefined;
if (!prolificID) prolificID = 'notfound';
if (packID == undefined) packID = Math.floor(Math.random()*256);

// get global from string with e.g. window["currentQuestionIndex"]()
window.getGlobal = () => {
    return {
        "currentQuestionIndex": currentQuestionIndex,
        "currentInstructionIndex": currentInstructionIndex,
    }
}

const pack_id = await $.ajax({
    type: 'POST',
    async: true,
    data: {"maxInt":nb_keys},
    url: 'php/get_index.php',
    success: function (r) {return r;},
    error: function (r) {console.log('error getting index');}
});

var data = {
    "prolific_id": prolificID,
    "index_bloc":pack_id
}

sendToDB(0, { ...data }, 'php/insert_index.php');

/* ------------------------------------------------------------------------------------------ */
/* start functions
/* ------------------------------------------------------------------------------------------ */

function main() {
    init();
};

// Initialization functions go here
const init = async () => {

    var json = await $.getJSON("db.json");
    var packs = [json[pack_id],json[pack_id+1]];
    var new_question;

    const nb_simple_questions = dataset.questions.length;

    for (var j=0;j<packs.length;j++){
        for (var i=0;i<packs[j].length;i++){
            new_question = {}
            new_question["text"] = packs[j][i].question;
            new_question["answers"] = packs[j][i].answers;
            new_question["entered"] = 0;
            new_question["type"]  = "single";
            new_question["index"] = j*8+i;
            dataset.questions.push(new_question);
        }
    }
    //Shuffle database
    dataset.questions = dataset.questions.sort((a,b) => 0.5 - Math.random());

    if (reset == 1 && DEBUG) resetState();

    //toggleProgressBar()
    loadState()
    updateProgessBarStatus()
    setProlificID()

    if (currentQuestionIndex == 0)
        dataset.questions = shuffle(dataset.questions);

    if (state == 'end') {
        loadEndPanel()
        return
    }
    cr_ContinueButton()

    // debugger;
    loadInstructions(dataset.instructions[currentInstructionIndex], true);
}

/*----------------------------------------------------------------------------------------------- */
/* Save data
/*----------------------------------------------------------------------------------------------- */
const saveAnswer = (txt, question) => {
    // question.entered = question.entered.join(",")
    question.entered = txt;
}

// Assigns answered question attributes to elements that have been entered by user previously
const loadPreviousEnteredChoice = (entered) => {
    for (let i = 0; i < entered.length; i++) {
        selectAnswer(entered[i], true)
    }
}

// re-assigns text to short/long form questions
const loadPreviousEnteredText = () => {
    let entered = dataset.questions[currentQuestionIndex].entered
    if (entered.length > 0) {
        let answer = document.getElementById(`questionTextarea`);
        answer.innerHTML = entered[0];
    }
}

const sendItemData = async (idx) => {
    let data = {
        "prolificID": prolificID,
        "questionID": dataset.questions[idx].index,
        "packID": pack_id,
        "question": (dataset.questions[idx].text),//+'\n'+dataset.questions[idx].answers[0]+'\n'+dataset.questions[idx].answers[1]),
        "answer": dataset.questions[idx].entered[0],
        "prob": dataset.questions[idx].entered[1].toString(),
        "initVal":dataset.questions[idx].initVal.toString(),
        "cond": condition,
        "rt": rt,
    }

    if (DEBUG) {
        // if debug notify with the content of sent data
        removeAllNotification()
        let text = '';
        Object.entries(data).forEach(([k, v]) => { text += `<b>${k}</b>: ${v} <br>` })
        notify(text, 'Sent data', 1)
    }

    sendToDB(0, { ...data }, 'php/insert.php');

    let additional = "additional" in dataset.questions[idx]
    if (additional) {
        let add_data = dataset.questions[idx].additional;
        data['questionID'] = idx;
        data['sequenceID'] = 1;
        //data['question'] = add_data.dilemma;
        data['answer'] = add_data.entered;

        if (DEBUG) {
            // if debug notify with the content of sent data
            let text = '';
            Object.entries(data).forEach(([k, v]) => { text += `<b>${k}</b>: ${v} <br>` })
            notify(text, 'Sent data', 2)

        }

        sendToDB(0, { ...data }, 'php/insert.php');

    }
}


/* ------------------------------------------------------------------------------------------ */
/* State Management
/* ------------------------------------------------------------------------------------------ */
const saveState = () => {
    localStorage['savedState'+condition] = 1
    localStorage['state'+condition] = state
    localStorage['currentQuestionIndex'+condition] = currentQuestionIndex
    localStorage['currentInstructionIndex'+condition] = currentInstructionIndex
    localStorage['answers'+condition] = JSON.stringify(dataset.questions)
    localStorage['prolificID'+condition] = prolificID;
}

window.resetState = () => {
    localStorage['state'+condition] = 'instructions'
    localStorage['currentQuestionIndex'+condition] = 0
    localStorage['currentInstructionIndex'+condition] = 0
    localStorage['answers'+condition] = ""
    localStorage['prolificID'+condition] = 'reset';
    localStorage['savedState'+condition] = 0
    window.location = window.location.href.split('?')[0] + '?PROLIFIC_PID=' + prolificID;
}

const setProlificID = () => {
    let div = document.getElementById('prolific-id')
    div.innerHTML = 'id: ' + prolificID;

}

const loadState = () => {
    if (!parseInt(localStorage['savedState'+condition]))
        return

    localStorage['savedState'+condition] = 1;

    if (prolificID == 'notfound') {
        prolificID = localStorage['prolificID'+condition];
    }

    currentQuestionIndex = parseInt(localStorage['currentQuestionIndex'+condition]);
    currentInstructionIndex = parseInt(localStorage['currentInstructionIndex'+condition])

    currentInstructionIndex -= currentInstructionIndex == dataset.instructions.length;

    state = localStorage['state'+condition] == 'end' ? 'end' : 'instructions';

    if (localStorage['answers'+condition] != undefined && localStorage['answers'+condition].length > 0)
        dataset.questions = JSON.parse(localStorage['answers'+condition]);
}

const loadEndPanel = async () => {
    await moveQuestionContainer('up', 'down')
    await moveQuestionContainerMiddle()
    removeAllChildren('quiz-question-container')
    appendTitle('END')
    appendInfo('', 'This is the <b>end</b> of the questionnaire, <b>thanks for participating</b>! <br> <b><a id="end" href="' + atob(KEY) + '"> Validate your participation</a></b>', [], true, "regular")
}

/*----------------------------------------------------------------------------------------------- */
/* Instruction management
/*----------------------------------------------------------------------------------------------- */
// Loads a multiple choice quiz question
const loadInstructions = async (inst, init) => {
    saveState()
    appendTitle(inst.title)
    let asHTML = true;
    for (let i = 0; i < inst.items.length; i++) {
        if (inst.items[i].type == 'checkbox') {
            appendCheckbox(inst.items[i].text, 'c'+i);
        } else {
            appendInfo(inst.items[i].title, inst.items[i].text, inst.items[i].variables, asHTML, inst.items[i].type)
        }
    }

    // appendScenario(`You've completed ${currentQuestionIndex} items so far.`, asHTML)
    //showHideContinueButton(dataset.instructions[currentInstructionIndex])

    // Skips loading animation on initialization
    await moveQuestionContainerMiddle()
}

// Function to load next question & possible answers in object
const loadNewInstruction = async () => {
    // Saves written answers before moving on to next question
    // Displays previous questions. Does nothing if no questions to load.
    let canLoad = canLoadNewInstruction();
    // console.log('Proceed:' + proceed)
    if (canLoad) {
        await questionContainerLoad('next')
        removeAllChildren('quiz-question-container')
        loadInstructions(dataset.instructions[currentInstructionIndex], false)
    }
    return !canLoad
}

// Checks if we have reached the first or last instruction
const canLoadNewInstruction = () => {
    return currentInstructionIndex < dataset.instructions.length
}

const appendCheckbox = (text, id) => {
    let input = document.createElement('input');
    let label = document.createElement('label');
    let span = document.createElement('span');
    let panel = document.getElementById('quiz-question-container');

    label.id = 'label-' + id;
    label.classList.add('checkcontainer')
    label.innerHTML = text;


    span.classList.add('checkmark');

    input.type = 'checkbox';
    input.setAttribute('required', 'required')
    input.setAttribute('title', 'Please check this box to continue');
    input.id = id;
    // input.onclick(() => {

    // })
    // input.classList.addt('')
    label.appendChild(input);
    label.appendChild(span)

    panel.appendChild(label)
}

/*----------------------------------------------------------------------------------------------- */
/* Question management
/*----------------------------------------------------------------------------------------------- */

// Appends the scenario
const appendInfo = (title, text, variables, asHTML = false, type = "regular") => {
    // Generating question text
    let quizQuestionTextDIV = document.createElement('div')
    quizQuestionTextDIV.className = 'quiz-question-text-container quiz-question-info-container'
    let quizQuestionTextSPAN = document.createElement(`span`)
    quizQuestionTextSPAN.className = `quiz-question-text-item`
    let quizQuestionIconSPAN = document.createElement(`span`)
    quizQuestionIconSPAN.className = `quiz-question-text-item-icon`
    quizQuestionIconSPAN.classList.add("fa-solid")

    if (type == "info") {
        quizQuestionTextDIV.classList.add('green')
        quizQuestionTextSPAN.classList.add('green')
        quizQuestionIconSPAN.classList.add('green')
        quizQuestionIconSPAN.classList.add("fa-circle-info")
    } else if (type == "alert") {
        quizQuestionTextDIV.classList.add('red')
        quizQuestionTextSPAN.classList.add('red')
        quizQuestionIconSPAN.classList.add('red')
        quizQuestionIconSPAN.classList.add("fa-triangle-exclamation")
    } else {
        quizQuestionTextDIV.classList.add('green')
        quizQuestionTextSPAN.classList.add('green')
        quizQuestionIconSPAN.classList.add('green')
    }


    let i = 1;
    if (variables.length > 0) {
        variables.forEach(element => {
            text = text.replace('<variable' + i + '>', '<b>' + window.getGlobal()[element] + '</b>')
            i++

        });
    }

    if (!DEBUG) {
        text = text.replace('<a onclick="resetState()"> Reset data?</a>', '')
        // text = text.replace('<a onclick=\"resetState()\"> Reset data?</a>','')
    }


    if (asHTML && title) {
        text = '<b>' + title + '</b> <br>' + text;
    }
    quizQuestionTextSPAN.innerHTML = text;
    if (type == "regular") {
        quizQuestionTextDIV.style.border = 0;
        quizQuestionTextDIV.style.padding = 0;
        quizQuestionTextDIV.style.backgroundColor = 'white';
    } else {
        quizQuestionIconSPAN.style.alignSelf = 'right';
        quizQuestionIconSPAN.style.fontSize = '30px';
        quizQuestionIconSPAN.style.marginRight = '1.5%';
        quizQuestionIconSPAN.style.position = 'relative';
        quizQuestionIconSPAN.style.top = '4';

        quizQuestionTextDIV.appendChild(quizQuestionIconSPAN)

    }

    quizQuestionTextDIV.appendChild(quizQuestionTextSPAN)
    let panel = document.getElementById('quiz-question-container')
    panel.appendChild(quizQuestionTextDIV)
}

// Appends the scenario
const appendScenario = (question, asHTML = false, additional = false, example = false) => {
    // Generating question text
    let i = document.getElementById('quiz-question-container').childNodes.length
    let quizQuestionTextDIV = document.createElement('div')
    quizQuestionTextDIV.id = `quiz-question-text-container-` + i
    quizQuestionTextDIV.className = 'quiz-question-text-container quiz-question-story-container'
    let quizQuestionTextSPAN = document.createElement(`span`)
    quizQuestionTextSPAN.className = `quiz-question-text-item`
    let text = question;
    text = '<b>Question</b> <br>' + question;
    // if (asHTML) {
    quizQuestionTextSPAN.innerHTML = text;
    // } else {
    // quizQuestionTextSPAN.innerText = '<b>question
    // }
    quizQuestionTextDIV.appendChild(quizQuestionTextSPAN)

    let panel = document.getElementById('quiz-question-container')
    panel.appendChild(quizQuestionTextDIV)

    if (additional)
        quizQuestionTextDIV.classList.add('opacityblur');

        setTimeout(() => {
            quizQuestionTextDIV.classList.remove('opacityblur');
        }, TIME_BETWEEN_QUESTIONS/2);
}

// Assigns the panel title
const appendTitle = (title) => {
    // Generating question text
    let quizQuestionTitle = document.createElement(`h1`)
    quizQuestionTitle.id = 'quiz-question-title'
    quizQuestionTitle.className = 'bottom-bar'
    // let quizQuestionTextSPAN = ocument.createElement(`span`)
    quizQuestionTitle.innerText = title

    let panel = document.getElementById('quiz-question-container')
    panel.appendChild(quizQuestionTitle)
}


//Slider management
class SliderManager {
    // class using static functions (i.e. each func can be extracted
    // from the class directly, there are no public members) to manage the slider

    static generateSlider({
                              min = 0, max = 100, step = 5,
                              initValue = 0,
                              classname = 'slider'
                          } = {}) {
        let slider = `<main style="flex-basis: 100%">
            <form id="form" class="${classname}">
            <div id="range" class="range">
            <span class="leftlabel">What probability ?</span>
            <input id="slider" name="range" type="range" value="${initValue}" min="${min}" max="${max}" step="${step}">
            <div class="range-output">
            <output id="output" class="output" name="output" for="range">
            ${initValue}%
             </output>
             </div>
             </div>
            </form>
            </main>`;

        return slider;
    }
    static listenOnArrowKeys() {
        document.onkeydown = checkKey;

        function checkKey(e) {
            let sliderObj = $('#slider');

            let value = parseFloat(sliderObj.val());
            let step = parseFloat(sliderObj.attr('step'));

            e = e || window.event;

            if (e.keyCode == '37') {
                // left arrow
                sliderObj.val(value - step).change();
            }
            else if (e.keyCode == '39') {
                // right arrow
                sliderObj.val(value + step).change();
            }

        }
    }
    static listenOnSlider(clickArgs, clickFunc) {

        rangeInputRun();
        let slider = $('#slider');
        let output = document.getElementById('output');
        let form = document.getElementById('form');

        form.oninput = function () {
            output.value = slider.val().toString()+'%';
        };

        clickArgs.slider = slider;

        /*let ok = $('#quiz-continue-button-container');
        ok.click(clickArgs, clickFunc);*/

        return slider
    }

    static clickEvent(choice) {
        dataset.questions[currentQuestionIndex].entered = choice;
    }
}

// simple range function
function range(start, stop, step) {
    let a = [start], b = start;
    while (b < stop) {
        a.push(b += step || 1);
    }
    return a;
}

//append to div
function appendElement(divId, el) {
    $(`#${divId}`).append(el);
}

function generateSubmitButton(n) {
    return `<button id="ok" class="btn custom-button">Submit</button>`;
}

function generateImg(src) {
    return  `<img class="border rounded stim" src="${src}">`;
}

function generateQuestion(question) {
    return `<h5 class="justify-content-center">What was the average value of this symbol?</h5>`;
}

// Loads a multiple choice quiz question
const loadQuestion = async (question, init, additional = false, show_title = true, example = false) => {
    startTime = Date.now();
    if (!progressBarIsVisible()) {
        toggleProgressBar();
        updateProgessBarStatus();
    }
    saveState();
    updateProgessBarStatus();

    //Add the list of answers
    appendScenario(question["text"]);
    let quizAnswersUL = appendAnswersList();
    let letters = ['A','B']
    for (let i = 0; i< question.answers.length; i++){
        let quizQuestionDIV = document.createElement(`ul`);
        quizQuestionDIV.className = `quiz-answer-text-container-single unselected-answer`
        // Assigns ID as ASCII values (A = 65, B = 66, etc.)
        quizQuestionDIV.id = (i).toString();
        quizQuestionDIV.onclick = () => {
            if (quizQuestionDIV.classList.contains(`unselected-answer`)){
                removeSlider();
                selectAnswer(quizQuestionDIV.id, false, 'green', question);
                question['selected'] = letters[i];
                showSlider(question);
            }
        }
        // Generate elements
        let quizQuestionPress = document.createElement(`li`);
        let quizQuestionNumeratorBox = document.createElement(`li`)
        quizQuestionNumeratorBox.className = `answer-key-numerator-box`;
        let quizQuestionNumerator = document.createElement(`li`);
        let quizQuestionText = document.createElement(`li`);
        quizQuestionNumeratorBox.append(quizQuestionNumerator)
        // Adding elements to quiz answers
        ed_QuizQuestionElements(question.type, quizQuestionPress, quizQuestionNumerator, quizQuestionDIV, quizQuestionText, (i + 1).toString(), 'green')
        // Convert ASCII code to text for multiple choice selection
        quizQuestionNumerator.innerText = letters[i];
        quizQuestionText.innerText = question["answers"][i];
        // Psuedoparent append
        quizQuestionDIV.append(quizQuestionPress, quizQuestionNumeratorBox, quizQuestionText);
        // Main parent append
        quizAnswersUL.appendChild(quizQuestionDIV);
    }
    //appendElement('Stage',buttonHTML);

    const initVal = Math.floor(Math.random() * 100);
    let sliderHTML = SliderManager.generateSlider({text: question["text"], min: 0, max: 100, step: 1, initValue: initVal});
    question["initVal"] = initVal;

    appendElement('quiz-question-container',sliderHTML);

    $("#range").fadeOut(0);
    /*slider.fadeOut(0);*/

    var clickEnabled = true;
    SliderManager.listenOnSlider({}, function (event) {
        if (clickEnabled){
            let choice = event.data.slider.val();
            SliderManager.clickEvent(choice);
        }
    });

    SliderManager.listenOnArrowKeys();

    await moveQuestionContainerMiddle();


}

const removeSlider = () => {
    $("#range").fadeOut(200);
}

const showSlider = (question) => {
    setTimeout( () => {
        $("#range").fadeIn(400);
        const initVal = Math.floor(Math.random() * 100);
        let slider = $('#slider');
        slider.val(initVal).change();
        question["initVal"] = initVal;
    }, 190);
}


// Function to load next question & possible answers in object
const loadNewQuestion = async (adjustment) => {
    // Removes previous question & answers
    let canLoad = canLoadNewQuestion();
    if (canLoad) {
        await questionContainerLoad(adjustment);
        removeAllChildren(`quiz-question-container`);
        if (adjustment == `next`) {
            if (dataset.questions[currentQuestionIndex].blocked){
                loadQuestion(dataset.questions[currentQuestionIndex], true, false, true, true);
            } else {
                loadQuestion(dataset.questions[currentQuestionIndex]);
            }
        }
        if ("additional" in dataset.questions[currentQuestionIndex])
            loadQuestion(dataset.questions[currentQuestionIndex].additional, false, true, false, false);
    }
    return !canLoad;
}

// Checks if we have reached the first or last question
const canLoadNewQuestion = () => {
    return currentQuestionIndex < dataset.questions.length

}

// Discerns which direction the question will fly on/off the page
const questionContainerLoad = (adjustment) => {
    return new Promise(async (resolve, reject) => {
        if (adjustment == 'next') {
            // Moves container up off the screen
            await moveQuestionContainer(`up`, `down`)
        } else {
            // Moves container down off the screen
            await moveQuestionContainer(`down`, `up`)
        }
        resolve()
    })
}

/*----------------------------------------------------------------------------------------------- */
/* Answer management
/*----------------------------------------------------------------------------------------------- */

const appendAnswersList = () => {
    // Generating answer elements
    let quizAnswersDIV = document.createElement(`div`)
    quizAnswersDIV.id = 'quiz-answer-text-container'
    quizAnswersDIV.className = 'quiz-answer-text-container'

    let quizAnswersUL = document.createElement(`ul`)
    quizAnswersUL.id = `quiz-answer-list`
    quizAnswersUL.className = `quiz-answer-list`

    quizAnswersDIV.appendChild(quizAnswersUL)
    document.getElementById('quiz-question-container').appendChild(quizAnswersDIV)
    return quizAnswersUL
}

// Adds class names to quiz question based on which type of which it is
const ed_QuizQuestionElements = (type, press, numerator, container, text, n, color) => {
    // Append classes for different types of questions
    if (type == `single`) {
        // Radio button classes
        // press.className = `press-key-label press-label-radio answer-key-numerator unselected-answer-button`
        numerator.className = `answer-key-numerator numerator-radio unselected-answer-button ${color}`
        container.classList.add(`question-type-single`)
    } else if (type == `multiple`) {
        // Checkbox classes
        // press.className = `press-key-label press-label-checkbox answer-key-numerator unselected-answer-button`
        numerator.className = `answer-key-numerator numerator-checkbox unselected-answer-button ${color}`
        container.classList.add(`question-type-multiple`)
    }
    text.className = `quiz-answer-text-item`
    text.className += ' ' + color
    // press.innerText = `Press ` + n
}

// Highlights and unhighlights given answers when a keytap is pressed 
// key indicates the id of the given answer, invoking previous will prevent the function from editing the local answered questions object
const selectAnswer = (key, previous, color, question) => {
    let answer = document.getElementById(key)
    if (answer) {
        // If only one answer can be given, unselect all answers before reselecting new answer
        if (answer.classList.contains(`question-type-single`)) {
            unselectAllAnswers(document.getElementById('quiz-answer-list'))
        }
        // If answer is not yet selected, select it
        if (answer.classList.contains(`unselected-answer`)) {
            answer.classList.add(`selected-answer`)
            if (color) {
                answer.classList.add(color);
            }
            answer.classList.remove(`unselected-answer`)
            indicateSelectedAnswer(answer, color)
            saveAnswer(answer.textContent, question)
            // if (!previous) {
            // storeAnswers(true, key)
            // }
            // If answer is already selected, unselect it
        } else if (answer.classList.contains(`selected-answer`)) {
            answer.classList.add(`unselected-answer`)
            answer.classList.remove(`selected-answer`)
            // Unhighlight selected answer buttons
            unselectAnswerButton(answer.children)
            // if (!previous) {
            // storeAnswers(false, key)
            // }
        }
    }
    // Triggers a check to see if we should display continue button
    //showHideContinueButton(dataset.questions[currentQuestionIndex])
}
// Changes answer button appearance to show as selected
const indicateSelectedAnswer = (answer, color) => {
    let button = answer.querySelectorAll('.answer-key-numerator')
    for (let i = 0; i < button.length; i++) {
        button[i].classList.remove(`unselected-answer-button`)
        button[i].classList.add(`selected-answer-button`)
        if (color)
            button[i].classList.add(`${color}`)
    }
}

// Unselects all answers in a question
const unselectAllAnswers = (answerList) => {
    for (let i = 0; i < answerList.childElementCount; i++) {
        let child = answerList.children[i]
        if (child.classList.contains(`selected-answer`)) {
            child.classList.add(`unselected-answer`)

            child.classList.remove(`selected-answer`)
        }
        // re/un-assigns children attribute elements, such as button coloring classes
        unselectAnswerButton(child.children)
    }
}

// Unselects individual quiz answer buttons (e.g. Press A)
const unselectAnswerButton = (child) => {
    for (let j = 0; j < child.length; j++) {
        let childButton = child[j]
        if (childButton && childButton.classList.contains(`selected-answer-button`)) {
            childButton.classList.add(`unselected-answer-button`)
            childButton.classList.remove(`selected-answer-button`)
        }
    }
}


/* ---------------------------------------------------------------------------------------------------*/
/* Animation and movement
/* ---------------------------------------------------------------------------------------------------*/
// Moves question off screen in a given direction
const moveQuestionContainer = (first = `up`, second = `down`) => {
    return new Promise((resolve, reject) => {
        // Assigning correct class
        first = `move-container-` + first
        second = `move-container-` + second
        let parent = document.getElementById(`quiz-question-container`);
        parent.classList.add(first, `fadeout`, `fast-transition`);
        setTimeout(() => {
            parent.classList.remove(first, `fast-transition`)
            parent.classList.add(`no-transition`, second)
            resolve()
        }, 200)
    })

}

// Re-centers question on page
const moveQuestionContainerMiddle = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let parent = document.getElementById(`quiz-question-container`);
            parent.classList.remove(`no-transition`, `fadeout`);
            parent.classList.add(`fast-transition`, `fadein`)
            parent.style.top = `0`
            parent.classList.remove(`move-container-down`, `move-container-up`)
            setTimeout(() => {
                parent.classList.remove(`fadein`)
                resolve()
            }, 200)
        }, 50)
    })
}

/*----------------------------------------------------------------------------------------------- */
/* Continue management
/*----------------------------------------------------------------------------------------------- */
const continueClickable = () => {
    if (DEBUG) {
        return true;
    }
    if (state == 'instructions') {
        checkInputValidity()
        return $('input:checkbox:not(:checked)').length === 0;
    }
    // return Array.from(document.getElementsByTagName('input'))
    // .every((element, i) => (element.value.length >= INPUT_MIN_LENGTH[i]));
    var validity = checkInputValidity();
    return validity;
}

const checkInputValidity = () => {
    return dataset.questions[currentQuestionIndex].selected != undefined;
    return Array.from(document.querySelectorAll('textarea'))
        .every(element => element.reportValidity())
}

const hideAndShowContinue = () => {
    wait = true;
    $('#quiz-continue-button-container').fadeOut(40)
    $('#quiz-continue-text').fadeOut(40)

    setTimeout(() => {
        wait = false;
        $('#quiz-continue-button-container').fadeIn(500)
        $('#quiz-continue-text').fadeIn(500)
    }, DEBUG ? 0 : TIME_BETWEEN_QUESTIONS);
}

// what happens when the continue button is clicked
const continueFunction = async () => {
    rt = Date.now() - startTime;
    if (!continueClickable()) {
        // checkInputValidity()
        return;
    }


    if (state == 'instructions')
        currentInstructionIndex++

    if (state == 'questions') {
        hideAndShowContinue()
        let output = document.getElementById('output')
        dataset.questions[currentQuestionIndex].entered = [dataset.questions[currentQuestionIndex]['selected'],output.value];
        sendItemData(currentQuestionIndex);
        currentQuestionIndex++
    }

    let startQuestions = await loadNewInstruction();

    if (startQuestions) {
        state = 'questions'
        hideAndShowContinue()
        let end = await loadNewQuestion(`next`)
        if (end) {
            state = 'end';
            saveState()
        }
    }

    if (state == 'end')
        await loadEndPanel();
}

// Creates continue button
const cr_ContinueButton = () => {
    let continueDIV = document.createElement(`div`)
    let continueBUTTON = document.createElement(`button`)
    let continueSPAN = document.createElement(`span`)
    continueDIV.id = `quiz-continue-button-container`
    continueDIV.className = `quiz-continue-button-container`
    continueBUTTON.className = `quiz-continue-button`
    continueBUTTON.id = `next`
    // continueBUTTON.setAttribute("type", "submit")
    // continueBUTTON.setAttribute("form", "form")

    continueSPAN.className = `quiz-continue-text`
    continueSPAN.id = `quiz-continue-text`
    continueBUTTON.innerHTML = `OK`

    // Moves to next question on click
    continueBUTTON.onclick = continueFunction;

    continueDIV.append(continueBUTTON, continueSPAN)
    let parent = document.getElementById('quiz-main-page');//`quiz-question-container`)
    parent.append(continueDIV)
    // Discerns whether or not to show continue button, based on whether or not an answer has been input/selected
    //showHideContinueButton(dataset.questions[currentQuestionIndex])
}




/*----------------------------------------------------------------------------------------------- */
/* Progress bar
/*----------------------------------------------------------------------------------------------- */
// Change progress bar styling as quiz is completed
const updateProgessBarStatus = () => {
    // Assigning attributes
    let progress = document.getElementById('quiz-progress-bar')
    let text = document.getElementById('progress-bar-text')
    // Value of progress is set in terms of 0 to 100
    let value = Math.floor(((currentQuestionIndex +1) / dataset.questions.length) * 100)

    // Changing width and aria value 
    progress.setAttribute('aria-valuenow', value)
    progress.style.width = value + `%`
    // Updates progress bar text
    // text.innerText = value + '% complete (item ' + (calculateQuizProgress(dataset.questions) + 1) + ')'
    text.innerText = value + '% complete (item ' + (currentQuestionIndex + 1) + ')'
}

// Finds quiz progress by comparing num of questions answers to total number of questions
const calculateQuizProgress = (questions) => {
    let answers = 0
    for (let i = 0; i < questions.length; i++) {
        if (questions[i].entered.length > 0) {
            answers++
        }
    }
    return answers
}

/*----------------------------------------------------------------------------------------------- */
/* listeners functions
/*----------------------------------------------------------------------------------------------- */

// Listener for key presses for quiz interaction.
document.onkeydown = function (evt) {
    evt = evt || window.event;
    let keyCode = evt.keyCode;
    let selected = document.getElementsByClassName('selected-answer-button').length > 0;
};

/*----------------------------------------------------------------------------------------------- */
/* Toggle functions
/*----------------------------------------------------------------------------------------------- */
const toggleProgressBar = () => {
    let v = document.getElementById("progress").style.display == "none";
    document.getElementById("progress").style.display = v ? 'block' : 'none'
}

const progressBarIsVisible = () => {
    return document.getElementById("progress").style.display == 'block'
}

const toggleDilemma = () => {
    let v = document.getElementById("quiz-dilemma-container").style.display == "none";
    document.getElementById("quiz-dilemma-container").style.display = v ? 'block' : 'none'
}

/* ------------------------------------------------------------------------------------------ */
/* Utils
/* ------------------------------------------------------------------------------------------ */
// Shortcut for removing duplicates from arrays
const uniq = (a) => {
    return Array.from(new Set(a));
}

// Accepts a parent id to remove all children
const removeAllChildren = (parent) => {
    let node = document.getElementById(parent)
    node.innerHTML = ``
}

// Accepts a parent id to remove all children
const removeOpacityBlur = () => {
    let node = document.getElementsByTagName('*')
    Array.from(node).map(element => {
        if (element.classList.contains('opacityblur')){
            element.disabled = false;
            element.classList.remove('opacityblur');
        }
    });
}

window.addURLParameters = (name, value) => {
    var searchParams = new URLSearchParams(window.location.search)
    searchParams.set(name, value)
    window.location.search = searchParams.toString()
}

const shuffle = (arr) => {
    let shuffled = arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    return shuffled
}

const removeAllNotification = () => {
    document.querySelectorAll('.notif').forEach((e) => {
        e.remove();
    })
}

const notify = (message, title, i) => {
    let notif = document.createElement('div')
    notif.id = 'notif' + i
    notif.className = 'notif show'

    let notifICON = document.createElement('span')
    notifICON.className = 'fa-solid fa-exclamation-circle'
    notifICON.innerHTML = '&nbsp;' + title;
    notif.appendChild(notifICON)

    let notifText = document.createElement('div');
    notifText.innerHTML = '<br>' + message;
    notif.appendChild(notifText)

    let panel = document.getElementById('quiz-page-template-container')
    panel.appendChild(notif)

    $(`#notif${i}`).fadeIn(500);
    if (i > 1) {
        let prev = document.getElementById('notif' + (i - 1));
        let h = prev.clientHeight + 30;
        notif.style.bottom = h + 'px';
    }

    $('#notif' + i).click(() => {
        notif.style.display = 'none';
    });

}


const sendToDB = async (call, data, url) => {
    $.ajax({
        type: 'POST',
        data: data,
        async: true,
        url: url,
        success: function (r) {

            if (r.error > 0 && (call + 1) < MAX_REQUESTS) {
                sendToDB(call + 1, data, url);
            }
        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {

            if ((call + 1) < MAX_REQUESTS) {
                sendToDB(call + 1, data, url);
            } else {
                // GUI.displayModalWindow('Network error',
                // `Please check your internet connection.\n\n
                //  If you are not online, the data is lost and we can\'t pay you. :(`, 'error');
            }

        }

    });
}