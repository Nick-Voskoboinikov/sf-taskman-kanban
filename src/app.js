import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { User } from "./models/User";
import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");

generateTestUser(User);
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  class Tasks {
    constructor(taskString = null) {
      this.backlogTasks = taskString;
      this.readyTasks = taskString;
      this.inProgressTasks = taskString;
      this.finishedTasks = taskString;
      this.userid = login;
      this.writeBacklog = function (textString) {
        this.backlogTasks = JSON.parse(localStorage.getItem(this.userid + '-tasks-backlog') || "[]");
        if(typeof this.backlogTasks === 'string') this.backlogTasks=[this.backlogTasks];
        (this.backlogTasks).push(textString);
        localStorage.setItem(this.userid + '-tasks-backlog', JSON.stringify(this.backlogTasks));
        let readyItemCandidates=document.querySelector('.app-wrapper__readylist > .app-select__list > .app-preselect__pseudo');
        let readyItemCandidateNewOpt=document.createElement('option');
        readyItemCandidateNewOpt.textContent=textString;
        readyItemCandidates.appendChild(readyItemCandidateNewOpt);
        document.querySelector('.app-div__ready>.app-button__add').disabled = false;
        redrawSelect('.app-wrapper__readylist');
        (document.querySelector('.app-num__ready-tasks')).innerHTML=(this.backlogTasks).length;
      };
      this.writeReady = function (textString) {
        this.readyTasks = JSON.parse(localStorage.getItem(this.userid + '-tasks-ready') || "[]");
        if(typeof this.readyTasks === 'string') this.readyTasks=[this.readyTasks];
        (this.readyTasks).push(textString);
        localStorage.setItem(this.userid + '-tasks-ready', JSON.stringify(this.readyTasks));
        let inProgressItemCandidates=document.querySelector('.app-wrapper__in-progresslist > .app-select__list > .app-preselect__pseudo');
        let inProgressItemCandidateNewOpt=document.createElement('option');
        inProgressItemCandidateNewOpt.textContent=textString;
        inProgressItemCandidates.appendChild(inProgressItemCandidateNewOpt);
        document.querySelector('.app-div_in-progress>.app-button__add').disabled = false;
        redrawSelect('.app-wrapper__readylist');
        this.removeFromBacklog(textString);
        // todo: real recalculate backlog content & if zero - then disble its own (ready) button
        (document.querySelector('.app-num__ready-tasks')).innerHTML=this.backlogTasks.length;
      };
      this.writeInProgress = function (textString) {
        localStorage.setItem(this.userid + '-tasks-in-progress', JSON.stringify(textString));
      };
      this.writeFinished = function (textString) {
        localStorage.setItem(this.userid + '-tasks-finished', JSON.stringify(textString));
      };
      this.removeFromBacklog = function (textString) {
        this.backlogTasks=(this.backlogTasks).filter(item => item !== textString);
        localStorage.setItem(this.userid + '-tasks-backlog', JSON.stringify(this.backlogTasks));

      };
      this.recall = function () {
        this.backlogTasks = JSON.parse(localStorage.getItem(this.userid + '-tasks-backlog') || "[]");
        this.readyTasks = JSON.parse(localStorage.getItem(this.userid + '-tasks-ready') || "[]");
        this.inProgressTasks = JSON.parse(localStorage.getItem(this.userid + '-tasks-in-progress') || "[]");
        this.finishedTasks = JSON.parse(localStorage.getItem(this.userid + '-tasks-finished') || "[]");

        // todo: create lists from this data.
      };
    }
  }

  let fieldHTMLContent = authUser(login, password)
    ? taskFieldTemplate
    : noAccessTemplate;

  document.querySelector("#content").innerHTML = fieldHTMLContent;
    if(!(fieldHTMLContent=='<h1>Sorry, you\'ve no access to this resource!</h1>')){
      document.title='Awesome Kanban board';
      const head=(document.getElementsByTagName("head"))[0];
      const icon = document.createElement("link");
      const backlogAddBtn=document.querySelector('.app-div__backlog > .app-button__add');
      const backlogSbmt=document.querySelector('.app-div__backlog > button.app-button__sbmt');
      const readyAddBtn=document.querySelector('.app-div__ready > .app-button__add');
      const readySbmt=document.querySelector('.app-div__ready > button.app-button__sbmt');
      const inProgressAddBtn=document.querySelector('.app-div__in-progress > .app-button__add');
      const inProgressSbmt=document.querySelector('.app-div__in-progress > button.app-button__sbmt');
      const finishedAddBtn=document.querySelector('.app-div__finished > .app-button__add');
      const finishedySbmt=document.querySelector('.app-div__finished > button.app-button__sbmt');
      const taskInputField=document.querySelector('.app-input__task-input');
      const backlogList=document.querySelector('.app-list__backlog');
      const readyList=document.querySelector('.app-list__ready');
      const inProgressList=document.querySelector('.app-list__in-progress');
      const finishedList=document.querySelector('.app-list__finished');
      const userMenuToggle=document.querySelector('.app-div__usericon');
      const userMenu=document.querySelector('.app-menu__tooltip');

      let myTasks=new Tasks();

      icon.setAttribute('rel','icon');
      icon.setAttribute('href',"data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>");
      head.appendChild(icon);
      userMenuToggle.addEventListener('click',function(){
        if(userMenu.style.visibility != 'visible'){
          userMenu.style.visibility='visible';
          userMenu.style.opacity=1;
        } else {
          userMenu.style.visibility='hidden';
          userMenu.style.opacity=0;
        }
      });
      (document.querySelector('.app-div__usericon>span>button')).addEventListener('click',function(){
        myTasks.recall();
        console.log("backlogTasks",myTasks.removeFromBacklog("123"));
        console.log(myTasks.backlogtasks);
      });
      backlogAddBtn.addEventListener('click',function(){
        startNewBacklogTask(backlogAddBtn,backlogSbmt,taskInputField);
      });
      taskInputField.addEventListener('keypress', function(event){
        if (event.key === 'Enter') {
          e.preventDefault();
          backlogSbmt.click();
        }
      });
      backlogSbmt.addEventListener('click',function(){
        addNewBacklogTask(backlogSbmt,backlogAddBtn,backlogList,taskInputField,myTasks);
      });
      readyAddBtn.addEventListener('click',function(){
        startNewReadyTask(readyAddBtn,readySbmt);
      });
      readySbmt.addEventListener('click',function(){
        addNewReadyTask(readySbmt,readyAddBtn,readyList,myTasks);
      });
      /*if the user clicks anywhere outside the select box,
      then close all select boxes:*/
      document.addEventListener('click', closeAllSelect);

    }
});


function redrawSelect(select){
  /* based on https://www.w3schools.com/howto/howto_custom_select.asp */
  let x, i, j, selElmnt, a, b, c, elemsToDel;
  /*look for any elements with the class "app-select__list":*/
  x = document.querySelector(select).getElementsByClassName('app-select__list');

  elemsToDel = document.querySelector(select).getElementsByClassName('select-selected');
if (elemsToDel.length > 0) {
  document.querySelector(select).querySelectorAll('.select-selected').forEach(el => el.remove());
  document.querySelector(select).querySelectorAll('.select-hide').forEach(el => el.remove());
}

  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement('div');
    a.classList.add('select-selected');
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement('div');
    b.classList.add('select-items');
    b.classList.add('select-hide');
    for (j = 0; j < selElmnt.length; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      c = document.createElement('div');
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener('click', function(e) {
          /*when an item is clicked, update the original select box,
          and the selected item:*/
          var y, i, k, s, h;
          s = this.parentNode.parentNode.querySelector('.app-preselect__pseudo');
          h = this.parentNode.previousSibling;
          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName('same-as-selected');
              for (k = 0; k < y.length; k++) {
                y[k].removeAttribute('class');
              }
              this.setAttribute('class', 'same-as-selected');
              break;
            }
          }
          h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener('click', function(e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle('select-hide');
        this.classList.toggle('select-arrow-active');
      });
  }
  }
  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    let x, y, i, arrNo = [];
    x = document.getElementsByClassName('select-items');
    y = document.getElementsByClassName('select-selected');
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove('select-arrow-active');
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide');
      }
    }
  }


  function delLiWithContent(searchRoot, textcontent){
    let elem = document.evaluate('//li[contains(., "'+textcontent+'")]', searchRoot, null, XPathResult.ANY_TYPE, null );
    let thisElem = elem.iterateNext();
    thisElem.remove();
  }
  function delDivWithContent(searchRoot, textcontent){
    let elem = document.evaluate('//div[contains(., "'+textcontent+'")]', searchRoot, null, XPathResult.ANY_TYPE, null );
    let thisElem = elem.iterateNext();
    thisElem.remove();
  }
  function delOptionWithContent(searchRoot, textcontent){
    let elem = document.evaluate('//option[contains(., "'+textcontent+'")]', searchRoot, null, XPathResult.ANY_TYPE, null );
    let thisElem = elem.iterateNext();
    thisElem.remove();
  }

  
  
function addNewBacklogTask(sbmt,btn,backlogList,taskInputField,myTasks){
  sbmt.style.display='none';
  btn.style.display='block';
  let newTaskAsListElement = document.createElement('li');
  let newTaskAsText = document.createTextNode(taskInputField.value);
  newTaskAsListElement.appendChild(newTaskAsText);
  backlogList.insertBefore(newTaskAsListElement, backlogList.children[0]);
  myTasks.writeBacklog(taskInputField.value);
  taskInputField.value='';
  taskInputField.style.display='none';
  btn.focus();
}
function startNewBacklogTask(btn,sbmt,taskInputField){
  btn.style.display='none';
  taskInputField.style.display='block';
  taskInputField.focus();
  sbmt.style.display='block';
}

function addNewReadyTask(sbmt,btn,readyList,myTasks){
  sbmt.style.display='none';
  btn.style.display='block';
  let newTaskAsListElement = document.createElement('li');
  let newReadyTask=document.querySelector('.app-wrapper__readylist > .app-select__list > .select-items > .same-as-selected');
  if (!newReadyTask){
    alert('Сначала выберите пункт из списка!')
    return;
  }
  let newReadyTaskText = newReadyTask.innerText;
  let newReadyTaskAsText = document.createTextNode(newReadyTaskText);
  newTaskAsListElement.appendChild(newReadyTaskAsText);
  readyList.insertBefore(newTaskAsListElement, readyList.children[-1]);
  myTasks.writeReady(newReadyTaskText);
  
  if (newReadyTask.nextSibling) {
   (newReadyTask.nextSibling).classList.add('same-as-selected');
  } else if (newReadyTask.previousSibling) {
    (newReadyTask.previousSibling).classList.add('same-as-selected');
  } else {
    btn.disabled = true;
  }
  newReadyTask.remove();
  delLiWithContent(document.querySelector('.app-wrapper__in-progresslist > .app-select__list > .app-preselect__pseudo'), newReadyTaskText);
  delOptionWithContent(document.querySelector('.app-wrapper__in-progresslist > .app-select__list > .app-preselect__pseudo'), newReadyTaskText);
// delete newReadyTask
}
function startNewReadyTask(btn,sbmt){
  btn.style.display='none';
  (document.querySelector('.app-wrapper__readylist > .app-select__list > .select-selected')).style.display='block';
  sbmt.style.display='block';
  sbmt.focus();
}

function recalcThings(){
  // collect 2 stats, disable 3 buttons
  const activeTasks=document.querySelector(".app-num__ready-tasks");
  const finishedTasks=document.querySelector(".app-num__finished-tasks");
  activeTasks.textContent='0';


}