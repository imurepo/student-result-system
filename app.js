// Subject list
const subjectsList = [
  { name: "Urdu", total: 100 },
  { name: "English", total: 100 },
  { name: "Mathematics", total: 100 },
  { name: "Islamiyat", total: 50 },
  { name: "Computer", total: 100 }
];

// Render subjects dynamically
const subjectsDiv = document.getElementById("subjects");
subjectsList.forEach((s, i) => {
  subjectsDiv.innerHTML += `
    <div class="subject">
      <b>${s.name}</b>
      <select id="total_${i}">
        <option value="${s.total}">${s.total}</option>
      </select>
      <input type="number" id="obt_${i}" placeholder="Obtained">
    </div>
  `;
});

// Save student to localStorage
function saveStudent() {
  const roll = document.getElementById("rollNo").value.trim();
  if (!roll) return alert("Roll No required");

  const student = {
    roll,
    name: document.getElementById("studentName").value,
    className: document.getElementById("className").value,
    semester: document.getElementById("semester").value,
    subjects: []
  };

  subjectsList.forEach((s, i) => {
    const obt = Number(document.getElementById(`obt_${i}`).value) || 0;
    if (obt > s.total) {
      alert(`${s.name}: Obtained marks cannot exceed total`);
      return;
    }
    student.subjects.push({
      name: s.name,
      total: Number(document.getElementById(`total_${i}`).value),
      obt: obt
    });
  });

  localStorage.setItem("student_" + roll, JSON.stringify(student));
  alert("Student Saved");
}

// Generate result
function generateResult() {
  const roll = document.getElementById("rollNo").value.trim();
  const data = JSON.parse(localStorage.getItem("student_" + roll));
  if (!data) return alert("Student not found");

  const weight = data.semester == 1 ? 45 : 55;
  let totalAgg = 0;
  let html = `<h3>Result Card</h3>
              <b>${data.name}</b><br>
              Roll No: ${data.roll}<br>
              Class: ${data.className}<hr>`;

  data.subjects.forEach(s => {
    let w = (s.obt / s.total) * weight;
    totalAgg += w;
    html += `${s.name}: ${w.toFixed(1)}<br>`;
  });

  const percentage = ((totalAgg / (data.subjects.length * weight)) * 100).toFixed(2);
  const grade = percentage >= 80 ? "A-1" :
                percentage >= 70 ? "A" :
                percentage >= 60 ? "B" :
                percentage >= 50 ? "C" : "D";

  html += `<hr>Percentage: ${percentage}%<br>Grade: ${grade}`;
  document.getElementById("result").innerHTML = html;
}

// Download PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const roll = document.getElementById("rollNo").value.trim();
  const data = JSON.parse(localStorage.getItem("student_" + roll));
  if (!data) return alert("Student not found");

  doc.setFontSize(14);
  doc.text("STUDENT RESULT CARD", 60, 15);
  doc.setFontSize(11);
  doc.text(`Name: ${data.name}`, 15, 30);
  doc.text(`Roll No: ${data.roll}`, 15, 38);
  doc.text(`Class: ${data.className}`, 15, 46);

  let y = 60;
  const weight = data.semester == 1 ? 45 : 55;
  let totalAgg = 0;

  data.subjects.forEach(s => {
    const w = (s.obt / s.total) * weight;
    totalAgg += w;
    doc.text(`${s.name}: ${w.toFixed(1)}`, 15, y);
    y += 8;
  });

  const percentage = ((totalAgg / (data.subjects.length * weight)) * 100).toFixed(2);
  doc.text(`Percentage: ${percentage}%`, 15, y + 10);
  doc.save(`${data.roll}_Result.pdf`);
}

// Export Excel (Subjects as columns, 1 row per student)
function exportExcel() {
  let rows = [];

  // Header: Student info + subjects (Obt / Total / Weightage per subject)
  const header = ["Roll No", "Student Name", "Class", "Semester"];
  subjectsList.forEach(s => {
    header.push(`${s.name} Obt`);
    header.push(`${s.name} Total`);
    header.push(`${s.name} Weightage`);
  });
  header.push("Total Aggregate", "Final %", "Grade");
  rows.push(header);

  Object.keys(localStorage).forEach(key => {
    if (!key.startsWith("student_")) return;

    const student = JSON.parse(localStorage[key]);
    const weight = student.semester == 1 ? 45 : 55;
    let totalAggregate = 0;
    let subjectCols = [];

    // Fill subject columns
    subjectsList.forEach(subDef => {
      const sub = student.subjects.find(s => s.name === subDef.name);
      const obt = sub ? sub.obt : 0;
      const total = sub ? sub.total : subDef.total;
      const weightageMarks = ((obt / total) * weight).toFixed(2);
      totalAggregate += Number(weightageMarks);

      subjectCols.push(obt, total, weightageMarks);
    });

    const finalPercentage = ((totalAggregate / (subjectsList.length * weight)) * 100).toFixed(2);
    const grade = finalPercentage >= 80 ? "A-1" :
                  finalPercentage >= 70 ? "A" :
                  finalPercentage >= 60 ? "B" :
                  finalPercentage >= 50 ? "C" : "D";

    const row = [
      `"${student.roll}"`,
      `"${student.name}"`,
      `"${student.className}"`,
      `"${student.semester == 1 ? "Semester-I (45%)" : "Semester-II (55%)"}"`
    ].concat(subjectCols, totalAggregate.toFixed(2), finalPercentage + "%", grade);

    rows.push(row);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Student_Result_Columns.csv";
  a.click();
}
