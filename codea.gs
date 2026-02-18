function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.openById("YOUR_SHEET_ID");


  // ====== MARKS ENTRY ======
  if (data.type == "marks") {
  var sh = ss.getSheetByName("Marks");

  if (!sh) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "Marks sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var subjects = data.subjects;

    var total = 0;

    var row = [data.class, data.division, data.roll, data.name];

    for (var sub in subjects) {
      row.push(subjects[sub]);
      total += Number(subjects[sub]);
    }

    row.push(total);
    sh.appendRow(row);

    return ContentService
    .createTextOutput(JSON.stringify({success:true}))
    .setMimeType(ContentService.MimeType.JSON);

  }

  // ====== STUDENT LOGIN ======
  if (data.type == "login") {
    var studentSheet = ss.getSheetByName("Students");

if (!studentSheet) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: "Students sheet not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}

    var students = studentSheet.getDataRange().getValues();

    var success = false;
    var studentInfo = {};

    for (var i = 1; i < students.length; i++) {
      if (students[i][0] == data.roll && students[i][4] == data.password) {
        success = true;
        studentInfo = {
          roll: students[i][0],
          name: students[i][1],
          class: students[i][2],
          division: students[i][3]
        };
        break;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: success,
      student: studentInfo
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Marks");

  if (!sh) {
    return ContentService
     .createTextOutput("Marks sheet not found");
}

var data = sh.getDataRange().getValues();


  if (e.parameter.roll) {
    var roll = e.parameter.roll;
    var target = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][2] == roll) {
        target = data[i];
        break;
      }
    }

    if (!target) return ContentService.createTextOutput("Not Found");

    var cls = target[0];
    var div = target[1];

    var classDivStudents = data.slice(1).filter(r => r[0] == cls && r[1] == div);

    classDivStudents.sort((a,b) => Number(b[b.length-1]) - Number(a[a.length-1]));

    var rank = 1;
    for (var i = 0; i < classDivStudents.length; i++) {
      if (classDivStudents[i][2] == roll) {
        rank = i + 1;
        break;
      }
    }

    var subjects = {};
    for (var j = 4; j < target.length - 1; j++) {
      subjects[data[0][j]] = target[j];
    }

    var pass = true;
    for (var s in subjects) {
      if (Number(subjects[s]) < 35) pass = false;
    }

    return ContentService.createTextOutput(JSON.stringify({
      class: cls,
      division: div,
      roll: target[2],
      name: target[3],
      subjects: subjects,
      total: target[target.length-1],
      rank: rank,
      result: pass ? "PASS" : "FAIL"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
