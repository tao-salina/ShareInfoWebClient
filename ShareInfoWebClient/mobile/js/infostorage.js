var Db;
var rmid;
var showflag;
function initDB() {
	console.log("Entering init DB");
	console.log("Opening database");
	Db = window.openDatabase("infoDB", "1.0", "Share Information DB", 3 * 1024 * 1024);
	console.log("Checking Db");
	if (Db) {
		console.log("####Db==" + Db);
		console.log("Creating table");
		Db.transaction(createTable, onTxError, onTxSuccess);
		console.log("Finished creating table");
	} else {
		console.log("Db object has not been created");
		alert("this code shouldn't ever execute");
	}
}

function createTable(tx) {
	console.log("Entering createTable");
	var sqlStr = 'CREATE TABLE IF NOT EXISTS infos (id TEXT, title TEXT, category TEXT, type TEXT, description TEXT, date TEXT)';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [], onSqlSuccess, onSqlError);
	console.log("Leaving createTable");
}

function onTxSuccess() {
	console.log("TX: success");
}

function onTxError(tx, err) {
	console.log("Entering onTxError");
	var msgText;
	//Check if we get an error object?
	if (err) {
		//Tell the user what happened
		msgText = "TX: " + err.message + " (" + err.code + ")";
	} else {
		msgText = "TX: Unkown error";
	}
	console.error(msgText);
	alert(msgText);
	console.log("Leaving onTxError");
}

function onSqlSuccess(tx, res) {
	console.log("SQL: success");
	if (res) {
		console.log(res);
	}
}

function onSqlError(tx, err) {
	console.log("Entering onSqlError");
	var msgText;
	if (err) {
		msgText = "SQL: " + err.message + " (" + err.code + ")";
	} else {
		msgText = "SQL: Unknown error";
	}
	console.error(msgText);
	alert(msgText);
	console.log("Leaving onSqlError");
}

function saveRecord() {
	console.log("Entering saveRecord");
	//Write the record to the database
	console.log("Db==" + Db);
	Db.transaction(insertRecord, onTxError, onTxSuccess);
	console.log("Leaving saveRecord");
}

function insertRecord(tx) {
	console.log("Entering insertRecord");
	var randomid = randomUUID();
	var title = $("#title").val();
	var category = $("#category").val();
	var type = $("#type").val();
	var description = $("#description").val();
	var now = new Date();
	var todayStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

	var sqlStr = 'INSERT INTO infos (id, title, category, type, description, date) VALUES (?, ?, ?, ?, ?, ?)';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [randomid, title, category, type, description, todayStr], onSqlSuccess, onSqlError);

	console.log("Leaving insertRecord");
	$("#title").val("");
	$("#description").val("");
}

function randomUUID() {
	var s = [], itoh = '0123456789ABCDEF';
	for (var i = 0; i < 32; i++) {
		s[i] = Math.floor(Math.random() * 0x10);
	}
	// Conform to RFC-4122, section 4.4
	s[14] = 4;
	// Set 4 high bits of time_high field to version
	s[19] = (s[19] & 0x3) | 0x8;
	// Specify 2 high bits of clock sequence
	// Convert to hex chars
	for (var i = 0; i < 36; i++)
		s[i] = itoh[s[i]];
	return s.join('');
}

function showInfoList(flag) {
	showflag = flag;
	console.log("Entering openView");
	var headerTxt, sqlStr;
	//Get totalAmount from the persistent storage area

	sqlStr = "SELECT * FROM infos";

	console.log("SQL: " + sqlStr);
	Db.transaction(function(tx) {
		tx.executeSql(sqlStr, [], onQuerySuccess, onQueryFailure);
	}, onTxError, onTxSuccess);
	console.log("Leaving openView");
}

function onQuerySuccess(tx, results) {
	console.log("Entering onQuerySuccess");
	
	if (results.rows) {
		console.log("Rows: " + results.rows);
		var htmlStr = "";
		var len = results.rows.length;
		var showlen = len;
		console.log("###len: " + len);
		
		if (showflag=='top'){
			showlen=5;
		}
		if (len > 0) {
			var infotable = document.getElementById("infosTable");
			var sHtmlStr = '<tr><th>Title</th><th>Category</th></tr>';
			for (var i = 0; (i < len) && (i < showlen); i++) {
				if (i % 2 == 0) {
					sHtmlStr = sHtmlStr + '<tr class="odd">';
				} else {
					sHtmlStr = sHtmlStr + '<tr class="even">';
				}
				var id = results.rows.item(i).id;
				var title = results.rows.item(i).title;
				var category = results.rows.item(i).category;
				
				sHtmlStr = sHtmlStr + '<td><a href="" onclick="showDetail(\'' + id + '\')">' + title + '</a></td><td>' + category + '</td></tr>';
			}
			
			infotable.innerHTML = sHtmlStr;
			//Open the View page to display the data
			$.mobile.changePage("#dataView", "slide", false, true);
		} 
	} else {
		alert("No records match selection criteria.");
	}
	console.log("Leaving openView");
}

function onQueryFailure(tx, err) {
	console.log("Entering onQueryFailure");
	var msgText;
	if (err) {
		msgText = "Query: " + err;
	} else {
		msgText = "Query: Unknown error";
	}
	console.error(msgText);
	alert(msgText);
	console.log("Leaving onQueryFailure");
}

function deleteRecord(tx) {
	console.log("Entering deteleRecord");
	var sqlStr = 'DELETE FROM infos WHERE id = "' + rmid + '"';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [], onSqlSuccess, onSqlError);

}

function removeOrder(pid) {
	console.log("Entering removeOrder pid===" + pid);
	rmid = pid;
	Db.transaction(deleteRecord, onTxError, onRemoveSuccess);
}

function onRemoveSuccess() {
	console.log("Entering onRemoveSuccess");
	window.open('listinfo.html', '_blank');
}

function showOneInfo(id) {
	console.log("Entering showOneInfo");
	var sqlStr = "SELECT * FROM infos WHERE id = '" + id +"'";

	console.log("SQL: " + sqlStr);
	Db.transaction(function(tx) {
		tx.executeSql(sqlStr, [], onQueryOneSuccess, onQueryFailure);
	}, onTxError, onTxSuccess);
	console.log("Leaving openView");
}

function onQueryOneSuccess(tx, results) {
	console.log("Entering onQueryOneSuccess");

	if (results.rows) {
		console.log("Rows: " + results.rows);
		var htmlStr = "";
		var len = results.rows.length;
		console.log("###QueryOne-len: " + len);
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				var id = results.rows.item(i).id;
				var title = results.rows.item(i).title;
				var category = results.rows.item(i).category;
				var type = results.rows.item(i).type;
				var description = results.rows.item(i).description;
				var date = results.rows.item(i).date;
				htmlStr += '<b>Title:</b> ' + title + '<br>';
				htmlStr += '<hr />';
				htmlStr += '<b>Category:</b> ' + category + '<br>';
				htmlStr += '<hr />';
				htmlStr += '<b>Type:</b> ' + type + '<br>';
				htmlStr += '<hr />';
				htmlStr += '<b>Description:</b> ' + description + '<br>';
				htmlStr += '<hr />';
				htmlStr += '<b>Date:</b> ' + date + '<br>';
				htmlStr += '<hr />';
			}

			$("#infoDetailDiv").html(htmlStr);
		}
	} else {
		alert("No records match selection criteria.");
	}
	console.log("Leaving openView");
}
