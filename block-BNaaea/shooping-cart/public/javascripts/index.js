var user = document.querySelector('.user-name');
var block = document.querySelector('.block');

block.addEventListener('click', (event)=> {
    user.classList.toggle('line-through')
})

