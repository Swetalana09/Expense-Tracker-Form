const form = document.querySelector("form");
const btn = document.querySelector("button");

const dateInput=document.getElementById("dt");
const today=new Date().toISOString().split("T")[0];
dateInput.setAttribute("max",today);

//shows an error msg below the input field
function showError(el, msg) {
    removeError(el);
    const e = document.createElement("div");
    e.className = "error";
    e.style.fontSize = "12px";
    e.style.color = "red";
    e.innerText = msg;
    el.after(e);
}

//removes error msg for an input
function removeError(el) {
    if (el.nextElementSibling?.classList.contains("error")) {
        el.nextElementSibling.remove();
    }
}

//shows error for groups like radio buttons or checkboxes
function showGroupError(el, msg) {
    if(!el){
        return;
    }
    const parent = el.parentElement;

    if(!parent){
        return;
    }
    const existing = parent.querySelector(".error");

    if (existing) {
        existing.remove();
        
    }
    const e = document.createElement("div");
    e.className = "error";
    e.style.color = "red";
    e.style.fontSize = "12px";
    e.innerText = msg;
    parent.appendChild(e);
}


//expense title
const titleInput = document.getElementById("exptitle");
function validateTitle(showRequired = false) {
    const value = titleInput.value;
    removeError(titleInput);

    if (showRequired && value.trim() === "") {
        showError(titleInput, "Please enter a title.");
        return false;
    }
    if(value.trim()!==""){

    if (!/^[a-zA-Z0-9]/.test(value)) {
        showError(titleInput,"Title must start with a letter or number and cannot start with space or special character.")
        return false;
    }
    const trimmed = value.trim();
    if (trimmed.length < 3) {
        showError(titleInput, "Please enter a minimum of 3 characters.");
        return false;
    }
    if (trimmed.length > 50) {
        showError(titleInput, "Please enter no more than 50 characters.");
        return false;
    }
}
return true;
}
titleInput.addEventListener("input", () => validateTitle(false));
titleInput.addEventListener("blur", () => validateTitle(true));

//amount
const amountInput = document.getElementById("amount");
function validateAmount(showRequired=false) {
    const value = amountInput.value.trim();
    removeError(amountInput);
    if(showRequired && value===""){
        showError(amountInput,'Please enter an amount.');
        return false;
    }

    if (value !== "") {
        if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
            showError(amountInput, "Enter a valid number (up to 10 digits and 2 decimals).");
            return false;
        }
        if (Number(value)<=0) {
            showError(amountInput,'Please enter a positive amount.');
            return false;
        }
    }
    return true;
}

amountInput.addEventListener("input",()=>validateAmount(false));
amountInput.addEventListener("blur",()=>validateAmount(true));

//submit validation
btn.onclick=function(){

    let valid=true;
    document.querySelectorAll(".error").forEach(e=>e.remove());

    if(!validateTitle(true)) valid=false;
    if(!validateAmount(true)) valid=false;

    //inputs
    document.querySelectorAll("input[required]").forEach(input=>{
        if(input.type === "radio"|| input.type ==="checkbox") return;
        if(input.value.trim() === "" && input.id!=="exptitle" && input.id !== "amount"){
            if(input.id === "dt") showError(input,'Please select a date.');
            else showError(input,"This field is required.");
            valid=false;
        }
    });

    //date validation
    if(dateInput.value>today){
        showError(dateInput,"Expense date cannot be in the future.")
        valid=false;
    }

    //selects
    document.querySelectorAll("select[required]").forEach(select=>{
        if(select.value===""){
            if(select.id==="category") showError(select,"Please select a Category.");
            else if(select.id==="currency") showError(select,"Please select a Currency.");
            else showError(select,"Please select an option.");
            valid=false;
        }
    });

    // //payment (radio)
    // var radios=document.getElementsByName('payment');    
    // if(radios.length>0 && !document.getElementsByName('payment').checked){ 
    //     showGroupError(radios[radios.length-1],"Please select a Payment Method.");
    //     valid=false;
    // }

    //payment(radio)
    var radios=document.getElementsByName('payment');
    let radioChecked=false;
    for(let i=0;i<radios.length;i++){
        if(radios[i].checked){
            radioChecked=true;
            break;
        }
    }

    if(!radioChecked){
        showGroupError(radios[radios.length-1],"Please select a payment method.");
        valid=false;
    }


    //checkbox
    const save=document.querySelector('input[type="checkbox"][required]');
    // if(save && !save.checked){
    if(!save.checked){
        showGroupError(save,"You must save this expense to continue.");
        valid=false;
    }

    //scroll to error
    var firstError=document.querySelector(".error");
    if(firstError){
        firstError.scrollIntoView();
    }
    if(valid){
        // const formData={
        //     expenseTitle: document.getElementById("exptitle").value,
        //     amount:document.getElementById("amount").value,

        // };
        // console.log(formData);
        alert("Form submitted successfully!")
        form.reset();
    }
};

//removes errors on typing/select
document.querySelectorAll("input,select").forEach(el=>{
    el.oninput=el.onchange=()=>{
        removeError(el);
        if(el.type==='radio'||el.type==='checkbox'){
            const parent=el.parentElement;
            const groupError=parent.querySelector(".error");
            if(groupError) groupError.remove();
        }
    };
});