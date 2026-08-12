(() => {
  const book = window.BOOK;
  const key = `caps-cr-grade-${book.grade}`;
  const state = JSON.parse(localStorage.getItem(key) || '{"completed":[],"notes":{},"current":0}');
  let current = Math.min(state.current || 0, book.lessons.length - 1);
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const save = () => localStorage.setItem(key, JSON.stringify(state));
  const icon = {"Internet & E-communications":"◎","Application Skills":"▤","Algorithms & Coding":"{ }","Robotics Skills":"⚙","Assessment":"✓"};

  document.title = `Grade ${book.grade} Coding & Robotics | Interactive Booklet`;
  $('#brandGrade').textContent = `Grade ${book.grade}`;

  function buildNav(filter = '') {
    const nav = $('#termNav'); nav.innerHTML = '';
    for (let term = 1; term <= 4; term++) {
      const items = book.lessons.map((lesson, index) => ({lesson,index})).filter(x => x.lesson.term === term && `${x.lesson.title} ${x.lesson.strand}`.toLowerCase().includes(filter.toLowerCase()));
      if (!items.length) continue;
      const group = document.createElement('section'); group.className = 'term-group';
      group.innerHTML = `<button class="term-toggle" aria-expanded="true"><span>TERM ${term}</span><span>${items.filter(x=>state.completed.includes(x.index)).length}/${items.length}</span></button><div class="lesson-links"></div>`;
      const links = $('.lesson-links', group);
      items.forEach(({lesson,index}) => {
        const b = document.createElement('button'); b.className = `lesson-link${index===current?' active':''}`; b.dataset.index=index;
        b.innerHTML = `<span class="week">${lesson.week}</span><span class="title">${lesson.title}</span><span class="done">${state.completed.includes(index)?'✓':''}</span>`;
        b.addEventListener('click',()=>{current=index;render();closeMenu();}); links.appendChild(b);
      });
      $('.term-toggle', group).addEventListener('click', e => { const open=e.currentTarget.getAttribute('aria-expanded')==='true'; e.currentTarget.setAttribute('aria-expanded',String(!open)); links.hidden=open; });
      nav.appendChild(group);
    }
  }

  function render() {
    const lesson = book.lessons[current]; state.current=current; save(); buildNav($('#searchInput').value);
    const node = $('#lessonTemplate').content.cloneNode(true);
    $('.lesson-label',node).textContent=`TERM ${lesson.term} • LESSON ${current+1} OF 40`;
    $('h1',node).textContent=lesson.title; $('.lesson-goal',node).textContent=lesson.goal; $('.week-orbit strong',node).textContent=lesson.week;
    $('.strand-name',node).textContent=lesson.strand; $('.strand-icon',node).textContent=icon[lesson.strand] || '✦';
    lesson.learn.forEach(item=>{const li=document.createElement('li');li.textContent=item;$('.learn-list',node).appendChild(li)});
    $('.activity-title',node).textContent=lesson.activity.title;
    lesson.activity.steps.forEach(item=>{const li=document.createElement('li');li.textContent=item;$('.activity-steps',node).appendChild(li)});
    $('.tip',node).textContent=lesson.activity.tip || 'No special equipment? Complete the task on paper and explain what the program or circuit should do.';
    $('.check-question',node).textContent=lesson.check.q;
    lesson.check.options.forEach((option,i)=>{const label=document.createElement('label');label.className='option-label';label.innerHTML=`<input type="radio" name="answer" value="${i}"><span>${option}</span>`;$('.check-options',node).appendChild(label)});
    $('.quiz-form',node).addEventListener('submit',e=>{e.preventDefault();const choice=$('input[name="answer"]:checked',e.currentTarget);const feedback=$('.check-feedback',e.currentTarget);if(!choice){feedback.textContent='Choose an answer first.';feedback.className='check-feedback try';return}const good=Number(choice.value)===lesson.check.a;feedback.textContent=good?`Correct! ${lesson.check.explain}`:`Not quite. ${lesson.check.explain}`;feedback.className=`check-feedback ${good?'good':'try'}`});
    $$('textarea[data-note]',node).forEach(area=>{const field=area.dataset.note;area.value=state.notes[current]?.[field]||'';area.addEventListener('input',()=>{state.notes[current] ||= {};state.notes[current][field]=area.value;save()})});
    const complete=$('.complete-btn',node); const done=state.completed.includes(current); complete.classList.toggle('done',done); complete.innerHTML=done?'<span>✓</span> Lesson completed':'<span>○</span> Mark lesson complete';
    complete.addEventListener('click',()=>{const at=state.completed.indexOf(current);at>=0?state.completed.splice(at,1):state.completed.push(current);save();render()});
    $('#lessonContent').replaceChildren(node); $('#prevBtn').disabled=current===0; $('#nextBtn').disabled=current===book.lessons.length-1; updateProgress(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function updateProgress(){const n=state.completed.length;$('#progressText').textContent=`${n} of ${book.lessons.length}`;$('#progressBar').style.width=`${n/book.lessons.length*100}%`}
  function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').classList.remove('show')}
  $('#prevBtn').addEventListener('click',()=>{if(current>0){current--;render()}}); $('#nextBtn').addEventListener('click',()=>{if(current<book.lessons.length-1){current++;render()}});
  $('#searchInput').addEventListener('input',e=>buildNav(e.target.value)); $('#menuBtn').addEventListener('click',()=>{$('#sidebar').classList.toggle('open');$('#scrim').classList.toggle('show')}); $('#scrim').addEventListener('click',closeMenu);
  $('#themeBtn').addEventListener('click',()=>{document.documentElement.classList.toggle('dark');localStorage.setItem(`${key}-theme`,document.documentElement.classList.contains('dark')?'dark':'light')});
  $('#fontBtn').addEventListener('click',()=>document.documentElement.classList.toggle('large-text')); $('#printBtn').addEventListener('click',()=>window.print());
  $('#exportBtn').addEventListener('click',()=>{let text=`GRADE ${book.grade} CODING & ROBOTICS — CORNELL NOTES\n\n`;book.lessons.forEach((l,i)=>{const n=state.notes[i];if(!n)return;text+=`TERM ${l.term}, WEEK ${l.week}: ${l.title}\nCUES: ${n.cues||''}\nNOTES: ${n.notes||''}\nSUMMARY: ${n.summary||''}\n\n`});const blob=new Blob([text],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`grade-${book.grade}-coding-robotics-notes.txt`;a.click();URL.revokeObjectURL(a.href)});
  if(localStorage.getItem(`${key}-theme`)==='dark')document.documentElement.classList.add('dark'); buildNav(); render();
})();
