document.addEventListener("DOMContentLoaded",function(){
//table

const form = document.querySelector("form");
const btn = document.querySelector("button");

const dateInput=document.getElementById("dt");
const today=new Date().toISOString().split("T")[0];
dateInput.setAttribute("max",today);

//shows an error msg below the input field
function showError(el, msg) {
    removeError(el);
    var e = document.createElement("div");
    e.className = "error";
    e.style.fontSize = "12px";
    e.style.color = "red";
    e.innerText = msg;
    el.after(e);
}

//removes error msg for an input
function removeError(el) {
    if (el.nextElementSibling && el.nextElementSibling.classList.contains("error")) {
        el.nextElementSibling.remove();
    }
}

//shows error for groups like radio buttons or checkboxes
function showGroupError(el, msg) {
    if(!el){
        return;
    }
    var parent = el.parentElement;

    if(!parent){
        return;
    }
    var existing = parent.querySelector(".error");

    if (existing) {
        existing.remove();
        
    }
    var e = document.createElement("div");
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
var editRow=null;
btn.onclick=function(){

    var valid=true;
    var errors=document.querySelectorAll(".error");
    for (var i=0;i<errors.length;i++){
        errors[i].remove();
    }

    if(!validateTitle(true)) valid=false;
    if(!validateAmount(true)) valid=false;

    //inputs
    var inputs=document.querySelectorAll("input[required]");
    for(var i=0; i<inputs.length;i++){
        var input=inputs[i];
        if(input.type === "radio"|| input.type ==="checkbox") continue;
        if(input.value.trim() === "" && input.id!=="exptitle" && input.id !== "amount"){
            if(input.id === "dt") showError(input,'Please select a date.');
            else showError(input,"This field is required.");
            valid=false;
    }
    }

    //selects
    var selects=document.querySelectorAll('select[required]');
    for(var i=0;i<selects.length;i++){
        var select=selects[i];
        if(select.value===""){
            if(select.id==="category") showError(select,"Please select a Category.");
            else if(select.id==="currency") showError(select,"Please select a Currency.");
            else showError(select,"Please select an option.");
            valid=false;
        }

    }

    // //payment (radio)
    // var radios=document.getElementsByName('payment');    
    // if(radios.length>0 && !document.getElementsByName('payment').checked){ 
    //     showGroupError(radios[radios.length-1],"Please select a Payment Method.");
    //     valid=false;
    // }

    //payment(radio)
    var radios=document.getElementsByName('payment');
    let radioChecked=false;
    for(var i=0;i<radios.length;i++){
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
    var save=document.querySelector('input[type="checkbox"][required]');
    if(!save.checked){
        showGroupError(save,"You must save this expense to continue.");
        valid=false;
    }

    //date validation
    if(dateInput.value>today){
        showError(dateInput,"Expense date cannot be in the future.")
        valid=false;
    }

    //scroll to error
    var firstError=document.querySelector(".error");
    if(firstError){
        firstError.scrollIntoView({behavior:"smooth"});
    }

        if(valid){
            var table=document.getElementById("expenseTable").getElementsByTagName('tbody')[0];
            var paymentValue=document.querySelector('input[name="payment"]:checked').value;

            if(editRow===null){

                var newRow=table.insertRow();
                newRow.innerHTML="<td>" + titleInput.value + "</td>" +
                "<td>" + document.getElementById('category').value + "</td>" +
                "<td>" + document.getElementById("currency").value + "</td>" +
                "<td>" + amountInput.value + "</td>" +
                "<td>" + dateInput.value + "</td>" +
                "<td>" + document.getElementById("appt").value + "</td>" +
                "<td>" + paymentValue + "</td>" +
                "<td>" + document.getElementById("transaction").value + "</td>" +
                "<td>" + document.getElementById("name").value + "</td>" +
                "<td>" + document.getElementById("loc").value + "</td>" +
                "<td>" + (document.querySelector('input[name="receipt"]:checked')?.value|| "") +"</td>" +
                "<td>" + document.getElementById("note").value + "</td>" +
                "<td>" + document.getElementById("tags").value + "</td>" +
                "<td>" + (document.getElementById("save_recurring").checked? "Yes" : "No") + "</td>" +
                "<td><button class='edit-btn'>EDIT</button></td>" +
                "<td><button class='del-btn'>X</button></td>";
                
                alert("Form submitted successully!");
                document.getElementById("expenseTable").scrollIntoView({behavior:"smooth"});
            } else{
            editRow.cells[0].innerText=titleInput.value;
            editRow.cells[1].innerText=document.getElementById("category").value;
            editRow.cells[2].innerText=document.getElementById("currency").value;
            editRow.cells[3].innerText=amountInput.value;
            editRow.cells[4].innerText=dateInput.value;
            editRow.cells[5].innerText=document.getElementById("appt").value;
            editRow.cells[6].innerText=paymentValue;
            editRow.cells[7].innerText=document.getElementById("transaction").value;
            editRow.cells[8].innerText=document.getElementById("name").value;
            editRow.cells[9].innerText=document.getElementById("loc").value;
            editRow.cells[10].innerText=document.querySelector('input[name="receipt"]:checked')?.value||"";
            editRow.cells[11].innerText=document.getElementById("note").value;
            editRow.cells[12].innerText=document.getElementById("tags").value;
            editRow.cells[13].innerText=document.getElementById("save_recurring").checked? "Yes" : "No";

            editRow.classList.remove("editing");

            alert("Form updated successfully!");
            editRow.scrollIntoView({behavior:"smooth"});
            editRow=null;
            btn.innerText="SUBMIT";
            }
            form.reset();
        }
    };


    var allFields=document.querySelectorAll("input,select");
    for(var i=0; i<allFields.length;i++){
        allFields[i].oninput=allFields[i].onchange=function(){
            removeError(this);
            if(this.type==="radio" || this.type==="checkbox"){
                var parent=this.parentElement;
                var err=parent.querySelector(".error");
                if(err){
                    err.remove();
                }
            }
        };
    }

    var table=document.getElementById("expenseTable");
    table.onclick=function(e){
        var target=e.target;
        var row=target.parentElement.parentElement;

        if(target.classList.contains("edit-btn")){
            var prevEditing=table.querySelector(".editing");
            if(prevEditing) prevEditing.classList.remove("editing");

            editRow=row;
            row.classList.add("editing");
            
            titleInput.value=row.cells[0].innerText;
            document.getElementById("category").value=row.cells[1].innerText;
            document.getElementById("currency").value=row.cells[2].innerText;
            amountInput.value=row.cells[3].innerText;
            dateInput.value=row.cells[4].innerText;
            document.getElementById("appt").value=row.cells[5].innerText;
            
            var payInputs=document.getElementsByName("payment");
            for(var i=0; i<payInputs.length;i++){
                if(payInputs[i].value === row.cells[6].innerText){
                    payInputs[i].checked=true;
                }
            }
            document.getElementById("transaction").value=row.cells[7].innerText;
            document.getElementById("name").value=row.cells[8].innerText;
            document.getElementById("loc").value=row.cells[9].innerText;

            var receipt=row.cells[10].innerText;
            if(receipt==="yes"){
                document.getElementById("receipt_yes").checked=true;
            }
            else if(receipt==="no"){
                document.getElementById("receipt_no").chekced=true;
            }

            document.getElementById("note").value=row.cells[11].innerText;
            document.getElementById("tags").value=row.cells[12].innerText;

            document.getElementById("save_recurring").checked = row.cells[13].innerText ==="Yes";

            btn.innerText="UPDATE";
        }
        if(target.classList.contains("del-btn")){
            if(confirm('Are you sure you want to delete this expense?')){
                row.remove();
            }
        }
    };
});

