const subjectsList=[{name:"Urdu",total:100},{name:"English",total:100},{name:"Mathematics",total:100},{name:"Islamiyat",total:50},{name:"Computer",total:100}];
const subjectsDiv=document.getElementById("subjects");
subjectsList.forEach((s,i)=>{subjectsDiv.innerHTML+=`<div class="subject"><b>${s.name}</b><select id="total_${i}"><option value="${s.total}">${s.total}</option></select><input type="number" id="obt_${i}" placeholder="Obtained"></div>`});
function saveStudent(){const roll=rollNo.value.trim();if(!roll)return alert("Roll No required");let student={roll,name:studentName.value,className:className.value,semester:semester.value,subjects:[]};
subjectsList.forEach((s,i)=>{student.subjects.push({name:s.name,total:Number(document.getElementById(`total_${i}`).value),obt:Number(document.getElementById(`obt_${i}`).value)})});
localStorage.setItem("student_"+roll,JSON.stringify(student));alert("Student Saved")}
function generateResult(){const roll=rollNo.value;const data=JSON.parse(localStorage.getItem("student_"+roll));if(!data)return alert("Student not found");
let weight=data.semester==1?45:55,totalAgg=0;let html=`<h3>Result Card</h3><b>${data.name}</b><br>Roll No: ${data.roll}<br>Class: ${data.className}<hr>`;
data.subjects.forEach(s=>{let w=(s.obt/s.total)*weight;totalAgg+=w;html+=`${s.name}: ${w.toFixed(1)}<br>`});
let percentage=((totalAgg/(data.subjects.length*weight))*100).toFixed(2);
let grade=percentage>=80?"A-1":percentage>=70?"A":percentage>=60?"B":percentage>=50?"C":"D";
html+=`<hr>Percentage: ${percentage}%<br>Grade: ${grade}`;result.innerHTML=html}
function downloadPDF(){const{jsPDF}=window.jspdf;const doc=new jsPDF();const roll=rollNo.value;const data=JSON.parse(localStorage.getItem("student_"+roll));if(!data)return alert("Student not found");
doc.setFontSize(14);doc.text("STUDENT RESULT CARD",60,15);doc.setFontSize(11);
doc.text(`Name: ${data.name}`,15,30);doc.text(`Roll No: ${data.roll}`,15,38);doc.text(`Class: ${data.className}`,15,46);
let y=60,weight=data.semester==1?45:55,totalAgg=0;
data.subjects.forEach(s=>{let w=(s.obt/s.total)*weight;totalAgg+=w;doc.text(`${s.name}: ${w.toFixed(1)}`,15,y);y+=8});
let percentage=((totalAgg/(data.subjects.length*weight))*100).toFixed(2);
doc.text(`Percentage: ${percentage}%`,15,y+10);doc.save(`${data.roll}_Result.pdf`)}
function exportExcel(){let rows=[["Roll","Name","Class","Semester"]];
Object.keys(localStorage).forEach(k=>{if(k.startsWith("student_")){let s=JSON.parse(localStorage[k]);rows.push([s.roll,s.name,s.className,s.semester])}});
let csv=rows.map(r=>r.join(",")).join("\n");let blob=new Blob([csv],{type:"text/csv"});
let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="students.csv";a.click()}