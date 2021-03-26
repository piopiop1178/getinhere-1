/* Copy Invite_url to my Clipboard */
const inviteToggle = document.querySelector('.invite-toggle')
inviteToggle.addEventListener('click', ()=> {
  let body = document.querySelector('body')
  let tmptextarea = document.createElement('textarea')
  tmptextarea.setAttribute('class','tmptextarea')
  body.appendChild(tmptextarea)
  tmptextarea.textContent = localStorage.getItem('Invite_url')
  tmptextarea.select()
  document.execCommand('copy')
  body.removeChild(tmptextarea)
  let notice = document.querySelector('.invite-toggle-notice')
  notice.style.display = "block";
  setTimeout(()=>{
    notice.style.display = "none";
  }, 1000)
})