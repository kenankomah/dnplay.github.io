let eigenvalues = [129.557,103.13,14.222,10.433,9.471,7.778,5.523,5.325,4.183,3.321,2.637,2.246,2.21,1.894,1.842,1.758,1.7,1.605,1.58,1.564,1.557,1.529,1.519,1.452,1.434];

function UpdateOutputText(text) {
	let outputTextBox = document.getElementById("outputtext");
	outputTextBox.value = text;
}

function Scale() {
	let inputTextBox = document.getElementById("inputtext");
	let lines = inputTextBox.value.split("\n");

	// First see many values are in the first line
	let numVals = lines[0].split(",").length;

	// If less than two vals, not a valid input
	if (numVals < 2) {
		UpdateOutputText("Error: Expected comma seperated values");
		return;
	}

	let outputStr = "";

	for (let i = 0; i < lines.length; ++i) {
		if (lines[i].length == 0) {
			continue;
		}

		let vals = lines[i].split(",");

		// Make sure every line has the same number of vals
		if (vals.length != numVals) {
			UpdateOutputText("Error: Too many values on line " + (i + 1));
			return;
		}

		let newStr = vals[0];

		for (let j = 1; j < numVals; ++j) {
			let val = parseFloat(vals[j]);

			// If not a number, there must be an error
			if (isNaN(val)) {
				UpdateOutputText("Error: Invalid number on line " + (i + 1));
				return;
			}

			let scaled = val * Math.sqrt(eigenvalues[j-1]);
			newStr += "," + Number(scaled.toPrecision(8));
		}

		outputStr += newStr + "\n";
	}

	UpdateOutputText(outputStr);
}

function Average() {
	let inputTextBox = document.getElementById("inputtext");
	let lines = inputTextBox.value.split("\n");

	// First see many values are in the first line
	let numVals = lines[0].split(",").length;

	// If less than two vals, not a valid input
	if (numVals < 2) {
		UpdateOutputText("Error: Expected comma seperated values");
		return;
	}

	let sum = {};
	let num = {};

	for (let i = 0; i < lines.length; ++i) {
		if (lines[i].length == 0) {
			continue;
		}

		let vals = lines[i].split(",");

		// Make sure every line has the same number of vals
		if (vals.length != numVals) {
			UpdateOutputText("Error: Too many values on line " + (i + 1));
			return;
		}

		let labels = vals[0].split(":");

		for (let i = 0; i < labels.length - 1; ++i) {
			let populationName = labels[i];
			if (populationName in num) {
				num[populationName] += 1;
			} else {
				num[populationName] = 1;
				sum[populationName] = Array(numVals - 1).fill(0.0);
			}
		}

		for (let j = 1; j < numVals; ++j) {
			let val = parseFloat(vals[j]);

			// If not a number, there must be an error
			if (isNaN(val)) {
				UpdateOutputText("Error: Invalid number on line " + (i + 1));
				return;
			}

			for (let i = 0; i < labels.length - 1; ++i) {
				sum[labels[i]][j-1] += val;
			}
		}
	}

	let outputStr = "";

	for (let x in sum) {
		outputStr += x;
		for (let y in sum[x]) {
			let average = sum[x][y] / num[x];
			outputStr += "," + Number(average.toPrecision(8));
		}
		outputStr += "\n";
	}

	UpdateOutputText(outputStr);
}

function Copy() {
	let outputTextBox = document.getElementById("outputtext");
	outputTextBox.select();
	outputTextBox.setSelectionRange(0, outputTextBox.value.length);
	navigator.clipboard.writeText(outputTextBox.value);
}

function Clear() {
	document.getElementById("inputtext").value = "";
	document.getElementById("outputtext").value = "";
}
